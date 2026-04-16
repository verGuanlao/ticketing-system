package com.example.ticketingsystem.service;

import com.example.ticketingsystem.dto.request.CreateUserRequest;
import com.example.ticketingsystem.dto.response.UserResponse;
import com.example.ticketingsystem.model.User;
import com.example.ticketingsystem.model.enums.Role;
import com.example.ticketingsystem.model.enums.Status;

import java.util.List;
import java.util.Optional;

public interface UserService {

    // ── Public-facing query methods ──────────────────────────────────────────
    UserResponse getUserById(Long id);
    UserResponse getUserByEmail(String email);
    List<UserResponse> getAllUsers();
    List<UserResponse> getUsersByRole(Role role);
    void deleteUser(Long id, String currentUserEmail);
    UserResponse getCurrentUser(String email);
    UserResponse createUser(CreateUserRequest createUserRequest);
    UserResponse changeUserStatus(Long id, Status status);

    // ── Internal entity-returning helpers (used by other services) ───────────
    User getUserEntityById(Long id);
    User getUserEntityByEmail(String email);
    void validateUserIsAgent(Long userId);

    // ── Agent workload / assignment helpers ──────────────────────────────────

    Integer getMaxWorkload();
    Optional<User> findBestAvailableAgent();
    long getActiveTicketCountForAgent(Long agentId);
    boolean isAgentBelowMaxWorkload(Long agentId);
}