package com.placementportal.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProfileDto {
    private Long id;
    private Long userId;
    private String fullName;
    private String email;
    private String college;
    private String branch;
    private Integer graduationYear;
    private String phone;
    private String skills;
    private String bio;
    private String resumePath;
    private String linkedinUrl;
    private String githubUrl;
    private String avatarUrl;
}
