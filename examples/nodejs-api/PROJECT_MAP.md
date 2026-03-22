# PROJECT_MAP — TaskAPI

## Project Overview
TaskAPI is a REST API for team task management. It provides JWT-authenticated endpoints
for creating, assigning, and tracking tasks across user accounts. It serves mobile and
web clients via HTTP/JSON.

## Tech Stack
- Runtime: Node.js 20 (LTS)
- Framework: Express 4.18
- Database: PostgreSQL 15 (primary), Redis 7 (sessions + cache)
- Auth: JWT (access tokens 15min, refresh tokens 7d, httpOnly cookies)
- Query builder: Knex.js + raw SQL for complex queries
- Testing: Jest 29 + Supertest
- Deployment: Docker + docker-compose

## Directory Tree
```
src/
├── core/          — Config, logger, errors, event bus, shared types
├── api/           — Routes, controllers, middleware, validators, serializers
├── services/      — Business logic: auth, user, task services
├── repositories/  — Data access: user repo, task repo (Knex queries)
├── adapters/      — External integrations: email (SendGrid)
└── workers/       — Background jobs: email sender, task reminders
tests/
├── unit/          — Pure logic tests (no I/O)
├── integration/   — Service + real DB tests
└── fixtures/      — Test data: users, tasks, JWT tokens
```

## Cross-Module Dependency Graph
```
core          ← (no dependencies)
repositories  ← core
adapters      ← core
services      ← core, repositories, adapters
api           ← services, core
workers       ← services, core
```

## Public Interface Registry
```
core.loadConfig() → Config
core.getLogger(name: string) → Logger
core.EventBus.emit(event: DomainEvent) → void

services.AuthService.login(email, password) → { accessToken, refreshToken }
services.AuthService.register(data: CreateUserInput) → User
services.AuthService.refreshToken(token: string) → { accessToken }
services.AuthService.logout(refreshToken: string) → void

services.UserService.getUserById(id: UserId) → User | null
services.UserService.updateProfile(id: UserId, data: UpdateProfileInput) → User

services.TaskService.createTask(data: CreateTaskInput) → Task
services.TaskService.getTaskById(id: TaskId) → Task | null
services.TaskService.listTasks(filters: TaskFilters) → PaginatedResult<Task>
services.TaskService.updateTask(id: TaskId, data: UpdateTaskInput) → Task
services.TaskService.deleteTask(id: TaskId) → void
```

## Data Flow Architecture
```
HTTP Request
     │
     ▼
Middleware (request-id, cors, rate-limit, auth)
     │
     ▼
Controller (parse + validate input)
     │
     ▼
Service (business logic, emit domain events)
     │
     ├──▶ Repository (DB reads/writes via Knex)
     └──▶ Adapter (email, notifications)
```

## Environment Variable Registry
```
DATABASE_URL=<string>        # consumed by: repositories/db.js
REDIS_URL=<string>           # consumed by: core/cache.js
JWT_SECRET=<string>          # consumed by: services/auth.service.js
JWT_REFRESH_SECRET=<string>  # consumed by: services/auth.service.js
SENDGRID_API_KEY=<string>    # consumed by: adapters/email/
PORT=<number>                # consumed by: api/server.js (default: 3000)
NODE_ENV=<string>            # consumed by: core/config.js
```

## Infrastructure & Services
- PostgreSQL 15: primary data store (users, tasks, sessions)
- Redis 7: JWT refresh token store, rate limiting, Bull job queue
- SendGrid: transactional email (welcome, task assignments, reminders)

## Last updated: 2026-03-22
