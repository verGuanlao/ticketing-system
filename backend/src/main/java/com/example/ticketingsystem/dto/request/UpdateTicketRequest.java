package com.example.ticketingsystem.dto.request;

import com.example.ticketingsystem.model.enums.TicketStatus;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class UpdateTicketRequest {

    @Size(min = 3, max = 45, message = "Title must be between 3 and 45 characters")
    private String title;

    @Size(max = 255, message = "Description must not exceed 255 characters")
    private String description;

    @Min(value = 1, message = "Priority must be at least 1 (Low)")
    @Max(value = 4, message = "Priority must be at most 4 (Critical)")
    private Integer priority;

    private TicketStatus status;

    @Positive(message = "Category ID must be a positive number")
    private Long categoryId;
}
