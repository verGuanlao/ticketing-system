package com.example.ticketingsystem.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class AssignTicketRequest {

    @NotNull(message = "Agent ID is required")
    @Positive(message = "Agent ID must be a positive number")
    private Long agentId;
}