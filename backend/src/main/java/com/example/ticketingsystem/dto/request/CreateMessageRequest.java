package com.example.ticketingsystem.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateMessageRequest {

    @NotBlank(message = "Message text is required")
    @Size(min = 1, max = 255, message = "Message must be between 1 and 255 characters")
    private String text;
}