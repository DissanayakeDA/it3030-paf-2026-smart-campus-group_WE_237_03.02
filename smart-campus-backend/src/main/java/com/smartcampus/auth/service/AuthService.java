package com.smartcampus.auth.service;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.smartcampus.auth.dto.AuthResponse;
import com.smartcampus.auth.dto.ChangePasswordRequest;
import com.smartcampus.auth.dto.GoogleLoginRequest;
import com.smartcampus.auth.dto.LoginRequest;
import com.smartcampus.auth.dto.RefreshTokenRequest;
import com.smartcampus.auth.dto.SetLocalPasswordRequest;
import com.smartcampus.auth.dto.UserDTO;
import com.smartcampus.auth.entity.User;
import com.smartcampus.auth.enums.AuthProvider;
import com.smartcampus.auth.enums.Role;
import com.smartcampus.auth.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

	private static final SecureRandom RANDOM = new SecureRandom();

	private final UserRepository userRepository;
	private final JwtService jwtService;
	private final CustomUserDetailsService userDetailsService;
	private final PasswordEncoder passwordEncoder;
	private final GoogleIdTokenService googleIdTokenService;
	private final CurrentUserService currentUserService;

	public AuthResponse login(LoginRequest request) {
		String normalizedEmail = normalizeEmail(request.getEmail());
		User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
				.orElseThrow(this::invalidCredentialsException);

		if (!matchesPassword(request.getPassword(), user.getPassword())) {
			throw invalidCredentialsException();
		}

		if (isLegacyPlaintextPassword(user.getPassword())) {
			user.setPassword(passwordEncoder.encode(request.getPassword()));
			user = userRepository.save(user);
		}

		UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
		SecurityContextHolder.getContext().setAuthentication(
				new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities())
		);

		String accessToken = jwtService.generateToken(userDetails);
		String refreshToken = jwtService.generateRefreshToken(userDetails);

		return AuthResponse.builder()
				.accessToken(accessToken)
				.refreshToken(refreshToken)
				.user(mapToDTO(user))
				.build();
	}

	public AuthResponse loginWithGoogle(GoogleLoginRequest request) {
		GoogleIdToken.Payload payload = googleIdTokenService.verify(request.getIdToken());
		if (!Boolean.TRUE.equals(payload.getEmailVerified())) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google email is not verified");
		}
		String email = normalizeEmail(payload.getEmail());
		if (email == null || !email.endsWith("@gmail.com")) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only @gmail.com accounts are allowed");
		}
		String subject = payload.getSubject();
		if (subject == null || subject.isBlank()) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Google ID token");
		}

		User user;
		var bySubject = userRepository.findByOauthSubject(subject);
		if (bySubject.isPresent()) {
			user = bySubject.get();
			if (!user.getEmail().equalsIgnoreCase(email)) {
				throw new ResponseStatusException(HttpStatus.CONFLICT, "Google account email does not match the registered user");
			}
		} else {
			var byEmail = userRepository.findByEmailIgnoreCase(email);
			if (byEmail.isPresent()) {
				user = byEmail.get();
				if (user.getOauthSubject() != null && !user.getOauthSubject().equals(subject)) {
					throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is linked to a different Google account");
				}
				if (user.getOauthSubject() == null) {
					user.setOauthSubject(subject);
					user.setAuthProvider(AuthProvider.GOOGLE);
					user = userRepository.save(user);
				}
			} else {
				user = User.builder()
						.name(resolveGoogleName(payload, email))
						.email(email)
						.password(passwordEncoder.encode(randomSecret()))
						.role(Role.USER)
						.authProvider(AuthProvider.GOOGLE)
						.oauthSubject(subject)
						.localCredentialsEnabled(false)
						.build();
				user = userRepository.save(user);
			}
		}

		UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
		SecurityContextHolder.getContext().setAuthentication(
				new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities())
		);

		String accessToken = jwtService.generateToken(userDetails);
		String refreshToken = jwtService.generateRefreshToken(userDetails);

		return AuthResponse.builder()
				.accessToken(accessToken)
				.refreshToken(refreshToken)
				.user(mapToDTO(user))
				.build();
	}

	public AuthResponse refreshToken(RefreshTokenRequest request) {
		String userEmail;
		try {
			userEmail = jwtService.extractUsername(request.getRefreshToken());
		} catch (RuntimeException ex) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token");
		}

		if (userEmail == null || userEmail.isBlank()) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token");
		}

		UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);

		if (!jwtService.isTokenValid(request.getRefreshToken(), userDetails)) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token is expired or invalid");
		}

		User user = userRepository.findByEmailIgnoreCase(userEmail)
				.orElseThrow(() -> new UsernameNotFoundException("User not found: " + userEmail));

		String accessToken = jwtService.generateToken(userDetails);
		String refreshToken = jwtService.generateRefreshToken(userDetails);

		return AuthResponse.builder()
				.accessToken(accessToken)
				.refreshToken(refreshToken)
				.user(mapToDTO(user))
				.build();
	}

	public UserDTO getCurrentUser() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

		if (authentication == null
				|| !authentication.isAuthenticated()
				|| "anonymousUser".equals(authentication.getPrincipal())) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No authenticated user found");
		}

		final String email;
		if (authentication.getPrincipal() instanceof UserDetails userDetails) {
			email = userDetails.getUsername();
		} else {
			email = authentication.getPrincipal().toString();
		}

		User user = userRepository.findByEmailIgnoreCase(email)
				.orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

		return mapToDTO(user);
	}

	public void changePassword(ChangePasswordRequest request) {
		User user = currentUserService.requireUser();
		if (!user.isLocalCredentialsEnabled()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"Use the set-password endpoint first, or sign in with Google");
		}
		if (!matchesPassword(request.getCurrentPassword(), user.getPassword())) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Current password is incorrect");
		}
		user.setPassword(passwordEncoder.encode(request.getNewPassword()));
		user.setLocalCredentialsEnabled(true);
		userRepository.save(user);
	}

	public void setLocalPassword(SetLocalPasswordRequest request) {
		User user = currentUserService.requireUser();
		if (user.isLocalCredentialsEnabled()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password change is already enabled; use change password");
		}
		user.setPassword(passwordEncoder.encode(request.getNewPassword()));
		user.setLocalCredentialsEnabled(true);
		userRepository.save(user);
	}

	private String resolveGoogleName(GoogleIdToken.Payload payload, String email) {
		String name = (String) payload.get("name");
		if (name != null && !name.isBlank()) {
			return name.trim();
		}
		int at = email.indexOf('@');
		return at > 0 ? email.substring(0, at) : "User";
	}

	private String randomSecret() {
		byte[] buf = new byte[32];
		RANDOM.nextBytes(buf);
		return Base64.getUrlEncoder().withoutPadding().encodeToString(buf);
	}

	private UserDTO mapToDTO(User user) {
		return UserDTO.builder()
				.id(user.getId())
				.name(user.getName())
				.email(user.getEmail())
				.role(user.getRole())
				.build();
	}

	private boolean matchesPassword(String rawPassword, String storedPassword) {
		if (rawPassword == null || storedPassword == null) {
			return false;
		}
		try {
			return passwordEncoder.matches(rawPassword, storedPassword);
		} catch (IllegalArgumentException ex) {
			return rawPassword.equals(storedPassword);
		}
	}

	private boolean isLegacyPlaintextPassword(String storedPassword) {
		if (storedPassword == null) {
			return false;
		}
		return !(storedPassword.startsWith("$2a$")
				|| storedPassword.startsWith("$2b$")
				|| storedPassword.startsWith("$2y$"));
	}

	private ResponseStatusException invalidCredentialsException() {
		return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
	}

	private String normalizeEmail(String email) {
		return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
	}
}
