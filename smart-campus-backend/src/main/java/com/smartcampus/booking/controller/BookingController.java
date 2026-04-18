package com.smartcampus.booking.controller;

import com.smartcampus.booking.dto.BookingCreateRequest;
import com.smartcampus.booking.dto.BookingResponse;
import com.smartcampus.booking.dto.BookingReviewRequest;
import com.smartcampus.booking.enums.BookingStatus;
import com.smartcampus.booking.service.BookingService;
import com.smartcampus.auth.enums.Role;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(@Valid @RequestBody BookingCreateRequest request) {
        BookingResponse response = bookingService.createBooking(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/my")
    public ResponseEntity<List<BookingResponse>> getMyBookings(@RequestParam Long actingUserId) {
        return ResponseEntity.ok(bookingService.getMyBookings(actingUserId));
    }

    @GetMapping
    public ResponseEntity<List<BookingResponse>> getAllBookings(
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) LocalDate bookingDate,
            @RequestParam(required = false) Long resourceId,
            @RequestParam(required = false) Long userId,
            @RequestParam Role actorRole,
            @RequestParam Long actingUserId) {
        return ResponseEntity.ok(bookingService.getAllBookings(status, bookingDate, resourceId, userId, actorRole));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(
            @PathVariable Long id,
            @RequestParam Long actingUserId,
            @RequestParam Role actorRole) {
        return ResponseEntity.ok(bookingService.getBookingById(id, actingUserId, actorRole));
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<BookingResponse> approveBooking(
            @PathVariable Long id,
            @Valid @RequestBody BookingReviewRequest request) {
        return ResponseEntity.ok(bookingService.approveBooking(id, request));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<BookingResponse> rejectBooking(
            @PathVariable Long id,
            @Valid @RequestBody BookingReviewRequest request) {
        return ResponseEntity.ok(bookingService.rejectBooking(id, request));
    }
}
