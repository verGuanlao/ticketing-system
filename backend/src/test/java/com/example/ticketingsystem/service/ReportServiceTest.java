package com.example.ticketingsystem.service;

import com.example.ticketingsystem.dto.response.AgentPerformanceResponse;
import com.example.ticketingsystem.dto.response.ReportResponse;
import com.example.ticketingsystem.dto.response.UserResponse;
import com.example.ticketingsystem.model.Category;
import com.example.ticketingsystem.model.Ticket;
import com.example.ticketingsystem.model.User;
import com.example.ticketingsystem.model.enums.Role;
import com.example.ticketingsystem.model.enums.Status;
import com.example.ticketingsystem.model.enums.TicketStatus;
import com.example.ticketingsystem.exception.AccessDeniedException;
import com.example.ticketingsystem.exception.InvalidOperationException;
import com.example.ticketingsystem.repository.TicketRepository;
import com.example.ticketingsystem.service.impl.ReportServiceImpl;
import com.example.ticketingsystem.component.MessageUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ReportService Tests")
class ReportServiceTest {

    @Mock private TicketRepository ticketRepository;
    @Mock private UserService userService;
    @Mock private MessageUtil messageUtil;

    @InjectMocks private ReportServiceImpl reportService;

    private User agentUser;
    private User adminUser;
    private User anotherAgent;
    private Category category;

    private UserResponse agentResponse;
    private UserResponse adminResponse;
    private UserResponse anotherAgentResponse;

    @BeforeEach
    void setUp() {
        agentUser = User.builder().id(1L).firstName("Bob").lastName("Jones")
                .email("bob@example.com").role(Role.SUPPORT_AGENT).status(Status.ACTIVE).build();

        adminUser = User.builder().id(2L).firstName("Carol").lastName("Admin")
                .email("carol@example.com").role(Role.ADMIN).status(Status.ACTIVE).build();

        anotherAgent = User.builder().id(3L).firstName("Dave").lastName("Smith")
                .email("dave@example.com").role(Role.SUPPORT_AGENT).status(Status.ACTIVE).build();

        category = Category.builder().id(1L).name("Technical").build();

        agentResponse        = toUserResponse(agentUser);
        adminResponse        = toUserResponse(adminUser);
        anotherAgentResponse = toUserResponse(anotherAgent);
    }

    // ─── getOverallReport ─────────────────────────────────────────────────────

    @Test
    @DisplayName("getOverallReport - counts all statuses correctly including PENDING")
    void getOverallReport_countsAllStatuses() {
        List<Ticket> tickets = List.of(
                ticket(1L, TicketStatus.PENDING,     1),
                ticket(2L, TicketStatus.OPEN,        2),
                ticket(3L, TicketStatus.IN_PROGRESS, 3),
                ticket(4L, TicketStatus.RESOLVED,    4),
                ticket(5L, TicketStatus.CLOSED,      1)
        );

        when(ticketRepository.findAll()).thenReturn(tickets);
        when(ticketRepository.getAverageResolutionTimeInSeconds()).thenReturn(3600.0); // 1 hour
        when(userService.getUsersByRole(Role.SUPPORT_AGENT)).thenReturn(List.of());

        ReportResponse report = reportService.getOverallReport();

        assertThat(report.getTotalTickets()).isEqualTo(5);
        assertThat(report.getPendingTickets()).isEqualTo(1);
        assertThat(report.getOpenTickets()).isEqualTo(1);
        assertThat(report.getInProgressTickets()).isEqualTo(1);
        assertThat(report.getResolvedTickets()).isEqualTo(1);
        assertThat(report.getClosedTickets()).isEqualTo(1);
    }

    @Test
    @DisplayName("getOverallReport - converts average resolution time to hours")
    void getOverallReport_convertsResolutionTimeToHours() {
        when(ticketRepository.findAll()).thenReturn(List.of());
        when(ticketRepository.getAverageResolutionTimeInSeconds()).thenReturn(7200.0); // 2 hours
        when(userService.getUsersByRole(Role.SUPPORT_AGENT)).thenReturn(List.of());

        ReportResponse report = reportService.getOverallReport();

        assertThat(report.getAverageResolutionTimeHours()).isEqualTo(2.0);
    }

    @Test
    @DisplayName("getOverallReport - null resolution time when no tickets are resolved")
    void getOverallReport_nullResolutionTime_whenNoResolvedTickets() {
        when(ticketRepository.findAll()).thenReturn(List.of());
        when(ticketRepository.getAverageResolutionTimeInSeconds()).thenReturn(null);
        when(userService.getUsersByRole(Role.SUPPORT_AGENT)).thenReturn(List.of());

        ReportResponse report = reportService.getOverallReport();

        assertThat(report.getAverageResolutionTimeHours()).isNull();
    }

    @Test
    @DisplayName("getOverallReport - groups tickets by category name")
    void getOverallReport_groupsByCategory() {
        Category billing = Category.builder().id(2L).name("Billing").build();
        List<Ticket> tickets = List.of(
                ticketWithCategory(1L, TicketStatus.OPEN, category),   // Technical
                ticketWithCategory(2L, TicketStatus.OPEN, category),   // Technical
                ticketWithCategory(3L, TicketStatus.OPEN, billing)     // Billing
        );

        when(ticketRepository.findAll()).thenReturn(tickets);
        when(ticketRepository.getAverageResolutionTimeInSeconds()).thenReturn(null);
        when(userService.getUsersByRole(Role.SUPPORT_AGENT)).thenReturn(List.of());

        ReportResponse report = reportService.getOverallReport();

        assertThat(report.getTicketsByCategory()).containsEntry("Technical", 2L);
        assertThat(report.getTicketsByCategory()).containsEntry("Billing", 1L);
    }

    @Test
    @DisplayName("getOverallReport - groups tickets by priority label")
    void getOverallReport_groupsByPriority() {
        List<Ticket> tickets = List.of(
                ticket(1L, TicketStatus.OPEN, 1), // LOW
                ticket(2L, TicketStatus.OPEN, 1), // LOW
                ticket(3L, TicketStatus.OPEN, 4)  // CRITICAL
        );

        when(ticketRepository.findAll()).thenReturn(tickets);
        when(ticketRepository.getAverageResolutionTimeInSeconds()).thenReturn(null);
        when(userService.getUsersByRole(Role.SUPPORT_AGENT)).thenReturn(List.of());

        ReportResponse report = reportService.getOverallReport();

        assertThat(report.getTicketsByPriority()).containsEntry("LOW", 2L);
        assertThat(report.getTicketsByPriority()).containsEntry("CRITICAL", 1L);
    }

    @Test
    @DisplayName("getOverallReport - includes agent performance map keyed by email")
    void getOverallReport_includesAgentPerformance() {
        when(ticketRepository.findAll()).thenReturn(List.of());
        when(ticketRepository.getAverageResolutionTimeInSeconds()).thenReturn(null);
        when(userService.getUsersByRole(Role.SUPPORT_AGENT)).thenReturn(List.of(agentResponse));
        when(userService.getUserEntityById(1L)).thenReturn(agentUser);
        when(ticketRepository.findByAssignedAgentId(1L)).thenReturn(List.of());
        when(ticketRepository.countActiveTicketsByAgent(1L)).thenReturn(0L);

        ReportResponse report = reportService.getOverallReport();

        assertThat(report.getAgentPerformance()).containsKey("bob@example.com");
    }

    @Test
    @DisplayName("getOverallReport - returns empty report when there are no tickets")
    void getOverallReport_emptyWhenNoTickets() {
        when(ticketRepository.findAll()).thenReturn(List.of());
        when(ticketRepository.getAverageResolutionTimeInSeconds()).thenReturn(null);
        when(userService.getUsersByRole(Role.SUPPORT_AGENT)).thenReturn(List.of());

        ReportResponse report = reportService.getOverallReport();

        assertThat(report.getTotalTickets()).isZero();
        assertThat(report.getPendingTickets()).isZero();
        assertThat(report.getAgentPerformance()).isEmpty();
    }

    // ─── getAgentPerformanceReport ────────────────────────────────────────────

    @Test
    @DisplayName("getAgentPerformanceReport - returns one entry per agent")
    void getAgentPerformanceReport_returnsOneEntryPerAgent() {
        when(userService.getUsersByRole(Role.SUPPORT_AGENT))
                .thenReturn(List.of(agentResponse, anotherAgentResponse));
        when(userService.getUserEntityById(1L)).thenReturn(agentUser);
        when(userService.getUserEntityById(3L)).thenReturn(anotherAgent);
        when(ticketRepository.findByAssignedAgentId(1L)).thenReturn(List.of());
        when(ticketRepository.findByAssignedAgentId(3L)).thenReturn(List.of());
        when(ticketRepository.countActiveTicketsByAgent(1L)).thenReturn(0L);
        when(ticketRepository.countActiveTicketsByAgent(3L)).thenReturn(0L);

        List<AgentPerformanceResponse> result = reportService.getAgentPerformanceReport();

        assertThat(result).hasSize(2);
        assertThat(result).extracting(r -> r.getAgent().getEmail())
                .containsExactly("bob@example.com", "dave@example.com");
    }

    @Test
    @DisplayName("getAgentPerformanceReport - returns empty list when no agents exist")
    void getAgentPerformanceReport_returnsEmpty_whenNoAgents() {
        when(userService.getUsersByRole(Role.SUPPORT_AGENT)).thenReturn(List.of());

        List<AgentPerformanceResponse> result = reportService.getAgentPerformanceReport();

        assertThat(result).isEmpty();
    }

    // ─── getAgentPerformanceById ──────────────────────────────────────────────

    @Test
    @DisplayName("getAgentPerformanceById - admin can view any agent's report")
    void getAgentPerformanceById_admin_success() {
        when(userService.getUserEntityByEmail("carol@example.com")).thenReturn(adminUser);
        when(userService.getUserEntityById(1L)).thenReturn(agentUser);
        doNothing().when(userService).validateUserIsAgent(1L);
        when(ticketRepository.findByAssignedAgentId(1L)).thenReturn(List.of());
        when(ticketRepository.countActiveTicketsByAgent(1L)).thenReturn(2L);

        AgentPerformanceResponse result = reportService.getAgentPerformanceById(1L, "carol@example.com");

        assertThat(result).isNotNull();
        assertThat(result.getAgent().getEmail()).isEqualTo("bob@example.com");
        assertThat(result.getWorkload()).isEqualTo(2L);
    }

    @Test
    @DisplayName("getAgentPerformanceById - agent can view their own report")
    void getAgentPerformanceById_agent_canViewOwnReport() {
        when(userService.getUserEntityByEmail("bob@example.com")).thenReturn(agentUser);
        when(userService.getUserEntityById(1L)).thenReturn(agentUser);
        doNothing().when(userService).validateUserIsAgent(1L);
        when(ticketRepository.findByAssignedAgentId(1L)).thenReturn(List.of());
        when(ticketRepository.countActiveTicketsByAgent(1L)).thenReturn(3L);

        AgentPerformanceResponse result = reportService.getAgentPerformanceById(1L, "bob@example.com");

        assertThat(result).isNotNull();
        assertThat(result.getWorkload()).isEqualTo(3L);
    }

    @Test
    @DisplayName("getAgentPerformanceById - agent cannot view another agent's report")
    void getAgentPerformanceById_agent_throwsAccessDenied_forOtherAgent() {
        doNothing().when(userService).validateUserIsAgent(1L);
        when(userService.getUserEntityByEmail("dave@example.com")).thenReturn(anotherAgent);
        when(userService.getUserEntityById(1L)).thenReturn(agentUser);
        when(messageUtil.get("error.report.access.denied")).thenReturn("Access denied.");

        assertThatThrownBy(() -> reportService.getAgentPerformanceById(1L, "dave@example.com"))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("getAgentPerformanceById - throws InvalidOperationException when user is not an agent")
    void getAgentPerformanceById_throwsInvalidOp_whenNotAgent() {
        doThrow(new InvalidOperationException("Not an agent."))
                .when(userService).validateUserIsAgent(2L);

        assertThatThrownBy(() -> reportService.getAgentPerformanceById(2L, "carol@example.com"))
                .isInstanceOf(InvalidOperationException.class);
    }

    // ─── buildAgentPerformance (via getAgentPerformanceById) ─────────────────

    @Test
    @DisplayName("buildAgentPerformance - correctly counts active, resolved, and closed tickets")
    void buildAgentPerformance_correctlyCountsTicketsByStatus() {
        LocalDateTime now = LocalDateTime.now();
        List<Ticket> assigned = List.of(
                ticketWithStatus(TicketStatus.PENDING),
                ticketWithStatus(TicketStatus.OPEN),
                ticketWithStatus(TicketStatus.IN_PROGRESS),
                ticketWithStatus(TicketStatus.RESOLVED),
                ticketWithStatus(TicketStatus.CLOSED)
        );

        doNothing().when(userService).validateUserIsAgent(1L);
        when(userService.getUserEntityByEmail("carol@example.com")).thenReturn(adminUser);
        when(userService.getUserEntityById(1L)).thenReturn(agentUser);
        when(ticketRepository.findByAssignedAgentId(1L)).thenReturn(assigned);
        when(ticketRepository.countActiveTicketsByAgent(1L)).thenReturn(3L);

        AgentPerformanceResponse result = reportService.getAgentPerformanceById(1L, "carol@example.com");

        assertThat(result.getTotalAssigned()).isEqualTo(5);
        assertThat(result.getActiveTickets()).isEqualTo(3);   // PENDING + OPEN + IN_PROGRESS
        assertThat(result.getResolvedTickets()).isEqualTo(1);
        assertThat(result.getClosedTickets()).isEqualTo(1);
        assertThat(result.getWorkload()).isEqualTo(3L);       // from countActiveTicketsByAgent
    }

    @Test
    @DisplayName("buildAgentPerformance - calculates average resolution time correctly")
    void buildAgentPerformance_calculatesAvgResolutionTime() {
        LocalDateTime created  = LocalDateTime.now().minusHours(4);
        LocalDateTime resolved = LocalDateTime.now();

        Ticket resolvedTicket = Ticket.builder()
                .id(1L).status(TicketStatus.RESOLVED).priority(2)
                .category(category).createdBy(adminUser).assignedAgent(agentUser)
                .createdDate(created).resolvedDate(resolved).build();

        doNothing().when(userService).validateUserIsAgent(1L);
        when(userService.getUserEntityByEmail("carol@example.com")).thenReturn(adminUser);
        when(userService.getUserEntityById(1L)).thenReturn(agentUser);
        when(ticketRepository.findByAssignedAgentId(1L)).thenReturn(List.of(resolvedTicket));
        when(ticketRepository.countActiveTicketsByAgent(1L)).thenReturn(0L);

        AgentPerformanceResponse result = reportService.getAgentPerformanceById(1L, "carol@example.com");

        assertThat(result.getAverageResolutionTimeHours()).isNotNull();
        assertThat(result.getAverageResolutionTimeHours()).isCloseTo(4.0, within(0.01));
    }

    @Test
    @DisplayName("buildAgentPerformance - null average resolution time when no resolved tickets")
    void buildAgentPerformance_nullAvgResolutionTime_whenNoResolvedTickets() {
        doNothing().when(userService).validateUserIsAgent(1L);
        when(userService.getUserEntityByEmail("carol@example.com")).thenReturn(adminUser);
        when(userService.getUserEntityById(1L)).thenReturn(agentUser);
        when(ticketRepository.findByAssignedAgentId(1L)).thenReturn(List.of());
        when(ticketRepository.countActiveTicketsByAgent(1L)).thenReturn(0L);

        AgentPerformanceResponse result = reportService.getAgentPerformanceById(1L, "carol@example.com");

        assertThat(result.getAverageResolutionTimeHours()).isNull();
    }

    @Test
    @DisplayName("buildAgentPerformance - workload reflects countActiveTicketsByAgent result")
    void buildAgentPerformance_workloadReflectsRepository() {
        doNothing().when(userService).validateUserIsAgent(1L);
        when(userService.getUserEntityByEmail("carol@example.com")).thenReturn(adminUser);
        when(userService.getUserEntityById(1L)).thenReturn(agentUser);
        when(ticketRepository.findByAssignedAgentId(1L)).thenReturn(List.of());
        when(ticketRepository.countActiveTicketsByAgent(1L)).thenReturn(7L);

        AgentPerformanceResponse result = reportService.getAgentPerformanceById(1L, "carol@example.com");

        assertThat(result.getWorkload()).isEqualTo(7L);
        verify(ticketRepository).countActiveTicketsByAgent(1L);
    }

    @Test
    @DisplayName("buildAgentPerformance - agent response contains correct agent details")
    void buildAgentPerformance_agentResponseContainsCorrectDetails() {
        doNothing().when(userService).validateUserIsAgent(1L);
        when(userService.getUserEntityByEmail("carol@example.com")).thenReturn(adminUser);
        when(userService.getUserEntityById(1L)).thenReturn(agentUser);
        when(ticketRepository.findByAssignedAgentId(1L)).thenReturn(List.of());
        when(ticketRepository.countActiveTicketsByAgent(1L)).thenReturn(0L);

        AgentPerformanceResponse result = reportService.getAgentPerformanceById(1L, "carol@example.com");

        assertThat(result.getAgent()).isNotNull();
        assertThat(result.getAgent().getId()).isEqualTo(1L);
        assertThat(result.getAgent().getEmail()).isEqualTo("bob@example.com");
        assertThat(result.getAgent().getRole()).isEqualTo(Role.SUPPORT_AGENT);
    }

    // ─── helpers ─────────────────────────────────────────────────────────────

    /** Builds a minimal ticket with the given status and priority, using the default category. */
    private Ticket ticket(Long id, TicketStatus status, int priority) {
        return Ticket.builder()
                .id(id).status(status).priority(priority)
                .category(category).createdBy(adminUser)
                .createdDate(LocalDateTime.now()).build();
    }

    /** Builds a ticket with a specific category (for category grouping tests). */
    private Ticket ticketWithCategory(Long id, TicketStatus status, Category cat) {
        return Ticket.builder()
                .id(id).status(status).priority(1)
                .category(cat).createdBy(adminUser)
                .createdDate(LocalDateTime.now()).build();
    }

    /** Builds a ticket with only a status set (for status-counting tests). */
    private Ticket ticketWithStatus(TicketStatus status) {
        return Ticket.builder()
                .id((long) (Math.random() * 1000)).status(status).priority(1)
                .category(category).createdBy(adminUser).assignedAgent(agentUser)
                .createdDate(LocalDateTime.now()).build();
    }

    /** Mirrors EntityMapper.toUserResponse for stubbing UserService.getUsersByRole. */
    private UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus())
                .fullName(user.getFirstName() + " " + user.getLastName())
                .build();
    }
}
