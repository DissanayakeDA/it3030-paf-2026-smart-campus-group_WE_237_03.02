package com.smartcampus.booking.service;

import com.smartcampus.auth.entity.User;
import com.smartcampus.auth.repository.UserRepository;
import com.smartcampus.booking.dto.BookingCreateRequest;
import com.smartcampus.booking.dto.BookingResponse;
import com.smartcampus.booking.entity.Booking;
import com.smartcampus.booking.enums.BookingStatus;
import com.smartcampus.booking.repository.BookingRepository;
import com.smartcampus.booking.repository.BookingRepository;
import com.smartcampus.auth.enums.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public BookingResponse createBooking(BookingCreateRequest request) {
        // Validation: Ensure endTime is after startTime
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End time must be after start time");
        }

        // Fetch user from repository
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Create booking entity
        Booking booking = Booking.builder()
                .resourceId(request.getResourceId())
                .user(user)
                .bookingDate(request.getBookingDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .purpose(request.getPurpose())
                .expectedAttendees(request.getExpectedAttendees())
                .status(BookingStatus.PENDING) // Default status
                .build();

        // Save booking
        Booking savedBooking = bookingRepository.save(booking);

        // Map to response DTO
        return mapToResponse(savedBooking);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings(Long userId) {
        return bookingRepository.findByUser_Id(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getAllBookings(BookingStatus status, LocalDate bookingDate, Long resourceId, Long userId, Role actorRole) {
        if (actorRole != Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can view all bookings");
        }
        return bookingRepository.findByFilters(status, bookingDate, resourceId, userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long id, Long userId, Role actorRole) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        // Role-based behavior: USER sees own bookings, ADMIN sees all
        if (actorRole != Role.ADMIN && !booking.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to view this booking");
        }

        return mapToResponse(booking);
    }

    private BookingResponse mapToResponse(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .resourceId(booking.getResourceId())
                .userId(booking.getUser().getId())
                .userName(booking.getUser().getName())
                .bookingDate(booking.getBookingDate())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .purpose(booking.getPurpose())
                .expectedAttendees(booking.getExpectedAttendees())
                .status(booking.getStatus())
                .adminReason(booking.getAdminReason())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
    }
}
