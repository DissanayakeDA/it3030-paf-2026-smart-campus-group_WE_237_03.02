package com.smartcampus.ticket.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartcampus.ticket.entity.TicketComment;

public interface TicketCommentRepository extends JpaRepository<TicketComment, Long> {

	List<TicketComment> findByTicketIdOrderByCreatedAtAsc(Long ticketId);
}
