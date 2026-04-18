package com.smartcampus.ticket.dto;

import com.smartcampus.ticket.enums.TicketCategory;
import com.smartcampus.ticket.enums.TicketPriority;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateTicketRequest {

	@NotBlank
	private String title;

	@NotBlank
	private String description;

	@NotNull
	private TicketCategory category;

	@NotNull
	private TicketPriority priority;

	@NotBlank
	private String preferredContact;

	private Long resourceId;

	@NotBlank
	private String locationText;
}
