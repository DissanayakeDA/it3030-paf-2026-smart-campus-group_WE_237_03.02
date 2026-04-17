package com.smartcampus.resource.dto;

import com.smartcampus.resource.enums.ResourceStatus;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResourceStatusRequest {
    @NotNull(message = "Status is required")
    private ResourceStatus status;
}
