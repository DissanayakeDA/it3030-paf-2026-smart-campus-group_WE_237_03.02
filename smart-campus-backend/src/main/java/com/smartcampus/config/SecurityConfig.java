package com.smartcampus.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
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
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

	private final CorsConfigurationSource corsConfigurationSource;
	private final JwtAuthenticationFilter jwtAuthFilter;
	private final RestAuthenticationEntryPoint authenticationEntryPoint;
	private final RestAccessDeniedHandler accessDeniedHandler;

	@Bean
	@Order(1)
	public SecurityFilterChain publicAuthSecurityFilterChain(HttpSecurity http) throws Exception {
		http
				.securityMatcher("/auth/login", "/auth/refresh", "/auth/google")
				.cors(cors -> cors.configurationSource(corsConfigurationSource))
				.csrf(csrf -> csrf.disable())
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
		return http.build();
	}

	@Bean
	@Order(2)
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http
				.cors(cors -> cors.configurationSource(corsConfigurationSource))
				.csrf(csrf -> csrf.disable())
				.exceptionHandling(ex -> ex
						.authenticationEntryPoint(authenticationEntryPoint)
						.accessDeniedHandler(accessDeniedHandler))
				.authorizeHttpRequests(auth -> auth
						.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
						// Must be public on this chain: some Spring / matcher setups skip the
						// dedicated @Order(1) chain, which would otherwise return 401
						// "Authentication required" before the login controller runs.
						.requestMatchers("/auth/login", "/auth/refresh", "/auth/google").permitAll()
						.requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
						.requestMatchers(HttpMethod.GET, "/api/resources/**")
							.hasAnyRole("ADMIN", "TECHNICIAN", "USER")
						.requestMatchers("/api/resources/**").hasRole("ADMIN")
						.requestMatchers("/api/tickets/admin/**").hasRole("ADMIN")
						.requestMatchers("/api/tickets/**", "/api/ticket-comments/**")
							.hasAnyRole("ADMIN", "TECHNICIAN", "USER")
						.requestMatchers(HttpMethod.POST, "/api/bookings")
							.hasAnyRole("ADMIN", "USER", "TECHNICIAN")
						.requestMatchers(HttpMethod.GET, "/api/bookings/my")
							.hasAnyRole("ADMIN", "USER", "TECHNICIAN")
						.requestMatchers(HttpMethod.GET, "/api/bookings").hasRole("ADMIN")
						.requestMatchers(HttpMethod.GET, "/api/bookings/*")
							.hasAnyRole("ADMIN", "USER", "TECHNICIAN")
						.requestMatchers(HttpMethod.PATCH, "/api/bookings/*/approve", "/api/bookings/*/reject")
							.hasRole("ADMIN")
						.requestMatchers(HttpMethod.PATCH, "/api/bookings/*/cancel")
							.hasAnyRole("ADMIN", "USER", "TECHNICIAN")
						.requestMatchers("/api/bookings/**").authenticated()
						.requestMatchers("/api/users/**").authenticated()
						.requestMatchers("/auth/me", "/auth/me/**").authenticated()
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
