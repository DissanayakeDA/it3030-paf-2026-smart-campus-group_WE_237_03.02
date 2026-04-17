package com.smartcampus.ticket.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.smartcampus.ticket.dto.TicketAttachmentResponse;
import com.smartcampus.ticket.service.TicketService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class TicketAttachmentController {

	private final TicketService ticketService;

	@PostMapping(value = "/api/tickets/{ticketId}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<TicketAttachmentResponse> uploadAttachment(@PathVariable Long ticketId,
			@RequestParam("file") MultipartFile file) {
		TicketAttachmentResponse body = ticketService.uploadAttachment(ticketId, file);
		return ResponseEntity.status(HttpStatus.CREATED).body(body);
	}

	@GetMapping("/api/tickets/{ticketId}/attachments")
	public ResponseEntity<List<TicketAttachmentResponse>> listAttachments(@PathVariable Long ticketId) {
		return ResponseEntity.ok(ticketService.getAttachmentsByTicket(ticketId));
	}
}
