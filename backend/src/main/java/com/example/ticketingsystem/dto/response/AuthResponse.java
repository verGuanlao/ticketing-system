package com.example.ticketingsystem.dto.response;

import com.example.ticketingsystem.model.enums.Role;

public class AuthResponse {
    private Long userId;
    private String email;
    private String fullName;
    private Role role;
}
