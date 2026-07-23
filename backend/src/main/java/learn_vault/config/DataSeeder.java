package learn_vault.config;

import learn_vault.entity.course.CourseEntity;
import learn_vault.entity.enrollment.EnrollmentEntity;

import learn_vault.entity.user.AuthorEntity;
import learn_vault.entity.user.UserEntity;
import learn_vault.enums.Category;
import learn_vault.enums.EnrollmentStatus;

import learn_vault.enums.Role;
import learn_vault.repository.AuthorRepository;
import learn_vault.repository.CourseRepository;
import learn_vault.repository.EnrollmentRepository;
import learn_vault.repository.UserRepository;
import net.datafaker.Faker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final AuthorRepository authorRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository,
                      AuthorRepository authorRepository,
                      CourseRepository courseRepository,
                      EnrollmentRepository enrollmentRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.authorRepository = authorRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("⏭️  Database already has data — skipping seed.");
            return;
        }

        Faker faker = new Faker();
        String defaultPassword = passwordEncoder.encode("password123");

        // ── 1. Create Author users + AuthorEntity rows ──────────────────
        int authorCount = 5;
        List<AuthorEntity> authors = new ArrayList<>();

        for (int i = 1; i <= authorCount; i++) {
            String firstName = faker.name().firstName();
            String lastName  = faker.name().lastName();

            UserEntity user = new UserEntity(
                    firstName + " " + lastName,
                    (firstName + lastName + i).toLowerCase(),
                    firstName.toLowerCase() + "." + lastName.toLowerCase() + i + "@example.com",
                    defaultPassword,
                    Role.AUTHOR
            );
            userRepository.save(user);

            AuthorEntity author = new AuthorEntity(user);
            authorRepository.save(author);
            authors.add(author);
        }
        log.info("Seeded {} authors", authorCount);

        // ── 2. Create Student users ─────────────────────────────────────
        int studentCount = 50;
        List<UserEntity> students = new ArrayList<>();

        for (int i = 1; i <= studentCount; i++) {
            String firstName = faker.name().firstName();
            String lastName  = faker.name().lastName();

            UserEntity student = new UserEntity(
                    firstName + " " + lastName,
                    (firstName + lastName + (authorCount + i)).toLowerCase(),
                    firstName.toLowerCase() + "." + lastName.toLowerCase() + (authorCount + i) + "@example.com",
                    defaultPassword,
                    Role.STUDENT
            );
            userRepository.save(student);
            students.add(student);
        }
        log.info("Seeded {} students", studentCount);

        // ── 3. Create Courses ───────────────────────────────────────────
        Category[] categories = Category.values();
        int courseCount = 20;
        List<CourseEntity> courses = new ArrayList<>();

        for (int i = 0; i < courseCount; i++) {
            AuthorEntity author = authors.get(faker.number().numberBetween(0, authors.size()));
            Category category   = categories[faker.number().numberBetween(0, categories.length)];

            String courseName = generateCourseName(faker, category);

            CourseEntity course = new CourseEntity(
                    courseName,
                    faker.lorem().paragraph(3),
                    (long) faker.number().numberBetween(199, 4999),
                    category,
                    faker.bool().bool(),
                    author,
                    null  // videoKey — no S3 video for seed data
            );
            courseRepository.save(course);
            courses.add(course);
        }
        log.info("Seeded {} courses", courseCount);

        // ── 4. Create Enrollments (exactly 10) ────────────────────────────
        int enrollmentTarget = 10;
        EnrollmentStatus[] statuses = EnrollmentStatus.values();

        // Shuffle students and pick the first 10 for enrollment
        List<UserEntity> shuffledStudents = new ArrayList<>(students);
        java.util.Collections.shuffle(shuffledStudents);

        for (int i = 0; i < enrollmentTarget; i++) {
            UserEntity student = shuffledStudents.get(i);
            CourseEntity course = courses.get(faker.number().numberBetween(0, courses.size()));

            EnrollmentEntity enrollment = new EnrollmentEntity(
                    course,
                    student,
                    EnrollmentStatus.ACTIVE,
                    LocalDateTime.now().minusDays(faker.number().numberBetween(1, 90))
            );
            enrollmentRepository.save(enrollment);
        }
        log.info("Seeded {} enrollments", enrollmentTarget);

        log.info("🌱  Database seeding complete!");
    }

    /**
     * Generates a realistic course name based on the category.
     */
    private String generateCourseName(Faker faker, Category category) {
        return switch (category) {
            case TECH -> faker.options().option(
                    "Introduction to " + faker.programmingLanguage().name(),
                    "Advanced " + faker.programmingLanguage().name() + " Development",
                    "Full-Stack Web Development with " + faker.programmingLanguage().name(),
                    "Data Structures & Algorithms in " + faker.programmingLanguage().name(),
                    "Cloud Computing Fundamentals",
                    "Machine Learning with Python",
                    "DevOps & CI/CD Pipeline Mastery"
            );
            case COMMUNICATION -> faker.options().option(
                    "Public Speaking Mastery",
                    "Business Communication Essentials",
                    "Negotiation Skills for Professionals",
                    "Effective Email & Written Communication",
                    "Storytelling for Leaders",
                    "Conflict Resolution & Mediation"
            );
            case PSYCHOLOGY -> faker.options().option(
                    "Introduction to Cognitive Psychology",
                    "Behavioral Psychology in Everyday Life",
                    "Understanding Emotional Intelligence",
                    "The Science of Motivation",
                    "Child Development Psychology",
                    "Positive Psychology & Well-being"
            );
            case LANGUAGE -> faker.options().option(
                    "Conversational " + faker.nation().language(),
                    "Business " + faker.nation().language(),
                    faker.nation().language() + " for Beginners",
                    "Advanced " + faker.nation().language() + " Grammar",
                    "Language Acquisition Techniques",
                    faker.nation().language() + " Literature & Culture"
            );
        };
    }
}
