# Sheikha MVP Bridge Contracts

## PYTHON bridge

The current MVP implements one external bridge only: `PYTHON`.

### DSL form

```text
PYTHON "path/to/script.py" "path/to/contract.json"
```

### Input contract

- `input`: JSON object passed to the Python script.
- `permissions`: non-empty string array. Current allowlist:
  - `score`
  - `analyze`
  - `summarize`
- `trace_id`: optional string for tracing.
- The contract is stored in a `.json` file referenced by the DSL command.

### Output contract

The Python process must print a single JSON object to stdout:

```json
{
  "ok": true,
  "status": "scored",
  "trace_id": "bridge-mvp-001",
  "output": {}
}
```

### Sandbox rules

- Only `.py` files are allowed.
- The script path must stay under the repository roots allowed by the sandbox policy.
- In strict profiles, only allowlisted permissions are accepted.
- Execution uses argument passing, not shell interpolation.
