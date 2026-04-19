package com.smartcampus.booking.service;

import com.smartcampus.booking.dto.BookingCreateRequest;
import com.smartcampus.booking.dto.BookingResponse;
import com.smartcampus.booking.dto.BookingReviewRequest;
import com.smartcampus.booking.dto.BookingUpdateRequest;
import com.smartcampus.booking.enums.BookingStatus;
import com.smartcampus.auth.enums.Role;

import java.time.LocalDate;
import java.util.List;

public interface BookingService {
    BookingResponse createBooking(BookingCreateRequest request);
    BookingResponse updateBooking(Long id, BookingUpdateRequest request);
    List<BookingResponse> getMyBookings(Long userId);
    List<BookingResponse> getAllBookings(BookingStatus status, LocalDate bookingDate, Long resourceId, Long userId, Role actorRole, Long actingUserId);
    BookingResponse getBookingById(Long id, Long actingUserId, Role actorRole);
    BookingResponse approveBooking(Long id, BookingReviewRequest request);
    BookingResponse rejectBooking(Long id, BookingReviewRequest request);
    BookingResponse cancelBooking(Long id, BookingReviewRequest request);
    void deleteBooking(Long id, Long actingUserId);
}
