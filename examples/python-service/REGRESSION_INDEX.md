# REGRESSION_INDEX — DataPipeline

> Bugs that have been fixed. Never reintroduce these.
> Last updated: 2026-03-22

---

## REG-001 — Celery worker silently drops jobs when Redis connection is interrupted

**Feature Address**: processing::workers::transform
**Date fixed**: 2026-03-22
**Severity**: critical
**Symptom**: File upload returned HTTP 202 Accepted, job appeared in DB as PENDING,
  but job never progressed to PROCESSING. No error visible in API logs. No exception raised.
**Root cause**: Celery task was defined with `ignore_result=True` and no retry policy.
  When Redis was briefly unavailable, the broker silently dropped the enqueued task.
  The job record stayed PENDING indefinitely with no failure path.
**Fix**: Added to all Celery tasks:
  `autoretry_for=(Exception,)`, `max_retries=3`, `default_retry_delay=5`, `acks_late=True`.
  Added explicit job status transition to FAILED with error message on final retry exhaustion.
**Prevention rule**: All Celery tasks MUST define a retry policy. Never use `ignore_result=True`
  on tasks that affect persistent state. Always handle `kombu.exceptions.OperationalError`.
  Every task must have a failure path that updates the job record.
**Test added**: tests/integration/test_processor_worker.py::test_worker_retries_on_broker_failure
