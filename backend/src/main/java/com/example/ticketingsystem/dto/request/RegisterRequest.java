package com.example.ticketingsystem.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 45, message = "First name must be between 2 and 45 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 45, message = "Last name must be between 2 and 45 characters")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;
}
