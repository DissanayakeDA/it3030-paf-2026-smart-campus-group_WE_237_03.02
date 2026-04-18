package com.smartcampus.auth.service;

import com.smartcampus.auth.dto.AuthResponse;
import com.smartcampus.auth.dto.LoginRequest;
import com.smartcampus.auth.dto.RefreshTokenRequest;
import com.smartcampus.auth.dto.UserDTO;
import com.smartcampus.auth.entity.User;
import com.smartcampus.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + request.getEmail()));

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String accessToken = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(mapToDTO(user))
                .build();
    }

    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String token = request.getRefreshToken();
        String type = jwtService.extractType(token);
        
        if (!"refresh".equals(type)) {
            throw new RuntimeException("Invalid token type. Refresh token expected.");
        }

        String userEmail = jwtService.extractUsername(token);

        UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);

        if (!jwtService.isTokenValid(request.getRefreshToken(), userDetails)) {
            throw new RuntimeException("Refresh token is expired or invalid");
        }

        User user = userRepository.findByEmail(userEmail)
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
            throw new RuntimeException("No authenticated user found");
        }

        final String email;
        if (authentication.getPrincipal() instanceof UserDetails userDetails) {
            email = userDetails.getUsername();
        } else {
            email = authentication.getPrincipal().toString();
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        return mapToDTO(user);
    }

    private UserDTO mapToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}