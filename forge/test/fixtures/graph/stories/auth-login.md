---
id: "story:auth-login"
type: story
status: in-progress
producer: scrum-master
created: "2026-03-23T10:00:00Z"
updated: "2026-03-24T14:00:00Z"
edges:
  requires:
    - "architecture:auth"
    - "prd:user-management"
  implements:
    - "epic:auth"
tags:
  - auth
  - login
---

# Auth Login Story

## Acceptance Criteria
- AC-1: User can log in with valid email/password
- AC-2: Invalid credentials return 401
