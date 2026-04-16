package com.example.ticketingsystem.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AgentPerformanceResponse {
    private UserResponse agent;
    private long totalAssigned;
    private long activeTickets;
    private long resolvedTickets;
    private long closedTickets;
    private Double averageResolutionTimeHours;
    private long workload;
}