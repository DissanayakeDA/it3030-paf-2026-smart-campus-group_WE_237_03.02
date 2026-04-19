package com.smartcampus.auth.oauth2;

import com.smartcampus.auth.entity.User;
import com.smartcampus.auth.enums.Role;
import com.smartcampus.auth.repository.UserRepository;
import com.smartcampus.auth.service.CustomUserDetailsService;
import com.smartcampus.auth.service.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    @Value("${app.oauth2.redirect-success-uri:http://localhost:5173/oauth2/callback}")
    private String oauth2SuccessRedirectUri;

    @Value("${app.oauth2.redirect-failure-uri:http://localhost:5173/login}")
    private String oauth2FailureRedirectUri;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException {
        if (!(authentication.getPrincipal() instanceof OAuth2User oauth2User)) {
            getRedirectStrategy().sendRedirect(request, response, buildFailureUrl("invalid_oauth2_principal"));
            return;
        }

        String email = normalizeEmail(extractAttribute(oauth2User, "email"));
        if (!StringUtils.hasText(email)) {
            getRedirectStrategy().sendRedirect(request, response, buildFailureUrl("missing_email"));
            return;
        }

        User user = upsertUser(oauth2User, email);
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());

        String accessToken = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        clearAuthenticationAttributes(request);
        getRedirectStrategy().sendRedirect(request, response, buildSuccessUrl(accessToken, refreshToken));
    }

    private User upsertUser(OAuth2User oauth2User, String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .map(existing -> updateUserIfNeeded(existing, oauth2User))
                .orElseGet(() -> createUser(oauth2User, email));
    }

    private User updateUserIfNeeded(User existingUser, OAuth2User oauth2User) {
        String resolvedName = resolveName(oauth2User, existingUser.getEmail());
        if (!StringUtils.hasText(resolvedName) || resolvedName.equals(existingUser.getName())) {
            return existingUser;
        }

        existingUser.setName(resolvedName);
        return userRepository.save(existingUser);
    }

    private User createUser(OAuth2User oauth2User, String email) {
        User user = User.builder()
                .name(resolveName(oauth2User, email))
                .email(email)
                .password(passwordEncoder.encode(UUID.randomUUID().toString() + UUID.randomUUID()))
                .role(Role.USER)
                .build();

        return userRepository.save(user);
    }

    private String resolveName(OAuth2User oauth2User, String email) {
        String name = normalizeName(extractAttribute(oauth2User, "name"));
        if (StringUtils.hasText(name)) {
            return name;
        }

        String givenName = normalizeName(extractAttribute(oauth2User, "given_name"));
        String familyName = normalizeName(extractAttribute(oauth2User, "family_name"));
        String fullName = normalizeName((givenName + " " + familyName).trim());
        if (StringUtils.hasText(fullName)) {
            return fullName;
        }

        int atIndex = email.indexOf('@');
        return atIndex > 0 ? email.substring(0, atIndex) : email;
    }

    private String buildSuccessUrl(String accessToken, String refreshToken) {
        return oauth2SuccessRedirectUri
                + "#accessToken="
                + urlEncode(accessToken)
                + "&refreshToken="
                + urlEncode(refreshToken);
    }

    private String buildFailureUrl(String error) {
        String separator = oauth2FailureRedirectUri.contains("?") ? "&" : "?";
        return oauth2FailureRedirectUri + separator + "oauth2Error=" + urlEncode(error);
    }

    private String extractAttribute(OAuth2User oauth2User, String attributeName) {
        Object value = oauth2User.getAttributes().get(attributeName);
        return value == null ? null : value.toString();
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeName(String name) {
        return name == null ? null : name.trim();
    }

    private String urlEncode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
