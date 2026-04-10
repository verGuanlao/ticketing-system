package com.example.ticketingsystem.dto.request;

import com.example.ticketingsystem.model.enums.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class CreateUserRequest extends RegisterRequest{
    @NotNull(message = "Role is required")
    private Role role;
}
