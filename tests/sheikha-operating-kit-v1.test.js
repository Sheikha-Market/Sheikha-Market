'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { buildOperatingKit } = require('../core/partnerships/operating-kit-v1');
const { runMethodologyPipeline } = require('../core/scientific-methodology/scientific-methodology-engine');
const { sha256 } = require('../core/partnerships/shared-goals-v1');
const { run } = require('../tools/partnerships/build-operating-kit-v1');
const { buildManifest } = require('../scripts/partnerships-sign-packages');
const { verifyEntry } = require('../scripts/partnerships-verify-signatures');

function fixture() {
  const rel = { id: 'partner-a', tenantId: 'tenant-a', type: 'partner', displayName: 'SYNTHETIC A', vision: 'Measured benefit', ownerId: 'owner', stage: 'DRAFT',
    goals: [{ id: 'benefit', description: 'Improve quality', ownerId: 'owner', startsAt: '2026-09-01T00:00:00.000Z', dueAt: '2026-12-01T00:00:00.000Z' }],
    kpis: [{ id: 'quality', goalId: 'benefit', label: 'Quality', category: 'quality', unit: '%', method: 'ratio_percent', direction: 'increase', baseline: null, target: 90, weight: 1, critical: true, minSampleSize: 5, maxAgeDays: 30, ownerId: 'owner', reviewerId: 'reviewer', sourceId: 'source' }]
  };
  const protocol = { question: 'Does review reduce errors?', hypothesis: 'Fewer errors with review', scope: 'Synthetic exercise only', measurement: 'Errors per ten drafts', validation: 'Independent repeated review', limitations: 'Not evidence of real benefit', ownerId: 'owner', revision: '1.0', definitions: ['Error: failed acceptance criterion'], assumptions: ['Equal task difficulty'], procedure: ['Measure before', 'Review', 'Measure after'], references: ['Internal synthetic exercise'] };
  const asset = { id: 'asset-a', tenantId: rel.tenantId, sha256: sha256('synthetic asset'), origin: 'OWNED_ASSERTED', permittedRights: ['use', 'teach'], rightsEvidenceReference: 'SYNTHETIC-NOT-A-DEED', rightsValidUntil: '2027-01-01T00:00:00.000Z' };
  const signing = { id: 'sign-a', relationshipId: rel.id, tenantId: rel.tenantId, documentText: 'SYNTHETIC unsigned agreement', documentSha256: sha256('SYNTHETIC unsigned agreement'), templateSha256: sha256('SYNTHETIC template'), amountMinor: 250000, currency: 'SAR', partyIds: ['sheikha-demo', 'partner-demo'] };
  signing.delegation = { writtenAuthorityReference: 'SYNTHETIC-NOT-A-MANDATE', principalId: 'sheikha-demo', agentId: 'agent-demo', tenantId: rel.tenantId, relationshipId: rel.id, templateSha256: signing.templateSha256, approvedDocumentSha256: signing.documentSha256, maximumAmountMinor: signing.amountMinor, currency: signing.currency, partyIds: [...signing.partyIds], notBefore: '2026-09-01T00:00:00.000Z', expiresAt: '2026-10-01T00:00:00.000Z', revoked: false };
  return { schemaVersion: '1.0.0', portfolio: { schemaVersion: '1.0.0', dataMode: 'SYNTHETIC', relationships: [rel] }, asOf: '2026-09-13T00:00:00.000Z',
    methodologies: [{ id: 'method-a', title: 'Quality exercise', kind: 'CURRICULUM', domain: 'quality', audience: 'Operators', prerequisites: 'Basic arithmetic', ownerId: 'owner', reviewerId: 'reviewer', reviewBy: '2026-10-01T00:00:00.000Z', protocol, outcomes: [{ id: 'measure', description: 'Compute error rate', exercise: 'Two failures in ten drafts', acceptance: '20 percent, synthetic only' }] }],
    assets: [asset], signingRequests: [signing],
    licenseRequests: [{ id: 'license-a', relationshipId: rel.id, tenantId: rel.tenantId, assetId: asset.id, assetSha256: asset.sha256, requestedRights: ['use'], territory: 'Internal synthetic lab', purpose: 'Test only', validFrom: '2026-09-01T00:00:00.000Z', validUntil: '2026-12-01T00:00:00.000Z' }]
  };
}

describe('operating education kit', () => {
  test('is deterministic and never grants rights or signs', () => {
    const f = fixture(), before = JSON.stringify(f), kit = buildOperatingKit(f);
    expect(buildOperatingKit(f)).toEqual(kit);
    expect(JSON.stringify(f)).toBe(before);
    expect(kit.boundaries).toMatchObject({ agreementsSigned: 0, licensesIssued: 0, externalMessagesSent: 0, statutoryLawsChanged: false });
    const { packSha256, ...body } = kit;
    expect(packSha256).toBe(sha256(JSON.stringify(body)));
  });
  test('builds seven uncommitted dates per relationship', () => {
    const calendar = buildOperatingKit(fixture()).partnerCalendars[0];
    expect(calendar.milestones.map(step => step.dayFromPlanStart)).toEqual([0, 3, 7, 14, 30, 60, 90]);
    expect(calendar.milestones[6].proposedAt).toBe('2026-12-12T00:00:00.000Z');
    expect(calendar.milestones.every(step => !step.automaticExecutionAllowed)).toBe(true);
  });
  test.each(['CLOSED', 'SUSPENDED'])('does not schedule %s relationships', stage => {
    const f = fixture(); f.portfolio.relationships[0].stage = stage;
    const kit = buildOperatingKit(f);
    expect(kit.partnerCalendars[0].milestones).toHaveLength(0);
    expect(kit.signingReviews[0].blockers).toContain('RELATIONSHIP_NOT_ELIGIBLE');
    expect(kit.licenseReviews[0].blockers).toContain('RELATIONSHIP_NOT_ELIGIBLE');
  });
  test('long prose and reference keywords cannot certify science', () => {
    const result = runMethodologyPipeline({ text: 'Quran Sunnah '.repeat(400) });
    expect(result.record).toMatchObject({ completenessScore: 0, evidenceScore: null, referencesVerified: false, religiousRulingIssued: false });
  });
  test('a full protocol means field coverage only', () => {
    const unit = buildOperatingKit(fixture()).methodologyUnits[0];
    expect(unit.protocolReview).toMatchObject({ completenessScore: 100, evidenceScore: null, scientificValidityVerified: false, measurementStatus: 'NOT_EXECUTED' });
    expect(unit.lessons[0]).toMatchObject({ completed: false, result: null, assessmentCriterion: '20 percent, synthetic only' });
    expect(unit).toMatchObject({ publishingAllowed: false, completionCertificateIssued: false, externalAccreditationClaimed: false });
  });
  test.each(['references', 'definitions', 'assumptions', 'procedure'])('invalid %s lists count as missing', field => {
    const f = fixture(); f.methodologies[0].protocol[field] = [null];
    expect(buildOperatingKit(f).methodologyUnits[0].protocolReview.missingFields).toContain(field);
  });
  test('due methodology revisions do not renew automatically', () => {
    const f = fixture(); f.methodologies[0].reviewBy = f.asOf;
    expect(buildOperatingKit(f).methodologyUnits[0].renewalState).toBe('REVIEW_DUE_NO_AUTOMATIC_RENEWAL');
  });
  test.each(['reviewer', 'assessment', 'date', 'duplicate', 'too-many'])('rejects malformed unit: %s', change => {
    const f = fixture();
    if (change === 'reviewer') f.methodologies[0].reviewerId = 'owner';
    if (change === 'assessment') f.methodologies[0].outcomes[0].acceptance = '';
    if (change === 'date') f.asOf = '2026-02-30T00:00:00.000Z';
    if (change === 'duplicate') f.methodologies.push(f.methodologies[0]);
    if (change === 'too-many') f.methodologies = Array(101).fill(f.methodologies[0]);
    expect(() => buildOperatingKit(f)).toThrow();
  });
});

describe('rights and mandate structure checks, never authority', () => {
  test('even complete structures stay unsigned and unlicensed', () => {
    const kit = buildOperatingKit(fixture());
    expect(kit.signingReviews[0]).toMatchObject({ blockers: [], signerIdentityVerified: false, delegationAuthenticated: false, signAllowed: false, providerCallPerformed: false });
    expect(kit.licenseReviews[0]).toMatchObject({ blockers: [], licenseIssued: false, permissionGranted: false, assetOwnershipVerified: false });
    expect(JSON.stringify(kit)).not.toContain('SYNTHETIC unsigned agreement');
    expect(JSON.stringify(kit)).not.toContain('SYNTHETIC-NOT-A-MANDATE');
  });
  test.each([
    ['document', 'DOCUMENT_DIGEST_MISMATCH'], ['mandate', 'WRITTEN_DELEGATION_MISSING'],
    ['tenant', 'DELEGATION_SCOPE_MISMATCH'], ['template', 'DELEGATION_DOCUMENT_OR_TEMPLATE_MISMATCH'],
    ['amount', 'FINANCIAL_AUTHORITY_EXCEEDED'], ['currency', 'FINANCIAL_AUTHORITY_EXCEEDED'],
    ['parties', 'DELEGATION_PARTIES_MISMATCH'], ['expiry', 'DELEGATION_TIME_INVALID'],
    ['future', 'DELEGATION_TIME_INVALID'], ['revoked', 'DELEGATION_REVOCATION_NOT_CLEAR']
  ])('holds signing for %s', (change, reason) => {
    const f = fixture(), request = f.signingRequests[0], d = request.delegation;
    if (change === 'document') request.documentText += ' changed';
    if (change === 'mandate') delete request.delegation;
    if (change === 'tenant') d.tenantId = 'another-tenant';
    if (change === 'template') d.templateSha256 = '0'.repeat(64);
    if (change === 'amount') request.amountMinor++;
    if (change === 'currency') request.currency = 'USD';
    if (change === 'parties') d.partyIds = ['sheikha-demo', 'other'];
    if (change === 'expiry') d.expiresAt = f.asOf;
    if (change === 'future') d.notBefore = '2026-09-14T00:00:00.000Z';
    if (change === 'revoked') d.revoked = true;
    expect(buildOperatingKit(f).signingReviews[0].blockers).toContain(reason);
  });
  test.each([-1, 1.5, '2500', Number.MAX_SAFE_INTEGER + 1])('rejects invalid monetary minor units: %s', amount => {
    const f = fixture(); f.signingRequests[0].amountMinor = amount;
    expect(() => buildOperatingKit(f)).toThrow('INTEGER_AMOUNT_AND_CURRENCY_REQUIRED');
  });
  test.each(['signingRequests', 'licenseRequests'])('refuses cross-tenant %s', field => {
    const f = fixture(); f[field][0].tenantId = 'other';
    expect(() => buildOperatingKit(f)).toThrow('RELATIONSHIP_SCOPE_DENIED');
  });
  test.each([
    ['origin', 'OWNERSHIP_OR_LICENSE_UNKNOWN'], ['rights', 'REQUEST_EXCEEDS_DECLARED_RIGHTS'],
    ['asset', 'ASSET_NOT_IN_TENANT_REGISTRY'], ['hash', 'ASSET_DIGEST_MISMATCH'],
    ['expiry', 'UPSTREAM_RIGHTS_EXPIRED_OR_SHORTER'], ['reference', 'RIGHTS_EVIDENCE_REFERENCE_MISSING']
  ])('holds license for %s', (change, reason) => {
    const f = fixture(), a = f.assets[0];
    if (change === 'origin') a.origin = 'UNKNOWN';
    if (change === 'rights') f.licenseRequests[0].requestedRights = ['sublicense'];
    if (change === 'asset') a.tenantId = 'other';
    if (change === 'hash') a.sha256 = '0'.repeat(64);
    if (change === 'expiry') a.rightsValidUntil = f.asOf;
    if (change === 'reference') delete a.rightsEvidenceReference;
    expect(buildOperatingKit(f).licenseReviews[0].blockers).toContain(reason);
  });
});

describe('integrity seals are not agreement signatures', () => {
  let dir;
  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-integrity-test-'));
    fs.writeFileSync(path.join(dir, 'spa-test.json'), JSON.stringify({ metadata: { contractId: 'SYNTHETIC' } }));
  });
  afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));
  const make = (directory, key) => buildManifest(['spa-test.json'], { contractsDir: directory, signingKey: key, signer: 'SYNTHETIC', createdAt: '2026-09-13T00:00:00.000Z' });
  test.each(['', 'ephemeral-test-key'])('checks integrity without claiming consent (%s)', key => {
    const manifest = make(dir, key);
    expect(manifest.metadata).toMatchObject({ electronicAgreementSigned: false, signerIdentityVerified: false, legalEffectVerified: false });
    expect(verifyEntry(manifest.entries[0], manifest.metadata, key, dir)).toMatchObject({ ok: true, electronicAgreementSigned: false });
  });
  test('never downgrades an HMAC entry to unkeyed SHA when key is missing', () => {
    const manifest = make(dir, 'ephemeral-test-key'), e = manifest.entries[0];
    e.digitalSeal = sha256(`${e.contractId}|${e.fileName}|${e.fileSha256}|${manifest.metadata.signedAt}|${manifest.metadata.signer}`);
    expect(verifyEntry(e, manifest.metadata, '', dir).reason).toBe('hmac-key-required');
  });
  test('rejects wrong key, unsupported algorithm and escaped scope', () => {
    const m = make(dir, 'ephemeral-test-key'), e = m.entries[0];
    expect(verifyEntry(e, m.metadata, 'wrong', dir).ok).toBe(false);
    expect(verifyEntry({ ...e, sealType: 'none' }, m.metadata, '', dir).reason).toBe('unsupported-seal-type');
    expect(verifyEntry({ ...e, relativePath: '../secret' }, m.metadata, 'ephemeral-test-key', dir).reason).toBe('scope-mismatch');
  });
  test('rejects tampering and symlinks', () => {
    const m = make(dir, '');
    fs.writeFileSync(path.join(dir, 'spa-test.json'), '{}');
    expect(verifyEntry(m.entries[0], m.metadata, '', dir).reason).toBe('hash-mismatch');
    fs.renameSync(path.join(dir, 'spa-test.json'), path.join(dir, 'original.json'));
    fs.symlinkSync(path.join(dir, 'original.json'), path.join(dir, 'spa-test.json'));
    expect(verifyEntry(m.entries[0], m.metadata, '', dir).reason).toBe('symlink-denied');
    expect(() => make(dir, '')).toThrow('CONTRACT_SYMLINK_DENIED');
  });
});

describe('private operating-kit CLI', () => {
  let dir;
  beforeEach(() => {
    dir = fs.mkdtempSync(path.resolve(__dirname, '../reports/private/operating-kit-test-'));
    fs.chmodSync(dir, 0o700);
  });
  afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));
  function write(directory, f) {
    const file = path.join(directory, 'input.json');
    fs.writeFileSync(file, JSON.stringify(f), { mode: 0o600 });
    return file;
  }
  test('writes private recipient-isolated schedules and refuses overwrites', () => {
    const f = fixture();
    f.portfolio.relationships.push({ ...f.portfolio.relationships[0], id: 'partner-b', tenantId: 'tenant-b', displayName: '<script>other-secret</script>' });
    const input = write(dir, f), output = path.join(dir, 'result');
    expect(run(['--input', input, '--out', output])).toMatchObject({ complete: true, calendars: 2, agreementsSigned: 0 });
    expect(fs.statSync(output).mode & 0o777).toBe(0o700);
    for (const name of fs.readdirSync(output)) expect(fs.statSync(path.join(output, name)).mode & 0o777).toBe(0o600);
    expect(fs.readFileSync(path.join(output, 'partner-partner-a.json'), 'utf8')).not.toContain('other-secret');
    expect(fs.readFileSync(path.join(output, 'schedules-and-curricula.ar.md'), 'utf8')).not.toContain('<script>');
    expect(() => run(['--input', input, '--out', output])).toThrow('OUTPUT_ALREADY_EXISTS');
  });
  test('rejects public paths, permissive files and input symlinks', () => {
    const input = write(dir, fixture()), output = path.join(dir, 'result');
    expect(() => run(['--input', input, '--out', '/tmp/public-kit'])).toThrow('PRIVATE_REPORTS_PATH_REQUIRED');
    fs.chmodSync(input, 0o644);
    expect(() => run(['--input', input, '--out', output])).toThrow('PRIVATE_FILE_MODE_AND_OWNER_REQUIRED');
    const link = path.join(dir, 'link.json'); fs.symlinkSync(input, link);
    expect(() => run(['--input', link, '--out', output])).toThrow('SYMLINK_PATH_DENIED');
    expect(fs.existsSync(output)).toBe(false);
  });
});
