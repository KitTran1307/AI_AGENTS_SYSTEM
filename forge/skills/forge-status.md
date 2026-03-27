# /forge:status — Project Status

Show the current state of the KitAI Forge context graph and sprint.

Actions:
1. Load `_forge/graph/` — count nodes by type and status
2. List in-progress nodes with their current status
3. List blocked nodes (nodes with failed quality gates)
4. Show next recommended actions based on the graph state

Format output as a clean status report:

```
## Graph Status
- brief: 1 done
- prd: 1 done
- architecture: 1 done, 1 in-progress
- story: 3 done, 2 in-progress, 1 pending

## In Progress
- architecture:payments (Winston — started 2026-03-27)
- story:auth-register (Nova — 2/5 tasks complete)

## Next Actions
1. Continue story:auth-register (`/forge:dev`)
2. Complete architecture:payments (`/forge:architect`)
```
