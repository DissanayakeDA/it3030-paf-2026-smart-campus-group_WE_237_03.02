package com.smartcampus.booking.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

	@Query("SELECT b FROM Booking b WHERE " +
			"(:status IS NULL OR b.status = :status) AND " +
			"(:bookingDate IS NULL OR b.bookingDate = :bookingDate) AND " +
			"(:resourceId IS NULL OR b.resourceId = :resourceId) AND " +
			"(:userId IS NULL OR b.user.id = :userId)")
	List<Booking> findByFilters(
			@Param("status") BookingStatus status,
			@Param("bookingDate") java.time.LocalDate bookingDate,
			@Param("resourceId") Long resourceId,
			@Param("userId") Long userId);
}
