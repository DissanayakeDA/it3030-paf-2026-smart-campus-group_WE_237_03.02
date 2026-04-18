package com.smartcampus.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http
				.cors(cors -> cors.configurationSource(corsConfigurationSource))
				.csrf(csrf -> csrf.disable())
				.authorizeHttpRequests(auth -> auth
						.requestMatchers("/api/tickets/**").permitAll()
						.requestMatchers("/api/ticket-comments/**").permitAll()
						.requestMatchers("/api/resources/**").permitAll()
						.requestMatchers("/api/bookings/**").permitAll()
						.requestMatchers("/auth/login", "/auth/refresh").permitAll()
						.requestMatchers(org.springframework.http.HttpMethod.POST, "/api/users").permitAll()
						.requestMatchers(org.springframework.http.HttpMethod.GET, "/api/users", "/api/users/").hasAuthority("ROLE_ADMIN")
						.requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/users/**").hasAuthority("ROLE_ADMIN")
						.requestMatchers(org.springframework.http.HttpMethod.PATCH, "/api/users/**/role").hasAuthority("ROLE_ADMIN")
						.requestMatchers("/api/users/**").authenticated()
						.requestMatchers("/auth/me").authenticated()
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

