package com.smartcampus.booking.entity;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

import com.smartcampus.auth.entity.User;
import com.smartcampus.booking.enums.BookingStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "bookings", indexes = {
		@Index(name = "idx_bookings_resource_date", columnList = "resource_id,booking_date"),
		@Index(name = "idx_bookings_user_status", columnList = "user_id,status"),
		@Index(name = "idx_bookings_booking_date", columnList = "booking_date")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "resource_id", nullable = false)
	@NotNull
	private Long resourceId;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	@NotNull
	private User user;

	@Column(name = "booking_date", nullable = false)
	@NotNull
	private LocalDate bookingDate;

	@Column(name = "start_time", nullable = false)
	@NotNull
	private LocalTime startTime;

	@Column(name = "end_time", nullable = false)
	@NotNull
	private LocalTime endTime;

	@Column(nullable = false, length = 2000)
	@NotNull
	@Size(max = 2000)
	private String purpose;

	@Column(name = "expected_attendees", nullable = false)
	@NotNull
	@Positive
	private Integer expectedAttendees;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 32)
	@NotNull
	private BookingStatus status;

	@Column(name = "admin_reason", length = 2000)
	@Size(max = 2000)
	private String adminReason;

	@Column(nullable = false)
	private Instant createdAt;

	@Column(nullable = false)
	private Instant updatedAt;

	@PrePersist
	void onCreate() {
		Instant now = Instant.now();
		if (status == null) {
			status = BookingStatus.PENDING;
		}
		createdAt = now;
		updatedAt = now;
	}

	@PreUpdate
	void onUpdate() {
		updatedAt = Instant.now();
	}
}
