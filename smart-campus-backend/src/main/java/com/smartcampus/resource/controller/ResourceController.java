package com.smartcampus.resource.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.resource.dto.ResourceConditionRequest;
import com.smartcampus.resource.dto.ResourceRequest;
import com.smartcampus.resource.dto.ResourceResponse;
import com.smartcampus.resource.dto.UpdateResourceRequest;
import com.smartcampus.resource.enums.ResourceStatus;
import com.smartcampus.resource.enums.ResourceType;
import com.smartcampus.resource.service.ResourceService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    @PostMapping
    public ResponseEntity<ResourceResponse> createResource(@Valid @RequestBody ResourceRequest request) {
        return new ResponseEntity<>(resourceService.createResource(request), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResourceResponse> getResourceById(@PathVariable Long id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    @GetMapping
    public ResponseEntity<List<ResourceResponse>> getAllResources(
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) ResourceStatus status) {
        return ResponseEntity.ok(resourceService.getAllResources(type, minCapacity, location, status));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResourceResponse> updateResource(
            @PathVariable Long id,
            @Valid @RequestBody UpdateResourceRequest request) {
        return ResponseEntity.ok(resourceService.updateResource(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ResourceResponse> updateResourceStatus(
            @PathVariable Long id,
            @RequestParam ResourceStatus status) {
        return ResponseEntity.ok(resourceService.updateResourceStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }

    // Condition Management Endpoints

    @PatchMapping("/{id}/condition")
    public ResponseEntity<ResourceResponse> updateResourceCondition(
            @PathVariable Long id,
            @Valid @RequestBody ResourceConditionRequest request) {
        return ResponseEntity.ok(resourceService.updateResourceCondition(id, request));
    }

    @GetMapping("/needs-attention")
    public ResponseEntity<List<ResourceResponse>> getResourcesNeedingAttention() {
        return ResponseEntity.ok(resourceService.getResourcesNeedingAttention());
    }
}
