package com.example.ticketingsystem.controller;

import com.example.ticketingsystem.component.MessageUtil;
import com.example.ticketingsystem.dto.request.CreateMessageRequest;
import com.example.ticketingsystem.dto.response.ApiResponse;
import com.example.ticketingsystem.dto.response.MessageResponse;
import com.example.ticketingsystem.service.MessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets/{ticketId}/messages")
@RequiredArgsConstructor
@Tag(name = "Messages", description = "Ticket message / comment endpoints")
@SecurityRequirement(name = "bearerAuth")
public class MessageController {

    private final MessageService messageService;
    private final MessageUtil messageUtil;

    @PostMapping
    @Operation(summary = "Add message to ticket",
            description = "Clients can message on their own tickets; Agents on their assigned tickets or created tickets; Admins on any.")
    public ResponseEntity<ApiResponse<MessageResponse>> addMessage(
            @PathVariable Long ticketId,
            @Valid @RequestBody CreateMessageRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        MessageResponse message = messageService.addMessage(ticketId, request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(messageUtil.get("success.message.created"), message));
    }

    @GetMapping
    @Operation(summary = "Get all messages for a ticket",
            description = "Clients only see messages from their own tickets." +
                    "Agents can only see messages on their created or assigned tickets. Admins can see all messages.")
    public ResponseEntity<ApiResponse<List<MessageResponse>>> getMessages(
            @PathVariable Long ticketId,
            @AuthenticationPrincipal UserDetails userDetails) {
        List<MessageResponse> messages = messageService.getMessagesByTicket(ticketId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(messageUtil.get("success.message.list.fetched"), messages));
    }

    @DeleteMapping("/{messageId}")
    @Operation(summary = "Delete a message",
            description = "Only the message sender or an Admin can delete a message.")
    public ResponseEntity<ApiResponse<Void>> deleteMessage(
            @PathVariable Long ticketId,
            @PathVariable Long messageId,
            @AuthenticationPrincipal UserDetails userDetails) {
        messageService.deleteMessage(messageId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(messageUtil.get("success.message.deleted")));
    }
}