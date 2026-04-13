package com.example.ticketingsystem.repository;

import com.example.ticketingsystem.model.Ticket;
import com.example.ticketingsystem.model.enums.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByCreatedById(Long userId);
    List<Ticket> findByAssignedAgentId(Long agentId);
    List<Ticket> findByStatus(TicketStatus status);
    List<Ticket> findByPriority(Integer priority);
    List<Ticket> findByCategoryId(Long categoryId);
    List<Ticket> findByAssignedAgentIdAndStatusNotIn(Long agentId, List<TicketStatus> statuses);

    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.status = :status")
    long countByStatus(@Param("status") TicketStatus status);

    @Query("SELECT AVG(TIMESTAMPDIFF(SECOND, t.createdDate, t.resolvedDate)) FROM Ticket t WHERE t.resolvedDate IS NOT NULL")
    Double getAverageResolutionTimeInSeconds();

    @Query("SELECT t FROM Ticket t WHERE t.assignedAgent.id = :agentId AND t.status NOT IN ('RESOLVED', 'CLOSED')")
    List<Ticket> findActiveTicketsByAgent(@Param("agentId") Long agentId);

    @Query("SELECT COALESCE(SUM(t.priority), 0) FROM Ticket t " +
            "WHERE t.assignedAgent.id = :agentId AND t.status NOT IN ('RESOLVED', 'CLOSED')")
    long countActiveTicketsByAgent(@Param("agentId") Long agentId);

    @Query("SELECT t FROM Ticket t WHERE t.createdDate BETWEEN :from AND :to")
    List<Ticket> findByCreatedDateBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT t.assignedAgent.id, COALESCE(SUM(t.priority), 0) as workload " +
            "FROM Ticket t WHERE t.assignedAgent IS NOT NULL AND t.status NOT IN ('RESOLVED', 'CLOSED') " +
            "GROUP BY t.assignedAgent.id ORDER BY workload ASC")
    List<Object[]> findAgentWorkloadStats();
}