package com.example.ticketingsystem.service;

import com.example.ticketingsystem.dto.request.CreateUserRequest;
import com.example.ticketingsystem.dto.response.UserResponse;
import com.example.ticketingsystem.model.User;
import com.example.ticketingsystem.model.enums.Role;
import com.example.ticketingsystem.model.enums.Status;
import com.example.ticketingsystem.exception.InvalidOperationException;
import com.example.ticketingsystem.exception.ResourceNotFoundException;
import com.example.ticketingsystem.repository.TicketRepository;
import com.example.ticketingsystem.repository.UserRepository;
import com.example.ticketingsystem.service.impl.UserServiceImpl;
import com.example.ticketingsystem.component.MessageUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserService Tests")
class UserServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private TicketRepository ticketRepository;
    @Mock private MessageUtil messageUtil;

    @InjectMocks private UserServiceImpl userService;

    private User adminUser;
    private User clientUser;
    private User agentUser;

    private static final int MAX_WORKLOAD = 10;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(userService, "maxAgentWorkload", MAX_WORKLOAD);

        adminUser = User.builder().id(1L).firstName("Admin").lastName("User")
                .email("admin@example.com").role(Role.ADMIN).status(Status.ACTIVE).build();

        clientUser = User.builder().id(2L).firstName("Client").lastName("User")
                .email("client@example.com").role(Role.CLIENT).status(Status.ACTIVE).build();

        agentUser = User.builder().id(3L).firstName("Agent").lastName("User")
                .email("agent@example.com").role(Role.SUPPORT_AGENT).status(Status.ACTIVE).build();
    }

    // ─── getUserById ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("getUserById - success")
    void getUserById_success() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(clientUser));

        UserResponse response = userService.getUserById(2L);

        assertThat(response).isNotNull();
        assertThat(response.getEmail()).isEqualTo("client@example.com");
        assertThat(response.getRole()).isEqualTo(Role.CLIENT);
    }

    @Test
    @DisplayName("getUserById - throws ResourceNotFoundException for unknown id")
    void getUserById_throwsNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());
        when(messageUtil.get(eq("error.user.not.found"), any())).thenReturn("User not found.");

        assertThatThrownBy(() -> userService.getUserById(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ─── getUserEntityByEmail ─────────────────────────────────────────────────

    @Test
    @DisplayName("getUserEntityByEmail - returns raw User entity")
    void getUserEntityByEmail_returnsEntity() {
        when(userRepository.findByEmail("agent@example.com")).thenReturn(Optional.of(agentUser));

        User result = userService.getUserEntityByEmail("agent@example.com");

        assertThat(result).isNotNull();
        assertThat(result.getRole()).isEqualTo(Role.SUPPORT_AGENT);
    }

    @Test
    @DisplayName("getUserEntityByEmail - throws ResourceNotFoundException for unknown email")
    void getUserEntityByEmail_throwsNotFound() {
        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());
        when(messageUtil.get(eq("error.user.email.not.found"), any())).thenReturn("Not found.");

        assertThatThrownBy(() -> userService.getUserEntityByEmail("missing@example.com"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ─── getAllUsers ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("getAllUsers - returns all users")
    void getAllUsers_returnsList() {
        when(userRepository.findAll()).thenReturn(List.of(adminUser, clientUser, agentUser));

        List<UserResponse> result = userService.getAllUsers();

        assertThat(result).hasSize(3);
    }

    // ─── getUsersByRole ───────────────────────────────────────────────────────

    @Test
    @DisplayName("getUsersByRole - returns only agents when filtering by SUPPORT_AGENT")
    void getUsersByRole_returnsAgents() {
        when(userRepository.findByRole(Role.SUPPORT_AGENT)).thenReturn(List.of(agentUser));

        List<UserResponse> result = userService.getUsersByRole(Role.SUPPORT_AGENT);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getRole()).isEqualTo(Role.SUPPORT_AGENT);
    }

    // ─── createUser ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("createUser - success: saves user with ACTIVE status and returns response")
    void createUser_success() {
        CreateUserRequest request = new CreateUserRequest();
        request.setFirstName("New");
        request.setLastName("User");
        request.setEmail("new@example.com");
        request.setPassword("Password1!");
        request.setRole(Role.CLIENT);

        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(10L);
            return u;
        });

        UserResponse response = userService.createUser(request);

        assertThat(response).isNotNull();
        assertThat(response.getEmail()).isEqualTo("new@example.com");
        assertThat(response.getRole()).isEqualTo(Role.CLIENT);
        assertThat(response.getStatus()).isEqualTo(Status.ACTIVE);
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("createUser - always sets status to ACTIVE regardless of request")
    void createUser_alwaysSetsActiveStatus() {
        CreateUserRequest request = new CreateUserRequest();
        request.setFirstName("Test");
        request.setLastName("Agent");
        request.setEmail("agent2@example.com");
        request.setPassword("Password1!");
        request.setRole(Role.SUPPORT_AGENT);

        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UserResponse response = userService.createUser(request);

        assertThat(response.getStatus()).isEqualTo(Status.ACTIVE);
    }

    // ─── changeUserStatus ─────────────────────────────────────────────────────

    @Test
    @DisplayName("changeUserStatus - success: updates and persists new status")
    void changeUserStatus_success() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(clientUser));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UserResponse response = userService.changeUserStatus(2L, Status.INACTIVE);

        assertThat(response.getStatus()).isEqualTo(Status.INACTIVE);
        verify(userRepository).save(clientUser);
    }

    @Test
    @DisplayName("changeUserStatus - can suspend a user")
    void changeUserStatus_canSuspend() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(clientUser));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UserResponse response = userService.changeUserStatus(2L, Status.INACTIVE);

        assertThat(response.getStatus()).isEqualTo(Status.INACTIVE);
    }

    @Test
    @DisplayName("changeUserStatus - throws ResourceNotFoundException for unknown user id")
    void changeUserStatus_throwsNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());
        when(messageUtil.get(eq("error.user.not.found"), any())).thenReturn("User not found.");

        assertThatThrownBy(() -> userService.changeUserStatus(99L, Status.INACTIVE))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(userRepository, never()).save(any());
    }

    // ─── deleteUser ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("deleteUser - success when deleting another user")
    void deleteUser_success() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(clientUser));
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(adminUser));

        assertThatCode(() -> userService.deleteUser(2L, "admin@example.com"))
                .doesNotThrowAnyException();

        verify(userRepository).delete(clientUser);
    }

    @Test
    @DisplayName("deleteUser - throws InvalidOperationException when deleting own account")
    void deleteUser_throwsInvalidOp_whenDeletingSelf() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(adminUser));
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(adminUser));
        when(messageUtil.get("error.user.cannot.delete.self")).thenReturn("Cannot delete self.");

        assertThatThrownBy(() -> userService.deleteUser(1L, "admin@example.com"))
                .isInstanceOf(InvalidOperationException.class);

        verify(userRepository, never()).delete(any());
    }

    // ─── validateUserIsAgent ─────────────────────────────────────────────────

    @Test
    @DisplayName("validateUserIsAgent - passes silently for SUPPORT_AGENT role")
    void validateUserIsAgent_passesForAgent() {
        when(userRepository.findById(3L)).thenReturn(Optional.of(agentUser));

        assertThatCode(() -> userService.validateUserIsAgent(3L))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("validateUserIsAgent - throws InvalidOperationException for CLIENT role")
    void validateUserIsAgent_throwsForClient() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(clientUser));
        when(messageUtil.get("error.user.not.agent")).thenReturn("Not an agent.");

        assertThatThrownBy(() -> userService.validateUserIsAgent(2L))
                .isInstanceOf(InvalidOperationException.class);
    }

    @Test
    @DisplayName("validateUserIsAgent - throws InvalidOperationException for ADMIN role")
    void validateUserIsAgent_throwsForAdmin() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(adminUser));
        when(messageUtil.get("error.user.not.agent")).thenReturn("Not an agent.");

        assertThatThrownBy(() -> userService.validateUserIsAgent(1L))
                .isInstanceOf(InvalidOperationException.class);
    }

    // ─── getMaxWorkload ───────────────────────────────────────────────────────

    @Test
    @DisplayName("getMaxWorkload - returns the configured max workload value")
    void getMaxWorkload_returnsConfiguredValue() {
        assertThat(userService.getMaxWorkload()).isEqualTo(MAX_WORKLOAD);
    }

    // ─── isAgentBelowMaxWorkload ──────────────────────────────────────────────

    @Test
    @DisplayName("isAgentBelowMaxWorkload - true when active count is below max")
    void isAgentBelowMaxWorkload_true_belowMax() {
        when(ticketRepository.countActiveTicketsByAgent(3L)).thenReturn(7L); // 7 < 10
        assertThat(userService.isAgentBelowMaxWorkload(3L)).isTrue();
    }

    @Test
    @DisplayName("isAgentBelowMaxWorkload - false when active count equals max")
    void isAgentBelowMaxWorkload_false_atMax() {
        when(ticketRepository.countActiveTicketsByAgent(3L)).thenReturn(10L); // 10 == 10
        assertThat(userService.isAgentBelowMaxWorkload(3L)).isFalse();
    }

    @Test
    @DisplayName("isAgentBelowMaxWorkload - false when active count exceeds max")
    void isAgentBelowMaxWorkload_false_aboveMax() {
        when(ticketRepository.countActiveTicketsByAgent(3L)).thenReturn(15L); // 15 > 10
        assertThat(userService.isAgentBelowMaxWorkload(3L)).isFalse();
    }

    @Test
    @DisplayName("isAgentBelowMaxWorkload - true when agent has no active tickets")
    void isAgentBelowMaxWorkload_true_noActiveTickets() {
        when(ticketRepository.countActiveTicketsByAgent(3L)).thenReturn(0L);
        assertThat(userService.isAgentBelowMaxWorkload(3L)).isTrue();
    }

    // ─── getActiveTicketCountForAgent ─────────────────────────────────────────

    @Test
    @DisplayName("getActiveTicketCountForAgent - returns plain active ticket count from repository")
    void getActiveTicketCountForAgent_returnsCount() {
        when(ticketRepository.countActiveTicketsByAgent(3L)).thenReturn(4L);

        long count = userService.getActiveTicketCountForAgent(3L);

        assertThat(count).isEqualTo(4L);
    }

    // ─── findBestAvailableAgent ───────────────────────────────────────────────

    @Test
    @DisplayName("findBestAvailableAgent - returns agent when count is below max")
    void findBestAvailableAgent_returnsAgent_whenBelowMax() {
        when(userRepository.findByRole(Role.SUPPORT_AGENT)).thenReturn(List.of(agentUser));
        when(ticketRepository.countActiveTicketsByAgent(3L)).thenReturn(6L); // 6 < 10

        Optional<User> result = userService.findBestAvailableAgent();

        assertThat(result).isPresent();
        assertThat(result.get().getId()).isEqualTo(3L);
    }

    @Test
    @DisplayName("findBestAvailableAgent - returns empty when all agents are at or above max")
    void findBestAvailableAgent_returnsEmpty_whenAllAtMax() {
        when(userRepository.findByRole(Role.SUPPORT_AGENT)).thenReturn(List.of(agentUser));
        when(ticketRepository.countActiveTicketsByAgent(3L)).thenReturn(12L); // 12 >= 10

        Optional<User> result = userService.findBestAvailableAgent();

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("findBestAvailableAgent - returns empty when no agents are registered")
    void findBestAvailableAgent_returnsEmpty_whenNoAgents() {
        when(userRepository.findByRole(Role.SUPPORT_AGENT)).thenReturn(List.of());

        Optional<User> result = userService.findBestAvailableAgent();

        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("findBestAvailableAgent - picks the agent with the lowest active ticket count")
    void findBestAvailableAgent_picksLeastLoaded() {
        User agent2 = User.builder().id(4L).email("agent2@example.com")
                .role(Role.SUPPORT_AGENT).build();

        when(userRepository.findByRole(Role.SUPPORT_AGENT)).thenReturn(List.of(agentUser, agent2));
        when(ticketRepository.countActiveTicketsByAgent(3L)).thenReturn(8L);
        when(ticketRepository.countActiveTicketsByAgent(4L)).thenReturn(3L); // fewer — should be picked

        Optional<User> result = userService.findBestAvailableAgent();

        assertThat(result).isPresent();
        assertThat(result.get().getId()).isEqualTo(4L);
    }

    @Test
    @DisplayName("findBestAvailableAgent - uses lowest ID as tie-breaker when counts are equal")
    void findBestAvailableAgent_usesIdAsTieBreaker() {
        User agent2 = User.builder().id(4L).email("agent2@example.com")
                .role(Role.SUPPORT_AGENT).build();

        when(userRepository.findByRole(Role.SUPPORT_AGENT)).thenReturn(List.of(agent2, agentUser));
        when(ticketRepository.countActiveTicketsByAgent(3L)).thenReturn(5L);
        when(ticketRepository.countActiveTicketsByAgent(4L)).thenReturn(5L); // tied — lower ID wins

        Optional<User> result = userService.findBestAvailableAgent();

        assertThat(result).isPresent();
        assertThat(result.get().getId()).isEqualTo(3L);
    }
}