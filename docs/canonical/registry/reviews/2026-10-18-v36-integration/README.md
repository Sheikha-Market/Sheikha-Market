# V36 Integration Evidence Review

The V36.3-V36.9 legacy engines write catalog rows, manifests and Evidence V2
digests. Their constant `ACTIVE`, `CONNECTED` and `COMPLETE` labels are claims,
not proof of remote authentication, installations, physical actuation or release
readiness. The review tool parses these engines; it never imports or runs them.

## Local Audit

Run from the repository root:

```bash
python3 -B tools/verification/sheikha-v36-integration-audit-v1.py \
  --mcp-config .mcp.json \
  --mcp-config "$HOME/.copilot/mcp-config.json" \
  --require-closure
```

This reads the selected manifests, their source files, Evidence V2, database
bytes and the named MCP configuration files. It does not open the live database
through SQLite, launch MCP servers, call tools, install packages, access credential
stores, modify Git, change services, deploy or repin Evidence V2.

`--output-dir` accepts a new direct child of `reports/private`; it refuses to
overwrite earlier evidence. The root must already be private (mode 0700).
Without this flag the command writes only JSON to stdout.

Exit codes:

- `0`: inspected file bindings are consistent; runtime readiness is still unknown.
- `2`: missing, changed, unsafe or mismatched inputs. V36.9 is the explicitly
  expected current database binding; a newer version is reported, not adopted.
- `3`: file bindings pass but `--require-closure` cannot establish runtime closure.

This is an audit command, not an authorization service or production gate wired
into CI. All automation consumers must check both the exit code and report scope.
MCP registration does not grant execution approval. A local stdio proxy may still
connect to a remote service when launched; the audit never launches it.

## Integration Boundaries

Keep the existing VS Code extension as the editor adapter, the existing Native
application as the desktop client, and MCP adapters as scoped service connections.
These components have separate lifecycles and acceptance evidence. A shared
catalog is useful for discovery, but must not silently install or authorize a
newly discovered system. Existing one-shot Native checks are not repeated by
this audit.

Before approving a specific integration, record its owner, exact endpoint and
version, permitted tools, authentication result, bounded functional probe,
rollback procedure and authorization expiry. Physical devices also need
simulation and an independently reviewed safety procedure.

The supplied images are visual references, not observations of installed
infrastructure. No interface redesign or publication is included in this review.

## Tests

```bash
python3 -B -m unittest discover -s tests -p test_sheikha_v36_integration_audit_v1.py -v
```

Fixtures cover binding mismatch, later database versions, no engine execution,
secret redaction, symlinks, duplicate JSON keys, missing inputs, SQLite sidecars,
changes during observation and private non-overwriting reports.
