package com.smartcampus.ticket.dto;

import com.smartcampus.ticket.enums.ActorRole;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AssignTechnicianRequest {

	@NotNull
	private Long technicianId;

	@NotNull
	private Long actingUserId;

	@NotNull
	private ActorRole actorRole;
}
