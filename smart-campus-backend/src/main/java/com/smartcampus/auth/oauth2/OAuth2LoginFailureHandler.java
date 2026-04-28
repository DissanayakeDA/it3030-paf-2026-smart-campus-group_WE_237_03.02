package com.smartcampus.auth.oauth2;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class OAuth2LoginFailureHandler implements AuthenticationFailureHandler {

    private static final int MAX_ERROR_LENGTH = 120;
    private static final Logger LOG = LoggerFactory.getLogger(OAuth2LoginFailureHandler.class);

    @Value("${app.oauth2.redirect-failure-uri:http://localhost:5173/login}")
    private String oauth2FailureRedirectUri;

    @Override
    public void onAuthenticationFailure(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception
    ) throws IOException {
        String errorMessage = "oauth2_login_failed";
        if (exception != null && StringUtils.hasText(exception.getMessage())) {
            errorMessage = trimErrorMessage(exception.getMessage());
            LOG.warn("Google OAuth2 login failed: {}", exception.getMessage(), exception);
        } else {
            LOG.warn("Google OAuth2 login failed without exception message");
        }

        String separator = oauth2FailureRedirectUri.contains("?") ? "&" : "?";
        String targetUrl = oauth2FailureRedirectUri + separator + "oauth2Error=" + urlEncode(errorMessage);
        response.sendRedirect(targetUrl);
    }

    private String trimErrorMessage(String value) {
        String trimmed = value.trim();
        if (trimmed.length() <= MAX_ERROR_LENGTH) {
            return trimmed;
        }
        return trimmed.substring(0, MAX_ERROR_LENGTH);
    }

    private String urlEncode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
