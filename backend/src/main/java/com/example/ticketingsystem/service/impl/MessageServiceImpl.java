package com.example.ticketingsystem.service.impl;

import com.example.ticketingsystem.component.EntityMapper;
import com.example.ticketingsystem.component.MessageUtil;
import com.example.ticketingsystem.dto.request.CreateMessageRequest;
import com.example.ticketingsystem.dto.response.MessageResponse;
import com.example.ticketingsystem.exception.AccessDeniedException;
import com.example.ticketingsystem.exception.InvalidOperationException;
import com.example.ticketingsystem.exception.ResourceNotFoundException;
import com.example.ticketingsystem.model.Message;
import com.example.ticketingsystem.model.Ticket;
import com.example.ticketingsystem.model.User;
import com.example.ticketingsystem.model.enums.Role;
import com.example.ticketingsystem.model.enums.TicketStatus;
import com.example.ticketingsystem.repository.MessageRepository;
import com.example.ticketingsystem.service.MessageService;
import com.example.ticketingsystem.service.TicketService;
import com.example.ticketingsystem.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;
    private final TicketService ticketService;
    private final UserService userService;
//    private final EmailService emailService;
    private final MessageUtil messageUtil;

    /**
     * TicketService is injected lazily to break the potential Spring circular
     * dependency:  TicketService → EmailService and MessageService → TicketService
     * can form a cycle through shared dependencies.  @Lazy defers proxy creation
     * until the first actual method call, after all beans are initialized.
     */
    public MessageServiceImpl(
            MessageRepository messageRepository,
            @Lazy TicketService ticketService,
            UserService userService,
//            EmailService emailService,
            MessageUtil messageUtil) {
        this.messageRepository = messageRepository;
        this.ticketService     = ticketService;
        this.userService       = userService;
//        this.emailService      = emailService;
        this.messageUtil       = messageUtil;
    }

    @Override
    @Transactional
    public MessageResponse addMessage(Long ticketId, CreateMessageRequest request, String currentUserEmail) {
        Ticket ticket = ticketService.getTicketEntityById(ticketId);
        User sender = userService.getUserEntityByEmail(currentUserEmail);

        if (ticket.getStatus() == TicketStatus.CLOSED) {
            throw new InvalidOperationException(messageUtil.get("error.message.ticket.closed"));
        }

        // Clients can only message on their own tickets
        if (sender.getRole() == Role.CLIENT
                && !ticket.getCreatedBy().getId().equals(sender.getId())) {
            throw new AccessDeniedException(messageUtil.get("error.ticket.access.denied"));
        }

        // Agents can only message on their created or assigned tickets
        if (sender.getRole() == Role.SUPPORT_AGENT) {
            if (ticket.getAssignedAgent() == null
                    || (!ticket.getAssignedAgent().getId().equals(sender.getId()) &&
                    !ticket.getCreatedBy().getId().equals(sender.getId()))) {
                throw new AccessDeniedException(messageUtil.get("error.ticket.access.denied"));
            }
        }

        Message message = Message.builder()
                .text(request.getText().trim())
                .timestamp(LocalDateTime.now())
                .ticket(ticket)
                .sender(sender)
                .build();

        messageRepository.save(message);
//        emailService.sendNewMessageNotification(ticket, sender, message.getText());
        log.info("Message added to ticket {} by {}", ticketId, currentUserEmail);
        return EntityMapper.toMessageResponse(message);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MessageResponse> getMessagesByTicket(Long ticketId, String currentUserEmail) {
        Ticket ticket      = ticketService.getTicketEntityById(ticketId);
        User   currentUser = userService.getUserEntityByEmail(currentUserEmail);

        // Clients can only view messages on their own tickets
        if (currentUser.getRole() == Role.CLIENT
                && !ticket.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException(messageUtil.get("error.ticket.access.denied"));
        }

        // Agents can only view messages on their created or assigned tickets
        if (currentUser.getRole() == Role.SUPPORT_AGENT) {
            if (ticket.getAssignedAgent() == null
                    || (!ticket.getAssignedAgent().getId().equals(currentUser.getId()) &&
                    !ticket.getCreatedBy().getId().equals(currentUser.getId()))) {
                throw new AccessDeniedException(messageUtil.get("error.ticket.access.denied"));
            }
        }

        return messageRepository.findByTicketIdOrderByTimestampAsc(ticketId).stream()
                .map(EntityMapper::toMessageResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteMessage(Long messageId, String currentUserEmail) {
        Message message  = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        messageUtil.get("error.message.not.found", messageId)));

        User currentUser = userService.getUserEntityByEmail(currentUserEmail);

        boolean isSender = message.getSender().getId().equals(currentUser.getId());
        boolean isAdmin  = currentUser.getRole() == Role.ADMIN;

        if (!isSender && !isAdmin) {
            throw new AccessDeniedException(messageUtil.get("error.message.access.denied"));
        }

        messageRepository.delete(message);
        log.info("Message {} deleted by {}", messageId, currentUserEmail);
    }
}