# PROJECT_MAP — DataPipeline

## Project Overview
DataPipeline is an async data ingestion and transformation service. It accepts CSV/JSON
uploads via REST API, validates and transforms records through configurable processing
rules, and exports results to downstream systems. Serves data engineering teams via HTTP/JSON.

## Tech Stack
- Runtime: Python 3.11
- Framework: FastAPI 0.104 (fully async)
- Database: PostgreSQL 15 (primary), Redis 7 (Celery broker + result backend)
- Task Queue: Celery 5.3 with Redis broker
- ORM: SQLAlchemy 2.0 (async sessions)
- File Storage: AWS S3
- Testing: pytest 7 + pytest-asyncio + httpx
- Deployment: Docker + docker-compose

## Directory Tree
```
app/
├── core/          — Settings, logger, exceptions, DB session factory, base types
├── api/           — FastAPI routers, request/response Pydantic schemas, dependencies
├── services/      — Business logic: ingestion, processing, export services
├── repositories/  — Async SQLAlchemy queries: pipeline repo, job repo, results repo
├── workers/       — Celery tasks: file processor, transformer, exporter
├── adapters/      — External integrations: S3 storage, webhook notifier
└── users/         — User management: API key auth, profiles, key rotation
tests/
├── unit/          — Pure logic (validators, transformers, no I/O)
├── integration/   — Service + real DB (pytest-asyncio)
└── fixtures/      — CSV/JSON test files, DB seeds
```

## Cross-Module Dependency Graph
```
core          ← (no dependencies)
repositories  ← core
adapters      ← core
users         ← core, repositories
services      ← core, repositories, adapters
workers       ← services, core
api           ← services, users, core
```

## Public Interface Registry
```
core.get_settings() → Settings
core.get_db() → AsyncIterator[AsyncSession]    # FastAPI dependency

services.IngestionService.ingest_file(file: UploadFile, user_id: UUID) → Job
services.IngestionService.get_job_status(job_id: UUID) → Job
services.ProcessingService.run_pipeline(job_id: UUID) → ProcessingResult
services.ExportService.export_results(job_id: UUID, format: ExportFormat) → bytes

users.UserService.create_user(data: CreateUserInput) → User
users.UserService.get_by_api_key(key: str) → User | None
users.UserService.rotate_api_key(user_id: UUID) → str    # returns new plaintext key
users.get_current_user(api_key: str = Header(...)) → User  # FastAPI dependency
```

## Data Flow Architecture
```
HTTP Request (file upload or job status)
     │
     ▼
FastAPI Router (API key auth, rate limiting)
     │
     ▼
Service Layer (validate, create Job record, enqueue Celery task)
     │
     ├──▶ Repository (persist job state to PostgreSQL)
     └──▶ Celery Task Queue (Redis broker)
               │
               ▼
          Worker (process file, write results, update job status)
               │
               └──▶ Adapter (S3 for storage, webhook for completion)
```

## Environment Variable Registry
```
DATABASE_URL=<string>          # consumed by: core/database.py
REDIS_URL=<string>             # consumed by: core/cache.py, workers/celery_app.py
S3_BUCKET=<string>             # consumed by: adapters/storage.py
S3_REGION=<string>             # consumed by: adapters/storage.py
AWS_ACCESS_KEY_ID=<string>     # consumed by: adapters/storage.py
AWS_SECRET_ACCESS_KEY=<string> # consumed by: adapters/storage.py
SECRET_KEY=<string>            # consumed by: app/users/security.py (API key hashing)
PORT=<number>                  # consumed by: main.py (default: 8000)
```

## Infrastructure & Services
- PostgreSQL 15: job records, pipeline configs, user accounts, results metadata
- Redis 7: Celery broker + result backend; rate limiting
- S3: raw uploaded files + processed output storage

## Last updated: 2026-03-22
