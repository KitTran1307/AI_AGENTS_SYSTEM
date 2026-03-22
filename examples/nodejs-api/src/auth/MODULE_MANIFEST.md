# MODULE_MANIFEST — src/services/ (auth domain)

## Purpose
Authentication and authorization for the entire API. Owns the full auth lifecycle:
registration, login, JWT issuance, refresh token rotation, and logout.
Does NOT handle user profile data — that lives in services/user.service.js.

## Public API
  AuthService.register(data: CreateUserInput) → User
  AuthService.login(email: string, password: string) → AuthTokenPair
  AuthService.refreshToken(refreshToken: string) → { accessToken: string }
  AuthService.logout(refreshToken: string) → void
  authMiddleware() → Express.Middleware    # JWT validation + req.user injection

## Internal Structure
  auth.service.js     — Business logic: register, login, token operations
  auth.middleware.js  — Express middleware: JWT validation, user context injection
  auth.repository.js  — DB queries: user lookup, session storage
  auth.validators.js  — Zod schemas: LoginInput, RegisterInput

## Imports from other modules
  core/config    — JWT_SECRET, JWT_REFRESH_SECRET, token TTLs
  core/errors    — UnauthorizedError, ValidationError
  core/logger    — Structured auth event logging
  core/cache     — Redis client for refresh token blacklist

## Exports to other modules
  api/middleware/  — authMiddleware used on all protected routes
  api/controllers/ — AuthService called by auth.controller.js

## Patterns in use
  - Passwords: bcrypt, cost factor 12
  - Access token: 15min TTL, signed with JWT_SECRET
  - Refresh token: 7d TTL, httpOnly cookie, stored hash in Redis
  - Rotation: old refresh token blacklisted in Redis on every use (replay prevention)
  - All auth events logged: login_success, login_failure, token_refresh, logout

## Known constraints / gotchas
  - NEVER return password hash in any response — serializer strips it before return
  - Refresh tokens: Redis TTL = token expiry; Redis loss = forced re-login for all users
  - authMiddleware sets req.user — downstream code reads from req.user, never re-fetches
  - Login rate limit: 5 attempts/15min per IP — enforced in api/middleware/rate-limit.js
  - jwt.verify() throws on expired tokens — always catch TokenExpiredError separately

## Security boundary
  - All password verification and JWT validation lives here
  - PII handled: email (logged as presence only), hashed password (never logged/returned)

## Last updated: 2026-03-22
