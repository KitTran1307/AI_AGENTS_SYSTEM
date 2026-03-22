# Security Policy

## Scope

This framework consists of markdown files and a shell/Node.js installer. Security concerns in scope include:

- **install.sh integrity**: The curl installer downloads and executes a shell script. Supply chain tampering with the script or the files it downloads is a critical concern.
- **npm package integrity**: The published npm package should match the source in this repository. Unexpected additions to the npm tarball are in scope.
- **AGENTS.md security rules**: The security rules in AGENTS.md §9 are part of the framework's value. Incomplete, incorrect, or misleading security guidance is in scope.

## Reporting a vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Open a [GitHub Security Advisory](https://github.com/[OWNER]/kitai-ai-agents-system-framework/security/advisories/new) for private disclosure.

Please include:
1. Description of the vulnerability
2. Steps to reproduce or proof of concept
3. Potential impact
4. Suggested fix (optional)

We will respond within 5 business days and coordinate a fix and disclosure timeline with you.

## Out of scope

- Security vulnerabilities in the codebases of users who installed this framework
- Agent behavior that violates security rules despite AGENTS.md §9 being correctly attached (agent compliance issues, not framework issues)
