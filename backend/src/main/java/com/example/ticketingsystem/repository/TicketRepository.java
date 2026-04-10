package com.example.ticketingsystem.repository;

import com.example.ticketingsystem.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByStatus(String status);

    List<Ticket> findByCreatedById(Long userId);

    List<Ticket> findByAssignedAgentId(Long agentId);

    List<Ticket> findByPriority(Integer priority);
}