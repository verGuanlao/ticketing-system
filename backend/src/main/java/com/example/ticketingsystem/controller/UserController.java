package com.example.ticketingsystem.controller;

import com.example.ticketingsystem.component.MessageUtil;
import com.example.ticketingsystem.dto.request.CreateUserRequest;
import com.example.ticketingsystem.dto.response.ApiResponse;
import com.example.ticketingsystem.dto.response.UserResponse;
import com.example.ticketingsystem.model.enums.Role;
import com.example.ticketingsystem.model.enums.Status;
import com.example.ticketingsystem.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;
    private final MessageUtil messageUtil;

    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Returns the authenticated user's profile.")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(
            @AuthenticationPrincipal UserDetails userDetails) {
        UserResponse user = userService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(messageUtil.get("success.user.fetched"), user));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or authentication.name == @userRepository.findById(#id).orElse(null)?.email")
    @Operation(summary = "Get user by ID", description = "Returns a user by ID. Admins can fetch any user.")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        UserResponse user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(messageUtil.get("success.user.fetched"), user));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all users", description = "Returns all users. Admin only.")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        List<UserResponse> users = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success(messageUtil.get("success.user.list.fetched"), users));
    }

    @GetMapping("/role/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get users by role", description = "Returns all users with the specified role. Admin only.")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getUsersByRole(@PathVariable Role role) {
        List<UserResponse> users = userService.getUsersByRole(role);
        return ResponseEntity.ok(ApiResponse.success(messageUtil.get("success.user.list.fetched"), users));
    }

    @PostMapping("")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create user", description = "Create a user. Admin only.")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @Valid @RequestBody CreateUserRequest request) {
        UserResponse user = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(messageUtil.get("success.user.created"), user));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Change user status", description = "Change user status to active or inactive. Admin only.")
    public ResponseEntity<ApiResponse<UserResponse>> changeUserStatus(
            @PathVariable Long id,
            @Valid @RequestParam Status status) {
        UserResponse user = userService.changeUserStatus(id, status);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(messageUtil.get("success.user.updated"), user));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete user", description = "Deletes a user. Admin only. Cannot delete own account.")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        userService.deleteUser(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(messageUtil.get("success.user.deleted")));
    }

    @GetMapping("/max-workload")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPORT_AGENT')")
    @Operation(summary = "Get max workload", description = "Returns value of the max workload.")
    public ResponseEntity<ApiResponse<Integer>> getMaxWorkload() {
        return ResponseEntity.ok(ApiResponse.success(messageUtil.get("success.user.list.fetched"), userService.getMaxWorkload()));
    }
}