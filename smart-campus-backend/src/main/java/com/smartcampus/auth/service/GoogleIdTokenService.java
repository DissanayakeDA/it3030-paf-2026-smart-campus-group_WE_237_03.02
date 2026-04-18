package com.smartcampus.auth.service;

import java.util.Collections;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class GoogleIdTokenService {

	private final String clientId;

	public GoogleIdTokenService(@Value("${app.oauth2.google.client-id:}") String clientId) {
		this.clientId = clientId == null ? "" : clientId.trim();
	}

	public GoogleIdToken.Payload verify(String idToken) {
		if (clientId.isBlank()) {
			log.warn("Google Sign-In is disabled: app.oauth2.google.client-id is not set");
			throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Google Sign-In is not configured");
		}
		try {
			GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
					new NetHttpTransport(),
					GsonFactory.getDefaultInstance())
					.setAudience(Collections.singletonList(clientId))
					.build();
			GoogleIdToken token = verifier.verify(idToken);
			if (token == null) {
				throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Google ID token");
			}
			return token.getPayload();
		} catch (ResponseStatusException e) {
			throw e;
		} catch (Exception e) {
			log.debug("Google token verification failed: {}", e.getMessage());
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Google ID token");
		}
	}
}
