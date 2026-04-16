package com.example.ticketingsystem.service.impl;

import com.example.ticketingsystem.model.Ticket;
import com.example.ticketingsystem.model.User;
import com.example.ticketingsystem.model.enums.TicketStatus;
import com.example.ticketingsystem.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.from}")
    private String fromEmail;

    @Value("${spring.mail.to}")
    private String testToEmail;

    @Override
    @Async
    public void sendTicketCreatedNotification(Long ticketId, String createdBy, String title, TicketStatus status, int priority, String email) {
        try {
            String subject = "[Ticket #" + ticketId + "] Your ticket has been created";
            String body = String.format(
                    "Dear %s,%n%nYour ticket has been created successfully.%n%n" +
                            "Title: %s%nStatus: %s%nPriority: %s%n%nWe will get back to you shortly.%n%nTicketing System",
                    createdBy,
                    title,
                    status,
                    priority
            );
            sendEmail(email, subject, body);
        } catch (Exception e) {
            log.error("Failed to send ticket created notification: {}", e.getMessage());
        }
    }

    @Override
    @Async
    public void sendTicketUpdatedNotification(Long ticketId, String createdBy, String title, TicketStatus ticketStatus, String email) {
        try {
            String subject = "[Ticket #" + ticketId + "] Your ticket has been updated";
            String body = String.format(
                    "Dear %s,%n%nYour ticket '%s' has been updated.%n%nStatus: %s%n%nTicketing System",
                    createdBy,
                    title,
                    ticketStatus
            );
            sendEmail(email, subject, body);
        } catch (Exception e) {
            log.error("Failed to send ticket updated notification: {}", e.getMessage());
        }
    }

    @Override
    @Async
    public void sendTicketAssignedNotification(Long ticketId, String assignedAgent, String title, int priority,
                                               String createdBy, String assignedEmail, String createdByEmail) {
        try {

            // Notify agent
            String agentSubject = "[Ticket #" + ticketId + "] New ticket assigned to you";
            String agentBody = String.format(
                    "Dear %s,%n%nTicket #%d has been assigned to you.%n%n" +
                            "Title: %s%nPriority: %s%nClient: %s%n%nPlease review and take action.%n%nTicketing System",
                    assignedAgent,
                    ticketId,
                    title,
                    priority,
                    createdBy
            );
            sendEmail(assignedEmail, agentSubject, agentBody);

            // Notify client
            String clientSubject = "[Ticket #" + ticketId + "] Your ticket has been assigned";
            String clientBody = String.format(
                    "Dear %s,%n%nYour ticket '%s' has been assigned to an agent and is now In Progress.%n%nTicketing System",
                    createdBy,
                    title
            );
            sendEmail(createdByEmail, clientSubject, clientBody);
        } catch (Exception e) {
            log.error("Failed to send ticket assigned notification: {}", e.getMessage());
        }
    }

    @Override
    @Async
    public void sendTicketStatusUpdatedNotification(Long ticketId, TicketStatus status, String title, String createdBy, String email) {
        try {
            String subject = "[Ticket #" + ticketId + "] Status updated to " + status;
            String body = String.format(
                    "Dear %s,%n%nThe status of your ticket '%s' has been updated to: %s%n%nTicketing System",
                    createdBy,
                    title,
                    status
            );
            sendEmail(email, subject, body);
        } catch (Exception e) {
            log.error("Failed to send status update notification: {}", e.getMessage());
        }
    }

    @Override
    @Async
    public void sendNewMessageNotification(String recipientName, String recipientEmail, Long ticketId, String title, String sender, String messageText) {
        try {
            String subject = "[Ticket #" + ticketId + "] New message from " + sender;
            String body = String.format(
                    "Dear %s,%n%nA new message was posted on ticket #%d ('%s'):%n%n\"%s\"%n%nTicketing System",
                    recipientName,
                    ticketId,
                    title,
                    messageText
            );
            sendEmail(recipientEmail, subject, body);
        } catch (Exception e) {
            log.error("Failed to send new message notification: {}", e.getMessage());
        }
    }

    private void sendEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        // TO DO: change msessage.setTo to 'to' in production
        message.setFrom(fromEmail);
        message.setTo(testToEmail);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
        log.debug("Email sent to {}: {}", to, subject);
    }
}
