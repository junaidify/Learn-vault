# LearnVault

> **Open-source platform where the community builds and maintains structured learning curriculums for any tech stack.**  
> No chaos, no guesswork — just clear, ordered paths from zero to job-ready, built by developers for developers.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Roles & Permissions](#roles--permissions)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [Running Tests](#running-tests)
- [Production Checklist](#production-checklist)
- [Roadmap](#roadmap)

---

## Overview

LearnVault solves one of the most frustrating problems in tech education: **there is no single, structured, community-vetted path to learn a given tech stack**. Developers waste weeks bouncing between YouTube tutorials, Reddit threads, and random blog posts, never sure if they're learning things in the right order.

LearnVault lets the developer community build and maintain **opinionated, ordered learning curriculums** — think Wikipedia for tech roadmaps, where courses are organized by authors and students follow a clear progression.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | Java 26 |
| Framework | Spring Boot 4.x |
| Security | Spring Security 7.x, JJWT 0.12.6 |
| OAuth2 | Spring Security OAuth2 Client (Google) |
| ORM | Spring Data JPA / Hibernate |
| Database | PostgreSQL (production), H2 (tests) |
| Build | Gradle |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Client (Browser / App)                │
└──────────────────┬──────────────────────────────────────┘
                   │  HTTP  (JWT in HttpOnly cookie)
┌──────────────────▼──────────────────────────────────────┐
│                 Spring Boot Application                  │
│                                                         │
│  JwtFilters (OncePerRequestFilter)                      │
│       ↓  extract + validate JWT from cookie             │
│       ↓  set SecurityContext                            │
│                                                         │
│  Controllers  →  Services  →  Repositories              │
│  /auth/**        UserService    UserRepository          │
│  /course/**      CourseService  CourseRepository        │
│                               AuthorRepository          │
│                                                         │
│  Security Layer                                         │
│  ├─ BCryptPasswordEncoder (password hashing)            │
│  ├─ JwtUtils (HS256, 48h tokens)                       │
│  ├─ Oauth2SuccessHandler (provisions new OAuth users)  │
│  └─ RoleHierarchy: ADMIN→AUTHOR→STUDENT                │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│                    PostgreSQL                            │
│                                                         │
│  users          author          courses                  │
│  ─────          ──────          ───────                  │
│  id             author_id       id                       │
│  name           author_name     title                    │
│  username       user_id (FK)    author_id (FK)           │
│  email                                                   │
│  password                                                │
│  role                                                    │
└─────────────────────────────────────────────────────────┘
```

**Request flow:**
1. Request arrives → `JwtFilters` reads `jwt` cookie
2. If valid JWT: extract email → load user → set `SecurityContext`
3. Spring Security checks role against endpoint rules
4. Controller delegates to Service → Repository → DB

---

## Roles & Permissions

Role hierarchy is enforced at both the HTTP route level and via `@PreAuthorize`:

```
ADMIN  ──inherits──▶  AUTHOR  ──inherits──▶  STUDENT
```

| Role | Endpoint Access |
|------|----------------|
| `STUDENT` | `GET /course`, `GET /course/{id}` |
| `AUTHOR` | All of above + `POST /course/create-course`, `/author/**` |
| `ADMIN` | All of above + `/admin/**` |

---

## API Reference

### Auth — `/auth/**` (public, no JWT required)

#### `POST /auth/signup`

Register a new user. Returns a JWT stored as an HttpOnly cookie.

**Request Body**
```json
{
  "name": "Junaid Khan",
  "username": "junaid_dev",
  "email": "junaid@example.com",
  "password": "Secret123",
  "role": "STUDENT"
}
```

| Field | Rules |
|-------|-------|
| `name` | 3–50 characters, required |
| `username` | 8–15 characters, letters/numbers/underscore only |
| `email` | Valid email format |
| `password` | 8–20 chars, must contain digit + lowercase + uppercase |
| `role` | `STUDENT`, `AUTHOR`, or `ADMIN` |

| Status | Meaning |
|--------|---------|
| `200 OK` | Registered. Cookie `jwt` set. |
| `400 Bad Request` | Validation error (field errors returned) |
| `409 Conflict` | User already exists |

---

#### `POST /auth/login`

Login with email or username + password.

**Request Body**
```json
{
  "email": "junaid@example.com",
  "password": "Secret123"
}
```
_(Use `username` instead of `email` if preferred.)_

| Status | Meaning |
|--------|---------|
| `200 OK` | Logged in. Cookie `jwt` set. |
| `401 Unauthorized` | Invalid credentials |
| `400 Bad Request` | Validation error |

---

#### `POST /auth/logout`

Clears the JWT cookie by setting `max-age=0`.

| Status | Meaning |
|--------|---------|
| `200 OK` | Cookie expired |

---

### Courses — `/course/**` (requires JWT)

#### `POST /course/create-course` — `AUTHOR` only

Create a course. The author is automatically linked to the authenticated user — no need to pass an author name.

**Request Body**
```json
{
  "title": "Spring Boot for Beginners"
}
```

| Status | Meaning |
|--------|---------|
| `201 Created` | Course created, returns `CourseResponseDto` |
| `400 Bad Request` | Validation error |
| `401 Unauthorized` | Not authenticated |
| `403 Forbidden` | Wrong role |
| `409 Conflict` | Course with same title already exists for this author |

**Response**
```json
{
  "id": 1,
  "title": "Spring Boot for Beginners",
  "authorName": "Junaid Khan"
}
```

---

#### `GET /course` — `STUDENT` and above

List all courses.

```json
[
  { "id": 1, "title": "Spring Boot for Beginners", "authorName": "Junaid Khan" }
]
```

---

#### `GET /course/{id}` — `STUDENT` and above

Get a single course.

| Status | Meaning |
|--------|---------|
| `200 OK` | Returns `CourseResponseDto` |
| `404 Not Found` | Course not found |

---

### OAuth2 — Google Login

| Step | URL |
|------|-----|
| Initiate login | `GET /oauth2/authorization/google` |
| Callback (handled by Spring) | `GET /login/oauth2/code/google` |

On success, a new `STUDENT` user is provisioned (first login only) and a JWT cookie is set. The browser is redirected to `app.oauth2-redirect` (configurable).

---

## Database Schema

```sql
CREATE TABLE users (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(50)  NOT NULL,
    username    VARCHAR(15)  NOT NULL UNIQUE,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255),           -- NULL for OAuth2 users
    role        VARCHAR(20)  NOT NULL
);

CREATE TABLE author (
    author_id   BIGSERIAL PRIMARY KEY,
    author_name VARCHAR(255) NOT NULL,
    user_id     BIGINT UNIQUE REFERENCES users(id)
);

CREATE TABLE courses (
    id          BIGSERIAL PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    author_id   BIGINT NOT NULL REFERENCES author(author_id)
);
```

---

## Getting Started

### Prerequisites

- Java 26
- PostgreSQL 15+
- Google OAuth2 credentials (from [Google Cloud Console](https://console.cloud.google.com))

### 1. Clone

```bash
git clone https://github.com/your-username/learn-vault.git
cd learn-vault
```

### 2. Create the database

```sql
CREATE DATABASE learnvault;
```

### 3. Set environment variables

```bash
export GOOGLE_CLIENT_ID=your-google-client-id
export GOOGLE_CLIENT_SECRET=your-google-client-secret
# Optional (defaults shown):
export DB_URL=jdbc:postgresql://localhost:5432/learnvault
export DB_USERNAME=postgres
export DB_PASSWORD=postgres
export JWT_SECRET=2tTNCo6t7U7TuHA0pvsHkzToD4Eabq/iV/3mNpqHs1M=
```

### 4. Run with local profile

```bash
./gradlew bootRun --args='--spring.profiles.active=local'
```

Server starts on `http://localhost:8001`.

### 5. Quick smoke test

```bash
# Signup
curl -c cookies.txt -X POST http://localhost:8001/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","username":"testuser1","email":"test@example.com","password":"Secret123","role":"STUDENT"}'

# List courses (uses the cookie from signup)
curl -b cookies.txt http://localhost:8001/course
```

---

## Environment Configuration

| Property | Env Var | Default | Description |
|----------|---------|---------|-------------|
| `spring.datasource.url` | `DB_URL` | `jdbc:postgresql://localhost:5432/learnvault` | Database URL |
| `spring.datasource.username` | `DB_USERNAME` | `postgres` | DB user |
| `spring.datasource.password` | `DB_PASSWORD` | `postgres` | DB password |
| `spring.jpa.hibernate.ddl-auto` | `DDL_AUTO` | `update` | Schema strategy |
| `jwt.secret` | `JWT_SECRET` | dev default | Base64 HMAC-SHA256 key (min 256 bits) |
| `app.oauth2-redirect` | `OAUTH2_REDIRECT_URL` | `http://localhost:5173/dashboard` | Post-OAuth2 frontend redirect |
| `app.cookie-secure` | `COOKIE_SECURE` | `false` | Set `true` in production (HTTPS required) |
| `server.port` | `SERVER_PORT` | `8001` | HTTP port |

---

## Running Tests

Tests use H2 in-memory database — no external services required.

```bash
./gradlew test
```

Test coverage includes:
- `JwtUtilsTest` — token generation, validation, extraction, tamper detection
- `UserServiceTest` — signup, login success/failure, author provisioning
- `CourseServiceTest` — creation, duplicate detection, author auto-creation
- `LoginControllerTest` — HTTP responses, cookie behavior, validation
- `CourseControllerTest` — role-based access, HTTP status codes, 404 handling

---

## Production Checklist

- [ ] Set `COOKIE_SECURE=true` (requires HTTPS / TLS terminator)
- [ ] Use a cryptographically random `JWT_SECRET` (≥256 bits, Base64-encoded)
- [ ] Set `DDL_AUTO=validate` — never `update` in production
- [ ] Rotate Google OAuth2 credentials (never commit them)
- [ ] Add `.env` to `.gitignore`
- [ ] Configure CORS for your frontend origin
- [ ] Set up database connection pooling (HikariCP is included)
- [ ] Put the app behind a reverse proxy (nginx / ALB) with HTTPS

---

## Project Structure

```
src/main/java/learn_vault/
├── LearnVaultApplication.java
├── controller/
│   ├── LoginController.java       # /auth/login, /auth/logout
│   ├── UserController.java        # /auth/signup
│   └── CourseController.java      # /course/**
├── service/
│   ├── UserService.java
│   ├── CourseService.java
│   └── CustomUserDetailsService.java
├── entities/
│   ├── UserEntity.java
│   ├── AuthorEntity.java
│   └── CourseEntity.java
├── dto/
│   ├── SignupDto.java
│   ├── LoginDto.java
│   ├── CourseDto.java
│   └── CourseResponseDto.java     # Safe serialization (no circular refs)
├── repositories/
│   ├── UserRepository.java
│   ├── AuthorRepository.java
│   └── CourseRepository.java
├── enums/
│   └── Role.java                  # STUDENT | AUTHOR | ADMIN
└── utils/
    ├── SecurityConfig.java         # Filter chain, route rules
    ├── AppConfig.java              # Beans: encoder, auth provider, hierarchy
    ├── JwtUtils.java               # HS256 token generation & validation
    ├── JwtFilters.java             # Cookie → SecurityContext per request
    ├── Oauth2SuccessHandler.java   # User provisioning + cookie on OAuth2
    └── GlobalExceptionHandler.java # Unified error responses
```

---

## Roadmap

### Phase 2 — Course Platform
- [ ] Full CRUD for courses (update, delete)
- [ ] Course enrollment system
- [ ] Pagination on listing endpoints
- [ ] Admin user management endpoints

### Phase 3 — Payments (Razorpay)
- [ ] Create Razorpay order on enrollment
- [ ] Webhook handler with signature verification
- [ ] Enrollment gating on payment success

### Phase 4 — AI Assistant (RAG + OpenAI + pgvector)
- [ ] pgvector extension in PostgreSQL
- [ ] Course content chunking + embedding via OpenAI API
- [ ] Semantic search endpoint
- [ ] `/assistant/ask` — RAG pipeline for student Q&A

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes
4. Open a pull request against `main`

---

## License

MIT
