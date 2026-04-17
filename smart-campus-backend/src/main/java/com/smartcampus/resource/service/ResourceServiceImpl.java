package com.smartcampus.resource.service;

import java.util.List;
import java.time.Instant;
import java.util.Arrays;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.smartcampus.resource.dto.ResourceConditionRequest;
import com.smartcampus.resource.dto.ResourceRequest;
import com.smartcampus.resource.dto.ResourceResponse;
import com.smartcampus.resource.dto.ResourceStatusRequest;
import com.smartcampus.resource.dto.UpdateResourceRequest;
import com.smartcampus.resource.entity.Resource;
import com.smartcampus.resource.enums.ResourceCondition;
import com.smartcampus.resource.enums.ResourceStatus;
import com.smartcampus.resource.enums.ResourceType;
import com.smartcampus.resource.repository.ResourceRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;

    @Override
    @Transactional
    public ResourceResponse createResource(ResourceRequest request) {
        if (request.getAvailableFrom().isAfter(request.getAvailableTo())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Available from time must be before available to time");
        }
        validateTimeRange(request.getAvailableFrom(), request.getAvailableTo());

        Resource resource = Resource.builder()
                .name(request.getName())
                .description(request.getDescription())
                .type(request.getType())
                .capacity(request.getCapacity())
                .location(request.getLocation())
                .availableFrom(request.getAvailableFrom())
                .availableTo(request.getAvailableTo())
                .status(request.getStatus())
                .condition(request.getCondition())
                .inspectionNotes(request.getInspectionNotes())
                .build();

        return mapToResponse(resourceRepository.save(resource));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResourceResponse> getAllResources(ResourceType type, Integer minCapacity, String location,
            ResourceStatus status) {
        return resourceRepository.findByFilters(type, minCapacity, location, status).stream()
                .map(this::mapToResponse)
                .toList();
    public ResourceResponse getResourceById(Long id) {
        return resourceRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public ResourceResponse getResourceById(Long id) {
        return resourceRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    public List<ResourceResponse> getAllResources(ResourceType type, Integer minCapacity, String location,
            ResourceStatus status) {
        return resourceRepository.findByFilters(type, minCapacity, location, status)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ResourceResponse updateResource(Long id, UpdateResourceRequest request) {
        if (request.getAvailableFrom().isAfter(request.getAvailableTo())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Available from time must be before available to time");
        }

        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        validateTimeRange(request.getAvailableFrom(), request.getAvailableTo());

        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found"));

        resource.setName(request.getName());
        resource.setDescription(request.getDescription());
        resource.setType(request.getType());
        resource.setCapacity(request.getCapacity());
        resource.setLocation(request.getLocation());
        resource.setAvailableFrom(request.getAvailableFrom());
        resource.setAvailableTo(request.getAvailableTo());
        resource.setStatus(request.getStatus());
        if (request.getCondition() != null) {
            resource.setCondition(request.getCondition());
        }
        if (request.getInspectionNotes() != null) {
            resource.setInspectionNotes(request.getInspectionNotes());
        }

        return mapToResponse(resourceRepository.save(resource));
    }

    @Override
    @Transactional
    public ResourceResponse updateResourceStatus(Long id, ResourceStatusRequest request) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        resource.setStatus(request.getStatus());
    public void deleteResource(Long id) {
        if (!resourceRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found");
        }
        resourceRepository.deleteById(id);
    }

    @Override
    @Transactional
    public ResourceResponse updateResourceStatus(Long id, ResourceStatus status) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found"));
        resource.setStatus(status);
        return mapToResponse(resourceRepository.save(resource));
    }

    @Override
    @Transactional
    public ResourceResponse updateResourceCondition(Long id, ResourceConditionRequest request) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found"));

        resource.setCondition(request.getCondition());
        resource.setLastInspectedAt(Instant.now());
        if (request.getInspectionNotes() != null) {
            resource.setInspectionNotes(request.getInspectionNotes());
        }

        return mapToResponse(resourceRepository.save(resource));
    }

    @Override
    @Transactional
    public void deleteResource(Long id) {
        if (!resourceRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        resourceRepository.deleteById(id);
    @Transactional(readOnly = true)
    public List<ResourceResponse> getResourcesNeedingAttention() {
        return resourceRepository.findByConditionIn(Arrays.asList(
                ResourceCondition.NEEDS_ATTENTION,
                ResourceCondition.UNDER_MAINTENANCE))
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private void validateTimeRange(java.time.LocalTime from, java.time.LocalTime to) {
        if (from != null && to != null && !from.isBefore(to)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Available from time must be before available to time");
        }
    }

    private ResourceResponse mapToResponse(Resource resource) {
        return ResourceResponse.builder()
                .id(resource.getId())
                .name(resource.getName())
                .description(resource.getDescription())
                .type(resource.getType())
                .capacity(resource.getCapacity())
                .location(resource.getLocation())
                .availableFrom(resource.getAvailableFrom())
                .availableTo(resource.getAvailableTo())
                .status(resource.getStatus())
                .condition(resource.getCondition())
                .lastInspectedAt(resource.getLastInspectedAt())
                .inspectionNotes(resource.getInspectionNotes())
                .createdAt(resource.getCreatedAt())
                .updatedAt(resource.getUpdatedAt())
                .build();
    }
}
