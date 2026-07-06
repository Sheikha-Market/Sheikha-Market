# SHEIKHA Storage Governance V1

## Purpose

This layer governs filesystem pressure and archive decisions without deleting or moving data.

## Runtime flow

Filesystem inventory -> pressure classification -> governed remediation plan -> Master Log Center
-> Civilization Command review -> explicit human approval.

## Commands

```bash
npm run ops:storage-governance:v1
curl -s http://127.0.0.1:8080/api/sheikha/storage-governance/v1/status | jq
```

## Safety boundaries

- No automatic deletion or movement.
- Calculate and record checksums before transfer.
- Copy first, then verify recovery from the destination.
- Protected runtime and Git paths always require explicit review.
- External archive storage is not considered connected until separately verified.
- Quran and Sunnah identifiers are governance references; interpretation remains subject to
  qualified human scholarly review.
