package com.example.ticketingsystem.controller;

import com.example.ticketingsystem.component.MessageUtil;
import com.example.ticketingsystem.dto.response.AgentPerformanceResponse;
import com.example.ticketingsystem.dto.response.ApiResponse;
import com.example.ticketingsystem.dto.response.ReportResponse;
import com.example.ticketingsystem.service.ReportService;
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
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Reports", description = "Reporting and analytics endpoints — Admin only")
@SecurityRequirement(name = "bearerAuth")
public class ReportController {

    private final ReportService reportService;
    private final MessageUtil messageUtil;

    @GetMapping("/overview")
    @Operation(summary = "Overall system report",
            description = "Returns ticket counts by status, category, priority, average resolution time, and agent performance.")
    public ResponseEntity<ApiResponse<ReportResponse>> getOverallReport() {
        ReportResponse report = reportService.getOverallReport();
        return ResponseEntity.ok(ApiResponse.success(messageUtil.get("success.report.fetched"), report));
    }

    @GetMapping("/agents")
    @Operation(summary = "Agent performance report",
            description = "Returns performance metrics for all support agents")
    public ResponseEntity<ApiResponse<List<AgentPerformanceResponse>>> getAgentPerformance() {
        List<AgentPerformanceResponse> report = reportService.getAgentPerformanceReport();
        return ResponseEntity.ok(ApiResponse.success(messageUtil.get("success.report.fetched"), report));
    }

    @GetMapping("/agents/{agentId}")
    @Operation(summary = "Single agent performance report",
            description = "Returns performance metrics for a specific support agent.")
    public ResponseEntity<ApiResponse<AgentPerformanceResponse>> getAgentPerformanceById(
            @PathVariable Long agentId) {
        AgentPerformanceResponse report = reportService.getAgentPerformanceById(agentId);
        return ResponseEntity.ok(ApiResponse.success(messageUtil.get("success.report.fetched"), report));
    }
}