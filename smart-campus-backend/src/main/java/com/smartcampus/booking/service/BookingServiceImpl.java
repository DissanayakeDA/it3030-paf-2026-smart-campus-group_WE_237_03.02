package com.smartcampus.booking.service;

import com.smartcampus.auth.entity.User;
import com.smartcampus.auth.repository.UserRepository;
import com.smartcampus.booking.dto.BookingCreateRequest;
import com.smartcampus.booking.dto.BookingResponse;
import com.smartcampus.booking.dto.BookingReviewRequest;
import com.smartcampus.booking.entity.Booking;
import com.smartcampus.booking.enums.BookingStatus;
import com.smartcampus.booking.repository.BookingRepository;
import com.smartcampus.auth.enums.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalTime;
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

        // Check for conflicts with existing APPROVED bookings
        checkForConflicts(request.getResourceId(), request.getBookingDate(), request.getStartTime(), request.getEndTime(), -1L);

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
    public List<BookingResponse> getAllBookings(BookingStatus status, LocalDate bookingDate, Long resourceId, Long userId, Role actorRole, Long actingUserId) {
        // Verify user exists
        userRepository.findById(actingUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Acting user not found"));

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
    public BookingResponse getBookingById(Long id, Long actingUserId, Role actorRole) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        // Verify user exists
        userRepository.findById(actingUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Acting user not found"));

        // Role-based behavior: USER sees own bookings, ADMIN sees all
        if (actorRole != Role.ADMIN && !booking.getUser().getId().equals(actingUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to view this booking");
        }

        return mapToResponse(booking);
    }

    @Override
    @Transactional
    public BookingResponse approveBooking(Long id, BookingReviewRequest request) {
        // Verify user exists
        userRepository.findById(request.getActingUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Acting user not found"));

        if (request.getActorRole() != Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can approve bookings");
        }

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only pending bookings can be approved");
        }

        // Check for conflicts before approving
        checkForConflicts(booking.getResourceId(), booking.getBookingDate(), booking.getStartTime(), booking.getEndTime(), id);

        booking.setStatus(BookingStatus.APPROVED);
        if (request.getReason() != null) {
            booking.setAdminReason(request.getReason());
        }

        return mapToResponse(bookingRepository.save(booking));
    }

    private void checkForConflicts(Long resourceId, LocalDate date, LocalTime start, LocalTime end, Long excludeId) {
        List<Booking> conflicts = bookingRepository.findOverlappingBookings(resourceId, date, start, end, excludeId);
        if (!conflicts.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This resource is already booked for the selected time range");
        }
    }

    @Override
    @Transactional
    public BookingResponse rejectBooking(Long id, BookingReviewRequest request) {
        // Verify user exists
        userRepository.findById(request.getActingUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Acting user not found"));

        if (request.getActorRole() != Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can reject bookings");
        }

        if (request.getReason() == null || request.getReason().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rejection reason is required");
        }

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only pending bookings can be rejected");
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setAdminReason(request.getReason());

        return mapToResponse(bookingRepository.save(booking));
    }

    @Override
    @Transactional
    public BookingResponse cancelBooking(Long id, BookingReviewRequest request) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));

        // Step 1: Rule: Only APPROVED bookings can be cancelled
        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only approved bookings can be cancelled");
        }

        // Step 2: Fetch actor and check authorization
        userRepository.findById(request.getActingUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Acting user not found"));

        boolean isOwner = booking.getUser().getId().equals(request.getActingUserId());
        boolean isAdmin = request.getActorRole() == Role.ADMIN;

        if (!isOwner && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to cancel this booking");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        if (request.getReason() != null) {
            booking.setAdminReason(request.getReason());
        }

        return mapToResponse(bookingRepository.save(booking));
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
