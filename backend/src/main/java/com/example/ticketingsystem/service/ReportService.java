package com.example.ticketingsystem.service;

import com.example.ticketingsystem.dto.response.AgentPerformanceResponse;
import com.example.ticketingsystem.dto.response.ReportResponse;

import java.util.List;

public interface ReportService {
    ReportResponse getOverallReport();
    List<AgentPerformanceResponse> getAgentPerformanceReport();
    AgentPerformanceResponse getAgentPerformanceById(Long agentId, String email);
}
