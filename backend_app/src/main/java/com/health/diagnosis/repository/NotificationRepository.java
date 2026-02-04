package com.health.diagnosis.repository;

import com.health.diagnosis.entity.Notification;
import com.health.diagnosis.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderByCreatedAtDesc(User user);

    Long countByUserAndIsReadFalse(User user);

    List<Notification> findTop10ByUserOrderByCreatedAtDesc(User user);
}
