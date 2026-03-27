---
id: "prd:user-management"
type: prd
status: done
producer: product-manager
created: "2026-03-20T10:00:00Z"
updated: "2026-03-22T14:30:00Z"
edges:
  requires:
    - "brief:product-vision"
  informs:
    - "architecture:auth"
    - "ux-spec:login-flow"
quality_gate:
  status: pass
  checklist: prd-ready
  checked_at: "2026-03-22T14:30:00Z"
tags:
  - auth
  - users
---

# User Management PRD

## Overview
The system requires user authentication with email/password and OAuth2 providers.

## Functional Requirements
- FR-1: Users can register with email and password
- FR-2: Users can log in with email and password
- FR-3: Users can log in with Google OAuth2
- FR-4: Users can reset their password via email

## Non-Functional Requirements
- NFR-1: Login response time < 200ms p95
- NFR-2: Password hashing uses bcrypt with cost factor 12
