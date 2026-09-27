package com.placementportal.repository;

import com.placementportal.model.ResumeAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ResumeAnalysisRepository extends JpaRepository<ResumeAnalysis, Long> {
    List<ResumeAnalysis> findByUserIdOrderByCreatedAtDesc(Long userId);
}
