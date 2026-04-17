package com.smartcampus.resource.service;

import java.util.List;

import com.smartcampus.resource.dto.ResourceRequest;
import com.smartcampus.resource.dto.ResourceResponse;

public interface ResourceService {
    ResourceResponse createResource(ResourceRequest request);

    List<ResourceResponse> getAllResources();
    ResourceResponse getResourceById(Long id);
}
