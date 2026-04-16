package com.example.ticketingsystem.service;

import com.example.ticketingsystem.model.Ticket;
import com.example.ticketingsystem.model.User;
import com.example.ticketingsystem.model.enums.TicketStatus;

public interface EmailService {
    void sendTicketCreatedNotification(Long ticketId, String createdBy, String title, TicketStatus status, int priority, String email);
    void sendTicketUpdatedNotification(Long ticketId, String createdBy, String title, TicketStatus ticketStatus, String email);
    void sendTicketAssignedNotification(Long ticketId, String assignedAgent, String title, int priority, String createdBy, String assignedEmail, String createdByEmail);
    void sendTicketStatusUpdatedNotification(Long ticketId, TicketStatus status, String title, String createdBy, String email);
    void sendNewMessageNotification(String recipientName, String recipientEmail, Long ticketId, String title, String sender, String messageText);
}
