package com.smartcampus.ticket.service;

import java.util.List;
import java.util.Optional;

import org.springframework.web.multipart.MultipartFile;

import com.smartcampus.ticket.dto.AddResolutionNotesRequest;
import com.smartcampus.ticket.dto.AddTicketCommentRequest;
import com.smartcampus.ticket.dto.AssignTechnicianRequest;
import com.smartcampus.ticket.dto.CreateTicketRequest;
import com.smartcampus.ticket.dto.DeleteTicketCommentRequest;
import com.smartcampus.ticket.dto.TicketAttachmentResponse;
import com.smartcampus.ticket.dto.TicketCommentResponse;
import com.smartcampus.ticket.dto.TicketResponse;
import com.smartcampus.ticket.dto.UpdateTicketCommentRequest;
import com.smartcampus.ticket.dto.UpdateTicketStatusRequest;

public interface TicketService {

	TicketResponse createTicket(CreateTicketRequest request);

	Optional<TicketResponse> getTicketById(Long id);

	TicketResponse assignTechnician(Long ticketId, AssignTechnicianRequest request);

	TicketResponse updateTicketStatus(Long ticketId, UpdateTicketStatusRequest request);

	TicketResponse addResolutionNotes(Long ticketId, AddResolutionNotesRequest request);

	TicketCommentResponse addTicketComment(Long ticketId, AddTicketCommentRequest request);

	List<TicketCommentResponse> listTicketComments(Long ticketId);

	TicketCommentResponse updateTicketComment(Long commentId, UpdateTicketCommentRequest request);

	void deleteTicketComment(Long commentId, DeleteTicketCommentRequest request);

	TicketAttachmentResponse uploadAttachment(Long ticketId, MultipartFile file);

	List<TicketAttachmentResponse> getAttachmentsByTicket(Long ticketId);
}
