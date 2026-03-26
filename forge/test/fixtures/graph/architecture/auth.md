---
id: "architecture:auth"
type: architecture
status: done
producer: architect
created: "2026-03-21T10:00:00Z"
updated: "2026-03-21T16:00:00Z"
edges:
  requires:
    - "prd:user-management"
  informs:
    - "story:auth-login"
quality_gate:
  status: pass
  checklist: architecture-ready
  checked_at: "2026-03-21T16:00:00Z"
tags:
  - auth
---

# Auth Architecture

## Components
- AuthService: handles login, registration, token management
- TokenStore: Redis-backed JWT token storage
