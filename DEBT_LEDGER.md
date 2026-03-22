# DEBT_LEDGER — [PROJECT NAME]

> **Technical Debt Registry.** Every deliberate shortcut taken under time pressure is recorded here.
> Never take a shortcut without recording it. Never close a session with unrecorded debt.
> Debt that is not visible is debt that never gets paid.
>
> Last updated: [AGENT: INSERT DATE]

---

## ENTRY FORMAT

```markdown
## DEBT-[NNN] — <short title>

**Created**: YYYY-MM-DD
**Feature Address**: domain::module
**Module**: path/to/module/
**Description**: [What was skipped and why — be specific]
**Proper solution**: [What the correct implementation would look like]
**Risk**: [What breaks or degrades if this remains forever]
**Impact**: high | medium | low
**Target**: [sprint / milestone / version for resolution]
**Resolved**: [YYYY-MM-DD / unresolved]
```

---

## RESOLUTION PROTOCOL

When resolving a debt entry:
1. Implement the proper solution (reference the `Proper solution` field)
2. Write the tests that the shortcut skipped
3. Mark the entry `**Resolved**: YYYY-MM-DD`
4. Add a CHANGELOG.md entry: `fix(scope): resolve DEBT-NNN — <title>`
5. Add a REGRESSION_INDEX.md entry if the shortcut caused any bugs

---

## DEBT PRIORITIZATION RULES

- `Impact: high` + unresolved > 2 sprints → escalate to CEO
- Any debt involving security, auth, or financial calculations → immediate CEO awareness
- Never accumulate more than 10 unresolved high-impact debts before a forced resolution sprint

---

## [No entries yet — populated as shortcuts are taken during development]
