# /forge:graph — Graph Operations

Run graph queries and operations on the KitAI Forge context graph.

## Available operations

### gaps <target-node-id>
Find all missing upstream nodes required to produce the target.
Example: `/forge:graph gaps code:auth-login`

### impact <node-id>
Show all nodes affected by a change to the given node.
Example: `/forge:graph impact architecture:auth`

### validate
Check graph integrity — dangling edges, cycles, quality gate status.
Example: `/forge:graph validate`

### context <node-id>
Assemble and display the full context package for producing a node.
Example: `/forge:graph context story:auth-login`

## Implementation
Load the graph from `_forge/graph/`, run the requested operation using
the graph engine algorithms, and display results clearly.
