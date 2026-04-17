package com.smartcampus.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.neon.datasource")
public class NeonDataSourceProperties {

	/**
	 * JDBC URL for Neon (use {@code jdbc:postgresql://...} with query params such as
	 * {@code sslmode=require}).
	 */
	private String jdbcUrl;

	private String username;

	private String password;

	public String getJdbcUrl() {
		return jdbcUrl;
	}

	public void setJdbcUrl(String jdbcUrl) {
		this.jdbcUrl = jdbcUrl;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

}
