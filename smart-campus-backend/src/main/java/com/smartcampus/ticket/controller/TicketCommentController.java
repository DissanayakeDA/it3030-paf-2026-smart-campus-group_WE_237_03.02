package com.smartcampus.ticket.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.ticket.dto.AddTicketCommentRequest;
import com.smartcampus.ticket.dto.DeleteTicketCommentRequest;
import com.smartcampus.ticket.dto.TicketCommentResponse;
import com.smartcampus.ticket.dto.UpdateTicketCommentRequest;
import com.smartcampus.ticket.service.TicketService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class TicketCommentController {

	private final TicketService ticketService;

	@PostMapping("/api/tickets/{ticketId}/comments")
	public ResponseEntity<TicketCommentResponse> addComment(@PathVariable Long ticketId,
			@Valid @RequestBody AddTicketCommentRequest request) {
		TicketCommentResponse body = ticketService.addTicketComment(ticketId, request);
		return ResponseEntity.status(HttpStatus.CREATED).body(body);
	}

	@GetMapping("/api/tickets/{ticketId}/comments")
	public ResponseEntity<List<TicketCommentResponse>> listComments(@PathVariable Long ticketId) {
		return ResponseEntity.ok(ticketService.listTicketComments(ticketId));
	}

	@PutMapping("/api/ticket-comments/{commentId}")
	public ResponseEntity<TicketCommentResponse> updateComment(@PathVariable Long commentId,
			@Valid @RequestBody UpdateTicketCommentRequest request) {
		return ResponseEntity.ok(ticketService.updateTicketComment(commentId, request));
	}

	@DeleteMapping("/api/ticket-comments/{commentId}")
	public ResponseEntity<Void> deleteComment(@PathVariable Long commentId,
			@Valid @RequestBody DeleteTicketCommentRequest request) {
		ticketService.deleteTicketComment(commentId, request);
		return ResponseEntity.noContent().build();
	}
}
