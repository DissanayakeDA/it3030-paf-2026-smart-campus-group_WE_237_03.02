package com.smartcampus.booking.dto;

import com.smartcampus.auth.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.Size;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingReviewRequest {

    @Size(max = 2000, message = "Reason cannot exceed 2000 characters")
    private String reason;

    private Long actingUserId;

    private Role actorRole;
}
