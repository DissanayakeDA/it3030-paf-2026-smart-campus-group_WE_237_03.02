package com.smartcampus.auth.service;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.smartcampus.auth.entity.User;
import com.smartcampus.auth.enums.Role;
import com.smartcampus.auth.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CurrentUserService {

	private final UserRepository userRepository;

	public User requireUser() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || !authentication.isAuthenticated()
				|| authentication.getPrincipal() == null
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
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
	}

	public void requireRole(Role... allowed) {
		User user = requireUser();
		for (Role r : allowed) {
			if (user.getRole() == r) {
				return;
			}
		}
		throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Insufficient permissions");
	}
}
