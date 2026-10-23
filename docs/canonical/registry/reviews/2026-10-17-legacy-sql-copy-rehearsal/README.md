# Legacy SQLite Copy Rehearsal

Scope: observed legacy database catalogs, private snapshot and review import only.
Status: `COPY_REHEARSAL_PASSED_PRODUCTION_HOLD`.

Tool: `tools/verification/sheikha-legacy-sql-rehearsal-v1.py`.
Tests: `tests/test_sheikha_legacy_sql_rehearsal_v1.py` (26 targeted cases).
Target schema: `tools/verification/schemas/sheikha-legacy-review-r2.sql`.

The schema is the unchanged R2 review specimen delivered in the local R3 bundle,
SHA-256 `967528d6d227e5a74879aaaba6514feff4119c78f4c3b02c67242fc315f88934`.
It is not the production master schema and is never applied to the live master.

The first capture inventoried 95 tables (including sqlite_sequence) and 604 rows.
Import stopped on integer timestamps. The corrected adapter resumed from that
snapshot, without another live SQLite capture, preserving the original integer
values. The private report retains both attempts.

Three catalogs are mapped: entity bylaws, legal article claims and asset claims.
All eleven observed source rows retain their original cells in catalog_claims.
Three bylaw rows additionally become entities/documents/observation versions/
provisions/review notes. Observation IDs are not official document identities.
No original registration, compliance or quality assertion becomes an approval.
Other source tables remain in the full snapshot, not in the normalized target.

Safety boundaries:

- Bubblewrap mounts sources read-only and separates the network namespace.
- SQLite Backup uses a read transaction, with normal locks, not immutable mode.
- Live WAL databases and existing sidecars require a different reviewed capture.
- Outputs are new private directories, never an existing database or deployment.
- Source hashes, schema drift, missing cells and symlinks fail closed.
- Backup comparison and an injected failure exercise the new adapter.
- No live writer, Evidence V2, engine, contract or Hostinger resource is changed.

Run isolated synthetic tests:

```bash
python3 -I -B tests/test_sheikha_legacy_sql_rehearsal_v1.py
```

Do not rerun a capture to claim production readiness. A future run must specify
the observed input SHA-256 and a new direct child of reports/private. The optional
`--snapshot-input` accepts a pinned private SOURCE_SNAPSHOT.sqlite3 only, allowing
copy-only continuation. Exit 0 means this bounded rehearsal passed, never a
deployment or legal approval. Live cutover needs a separate authorization and
review of the actual writer, consumers, history, backups and remaining tables.

Private delivery: reports/private/sheikha-legacy-sql-copy-rehearsal-20261017-r4-mapped.
Initial capture: reports/private/sheikha-legacy-sql-copy-rehearsal-20261017-r4.

References: [SQLite Backup](https://www.sqlite.org/backup.html),
[SQLite Transactions](https://www.sqlite.org/lang_transaction.html).
