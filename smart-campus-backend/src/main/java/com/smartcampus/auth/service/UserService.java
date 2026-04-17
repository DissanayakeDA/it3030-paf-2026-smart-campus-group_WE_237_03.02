package com.smartcampus.auth.service;

import java.util.List;
import java.util.Optional;

import com.smartcampus.auth.dto.CreateUserRequest;
import com.smartcampus.auth.dto.UserResponse;

public interface UserService {

    UserResponse createUser(CreateUserRequest request);

    List<UserResponse> getAllUsers();

    Optional<UserResponse> getUserById(Long id);
}
