package com.example.ticketingsystem.service;


import com.example.ticketingsystem.dto.request.LoginRequest;
import com.example.ticketingsystem.dto.request.RegisterRequest;
import com.example.ticketingsystem.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}