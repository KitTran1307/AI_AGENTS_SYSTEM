---
id: "epic:{{name}}"
type: epic
status: draft
producer: architect
created: "{{timestamp}}"
updated: "{{timestamp}}"
edges:
  requires:
    - "architecture:{{arch_name}}"
  decomposes:
    - "story:{{story_name}}"
tags: []
---

# Epic: {{title}}

## Scope
What this epic covers and its boundaries.

## Stories
1. story:{{name}}-1 — [Description]
2. story:{{name}}-2 — [Description]

## Acceptance Criteria
- [ ] [High-level criterion that spans multiple stories]

## Dependencies
- Depends on: [other epics or external systems]
- Blocks: [epics that cannot start until this completes]
