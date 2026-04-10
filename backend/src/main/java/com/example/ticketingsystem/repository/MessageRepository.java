package com.example.ticketingsystem.repository;

import com.example.ticketingsystem.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByTicketIdOrderByTimestampAsc(Long ticketId);
}