package com.placementportal.controller;

import com.placementportal.dto.ApiResponse;
import com.placementportal.dto.ProfileDto;
import com.placementportal.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    public ResponseEntity<ApiResponse> getProfile() {
        ProfileDto profile = profileService.getProfile();
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved", profile));
    }

    @PutMapping
    public ResponseEntity<ApiResponse> updateProfile(@RequestBody ProfileDto dto) {
        ProfileDto profile = profileService.updateProfile(dto);
        return ResponseEntity.ok(ApiResponse.success("Profile updated", profile));
    }

    @PostMapping("/resume")
    public ResponseEntity<ApiResponse> uploadResume(@RequestParam("file") MultipartFile file) {
        try {
            String path = profileService.uploadResume(file);
            return ResponseEntity.ok(ApiResponse.success("Resume uploaded successfully", path));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Upload failed: " + e.getMessage()));
        }
    }
}
