package com.example.ticketingsystem.controller;

import com.example.ticketingsystem.dto.response.AgentPerformanceResponse;
import com.example.ticketingsystem.dto.response.ApiResponse;
import com.example.ticketingsystem.dto.response.ReportResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Reports", description = "Reporting and analytics endpoints — Admin only")
@SecurityRequirement(name = "bearerAuth")
public class ReportController {

    @GetMapping("/overview")
    @Operation(summary = "Overall system report",
            description = "Returns ticket counts by status, category, priority, average resolution time, and agent performance." +
                    "Can be filtered by month and year")
    public ResponseEntity<ApiResponse<ReportResponse>> getOverallReport() {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }

    @GetMapping("/agents")
    @Operation(summary = "Agent performance report",
            description = "Returns performance metrics for all support agents. Can be filtered by month and year")
    public ResponseEntity<ApiResponse<List<AgentPerformanceResponse>>> getAgentPerformance() {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }

    @GetMapping("/agents/{agentId}")
    @Operation(summary = "Single agent performance report",
            description = "Returns performance metrics for a specific support agent. Can be filtered by month and year")
    public ResponseEntity<ApiResponse<AgentPerformanceResponse>> getAgentPerformanceById(
            @PathVariable Long agentId) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }
}