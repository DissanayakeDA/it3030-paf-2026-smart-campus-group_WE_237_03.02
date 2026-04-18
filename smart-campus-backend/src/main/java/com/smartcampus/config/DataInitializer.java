package com.smartcampus.config;

import java.util.Locale;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.smartcampus.auth.entity.User;
import com.smartcampus.auth.enums.AuthProvider;
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

	@Override
	public void run(String... args) {
		if (userRepository.existsByRole(Role.ADMIN)) {
			log.info("A user with ADMIN role already exists. Skipping seeding.");
			return;
		}

		String email = normalizeEmail(adminEmail);
		if (email == null || !email.toLowerCase(Locale.ROOT).endsWith("@gmail.com")) {
			log.warn("Initial admin email must be @gmail.com (got {}). Skipping seeding.", adminEmail);
			return;
		}

		log.info("No ADMIN user in database. Seeding initial admin account: {}", email);

		User admin = User.builder()
				.name(adminName.trim())
				.email(email)
				.password(passwordEncoder.encode(adminPassword))
				.role(Role.ADMIN)
				.authProvider(AuthProvider.LOCAL)
				.localCredentialsEnabled(true)
				.build();

		userRepository.save(admin);
		log.info("Initial admin user seeded successfully.");
	}

	private String normalizeEmail(String email) {
		return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
	}
}
