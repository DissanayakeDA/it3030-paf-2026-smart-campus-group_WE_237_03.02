package com.smartcampus.config;

import java.sql.Connection;
import java.sql.SQLException;

import javax.sql.DataSource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class DatabaseConnectionLogger {

	private static final Logger log = LoggerFactory.getLogger(DatabaseConnectionLogger.class);

	private final DataSource dataSource;

	public DatabaseConnectionLogger(DataSource dataSource) {
		this.dataSource = dataSource;
	}

	@EventListener(ApplicationReadyEvent.class)
	public void logDatabaseConnected() {
		try (Connection connection = dataSource.getConnection()) {
			if (connection.isValid(5)) {
				var meta = connection.getMetaData();
				log.info(
						"Database connected successfully - {} {} (schema user: {})",
						meta.getDatabaseProductName(),
						meta.getDatabaseProductVersion(),
						meta.getUserName());
			} else {
				log.warn("Database connection could not be validated");
			}
		} catch (SQLException e) {
			log.error("Database connection check failed", e);
		}
	}

}
