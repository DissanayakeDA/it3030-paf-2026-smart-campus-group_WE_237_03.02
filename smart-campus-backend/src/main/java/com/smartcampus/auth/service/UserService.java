package com.smartcampus.auth.service;

import java.util.List;
import java.util.Optional;

import com.smartcampus.auth.dto.CreateUserRequest;
import com.smartcampus.auth.dto.UpdateUserRequest;
import com.smartcampus.auth.dto.UserResponse;
import com.smartcampus.auth.enums.Role;

public interface UserService {

	UserResponse createUser(CreateUserRequest request);

	List<UserResponse> getAllUsers();

	Optional<UserResponse> getUserById(Long id);

	UserResponse getMyProfile();

	UserResponse updateMyProfile(UpdateUserRequest request);

	UserResponse updateUser(Long id, UpdateUserRequest request);

	UserResponse updateUserRole(Long id, Role role);

	void deleteUser(Long id);
}
