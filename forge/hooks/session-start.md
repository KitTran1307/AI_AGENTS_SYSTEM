# Hook: session-start

Fires when a Claude Code session begins in a project with KitAI Forge initialized.

## Actions

1. **Detect Forge project**: Check if `_forge/config/forge.yaml` exists. If not, skip.

2. **Load graph**: Scan `_forge/graph/` for all node files. Read only YAML frontmatter (not full content).

3. **Report in-progress work**:
   - Find nodes with `status: in-progress`
   - Report: "Resuming: {node-id} ({producer}, started {created})"

4. **Suggest next actions**:
   - If any stories are `ready` and have no `in-progress` work: suggest starting them
   - If any quality gates are `fail`: surface them immediately
   - If graph is empty: suggest running `/forge` to bootstrap

5. **Check for regressions**:
   - Count total regression nodes
   - If any are `status: open`: surface them

## Output format
```
KitAI Forge — Session Started
Graph: 12 nodes (4 done, 2 in-progress, 6 pending)

In Progress:
  * story:auth-login — Nova, 3/5 tasks complete
  * architecture:payments — Winston

Next: Continue story:auth-login (/forge:dev)
```
