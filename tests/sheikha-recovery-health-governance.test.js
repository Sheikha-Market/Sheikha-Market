'use strict';

const { buildCorrectiveGovernanceReport, buildHealthFinding, buildHealingPrescription } = require('../core/enterprise/recovery-health-governance/sheikha-recovery-health-governance');
const { writeMasterLog, _readEvents } = require('../runtime/master-log/sheikha-master-log-store');
const { appendRegistryTrace, _readTraces } = require('../lib/runtime-registry/runtime-registry-writer');
const fs = require('fs');
const path = require('path');

const cleanupPath = (p) => {
  try {
    if (fs.existsSync(p)) fs.unlinkSync(p);
  } catch (err) {
    // ignore
  }
};

describe('Sheikha Recovery Health Governance', () => {
  const eventsFile = path.join(process.cwd(), 'runtime', 'master-log', 'events.json');
  const tracesFile = path.join(process.cwd(), 'runtime', 'runtime-registry', 'traces.json');

  beforeEach(() => {
    cleanupPath(eventsFile);
    cleanupPath(tracesFile);
  });

  afterAll(() => {
    cleanupPath(eventsFile);
    cleanupPath(tracesFile);
  });

  test('buildHealthFinding returns low severity by default', () => {
    const finding = buildHealthFinding({});
    expect(finding.severity).toBe('LOW');
    expect(finding.safeToAutoRepair).toBe(true);
  });

  test('buildHealingPrescription includes WRITE_MASTER_LOG and UPDATE_REGISTRY_TRACE actions', () => {
    const finding = buildHealthFinding({});
    const presc = buildHealingPrescription(finding);
    const actions = presc.actions.map((action) => action.action);
    expect(actions).toContain('WRITE_MASTER_LOG');
    expect(actions).toContain('UPDATE_REGISTRY_TRACE');
    expect(presc.restrictions.noDirectProductionMutation).toBe(true);
  });

  test('buildCorrectiveGovernanceReport returns planned integrations when execute not set', () => {
    const report = buildCorrectiveGovernanceReport({ finding: { id: 'test-finding' } });
    expect(report.integrations.executed).toBe(false);
    expect(report.integrations.planned).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ action: 'WRITE_MASTER_LOG' }),
        expect.objectContaining({ action: 'UPDATE_REGISTRY_TRACE' })
      ])
    );
  });

  test('buildCorrectiveGovernanceReport writes to master log and registry when execute=true', () => {
    const report = buildCorrectiveGovernanceReport({
      finding: { id: 'test-finding', title: 'Test issue' },
      options: { execute: true }
    });
    expect(report.integrations.executed).toBe(true);
    expect(report.integrations.masterLogWrite).toHaveProperty('success', true);
    expect(report.integrations.registryTrace).toHaveProperty('success', true);
    expect(_readEvents().length).toBe(1);
    expect(_readTraces().length).toBe(1);
  });
});
