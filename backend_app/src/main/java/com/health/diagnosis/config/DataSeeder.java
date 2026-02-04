package com.health.diagnosis.config;

import com.health.diagnosis.entity.*;
import com.health.diagnosis.enums.AppointmentStatus;
import com.health.diagnosis.enums.Role;
import com.health.diagnosis.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.*;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

        private final QuestionRepository questionRepository;
        private final UserRepository userRepository;
        private final DoctorRepository doctorRepository;
        private final AppointmentRepository appointmentRepository;
        private final DiagnosisRepository diagnosisRepository;
        private final PasswordEncoder passwordEncoder;

        @Override
        public void run(String... args) throws Exception {
                seedQuestions();
                seedAdmin();
                seedDoctors();
                seedPatients();
                seedAppointments();
                seedDiagnoses();
        }

        private void seedQuestions() {
                if (questionRepository.count() == 0) {
                        List<Question> questions = List.of(
                                        Question.builder().text(
                                                        "Do you have little interest or pleasure in doing things?")
                                                        .category("Depression").build(),
                                        Question.builder().text("Do you feel down, depressed, or hopeless?")
                                                        .category("Depression").build(),
                                        Question.builder().text(
                                                        "Do you have trouble falling or staying asleep, or sleeping too much?")
                                                        .category("General").build(),
                                        Question.builder().text("Do you feel tired or have little energy?")
                                                        .category("General").build(),
                                        Question.builder().text("Do you have poor appetite or overeating?")
                                                        .category("Health").build(),
                                        Question.builder().text(
                                                        "Do you feel bad about yourself - or that you are a failure?")
                                                        .category("Self-Esteem").build(),
                                        Question.builder().text(
                                                        "Do you have trouble concentrating on things, such as reading the newspaper?")
                                                        .category("Focus").build(),
                                        Question.builder().text(
                                                        "Do you move or speak so slowly that other people could have noticed?")
                                                        .category("Behavior").build(),
                                        Question.builder().text(
                                                        "Do you have thoughts that you would be better off dead, or of hurting yourself?")
                                                        .category("Severe").build(),
                                        Question.builder().text("Do you feel anxious, nervous or on edge?")
                                                        .category("Anxiety").build(),
                                        Question.builder().text(
                                                        "Do you obsessively worry about things you cannot control?")
                                                        .category("Anxiety").build(),
                                        Question.builder().text("Do you feel restless or hard to sit still?")
                                                        .category("Hyperactivity").build(),
                                        Question.builder().text("Do you have frequent mood swings?").category("Mood")
                                                        .build(),
                                        Question.builder()
                                                        .text("Do you feel isolated or lonely even when around others?")
                                                        .category("Social").build(),
                                        Question.builder().text(
                                                        "Do you find yourself becoming easily annoyed or irritable?")
                                                        .category("Mood").build(),
                                        Question.builder()
                                                        .text("Do you experience panic attacks (sudden intense fear)?")
                                                        .category("Anxiety").build(),
                                        Question.builder().text(
                                                        "Do you avoid social situations due to fear of judgement?")
                                                        .category("Social").build(),
                                        Question.builder().text("Do you have recurring intrusive thoughts?")
                                                        .category("OCD").build(),
                                        Question.builder().text("Do you feel the need to check things repeatedly?")
                                                        .category("OCD").build(),
                                        Question.builder().text("Do you forget things easily in your daily life?")
                                                        .category("Memory").build(),
                                        Question.builder().text("Do you have trouble making decisions?")
                                                        .category("Focus").build(),
                                        Question.builder().text("Do you feel overwhelmed by your daily tasks?")
                                                        .category("Stress").build(),
                                        Question.builder().text(
                                                        "Do you have physical symptoms like headaches or stomach aches without a cause?")
                                                        .category("Psychosomatic").build(),
                                        Question.builder().text("Do you feel detached from reality or yourself?")
                                                        .category("Dissociation").build());
                        questionRepository.saveAll(questions);
                        System.out.println("✓ Seeded 24 questions");
                }
        }

        private void seedAdmin() {
                if (userRepository.findByEmail("admin@health.com").isEmpty()) {
                        User admin = User.builder()
                                        .fullName("System Administrator")
                                        .email("admin@health.com")
                                        .password(passwordEncoder.encode("admin123"))
                                        .role(Role.ADMIN)
                                        .phone("+91-9876543210")
                                        .build();
                        userRepository.save(admin);
                        System.out.println("✓ Seeded admin user");
                }
        }

        private void seedDoctors() {
                if (userRepository.findByRole(Role.DOCTOR).isEmpty()) {

                        // Indian Doctors with COMPLETE profiles
                        List<Object[]> doctorsData = List.of(
                                        new Object[] { "Dr. Rajesh Kumar", "rajesh@hospital.com", "Psychiatrist",
                                                        "12 Years", "MBBS, MD (Psychiatry)",
                                                        "Expert in depression and anxiety disorders. Practices evidence-based treatment approaches.",
                                                        "Apollo Hospital, Connaught Place, New Delhi", 4.8,
                                                        "10:00 AM - 6:00 PM", 1500.0, "Hindi, English, Punjabi" },

                                        new Object[] { "Dr. Priya Sharma", "priya@hospital.com",
                                                        "Clinical Psychologist", "8 Years",
                                                        "MA Psychology, PhD Clinical Psychology",
                                                        "Specializes in cognitive behavioral therapy and mindfulness techniques.",
                                                        "Manipal Hospital, Whitefield, Bangalore", 4.7,
                                                        "9:00 AM - 5:00 PM", 1200.0, "Hindi, English, Kannada" },

                                        new Object[] { "Dr. Arjun Patel", "arjun@hospital.com", "Therapist", "6 Years",
                                                        "MSc Counseling Psychology",
                                                        "Focuses on stress management and relationship counseling.",
                                                        "Fortis Hospital, Vashi, Mumbai", 4.6, "11:00 AM - 7:00 PM",
                                                        1000.0, "Hindi, English, Gujarati, Marathi" },

                                        new Object[] { "Dr. Sneha Reddy", "sneha@hospital.com", "Counselor", "10 Years",
                                                        "MA Clinical Psychology, MPhil",
                                                        "Experienced in trauma counseling and family therapy.",
                                                        "Care Hospital, Banjara Hills, Hyderabad", 4.9,
                                                        "10:00 AM - 6:00 PM", 1300.0, "Telugu, English, Hindi" },

                                        new Object[] { "Dr. Vikram Singh", "vikram@hospital.com", "Psychiatrist",
                                                        "15 Years", "MBBS, DPM, DNB Psychiatry",
                                                        "Senior consultant specializing in bipolar disorder and schizophrenia.",
                                                        "Ruby Hall Clinic, Pune", 4.8, "9:00 AM - 4:00 PM", 1800.0,
                                                        "Hindi, English, Marathi" });

                        for (Object[] data : doctorsData) {
                                User doctor = User.builder()
                                                .fullName((String) data[0])
                                                .email((String) data[1])
                                                .password(passwordEncoder.encode("doctor123"))
                                                .role(Role.DOCTOR)
                                                .specialization((String) data[2])
                                                .experience((String) data[3])
                                                .isVerified(true)
                                                .phone("+91-" + (9000000000L + new Random().nextInt(999999999)))
                                                .build();
                                userRepository.save(doctor);

                                DoctorProfile profile = DoctorProfile.builder()
                                                .user(doctor)
                                                .qualifications((String) data[4])
                                                .bio((String) data[5])
                                                .clinicAddress((String) data[6])
                                                .rating((Double) data[7])
                                                .availableHours((String) data[8])
                                                .consultationFee((Double) data[9])
                                                .languagesSpoken((String) data[10])
                                                .yearsOfExperience(Integer.parseInt(((String) data[3]).split(" ")[0]))
                                                .build();
                                doctorRepository.save(profile);
                        }

                        System.out.println("✓ Seeded 5 Indian doctors with complete profiles");
                }
        }

        private void seedPatients() {
                if (userRepository.findByRole(Role.PATIENT).size() < 7) {
                        List<Object[]> patientsData = List.of(
                                        new Object[] { "Amit Verma", "amit@test.com", 28, "Male", "O+",
                                                        "+91-9123456780", "Sector 15, Noida, UP", null },
                                        new Object[] { "Neha Gupta", "neha@test.com", 32, "Female", "A+",
                                                        "+91-9123456781", "Koramangala, Bangalore",
                                                        "Anxiety, Sleep issues" },
                                        new Object[] { "Rahul Desai", "rahul@test.com", 45, "Male", "B+",
                                                        "+91-9123456782", "Andheri West, Mumbai", null },
                                        new Object[] { "Kavya Iyer", "kavya@test.com", 26, "Female", "AB+",
                                                        "+91-9123456783", "T Nagar, Chennai", "Depression history" },
                                        new Object[] { "Rohan Mehta", "rohan@test.com", 35, "Male", "A-",
                                                        "+91-9123456784", "Salt Lake, Kolkata", null },
                                        new Object[] { "Ananya Nair", "ananya@test.com", 29, "Female", "O-",
                                                        "+91-9123456785", "Jubilee Hills, Hyderabad",
                                                        "Stress, Work pressure" },
                                        new Object[] { "Siddharth Joshi", "siddharth@test.com", 38, "Male", "B-",
                                                        "+91-9123456786", "Jayanagar, Bangalore", null });

                        for (Object[] data : patientsData) {
                                if (userRepository.findByEmail((String) data[1]).isEmpty()) {
                                        User patient = User.builder()
                                                        .fullName((String) data[0])
                                                        .email((String) data[1])
                                                        .password(passwordEncoder.encode("test123"))
                                                        .role(Role.PATIENT)
                                                        .age((Integer) data[2])
                                                        .gender((String) data[3])
                                                        .bloodGroup((String) data[4])
                                                        .phone((String) data[5])
                                                        .address((String) data[6])
                                                        .medicalHistory((String) data[7])
                                                        .build();
                                        userRepository.save(patient);
                                }
                        }
                        System.out.println("✓ Seeded 7 Indian patients with profiles");
                }
        }

        private void seedAppointments() {
                if (appointmentRepository.count() == 0) {
                        List<User> doctors = userRepository.findByRole(Role.DOCTOR);
                        List<User> patients = userRepository.findByRole(Role.PATIENT);

                        if (doctors.isEmpty() || patients.isEmpty())
                                return;

                        Random random = new Random();
                        List<Appointment> appointments = new ArrayList<>();

                        // Create mix of past, today, and future appointments
                        for (int i = 0; i < 15; i++) {
                                User doctor = doctors.get(random.nextInt(doctors.size()));
                                User patient = patients.get(random.nextInt(patients.size()));

                                LocalDate date = LocalDate.now().plusDays(random.nextInt(30) - 10); // -10 to +20 days
                                String[] timeSlots = { "9:00 AM - 9:30 AM", "10:00 AM - 10:30 AM",
                                                "11:00 AM - 11:30 AM",
                                                "2:00 PM - 2:30 PM", "3:00 PM - 3:30 PM", "4:00 PM - 4:30 PM" };

                                AppointmentStatus status;
                                if (date.isBefore(LocalDate.now())) {
                                        status = AppointmentStatus.COMPLETED;
                                } else if (date.isEqual(LocalDate.now())) {
                                        status = random.nextBoolean() ? AppointmentStatus.CONFIRMED
                                                        : AppointmentStatus.PENDING;
                                } else {
                                        status = random.nextBoolean() ? AppointmentStatus.CONFIRMED
                                                        : AppointmentStatus.PENDING;
                                }

                                Appointment appointment = Appointment.builder()
                                                .patient(patient)
                                                .doctor(doctor)
                                                .appointmentDate(date)
                                                .timeSlot(timeSlots[random.nextInt(timeSlots.length)])
                                                .status(status)
                                                .notes("Regular checkup and consultation")
                                                .build();
                                appointments.add(appointment);
                        }
                        appointmentRepository.saveAll(appointments);
                        System.out.println("✓ Seeded 15 sample appointments");
                }
        }

        private void seedDiagnoses() {
                if (diagnosisRepository.count() == 0) {
                        List<User> patients = userRepository.findByRole(Role.PATIENT);
                        if (patients.isEmpty())
                                return;

                        Random random = new Random();
                        List<Diagnosis> diagnoses = new ArrayList<>();

                        for (User patient : patients) {
                                // Each patient has 1-2 assessments
                                int count = random.nextInt(2) + 1;
                                for (int i = 0; i < count; i++) {
                                        int score = random.nextInt(30); // 0-29
                                        String riskLevel;
                                        if (score <= 5)
                                                riskLevel = "Low";
                                        else if (score <= 15)
                                                riskLevel = "Medium";
                                        else
                                                riskLevel = "High";

                                        Diagnosis diagnosis = Diagnosis.builder()
                                                        .user(patient)
                                                        .totalScore(score)
                                                        .riskLevel(riskLevel)
                                                        .build();
                                        diagnoses.add(diagnosis);
                                }
                        }
                        diagnosisRepository.saveAll(diagnoses);
                        System.out.println("✓ Seeded " + diagnoses.size() + " assessment diagnoses");
                }
        }
}
