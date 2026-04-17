package com.smartcampus.resource.dto;

import com.smartcampus.resource.enums.ResourceCondition;

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
public class ResourceConditionRequest {
    @NotNull(message = "Condition is required")
    private ResourceCondition condition;

    private String inspectionNotes;
}
