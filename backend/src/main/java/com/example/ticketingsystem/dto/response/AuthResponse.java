package com.example.ticketingsystem.dto.response;

import com.example.ticketingsystem.model.enums.Role;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    @JsonIgnore
    private String accessToken;

    private Long userId;
    private String email;
    private String fullName;
    private Role role;
}
