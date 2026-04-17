package com.smartcampus.ticket.dto;

import com.smartcampus.ticket.enums.ActorRole;
import com.smartcampus.ticket.enums.TicketStatus;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTicketStatusRequest {

	@NotNull
	private TicketStatus status;

	private String rejectionReason;

	@NotNull
	private Long actingUserId;

	@NotNull
	private ActorRole actorRole;
}
