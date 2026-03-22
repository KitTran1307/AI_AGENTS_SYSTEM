# DEBT_LEDGER — DataPipeline

> Last updated: 2026-03-22

---

## DEBT-001 — Synchronous CSV validation blocks the async event loop

**Created**: 2026-03-22
**Feature Address**: ingestion::pipeline::validate
**Module**: app/services/ingestion.service.py
**Description**: CSV header validation reads the first N lines of the uploaded file
  using Python's synchronous `csv.reader`. For large files (>5MB) this can block
  the FastAPI event loop for 50-200ms, degrading throughput under concurrency.
**Proper solution**:
  ```python
  loop = asyncio.get_event_loop()
  await loop.run_in_executor(None, validate_csv_headers, file_bytes)
  ```
  Or: move validation entirely into the Celery worker (async-safe, no loop blocking).
**Risk**: API latency degrades under concurrent large file uploads. Acceptable at
  current upload volume (<50 concurrent users, files typically <2MB).
**Impact**: medium
**Target**: v1.1.0
**Resolved**: unresolved
