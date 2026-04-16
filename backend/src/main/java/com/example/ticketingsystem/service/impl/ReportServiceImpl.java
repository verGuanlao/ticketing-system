package com.example.ticketingsystem.service.impl;

import com.example.ticketingsystem.component.MessageUtil;
import com.example.ticketingsystem.dto.response.AgentPerformanceResponse;
import com.example.ticketingsystem.dto.response.ReportResponse;
import com.example.ticketingsystem.exception.AccessDeniedException;
import com.example.ticketingsystem.model.Ticket;
import com.example.ticketingsystem.model.User;
import com.example.ticketingsystem.model.enums.Priority;
import com.example.ticketingsystem.model.enums.Role;
import com.example.ticketingsystem.model.enums.TicketStatus;
import com.example.ticketingsystem.repository.TicketRepository;
import com.example.ticketingsystem.service.ReportService;
import com.example.ticketingsystem.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportServiceImpl implements ReportService {

    private final TicketRepository ticketRepository;
    private final UserService userService;
    private final MessageUtil messageUtil;

    @Override
    @Transactional(readOnly = true)
    public ReportResponse getOverallReport() {
        List<Ticket> allTickets = ticketRepository.findAll();

        long total      = allTickets.size();
        long pending    = allTickets.stream().filter(t -> t.getStatus() == TicketStatus.PENDING).count();
        long open       = allTickets.stream().filter(t -> t.getStatus() == TicketStatus.OPEN).count();
        long inProgress = allTickets.stream().filter(t -> t.getStatus() == TicketStatus.IN_PROGRESS).count();
        long resolved   = allTickets.stream().filter(t -> t.getStatus() == TicketStatus.RESOLVED).count();
        long closed     = allTickets.stream().filter(t -> t.getStatus() == TicketStatus.CLOSED).count();

        Double avgResolutionSeconds = ticketRepository.getAverageResolutionTimeInSeconds();
        Double avgResolutionHours   = (avgResolutionSeconds != null) ? avgResolutionSeconds / 3600.0 : null;

        Map<String, Long> byCategory = allTickets.stream()
                .collect(Collectors.groupingBy(t -> t.getCategory().getName(), Collectors.counting()));

        Map<String, Long> byPriority = allTickets.stream()
                .collect(Collectors.groupingBy(t -> {
                    try { return Priority.fromValue(t.getPriority()).name(); }
                    catch (IllegalArgumentException e) { return "UNKNOWN"; }
                }, Collectors.counting()));

        // Agent performance — delegate user lookup to UserService
        List<User> agents = userService.getUsersByRole(Role.SUPPORT_AGENT).stream()
                .map(ur -> userService.getUserEntityById(ur.getId()))
                .collect(Collectors.toList());

        Map<String, AgentPerformanceResponse> agentPerfMap = new LinkedHashMap<>();
        for (User agent : agents) {
            agentPerfMap.put(agent.getEmail(), buildAgentPerformance(agent));
        }

        return ReportResponse.builder()
                .totalTickets(total)
                .pendingTickets(pending)
                .openTickets(open)
                .inProgressTickets(inProgress)
                .resolvedTickets(resolved)
                .closedTickets(closed)
                .averageResolutionTimeHours(avgResolutionHours)
                .ticketsByCategory(byCategory)
                .ticketsByPriority(byPriority)
                .agentPerformance(agentPerfMap)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AgentPerformanceResponse> getAgentPerformanceReport() {
        return userService.getUsersByRole(Role.SUPPORT_AGENT).stream()
                .map(ur -> buildAgentPerformance(userService.getUserEntityById(ur.getId())))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AgentPerformanceResponse getAgentPerformanceById(Long agentId, String email) {
        // validateUserIsAgent throws InvalidOperationException if not an agent
        userService.validateUserIsAgent(agentId);
        User currentUser = userService.getUserEntityByEmail(email);
        User agent = userService.getUserEntityById(agentId);

        if (currentUser.getRole() == Role.SUPPORT_AGENT && !currentUser.getId().equals(agent.getId())) {
            throw new AccessDeniedException(messageUtil.get("error.report.access.denied"));
        }
        return buildAgentPerformance(agent);
    }

    // ─── helpers ─────────────────────────────────────────────────────────────

    private AgentPerformanceResponse buildAgentPerformance(User agent) {
        List<Ticket> assigned = ticketRepository.findByAssignedAgentId(agent.getId());

        long total    = assigned.size();
        long active   = assigned.stream()
                .filter(t -> t.getStatus() == TicketStatus.OPEN
                        || t.getStatus() == TicketStatus.IN_PROGRESS
                        || t.getStatus() == TicketStatus.PENDING)
                .count();
        long resolved = assigned.stream().filter(t -> t.getStatus() == TicketStatus.RESOLVED).count();
        long closed   = assigned.stream().filter(t -> t.getStatus() == TicketStatus.CLOSED).count();

        OptionalDouble avgSeconds = assigned.stream()
                .filter(t -> t.getResolvedDate() != null && t.getCreatedDate() != null)
                .mapToLong(t -> java.time.Duration.between(t.getCreatedDate(), t.getResolvedDate()).getSeconds())
                .average();

        Double avgHours = avgSeconds.isPresent() ? avgSeconds.getAsDouble() / 3600.0 : null;

        long agentWorkload = ticketRepository.countActiveTicketsByAgent(agent.getId());

        return AgentPerformanceResponse.builder()
                .agentId(agent.getId())
                .agentName(agent.getFullName())
                .totalAssigned(total)
                .activeTickets(active)
                .resolvedTickets(resolved)
                .closedTickets(closed)
                .averageResolutionTimeHours(avgHours)
                .workload(agentWorkload)
                .build();
    }
}
