---
id: "prd:{{name}}"
type: prd
status: draft
producer: product-manager
created: "{{timestamp}}"
updated: "{{timestamp}}"
edges:
  requires:
    - "brief:{{brief_name}}"
tags: []
---

# {{title}} — Product Requirements Document

## Overview
One-paragraph summary of what this product/feature does and why.

## Functional Requirements
- FR-1: [Requirement with measurable acceptance criteria]
- FR-2: [Requirement with measurable acceptance criteria]

## Non-Functional Requirements
- NFR-1: [Performance, security, or reliability requirement with target metric]
- NFR-2: [Performance, security, or reliability requirement with target metric]

## User Stories
- As a [user type], I want [action] so that [outcome]

## Success Metrics
- Metric 1: [Baseline] → [Target]

## Out of Scope
What this PRD explicitly does NOT cover.
