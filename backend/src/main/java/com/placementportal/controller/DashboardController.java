package com.placementportal.controller;

import com.placementportal.dto.ApiResponse;
import com.placementportal.dto.DashboardDto;
import com.placementportal.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/student")
    public ResponseEntity<ApiResponse> getStudentDashboard() {
        DashboardDto.StudentDashboard dashboard = dashboardService.getStudentDashboard();
        return ResponseEntity.ok(ApiResponse.success("Dashboard data retrieved", dashboard));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getAdminDashboard() {
        DashboardDto.AdminDashboard dashboard = dashboardService.getAdminDashboard();
        return ResponseEntity.ok(ApiResponse.success("Admin dashboard retrieved", dashboard));
    }
}
