package com.example.ticketingsystem.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class ReportResponse {
    private long totalTickets;
    private long openTickets;
    private long inProgressTickets;
    private long resolvedTickets;
    private long closedTickets;
    private Double averageResolutionTimeHours;
    private Map<String, Long> ticketsByCategory;
    private Map<String, Long> ticketsByPriority;
}