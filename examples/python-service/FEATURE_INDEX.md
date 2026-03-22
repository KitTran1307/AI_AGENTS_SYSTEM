# FEATURE_INDEX — DataPipeline

> Navigation index for AI Agents. Given a task, search this file first.
> Last updated: 2026-03-22

---

## [DOMAIN: ingestion] ─────────────────────────────────────────

## ingestion::pipeline::upload_file

**Status**: active
**Owner module**: app/services/
**Primary files**:
  - app/services/ingestion.service.py   # ingest_file() — validate headers, store to S3, enqueue
  - app/api/routers/ingestion.py        # POST /pipelines/upload
**Interface files**:
  - app/core/types.py                   # UploadFile, Job, JobStatus types
**Test files**:
  - tests/unit/test_ingestion_service.py
  - tests/integration/test_ingestion_api.py
**Depends on features**:
  - users::auth::api_key                # upload requires authenticated user
  - adapters::storage::upload           # file stored to S3 before enqueue
**Last modified**: 2026-03-22
**Change summary**: Initial implementation

## ingestion::pipeline::job_status

**Status**: active
**Owner module**: app/services/
**Primary files**:
  - app/services/ingestion.service.py   # get_job_status() — fetch job from DB
  - app/api/routers/ingestion.py        # GET /pipelines/{job_id}/status
**Test files**:
  - tests/unit/test_ingestion_service.py # covers PENDING, PROCESSING, DONE, FAILED states
**Last modified**: 2026-03-22
**Change summary**: Initial implementation

---

## [DOMAIN: processing] ────────────────────────────────────────

## processing::workers::transform

**Status**: active
**Owner module**: app/workers/
**Primary files**:
  - app/workers/processor.py            # Celery task: validate rows, apply transform rules
  - app/services/processing.service.py  # run_pipeline() — orchestrates transform steps
**Test files**:
  - tests/unit/test_processing_service.py
  - tests/unit/test_processor_worker.py
**Also read if modifying**:
  - REGRESSION_INDEX.md                 # REG-001 — Celery retry policy required
**Depends on features**:
  - ingestion::pipeline::upload_file    # worker triggered after successful upload
**Last modified**: 2026-03-22
**Change summary**: Initial implementation

---

## [DOMAIN: api] ───────────────────────────────────────────────

## api::health::check

**Status**: active
**Owner module**: app/api/
**Primary files**:
  - app/api/routers/health.py           # GET /health — returns DB + Redis + worker connectivity
**Test files**:
  - tests/integration/test_health.py
**Last modified**: 2026-03-22
**Change summary**: Initial implementation

---

## [DOMAIN: users] ─────────────────────────────────────────────

## users::auth::api_key

**Status**: active
**Owner module**: app/users/
**Primary files**:
  - app/users/service.py                # get_by_api_key(), create_user(), rotate_api_key()
  - app/users/dependencies.py           # FastAPI get_current_user dependency
  - app/users/security.py              # key generation + SHA-256 hashing
**Test files**:
  - tests/unit/test_user_service.py
  - tests/integration/test_auth.py
**Last modified**: 2026-03-22
**Change summary**: Initial implementation

---

## DEPRECATION LOG

<!-- none yet -->
