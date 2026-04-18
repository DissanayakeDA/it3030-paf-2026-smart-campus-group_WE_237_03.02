package com.smartcampus.ticket.dto;

import com.smartcampus.ticket.enums.TicketCategory;
import com.smartcampus.ticket.enums.TicketPriority;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTicketRequest {

	@NotBlank
	private String title;

	@NotBlank
	private String description;

	@NotNull
	private TicketCategory category;

	@NotNull
	private TicketPriority priority;

	@NotBlank
	@Pattern(regexp = "^\\d{10}$", message = "Phone number must contain exactly 10 digits")
	private String preferredContact;

	private Long resourceId;

	@NotBlank
	private String locationText;

	@NotNull
	private Long actingUserId;
}
