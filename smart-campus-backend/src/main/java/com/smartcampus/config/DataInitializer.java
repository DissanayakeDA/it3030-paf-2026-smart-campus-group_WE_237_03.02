package com.smartcampus.config;

import java.util.Locale;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.smartcampus.auth.entity.User;
import com.smartcampus.auth.enums.Role;
import com.smartcampus.auth.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.name}")
    private String adminName;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Value("${app.admin.emp-id}")
    private String adminEmpId;

    @Value("${app.admin.phone}")
    private String adminPhoneNumber;

    @Override
    public void run(String... args) throws Exception {
        String normalizedEmail = normalizeEmail(adminEmail);
        String normalizedEmpId = normalizeEmpId(adminEmpId);
        String normalizedName = normalizeName(adminName);
        String normalizedPhoneNumber = normalizePhoneNumber(adminPhoneNumber);
        boolean hadAnyAdmin = userRepository.existsByRole(Role.ADMIN);

        Optional<User> existingConfiguredAdmin = userRepository.findByEmailIgnoreCase(normalizedEmail);
        if (existingConfiguredAdmin.isPresent()) {
            User admin = existingConfiguredAdmin.get();
            admin.setName(normalizedName);
            admin.setPhoneNumber(normalizedPhoneNumber);
            admin.setRole(Role.ADMIN);
            admin.setEmpId(resolveEmpIdForUser(normalizedEmpId, admin.getId()));

            if (shouldUpdatePassword(adminPassword, admin.getPassword())) {
                admin.setPassword(passwordEncoder.encode(adminPassword));
            }

            userRepository.save(admin);
            log.info("Configured admin account synchronized successfully: {}", normalizedEmail);
            return;
        }

        User admin = User.builder()
                .name(normalizedName)
                .email(normalizedEmail)
                .empId(resolveEmpIdForUser(normalizedEmpId, null))
                .phoneNumber(normalizedPhoneNumber)
                .password(passwordEncoder.encode(adminPassword))
                .role(Role.ADMIN)
                .build();
        userRepository.save(admin);

        if (hadAnyAdmin) {
            log.warn("Existing admin users found, but configured admin did not exist. Added recovery admin: {}",
                    normalizedEmail);
        } else {
            log.info("No ADMIN user in database. Seeded initial admin account: {}", normalizedEmail);
        }
    }

    private String resolveEmpIdForUser(String normalizedEmpId, Long currentUserId) {
        if (normalizedEmpId == null || normalizedEmpId.isBlank()) {
            return null;
        }

        Optional<User> existingByEmpId = userRepository.findByEmpIdIgnoreCase(normalizedEmpId);
        if (existingByEmpId.isEmpty()) {
            return normalizedEmpId;
        }

        if (currentUserId != null && existingByEmpId.get().getId().equals(currentUserId)) {
            return normalizedEmpId;
        }

        log.warn("Configured admin employee ID '{}' is already used by another user. Keeping admin empId unchanged/null.",
                normalizedEmpId);
        return null;
    }

    private boolean shouldUpdatePassword(String rawPassword, String storedPassword) {
        if (storedPassword == null || storedPassword.isBlank()) {
            return true;
        }

        if (isLegacyPlaintextPassword(storedPassword)) {
            return true;
        }

        try {
            return !passwordEncoder.matches(rawPassword, storedPassword);
        } catch (IllegalArgumentException ex) {
            return true;
        }
    }

    private boolean isLegacyPlaintextPassword(String storedPassword) {
        return !(storedPassword.startsWith("$2a$")
                || storedPassword.startsWith("$2b$")
                || storedPassword.startsWith("$2y$"));
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeEmpId(String empId) {
        return empId == null ? null : empId.trim().toUpperCase(Locale.ROOT);
    }

    private String normalizeName(String name) {
        return name == null ? null : name.trim();
    }

    private String normalizePhoneNumber(String phoneNumber) {
        return phoneNumber == null ? null : phoneNumber.trim();
    }
}
