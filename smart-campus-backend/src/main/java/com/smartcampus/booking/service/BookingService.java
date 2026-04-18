package com.smartcampus.booking.service;

import com.smartcampus.booking.dto.BookingCreateRequest;
import com.smartcampus.booking.dto.BookingResponse;

public interface BookingService {
    BookingResponse createBooking(BookingCreateRequest request);
}
