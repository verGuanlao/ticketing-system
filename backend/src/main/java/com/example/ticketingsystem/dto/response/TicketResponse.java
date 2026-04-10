package com.example.ticketingsystem.dto.response;

import com.example.ticketingsystem.model.enums.TicketStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TicketResponse {
    private Long id;
    private String title;
    private String description;
    private Integer priority;
    private String priorityLabel;
    private TicketStatus status;
    private LocalDateTime createdDate;
    private LocalDateTime resolvedDate;
    private CategoryResponse category;
    private String createdBy;
    private String assignedAgent;
}