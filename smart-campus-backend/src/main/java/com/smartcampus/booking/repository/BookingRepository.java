package com.smartcampus.booking.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smartcampus.booking.entity.Booking;
import com.smartcampus.booking.enums.BookingStatus;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

	List<Booking> findByResourceId(Long resourceId);

	List<Booking> findByResourceIdAndBookingDate(Long resourceId, LocalDate bookingDate);

	List<Booking> findByUser_Id(Long userId);

	List<Booking> findByUser_IdAndStatus(Long userId, BookingStatus status);

	List<Booking> findByStatus(BookingStatus status);

	List<Booking> findByBookingDateBetween(LocalDate startInclusive, LocalDate endInclusive);

	List<Booking> findByResourceIdAndBookingDateBetween(Long resourceId, LocalDate startInclusive,
			LocalDate endInclusive);

	List<Booking> findByResourceIdAndStatus(Long resourceId, BookingStatus status);
}
