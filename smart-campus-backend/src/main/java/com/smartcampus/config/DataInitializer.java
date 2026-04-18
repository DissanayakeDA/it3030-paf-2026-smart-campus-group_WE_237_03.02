package com.smartcampus.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.smartcampus.auth.dto.CreateUserRequest;
import com.smartcampus.auth.enums.Role;
import com.smartcampus.auth.repository.UserRepository;
import com.smartcampus.auth.service.UserService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserService userService;
    private final UserRepository userRepository;

    @Value("${app.admin.name}")
    private String adminName;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.existsByRole(Role.ADMIN)) {
            log.info("A user with ADMIN role already exists. Skipping seeding.");
            return;
        }

        log.info("No ADMIN user in database. Seeding initial admin account: {}", adminEmail);

        CreateUserRequest adminRequest = CreateUserRequest.builder()
                .name(adminName)
                .email(adminEmail)
                .password(adminPassword)
                .role(Role.ADMIN)
                .build();

        userService.createUser(adminRequest);
        log.info("Initial admin user seeded successfully.");
    }
}
