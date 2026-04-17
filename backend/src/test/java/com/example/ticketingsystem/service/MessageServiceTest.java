package com.example.ticketingsystem.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import com.example.ticketingsystem.component.MessageUtil;
import com.example.ticketingsystem.dto.request.CreateMessageRequest;
import com.example.ticketingsystem.dto.response.MessageResponse;
import com.example.ticketingsystem.exception.AccessDeniedException;
import com.example.ticketingsystem.exception.InvalidOperationException;
import com.example.ticketingsystem.model.Message;
import com.example.ticketingsystem.model.Ticket;
import com.example.ticketingsystem.model.User;
import com.example.ticketingsystem.model.enums.Role;
import com.example.ticketingsystem.model.enums.TicketStatus;
import com.example.ticketingsystem.repository.MessageRepository;
import com.example.ticketingsystem.service.impl.MessageServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("MessageService Tests")
class MessageServiceTest {

    @Mock private MessageRepository messageRepository;
    @Mock private TicketService ticketService;
    @Mock private UserService userService;
    @Mock private EmailService emailService;
    @Mock private MessageUtil messageUtil;

    @InjectMocks
    private MessageServiceImpl messageService;

    private User client;
    private User agent;
    private Ticket ticket;
    private Message message;

    private CreateMessageRequest request;

    @BeforeEach
    void setUp() {
        client = User.builder().id(1L).email("client@test.com").role(Role.CLIENT).firstName("Client").lastName("User").build();
        agent = User.builder().id(2L).email("agent@test.com").role(Role.SUPPORT_AGENT).firstName("Agent").lastName("Smith").build();

        ticket = Ticket.builder()
                .id(100L)
                .title("Issue")
                .status(TicketStatus.OPEN)
                .createdBy(client)
                .assignedAgent(agent)
                .build();

        request = new CreateMessageRequest();
        request.setText("Hello World");

        message = Message.builder().id(1L).text("Hello World").timestamp(LocalDateTime.now()).ticket(ticket).sender(agent).build();

    }

    @Nested
    @DisplayName("Add Message Tests")
    class AddMessageTests {

        @Test
        @DisplayName("Should save message and notify agent when client sends message")
        void addMessage_Success_ClientSender() {
            when(ticketService.getTicketEntityById(100L)).thenReturn(ticket);
            when(userService.getUserEntityByEmail(client.getEmail())).thenReturn(client);

            messageService.addMessage(100L, request, client.getEmail());

            verify(messageRepository).save(any(Message.class));
            // Verify notification goes to the agent
            verify(emailService).sendNewMessageNotification(
                    eq(agent.getFullName()), eq(agent.getEmail()), any(), any(), any(), eq("Hello World")
            );
        }

        @Test
        @DisplayName("Should throw exception when ticket is CLOSED")
        void addMessage_Fail_TicketClosed() {
            ticket.setStatus(TicketStatus.CLOSED);
            when(ticketService.getTicketEntityById(100L)).thenReturn(ticket);

            assertThrows(InvalidOperationException.class, () ->
                    messageService.addMessage(100L, request, client.getEmail()));
        }

        @Test
        @DisplayName("Should prevent agent from messaging on tickets they don't own/assigned")
        void addMessage_Fail_UnauthorizedAgent() {
            User otherAgent = User.builder().id(3L).role(Role.SUPPORT_AGENT).build();
            when(ticketService.getTicketEntityById(100L)).thenReturn(ticket);
            when(userService.getUserEntityByEmail("other@agent.com")).thenReturn(otherAgent);

            assertThrows(AccessDeniedException.class, () ->
                    messageService.addMessage(100L, request, "other@agent.com"));
        }
    }

    @Nested
    @DisplayName("Get Message Tests")
    class GetMessageTests {

        @Test
        @DisplayName("Should return list of messages for authorized user")
        void getMessages_Success() {
            when(ticketService.getTicketEntityById(100L)).thenReturn(ticket);
            when(userService.getUserEntityByEmail(client.getEmail())).thenReturn(client);
            when(messageRepository.findByTicketIdOrderByTimestampAsc(100L)).thenReturn(List.of(message));

            List<MessageResponse> results = messageService.getMessagesByTicket(100L, client.getEmail());

            assertFalse(results.isEmpty());
            verify(messageRepository).findByTicketIdOrderByTimestampAsc(100L);
        }

        @Test
        @DisplayName("Should throw AccessDenied for client viewing someone else's ticket")
        void getMessages_Fail_Unauthorized() {
            User intruder = User.builder().id(99L).role(Role.CLIENT).build();
            when(ticketService.getTicketEntityById(100L)).thenReturn(ticket);
            when(userService.getUserEntityByEmail("intruder@test.com")).thenReturn(intruder);

            assertThrows(AccessDeniedException.class, () ->
                    messageService.getMessagesByTicket(100L, "intruder@test.com"));
        }
    }

    @Nested
    @DisplayName("Delete Message Tests")
    class DeleteMessageTests {

        private Message testMessage;

        @BeforeEach
        void setupMessage() {
            testMessage = Message.builder().id(500L).sender(client).build();
        }

        @Test
        @DisplayName("Sender should be allowed to delete their own message")
        void deleteMessage_Success_Sender() {
            when(messageRepository.findById(500L)).thenReturn(Optional.of(testMessage));
            when(userService.getUserEntityByEmail(client.getEmail())).thenReturn(client);

            messageService.deleteMessage(500L, client.getEmail());

            verify(messageRepository).delete(testMessage);
        }

        @Test
        @DisplayName("Admin should be allowed to delete any message")
        void deleteMessage_Success_Admin() {
            User admin = User.builder().id(10L).role(Role.ADMIN).build();
            when(messageRepository.findById(500L)).thenReturn(Optional.of(testMessage));
            when(userService.getUserEntityByEmail("admin@test.com")).thenReturn(admin);

            messageService.deleteMessage(500L, "admin@test.com");

            verify(messageRepository).delete(testMessage);
        }

        @Test
        @DisplayName("Should throw AccessDenied when unauthorized user tries to delete")
        void deleteMessage_Fail_Unauthorized() {
            when(messageRepository.findById(500L)).thenReturn(Optional.of(testMessage));
            when(userService.getUserEntityByEmail(agent.getEmail())).thenReturn(agent);

            assertThrows(AccessDeniedException.class, () ->
                    messageService.deleteMessage(500L, agent.getEmail()));
        }
    }
}