package com.smartcampus.ticket.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.ticket.dto.CreateTicketRequest;
import com.smartcampus.ticket.dto.TicketResponse;
import com.smartcampus.ticket.service.TicketService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

	private final TicketService ticketService;

	@PostMapping
	public ResponseEntity<TicketResponse> createTicket(@Valid @RequestBody CreateTicketRequest request) {
		TicketResponse body = ticketService.createTicket(request);
		return ResponseEntity.status(HttpStatus.CREATED).body(body);
	}

	@GetMapping("/{id}")
	public ResponseEntity<TicketResponse> getTicketById(@PathVariable Long id) {
		return ticketService.getTicketById(id)
				.map(ResponseEntity::ok)
				.orElse(ResponseEntity.notFound().build());
	}
}
