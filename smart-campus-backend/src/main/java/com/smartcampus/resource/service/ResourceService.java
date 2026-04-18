package com.smartcampus.resource.service;

import java.util.List;
import com.smartcampus.resource.dto.ResourceRequest;
import com.smartcampus.resource.dto.ResourceResponse;
import com.smartcampus.resource.dto.ResourceStatusRequest;
import com.smartcampus.resource.dto.ResourceConditionRequest;
import com.smartcampus.resource.dto.UpdateResourceRequest;
import com.smartcampus.resource.enums.ResourceStatus;
import com.smartcampus.resource.enums.ResourceType;

public interface ResourceService {
    ResourceResponse createResource(ResourceRequest request);

    ResourceResponse getResourceById(Long id);

    List<ResourceResponse> getAllResources(ResourceType type, Integer minCapacity, String location,
            ResourceStatus status);

    ResourceResponse updateResource(Long id, UpdateResourceRequest request);

    void deleteResource(Long id);

    ResourceResponse updateResourceStatus(Long id, ResourceStatus status);

    // Condition Management
    ResourceResponse updateResourceCondition(Long id, ResourceConditionRequest request);

    List<ResourceResponse> getResourcesNeedingAttention();
}
