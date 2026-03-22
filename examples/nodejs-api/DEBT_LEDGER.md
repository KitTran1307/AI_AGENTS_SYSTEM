# DEBT_LEDGER — TaskAPI

> Last updated: 2026-03-22

---

## DEBT-001 — Offset-based pagination instead of cursor-based

**Created**: 2026-03-22
**Feature Address**: tasks::crud::list
**Module**: src/repositories/
**Description**: Task list uses OFFSET-based pagination (LIMIT x OFFSET y). Correct and
  stable (see REG-001 fix) but inefficient at high row counts — PostgreSQL scans all rows
  up to the offset position even when discarding them.
**Proper solution**: Implement keyset/cursor pagination: `WHERE id < :cursor ORDER BY id DESC LIMIT :limit`.
  Return `next_cursor` in the response envelope. Client passes cursor on next request.
**Risk**: Query time grows O(offset) as task count grows. Acceptable at current scale
  (<10k tasks per user). Will degrade noticeably above 50k tasks.
**Impact**: low
**Target**: v1.2.0
**Resolved**: unresolved
