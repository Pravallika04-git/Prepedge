package com.placementportal.repository;

import com.placementportal.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findBySessionIdOrderByCreatedAtAsc(String sessionId);
    List<ChatMessage> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT DISTINCT cm.sessionId FROM ChatMessage cm WHERE cm.user.id = :userId ORDER BY cm.sessionId DESC")
    List<String> findDistinctSessionIdsByUserId(Long userId);
}
