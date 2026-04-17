package com.smartcampus.resource.service;

import com.smartcampus.resource.dto.ResourceRequest;
import com.smartcampus.resource.dto.ResourceResponse;

public interface ResourceService {
    ResourceResponse createResource(ResourceRequest request);
}
