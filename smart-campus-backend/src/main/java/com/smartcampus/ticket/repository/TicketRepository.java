package com.smartcampus.ticket.repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartcampus.ticket.entity.Ticket;
import com.smartcampus.ticket.enums.TicketStatus;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

	long countByStatusIn(Collection<TicketStatus> statuses);

	long countByStatusNotIn(Collection<TicketStatus> statuses);

	List<Ticket> findAllByOrderByCreatedAtDesc();

	List<Ticket> findByStatusOrderByCreatedAtDesc(TicketStatus status);

	List<Ticket> findByCreatedByUserIdOrderByCreatedAtDesc(Long createdByUserId);

	List<Ticket> findByStatusAndCreatedByUserIdOrderByCreatedAtDesc(TicketStatus status, Long createdByUserId);

	List<Ticket> findByAssignedTechnicianIdOrderByCreatedAtDesc(Long assignedTechnicianId);

	List<Ticket> findByStatusAndAssignedTechnicianIdOrderByCreatedAtDesc(TicketStatus status, Long assignedTechnicianId);
}
