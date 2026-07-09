'use strict';

const {
  buildAccreditationSources,
  buildSignaturePayload,
  parseGateOutput,
  parseLastJsonObject
} = require('../scripts/sheikha-prepare-external-accreditation');

describe('Sheikha external accreditation pack', () => {
  test('uses master methodology accreditation readiness when available', () => {
    const sources = buildAccreditationSources(process.cwd());

    expect(sources.sourceArtifact).toBe('runtime/master-activation/sheikha-master-methodology-accreditation-readiness-v1.json');
    expect(sources.methodologyReadiness.readinessScore).toBe(100);
    expect(sources.methodologyReadiness.externalCertificatesIssued).toBe(0);
    expect(sources.localTargets).toHaveLength(8);
    expect(sources.internationalTargets).toHaveLength(23);
    expect(sources.scientificMethodologies.length).toBeGreaterThanOrEqual(7);
    expect(sources.standardsMatrix.methodologyFamilies).toEqual(expect.arrayContaining([
      'SCIENTIFIC',
      'ORGANIZATIONAL',
      'ADMINISTRATIVE',
      'TECHNICAL',
      'ENGINEERING',
      'MATHEMATICAL_ACCOUNTING',
      'COMPUTATIONAL'
    ]));
  });

  test('includes methodology readiness and submission controls in signed payload', () => {
    const payload = buildSignaturePayload({
      packId: 'SHEIKHA-EXT-ACC-TEST',
      serial: '000000',
      generatedAt: '2026-07-10T00:00:00.000Z',
      scope: { readinessGate: { gate: 'PASS_100', score: 100 } },
      methodologyReadiness: { readinessScore: 100, externalCertificatesIssued: 0 },
      submissionControlMatrix: {
        externalCertificatesIssuedByThisPack: 0,
        externalAuthorityApprovalRequired: true
      },
      localAccreditationTargets: [],
      internationalAccreditationTargets: [],
      standardsMatrix: {},
      scientificMethodologies: [],
      requiredEvidence: []
    });

    expect(payload).toContain('"methodologyReadiness"');
    expect(payload).toContain('"submissionControlMatrix"');
    expect(payload).toContain('"externalCertificatesIssuedByThisPack":0');
  });

  test('parses the final gate JSON from noisy operational output', () => {
    const output = [
      'boot log on stderr',
      'another status line',
      JSON.stringify({
        gate: 'PASS_100',
        score: 100,
        result: {
          integrationVerification: { status: 'fully-integrated' }
        }
      }, null, 2)
    ].join('\n');

    expect(parseLastJsonObject(output).gate).toBe('PASS_100');
    expect(parseGateOutput(output)).toEqual({ gate: 'PASS_100', score: 100 });
  });
});
