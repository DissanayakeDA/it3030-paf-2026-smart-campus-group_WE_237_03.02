package com.smartcampus.ticket.dto;

import java.time.Instant;

import com.smartcampus.ticket.enums.TicketCategory;
import com.smartcampus.ticket.enums.TicketPriority;
import com.smartcampus.ticket.enums.TicketStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketResponse {

	private Long id;
	private String title;
	private String description;
	private TicketCategory category;
	private TicketPriority priority;
	private String preferredContact;
	private Long resourceId;
	private String locationText;
	private Long createdByUserId;
	private String createdByUserName;
	private Long assignedTechnicianId;
	private String assignedTechnicianName;
	private String rejectionReason;
	private String resolutionNotes;
	private Instant firstResponseAt;
	private Instant resolvedAt;
	private TicketStatus status;
	private Instant createdAt;
	private Instant updatedAt;
}
