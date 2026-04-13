package com.example.ticketingsystem.model;

import com.example.ticketingsystem.model.enums.TicketStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "tickets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;

    @Column(nullable = false)
    @Builder.Default
    private Integer priority = 1;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 45)
    @Builder.Default
    private TicketStatus status = TicketStatus.OPEN;

    @Column(name = "created_date", nullable = false)
    private LocalDateTime createdDate;

    @Column(name = "resolved_date")
    private LocalDateTime resolvedDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_agent")
    private User assignedAgent;

    @OneToMany(mappedBy = "ticket", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @ToString.Exclude
    private List<Message> messages;

    @PrePersist
    protected void onCreate() {
        createdDate = LocalDateTime.now();
    }
}