package com.example.ticketingsystem.service.impl;

import com.example.ticketingsystem.component.MessageUtil;
import com.example.ticketingsystem.config.JwtService;
import com.example.ticketingsystem.dto.request.LoginRequest;
import com.example.ticketingsystem.dto.request.RegisterRequest;
import com.example.ticketingsystem.dto.response.AuthResponse;
import com.example.ticketingsystem.exception.DuplicateResourceException;
import com.example.ticketingsystem.exception.ResourceNotFoundException;
import com.example.ticketingsystem.exception.UnauthorizedException;
import com.example.ticketingsystem.model.User;
import com.example.ticketingsystem.model.enums.Role;
import com.example.ticketingsystem.model.enums.Status;
import com.example.ticketingsystem.repository.UserRepository;
import com.example.ticketingsystem.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final MessageUtil messageUtil;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Validate email uniqueness
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException(
                    messageUtil.get("error.user.email.already.exists"));
        }

        User user = User.builder()
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .email(request.getEmail().toLowerCase().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.CLIENT)
                .status(Status.ACTIVE)
                .build();

        userRepository.save(user);
        log.info("New user registered: {}", user.getEmail());

        return buildAuthResponse(user, "");
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail().toLowerCase().trim(),
                            request.getPassword()
                    )
            );
        } catch (AuthenticationException e) {
            throw new BadCredentialsException(messageUtil.get("error.auth.invalid.credentials"));
        }

        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new ResourceNotFoundException(
                        messageUtil.get("error.user.email.not.found", request.getEmail())));

        // Check if user is active
        if (user.getStatus() != Status.ACTIVE) {
            throw new UnauthorizedException(messageUtil.get("error.user.inactive"));
        }

        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());
        log.info("User logged in: {}", user.getEmail());
        return buildAuthResponse(user, token);
    }

    private AuthResponse buildAuthResponse(User user, String token) {
        return AuthResponse.builder()
                .accessToken(token)
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build();
    }
}
