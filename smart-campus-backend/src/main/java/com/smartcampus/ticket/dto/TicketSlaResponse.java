package com.smartcampus.ticket.dto;

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
public class TicketSlaResponse {

	private Long ticketId;
	private Long timeToFirstResponseMinutes;
	private Long timeToResolutionMinutes;
}
