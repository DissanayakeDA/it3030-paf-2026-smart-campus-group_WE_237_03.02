package com.smartcampus.ticket.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartcampus.ticket.entity.Ticket;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
}
