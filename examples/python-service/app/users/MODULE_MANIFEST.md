# MODULE_MANIFEST — app/users/

## Purpose
User account management and API key authentication for DataPipeline. Owns user creation,
API key generation/rotation, and the FastAPI dependency that validates API keys on every
protected request. Does NOT handle pipeline or job business logic.

## Public API
  UserService.create_user(data: CreateUserInput) → User
  UserService.get_by_api_key(key: str) → User | None
  UserService.rotate_api_key(user_id: UUID) → str    # returns new plaintext key (shown once)
  get_current_user(api_key: str = Header(...)) → User  # FastAPI dependency for protected routes

## Internal Structure
  service.py       — UserService: create user, find by key, rotate key
  repository.py    — Async SQLAlchemy queries for user table
  schemas.py       — Pydantic: CreateUserInput, UserResponse (no key in response)
  security.py      — Key generation (secrets.token_urlsafe(32)) + SHA-256 hashing
  dependencies.py  — FastAPI get_current_user dependency (raises 401 if invalid)

## Imports from other modules
  core/database    — Async DB session (get_db dependency)
  core/exceptions  — UnauthorizedException, NotFoundException
  core/logger      — Structured auth event logging

## Exports to other modules
  api/             — get_current_user dependency used on all protected routers

## Patterns in use
  - API key: generated with secrets.token_urlsafe(32), stored as SHA-256 hash
  - Lookup: hash the incoming key, query DB by hash — never store or compare plaintext
  - Response: API key shown to user ONCE at creation; not in any subsequent response
  - Auth events logged: user_created, key_rotated, auth_success, auth_failure

## Known constraints / gotchas
  - Key shown once only — if user loses it, they must rotate (no recovery path by design)
  - get_current_user raises HTTP 401 immediately on missing or invalid key — no grace period
  - Rate limiting on auth failures lives in api/middleware/rate_limit.py, not here
  - NEVER log the raw API key — log only `key[:8] + "..."` for debugging correlation

## Security boundary
  - All API key hashing and validation logic lives exclusively in security.py
  - PII: email address only; logged as event presence, not value

## Last updated: 2026-03-22
