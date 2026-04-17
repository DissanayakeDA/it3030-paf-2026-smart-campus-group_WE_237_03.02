package com.smartcampus.ticket.entity;

import java.time.Instant;

import com.smartcampus.ticket.enums.TicketCategory;
import com.smartcampus.ticket.enums.TicketPriority;
import com.smartcampus.ticket.enums.TicketStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "tickets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ticket {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String title;

	@Column(nullable = false, length = 4000)
	private String description;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private TicketCategory category;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private TicketPriority priority;

	@Column(nullable = false)
	private String preferredContact;

	private Long resourceId;

	@Column(nullable = false)
	private String locationText;

	@Column(nullable = false)
	private Long createdByUserId;

	private Long assignedTechnicianId;

	@Column(length = 4000)
	private String rejectionReason;

	@Column(length = 4000)
	private String resolutionNotes;

	private Instant firstResponseAt;

	private Instant resolvedAt;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private TicketStatus status;

	@Column(nullable = false)
	private Instant createdAt;

	@Column(nullable = false)
	private Instant updatedAt;

	@PrePersist
	void onCreate() {
		Instant now = Instant.now();
		if (status == null) {
			status = TicketStatus.OPEN;
		}
		createdAt = now;
		updatedAt = now;
	}

	@PreUpdate
	void onUpdate() {
		updatedAt = Instant.now();
	}
}
