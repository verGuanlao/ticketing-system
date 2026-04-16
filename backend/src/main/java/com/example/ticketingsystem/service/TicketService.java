package com.example.ticketingsystem.service;

import com.example.ticketingsystem.dto.request.AssignTicketRequest;
import com.example.ticketingsystem.dto.request.CreateTicketRequest;
import com.example.ticketingsystem.dto.request.UpdateTicketRequest;
import com.example.ticketingsystem.dto.response.TicketResponse;
import com.example.ticketingsystem.model.Ticket;
import com.example.ticketingsystem.model.enums.TicketStatus;

import java.util.List;

public interface TicketService {
    TicketResponse createTicket(CreateTicketRequest request, String currentUserEmail);
    TicketResponse getTicketById(Long id, String currentUserEmail);
    List<TicketResponse> getAllTickets();
    List<TicketResponse> getTicketsByCurrentUser(String currentUserEmail);
    List<TicketResponse> getAssignedTickets(String currentUserEmail);
    List<TicketResponse> getTicketsByAgent(Long agentId);
    List<TicketResponse> getTicketsByStatus(TicketStatus status);
    TicketResponse updateTicket(Long id, UpdateTicketRequest request, String currentUserEmail);
    TicketResponse assignTicket(Long ticketId, AssignTicketRequest request, String currentUserEmail);
    TicketResponse autoAssignTicket(Long ticketId, String currentUserEmail);
    TicketResponse updateTicketStatus(Long id, TicketStatus status, String currentUserEmail);
    void deleteTicket(Long id, String currentUserEmail);

    TicketResponse requestReassignment(Long ticketId, String currentUserEmail);

    // ── Helpers ──────────────────────────────────
    Ticket getTicketEntityById(Long id);
    Long getAgentWorkload(Long agendId);
}