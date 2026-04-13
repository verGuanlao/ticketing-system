package com.example.ticketingsystem.service;

import com.example.ticketingsystem.dto.request.CreateMessageRequest;
import com.example.ticketingsystem.dto.response.MessageResponse;

import java.util.List;

public interface MessageService {
    MessageResponse addMessage(Long ticketId, CreateMessageRequest request, String currentUserEmail);
    List<MessageResponse> getMessagesByTicket(Long ticketId, String currentUserEmail);
    void deleteMessage(Long messageId, String currentUserEmail);
}
