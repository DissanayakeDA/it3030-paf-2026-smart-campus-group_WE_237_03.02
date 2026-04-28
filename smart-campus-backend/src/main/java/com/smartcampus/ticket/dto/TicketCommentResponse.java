package com.smartcampus.ticket.dto;

import java.time.Instant;

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
public class TicketCommentResponse {

	private Long id;
	private Long ticketId;
	private Long authorUserId;
	private String authorUserName;
	private String content;
	private Instant createdAt;
	private Instant updatedAt;
}
