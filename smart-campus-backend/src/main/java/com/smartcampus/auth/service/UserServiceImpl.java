package com.smartcampus.auth.service;

import java.util.List;
import java.util.Locale;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.smartcampus.auth.dto.CreateUserRequest;
import com.smartcampus.auth.dto.UpdateUserRequest;
import com.smartcampus.auth.dto.UserResponse;
import com.smartcampus.auth.entity.User;
import com.smartcampus.auth.enums.AuthProvider;
import com.smartcampus.auth.enums.Role;
import com.smartcampus.auth.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final CurrentUserService currentUserService;

	@Override
	@Transactional
	public UserResponse createUser(CreateUserRequest request) {
		currentUserService.requireRole(Role.ADMIN);

		String normalizedEmail = normalizeEmail(request.getEmail());

		if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
		}

		User user = User.builder()
				.name(request.getName().trim())
				.email(normalizedEmail)
				.password(passwordEncoder.encode(request.getPassword()))
				.role(request.getRole())
				.authProvider(AuthProvider.LOCAL)
				.localCredentialsEnabled(true)
				.build();

		User savedUser = userRepository.save(user);
		return toResponse(savedUser);
	}

	@Override
	@Transactional(readOnly = true)
	public List<UserResponse> getAllUsers() {
		currentUserService.requireRole(Role.ADMIN);
		return userRepository.findAll().stream()
				.map(this::toResponse)
				.toList();
	}

	@Override
	@Transactional(readOnly = true)
	public Optional<UserResponse> getUserById(Long id) {
		User current = currentUserService.requireUser();
		if (current.getRole() != Role.ADMIN && !current.getId().equals(id)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only access your own profile");
		}
		return userRepository.findById(id).map(this::toResponse);
	}

	@Override
	@Transactional(readOnly = true)
	public UserResponse getMyProfile() {
		return toResponse(currentUserService.requireUser());
	}

	@Override
	@Transactional
	public UserResponse updateMyProfile(UpdateUserRequest request) {
		User user = currentUserService.requireUser();
		user.setName(request.getName().trim());
		return toResponse(userRepository.save(user));
	}

	@Override
	@Transactional
	public UserResponse updateUser(Long id, UpdateUserRequest request) {
		currentUserService.requireRole(Role.ADMIN);
		User user = userRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

		user.setName(request.getName().trim());
		return toResponse(userRepository.save(user));
	}

	@Override
	@Transactional
	public UserResponse updateUserRole(Long id, Role role) {
		currentUserService.requireRole(Role.ADMIN);
		if (role == Role.ADMIN) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ADMIN role cannot be assigned through this API");
		}
		User user = userRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

		user.setRole(role);
		User updatedUser = userRepository.save(user);
		return toResponse(updatedUser);
	}

	@Override
	@Transactional
	public void deleteUser(Long id) {
		currentUserService.requireRole(Role.ADMIN);
		User actor = currentUserService.requireUser();
		if (actor.getId().equals(id)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot delete your own account");
		}
		User user = userRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
		if (user.getRole() == Role.ADMIN && userRepository.countByRole(Role.ADMIN) <= 1) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot delete the last ADMIN account");
		}
		userRepository.delete(user);
	}

	private UserResponse toResponse(User user) {
		return UserResponse.builder()
				.id(user.getId())
				.name(user.getName())
				.email(user.getEmail())
				.role(user.getRole())
				.createdAt(user.getCreatedAt())
				.updatedAt(user.getUpdatedAt())
				.build();
	}

	private String normalizeEmail(String email) {
		return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
	}
}
