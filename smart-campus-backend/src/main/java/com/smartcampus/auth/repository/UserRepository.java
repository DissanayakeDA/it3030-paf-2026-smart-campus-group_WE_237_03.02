package com.smartcampus.auth.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smartcampus.auth.entity.User;
import com.smartcampus.auth.enums.Role;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmailIgnoreCase(String email);

    Optional<User> findByOauthSubject(String oauthSubject);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByOauthSubject(String oauthSubject);

    boolean existsByRole(Role role);

    long countByRole(Role role);
}
