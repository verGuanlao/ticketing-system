package com.example.ticketingsystem.controller;

import com.example.ticketingsystem.component.MessageUtil;
import com.example.ticketingsystem.dto.request.AssignTicketRequest;
import com.example.ticketingsystem.dto.request.CreateTicketRequest;
import com.example.ticketingsystem.dto.request.UpdateTicketRequest;
import com.example.ticketingsystem.dto.response.ApiResponse;
import com.example.ticketingsystem.dto.response.TicketResponse;
import com.example.ticketingsystem.model.enums.TicketStatus;
import com.example.ticketingsystem.service.TicketService;
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
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@Tag(name = "Tickets", description = "Ticket management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class TicketController {

    private final TicketService ticketService;
    private final MessageUtil messageUtil;


    @PostMapping
    @Operation(
            summary = "Create a ticket",
            description = "Creates a ticket and attempts auto-assignment to the least-loaded agent. " +
                    "If all agents are at full capacity the ticket is saved with status PENDING.")
    public ResponseEntity<ApiResponse<TicketResponse>> createTicket(
            @Valid @RequestBody CreateTicketRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        TicketResponse ticket = ticketService.createTicket(request, userDetails.getUsername());

        // Pick an informative message based on whether assignment succeeded
        String message = ticket.getStatus() == TicketStatus.PENDING
                ? messageUtil.get("error.ticket.agents.busy")
                : messageUtil.get("success.ticket.created");

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(message, ticket));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get ticket by ID",
            description = "Admins see any ticket. Agents see their assigned tickets. Clients see their own tickets.")
    public ResponseEntity<ApiResponse<TicketResponse>> getTicketById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        TicketResponse ticket = ticketService.getTicketById(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(messageUtil.get("success.ticket.fetched"), ticket));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN')")
    @Operation(summary = "Get all tickets", description = "Admin only.")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getAllTickets() {
        List<TicketResponse> tickets = ticketService.getAllTickets();
        return ResponseEntity.ok(ApiResponse.success(messageUtil.get("success.ticket.list.fetched"), tickets));
    }

    @GetMapping("/my")
    @Operation(summary = "Get current user's tickets",
            description = "Returns all tickets created by the authenticated user.")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getMyTickets(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<TicketResponse> tickets = ticketService.getTicketsByCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(messageUtil.get("success.ticket.list.fetched"), tickets));
    }

    @GetMapping("/my-assigned")
    @PreAuthorize("hasAnyRole('SUPPORT_AGENT')")
    @Operation(summary = "Get current agents's assigned tickets",
            description = "Returns all tickets assigned to the authenticated user.")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getMyAssignedTickets(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<TicketResponse> tickets = ticketService.getAssignedTickets(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(messageUtil.get("success.ticket.list.fetched"), tickets));
    }


    @GetMapping("/agent/{agentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPORT_AGENT')")
    @Operation(summary = "Get tickets by agent ID", description = "Admin or the agent themselves.")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getTicketsByAgent(@PathVariable Long agentId) {
        List<TicketResponse> tickets = ticketService.getTicketsByAgent(agentId);
        return ResponseEntity.ok(ApiResponse.success(messageUtil.get("success.ticket.list.fetched"), tickets));
    }

//    @GetMapping("/status/{status}")
//    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPORT_AGENT')")
//    @Operation(summary = "Get tickets by status")
//    public ResponseEntity<ApiResponse<List<TicketResponse>>> getTicketsByStatus(
//            @PathVariable TicketStatus status) {
//        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
//    }

    @PutMapping("/{id}")
    @Operation(summary = "Update ticket",
            description = "Clients can update their own tickets' title/description. Agents and Admins can update all fields.")
    public ResponseEntity<ApiResponse<TicketResponse>> updateTicket(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTicketRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        TicketResponse ticket = ticketService.updateTicket(id, request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(messageUtil.get("success.ticket.updated"), ticket));
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Manually assign ticket to agent", description = "Admin only.")
    public ResponseEntity<ApiResponse<TicketResponse>> assignTicket(
            @PathVariable Long id,
            @Valid @RequestBody AssignTicketRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        TicketResponse ticket = ticketService.assignTicket(id, request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(messageUtil.get("success.ticket.assigned"), ticket));
    }

    @PatchMapping("/{id}/auto-assign")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Auto-assign ticket to least-loaded agent", description = "Admin only.")
    public ResponseEntity<ApiResponse<TicketResponse>> autoAssignTicket(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        TicketResponse ticket = ticketService.autoAssignTicket(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(messageUtil.get("success.ticket.assigned"), ticket));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update ticket status",
            description = "Agents/Admins can move tickets through statuses. Clients can only close or re-open their own resolved tickets.")
    public ResponseEntity<ApiResponse<TicketResponse>> updateStatus(
            @PathVariable Long id,
            @RequestParam TicketStatus status,
            @AuthenticationPrincipal UserDetails userDetails) {
        TicketResponse ticket = ticketService.updateTicketStatus(id, status, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(messageUtil.get("success.ticket.status.updated"), ticket));
    }

    @PatchMapping("/{id}/reassign")
    @Operation(
            summary = "Request reassignment of a PENDING ticket",
            description = "Clients can call this on their own PENDING tickets to attempt assignment to an available agent. " +
                    "If an agent is available the ticket moves to IN_PROGRESS. " +
                    "If all agents are still at capacity, a 503 error is returned asking the client to retry after 3 hours. " +
                    "Admins can also call this on any PENDING ticket.")
    public ResponseEntity<ApiResponse<TicketResponse>> requestReassignment(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        TicketResponse ticket = ticketService.requestReassignment(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(messageUtil.get("success.ticket.assigned"), ticket));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete ticket", description = "Admin only. Only CLOSED tickets can be deleted.")
    public ResponseEntity<ApiResponse<Void>> deleteTicket(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        ticketService.deleteTicket(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(messageUtil.get("success.ticket.deleted")));
    }
}