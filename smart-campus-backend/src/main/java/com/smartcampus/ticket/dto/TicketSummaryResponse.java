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
public class TicketSummaryResponse {

	private long totalTickets;
	private long openTickets;
	private long resolvedTickets;
	private Double averageFirstResponseMinutes;
	private Double averageResolutionMinutes;
}
