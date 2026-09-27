package com.placementportal.controller;

import com.placementportal.dto.ApiResponse;
import com.placementportal.model.User;
import com.placementportal.repository.UserRepository;
import com.placementportal.service.DashboardService;
import com.placementportal.service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final DashboardService dashboardService;
    private final QuizService quizService;

    @GetMapping("/users")
    public ResponseEntity<ApiResponse> getAllUsers() {
        List<Map<String, Object>> users = userRepository.findAll().stream()
                .map(user -> Map.<String, Object>of(
                        "id", user.getId(),
                        "email", user.getEmail(),
                        "fullName", user.getFullName(),
                        "role", user.getRole().name(),
                        "createdAt", user.getCreatedAt().toString()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Users retrieved", users));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<ApiResponse> updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(User.Role.valueOf(request.get("role")));
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("Role updated"));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted"));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success("Dashboard retrieved", dashboardService.getAdminDashboard()));
    }
}
