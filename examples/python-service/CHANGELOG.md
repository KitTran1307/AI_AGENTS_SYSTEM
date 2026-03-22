# CHANGELOG — DataPipeline

## [2026-03-22] — Bootstrap
**Session**: 001
**Feature Address**: system::bootstrap::initial
### Added
- Bootstrapped navigation file system via kitai-ai-agents-system-framework
- Created PROJECT_MAP.md for Python/FastAPI/Celery/PostgreSQL architecture
- Populated FEATURE_INDEX.md with ingestion, processing, api, users domains
- Created app/users/MODULE_MANIFEST.md
### Infrastructure
- No commands run (bootstrap is read-only analysis)

## [2026-03-22] — Add CSV header validation on upload
**Session**: 002
**Feature Address**: ingestion::pipeline::validate::create
### Added
- Fast-fail CSV header validation before job is enqueued
- IngestionService.validate_headers(file_bytes) — checks required columns present
- 422 Unprocessable Entity response with column-level error details on failure
### Changed
- ingest_file() now calls validate_headers() before S3 upload (fail fast, avoid wasted storage)
### Infrastructure
- No DB migrations required (validation is stateless)
### Decisions
- Validation runs synchronously in the API request (blocks event loop briefly for large files).
  Recorded as DEBT-001. Acceptable at current upload sizes (<5MB p99).
