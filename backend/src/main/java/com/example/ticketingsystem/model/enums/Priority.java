package com.example.ticketingsystem.model.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum Priority {
    LOW(1),
    MEDIUM(2),
    HIGH(3),
    CRITICAL(4);

    private final int value;

    public static Priority fromValue(int value) {
        for (Priority p : values()) {
            if (p.value == value) return p;
        }
        throw new IllegalArgumentException("Invalid priority value: " + value);
    }
}