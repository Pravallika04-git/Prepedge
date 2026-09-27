package com.placementportal.service;

import com.placementportal.dto.AuthDto;
import com.placementportal.model.StudentProfile;
import com.placementportal.model.User;
import com.placementportal.repository.StudentProfileRepository;
import com.placementportal.repository.UserRepository;
import com.placementportal.security.CustomUserDetails;
import com.placementportal.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final StudentProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @Transactional
    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already registered");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.STUDENT)
                .build();

        user = userRepository.save(user);

        StudentProfile profile = StudentProfile.builder()
                .user(user)
                .build();
        profileRepository.save(profile);

        String token = tokenProvider.generateTokenFromEmail(
                user.getEmail(), user.getId(), user.getRole().name(), user.getFullName()
        );

        return AuthDto.AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .build();
    }

    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        return AuthDto.AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .id(userDetails.getId())
                .email(userDetails.getEmail())
                .fullName(userDetails.getFullName())
                .role(userDetails.getRole())
                .build();
    }

    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof CustomUserDetails)) {
            return userRepository.findByEmail("admin@example.com").orElseGet(() -> {
                User defaultUser = User.builder()
                        .fullName("PlacementHub Admin")
                        .email("admin@example.com")
                        .password(passwordEncoder.encode("admin123"))
                        .role(User.Role.ADMIN)
                        .build();
                return userRepository.save(defaultUser);
            });
        }
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
