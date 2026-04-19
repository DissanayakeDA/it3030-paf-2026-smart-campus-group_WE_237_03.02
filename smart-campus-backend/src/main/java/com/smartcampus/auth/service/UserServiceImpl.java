package com.smartcampus.auth.service;

import java.util.List;
import java.util.Locale;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.smartcampus.auth.dto.CreateUserRequest;
import com.smartcampus.auth.dto.ChangePasswordRequest;
import com.smartcampus.auth.dto.UpdateOwnProfileRequest;
import com.smartcampus.auth.dto.UpdateUserRequest;
import com.smartcampus.auth.dto.UserResponse;
import com.smartcampus.auth.entity.User;
import com.smartcampus.auth.enums.Role;
import com.smartcampus.auth.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        requireAdminAccessForUserCreation();

        String normalizedName = normalizeName(request.getName());
        String normalizedEmail = normalizeEmail(request.getEmail());
        String normalizedEmpId = normalizeEmpId(request.getEmpId());
        String normalizedPhoneNumber = normalizePhoneNumber(request.getPhoneNumber());
        validateGmailAddress(normalizedEmail);

        ensureUniqueEmail(normalizedEmail, null);
        ensureUniqueEmpId(normalizedEmpId, null);

        User user = User.builder()
                .name(normalizedName)
                .email(normalizedEmail)
                .empId(normalizedEmpId)
                .phoneNumber(normalizedPhoneNumber)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .build();

        User savedUser = userRepository.save(user);
        return toResponse(savedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        requireAdminAccess();
        return userRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<UserResponse> getUserById(Long id) {
        requireAdminAccess();
        return userRepository.findById(id).map(this::toResponse);
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long id, UpdateUserRequest request) {
        requireAdminAccess();
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        String normalizedName = normalizeName(request.getName());
        String normalizedEmail = normalizeEmail(request.getEmail());
        String normalizedEmpId = normalizeEmpId(request.getEmpId());
        validateGmailAddress(normalizedEmail);

        ensureUniqueEmail(normalizedEmail, user.getId());
        ensureUniqueEmpId(normalizedEmpId, user.getId());

        user.setName(normalizedName);
        user.setEmail(normalizedEmail);
        user.setEmpId(normalizedEmpId);

        User updatedUser = userRepository.save(user);
        return toResponse(updatedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUserProfile() {
        return toResponse(getCurrentAuthenticatedUser());
    }

    @Override
    @Transactional
    public UserResponse updateCurrentUserProfile(UpdateOwnProfileRequest request) {
        User user = getCurrentAuthenticatedUser();

        String normalizedName = normalizeName(request.getName());
        String normalizedPhoneNumber = normalizePhoneNumber(request.getPhoneNumber());

        user.setName(normalizedName);
        user.setPhoneNumber(normalizedPhoneNumber);

        User updatedUser = userRepository.save(user);
        return toResponse(updatedUser);
    }

    @Override
    @Transactional
    public void changeCurrentUserPassword(ChangePasswordRequest request) {
        User user = getCurrentAuthenticatedUser();

        if (!matchesPassword(request.getCurrentPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Current password is incorrect");
        }

        if (request.getCurrentPassword().equals(request.getNewPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "New password must be different from current password");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    @Transactional
    public UserResponse updateUserRole(Long id, Role role) {
        requireAdminAccess();
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        user.setRole(role);
        User updatedUser = userRepository.save(user);
        return toResponse(updatedUser);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User actingUser = requireAdminAccess();
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (actingUser.getId().equals(id)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Admin cannot delete own account");
        }
        if (user.getRole() == Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Admin can delete only staff users and technicians");
        }
        userRepository.delete(user);
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .empId(user.getEmpId())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    private User requireAdminAccessForUserCreation() {
        if (!hasAuthenticatedPrincipal() && !userRepository.existsByRole(Role.ADMIN)) {
            return null;
        }
        return requireAdminAccess();
    }

    private User requireAdminAccess() {
        User user = getCurrentAuthenticatedUser();
        if (user.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access is required");
        }
        return user;
    }

    private User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }

        final String email;
        if (authentication.getPrincipal() instanceof UserDetails userDetails) {
            email = userDetails.getUsername();
        } else {
            email = authentication.getPrincipal().toString();
        }

        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user not found"));
    }

    private boolean hasAuthenticatedPrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null
                && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getPrincipal());
    }

    private void ensureUniqueEmail(String normalizedEmail, Long existingUserId) {
        if (!userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            return;
        }

        if (existingUserId != null) {
            Optional<User> userByEmail = userRepository.findByEmailIgnoreCase(normalizedEmail);
            if (userByEmail.isPresent() && userByEmail.get().getId().equals(existingUserId)) {
                return;
            }
        }

        throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
    }

    private void ensureUniqueEmpId(String normalizedEmpId, Long existingUserId) {
        if (!userRepository.existsByEmpIdIgnoreCase(normalizedEmpId)) {
            return;
        }

        if (existingUserId != null) {
            Optional<User> userByEmpId = userRepository.findByEmpIdIgnoreCase(normalizedEmpId);
            if (userByEmpId.isPresent() && userByEmpId.get().getId().equals(existingUserId)) {
                return;
            }
        }

        throw new ResponseStatusException(HttpStatus.CONFLICT, "Employee ID already exists");
    }

    private void validateGmailAddress(String email) {
        if (email == null || !email.endsWith("@gmail.com")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email must be a @gmail.com address");
        }
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

    private String normalizeName(String name) {
        return name == null ? null : name.trim();
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeEmpId(String empId) {
        return empId == null ? null : empId.trim().toUpperCase(Locale.ROOT);
    }

    private String normalizePhoneNumber(String phoneNumber) {
        return phoneNumber == null ? null : phoneNumber.trim();
    }
}
