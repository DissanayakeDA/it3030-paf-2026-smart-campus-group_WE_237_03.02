package com.smartcampus.resource.service;

import java.util.List;

import com.smartcampus.resource.dto.ResourceRequest;
import com.smartcampus.resource.dto.ResourceResponse;
import com.smartcampus.resource.dto.ResourceStatusRequest;
import com.smartcampus.resource.dto.UpdateResourceRequest;

public interface ResourceService {
    ResourceResponse createResource(ResourceRequest request);

    List<ResourceResponse> getAllResources();

    ResourceResponse getResourceById(Long id);

    ResourceResponse updateResource(Long id, UpdateResourceRequest request);

    ResourceResponse updateResourceStatus(Long id, ResourceStatusRequest request);

    void deleteResource(Long id);
}
