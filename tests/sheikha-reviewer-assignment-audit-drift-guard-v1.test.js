'use strict';

const express = require('express');
const request = require('supertest');

const {
  buildAuditDriftGuardStatus,
  inspectAssignmentDrift,
  verifyAuditChain,
} = require(
  '../core/engine-registry/' +
  'sheikha-reviewer-assignment-audit-drift-guard-v1'
);
const routes = require(
  '../routes/site-registry/sheikha-engine-domain-routes-v3'
);

describe('Sheikha reviewer assignment audit drift guard V1', () => {
  test('matches current assignment registry to trusted genesis baseline', () => {
    const status = buildAuditDriftGuardStatus();

    expect(status.status).toBe('CLEAR');
    expect(status.summary.assignmentRecords).toBe(0);
    expect(status.summary.auditRecords).toBe(1);
    expect(status.summary.driftDetected).toBe(0);
    expect(status.summary.auditChainBreaks).toBe(0);
    expect(status.summary.auditEvidenceGaps).toBe(0);
    expect(status.checks.hashMatchesBaseline).toBe(true);
    expect(status.checks.recordCountMatchesBaseline).toBe(true);
    expect(status.repairPerformed).toBe(false);
    expect(status.rollbackPerformed).toBe(false);
    expect(status.assignmentMutationPerformed).toBe(false);
  });

  test('detects a broken synthetic audit hash chain', () => {
    const result = verifyAuditChain({
      records: [
        {
          auditId: 'one',
          postStateSha256: 'a'.repeat(64),
          postRecordCount: 0,
        },
        {
          auditId: 'two',
          preStateSha256: 'b'.repeat(64),
          postStateSha256: 'c'.repeat(64),
          preRecordCount: 0,
          postRecordCount: 1,
        },
      ],
    });

    expect(result.valid).toBe(false);
    expect(result.findings)
      .toEqual(expect.arrayContaining([
        expect.objectContaining({ type: 'HASH_CHAIN_BREAK' }),
      ]));
  });

  test('inspection is read-only and never repairs drift', () => {
    const status = inspectAssignmentDrift();

    expect(status.repairPerformed).toBe(false);
    expect(status.rollbackPerformed).toBe(false);
    expect(status.assignmentMutationPerformed).toBe(false);
  });

  test('serves status and read-only inspection endpoints', async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/site-registry/v3', routes);

    const status = await request(app)
      .get('/api/site-registry/v3/reviewer-assignment-audit-drift-guard');

    expect(status.status).toBe(200);
    expect(status.body.data.status).toBe('CLEAR');

    const inspection = await request(app)
      .post('/api/site-registry/v3/reviewer-assignment-audit-drift-guard/inspect')
      .send({});

    expect(inspection.status).toBe(200);
    expect(inspection.body.data.repairPerformed).toBe(false);
    expect(inspection.body.data.assignmentMutationPerformed).toBe(false);
  });
});
