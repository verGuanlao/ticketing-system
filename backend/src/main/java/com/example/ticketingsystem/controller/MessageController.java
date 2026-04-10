package com.example.ticketingsystem.controller;

import com.example.ticketingsystem.dto.request.CreateMessageRequest;
import com.example.ticketingsystem.dto.response.ApiResponse;
import com.example.ticketingsystem.dto.response.MessageResponse;
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


    @PostMapping
    @Operation(summary = "Add message to ticket",
            description = "Clients can message on their own tickets; Agents on their assigned tickets; Admins on any.")
    public ResponseEntity<ApiResponse<MessageResponse>> addMessage(
            @PathVariable Long ticketId,
            @Valid @RequestBody CreateMessageRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }

    @GetMapping
    @Operation(summary = "Get all messages for a ticket",
            description = "Clients only see messages from their own tickets.")
    public ResponseEntity<ApiResponse<List<MessageResponse>>> getMessages(
            @PathVariable Long ticketId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }

    @DeleteMapping("/{messageId}")
    @Operation(summary = "Delete a message",
            description = "Only the message sender or an Admin can delete a message.")
    public ResponseEntity<ApiResponse<Void>> deleteMessage(
            @PathVariable Long ticketId,
            @PathVariable Long messageId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }
}