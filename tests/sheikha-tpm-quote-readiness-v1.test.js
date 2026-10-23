'use strict';

const {
  REQUIRED_TOOLS,
  evaluateTpmQuoteReadiness
} = require('../core/governance/sheikha-tpm-quote-readiness-v1');
const {
  TRUSTED_COMMAND_DIRECTORIES,
  commandPath
} = require('../tools/activation/inspect-sheikha-tpm-quote-readiness-v1');

const allTools = Object.fromEntries(REQUIRED_TOOLS.map((tool) => [tool, `/usr/bin/${tool}`]));

describe('Sheikha TPM quote readiness preflight V1', () => {
  test('resolves tools only from fixed trusted system directories', () => {
    expect(TRUSTED_COMMAND_DIRECTORIES).toContain('/usr/bin');
    expect(commandPath('sh')).toMatch(/^\/(?:usr\/)?bin\/sh$/u);
    expect(commandPath('../../tmp/untrusted')).toBeNull();
  });

  test('reports production readiness only when every evidence prerequisite is present', () => {
    const report = evaluateTpmQuoteReadiness({
      tpm2SysfsPresent: true, tpmResourceManagerPresent: true,
      eventLogPresent: true, eventLogReadable: true, secureBootEnabled: true,
      akEnrollmentRecordConfigured: true, tools: allTools
    });
    expect(report.status).toBe('READY_FOR_SEPARATELY_AUTHORIZED_QUOTE_COLLECTION');
    expect(report.readiness.readyForProductionAttestation).toBe(true);
    expect(report.blockers).toEqual([]);
    expect(report.executionBoundary.quoteCollected).toBe(false);
  });

  test('distinguishes inaccessible evidence and missing tooling', () => {
    const report = evaluateTpmQuoteReadiness({
      tpm2SysfsPresent: true, tpmResourceManagerPresent: false,
      eventLogPresent: true, eventLogReadable: false, secureBootEnabled: false,
      akEnrollmentRecordConfigured: false, tools: {}
    });
    expect(report.status).toBe('LOCAL_TPM_PREPARATION_REQUIRED');
    expect(report.blockers).toEqual(expect.arrayContaining([
      'tpmResourceManagerPresent', 'eventLogReadable', 'allRequiredToolsPresent',
      'secureBootEnabled', 'akEnrollmentRecordConfigured'
    ]));
    expect(report.nextActions.find((entry) => entry.blocker === 'eventLogReadable').action)
      .toBe('GRANT_NARROW_READ_ACCESS_OR_EXPORT_WITH_PRIVILEGED_HELPER');
  });

  test('does not claim TPM commands or mutation in any preflight result', () => {
    const report = evaluateTpmQuoteReadiness({tools: {}});
    expect(report.status).toBe('TPM_NOT_EXPOSED_TO_CURRENT_OS');
    expect(Object.values(report.executionBoundary).every((value) => value === false)).toBe(true);
  });
});
