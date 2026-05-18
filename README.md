# LearnVault

> **Open-source platform where the community builds and maintains structured learning curriculums for any tech stack.**  
> No chaos, no guesswork — just clear, ordered paths from zero to job-ready, built by developers for developers.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Security Model](#security-model)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [Roadmap](#roadmap)

---

## Overview

LearnVault solves one of the most frustrating problems in tech education: **there is no single, structured, community-vetted path to learn a given tech stack**. Developers waste weeks bouncing between YouTube tutorials, Reddit threads, and random blog posts, never sure if they're learning things in the right order.

LearnVault fixes this by letting the developer community build and maintain **opinionated, ordered learning curriculums** — think of it as a Wikipedia for tech roadmaps, where courses are organized by authors and students follow a clear progression.

---

## Features

### Currently Implemented

| Feature | Status |
|---|---|
| User Registration with validation | Done |
| BCrypt password hashing | Done |
| JWT generation & HTTP-only cookie auth | Done |
| Role-based user model (STUDENT / INSTRUCTOR / ADMIN) | Done |
| Course creation with author management | Done |
| Course listing and retrieval by ID | Done |
| PostgreSQL persistence via Spring Data JPA | Done |
| Google OAuth2 client setup | In Progress |

### Planned Features

| Feature | Description |
|---|---|
| **JWT Authentication Filter** | Secure endpoints with stateless JWT validation on every request |
| **Login Endpoint** | Email/password login returning JWT cookie |
| **Role-Based Access Control** | Restrict course creation to INSTRUCTOR/ADMIN roles |
| **Razorpay Payment Integration** | Students pay to enroll in premium courses |
| **RAG-Based AI Assistant** | OpenAI-powered Q&A assistant with pgvector for semantic course search |
| **Course Enrollment** | Track student-course relationships |
| **Google OAuth2 Login** | Sign in with Google as an alternative auth method |
| **Pagination** | Paginated course listing endpoints |
| **Course Update & Delete** | Full CRUD for course management |

---

## Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Language | Java 26 |
| Framework | Spring Boot 4.0.6 |
| Security | Spring Security + JJWT 0.11.5 |
| OAuth2 | Spring Security OAuth2 Client |
| ORM | Spring Data JPA (Hibernate) |
| Validation | Jakarta Bean Validation |
| Build Tool | Gradle |

### Database
| Component | Technology |
|---|---|
| Primary DB | PostgreSQL |
| Vector Store (planned) | pgvector (PostgreSQL extension) |
| ORM Driver | PostgreSQL JDBC |

### Planned Integrations
| Integration | Purpose |
|---|---|
| OpenAI API | Embedding generation + LLM for RAG assistant |
| pgvector | Semantic similarity search over course content |
| Razorpay | Payment processing for course enrollment |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Client (Browser / App)                │
└──────────────────┬───────────────────────────────────────────┘
                   │  HTTP (JWT in HTTP-only cookie)
┌──────────────────▼───────────────────────────────────────────┐
│                    Spring Boot Application                    │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐   │
│  │ Controllers│→ │  Services  │→ │    Repositories      │   │
│  │ /auth      │  │ UserService│  │ UserRepository       │   │
│  │ /course    │  │CourseService│  │ CourseRepository     │   │
│  └────────────┘  └────────────┘  │ AuthorRepository     │   │
│                                  └──────────┬───────────┘   │
│  ┌─────────────────────────────┐            │               │
│  │       Security Layer        │            │               │
│  │  JwtUtils (HS256, 48h)      │            │               │
│  │  BCryptPasswordEncoder      │            │               │
│  │  HTTP-only cookie transport │            │               │
│  └─────────────────────────────┘            │               │
└─────────────────────────────────────────────┼───────────────┘
                                              │
┌─────────────────────────────────────────────▼───────────────┐
│                        PostgreSQL                            │
│                                                              │
│   users          courses         author                      │
│   ─────────      ─────────       ──────                      │
│   id             id              author_id                   │
│   name           title           author_name                 │
│   username       author_id                                   │
│   email                                                      │
│   password       (pgvector planned for course embeddings)    │
│   role                                                       │
└──────────────────────────────────────────────────────────────┘
```

### Planned RAG Architecture

```
Student Question
      │
      ▼
  OpenAI Embeddings API
      │  (text → vector)
      ▼
  pgvector similarity search  ──→  Relevant course chunks
      │
      ▼
  OpenAI Chat API (GPT-4)
  + retrieved context
      │
      ▼
  AI Answer grounded in
  actual course content
```

### Planned Payment Flow

```
Student clicks "Enroll"
      │
      ▼
  LearnVault creates Razorpay order
      │
      ▼
  Razorpay Checkout (frontend)
      │  (payment captured)
      ▼
  Razorpay webhook → LearnVault
      │  (verify signature)
      ▼
  Enrollment record created
  Student gets access to course
```

---

## Project Structure

```
src/main/java/learn_vault/
├── LearnVaultApplication.java          # Application entry point
│
├── controller/
│   ├── UserController.java             # /auth — registration & auth
│   └── CourseController.java           # /course — course CRUD
│
├── service/
│   ├── UserService.java                # Registration, JWT issuance
│   └── CourseService.java              # Course & author management
│
├── repositories/
│   ├── UserRepository.java             # User DB queries
│   ├── CourseRepository.java           # Course DB queries
│   └── AuthorRepository.java          # Author DB queries
│
├── entities/
│   ├── UserEntity.java                 # users table
│   ├── CourseEntity.java               # courses table
│   └── AuthorEntity.java              # author table
│
├── dto/
│   ├── SignupDto.java                  # Registration request body
│   └── CourseDto.java                  # Course creation request body
│
├── enums/
│   └── Role.java                       # STUDENT | INSTRUCTOR | ADMIN
│
└── utils/
    ├── AppConfig.java                  # BCryptPasswordEncoder bean
    └── JwtUtils.java                   # JWT generation (HS256)

src/main/resources/
├── application.yml                     # Profile selector
└── application-local.yml               # Local dev config (gitignored)
```

---

## Database Schema

```sql
CREATE TABLE users (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(50)  NOT NULL,
    username    VARCHAR(15)  NOT NULL UNIQUE,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255),
    role        VARCHAR(20)  NOT NULL DEFAULT 'STUDENT'
);

CREATE TABLE author (
    author_id   BIGSERIAL PRIMARY KEY,
    author_name VARCHAR(255) NOT NULL
);

CREATE TABLE courses (
    id          BIGSERIAL PRIMARY KEY,
    title       VARCHAR(255) NOT NULL UNIQUE,
    author_id   BIGINT NOT NULL REFERENCES author(author_id)
);
```

> **Planned:** `course_enrollments` join table, `course_embeddings` with pgvector column for RAG, `payments` table for Razorpay transaction records.

---

## API Reference

### Auth — `/auth`

#### `POST /auth/signup`

Register a new user. Returns a JWT stored as an HTTP-only cookie.

**Request Body**
```json
{
  "name": "Junaid Khan",
  "username": "junaid_dev",
  "email": "junaid@example.com",
  "password": "Secret123"
}
```

**Validation Rules**

| Field | Rules |
|---|---|
| `name` | 2–50 characters, required |
| `username` | 8–15 characters, alphanumeric + underscore only |
| `email` | Valid email format |
| `password` | 8–20 chars, must contain digit + lowercase + uppercase |

**Responses**

| Status | Body |
|---|---|
| `200 OK` | `"User registered successfully."` + `Set-Cookie: jwt=<token>; HttpOnly` |
| `400 Bad Request` | Validation error or `"User already exists"` |

---

### Courses — `/course`

#### `POST /course/create-course`

Create a new course. Automatically creates the author if they don't exist.

**Request Body**
```json
{
  "title": "Spring Boot for Beginners",
  "authorName": "Junaid Khan"
}
```

**Responses**

| Status | Body |
|---|---|
| `200 OK` | `"Course created successfully."` |
| `200 OK` | `"Course already exists for this author."` |

---

#### `GET /course/`

Fetch all courses.

**Response**
```json
[
  {
    "id": 1,
    "title": "Spring Boot for Beginners",
    "authorId": 1
  }
]
```

---

#### `GET /course/{id}`

Fetch a single course by ID.

**Response**
```json
{
  "id": 1,
  "title": "Spring Boot for Beginners",
  "authorId": 1
}
```

| Status | Body |
|---|---|
| `200 OK` | Course object |
| `404 Not Found` | Empty (course not found) |

---

## Security Model

### JWT

- **Algorithm:** HMAC-SHA256 (HS256)
- **Expiration:** 48 hours
- **Subject:** User email
- **Transport:** HTTP-only cookie (named `jwt`, path `/`)
- **Key:** Generated at startup with `Keys.secretKeyFor(SignatureAlgorithm.HS256)`

> The key is regenerated on each application restart. For production, externalize the secret to an environment variable or secrets manager.

### Password Storage

Passwords are hashed with **BCrypt** before persistence. Plain-text passwords are never stored or logged.

### Roles

| Role | Intended Permissions |
|---|---|
| `STUDENT` | Default role. Browse and enroll in courses. |
| `INSTRUCTOR` | Create and manage courses. |
| `ADMIN` | Full platform management. |

> Role-based endpoint authorization is currently planned — the `SecurityFilterChain` and JWT validation filter are not yet implemented.

---

## Getting Started

### Prerequisites

- Java 26+
- PostgreSQL 15+
- Gradle (wrapper included)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/learn-vault.git
cd learn-vault
```

### 2. Create the database

```sql
CREATE DATABASE learnvault;
```

### 3. Configure local properties

Create `src/main/resources/application-local.yml`:

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
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: YOUR_GOOGLE_CLIENT_ID
            client-secret: YOUR_GOOGLE_CLIENT_SECRET
```

### 4. Run the application

```bash
./gradlew bootRun
```

The server starts on `http://localhost:8080`.

### 5. Test the signup endpoint

```bash
curl -X POST http://localhost:8080/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "username": "testuser1",
    "email": "test@example.com",
    "password": "Secret123"
  }'
```

---

## Environment Configuration

| Property | Description | Required |
|---|---|---|
| `spring.datasource.url` | PostgreSQL JDBC URL | Yes |
| `spring.datasource.username` | DB username | Yes |
| `spring.datasource.password` | DB password | Yes |
| `spring.security.oauth2.client.registration.google.client-id` | Google OAuth2 client ID | Optional |
| `spring.security.oauth2.client.registration.google.client-secret` | Google OAuth2 client secret | Optional |

> Keep `application-local.yml` out of version control. It is listed in `.gitignore`.

---

## Roadmap

### Phase 1 — Authentication & Authorization (Current)
- [x] User registration with BCrypt + JWT
- [ ] Login endpoint
- [ ] JWT validation filter (`OncePerRequestFilter`)
- [ ] Role-based `SecurityFilterChain`
- [ ] Google OAuth2 login

### Phase 2 — Course Platform
- [ ] Full CRUD for courses (update, delete)
- [ ] Course enrollment system
- [ ] Instructor dashboard
- [ ] Pagination on listing endpoints

### Phase 3 — Payments (Razorpay)
- [ ] Create Razorpay order on enrollment request
- [ ] Razorpay Checkout integration
- [ ] Webhook handler with signature verification
- [ ] Payment records and enrollment gating

### Phase 4 — AI Assistant (RAG + OpenAI + pgvector)
- [ ] Install `pgvector` extension in PostgreSQL
- [ ] Course content chunking and embedding via OpenAI API
- [ ] Store embeddings in pgvector column
- [ ] Semantic similarity search endpoint
- [ ] RAG pipeline: embed question → retrieve chunks → GPT-4 answer
- [ ] `/assistant/ask` endpoint for students

---

## Contributing

Contributions are welcome. The project follows a standard fork → branch → PR workflow.

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes
4. Open a pull request against `main`

---

## License

This project is open-source. License to be added.
