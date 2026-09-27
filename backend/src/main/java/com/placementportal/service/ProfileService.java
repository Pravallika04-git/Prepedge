package com.placementportal.service;

import com.placementportal.dto.ProfileDto;
import com.placementportal.model.StudentProfile;
import com.placementportal.model.User;
import com.placementportal.repository.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final StudentProfileRepository profileRepository;
    private final AuthService authService;

    @Value("${app.upload.dir}")
    private String uploadDir;

    public ProfileDto getProfile() {
        User user = authService.getCurrentUser();
        StudentProfile profile = profileRepository.findByUserId(user.getId())
                .orElse(StudentProfile.builder().user(user).build());
        return mapToDto(profile, user);
    }

    @Transactional
    public ProfileDto updateProfile(ProfileDto dto) {
        User user = authService.getCurrentUser();
        StudentProfile profile = profileRepository.findByUserId(user.getId())
                .orElse(StudentProfile.builder().user(user).build());

        profile.setCollege(dto.getCollege());
        profile.setBranch(dto.getBranch());
        profile.setGraduationYear(dto.getGraduationYear());
        profile.setPhone(dto.getPhone());
        profile.setSkills(dto.getSkills());
        profile.setBio(dto.getBio());
        profile.setLinkedinUrl(dto.getLinkedinUrl());
        profile.setGithubUrl(dto.getGithubUrl());

        profile = profileRepository.save(profile);
        return mapToDto(profile, user);
    }

    @Transactional
    public String uploadResume(MultipartFile file) throws IOException {
        User user = authService.getCurrentUser();
        StudentProfile profile = profileRepository.findByUserId(user.getId())
                .orElse(StudentProfile.builder().user(user).build());

        Path uploadPath = Paths.get(uploadDir, "resumes");
        Files.createDirectories(uploadPath);

        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        profile.setResumePath(filePath.toString());
        profileRepository.save(profile);

        return filePath.toString();
    }

    private ProfileDto mapToDto(StudentProfile profile, User user) {
        return ProfileDto.builder()
                .id(profile.getId())
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .college(profile.getCollege())
                .branch(profile.getBranch())
                .graduationYear(profile.getGraduationYear())
                .phone(profile.getPhone())
                .skills(profile.getSkills())
                .bio(profile.getBio())
                .resumePath(profile.getResumePath())
                .linkedinUrl(profile.getLinkedinUrl())
                .githubUrl(profile.getGithubUrl())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }
}
