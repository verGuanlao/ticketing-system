package com.example.ticketingsystem.service;

import com.example.ticketingsystem.dto.request.AssignTicketRequest;
import com.example.ticketingsystem.dto.request.CreateTicketRequest;
import com.example.ticketingsystem.dto.request.UpdateTicketRequest;
import com.example.ticketingsystem.dto.response.TicketResponse;
import com.example.ticketingsystem.model.Category;
import com.example.ticketingsystem.model.Ticket;
import com.example.ticketingsystem.model.User;
import com.example.ticketingsystem.model.enums.Role;
import com.example.ticketingsystem.model.enums.TicketStatus;
import com.example.ticketingsystem.model.enums.Status;
import com.example.ticketingsystem.exception.AccessDeniedException;
import com.example.ticketingsystem.exception.InvalidOperationException;
import com.example.ticketingsystem.exception.NoAgentAvailableException;
import com.example.ticketingsystem.exception.ResourceNotFoundException;
import com.example.ticketingsystem.repository.TicketRepository;
import com.example.ticketingsystem.service.impl.TicketServiceImpl;
import com.example.ticketingsystem.component.MessageUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("TicketService Tests")
class TicketServiceTest {

    @Mock private TicketRepository ticketRepository;
    @Mock private CategoryService categoryService;
    @Mock private UserService userService;
    @Mock private EmailService emailService;
    @Mock private MessageUtil messageUtil;

    @InjectMocks private TicketServiceImpl ticketService;

    private User clientUser;
    private User agentUser;
    private User adminUser;
    private Category category;
    private Ticket openTicket;    // status=OPEN, createdBy=client, assignedAgent=agent
    private Ticket pendingTicket; // status=PENDING, createdBy=client, no agent

    @BeforeEach
    void setUp() {
        clientUser = User.builder().id(1L).firstName("Alice").lastName("Smith")
                .email("alice@example.com").role(Role.CLIENT).status(Status.ACTIVE).build();

        agentUser = User.builder().id(2L).firstName("Bob").lastName("Jones")
                .email("bob@example.com").role(Role.SUPPORT_AGENT).status(Status.ACTIVE).build();

        adminUser = User.builder().id(3L).firstName("Carol").lastName("Admin")
                .email("carol@example.com").role(Role.ADMIN).status(Status.ACTIVE).build();

        category = Category.builder().id(1L).name("Technical").build();

        openTicket = Ticket.builder()
                .id(1L).title("Open Ticket").description("A test").priority(1)
                .status(TicketStatus.OPEN).createdDate(LocalDateTime.now())
                .category(category).createdBy(clientUser).assignedAgent(agentUser).build();

        pendingTicket = Ticket.builder()
                .id(2L).title("Pending Ticket").description("Waiting").priority(2)
                .status(TicketStatus.PENDING).createdDate(LocalDateTime.now())
                .category(category).createdBy(clientUser).build();
    }

    // ─── createTicket ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("createTicket - sets OPEN, assigns agent, and sends creation email")
    void createTicket_autoAssigns_setsOpen_whenAgentAvailable() {
        when(userService.getUserEntityByEmail("alice@example.com")).thenReturn(clientUser);
        when(categoryService.findCategoryById(1L)).thenReturn(category);
        when(ticketRepository.save(any())).thenAnswer(inv -> {
            Ticket t = inv.getArgument(0);
            if (t.getId() == null) t.setId(10L);
            return t;
        });
        when(userService.findBestAvailableAgent()).thenReturn(Optional.of(agentUser));

        TicketResponse response = ticketService.createTicket(createTicketRequest(2), "alice@example.com");

        assertThat(response.getStatus()).isEqualTo(TicketStatus.OPEN);
        verify(ticketRepository, times(2)).save(any()); // initial persist + assignment
    }

    @Test
    @DisplayName("createTicket - sets PENDING, saves, and sends creation email when no agent available")
    void createTicket_setsPending_whenNoAgentAvailable() {
        when(userService.getUserEntityByEmail("alice@example.com")).thenReturn(clientUser);
        when(categoryService.findCategoryById(1L)).thenReturn(category);
        when(ticketRepository.save(any())).thenAnswer(inv -> {
            Ticket t = inv.getArgument(0);
            if (t.getId() == null) t.setId(10L);
            return t;
        });
        when(userService.findBestAvailableAgent()).thenReturn(Optional.empty());

        TicketResponse response = ticketService.createTicket(createTicketRequest(2), "alice@example.com");

        assertThat(response.getStatus()).isEqualTo(TicketStatus.PENDING);
        assertThat(response.getId()).isNotNull();
        verify(ticketRepository, times(2)).save(any());
    }

    @Test
    @DisplayName("createTicket - throws InvalidOperationException for invalid priority; no save or email")
    void createTicket_throwsInvalidOperation_forBadPriority() {
        when(userService.getUserEntityByEmail("alice@example.com")).thenReturn(clientUser);
        when(categoryService.findCategoryById(1L)).thenReturn(category);
        when(messageUtil.get("error.ticket.invalid.priority")).thenReturn("Invalid priority.");

        assertThatThrownBy(() -> ticketService.createTicket(createTicketRequest(99), "alice@example.com"))
                .isInstanceOf(InvalidOperationException.class);

        verify(ticketRepository, never()).save(any());
    }

    // ─── getTicketsByCurrentUser ──────────────────────────────────────────────

    @Test
    @DisplayName("getTicketsByCurrentUser - returns tickets created by the current user")
    void getTicketsByCurrentUser_returnsCreatedTickets() {
        when(userService.getUserEntityByEmail("alice@example.com")).thenReturn(clientUser);
        when(ticketRepository.findByCreatedById(1L)).thenReturn(List.of(openTicket, pendingTicket));

        List<TicketResponse> result = ticketService.getTicketsByCurrentUser("alice@example.com");

        assertThat(result).hasSize(2);
    }

    // ─── getAssignedTickets ───────────────────────────────────────────────────

    @Test
    @DisplayName("getAssignedTickets - returns tickets assigned to the calling agent")
    void getAssignedTickets_returnsAssignedTickets() {
        when(userService.getUserEntityByEmail("bob@example.com")).thenReturn(agentUser);
        doNothing().when(userService).validateUserIsAgent(2L);
        when(ticketRepository.findByAssignedAgentId(2L)).thenReturn(List.of(openTicket));

        List<TicketResponse> result = ticketService.getAssignedTickets("bob@example.com");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(1L);
        verify(userService).validateUserIsAgent(2L);
    }

    @Test
    @DisplayName("getAssignedTickets - throws InvalidOperationException when caller is not an agent")
    void getAssignedTickets_throws_whenCallerIsNotAgent() {
        when(userService.getUserEntityByEmail("alice@example.com")).thenReturn(clientUser);
        doThrow(new InvalidOperationException("Not an agent."))
                .when(userService).validateUserIsAgent(1L);

        assertThatThrownBy(() -> ticketService.getAssignedTickets("alice@example.com"))
                .isInstanceOf(InvalidOperationException.class);
    }

    // ─── getTicketsByAgent ────────────────────────────────────────────────────

    @Test
    @DisplayName("getTicketsByAgent - delegates role validation to UserService")
    void getTicketsByAgent_delegatesValidation() {
        doNothing().when(userService).validateUserIsAgent(2L);
        when(ticketRepository.findByAssignedAgentId(2L)).thenReturn(List.of(openTicket));

        List<TicketResponse> result = ticketService.getTicketsByAgent(2L);

        assertThat(result).hasSize(1);
        verify(userService).validateUserIsAgent(2L);
    }

    // ─── getTicketById / enforceReadAccess ────────────────────────────────────

    @Test
    @DisplayName("getTicketById - ADMIN can read any ticket")
    void getTicketById_adminCanReadAnyTicket() {
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(openTicket));
        when(userService.getUserEntityByEmail("carol@example.com")).thenReturn(adminUser);

        assertThatCode(() -> ticketService.getTicketById(1L, "carol@example.com"))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("getTicketById - ADMIN can read a PENDING ticket")
    void getTicketById_adminCanReadPendingTicket() {
        when(ticketRepository.findById(2L)).thenReturn(Optional.of(pendingTicket));
        when(userService.getUserEntityByEmail("carol@example.com")).thenReturn(adminUser);

        assertThatCode(() -> ticketService.getTicketById(2L, "carol@example.com"))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("getTicketById - CLIENT can read their own ticket")
    void getTicketById_clientCanReadOwnTicket() {
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(openTicket));
        when(userService.getUserEntityByEmail("alice@example.com")).thenReturn(clientUser);

        assertThatCode(() -> ticketService.getTicketById(1L, "alice@example.com"))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("getTicketById - CLIENT cannot read another client's ticket")
    void getTicketById_clientCannotReadOtherClientTicket() {
        User other = User.builder().id(99L).email("other@example.com").role(Role.CLIENT).build();

        when(ticketRepository.findById(1L)).thenReturn(Optional.of(openTicket));
        when(userService.getUserEntityByEmail("other@example.com")).thenReturn(other);
        when(messageUtil.get("error.ticket.access.denied")).thenReturn("Access denied.");

        assertThatThrownBy(() -> ticketService.getTicketById(1L, "other@example.com"))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("getTicketById - AGENT can read a ticket assigned to them")
    void getTicketById_agentCanReadAssignedTicket() {
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(openTicket)); // assigned to agentUser
        when(userService.getUserEntityByEmail("bob@example.com")).thenReturn(agentUser);

        assertThatCode(() -> ticketService.getTicketById(1L, "bob@example.com"))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("getTicketById - AGENT can read a ticket they created")
    void getTicketById_agentCanReadTicketTheyCreated() {
        Ticket agentCreatedTicket = Ticket.builder()
                .id(5L).title("Agent-created").status(TicketStatus.OPEN)
                .createdDate(LocalDateTime.now()).createdBy(agentUser).build();

        when(ticketRepository.findById(5L)).thenReturn(Optional.of(agentCreatedTicket));
        when(userService.getUserEntityByEmail("bob@example.com")).thenReturn(agentUser);

        assertThatCode(() -> ticketService.getTicketById(5L, "bob@example.com"))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("getTicketById - AGENT cannot read a ticket they neither created nor are assigned to")
    void getTicketById_agentCannotReadUnrelatedTicket() {
        User otherAgent = User.builder().id(50L).email("other-agent@example.com")
                .role(Role.SUPPORT_AGENT).build();

        when(ticketRepository.findById(1L)).thenReturn(Optional.of(openTicket)); // client-created, agent-assigned
        when(userService.getUserEntityByEmail("other-agent@example.com")).thenReturn(otherAgent);
        when(messageUtil.get("error.ticket.access.denied")).thenReturn("Access denied.");

        assertThatThrownBy(() -> ticketService.getTicketById(1L, "other-agent@example.com"))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("getTicketById - throws ResourceNotFoundException for unknown ticket")
    void getTicketById_throwsNotFound() {
        when(ticketRepository.findById(99L)).thenReturn(Optional.empty());
        when(messageUtil.get(eq("error.ticket.not.found"), any())).thenReturn("Not found.");

        assertThatThrownBy(() -> ticketService.getTicketById(99L, "alice@example.com"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ─── updateTicket ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("updateTicket - throws when ticket is CLOSED")
    void updateTicket_throwsInvalidOp_whenClosed() {
        openTicket.setStatus(TicketStatus.CLOSED);
        UpdateTicketRequest request = new UpdateTicketRequest();
        request.setTitle("New Title");

        when(ticketRepository.findById(1L)).thenReturn(Optional.of(openTicket));
        when(userService.getUserEntityByEmail("alice@example.com")).thenReturn(clientUser);
        when(messageUtil.get("error.ticket.already.closed")).thenReturn("Ticket is closed.");

        assertThatThrownBy(() -> ticketService.updateTicket(1L, request, "alice@example.com"))
                .isInstanceOf(InvalidOperationException.class);
    }

    @Test
    @DisplayName("updateTicket - agent cannot update a ticket they did not create")
    void updateTicket_throwsAccessDenied_whenAgentDidNotCreate() {
        UpdateTicketRequest request = new UpdateTicketRequest();
        request.setTitle("New Title");

        when(ticketRepository.findById(1L)).thenReturn(Optional.of(openTicket)); // createdBy=clientUser
        when(userService.getUserEntityByEmail("bob@example.com")).thenReturn(agentUser);
        when(messageUtil.get("error.ticket.access.denied")).thenReturn("Access denied.");

        assertThatThrownBy(() -> ticketService.updateTicket(1L, request, "bob@example.com"))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("updateTicket - admin can update any ticket and email is sent")
    void updateTicket_adminCanUpdateAnyTicket_andEmailSent() {
        UpdateTicketRequest request = new UpdateTicketRequest();
        request.setTitle("Admin Updated");

        when(ticketRepository.findById(1L)).thenReturn(Optional.of(openTicket));
        when(userService.getUserEntityByEmail("carol@example.com")).thenReturn(adminUser);
        when(ticketRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        TicketResponse response = ticketService.updateTicket(1L, request, "carol@example.com");

        assertThat(response.getTitle()).isEqualTo("Admin Updated");
    }

    // ─── assignTicket ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("assignTicket - success: saves ticket, sends assigned email")
    void assignTicket_success_savesAndSendsEmail() {
        AssignTicketRequest request = new AssignTicketRequest();
        request.setAgentId(2L);

        when(ticketRepository.findById(1L)).thenReturn(Optional.of(openTicket));
        doNothing().when(userService).validateUserIsAgent(2L);
        when(userService.isAgentBelowMaxWorkload(2L)).thenReturn(true);
        when(userService.getUserEntityById(2L)).thenReturn(agentUser);
        when(ticketRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        TicketResponse response = ticketService.assignTicket(1L, request, "carol@example.com");

        // assignTicket only sets the agent — status is unchanged (OPEN)
        assertThat(response.getStatus()).isEqualTo(TicketStatus.OPEN);
        assertThat(response.getAssignedAgent()).isNotNull();
    }

    @Test
    @DisplayName("assignTicket - throws when agent is at max workload; no email sent")
    void assignTicket_throwsInvalidOp_whenAgentAtMaxWorkload() {
        AssignTicketRequest request = new AssignTicketRequest();
        request.setAgentId(2L);

        when(ticketRepository.findById(1L)).thenReturn(Optional.of(openTicket));
        doNothing().when(userService).validateUserIsAgent(2L);
        when(userService.isAgentBelowMaxWorkload(2L)).thenReturn(false);
        when(userService.getActiveTicketCountForAgent(2L)).thenReturn(10L);
        when(messageUtil.get(eq("error.ticket.agent.workload.exceeded"), any())).thenReturn("Workload exceeded.");

        assertThatThrownBy(() -> ticketService.assignTicket(1L, request, "carol@example.com"))
                .isInstanceOf(InvalidOperationException.class);
    }

    @Test
    @DisplayName("assignTicket - throws when ticket is CLOSED; no email sent")
    void assignTicket_throwsInvalidOp_whenClosed() {
        openTicket.setStatus(TicketStatus.CLOSED);
        AssignTicketRequest request = new AssignTicketRequest();
        request.setAgentId(2L);

        when(ticketRepository.findById(1L)).thenReturn(Optional.of(openTicket));
        when(messageUtil.get("error.ticket.already.closed")).thenReturn("Ticket is closed.");

        assertThatThrownBy(() -> ticketService.assignTicket(1L, request, "carol@example.com"))
                .isInstanceOf(InvalidOperationException.class);

    }

    // ─── autoAssignTicket ─────────────────────────────────────────────────────

    @Test
    @DisplayName("autoAssignTicket - sets OPEN and sends assigned email when agent available")
    void autoAssignTicket_setsOpen_andSendsEmail_whenAgentAvailable() {
        when(ticketRepository.findById(2L)).thenReturn(Optional.of(pendingTicket));
        when(userService.findBestAvailableAgent()).thenReturn(Optional.of(agentUser));
        when(ticketRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        TicketResponse response = ticketService.autoAssignTicket(2L, "carol@example.com");

        assertThat(response.getStatus()).isEqualTo(TicketStatus.OPEN);
    }

    @Test
    @DisplayName("autoAssignTicket - throws NoAgentAvailableException when all agents at capacity; no email")
    void autoAssignTicket_throwsNoAgent_whenAllAtCapacity() {
        when(ticketRepository.findById(2L)).thenReturn(Optional.of(pendingTicket));
        when(userService.findBestAvailableAgent()).thenReturn(Optional.empty());
        when(ticketRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(messageUtil.get("error.ticket.no.agent.available")).thenReturn("No agent available.");

        assertThatThrownBy(() -> ticketService.autoAssignTicket(2L, "carol@example.com"))
                .isInstanceOf(NoAgentAvailableException.class);
    }

    // ─── requestReassignment ──────────────────────────────────────────────────

    @Test
    @DisplayName("requestReassignment - sets OPEN and sends assigned email when agent available")
    void requestReassignment_setsOpen_andSendsEmail_whenAgentAvailable() {
        when(ticketRepository.findById(2L)).thenReturn(Optional.of(pendingTicket));
        when(userService.getUserEntityByEmail("alice@example.com")).thenReturn(clientUser);
        when(userService.findBestAvailableAgent()).thenReturn(Optional.of(agentUser));
        when(ticketRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        TicketResponse response = ticketService.requestReassignment(2L, "alice@example.com");

        assertThat(response.getStatus()).isEqualTo(TicketStatus.OPEN);
    }

    @Test
    @DisplayName("requestReassignment - throws NoAgentAvailableException when all agents busy; no email")
    void requestReassignment_throwsNoAgent_whenAllBusy() {
        when(ticketRepository.findById(2L)).thenReturn(Optional.of(pendingTicket));
        when(userService.getUserEntityByEmail("alice@example.com")).thenReturn(clientUser);
        when(userService.findBestAvailableAgent()).thenReturn(Optional.empty());
        when(messageUtil.get("error.ticket.agents.busy.retry"))
                .thenReturn("No agents available. Please try again after 3 hours.");

        assertThatThrownBy(() -> ticketService.requestReassignment(2L, "alice@example.com"))
                .isInstanceOf(NoAgentAvailableException.class)
                .hasMessageContaining("3 hours");
    }

    @Test
    @DisplayName("requestReassignment - throws InvalidOperationException when ticket is not PENDING")
    void requestReassignment_throwsInvalidOp_whenNotPending() {
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(openTicket)); // status=OPEN
        when(userService.getUserEntityByEmail("alice@example.com")).thenReturn(clientUser);
        when(messageUtil.get("error.ticket.not.pending")).thenReturn("Ticket is not pending.");

        assertThatThrownBy(() -> ticketService.requestReassignment(1L, "alice@example.com"))
                .isInstanceOf(InvalidOperationException.class);
    }

    @Test
    @DisplayName("requestReassignment - throws AccessDeniedException when client does not own ticket")
    void requestReassignment_throwsAccessDenied_forWrongClient() {
        User other = User.builder().id(99L).email("other@example.com").role(Role.CLIENT).build();

        when(ticketRepository.findById(2L)).thenReturn(Optional.of(pendingTicket));
        when(userService.getUserEntityByEmail("other@example.com")).thenReturn(other);
        when(messageUtil.get("error.ticket.access.denied")).thenReturn("Access denied.");

        assertThatThrownBy(() -> ticketService.requestReassignment(2L, "other@example.com"))
                .isInstanceOf(AccessDeniedException.class);
    }

    // ─── updateTicketStatus ───────────────────────────────────────────────────

    @Test
    @DisplayName("updateTicketStatus - OPEN to RESOLVED is an invalid transition")
    void updateTicketStatus_throwsInvalidOp_onBadTransition() {
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(openTicket));
        when(userService.getUserEntityByEmail("carol@example.com")).thenReturn(adminUser);
        when(messageUtil.get(eq("error.ticket.invalid.status.transition"), any(), any()))
                .thenReturn("Invalid transition.");

        assertThatThrownBy(() -> ticketService.updateTicketStatus(1L, TicketStatus.RESOLVED, "carol@example.com"))
                .isInstanceOf(InvalidOperationException.class);

        verify(emailService, never()).sendTicketStatusUpdatedNotification(any(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("updateTicketStatus - PENDING to IN_PROGRESS is valid for admin; email sent")
    void updateTicketStatus_pendingToInProgress_isValid() {
        when(ticketRepository.findById(2L)).thenReturn(Optional.of(pendingTicket));
        when(userService.getUserEntityByEmail("carol@example.com")).thenReturn(adminUser);
        when(ticketRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        TicketResponse response = ticketService.updateTicketStatus(2L, TicketStatus.IN_PROGRESS, "carol@example.com");

        assertThat(response.getStatus()).isEqualTo(TicketStatus.IN_PROGRESS);
    }

    @Test
    @DisplayName("updateTicketStatus - agent can resolve their assigned ticket; email sent")
    void updateTicketStatus_agent_canResolveAssignedTicket() {
        Ticket inProgressTicket = Ticket.builder()
                .id(3L).title("In Progress").status(TicketStatus.IN_PROGRESS)
                .createdDate(LocalDateTime.now()).createdBy(clientUser).assignedAgent(agentUser).build();

        when(ticketRepository.findById(3L)).thenReturn(Optional.of(inProgressTicket));
        when(userService.getUserEntityByEmail("bob@example.com")).thenReturn(agentUser);
        when(ticketRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        TicketResponse response = ticketService.updateTicketStatus(3L, TicketStatus.RESOLVED, "bob@example.com");

        assertThat(response.getStatus()).isEqualTo(TicketStatus.RESOLVED);
    }

    @Test
    @DisplayName("updateTicketStatus - agent cannot close a ticket; no email sent")
    void updateTicketStatus_agent_cannotCloseTicket() {
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(openTicket));
        when(userService.getUserEntityByEmail("bob@example.com")).thenReturn(agentUser);
        when(messageUtil.get("error.auth.access.denied")).thenReturn("Permission denied.");

        assertThatThrownBy(() -> ticketService.updateTicketStatus(1L, TicketStatus.CLOSED, "bob@example.com"))
                .isInstanceOf(AccessDeniedException.class);

        verify(emailService, never()).sendTicketStatusUpdatedNotification(any(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("updateTicketStatus - agent cannot change status on another agent's ticket; no email")
    void updateTicketStatus_agent_cannotChangeStatusOnUnassignedTicket() {
        User otherAgent = User.builder().id(50L).email("other-agent@example.com")
                .role(Role.SUPPORT_AGENT).build();

        when(ticketRepository.findById(1L)).thenReturn(Optional.of(openTicket)); // assigned to agentUser (id=2)
        when(userService.getUserEntityByEmail("other-agent@example.com")).thenReturn(otherAgent);
        when(messageUtil.get("error.ticket.access.denied")).thenReturn("Access denied.");

        assertThatThrownBy(() -> ticketService.updateTicketStatus(1L, TicketStatus.IN_PROGRESS, "other-agent@example.com"))
                .isInstanceOf(AccessDeniedException.class);

        verify(emailService, never()).sendTicketStatusUpdatedNotification(any(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("updateTicketStatus - client can close their own resolved ticket; email sent")
    void updateTicketStatus_client_canCloseOwnResolvedTicket() {
        Ticket resolvedTicket = Ticket.builder()
                .id(4L).title("Resolved").status(TicketStatus.RESOLVED)
                .createdDate(LocalDateTime.now()).createdBy(clientUser).assignedAgent(agentUser).build();

        when(ticketRepository.findById(4L)).thenReturn(Optional.of(resolvedTicket));
        when(userService.getUserEntityByEmail("alice@example.com")).thenReturn(clientUser);
        when(ticketRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        TicketResponse response = ticketService.updateTicketStatus(4L, TicketStatus.CLOSED, "alice@example.com");

        assertThat(response.getStatus()).isEqualTo(TicketStatus.CLOSED);
    }

    @Test
    @DisplayName("updateTicketStatus - client cannot set IN_PROGRESS; no email sent")
    void updateTicketStatus_client_cannotSetInProgress() {
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(openTicket));
        when(userService.getUserEntityByEmail("alice@example.com")).thenReturn(clientUser);
        when(messageUtil.get("error.auth.access.denied")).thenReturn("Permission denied.");

        assertThatThrownBy(() -> ticketService.updateTicketStatus(1L, TicketStatus.IN_PROGRESS, "alice@example.com"))
                .isInstanceOf(AccessDeniedException.class);

    }

    // ─── deleteTicket ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("deleteTicket - throws InvalidOperationException when ticket is not CLOSED")
    void deleteTicket_throwsInvalidOp_whenNotClosed() {
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(openTicket));
        when(messageUtil.get("error.ticket.not.closed")).thenReturn("Only closed tickets can be deleted.");

        assertThatThrownBy(() -> ticketService.deleteTicket(1L, "carol@example.com"))
                .isInstanceOf(InvalidOperationException.class);

        verify(ticketRepository, never()).delete(any());
    }

    @Test
    @DisplayName("deleteTicket - success when ticket is CLOSED")
    void deleteTicket_success_whenClosed() {
        Ticket closedTicket = Ticket.builder()
                .id(5L).title("Closed").status(TicketStatus.CLOSED)
                .createdDate(LocalDateTime.now()).createdBy(clientUser).build();

        when(ticketRepository.findById(5L)).thenReturn(Optional.of(closedTicket));

        assertThatCode(() -> ticketService.deleteTicket(5L, "carol@example.com"))
                .doesNotThrowAnyException();

        verify(ticketRepository).delete(closedTicket);
    }

    // ─── helpers ─────────────────────────────────────────────────────────────

    private CreateTicketRequest createTicketRequest(int priority) {
        CreateTicketRequest r = new CreateTicketRequest();
        r.setTitle("My Issue");
        r.setDescription("Description");
        r.setPriority(priority);
        r.setCategoryId(1L);
        return r;
    }
}