package com.smartcampus.resource.controller;

import java.lang.SuppressWarnings;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.resource.dto.ResourceRequest;
import com.smartcampus.resource.dto.ResourceResponse;
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

    @GetMapping
    public ResponseEntity<List<ResourceResponse>> getAllResources() {
        return ResponseEntity.ok(resourceService.getAllResources());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResourceResponse> getResourceById(@PathVariable Long id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }
}
