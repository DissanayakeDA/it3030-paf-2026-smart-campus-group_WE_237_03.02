package com.smartcampus.resource.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.smartcampus.resource.entity.Resource;
import com.smartcampus.resource.enums.ResourceCondition;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long>, JpaSpecificationExecutor<Resource> {

    List<Resource> findByConditionIn(List<ResourceCondition> conditions);
}
