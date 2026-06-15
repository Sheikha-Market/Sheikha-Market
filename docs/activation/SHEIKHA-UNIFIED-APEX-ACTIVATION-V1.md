# SHEIKHA Unified Apex Activation V1

This activation bundle verifies and activates the highest integrated Sheikha stack in
a deterministic order. It does not grant divine authority, automate religious rulings,
or claim external infrastructure that has not been connected and verified.

## Scripts

Read-only verification:

```bash
./tools/verify-sheikha-unified-apex-v1.sh --require-clean
```

Generate governed reports and run the complete verification suite:

```bash
./tools/activate-sheikha-unified-apex-v1.sh
```

Run every activation engine while requiring the repository to remain byte-for-byte clean:

```bash
./tools/activate-sheikha-unified-apex-v1.sh --require-clean
```

Clean activation snapshots only the generated report files declared in the manifest. It runs
the engines and tests against the generated reports, restores the pre-activation report bytes,
and requires a final `NO_DRIFT`. Any unrelated change causes the command to fail.

The activation now includes `SHEIKHA_STORAGE_GOVERNANCE_V1`. It inventories configured
high-growth paths, classifies disk pressure, and produces a human-review remediation plan.
It never deletes or moves files.

Activate and reload the local PM2 service:

```bash
./tools/activate-sheikha-unified-apex-v1.sh --restart-pm2
```

Guarded release after reviewing all files:

```bash
./tools/release-sheikha-unified-apex-v1.sh \
  --branch feature/hub-v1 \
  --message "Activate Sheikha unified apex activation v1" \
  --push
```

The release script stages only paths listed in the activation manifest and aborts when
unrelated unstaged changes remain. It never uses `git add .`, force push, reset, or
automatic branch switching.

## Reference numbering

The manifest links stable Quran locators and edition-aware Sunnah collection locators
to the governance reference registry. These references express ethical governance
principles. Religious interpretation and grading remain subject to qualified human
scholarly review.

## External boundaries

`--strict-external` intentionally fails while PostgreSQL production, Redis distributed
queues, Kubernetes, multi-region consensus, or external archive storage remain
unconfigured. Normal activation reports these as readiness gaps rather than falsely
marking them active.
