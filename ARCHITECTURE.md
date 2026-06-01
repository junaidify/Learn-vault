# LearnVault — Architecture, Bug Log & Precautions

---

## 1. Architecture Flow

```
HTTP Request
    │
    ▼
[JwtFilters.doFilterInternal]
    ├─ Extracts "jwt" cookie
    ├─ If no cookie → pass through (Spring Security handles auth check)
    ├─ If invalid/expired JWT → 401 Unauthorized (JSON body)
    └─ If valid JWT → extract email → load UserDetails → set SecurityContext
    │
    ▼
[Spring Security authorizeHttpRequests]
    ├─ /auth/**         → permitAll
    ├─ /admin/**        → ADMIN only
    ├─ /author/**       → ADMIN or AUTHOR
    ├─ /course/create-course → ADMIN or AUTHOR
    └─ /course/**       → ADMIN, AUTHOR, or STUDENT
    │
    ▼
[@PreAuthorize("hasRole('AUTHOR')")]   ← also enforced via MethodSecurityExpressionHandler
    │
    ▼
[Controller]
    │  validates @Valid DTOs → 400 if invalid
    ▼
[Service]
    │  business logic, @Transactional on mutations
    ├─ SecurityContextHolder.getContext().getAuthentication().getName() → email
    └─ throws specific exceptions (BadCredentialsException, IllegalStateException)
    │
    ▼
[Repository]  (Spring Data JPA → Hibernate → PostgreSQL)
    │
    ▼
[GlobalExceptionHandler]
    ├─ MethodArgumentNotValidException  → 400 { field: message }
    ├─ BadCredentialsException          → 401 { error: "Invalid credentials" }
    ├─ UsernameNotFoundException        → 401 { error: "Invalid credentials" }
    ├─ IllegalStateException            → 409 { error: message }
    └─ RuntimeException (catch-all)     → 400 { error: message }
```

### Entity Relationship

```
users ──────────── 1:1 ──────────── author
  id                                  author_id
  name                                author_name
  username                            user_id (FK → users.id)
  email                               │
  password                            │ 1:N
  role                                ▼
                                    courses
                                      id
                                      title
                                      author_id (FK → author.author_id)
```

### Authentication Flows

**Form login (JWT):**
```
POST /auth/login
  → UserService.userLogin()
  → validate credentials (BadCredentialsException if wrong)
  → JwtUtils.jwtGeneration(email)
  → ResponseCookie "jwt" (HttpOnly, 48h)
```

**Google OAuth2:**
```
GET /oauth2/authorization/google
  → Spring redirects to Google
  → Google redirects to /login/oauth2/code/google
  → Oauth2SuccessHandler.onAuthenticationSuccess()
  → provision user in DB if first login (role = STUDENT)
  → JwtUtils.jwtGeneration(email)
  → Cookie set → redirect to frontend (app.oauth2-redirect)
```

**Signup (auto-login):**
```
POST /auth/signup
  → UserService.userSignUp()
  → if role == AUTHOR: create AuthorEntity linked to new user
  → JwtUtils.jwtGeneration(email)
  → ResponseCookie "jwt" set immediately
```

---

## 2. Bug Log — All 20 Bugs Fixed

---

### BUG-01 · CRITICAL — Wrong password returns string instead of exception

**File:** `UserService.java:56`  
**Before:**
```java
if(!passwordEncoder.matches(dto.getPassword(), user.getPassword())){
    return "Invalid password";
}
return jwtUtils.jwtGeneration(user.getEmail());
```
**Problem:** The controller called `userService.userLogin(dto)` and unconditionally set the return value as a JWT cookie. A failed login returned the literal string `"Invalid password"` — which the controller then wrote into the `jwt` cookie with HTTP 200. The user received a session cookie containing the text "Invalid password". Classic authentication bypass.

**Fix:** Throw `BadCredentialsException("Invalid credentials")` instead of returning a string. `GlobalExceptionHandler` catches it and returns 401.

---

### BUG-02 · CRITICAL — Role hierarchy bean not wired (silently ignored)

**File:** `AppConfig.java`, `SecurityConfig.java`  
**Before:** `RoleHierarchy` bean was defined but never connected to anything. Spring Security's `authorizeHttpRequests()` and `@EnableMethodSecurity` both require explicit wiring to use it.

**Problem:** ADMIN had `ROLE_ADMIN` only. Without the hierarchy, ADMIN could not access `/course/**` (requires `ROLE_STUDENT`) or `/author/**` (requires `ROLE_AUTHOR`). The hierarchy was defined but produced zero effect.

**Fix:**
1. Added `static MethodSecurityExpressionHandler` bean in `AppConfig` with the hierarchy injected — this activates it for all `@PreAuthorize` annotations.
2. Changed `SecurityConfig` web rules to use `hasAnyRole("ADMIN","AUTHOR","STUDENT")` etc. — because `authorizeHttpRequests()` in Spring Security 6/7 does not automatically pick up the hierarchy bean from context.

---

### BUG-03 · CRITICAL — OAuth2 property name wrong (`secret-id` vs `client-secret`)

**File:** `application-local.yml:8`  
**Before:** `secret-id: GOCSPX-...`  
**Problem:** Spring Boot OAuth2 auto-configuration expects `client-secret`. Using `secret-id` means the secret was never bound, so every OAuth2 authentication attempt failed with a 401 at Google's token endpoint.

**Fix:** Renamed to `client-secret:` and moved value to `${GOOGLE_CLIENT_SECRET}` env var.

---

### BUG-04 · CRITICAL — Trailing comma in OAuth2 client-id value

**File:** `application-local.yml:7`  
**Before:** `client-id: 254571671016-...apps.googleusercontent.com,`  
**Problem:** The comma was part of the YAML scalar value and was included in the client-id string sent to Google. Google rejected it with an "invalid client" error.

**Fix:** Removed the trailing comma; moved value to `${GOOGLE_CLIENT_ID}`.

---

### BUG-05 · CRITICAL — OAuth2 users never provisioned in the database

**File:** `Oauth2SuccessHandler.java`  
**Before:** The handler extracted the email and immediately generated a JWT. On the next request, `JwtFilters` called `customUserDetailsService.loadUserByUsername(email)` which queried the DB. If the user wasn't there (first OAuth2 login), it threw `UsernameNotFoundException` → 500 Internal Server Error.

**Fix:** Added `UserRepository` injection to `Oauth2SuccessHandler`. On success, call `findByEmail` — if absent, create a `UserEntity` with role `STUDENT` and save it before generating the token.

---

### BUG-06 · CRITICAL — Circular JSON serialization (stack overflow)

**File:** `CourseController.java`, `AuthorEntity.java`  
**Before:** `getCourses()` returned `List<CourseEntity>` directly. `CourseEntity` had `AuthorEntity author` which had `List<CourseEntity> courses` which had `AuthorEntity author`... Jackson would recurse until stack overflow or a 500 error.

**Fix:** Created `CourseResponseDto` with only `id`, `title`, `authorName`. All course endpoints now return DTOs, never raw entities.

---

### BUG-07 · CRITICAL — Any AUTHOR can create a course under any author name

**File:** `CourseService.java`, `CourseDto.java`  
**Before:** `CourseDto` had an `authorName` field. Any user with AUTHOR role could pass any string as `authorName` — the service would find or create an author with that name, completely unrelated to the authenticated user.

**Fix:** Removed `authorName` from `CourseDto`. The service now reads the email from `SecurityContextHolder`, finds the corresponding `UserEntity`, then finds or creates the `AuthorEntity` linked to that user. The author is always derived from the authenticated principal.

---

### BUG-08 · CRITICAL — Missing `@Transactional` on mutating service methods

**File:** `CourseService.java`, `UserService.java`  
**Problem:** Without `@Transactional`, the "check then act" pattern (check if course exists → save if not) was not atomic. Two concurrent requests could both pass the existence check and insert duplicate courses. The partial failure path (author saved, course save fails) left the DB in an inconsistent state.

**Fix:** Added `@Transactional` to `courseCreate` and `userSignUp`. `getCourses` and `getCourse` use `@Transactional(readOnly = true)` to avoid unnecessary write locks.

---

### BUG-09 · HIGH — Null check misses empty string in login

**File:** `UserService.java:44`  
**Before:** `if(dto.getEmail() == null && dto.getUsername() == null)`  
**Problem:** Sending `email: ""` (empty string) would pass this check because `"" != null`. The code would then call `userRepository.findByEmail("")` which returns `Optional.empty()` and throw a generic `RuntimeException("User not found")` — leaking info and returning 409 instead of 401.

**Fix:** Use `StringUtils.hasText()` which returns `false` for both null and blank strings. Also restructured to search by email or username independently (not both simultaneously), which fixed the secondary bug in `findByUsernameOrEmail` with nulls.

---

### BUG-10 · HIGH — Service fields declared `public` instead of `private`

**File:** `UserService.java:15-17`  
**Before:** `public final UserRepository userRepository;` (and the other two fields)  
**Problem:** Exposed internal dependencies as public fields, violating encapsulation. Any code in the same package could bypass the service layer and call repository methods directly.

**Fix:** Changed all three to `private final`.

---

### BUG-11 · HIGH — Course creation returns HTTP 200 for "already exists"

**File:** `CourseService.java:33`, `CourseController.java:25`  
**Before:** `courseCreate` returned the string `"Course already exist"` with HTTP 200 on duplicates. Clients had to do string-matching on response bodies to detect errors.

**Fix:** `courseCreate` throws `IllegalStateException("Course already exists under this author")`. `GlobalExceptionHandler` maps `IllegalStateException` → 409 Conflict with a JSON body.

---

### BUG-12 · HIGH — `GET /course/` (trailing slash) vs `GET /course`

**File:** `CourseController.java:29`  
**Before:** `@GetMapping("/")` — the endpoint was at `/course/`, not `/course`. Most HTTP clients and frontend frameworks call `/course` without the trailing slash, receiving a 404.

**Fix:** Changed to `@GetMapping` (no path), which maps to the controller's base path `/course`.

---

### BUG-13 · HIGH — All `RuntimeException` returns 409 Conflict

**File:** `GlobalExceptionHandler.java`  
**Before:** A single `@ExceptionHandler(RuntimeException.class)` returned 409 for everything — including `BadCredentialsException` (should be 401), `UsernameNotFoundException` (should be 401), and general validation errors (should be 400).

**Fix:** Added specific handlers: `BadCredentialsException` + `UsernameNotFoundException` → 401, `IllegalStateException` → 409, generic `RuntimeException` → 400.

---

### BUG-14 · HIGH — JWT cookie always `Secure: false` (hardcoded)

**File:** `Oauth2SuccessHandler.java:29`  
**Before:** `cookie.setSecure(false)` — hardcoded. In production over HTTPS this means the cookie travels unencrypted, exposing the JWT to network interception.

**Fix:** `cookie.setSecure(cookieSecure)` where `cookieSecure` is injected from `${app.cookie-secure}`. Defaults to `false` locally, set to `true` in production via `COOKIE_SECURE=true` env var.

---

### BUG-15 · HIGH — Redirect URL hardcoded to localhost

**File:** `Oauth2SuccessHandler.java:35`  
**Before:** `response.sendRedirect("http://localhost:5173/dashboard")`  
**Problem:** In any non-local environment this redirects users to localhost — effectively breaking OAuth2 login for all non-developers.

**Fix:** Injected `${app.oauth2-redirect}` and used that value. Configurable per environment.

---

### BUG-16 · HIGH — `@Data` on JPA entity with bidirectional relationship

**File:** `AuthorEntity.java`  
**Before:** `@Data` generates `equals`, `hashCode`, and `toString` using ALL fields. `AuthorEntity` has `List<CourseEntity> courses` and `UserEntity user`. The generated `toString` and `equals` would traverse these relationships recursively, causing stack overflow when Hibernate tried to print or compare entities with lazy-loaded collections.

**Fix:** Replaced `@Data` with `@Getter @Setter @ToString(exclude = {"courses", "user"})`. Added a two-argument constructor `AuthorEntity(authorName, user)` needed by the new user provisioning logic.

---

### BUG-17 · MEDIUM — `findByUsernameOrEmail(null, email)` matches wrong users

**File:** `UserRepository.java`, `UserService.java`  
**Before:** When logging in by email, `username = null` was passed. Spring Data JPA translates `null` parameters to `IS NULL` in the `OR` clause: `WHERE username IS NULL OR email = ?`. This could return users with a null username field if one ever existed.

**Fix:** Removed `findByUsernameOrEmail`. Added separate `findByEmail` and `findByUsername`. `UserService.userLogin` now chooses which to call based on which field has text.

---

### BUG-18 · MEDIUM — JWT secret committed in plaintext

**File:** `application.properties:7`  
**Before:** `jwt.secret = 2tTNCo6t7U7TuHA0pvsHkzToD4Eabq/iV/3mNpqHs1M=`  
**Problem:** The HMAC signing key was committed in version control. Anyone with repo access can forge valid JWTs.

**Fix:** Changed to `jwt.secret=${JWT_SECRET:dev-default}`. The dev default remains for local development only. Production must set `JWT_SECRET` via environment variable or secrets manager.

---

### BUG-19 · MEDIUM — No logout endpoint

**File:** Missing  
**Problem:** Users had no way to invalidate their session. The only way out was to wait 48 hours for the JWT to expire or manually clear the cookie in the browser.

**Fix:** Added `POST /auth/logout` to `LoginController`. Returns a `Set-Cookie: jwt=; Max-Age=0` header which instructs the browser to immediately delete the cookie. (Note: server-side JWT blacklisting requires a distributed cache — out of scope but recommended for high-security deployments.)

---

### BUG-20 · LOW — Redundant repository method declarations

**File:** `CourseRepository.java`  
**Before:** Declared `List<CourseEntity> findAll()` and `Optional<CourseEntity> findById(Long id)` — both already provided by `JpaRepository`.

**Fix:** Removed the redundant declarations. Also removed `findByAuthorId` from `AuthorRepository` (already covered by `JpaRepository.findById`). Replaced `existsByAuthor_AuthorId` + manual stream check in `CourseService` with a single `existsByTitleAndAuthor_AuthorId` query, eliminating the N+1 load.

---

## 3. Precautions for Production

### Security

| Precaution | Reason |
|-----------|--------|
| Set `COOKIE_SECURE=true` | Prevents JWT being sent over plain HTTP |
| Rotate `JWT_SECRET` periodically | Limits damage from key exposure |
| Use a secrets manager (AWS SSM, Vault) | Avoids secrets in env vars on shared hosts |
| Add CORS config for your domain only | Prevents cross-origin cookie theft |
| Rate-limit `/auth/login` | Prevents brute force password attacks |
| Consider JWT blacklist for logout | Cookie-delete logout is client-side only; a stolen token stays valid until expiry |

### Database

| Precaution | Reason |
|-----------|--------|
| Set `DDL_AUTO=validate` | Prevents Hibernate from silently dropping/altering schema |
| Add `UNIQUE` constraint on `courses(title, author_id)` | Enforce at DB level; `@Transactional` alone doesn't prevent all race conditions at high concurrency |
| Use a dedicated DB user with minimal privileges | Limits blast radius of SQL injection or credential leak |

### OAuth2

| Precaution | Reason |
|-----------|--------|
| Never commit `client-id` or `client-secret` | They were committed — rotate them immediately |
| Restrict Google OAuth2 redirect URIs in Cloud Console | Prevents open redirect attacks |
| Verify email is confirmed before trusting it | Google marks `email_verified` in the OAuth2 payload |

### Operational

| Precaution | Reason |
|-----------|--------|
| Put app behind HTTPS reverse proxy | Required for `Secure` cookies and HSTS |
| Enable Spring Actuator health checks | Needed for load balancer health probes |
| Configure HikariCP pool size | Default pool may be too small / too large for your DB |
| Add structured logging (not `show-sql: true`) | Avoid credential/PII leakage in SQL debug logs in production |
