package com.placementportal.repository;

import com.placementportal.model.MockInterview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MockInterviewRepository extends JpaRepository<MockInterview, Long> {
    List<MockInterview> findByUserIdOrderByCreatedAtDesc(Long userId);
    long countByUserId(Long userId);
}
