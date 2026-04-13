package com.example.ticketingsystem.service.impl;

import com.example.ticketingsystem.component.EntityMapper;
import com.example.ticketingsystem.component.MessageUtil;
import com.example.ticketingsystem.dto.response.UserResponse;
import com.example.ticketingsystem.exception.InvalidOperationException;
import com.example.ticketingsystem.exception.ResourceNotFoundException;
import com.example.ticketingsystem.model.User;
import com.example.ticketingsystem.model.enums.Role;
import com.example.ticketingsystem.repository.TicketRepository;
import com.example.ticketingsystem.repository.UserRepository;
import com.example.ticketingsystem.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;
    private final MessageUtil messageUtil;

    @Value("${ticketing.agent.max-workload}")
    private int maxAgentWorkload;

    // ── Public-facing query methods ──────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        return EntityMapper.toUserResponse(getUserEntityById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserByEmail(String email) {
        return EntityMapper.toUserResponse(getUserEntityByEmail(email));
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(EntityMapper::toUserResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getUsersByRole(Role role) {
        return userRepository.findByRole(role).stream()
                .map(EntityMapper::toUserResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteUser(Long id, String currentUserEmail) {
        User user      = getUserEntityById(id);
        User current   = getUserEntityByEmail(currentUserEmail);

        if (user.getId().equals(current.getId())) {
            throw new InvalidOperationException(messageUtil.get("error.user.cannot.delete.self"));
        }

        userRepository.delete(user);
        log.info("User {} deleted by {}", id, currentUserEmail);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String email) {
        return getUserByEmail(email);
    }

    // ── Internal entity-returning helpers ────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public User getUserEntityById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        messageUtil.get("error.user.not.found", id)));
    }

    @Override
    @Transactional(readOnly = true)
    public User getUserEntityByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        messageUtil.get("error.user.email.not.found", email)));
    }

    @Override
    @Transactional(readOnly = true)
    public void validateUserIsAgent(Long userId) {
        User user = getUserEntityById(userId);
        if (user.getRole() != Role.SUPPORT_AGENT) {
            throw new InvalidOperationException(messageUtil.get("error.user.not.agent"));
        }
    }

    // ── Agent workload / assignment helpers ──────────────────────────────────

    /**
     * Finds the best available agent:
     *  1. Must be a SUPPORT_AGENT.
     *  2. Must have active-ticket count strictly below max-workload.
     *  3. Among eligible agents, picks the one with the lowest active count
     *     (tie-break: lowest ID for deterministic selection).
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<User> findBestAvailableAgent() {
        List<User> agents = userRepository.findByRole(Role.SUPPORT_AGENT);

        if (agents.isEmpty()) {
            log.warn("No support agents registered in the system.");
            return Optional.empty();
        }

        return agents.stream()
                .filter(agent -> isAgentBelowMaxWorkload(agent.getId()))
                .min(Comparator
                        .comparingLong((User a) -> ticketRepository.countActiveTicketsByAgent(a.getId()))
                        .thenComparingLong(User::getId));
    }

    @Override
    @Transactional(readOnly = true)
    public long getActiveTicketCountForAgent(Long agentId) {
        return ticketRepository.countActiveTicketsByAgent(agentId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isAgentBelowMaxWorkload(Long agentId) {
        long activeCount = ticketRepository.countActiveTicketsByAgent(agentId);
        boolean below = activeCount < maxAgentWorkload;
        log.debug("Agent {} active tickets: {}/{} — below max: {}", agentId, activeCount, maxAgentWorkload, below);
        return below;
    }
}