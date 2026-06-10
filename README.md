<div align="center">

```
██╗     ███████╗ █████╗ ██████╗ ███╗   ██╗    ██╗   ██╗ █████╗ ██╗   ██╗██╗  ████████╗
██║     ██╔════╝██╔══██╗██╔══██╗████╗  ██║    ██║   ██║██╔══██╗██║   ██║██║  ╚══██╔══╝
██║     █████╗  ███████║██████╔╝██╔██╗ ██║    ██║   ██║███████║██║   ██║██║     ██║   
██║     ██╔══╝  ██╔══██║██╔══██╗██║╚██╗██║    ╚██╗ ██╔╝██╔══██║██║   ██║██║     ██║   
███████╗███████╗██║  ██║██║  ██║██║ ╚████║     ╚████╔╝ ██║  ██║╚██████╔╝███████╗██║   
╚══════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝      ╚═══╝  ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝   
```

**My Spring Boot learning sandbox — where patterns are forged before production.**

[![Java](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/projects/jdk/17/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.6-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Spring Security](https://img.shields.io/badge/Spring_Security-6-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white)](https://spring.io/projects/spring-security)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Gradle](https://img.shields.io/badge/Gradle-8.x-02303A?style=for-the-badge&logo=gradle&logoColor=white)](https://gradle.org/)

[![Commits](https://img.shields.io/github/commit-activity/m/junaidify/Learn-vault?style=flat-square&color=4f8cc9&label=commits)](https://github.com/junaidify/Learn-vault/commits/main)
[![Branches](https://img.shields.io/badge/branches-17-9b59b6?style=flat-square)](https://github.com/junaidify/Learn-vault/branches)
[![License](https://img.shields.io/badge/license-MIT-27ae60?style=flat-square)](./LICENSE)

</div>

---

## ⚡ What is Learn Vault?

> **LearnVault is a full-featured e-learning backend** — and my personal lab for mastering production-grade Java development before building [Junaidify v2](https://github.com/junaidify).

Every pattern implemented here — auth flows, payment integration, JPA design, exception handling — gets battle-tested in this repo **first**, then shipped to production. No tutorial hell. Real architecture decisions, real tradeoffs.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (React / Postman)              │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP Requests
┌──────────────────────────▼──────────────────────────────────┐
│                   Spring Security Filter Chain               │
│         JwtAuthFilter → SecurityFilterChain → RBAC          │
└──────────────────────────┬──────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
   ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
   │  AuthController│  │CourseController│  │PaymentController│
   └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
          │                │                │
   ┌──────▼──────────────────────────────────▼──────┐
   │               Service Layer                     │
   │  AuthService │ CourseService │ PaymentService   │
   └──────┬──────────────────────────────────┬──────┘
          │                                  │
   ┌──────▼──────┐                    ┌──────▼──────┐
   │  JPA / ORM  │                    │  Razorpay   │
   │ (Hibernate) │                    │     API     │
   └──────┬──────┘                    └─────────────┘
          │
   ┌──────▼──────┐
   │ PostgreSQL  │
   │  Database   │
   └─────────────┘
```

---

## 🔧 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Runtime** | Java 17 + Spring Boot 3.3.6 | Core application framework |
| **Security** | Spring Security 6 + JWT (JJWT 0.12.6) | Stateless auth + RBAC |
| **OAuth2** | Google OAuth2 + Custom `Oauth2SuccessHandler` | Social login flow |
| **Database** | PostgreSQL + Spring Data JPA | Relational persistence |
| **ORM** | Hibernate + `@OneToMany` / `@ManyToOne` | Entity relationships |
| **Payments** | Razorpay SDK | Order creation + payment verification |
| **Validation** | Jakarta Bean Validation (`@NotBlank`, `@Email`) | Request validation |
| **Build** | Gradle 8.x | Dependency management |
| **Utilities** | Lombok (DTOs only), MapStruct | Boilerplate reduction |

---

## 🔐 Authentication & Security

Complete stateless auth implementation with dual login support:

```
POST /api/auth/register      → Register user (BCrypt password)
POST /api/auth/login         → Login → returns JWT access token
GET  /oauth2/authorization/google → Initiate Google OAuth2
GET  /oauth2/callback/google      → Oauth2SuccessHandler → JWT issued
```

**Security Stack:**
- `SecurityFilterChain` with stateless session management
- `JwtFilter` → validates token on every request before controller
- `CustomUserDetailsService` → loads user from DB by email
- `DaoAuthenticationProvider` (Spring Security 6 constructor)
- `@PreAuthorize("hasRole('ADMIN')")` for role-based endpoint protection
- `GlobalExceptionHandler` via `@RestControllerAdvice` → standardized error responses

---

## 💳 Payment Integration

Razorpay backend integration — fully functional order lifecycle:

```
POST /api/payments/create-order     → Creates Razorpay order, returns orderId
POST /api/payments/verify           → Verifies HMAC-SHA256 signature
POST /api/payments/webhook          → Handles async payment events
```

**Flow:**
```
Client → POST /create-order → RazorpayClient.orders().create()
       ← { orderId, amount, currency, key }

Client pays via Razorpay checkout ↓

Client → POST /verify → HMAC(orderId + paymentId, secret)
       → EnrollmentService.enroll(userId, courseId)
       ← { success: true }
```

---

## 🗄️ Database Schema

Core JPA entities with proper relationship modeling:

```java
// UserEntity ─── @OneToMany ──► EnrollmentEntity
// CourseEntity ── @OneToMany ──► EnrollmentEntity
// EnrollmentEntity has @ManyToOne to both User and Course

@Entity
public class EnrollmentEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private UserEntity user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private CourseEntity course;

    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;
}
```

**Tables:** `users` · `courses` · `enrollments` · `payments`

---

## 📁 Project Structure

```
Learn-vault/
├── src/
│   └── main/
│       ├── java/com/learnvault/
│       │   ├── config/
│       │   │   ├── SecurityConfig.java          # SecurityFilterChain
│       │   │   └── RazorpayConfig.java          # RazorpayClient bean
│       │   ├── controller/
│       │   │   ├── AuthController.java
│       │   │   ├── CourseController.java
│       │   │   └── PaymentController.java
│       │   ├── service/
│       │   │   ├── AuthService.java
│       │   │   ├── CourseService.java
│       │   │   └── PaymentService.java
│       │   ├── entity/
│       │   │   ├── UserEntity.java
│       │   │   ├── CourseEntity.java
│       │   │   ├── EnrollmentEntity.java
│       │   │   └── PaymentEntity.java
│       │   ├── dto/
│       │   │   ├── request/                     # Incoming DTOs
│       │   │   └── response/                    # Outgoing DTOs
│       │   ├── security/
│       │   │   ├── JwtFilter.java
│       │   │   ├── JwtUtils.java                # JJWT 0.12.6
│       │   │   ├── CustomUserDetailsService.java
│       │   │   └── Oauth2SuccessHandler.java
│       │   ├── exception/
│       │   │   └── GlobalExceptionHandler.java  # @RestControllerAdvice
│       │   └── repository/
│       │       ├── UserRepository.java
│       │       ├── CourseRepository.java
│       │       └── EnrollmentRepository.java
│       └── resources/
│           └── application.yml
├── build.gradle
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Java 17+
- PostgreSQL running locally
- Razorpay test API keys (optional for payment testing)

### Setup

```bash
# Clone the repo
git clone https://github.com/junaidify/Learn-vault.git
cd Learn-vault

# Configure environment
cp src/main/resources/application.yml.example src/main/resources/application.yml
# Edit application.yml → set DB credentials, JWT secret, Razorpay keys

# Run
./gradlew bootRun
```

### application.yml

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/learnvault
    username: your_db_user
    password: your_db_password
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true

app:
  jwt:
    secret: your_jwt_secret_here
    expiration: 86400000  # 24h in ms

razorpay:
  key-id: rzp_test_xxxx
  key-secret: your_razorpay_secret
```

---

## 🧪 API Reference

### Auth Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | ❌ | Register new user |
| `POST` | `/api/auth/login` | ❌ | Login → JWT |
| `GET` | `/api/auth/me` | ✅ JWT | Get current user |

### Course Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/courses` | ❌ | List all courses |
| `GET` | `/api/courses/{id}` | ❌ | Get course details |
| `POST` | `/api/courses` | ✅ ADMIN | Create course |
| `PUT` | `/api/courses/{id}` | ✅ ADMIN | Update course |
| `DELETE` | `/api/courses/{id}` | ✅ ADMIN | Delete course |

### Payment Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/payments/create-order` | ✅ JWT | Create Razorpay order |
| `POST` | `/api/payments/verify` | ✅ JWT | Verify payment + enroll |

---

## 🗺️ What I Learned Building This

| Concept | Key Insight |
|--------|-------------|
| **Spring Security 6** | `DaoAuthenticationProvider` constructor changed — must call `setUserDetailsService()` explicitly |
| **JJWT 0.12.6** | `Jwts.parser().verifyWith(key)` replaces old `.setSigningKey()` API |
| **JPA Relationships** | Never use raw FK fields — use `@ManyToOne` with `@JoinColumn`, lazy fetch by default |
| **OAuth2 + JWT** | `Oauth2SuccessHandler` must generate JWT after OAuth2 success to stay stateless |
| **Exception Handling** | `@RestControllerAdvice` + typed `@ExceptionHandler` keeps error responses consistent |
| **DTO Pattern** | Service layer returns DTOs, never entities — decouples persistence from API contract |

---

## 🔭 What's Next

This repo is the testing ground for **Junaidify v2** — a production paid course platform.

Patterns proven here → shipped to:

- `pgvector` + OpenAI → RAG "Ask the Course" AI assistant
- Redis → session cache + rate limiting
- AWS S3 → video upload pipeline
- Docker + GitHub Actions → CI/CD
- WhatsApp API → enrollment notifications

---

## 👤 Author

**Junaid** — Java Full-Stack Developer

[![GitHub](https://img.shields.io/badge/GitHub-junaidify-181717?style=flat-square&logo=github)](https://github.com/junaidify)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat-square&logo=linkedin)](https://linkedin.com/in/junaidify)

> *"Built as a sandbox. Designed like production."*

---

<div align="center">

⭐ Star this repo if it helped you understand Spring Boot architecture

</div>
