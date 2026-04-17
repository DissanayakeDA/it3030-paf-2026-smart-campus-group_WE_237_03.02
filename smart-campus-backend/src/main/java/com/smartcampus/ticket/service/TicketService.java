package com.smartcampus.ticket.service;

import java.util.Optional;

import com.smartcampus.ticket.dto.CreateTicketRequest;
import com.smartcampus.ticket.dto.TicketResponse;

public interface TicketService {

	TicketResponse createTicket(CreateTicketRequest request);

	Optional<TicketResponse> getTicketById(Long id);
}
