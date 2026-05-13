# Git Hooks Reliability Gate

This project tracks Git hooks in `.githooks/` to keep runtime safety checks consistent across all machines (local + VPS).

## What the pre-commit hook enforces
- Blocks accidental commits from local runtime/drift directories: `data/`, `repos/`, `scripts/`.
- Blocks unresolved merge conflict markers.
- Runs `git diff --check --cached`.
- Runs `node --check server.js`.
- Runs optional runtime enforcer audit if module exists.

## What the pre-push hook enforces
- For changed run files in `docs/exploration/runs/*.md`, blocks push if `- Best path:` is missing.
- Blocks push if `- Best path:` is still unresolved (for example: `(to be filled)`, `TBD`, `N/A`, or empty).

## Enable tracked hooks
Run:

`bash tools/setup-hooks.sh`

This sets:

`git config core.hooksPath .githooks`
