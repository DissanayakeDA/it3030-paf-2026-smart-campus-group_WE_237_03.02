package com.smartcampus.ticket.service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.smartcampus.ticket.dto.AddResolutionNotesRequest;
import com.smartcampus.ticket.dto.AddTicketCommentRequest;
import com.smartcampus.ticket.dto.AssignTechnicianRequest;
import com.smartcampus.ticket.dto.CreateTicketRequest;
import com.smartcampus.ticket.dto.DeleteTicketCommentRequest;
import com.smartcampus.ticket.dto.TicketCommentResponse;
import com.smartcampus.ticket.dto.TicketResponse;
import com.smartcampus.ticket.dto.UpdateTicketCommentRequest;
import com.smartcampus.ticket.dto.UpdateTicketStatusRequest;
import com.smartcampus.ticket.entity.Ticket;
import com.smartcampus.ticket.entity.TicketComment;
import com.smartcampus.ticket.enums.ActorRole;
import com.smartcampus.ticket.enums.TicketStatus;
import com.smartcampus.ticket.repository.TicketCommentRepository;
import com.smartcampus.ticket.repository.TicketRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TicketServiceImpl implements TicketService {

	private final TicketRepository ticketRepository;

	private final TicketCommentRepository ticketCommentRepository;

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

	@Override
	@Transactional
	public TicketResponse assignTechnician(Long ticketId, AssignTechnicianRequest request) {
		assertAdminOrTechnician(request.getActorRole());
		Ticket ticket = ticketRepository.findById(ticketId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
		ticket.setAssignedTechnicianId(request.getTechnicianId());
		touchFirstResponse(ticket);
		return toResponse(ticketRepository.save(ticket));
	}

	@Override
	@Transactional
	public TicketResponse updateTicketStatus(Long ticketId, UpdateTicketStatusRequest request) {
		assertAdminOrTechnician(request.getActorRole());
		Ticket ticket = ticketRepository.findById(ticketId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
		TicketStatus previous = ticket.getStatus();
		TicketStatus next = request.getStatus();
		if (next == TicketStatus.REJECTED) {
			if (request.getRejectionReason() == null || request.getRejectionReason().isBlank()) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
			}
			ticket.setRejectionReason(request.getRejectionReason());
		} else {
			ticket.setRejectionReason(null);
		}
		ticket.setStatus(next);
		if (next == TicketStatus.RESOLVED && previous != TicketStatus.RESOLVED) {
			ticket.setResolvedAt(Instant.now());
		} else if (previous == TicketStatus.RESOLVED && next != TicketStatus.RESOLVED
				&& next != TicketStatus.CLOSED) {
			ticket.setResolvedAt(null);
		}
		touchFirstResponse(ticket);
		return toResponse(ticketRepository.save(ticket));
	}

	@Override
	@Transactional
	public TicketResponse addResolutionNotes(Long ticketId, AddResolutionNotesRequest request) {
		assertAdminOrTechnician(request.getActorRole());
		Ticket ticket = ticketRepository.findById(ticketId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
		String incoming = request.getResolutionNotes();
		if (ticket.getResolutionNotes() != null && !ticket.getResolutionNotes().isBlank()) {
			ticket.setResolutionNotes(ticket.getResolutionNotes() + "\n" + incoming);
		} else {
			ticket.setResolutionNotes(incoming);
		}
		touchFirstResponse(ticket);
		return toResponse(ticketRepository.save(ticket));
	}

	@Override
	@Transactional
	public TicketCommentResponse addTicketComment(Long ticketId, AddTicketCommentRequest request) {
		Ticket ticket = ticketRepository.findById(ticketId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
		TicketComment comment = TicketComment.builder()
				.ticket(ticket)
				.authorUserId(request.getAuthorUserId())
				.content(request.getContent())
				.build();
		TicketComment saved = ticketCommentRepository.save(comment);
		return toCommentResponse(saved);
	}

	@Override
	@Transactional(readOnly = true)
	public List<TicketCommentResponse> listTicketComments(Long ticketId) {
		if (!ticketRepository.existsById(ticketId)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND);
		}
		return ticketCommentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId).stream()
				.map(this::toCommentResponse)
				.toList();
	}

	@Override
	@Transactional
	public TicketCommentResponse updateTicketComment(Long commentId, UpdateTicketCommentRequest request) {
		TicketComment comment = ticketCommentRepository.findById(commentId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
		assertOwnerOrAdmin(comment, request.getActingUserId(), request.getActorRole());
		comment.setContent(request.getContent());
		return toCommentResponse(ticketCommentRepository.save(comment));
	}

	@Override
	@Transactional
	public void deleteTicketComment(Long commentId, DeleteTicketCommentRequest request) {
		TicketComment comment = ticketCommentRepository.findById(commentId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
		assertOwnerOrAdmin(comment, request.getActingUserId(), request.getActorRole());
		ticketCommentRepository.delete(comment);
	}

	private void assertOwnerOrAdmin(TicketComment comment, Long actingUserId, ActorRole actorRole) {
		if (actorRole == ActorRole.ADMIN) {
			return;
		}
		if (actingUserId != null && actingUserId.equals(comment.getAuthorUserId())) {
			return;
		}
		throw new ResponseStatusException(HttpStatus.FORBIDDEN);
	}

	private void assertAdminOrTechnician(ActorRole role) {
		if (role != ActorRole.ADMIN && role != ActorRole.TECHNICIAN) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN);
		}
	}

	private void touchFirstResponse(Ticket ticket) {
		if (ticket.getFirstResponseAt() == null) {
			ticket.setFirstResponseAt(Instant.now());
		}
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
				.assignedTechnicianId(ticket.getAssignedTechnicianId())
				.rejectionReason(ticket.getRejectionReason())
				.resolutionNotes(ticket.getResolutionNotes())
				.firstResponseAt(ticket.getFirstResponseAt())
				.resolvedAt(ticket.getResolvedAt())
				.status(ticket.getStatus())
				.createdAt(ticket.getCreatedAt())
				.updatedAt(ticket.getUpdatedAt())
				.build();
	}

	private TicketCommentResponse toCommentResponse(TicketComment comment) {
		return TicketCommentResponse.builder()
				.id(comment.getId())
				.ticketId(comment.getTicket().getId())
				.authorUserId(comment.getAuthorUserId())
				.content(comment.getContent())
				.createdAt(comment.getCreatedAt())
				.updatedAt(comment.getUpdatedAt())
				.build();
	}
}
