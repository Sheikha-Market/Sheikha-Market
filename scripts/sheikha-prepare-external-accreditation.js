#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');

function run(command) {
  const outputPath = path.join(os.tmpdir(), `sheikha-accreditation-command-${process.pid}-${Date.now()}.log`);
  const script = [
    `${command} > "${outputPath}" 2>&1`,
    'status=$?',
    `cat "${outputPath}"`,
    `rm -f "${outputPath}"`,
    'exit $status'
  ].join('\n');
  const result = spawnSync('bash', ['-lc', script], {
    cwd: process.cwd(),
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });
  const output = `${result.stdout || ''}${result.stderr || ''}`;
  if (result.status !== 0) {
    const error = new Error(`Command failed: ${command}`);
    error.stdout = result.stdout || '';
    error.stderr = result.stderr || '';
    error.output = output;
    error.status = typeof result.status === 'number' ? result.status : 1;
    throw error;
  }
  return output;
}

function safeRun(command) {
  try {
    return { ok: true, output: run(command) };
  } catch (error) {
    return {
      ok: false,
      output: (error.stdout || '') + (error.stderr || ''),
      status: typeof error.status === 'number' ? error.status : 1
    };
  }
}

function parseGateOutput(text) {
  const parsed = parseLastJsonObject(text);
  const gate = parsed?.gate || /"gate"\s*:\s*"([^"]+)"/.exec(text)?.[1] || 'UNKNOWN';
  const scoreRaw = parsed?.score ?? /"score"\s*:\s*(\d+)/.exec(text)?.[1] ?? '0';
  const score = Number(scoreRaw);
  return { gate, score };
}

function parseLastJsonObject(text) {
  const source = String(text || '').trim();
  for (let index = source.lastIndexOf('{'); index >= 0; index = source.lastIndexOf('{', index - 1)) {
    try {
      return JSON.parse(source.slice(index));
    } catch {
      // Keep scanning backward until the root JSON object is found.
    }
  }
  return null;
}

function readPemIfExists(pemPath) {
  if (!pemPath) {
    return null;
  }
  if (!fs.existsSync(pemPath)) {
    return null;
  }
  return fs.readFileSync(pemPath, 'utf8');
}

function readJsonIfExists(jsonPath) {
  if (!fs.existsSync(jsonPath)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  } catch {
    return null;
  }
}

function loadMethodologyReadiness(repoRoot) {
  const relativePath = path.join(
    'runtime',
    'master-activation',
    'sheikha-master-methodology-accreditation-readiness-v1.json'
  );
  const readiness = readJsonIfExists(path.join(repoRoot, relativePath));
  if (!readiness || readiness.system !== 'SHEIKHA_MASTER_METHODOLOGY_ACCREDITATION_READINESS_V1') {
    return null;
  }
  return {
    sourceArtifact: relativePath,
    readiness
  };
}

function normalizeLocalAccreditationTarget(target) {
  return {
    region: target.jurisdiction || target.region || 'Scope-defined',
    authority: target.target || target.authority || 'External authority assessment',
    focus: target.scopeCondition || target.focus || target.domain || 'Readiness evidence review',
    status: target.status || 'READY_FOR_SUBMISSION_NOT_ISSUED'
  };
}

function normalizeInternationalAccreditationTarget(target) {
  return {
    authority: target.target || target.authority || 'External accredited body',
    focus: target.domain || target.focus || 'Readiness evidence review',
    status: target.status || 'READY_FOR_AUDITOR_SUBMISSION_NOT_ISSUED'
  };
}

function buildAccreditationSources(repoRoot) {
  const methodologyReadiness = loadMethodologyReadiness(repoRoot);

  const fallbackLocalTargets = [
    { region: 'Saudi Arabia', authority: 'NCA (ECC, CCC, ECC-1:2024 updates as applicable)', focus: 'National cybersecurity controls and compliance' },
    { region: 'Saudi Arabia', authority: 'SDAIA / PDPL regulator alignment (where personal data scope applies)', focus: 'Data protection governance and privacy controls' },
    { region: 'Saudi Arabia', authority: 'CST (where telecom/cloud/service-provider scope applies)', focus: 'Communications and digital service regulatory requirements' },
    { region: 'Saudi Arabia', authority: 'SAMA Cyber Security Framework (where financial scope applies)', focus: 'Financial-sector cyber governance controls' },
    { region: 'Saudi Arabia', authority: 'SASO conformity support (where product conformity scope applies)', focus: 'Quality and conformity support' },
    { region: 'GCC', authority: 'GSO standards harmonization alignment', focus: 'Regional standards alignment' }
  ];

  const fallbackInternationalTargets = [
    { authority: 'ISO/IEC 27001 accredited certification body', focus: 'Information Security Management System (ISMS)' },
    { authority: 'ISO/IEC 27017 accredited certification body', focus: 'Cloud security controls' },
    { authority: 'ISO/IEC 27018 accredited certification body', focus: 'PII protection in public cloud' },
    { authority: 'ISO/IEC 27701 accredited certification body', focus: 'Privacy Information Management System (PIMS)' },
    { authority: 'ISO 22301 accredited certification body', focus: 'Business continuity management' },
    { authority: 'ISO/IEC 20000-1 accredited certification body', focus: 'IT service management' },
    { authority: 'ISO 9001 accredited certification body', focus: 'Quality management system' },
    { authority: 'SOC 2 Type II audit firm', focus: 'Security/Availability/Confidentiality controls attestation' },
    { authority: 'PCI DSS QSA (if cardholder data scope exists)', focus: 'Payment card security compliance' },
    { authority: 'CSA STAR assessor', focus: 'Cloud security transparency and assurance' },
    { authority: 'Common Criteria lab / scheme (if product certification scope exists)', focus: 'Security assurance evaluation (CC EAL)' },
    { authority: 'TOP500/Green500 governance (if HPC ranking claims are required)', focus: 'Independent supercomputing benchmark disclosure' }
  ];

  if (!methodologyReadiness) {
    return {
      sourceArtifact: null,
      methodologyReadiness: null,
      localTargets: fallbackLocalTargets,
      internationalTargets: fallbackInternationalTargets,
      scientificMethodologies: [
        'Reproducible benchmark protocol with fixed environment manifests',
        'Independent third-party test witnessing and signed result packs',
        'Statistical repeatability with confidence intervals and outlier policy',
        'Security verification workflow (threat modeling, control tests, evidence chain)',
        'Operational resilience testing (failover, recovery, continuity drills)',
        'Configuration and change control with immutable audit trail'
      ],
      standardsMatrix: {
        cybersecurity: ['NCA-ECC', 'NIST-CSF-2.0', 'NIST-SP-800-53', 'ISO-27001', 'ISO-27017', 'ISO-27018', 'CIS-Controls-v8'],
        privacy: ['PDPL', 'ISO-27701'],
        serviceAndResilience: ['ISO-20000-1', 'ISO-22301', 'SOC2-Type-II'],
        sectorConditional: ['SAMA-CSF', 'PCI-DSS', 'SWIFT-CSP-where-applicable'],
        cloudAndHpc: ['CSA-STAR', 'HPC-benchmark-independent-validation']
      }
    };
  }

  const readiness = methodologyReadiness.readiness;
  const methodologyFamilies = Array.isArray(readiness.methodologyFamilies) ? readiness.methodologyFamilies : [];
  const localTargets = Array.isArray(readiness.localAccreditationReadinessTargets)
    ? readiness.localAccreditationReadinessTargets.map(normalizeLocalAccreditationTarget)
    : fallbackLocalTargets;
  const internationalTargets = Array.isArray(readiness.internationalAccreditationReadinessTargets)
    ? readiness.internationalAccreditationReadinessTargets.map(normalizeInternationalAccreditationTarget)
    : fallbackInternationalTargets;

  return {
    sourceArtifact: methodologyReadiness.sourceArtifact,
    methodologyReadiness: {
      readinessScore: readiness.readinessScore,
      decision: readiness.decision,
      externalCertificatesIssued: readiness.externalCertificatesIssued,
      internalAttestations: Array.isArray(readiness.internalIssuedAttestations)
        ? readiness.internalIssuedAttestations.map((item) => ({ id: item.id, status: item.status, legalExternalAuthority: item.legalExternalAuthority }))
        : [],
      methodologyFamilies: methodologyFamilies.map((family) => ({
        familyKey: family.familyKey,
        arabicName: family.arabicName,
        englishName: family.englishName,
        status: family.status,
        maturity: family.maturity
      }))
    },
    localTargets,
    internationalTargets,
    scientificMethodologies: methodologyFamilies.length > 0
      ? methodologyFamilies.map((family) => `${family.englishName} / ${family.arabicName}: ${family.responsibility}`)
      : [
        'Reproducible benchmark protocol with fixed environment manifests',
        'Independent third-party test witnessing and signed result packs',
        'Statistical repeatability with confidence intervals and outlier policy',
        'Security verification workflow (threat modeling, control tests, evidence chain)',
        'Operational resilience testing (failover, recovery, continuity drills)',
        'Configuration and change control with immutable audit trail'
      ],
    standardsMatrix: {
      cybersecurity: ['NCA-ECC', 'NIST-CSF-2.0', 'NIST-SP-800-53', 'ISO-27001', 'ISO-27017', 'ISO-27018', 'CIS-Controls-v8'],
      privacy: ['PDPL', 'ISO-27701'],
      serviceAndResilience: ['ISO-20000-1', 'ISO-22301', 'SOC2-Type-II'],
      sectorConditional: ['SAMA-CSF', 'PCI-DSS', 'SWIFT-CSP-where-applicable'],
      cloudAndHpc: ['CSA-STAR', 'HPC-benchmark-independent-validation'],
      methodologyFamilies: methodologyFamilies.map((family) => family.familyKey),
      localReadinessTargets: localTargets.map((target) => target.authority),
      internationalReadinessTargets: internationalTargets.map((target) => target.authority)
    }
  };
}

function buildSignaturePayload(pack) {
  return JSON.stringify({
    packId: pack.packId,
    serial: pack.serial,
    generatedAt: pack.generatedAt,
    scope: pack.scope,
    methodologyReadiness: pack.methodologyReadiness,
    submissionControlMatrix: pack.submissionControlMatrix,
    localAccreditationTargets: pack.localAccreditationTargets,
    internationalAccreditationTargets: pack.internationalAccreditationTargets,
    standardsMatrix: pack.standardsMatrix,
    scientificMethodologies: pack.scientificMethodologies,
    requiredEvidence: pack.requiredEvidence
  });
}

function withSha256Prefix(hexDigest) {
  return `sha256:${hexDigest}`;
}

function main() {
  const repoRoot = process.cwd();
  const reportsDir = path.join(repoRoot, 'reports');
  fs.mkdirSync(reportsDir, { recursive: true });

  const registryPath = path.join(reportsDir, 'SHEIKHA-EXTERNAL-ACCREDITATION-REGISTRY.json');
  const latestJsonPath = path.join(reportsDir, 'SHEIKHA-EXTERNAL-ACCREDITATION-LATEST.json');
  const latestMdPath = path.join(reportsDir, 'SHEIKHA-EXTERNAL-ACCREDITATION-LATEST.md');

  const gateRun = safeRun('npm run -s sheikha:operational:gate:100');
  if (!gateRun.ok) {
    throw new Error('Unable to prepare external accreditation pack: 100% gate command failed.');
  }
  const gateInfo = parseGateOutput(gateRun.output);
  if (gateInfo.gate !== 'PASS_100' || gateInfo.score !== 100) {
    throw new Error('Unable to prepare external accreditation pack: readiness gate is not 100%.');
  }

  const now = new Date();
  const issuedAt = now.toISOString();
  const dateTag = issuedAt.replace(/[:.]/g, '-');

  let registry = { version: 1, generatedAt: issuedAt, totalIssued: 0, entries: [] };
  if (fs.existsSync(registryPath)) {
    try {
      registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
    } catch {
      registry = { version: 1, generatedAt: issuedAt, totalIssued: 0, entries: [] };
    }
  }

  const currentSerial = Number(registry.totalIssued || 0) + 1;
  const serial = String(currentSerial).padStart(6, '0');

  const packSeed = `${issuedAt}|external-accreditation-pack`;
  const packHash = crypto.createHash('sha256').update(packSeed).digest('hex').slice(0, 16).toUpperCase();
  const packId = `SHEIKHA-EXT-ACC-${packHash}`;

  const accreditationSources = buildAccreditationSources(repoRoot);
  const localBodies = accreditationSources.localTargets;
  const internationalBodies = accreditationSources.internationalTargets;
  const standardsMatrix = accreditationSources.standardsMatrix;
  const scientificMethodologies = accreditationSources.scientificMethodologies;

  const requiredEvidence = [
    'Internal PASS_100 readiness gate output',
    'Full operational ultimate pipeline logs',
    'Master methodology accreditation readiness artifact',
    'Architecture and control mapping matrix',
    'Risk register and treatment plan',
    'Incident response and business continuity test reports',
    'Independent benchmark lab report for external performance claims'
  ];

  const pack = {
    packId,
    serial,
    digitalRecord: {
      formatVersion: '1.1',
      recordClass: 'external-accreditation-pack',
      generatedBy: 'Sheikha Codex Accreditation Engine'
    },
    generatedAt: issuedAt,
    status: 'ready-for-external-submission',
    scope: {
      system: 'Sheikha Unified From-Scratch Stack + Transcendent Kernel',
      governance: ['Quran', 'Sunnah'],
      readinessGate: gateInfo,
      masterMethodologyReadinessArtifact: accreditationSources.sourceArtifact
    },
    methodologyReadiness: accreditationSources.methodologyReadiness,
    submissionControlMatrix: {
      internalAttestationsAllowed: true,
      externalCertificatesIssuedByThisPack: 0,
      externalAuthorityApprovalRequired: true,
      sourceArtifact: accreditationSources.sourceArtifact,
      noFalseClaims: true
    },
    localAccreditationTargets: localBodies,
    internationalAccreditationTargets: internationalBodies,
    scientificMethodologies,
    standardsMatrix,
    requiredEvidence,
    internalValidation: {
      gate100Command: 'npm run -s sheikha:operational:gate:100',
      finalPipelineCommand: 'npm run -s sheikha:operational:ultimate',
      internalStatus: 'passed'
    },
    externalIssuanceConstraints: {
      note: 'No internal script can issue legal/regulatory certificates on behalf of external authorities.',
      nextStep: 'Submit this pack and evidence to each authority/auditor for formal assessment and certification.'
    }
  };

  const signaturePayload = buildSignaturePayload(pack);
  const signature = crypto.createHash('sha256').update(signaturePayload).digest('hex');
  pack.digitalRecord.signature = withSha256Prefix(signature);
  pack.digitalRecord.signatureAlgorithm = 'sha256';

  const defaultPrivateKeyPath = path.join(repoRoot, 'security', 'keys', 'sheikha-accreditation-signing-private.pem');
  const defaultPublicKeyPath = path.join(repoRoot, 'security', 'keys', 'sheikha-accreditation-signing-public.pem');
  const privateKeyPath = process.env.SHEIKHA_ACCREDITATION_PRIVATE_KEY_PATH || defaultPrivateKeyPath;
  const publicKeyPath = process.env.SHEIKHA_ACCREDITATION_PUBLIC_KEY_PATH || defaultPublicKeyPath;
  const privateKeyPem = readPemIfExists(privateKeyPath);
  const publicKeyPem = readPemIfExists(publicKeyPath);

  pack.digitalRecord.attestation = {
    mode: 'hash-only',
    verificationCommand: 'npm run -s sheikha:accreditation:external:verify:latest'
  };

  if (privateKeyPem && publicKeyPem) {
    const detachedSignature = crypto.sign('sha256', Buffer.from(signaturePayload, 'utf8'), privateKeyPem).toString('base64');
    const publicKeyFingerprint = crypto.createHash('sha256').update(publicKeyPem).digest('hex');
    pack.digitalRecord.attestation = {
      mode: 'asymmetric',
      algorithm: 'RSA-SHA256',
      signature: detachedSignature,
      publicKeyFingerprint: withSha256Prefix(publicKeyFingerprint),
      keyHint: {
        publicKeyPath: path.relative(repoRoot, publicKeyPath)
      },
      verificationCommand: 'npm run -s sheikha:accreditation:external:verify:latest'
    };
  }

  const jsonPath = path.join(reportsDir, `SHEIKHA-EXTERNAL-ACCREDITATION-PACK-${dateTag}.json`);
  fs.writeFileSync(jsonPath, `${JSON.stringify(pack, null, 2)}\n`, 'utf8');

  const mdLines = [
    '# SHEIKHA External Accreditation Submission Pack',
    '',
    `Pack ID: ${packId}`,
    `Generated At: ${issuedAt}`,
    `Status: ${pack.status}`,
    `Methodology Readiness Source: ${accreditationSources.sourceArtifact || 'fallback-static-matrix'}`,
    `Methodology Readiness Score: ${accreditationSources.methodologyReadiness?.readinessScore ?? 'not-linked'}`,
    '',
    '## Internal Validation',
    `- Readiness Gate: ${gateInfo.gate}`,
    `- Readiness Score: ${gateInfo.score}`,
    '- Internal Status: passed',
    '',
    '## Local Accreditation Targets',
    ...localBodies.map((x) => `- ${x.region} | ${x.authority} | ${x.focus} | ${x.status || 'READY_FOR_SUBMISSION_NOT_ISSUED'}`),
    '',
    '## International Accreditation Targets',
    ...internationalBodies.map((x) => `- ${x.authority} | ${x.focus} | ${x.status || 'READY_FOR_AUDITOR_SUBMISSION_NOT_ISSUED'}`),
    '',
    '## Scientific Methodologies Activated',
    ...scientificMethodologies.map((x) => `- ${x}`),
    '',
    '## Standards and Framework Matrix',
    ...Object.entries(standardsMatrix).flatMap(([domain, standards]) => [
      `- ${domain}:`,
      ...standards.map((item) => `  - ${item}`)
    ]),
    '',
    '## Required Evidence Bundle',
    ...requiredEvidence.map((x) => `- ${x}`),
    '',
    '## External Issuance Constraint',
    '- Formal legal/regulatory certificates must be issued by independent accredited authorities.',
    '- This pack is prepared and ready for submission.',
    ''
  ];

  const mdPath = path.join(reportsDir, `SHEIKHA-EXTERNAL-ACCREDITATION-PACK-${dateTag}.md`);
  fs.writeFileSync(mdPath, mdLines.join('\n'), 'utf8');

  fs.copyFileSync(jsonPath, latestJsonPath);
  fs.copyFileSync(mdPath, latestMdPath);

  const entry = {
    serial,
    packId,
    generatedAt: issuedAt,
    status: pack.status,
    signature: pack.digitalRecord.signature,
    attestationMode: pack.digitalRecord.attestation.mode,
    packRecordDigest: withSha256Prefix(crypto.createHash('sha256').update(JSON.stringify(pack)).digest('hex')),
    jsonRecord: `reports/${path.basename(jsonPath)}`,
    markdownRecord: `reports/${path.basename(mdPath)}`,
    latestJson: 'reports/SHEIKHA-EXTERNAL-ACCREDITATION-LATEST.json',
    latestMarkdown: 'reports/SHEIKHA-EXTERNAL-ACCREDITATION-LATEST.md'
  };

  const previousEntries = Array.isArray(registry.entries) ? registry.entries : [];
  const previousTopDigest = previousEntries[0]?.registryChainDigest || null;
  entry.registryChainDigest = withSha256Prefix(
    crypto
      .createHash('sha256')
      .update(`${entry.packRecordDigest}|${previousTopDigest || 'GENESIS'}`)
      .digest('hex')
  );
  const entries = [entry, ...previousEntries].slice(0, 500);
  const nextRegistry = {
    version: 1,
    generatedAt: issuedAt,
    totalIssued: currentSerial,
    entries
  };
  fs.writeFileSync(registryPath, `${JSON.stringify(nextRegistry, null, 2)}\n`, 'utf8');

  process.stdout.write(`${JSON.stringify({
    status: 'prepared',
    packId,
    serial,
    signature: pack.digitalRecord.signature,
    jsonRecord: `reports/${path.basename(jsonPath)}`,
    markdownRecord: `reports/${path.basename(mdPath)}`,
    latestJson: 'reports/SHEIKHA-EXTERNAL-ACCREDITATION-LATEST.json',
    latestMarkdown: 'reports/SHEIKHA-EXTERNAL-ACCREDITATION-LATEST.md',
    registry: 'reports/SHEIKHA-EXTERNAL-ACCREDITATION-REGISTRY.json',
    methodologyReadinessSource: accreditationSources.sourceArtifact,
    localAccreditationTargets: localBodies.length,
    internationalAccreditationTargets: internationalBodies.length,
    externalCertificatesIssued: pack.submissionControlMatrix.externalCertificatesIssuedByThisPack
  }, null, 2)}\n`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(String(error.message || error));
    process.exit(1);
  }
}

module.exports = {
  buildAccreditationSources,
  buildSignaturePayload,
  loadMethodologyReadiness,
  normalizeInternationalAccreditationTarget,
  normalizeLocalAccreditationTarget,
  parseGateOutput,
  parseLastJsonObject
};
