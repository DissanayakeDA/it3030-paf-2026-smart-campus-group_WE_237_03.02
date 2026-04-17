package com.smartcampus.ticket.service;

import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smartcampus.ticket.dto.CreateTicketRequest;
import com.smartcampus.ticket.dto.TicketResponse;
import com.smartcampus.ticket.entity.Ticket;
import com.smartcampus.ticket.enums.TicketStatus;
import com.smartcampus.ticket.repository.TicketRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TicketServiceImpl implements TicketService {

	private final TicketRepository ticketRepository;

	@Override
	@Transactional
	public TicketResponse createTicket(CreateTicketRequest request) {
		Ticket ticket = Ticket.builder()
				.title(request.getTitle())
				.description(request.getDescription())
				.category(request.getCategory())
				.priority(request.getPriority())
				.preferredContact(request.getPreferredContact())
				.resourceId(request.getResourceId())
				.locationText(request.getLocationText())
				.createdByUserId(request.getCreatedByUserId())
				.status(TicketStatus.OPEN)
				.build();
		Ticket saved = ticketRepository.save(ticket);
		return toResponse(saved);
	}

	@Override
	@Transactional(readOnly = true)
	public Optional<TicketResponse> getTicketById(Long id) {
		return ticketRepository.findById(id).map(this::toResponse);
	}

	private TicketResponse toResponse(Ticket ticket) {
		return TicketResponse.builder()
				.id(ticket.getId())
				.title(ticket.getTitle())
				.description(ticket.getDescription())
				.category(ticket.getCategory())
				.priority(ticket.getPriority())
				.preferredContact(ticket.getPreferredContact())
				.resourceId(ticket.getResourceId())
				.locationText(ticket.getLocationText())
				.createdByUserId(ticket.getCreatedByUserId())
				.status(ticket.getStatus())
				.createdAt(ticket.getCreatedAt())
				.updatedAt(ticket.getUpdatedAt())
				.build();
	}
}
