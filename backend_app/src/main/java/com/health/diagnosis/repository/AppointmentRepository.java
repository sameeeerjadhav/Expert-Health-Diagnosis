package com.health.diagnosis.repository;

import com.health.diagnosis.entity.Appointment;
import com.health.diagnosis.entity.User;
import com.health.diagnosis.enums.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByPatient(User patient);

    List<Appointment> findByDoctor(User doctor);

    List<Appointment> findByStatus(AppointmentStatus status);

    @Query("SELECT a FROM Appointment a WHERE a.appointmentDate >= :date ORDER BY a.appointmentDate ASC")
    List<Appointment> findUpcomingAppointments(LocalDate date);

    @Query("SELECT a FROM Appointment a WHERE a.patient = :patient AND a.appointmentDate >= :date ORDER BY a.appointmentDate ASC")
    List<Appointment> findUpcomingByPatient(User patient, LocalDate date);

    @Query("SELECT a FROM Appointment a WHERE a.doctor = :doctor AND a.appointmentDate >= :date ORDER BY a.appointmentDate ASC")
    List<Appointment> findUpcomingByDoctor(User doctor, LocalDate date);

    @Query("SELECT a FROM Appointment a WHERE a.doctor = :doctor AND a.appointmentDate = :date")
    List<Appointment> findByDoctorAndDate(User doctor, LocalDate date);

    // Past appointments
    @Query("SELECT a FROM Appointment a WHERE a.patient = :patient AND a.appointmentDate < :date ORDER BY a.appointmentDate DESC")
    List<Appointment> findPastByPatient(User patient, LocalDate date);

    @Query("SELECT a FROM Appointment a WHERE a.doctor = :doctor AND a.appointmentDate < :date ORDER BY a.appointmentDate DESC")
    List<Appointment> findPastByDoctor(User doctor, LocalDate date);

    // Cancelled appointments
    @Query("SELECT a FROM Appointment a WHERE a.patient = :patient AND a.status = 'CANCELLED' ORDER BY a.appointmentDate DESC")
    List<Appointment> findCancelledByPatient(User patient);

    @Query("SELECT a FROM Appointment a WHERE a.doctor = :doctor AND a.status = 'CANCELLED' ORDER BY a.appointmentDate DESC")
    List<Appointment> findCancelledByDoctor(User doctor);
}
