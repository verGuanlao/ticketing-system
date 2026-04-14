package com.example.ticketingsystem.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class MessageResponse {
    private Long id;
    private String text;
    private LocalDateTime timestamp;
    private Long ticketId;
    private UserResponse sender;
}
