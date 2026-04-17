package com.smartcampus.ticket.repository;

import java.util.Collection;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartcampus.ticket.entity.Ticket;
import com.smartcampus.ticket.enums.TicketStatus;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

	long countByStatusIn(Collection<TicketStatus> statuses);

	long countByStatusNotIn(Collection<TicketStatus> statuses);
}
