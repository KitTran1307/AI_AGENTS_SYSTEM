# REGRESSION_INDEX — TaskAPI

> Bugs that have been fixed. Never reintroduce these.
> Last updated: 2026-03-22

---

## REG-001 — Pagination returns duplicate tasks on concurrent inserts

**Feature Address**: tasks::crud::list
**Date fixed**: 2026-03-22
**Severity**: medium
**Symptom**: GET /tasks with page=2 occasionally returned items already visible on page=1
  when new tasks were inserted between page requests.
**Root cause**: Pagination used OFFSET without a stable sort order. Concurrent inserts
  shifted row positions between sequential page requests.
**Fix**: Added `ORDER BY created_at DESC, id DESC` to all paginated queries in
  src/repositories/task.repository.js. The composite sort ensures deterministic ordering
  even when created_at values collide (same-millisecond inserts).
**Prevention rule**: All paginated queries MUST have a deterministic ORDER BY clause
  with a unique tie-breaker (typically `id`). Never paginate without a stable sort.
**Test added**: tests/integration/tasks.test.js::test_pagination_stable_under_concurrent_inserts
