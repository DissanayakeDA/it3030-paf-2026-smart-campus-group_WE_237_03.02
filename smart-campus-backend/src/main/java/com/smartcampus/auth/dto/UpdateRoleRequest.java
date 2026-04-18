package com.smartcampus.auth.dto;

import com.smartcampus.auth.enums.Role;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateRoleRequest {

    @NotNull(message = "Role is required")
    private Role role;
}
