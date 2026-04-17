package com.smartcampus.ticket.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.smartcampus.ticket.entity.TicketAttachment;

public interface TicketAttachmentRepository extends JpaRepository<TicketAttachment, Long> {

	@Query("SELECT a FROM TicketAttachment a WHERE a.ticket.id = :ticketId ORDER BY a.uploadedAt ASC")
	List<TicketAttachment> findByTicketId(@Param("ticketId") Long ticketId);

	@Query("SELECT COUNT(a) FROM TicketAttachment a WHERE a.ticket.id = :ticketId")
	long countByTicketId(@Param("ticketId") Long ticketId);
}
