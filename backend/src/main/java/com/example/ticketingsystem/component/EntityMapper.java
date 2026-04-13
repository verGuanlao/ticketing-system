package com.example.ticketingsystem.component;

import com.example.ticketingsystem.dto.response.CategoryResponse;
import com.example.ticketingsystem.dto.response.MessageResponse;
import com.example.ticketingsystem.dto.response.TicketResponse;
import com.example.ticketingsystem.dto.response.UserResponse;
import com.example.ticketingsystem.model.Category;
import com.example.ticketingsystem.model.Message;
import com.example.ticketingsystem.model.Ticket;
import com.example.ticketingsystem.model.User;
import com.example.ticketingsystem.model.enums.Priority;
import lombok.experimental.UtilityClass;

@UtilityClass
public class EntityMapper {

    public static UserResponse toUserResponse(User user) {
        if (user == null) return null;
        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus())
                .fullName(user.getFullName())
                .build();
    }

    public static CategoryResponse toCategoryResponse(Category category) {
        if (category == null) return null;
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .build();
    }

    public static TicketResponse toTicketResponse(Ticket ticket) {
        if (ticket == null) return null;
        String priorityLabel;
        try {
            priorityLabel = Priority.fromValue(ticket.getPriority()).name();
        } catch (IllegalArgumentException e) {
            priorityLabel = "UNKNOWN";
        }
        return TicketResponse.builder()
                .id(ticket.getId())
                .title(ticket.getTitle())
                .description(ticket.getDescription())
                .priority(ticket.getPriority())
                .priorityLabel(priorityLabel)
                .status(ticket.getStatus())
                .createdDate(ticket.getCreatedDate())
                .resolvedDate(ticket.getResolvedDate())
                .category(toCategoryResponse(ticket.getCategory()))
                .createdBy(toUserResponse(ticket.getCreatedBy()).getFullName())
                .assignedAgent(ticket.getAssignedAgent() != null ? toUserResponse(ticket.getAssignedAgent()).getFullName() : null)
                .build();
    }

    public static MessageResponse toMessageResponse(Message message) {
        if (message == null) return null;
        return MessageResponse.builder()
                .id(message.getId())
                .text(message.getText())
                .timestamp(message.getTimestamp())
                .ticketId(message.getTicket().getId())
                .sender(toUserResponse(message.getSender()).getFullName())
                .build();
    }
}