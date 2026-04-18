package com.smartcampus.booking.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingReviewRequest {

    @Size(max = 2000, message = "Reason cannot exceed 2000 characters")
    private String reason;
}
