#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execSync } = require('node:child_process');

function run(command) {
  return execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
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
  const gate = /"gate"\s*:\s*"([^"]+)"/.exec(text)?.[1] || 'UNKNOWN';
  const scoreRaw = /"score"\s*:\s*(\d+)/.exec(text)?.[1] || '0';
  const score = Number(scoreRaw);
  return { gate, score };
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

function buildSignaturePayload(pack) {
  return JSON.stringify({
    packId: pack.packId,
    serial: pack.serial,
    generatedAt: pack.generatedAt,
    scope: pack.scope,
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

  const localBodies = [
    { region: 'Saudi Arabia', authority: 'NCA (ECC, CCC, ECC-1:2024 updates as applicable)', focus: 'National cybersecurity controls and compliance' },
    { region: 'Saudi Arabia', authority: 'SDAIA / PDPL regulator alignment (where personal data scope applies)', focus: 'Data protection governance and privacy controls' },
    { region: 'Saudi Arabia', authority: 'CST (where telecom/cloud/service-provider scope applies)', focus: 'Communications and digital service regulatory requirements' },
    { region: 'Saudi Arabia', authority: 'SAMA Cyber Security Framework (where financial scope applies)', focus: 'Financial-sector cyber governance controls' },
    { region: 'Saudi Arabia', authority: 'SASO conformity support (where product conformity scope applies)', focus: 'Quality and conformity support' },
    { region: 'GCC', authority: 'GSO standards harmonization alignment', focus: 'Regional standards alignment' }
  ];

  const internationalBodies = [
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

  const standardsMatrix = {
    cybersecurity: ['NCA-ECC', 'NIST-CSF-2.0', 'NIST-SP-800-53', 'ISO-27001', 'ISO-27017', 'ISO-27018', 'CIS-Controls-v8'],
    privacy: ['PDPL', 'ISO-27701'],
    serviceAndResilience: ['ISO-20000-1', 'ISO-22301', 'SOC2-Type-II'],
    sectorConditional: ['SAMA-CSF', 'PCI-DSS', 'SWIFT-CSP-where-applicable'],
    cloudAndHpc: ['CSA-STAR', 'HPC-benchmark-independent-validation']
  };

  const scientificMethodologies = [
    'Reproducible benchmark protocol with fixed environment manifests',
    'Independent third-party test witnessing and signed result packs',
    'Statistical repeatability with confidence intervals and outlier policy',
    'Security verification workflow (threat modeling, control tests, evidence chain)',
    'Operational resilience testing (failover, recovery, continuity drills)',
    'Configuration and change control with immutable audit trail'
  ];

  const requiredEvidence = [
    'Internal PASS_100 readiness gate output',
    'Full operational ultimate pipeline logs',
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
      readinessGate: gateInfo
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
    '',
    '## Internal Validation',
    `- Readiness Gate: ${gateInfo.gate}`,
    `- Readiness Score: ${gateInfo.score}`,
    '- Internal Status: passed',
    '',
    '## Local Accreditation Targets',
    ...localBodies.map((x) => `- ${x.region} | ${x.authority} | ${x.focus}`),
    '',
    '## International Accreditation Targets',
    ...internationalBodies.map((x) => `- ${x.authority} | ${x.focus}`),
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
    registry: 'reports/SHEIKHA-EXTERNAL-ACCREDITATION-REGISTRY.json'
  }, null, 2)}\n`);
}

try {
  main();
} catch (error) {
  console.error(String(error.message || error));
  process.exit(1);
}
