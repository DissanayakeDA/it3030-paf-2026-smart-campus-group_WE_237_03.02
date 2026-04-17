package com.smartcampus.ticket.service;

import java.util.Optional;

import com.smartcampus.ticket.dto.AddResolutionNotesRequest;
import com.smartcampus.ticket.dto.AssignTechnicianRequest;
import com.smartcampus.ticket.dto.CreateTicketRequest;
import com.smartcampus.ticket.dto.TicketResponse;
import com.smartcampus.ticket.dto.UpdateTicketStatusRequest;

public interface TicketService {

	TicketResponse createTicket(CreateTicketRequest request);

	Optional<TicketResponse> getTicketById(Long id);

	TicketResponse assignTechnician(Long ticketId, AssignTechnicianRequest request);

	TicketResponse updateTicketStatus(Long ticketId, UpdateTicketStatusRequest request);

	TicketResponse addResolutionNotes(Long ticketId, AddResolutionNotesRequest request);
}
