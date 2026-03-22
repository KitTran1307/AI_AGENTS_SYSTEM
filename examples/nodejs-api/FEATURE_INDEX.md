# FEATURE_INDEX — TaskAPI

> Navigation index for AI Agents. Given a task, search this file first.
> Last updated: 2026-03-22

---

## [DOMAIN: auth] ─────────────────────────────────────────────

## auth::users::login

**Status**: active
**Owner module**: src/services/
**Primary files**:
  - src/services/auth.service.js    # login() — validates credentials, issues JWT pair
  - src/api/controllers/auth.js     # POST /auth/login handler
**Interface files**:
  - src/core/types/auth.js          # AuthTokenPair, LoginInput types
**Test files**:
  - tests/unit/auth.service.test.js # covers login success, wrong password, account locked
  - tests/integration/auth.test.js  # covers full login flow with real DB
**Depends on features**:
  - auth::users::find_by_email
  - core::config::jwt
**Last modified**: 2026-03-22
**Change summary**: Initial implementation

## auth::users::register

**Status**: active
**Owner module**: src/services/
**Primary files**:
  - src/services/auth.service.js    # register() — hash password, create user, send welcome email
  - src/api/controllers/auth.js     # POST /auth/register handler
**Test files**:
  - tests/unit/auth.service.test.js # covers duplicate email, weak password, success
**Depends on features**:
  - users::crud::create
  - adapters::email::send_welcome
**Last modified**: 2026-03-22
**Change summary**: Initial implementation

## auth::users::refresh_token

**Status**: active
**Owner module**: src/services/
**Primary files**:
  - src/services/auth.service.js    # refreshToken() — validates, rotates, issues new pair
  - src/api/controllers/auth.js     # POST /auth/refresh handler
**Also read if modifying**:
  - src/core/cache.js               # Redis client for token blacklist
**Test files**:
  - tests/unit/auth.service.test.js # covers valid refresh, expired token, replayed token
**Last modified**: 2026-03-22
**Change summary**: Initial implementation

---

## [DOMAIN: tasks] ─────────────────────────────────────────────

## tasks::crud::create

**Status**: active
**Owner module**: src/services/
**Primary files**:
  - src/services/task.service.js    # createTask() — validates, persists, emits domain event
  - src/api/controllers/tasks.js    # POST /tasks handler
**Interface files**:
  - src/core/types/tasks.js         # Task, CreateTaskInput types
**Test files**:
  - tests/unit/task.service.test.js
  - tests/integration/tasks.test.js
**Depends on features**:
  - auth::users::login              # task creation requires authenticated user
**Last modified**: 2026-03-22
**Change summary**: Initial implementation

## tasks::crud::list

**Status**: active
**Owner module**: src/services/
**Primary files**:
  - src/services/task.service.js    # listTasks() — paginated query with filters
  - src/api/controllers/tasks.js    # GET /tasks handler
**Test files**:
  - tests/unit/task.service.test.js # covers empty list, pagination, filter combinations
**Also read if modifying**:
  - REGRESSION_INDEX.md             # REG-001 — pagination stability (ORDER BY required)
**Last modified**: 2026-03-22
**Change summary**: Initial implementation

---

## DEPRECATION LOG

<!-- none yet -->
