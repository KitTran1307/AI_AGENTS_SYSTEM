---
id: "story:{{name}}"
type: story
status: draft
producer: scrum-master
created: "{{timestamp}}"
updated: "{{timestamp}}"
edges:
  requires:
    - "architecture:{{arch_name}}"
    - "prd:{{prd_name}}"
  implements:
    - "epic:{{epic_name}}"
tags: []
---

# Story: {{title}}

## Context
Brief technical context from architecture. What the developer needs to know.

## Acceptance Criteria
- AC-1: [Testable assertion]
- AC-2: [Testable assertion]
- AC-3: [Testable assertion]

## Tasks
1. [ ] Write failing test for AC-1
2. [ ] Implement AC-1
3. [ ] Write failing test for AC-2
4. [ ] Implement AC-2
5. [ ] Run full test suite
6. [ ] Submit for review

## Files to Create/Modify
- Create: `path/to/new-file.ts`
- Modify: `path/to/existing-file.ts`
- Test: `test/path/to/test-file.ts`

## Regression Warnings
[Any relevant regressions from this domain]
