package com.health.diagnosis.repository;

import com.health.diagnosis.entity.Diagnosis;
import com.health.diagnosis.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiagnosisRepository extends JpaRepository<Diagnosis, Long> {
    List<Diagnosis> findByUserOrderByCreatedAtDesc(User user);

    List<Diagnosis> findByUser(User user);
}
