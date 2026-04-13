package com.example.ticketingsystem.service.impl;

import com.example.ticketingsystem.component.EntityMapper;
import com.example.ticketingsystem.component.MessageUtil;
import com.example.ticketingsystem.dto.request.AssignTicketRequest;
import com.example.ticketingsystem.dto.request.CreateTicketRequest;
import com.example.ticketingsystem.dto.request.UpdateTicketRequest;
import com.example.ticketingsystem.dto.response.TicketResponse;
import com.example.ticketingsystem.exception.AccessDeniedException;
import com.example.ticketingsystem.exception.InvalidOperationException;
import com.example.ticketingsystem.exception.NoAgentAvailableException;
import com.example.ticketingsystem.exception.ResourceNotFoundException;
import com.example.ticketingsystem.model.Category;
import com.example.ticketingsystem.model.Ticket;
import com.example.ticketingsystem.model.User;
import com.example.ticketingsystem.model.enums.Role;
import com.example.ticketingsystem.model.enums.TicketStatus;
import com.example.ticketingsystem.repository.TicketRepository;
import com.example.ticketingsystem.service.CategoryService;
import com.example.ticketingsystem.service.TicketService;
import com.example.ticketingsystem.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final CategoryService categoryService;
    private final UserService userService;
//    private final EmailService emailService;
    private final MessageUtil messageUtil;

    // ─── Create ──────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public TicketResponse createTicket(CreateTicketRequest request, String currentUserEmail) {
        User creator  = userService.getUserEntityByEmail(currentUserEmail);
        Category category = categoryService.findCategoryById(request.getCategoryId());

        validatePriority(request.getPriority());

        Ticket ticket = Ticket.builder()
                .title(request.getTitle().trim())
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .priority(request.getPriority())
                .status(TicketStatus.PENDING)
                .createdDate(LocalDateTime.now())
                .category(category)
                .createdBy(creator)
                .build();

        ticketRepository.save(ticket);

        // Attempt auto-assignment; set PENDING if no agent is available
        ticket = attemptAutoAssign(ticket);
//
        log.info("Ticket {} created by {} — status: {}", ticket.getId(), currentUserEmail, ticket.getStatus());
////        emailService.sendTicketCreatedNotification(ticket);
        return EntityMapper.toTicketResponse(ticket);
    }

    // ─── Read ─────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public TicketResponse getTicketById(Long id, String currentUserEmail) {
        Ticket ticket = findTicketById(id);
        User currentUser = userService.getUserEntityByEmail(currentUserEmail);

        enforceReadAccess(ticket, currentUser);
        return EntityMapper.toTicketResponse(ticket);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketResponse> getAllTickets() {
        return ticketRepository.findAll().stream()
                .map(EntityMapper::toTicketResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketResponse> getTicketsByCurrentUser(String currentUserEmail) {
        User user = userService.getUserEntityByEmail(currentUserEmail);

        return ticketRepository.findByCreatedById(user.getId()).stream()
                .map(EntityMapper::toTicketResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketResponse> getAssignedTickets(String currentUserEmail) {
        User user = userService.getUserEntityByEmail(currentUserEmail);

        userService.validateUserIsAgent(user.getId());
        return ticketRepository.findByAssignedAgentId(user.getId()).stream()
                .map(EntityMapper::toTicketResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketResponse> getTicketsByAgent(Long agentId) {
        // Delegates role validation to UserService
        userService.validateUserIsAgent(agentId);
        return ticketRepository.findByAssignedAgentId(agentId).stream()
                .map(EntityMapper::toTicketResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketResponse> getTicketsByStatus(TicketStatus status) {
        return ticketRepository.findByStatus(status).stream()
                .map(EntityMapper::toTicketResponse)
                .collect(Collectors.toList());
    }

    // ─── Update ──────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public TicketResponse updateTicket(Long id, UpdateTicketRequest request, String currentUserEmail) {
        Ticket ticket      = findTicketById(id);
        User   currentUser = userService.getUserEntityByEmail(currentUserEmail);

        if (ticket.getStatus() == TicketStatus.CLOSED) {
            throw new InvalidOperationException(messageUtil.get("error.ticket.already.closed"));
        }

        // Users may only update their own tickets, except admin
        if ((currentUser.getRole() == Role.CLIENT || currentUser.getRole() == Role.SUPPORT_AGENT)
                && !ticket.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException(messageUtil.get("error.ticket.access.denied"));
        }

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            ticket.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null) {
            ticket.setDescription(request.getDescription().trim());
        }
        if (request.getPriority() != null) {
            validatePriority(request.getPriority());
            ticket.setPriority(request.getPriority());
        }
        if (request.getCategoryId() != null) {
            ticket.setCategory(categoryService.findCategoryById(request.getCategoryId()));
        }
        if (request.getStatus() != null) {
            validateStatusTransition(ticket.getStatus(), request.getStatus());
            if (request.getStatus() == TicketStatus.RESOLVED) {
                ticket.setResolvedDate(LocalDateTime.now());
            }
            ticket.setStatus(request.getStatus());
        }

        ticketRepository.save(ticket);
//        emailService.sendTicketUpdatedNotification(ticket);
        log.info("Ticket {} updated by {}", id, currentUserEmail);
        return EntityMapper.toTicketResponse(ticket);
    }

    // ─── Assignment ──────────────────────────────────────────────────────────

    @Override
    @Transactional
    public TicketResponse assignTicket(Long ticketId, AssignTicketRequest request, String currentUserEmail) {
        Ticket ticket = findTicketById(ticketId);

        if (ticket.getStatus() == TicketStatus.CLOSED) {
            throw new InvalidOperationException(messageUtil.get("error.ticket.already.closed"));
        }

        // Delegate agent existence + role validation to UserService
        userService.validateUserIsAgent(request.getAgentId());

        // Also verify the agent is not over the workload cap
        if (!userService.isAgentBelowMaxWorkload(request.getAgentId())) {
            long active = userService.getActiveTicketCountForAgent(request.getAgentId());
            throw new InvalidOperationException(
                    messageUtil.get("error.ticket.agent.workload.exceeded", active));
        }

        User agent = userService.getUserEntityById(request.getAgentId());

        ticket.setAssignedAgent(agent);
        ticketRepository.save(ticket);

//        emailService.sendTicketAssignedNotification(ticket);
        log.info("Ticket {} manually assigned to agent {} by {}", ticketId, agent.getId(), currentUserEmail);
        return EntityMapper.toTicketResponse(ticket);
    }

    @Override
    @Transactional
    public TicketResponse autoAssignTicket(Long ticketId, String currentUserEmail) {
        Ticket ticket = findTicketById(ticketId);

        if (ticket.getStatus() == TicketStatus.CLOSED) {
            throw new InvalidOperationException(messageUtil.get("error.ticket.already.closed"));
        }

        ticket = attemptAutoAssign(ticket);

        if (ticket.getStatus() == TicketStatus.PENDING) {
            // Even after an admin-triggered auto-assign attempt, no agent is free
            log.warn("Admin auto-assign for ticket {} failed — all agents at capacity", ticketId);
            throw new NoAgentAvailableException(messageUtil.get("error.ticket.no.agent.available"));
        } else {
//            emailService.sendTicketAssignedNotification(ticket);
            log.info("Ticket {} auto-assigned by {}", ticketId, currentUserEmail);
        }

        return EntityMapper.toTicketResponse(ticket);
    }

    /**
     * CLIENT-facing reassignment request for a PENDING ticket.
     * Behaviour:
     *  - If an agent with capacity is found   → assigns, sets IN_PROGRESS, returns updated ticket.
     *  - If no agent is available             → throws NoAgentAvailableException with the
     *                                           "please try again after 3 hours" message.
     * Only the ticket owner (CLIENT) or an ADMIN may call this.
     */
    @Override
    @Transactional
    public TicketResponse requestReassignment(Long ticketId, String currentUserEmail) {
        Ticket ticket      = findTicketById(ticketId);
        User   currentUser = userService.getUserEntityByEmail(currentUserEmail);

        // Only the creator or an admin may request reassignment
        if (currentUser.getRole() == Role.CLIENT
                && !ticket.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException(messageUtil.get("error.ticket.access.denied"));
        }

        // Ticket must actually be PENDING to be reassigned through this path
        if (ticket.getStatus() != TicketStatus.PENDING) {
            throw new InvalidOperationException(messageUtil.get("error.ticket.not.pending"));
        }

        Optional<User> bestAgent = userService.findBestAvailableAgent();

        if (bestAgent.isEmpty()) {
            // No capacity — inform the client to retry after 3 hours
            throw new NoAgentAvailableException(messageUtil.get("error.ticket.agents.busy.retry"));
        }

        ticket.setAssignedAgent(bestAgent.get());
        ticket.setStatus(TicketStatus.OPEN);
        ticketRepository.save(ticket);

//        emailService.sendTicketAssignedNotification(ticket);
        log.info("Ticket {} reassigned to agent {} via client request by {}",
                ticketId, bestAgent.get().getId(), currentUserEmail);
        return EntityMapper.toTicketResponse(ticket);
    }

    // ─── Status update ───────────────────────────────────────────────────────

    @Override
    @Transactional
    public TicketResponse updateTicketStatus(Long id, TicketStatus status, String currentUserEmail) {
        Ticket ticket = findTicketById(id);
        User currentUser = userService.getUserEntityByEmail(currentUserEmail);

        if (ticket.getStatus() == TicketStatus.CLOSED) {
            throw new InvalidOperationException(messageUtil.get("error.ticket.already.closed"));
        }

        // Agents may only change their own assigned tickets. Agents may also not close assigned tickets.
        if (currentUser.getRole() == Role.SUPPORT_AGENT) {
            if (!ticket.getAssignedAgent().getId().equals(currentUser.getId())) {
                throw new AccessDeniedException(messageUtil.get("error.ticket.access.denied"));
            }
            if (status == TicketStatus.CLOSED) {
                throw new AccessDeniedException(messageUtil.get("error.auth.access.denied"));
            }
        }

        // Clients and agents may only close or open their created resolved tickets
        else if (currentUser.getRole() == Role.CLIENT || currentUser.getRole() == Role.SUPPORT_AGENT) {
            if (!ticket.getCreatedBy().getId().equals(currentUser.getId())) {
                throw new AccessDeniedException(messageUtil.get("error.ticket.access.denied"));
            }
            if (status != TicketStatus.CLOSED && status != TicketStatus.OPEN) {
                throw new AccessDeniedException(messageUtil.get("error.auth.access.denied"));
            }
        }

        validateStatusTransition(ticket.getStatus(), status);

        if (status == TicketStatus.RESOLVED) {
            ticket.setResolvedDate(LocalDateTime.now());
        }

        ticket.setStatus(status);
        ticketRepository.save(ticket);
//        emailService.sendTicketStatusUpdatedNotification(ticket);
        log.info("Ticket {} status updated to {} by {}", id, status, currentUserEmail);
        return EntityMapper.toTicketResponse(ticket);
    }

    // ─── Delete ──────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void deleteTicket(Long id, String currentUserEmail) {
        Ticket ticket = findTicketById(id);

        if (ticket.getStatus() != TicketStatus.CLOSED) {
            throw new InvalidOperationException(messageUtil.get("error.ticket.not.closed"));
        }

        ticketRepository.delete(ticket);
        log.info("Ticket {} deleted by {}", id, currentUserEmail);
    }

    // ─── Private helpers ─────────────────────────────────────────────────────

    /**
     * Attempts to auto-assign the given ticket to the best available agent.
     * If no agent has capacity the ticket is left/set to PENDING and a warning is logged.
     * In both cases the (possibly updated) ticket is persisted and returned.
     */
    private Ticket attemptAutoAssign(Ticket ticket) {
        Optional<User> bestAgent = userService.findBestAvailableAgent();

        if (bestAgent.isPresent()) {
            ticket.setAssignedAgent(bestAgent.get());
            ticket.setStatus(TicketStatus.OPEN);
            log.info("Ticket {} auto-assigned to agent {}", ticket.getId(), bestAgent.get().getId());
        } else {
            ticket.setStatus(TicketStatus.PENDING);
            log.warn("Ticket {} set to PENDING — all agents at or above max workload", ticket.getId());
        }

        return ticketRepository.save(ticket);
    }


    /** Enforces role-based read access: clients see own tickets; agents see own and assigned ones; admins see all. */
    private void enforceReadAccess(Ticket ticket, User currentUser) {
        if (currentUser.getRole() == Role.CLIENT
                && !ticket.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException(messageUtil.get("error.ticket.access.denied"));
        }
        if (currentUser.getRole() == Role.SUPPORT_AGENT
                && ticket.getAssignedAgent() != null
                && (!ticket.getAssignedAgent().getId().equals(currentUser.getId()) && !ticket.getCreatedBy().getId().equals(currentUser.getId()))) {
            throw new AccessDeniedException(messageUtil.get("error.ticket.access.denied"));
        }
    }

    private void validatePriority(int priority) {
        if (priority < 1 || priority > 4) {
            throw new InvalidOperationException(messageUtil.get("error.ticket.invalid.priority"));
        }
    }

    private void validateStatusTransition(TicketStatus from, TicketStatus to) {
        boolean valid = switch (from) {
            case PENDING, OPEN -> to == TicketStatus.IN_PROGRESS || to == TicketStatus.CLOSED;
            case IN_PROGRESS -> to == TicketStatus.RESOLVED    || to == TicketStatus.CLOSED;
            case RESOLVED    -> to == TicketStatus.CLOSED      || to == TicketStatus.OPEN  ||  to == TicketStatus.IN_PROGRESS;
            case CLOSED      -> false;
        };
        if (!valid) {
            throw new InvalidOperationException(
                    messageUtil.get("error.ticket.invalid.status.transition", from, to));
        }
    }

    private Ticket findTicketById(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        messageUtil.get("error.ticket.not.found", id)));
    }
}
