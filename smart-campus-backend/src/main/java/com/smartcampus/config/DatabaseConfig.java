package com.smartcampus.config;

import javax.sql.DataSource;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import com.zaxxer.hikari.HikariDataSource;

import org.springframework.boot.jdbc.DataSourceBuilder;

@Configuration
@EnableConfigurationProperties(NeonDataSourceProperties.class)
public class DatabaseConfig {

	@Bean
	@Profile("!test")
	public DataSource neonDataSource(NeonDataSourceProperties properties) {
		return DataSourceBuilder.create()
				.type(HikariDataSource.class)
				.url(properties.getJdbcUrl())
				.username(properties.getUsername())
				.password(properties.getPassword())
				.build();
	}

	@Bean
	@Profile("test")
	public DataSource testDataSource() {
		return DataSourceBuilder.create()
				.type(HikariDataSource.class)
				.url("jdbc:h2:mem:testdb;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1")
				.username("sa")
				.password("")
				.build();
	}

}
