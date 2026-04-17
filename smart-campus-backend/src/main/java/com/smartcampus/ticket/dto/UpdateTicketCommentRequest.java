package com.smartcampus.ticket.dto;

import com.smartcampus.ticket.enums.ActorRole;

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
public class UpdateTicketCommentRequest {

	@NotBlank
	private String content;

	@NotNull
	private Long actingUserId;

	@NotNull
	private ActorRole actorRole;
}
