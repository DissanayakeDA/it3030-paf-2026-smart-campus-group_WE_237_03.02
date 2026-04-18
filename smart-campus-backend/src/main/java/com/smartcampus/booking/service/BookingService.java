package com.smartcampus.booking.service;

import com.smartcampus.booking.dto.BookingCreateRequest;
import com.smartcampus.booking.dto.BookingResponse;
import com.smartcampus.booking.dto.BookingReviewRequest;
import com.smartcampus.booking.enums.BookingStatus;

import java.time.LocalDate;
import java.util.List;

public interface BookingService {
    BookingResponse createBooking(BookingCreateRequest request);

    List<BookingResponse> getMyBookings();

    List<BookingResponse> getAllBookings(BookingStatus status, LocalDate bookingDate, Long resourceId, Long userId);

    BookingResponse getBookingById(Long id);

    BookingResponse approveBooking(Long id, BookingReviewRequest request);

    BookingResponse rejectBooking(Long id, BookingReviewRequest request);

    BookingResponse cancelBooking(Long id, BookingReviewRequest request);
}
