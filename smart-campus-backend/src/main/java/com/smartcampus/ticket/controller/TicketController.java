package com.smartcampus.ticket.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.ticket.dto.AddResolutionNotesRequest;
import com.smartcampus.ticket.dto.AssignTechnicianRequest;
import com.smartcampus.ticket.dto.CreateTicketRequest;
import com.smartcampus.ticket.dto.DeleteTicketRequest;
import com.smartcampus.ticket.dto.TicketResponse;
import com.smartcampus.ticket.dto.TicketSlaResponse;
import com.smartcampus.ticket.dto.TicketSummaryResponse;
import com.smartcampus.ticket.dto.UpdateTicketRequest;
import com.smartcampus.ticket.dto.UpdateTicketStatusRequest;
import com.smartcampus.ticket.enums.ActorRole;
import com.smartcampus.ticket.enums.TicketStatus;
import com.smartcampus.ticket.service.TicketService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

	private final TicketService ticketService;

	@GetMapping
	public ResponseEntity<List<TicketResponse>> getAllTickets(
			@RequestParam(required = false) TicketStatus status,
			@RequestParam(required = false) Long createdByUserId,
			@RequestParam(required = false) Long assignedTechnicianId,
			@RequestParam(required = false) Long actingUserId,
			@RequestParam(required = false) ActorRole actorRole) {
		return ResponseEntity
				.ok(ticketService.getAllTickets(status, createdByUserId, assignedTechnicianId, actingUserId, actorRole));
	}

	@PostMapping
	public ResponseEntity<TicketResponse> createTicket(@Valid @RequestBody CreateTicketRequest request) {
		TicketResponse body = ticketService.createTicket(request);
		return ResponseEntity.status(HttpStatus.CREATED).body(body);
	}

	@PutMapping("/{id}")
	public ResponseEntity<TicketResponse> updateTicket(@PathVariable Long id,
			@Valid @RequestBody UpdateTicketRequest request) {
		return ResponseEntity.ok(ticketService.updateTicket(id, request));
	}

	@GetMapping("/{id}")
	public ResponseEntity<TicketResponse> getTicketById(@PathVariable Long id) {
		return ticketService.getTicketById(id)
				.map(ResponseEntity::ok)
				.orElse(ResponseEntity.notFound().build());
	}

	@GetMapping("/{id}/sla")
	public ResponseEntity<TicketSlaResponse> getTicketSla(@PathVariable Long id) {
		return ticketService.getTicketSla(id)
				.map(ResponseEntity::ok)
				.orElse(ResponseEntity.notFound().build());
	}

	@GetMapping("/admin/sla-summary")
	public ResponseEntity<TicketSummaryResponse> getSlaSummary() {
		return ResponseEntity.ok(ticketService.getSlaSummary());
	}

	@PatchMapping("/{id}/assign-technician")
	public ResponseEntity<TicketResponse> assignTechnician(@PathVariable Long id,
			@Valid @RequestBody AssignTechnicianRequest request) {
		return ResponseEntity.ok(ticketService.assignTechnician(id, request));
	}

	@PatchMapping("/{id}/status")
	public ResponseEntity<TicketResponse> updateTicketStatus(@PathVariable Long id,
			@Valid @RequestBody UpdateTicketStatusRequest request) {
		return ResponseEntity.ok(ticketService.updateTicketStatus(id, request));
	}

	@PatchMapping("/{id}/resolution-notes")
	public ResponseEntity<TicketResponse> addResolutionNotes(@PathVariable Long id,
			@Valid @RequestBody AddResolutionNotesRequest request) {
		return ResponseEntity.ok(ticketService.addResolutionNotes(id, request));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteTicket(@PathVariable Long id,
			@Valid @RequestBody DeleteTicketRequest request) {
		ticketService.deleteTicket(id, request);
		return ResponseEntity.noContent().build();
	}
}
