package com.smartcampus.auth.dto;

import java.time.Instant;

import com.smartcampus.auth.enums.Role;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private Long id;
    private String name;
    private String email;
    private Role role;
    private Instant createdAt;
    private Instant updatedAt;
}
