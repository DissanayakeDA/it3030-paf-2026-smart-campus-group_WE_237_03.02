package com.smartcampus.config;

import com.smartcampus.auth.oauth2.OAuth2LoginFailureHandler;
import com.smartcampus.auth.oauth2.OAuth2LoginSuccessHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

	private final CorsConfigurationSource corsConfigurationSource;
	private final JwtAuthenticationFilter jwtAuthFilter;

	@Bean
	@Order(1)
	public SecurityFilterChain oauth2SecurityFilterChain(
			HttpSecurity http,
			OAuth2LoginSuccessHandler oauth2LoginSuccessHandler,
			OAuth2LoginFailureHandler oauth2LoginFailureHandler
	) throws Exception {
		http
				.securityMatcher("/auth/oauth2/**")
				.cors(cors -> cors.configurationSource(corsConfigurationSource))
				.csrf(csrf -> csrf.disable())
				.authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
				.oauth2Login(oauth2 -> oauth2
						.authorizationEndpoint(endpoint -> endpoint.baseUri("/auth/oauth2/authorization"))
						.redirectionEndpoint(endpoint -> endpoint.baseUri("/auth/oauth2/callback/*"))
						.successHandler(oauth2LoginSuccessHandler)
						.failureHandler(oauth2LoginFailureHandler));
		return http.build();
	}

	@Bean
	@Order(2)
	public SecurityFilterChain authPublicSecurityFilterChain(HttpSecurity http) throws Exception {
		http
				.securityMatcher("/auth/login", "/auth/refresh")
				.cors(cors -> cors.configurationSource(corsConfigurationSource))
				.csrf(csrf -> csrf.disable())
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
		return http.build();
	}

	@Bean
	@Order(3)
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http
				.cors(cors -> cors.configurationSource(corsConfigurationSource))
				.csrf(csrf -> csrf.disable())
				.authorizeHttpRequests(auth -> auth
						.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
						.requestMatchers("/auth/login", "/auth/refresh", "/auth/oauth2/**", "/error").permitAll()
						.requestMatchers("/api/tickets", "/api/tickets/**").permitAll()
						.requestMatchers("/api/ticket-comments", "/api/ticket-comments/**").permitAll()
						.requestMatchers("/api/resources", "/api/resources/**").permitAll()
						.requestMatchers("/api/bookings", "/api/bookings/**").permitAll()
						.requestMatchers("/api/notifications", "/api/notifications/**").permitAll()
						.anyRequest().authenticated())
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
		return http.build();
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
		return config.getAuthenticationManager();
	}
}
