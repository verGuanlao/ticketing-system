package com.example.ticketingsystem.model;

import com.example.ticketingsystem.model.enums.Role;
import com.example.ticketingsystem.model.enums.Status;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "first_name", nullable = false, length = 45)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 45)
    private String lastName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password", nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 45)
    @Builder.Default
    private Role role = Role.CLIENT;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 45)
    @Builder.Default
    private Status status  = Status.INACTIVE;

    @OneToMany(mappedBy = "createdBy")
    private List<Ticket> createdTickets;

    @OneToMany(mappedBy = "assignedAgent")
    private List<Ticket> assignedTickets;

    public String getFullName() {
        return firstName + " " + lastName;
    }
}