package com.health.diagnosis.repository;

import com.health.diagnosis.entity.DoctorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<DoctorProfile, Long> {
    // Find doctors by User's specialization (which is stored in User table
    // currently,
    // but usually cleaner to look up via a join or keeping specialization in
    // profile)
    // For simplicity, we used specialization in User table in Auth step.

    @Query("SELECT d FROM DoctorProfile d WHERE d.user.specialization = :specialization")
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "user" })
    List<DoctorProfile> findBySpecialization(String specialization);

    Optional<DoctorProfile> findByUser(com.health.diagnosis.entity.User user);
}
