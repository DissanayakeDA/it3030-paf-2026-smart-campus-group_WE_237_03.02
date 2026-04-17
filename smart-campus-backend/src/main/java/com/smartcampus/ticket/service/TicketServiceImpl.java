package com.smartcampus.ticket.service;

import java.io.IOException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.smartcampus.ticket.dto.AddResolutionNotesRequest;
import com.smartcampus.ticket.dto.AddTicketCommentRequest;
import com.smartcampus.ticket.dto.AssignTechnicianRequest;
import com.smartcampus.ticket.dto.CreateTicketRequest;
import com.smartcampus.ticket.dto.DeleteTicketCommentRequest;
import com.smartcampus.ticket.dto.TicketAttachmentResponse;
import com.smartcampus.ticket.dto.TicketCommentResponse;
import com.smartcampus.ticket.dto.TicketResponse;
import com.smartcampus.ticket.dto.TicketSlaResponse;
import com.smartcampus.ticket.dto.TicketSummaryResponse;
import com.smartcampus.ticket.dto.UpdateTicketCommentRequest;
import com.smartcampus.ticket.dto.UpdateTicketStatusRequest;
import com.smartcampus.ticket.entity.Ticket;
import com.smartcampus.ticket.entity.TicketAttachment;
import com.smartcampus.ticket.entity.TicketComment;
import com.smartcampus.ticket.enums.ActorRole;
import com.smartcampus.ticket.enums.TicketStatus;
import com.smartcampus.ticket.repository.TicketAttachmentRepository;
import com.smartcampus.ticket.repository.TicketCommentRepository;
import com.smartcampus.ticket.repository.TicketRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TicketServiceImpl implements TicketService {

	private final TicketRepository ticketRepository;

	private final TicketCommentRepository ticketCommentRepository;

	private final TicketAttachmentRepository ticketAttachmentRepository;

	private final Cloudinary cloudinary;

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
	@Transactional(readOnly = true)
	public Optional<TicketSlaResponse> getTicketSla(Long id) {
		return ticketRepository.findById(id).map(this::toSlaResponse);
	}

	@Override
	@Transactional(readOnly = true)
	public TicketSummaryResponse getSlaSummary() {
		Set<TicketStatus> resolvedStatuses = EnumSet.of(TicketStatus.RESOLVED, TicketStatus.CLOSED);
		long totalTickets = ticketRepository.count();
		long resolvedTickets = ticketRepository.countByStatusIn(resolvedStatuses);
		long openTickets = ticketRepository.countByStatusNotIn(resolvedStatuses);
		List<Ticket> all = ticketRepository.findAll();
		Double averageFirstResponseMinutes = averageMinutesBetweenCreatedAnd(
				all.stream().filter(t -> t.getFirstResponseAt() != null).toList(),
				t -> t.getFirstResponseAt());
		Double averageResolutionMinutes = averageMinutesBetweenCreatedAnd(
				all.stream().filter(t -> t.getResolvedAt() != null).toList(),
				t -> t.getResolvedAt());
		return TicketSummaryResponse.builder()
				.totalTickets(totalTickets)
				.openTickets(openTickets)
				.resolvedTickets(resolvedTickets)
				.averageFirstResponseMinutes(averageFirstResponseMinutes)
				.averageResolutionMinutes(averageResolutionMinutes)
				.build();
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
	public TicketAttachmentResponse uploadAttachment(Long ticketId, MultipartFile file) {
		Ticket ticket = ticketRepository.findById(ticketId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
		if (file == null || file.isEmpty()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
		}
		String contentType = file.getContentType();
		if (contentType == null || !contentType.toLowerCase().startsWith("image/")) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
		}
		if (ticketAttachmentRepository.countByTicketId(ticketId) >= 3) {
			throw new ResponseStatusException(HttpStatus.CONFLICT);
		}
		@SuppressWarnings("unchecked")
		Map<String, Object> uploadResult;
		try {
			uploadResult = cloudinary.uploader().upload(file.getBytes(),
					ObjectUtils.asMap("resource_type", "image"));
		} catch (IOException e) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
		} catch (Exception e) {
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR);
		}
		String fileUrl = (String) uploadResult.get("secure_url");
		if (fileUrl == null) {
			fileUrl = (String) uploadResult.get("url");
		}
		String publicId = (String) uploadResult.get("public_id");
		if (fileUrl == null || fileUrl.isBlank() || publicId == null || publicId.isBlank()) {
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR);
		}
		String originalName = file.getOriginalFilename();
		String fileName = (originalName != null && !originalName.isBlank()) ? originalName : "image";

		TicketAttachment attachment = TicketAttachment.builder()
				.ticket(ticket)
				.fileName(fileName)
				.fileType(contentType)
				.fileUrl(fileUrl)
				.publicId(publicId)
				.build();
		TicketAttachment saved = ticketAttachmentRepository.save(attachment);
		return toAttachmentResponse(saved);
	}

	@Override
	@Transactional(readOnly = true)
	public List<TicketAttachmentResponse> getAttachmentsByTicket(Long ticketId) {
		if (!ticketRepository.existsById(ticketId)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND);
		}
		return ticketAttachmentRepository.findByTicketId(ticketId).stream()
				.map(this::toAttachmentResponse)
				.toList();
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

	private TicketSlaResponse toSlaResponse(Ticket ticket) {
		Instant createdAt = ticket.getCreatedAt();
		Long timeToFirstResponseMinutes = null;
		if (ticket.getFirstResponseAt() != null) {
			timeToFirstResponseMinutes = ChronoUnit.MINUTES.between(createdAt, ticket.getFirstResponseAt());
		}
		Long timeToResolutionMinutes = null;
		if (ticket.getResolvedAt() != null) {
			timeToResolutionMinutes = ChronoUnit.MINUTES.between(createdAt, ticket.getResolvedAt());
		}
		return TicketSlaResponse.builder()
				.ticketId(ticket.getId())
				.timeToFirstResponseMinutes(timeToFirstResponseMinutes)
				.timeToResolutionMinutes(timeToResolutionMinutes)
				.build();
	}

	private Double averageMinutesBetweenCreatedAnd(List<Ticket> tickets, Function<Ticket, Instant> endInstant) {
		if (tickets.isEmpty()) {
			return null;
		}
		return tickets.stream()
				.mapToLong(t -> ChronoUnit.MINUTES.between(t.getCreatedAt(), endInstant.apply(t)))
				.average()
				.getAsDouble();
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

	private TicketAttachmentResponse toAttachmentResponse(TicketAttachment attachment) {
		return TicketAttachmentResponse.builder()
				.id(attachment.getId())
				.fileName(attachment.getFileName())
				.fileType(attachment.getFileType())
				.fileUrl(attachment.getFileUrl())
				.publicId(attachment.getPublicId())
				.uploadedAt(attachment.getUploadedAt())
				.build();
	}
}
