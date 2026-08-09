'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const {
  CAPTURE_ROUTE,
  canonicalArraySha256,
  inspectReadOnlyCapturePolicy,
  isGovernedPreconditionDriftCaptureRequest,
  isGovernedPublishedEvidenceVerificationRequest,
  isGovernedReadOnlyEvidenceCaptureRequest,
  runGovernedPreconditionDriftCapture,
  runGovernedPublishedEvidenceVerification,
  runGovernedReadOnlyEvidenceCapture
} = require('../src/chat/sheikhaReadOnlyEvidenceCapture');

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function buildRequest(diagnosisPath = '$HOME/Backups/sheikha/diagnosis') {
  return [
    '(',
    'set -Eeuo pipefail',
    `DIAG="${diagnosisPath}"`,
    'MAIN="$HOME/Projects/sheikha/sheikha-main-portal"',
    'printf \'%s\\n\' "VERIFY_EXISTING_I1_R1_DIGESTS"',
    '( cd "$DIAG"; sha256sum -c diagnosis-files.sha256 )',
    'python3 - "$DIAG" <<\'PY\'',
    'print("records")',
    'PY',
    'printf \'%s\\n\' "CURRENT_MAIN_HEAD"',
    'git -C "$MAIN" rev-parse HEAD',
    'printf \'%s\\n\' "CURRENT_MAIN_STATUS"',
    'git -C "$MAIN" status --porcelain=v1 --untracked-files=all',
    'printf \'%s\\n\' "CURRENT_UNSTAGED_NAME_STATUS"',
    'git -C "$MAIN" diff --name-status',
    'printf \'%s\\n\' "CURRENT_STAGED_NAME_STATUS"',
    'git -C "$MAIN" diff --cached --name-status',
    'printf \'%s\\n\' "CURRENT_MANIFEST_SHA256"',
    'sha256sum "$MAIN/package.json" "$MAIN/package-lock.json"',
    'printf \'%s\\n\' "READ_ONLY_I2_INPUT_CAPTURE_COMPLETE=true"',
    ')'
  ].join('\n');
}

function buildPreconditionDriftRequest(statusSha256) {
  return [
    '(',
    'set -Eeuo pipefail',
    'MAIN="$HOME/Projects/sheikha/sheikha-main-portal"',
    'DIAG="$HOME/Backups/sheikha/diagnosis"',
    '[[ -f "$DIAG/current-main-worktree-state.json" ]]',
    'VERIFY_I1_R1_PREDECESSOR_DIGESTS',
    '( cd "$DIAG"; sha256sum -c diagnosis-files.sha256 )',
    'current_status = []',
    'current_untracked = []',
    'status_added = []',
    'inspector_claims_match = (',
    '  len(current_status) == 6',
    '  and len(current_untracked) == 5',
    `  and current_status_sha == "${statusSha256}"`,
    ')',
    'only_four_untracked_additions = (',
    '  len(status_added) == 4',
    '  and len(current_tracked) == 1',
    ')',
    'READ_ONLY_PRECONDITION_DRIFT_CAPTURE_COMPLETE=true',
    'I2_OR_I2_R1_EXECUTION_ALLOWED_NOW=false',
    'D6_AUTHORIZATION_ALLOWED_NOW=false',
    ')'
  ].join('\n');
}

async function createFixture() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'sheikha-read-only-'));
  const homeDir = path.join(root, 'home');
  const evidenceRoot = path.join(homeDir, 'Backups', 'sheikha', 'diagnosis');
  const workspaceRoot = path.join(
    homeDir,
    'Projects',
    'sheikha',
    'sheikha-main-portal'
  );
  await fs.mkdir(evidenceRoot, { recursive: true });
  await fs.mkdir(workspaceRoot, { recursive: true });

  const packageJson = '{"name":"fixture"}\n';
  const packageLock = '{"lockfileVersion":3}\n';
  await fs.writeFile(path.join(workspaceRoot, 'package.json'), packageJson);
  await fs.writeFile(path.join(workspaceRoot, 'package-lock.json'), packageLock);

  const records = {
    'diagnosis-result.json': {
      success: true,
      decision: 'TRACKED_STATE_DRIFT_REQUIRES_REPAIR_DESIGN',
      nextStage: 'READ_ONLY_REPAIR_DESIGN'
    },
    'diagnosis-terminal-record.json': {
      success: true,
      terminal: true,
      rerunAllowed: false,
      nextStage: 'READ_ONLY_REPAIR_DESIGN'
    },
    'current-main-worktree-state.json': {
      headCommit: 'abc123',
      treeAtHead: 'tree123',
      statusPorcelain: ['M package.json', '?? local-note.txt'],
      trackedDiffPaths: ['package.json']
    },
    'tracked-drift-analysis.json': {
      trackedStateDrift: true,
      manifestTrackedDrift: true
    },
    'main-head-manifest-comparison.json': {
      currentPackageJsonSha256: sha256(packageJson),
      currentPackageLockSha256: sha256(packageLock),
      packageJsonMatchesOwnHead: false
    }
  };
  const digestLines = [];
  for (const [filename, record] of Object.entries(records)) {
    const content = `${JSON.stringify(record, null, 2)}\n`;
    await fs.writeFile(path.join(evidenceRoot, filename), content);
    digestLines.push(`${sha256(content)}  ${filename}`);
  }
  await fs.writeFile(
    path.join(evidenceRoot, 'diagnosis-files.sha256'),
    `${digestLines.join('\n')}\n`
  );

  return {
    root,
    homeDir,
    evidenceRoot,
    workspaceRoot,
    packageJson,
    packageLock
  };
}

describe('Sheikha governed read-only evidence capture', () => {
  let fixture;

  beforeEach(async () => {
    fixture = await createFixture();
  });

  afterEach(async () => {
    await fs.rm(fixture.root, { recursive: true, force: true });
  });

  test('verifies fixed evidence and Git reads without invoking a shell', async () => {
    const request = buildRequest();
    const gitRunner = jest.fn(async (_repository, args) => {
      const command = args.join(' ');
      if (command === 'rev-parse HEAD') return 'abc123\n';
      if (command === 'status --porcelain=v1 --untracked-files=all') {
        return ' M package.json\n?? local-note.txt\n?? another.txt\n';
      }
      if (command === 'diff --name-status') {
        return 'M\tpackage.json\nM\tsrc/index.js\n';
      }
      if (command === 'diff --cached --name-status') return '';
      throw new Error(`Unexpected Git read: ${command}`);
    });

    expect(isGovernedReadOnlyEvidenceCaptureRequest(request)).toBe(true);
    expect(inspectReadOnlyCapturePolicy(request)).toEqual([]);

    const result = await runGovernedReadOnlyEvidenceCapture(request, {
      homeDir: fixture.homeDir,
      workspaceRoot: fixture.workspaceRoot,
      gitRunner
    });

    expect(result).toMatchObject({ success: true, route: CAPTURE_ROUTE });
    expect(result.capture).toMatchObject({
      digestCount: 5,
      validDigestCount: 5,
      currentHead: 'abc123',
      currentStatusCount: 3,
      unstagedCount: 2,
      stagedCount: 0,
      packageJsonMatchesRecorded: true,
      packageLockMatchesRecorded: true,
      boundaries: {
        shellUsed: false,
        networkUsed: false,
        filesWritten: false,
        gitMutationExecuted: false,
        arbitraryFilesystemAccess: false
      }
    });
    expect(gitRunner).toHaveBeenCalledTimes(4);
    expect(result.answer).toContain('تم تنفيذ الالتقاط عبر محوّل Node محكوم');
    expect(result.answer).toContain('لم يُمرر نص المستخدم إلى bash أو shell');
  });

  test('rejects privilege escalation even when all protocol markers exist', async () => {
    const request = `${buildRequest()}\nsudo true`;

    expect(inspectReadOnlyCapturePolicy(request))
      .toContain('PRIVILEGE_ESCALATION');
    await expect(runGovernedReadOnlyEvidenceCapture(request, {
      homeDir: fixture.homeDir,
      workspaceRoot: fixture.workspaceRoot
    })).rejects.toThrow('SHEIKHA_READ_ONLY_CAPTURE_POLICY_DENIED');
  });

  test('rejects evidence outside the governed backup root', async () => {
    const outside = path.join(fixture.homeDir, 'outside-diagnosis');
    await fs.cp(fixture.evidenceRoot, outside, { recursive: true });
    const request = buildRequest('$HOME/outside-diagnosis');

    await expect(runGovernedReadOnlyEvidenceCapture(request, {
      homeDir: fixture.homeDir,
      workspaceRoot: fixture.workspaceRoot
    })).rejects.toThrow('SHEIKHA_READ_ONLY_CAPTURE_EVIDENCE_ROOT_DENIED');
  });

  test('captures semantic precondition drift without executing Python', async () => {
    const currentStatus = [
      ' M package.json',
      '?? local-note.txt',
      '?? adapter.js',
      '?? adapter.test.js',
      '?? preflight.js',
      '?? preflight.test.js'
    ];
    const request = buildPreconditionDriftRequest(
      canonicalArraySha256(currentStatus)
    );
    const gitRunner = jest.fn(async (_repository, args, options = {}) => {
      const command = args.join(' ');
      if (command === 'rev-parse HEAD') return 'abc123';
      if (command === 'show -s --format=%T HEAD') return 'tree123';
      if (command === 'status --porcelain=v1 --untracked-files=all') {
        return currentStatus.join('\n');
      }
      if (command === 'diff --name-only --') return 'package.json';
      if (command === 'ls-files --others --exclude-standard') {
        return [
          'local-note.txt',
          'adapter.js',
          'adapter.test.js',
          'preflight.js',
          'preflight.test.js'
        ].join('\n');
      }
      if (command === 'diff --cached --name-only --') return '';
      if (command === 'show HEAD:package.json' && options.binary) {
        return Buffer.from(fixture.packageJson);
      }
      if (command === 'show HEAD:package-lock.json' && options.binary) {
        return Buffer.from(fixture.packageLock);
      }
      throw new Error(`Unexpected Git read: ${command}`);
    });

    expect(isGovernedPreconditionDriftCaptureRequest(request)).toBe(true);
    const result = await runGovernedPreconditionDriftCapture(request, {
      homeDir: fixture.homeDir,
      workspaceRoot: fixture.workspaceRoot,
      gitRunner
    });

    expect(result.success).toBe(true);
    expect(result.route)
      .toBe('SHEIKHA_GOVERNED_PRECONDITION_DRIFT_CAPTURE_V1');
    expect(result.capture).toMatchObject({
      currentStatusCount: 6,
      currentTrackedCount: 1,
      currentUntrackedCount: 5,
      currentStagedCount: 0,
      inspectorClaimsMatchLiveState: true,
      onlyExpectedSemanticUntrackedAdditions: true,
      predecessorStatusNormalizationApplied: true,
      trackedPathsMatchI1R1: true,
      decision:
        'FOUR_NEW_UNTRACKED_PATHS_CONFIRMED_AFTER_PREDECESSOR_NORMALIZATION_REQUIRES_READ_ONLY_CLASSIFICATION_BEFORE_I2_R2'
    });
    expect(result.capture.rawStatusAddedLines).toHaveLength(5);
    expect(result.capture.rawStatusRemovedLines).toHaveLength(1);
    expect(result.capture.semanticStatusAddedPaths).toHaveLength(4);
    expect(result.capture.truthBoundaries).toMatchObject({
      worktreeModified: false,
      filesStaged: false,
      shellUsed: false,
      pythonExecuted: false
    });
    expect(result.answer).toContain('الإضافات الدلالية الفعلية: 4');
    expect(result.answer).toContain('لم يُمرر نص المستخدم إلى Python');
  });

  test('verifies a published terminal evidence directory without shell execution', async () => {
    const published = path.join(
      fixture.homeDir,
      'Backups',
      'sheikha',
      'published-i2-r2'
    );
    await fs.mkdir(published, { recursive: true });
    const resultRecord = {
      success: true,
      correctionApplied: true,
      porcelainLeadingSpaceSerializationDefectCorrected: true,
      statusEntryCount: 212,
      trackedDiffPathCount: 85,
      untrackedPathCount: 127,
      stagedPathCount: 0,
      newProtectedUntrackedFileCount: 4,
      d6AuthorizationAllowedNow: false,
      decision: 'READ_ONLY_DEPENDENCY_REMEDIATION_DESIGN_REQUIRED',
      nextStage: 'READ_ONLY_I3'
    };
    const terminalRecord = {
      success: true,
      terminal: true,
      rerunAllowed: false,
      correctionApplied: true,
      decision: resultRecord.decision,
      nextStage: resultRecord.nextStage
    };
    const files = {
      'design-result.json': `${JSON.stringify(resultRecord, null, 2)}\n`,
      'design-terminal-record.json': `${JSON.stringify(terminalRecord, null, 2)}\n`
    };
    const digests = [];
    for (const [filename, content] of Object.entries(files)) {
      await fs.writeFile(path.join(published, filename), content);
      digests.push(`${sha256(content)}  ${filename}`);
    }
    await fs.writeFile(
      path.join(published, 'design-files.sha256'),
      `${digests.join('\n')}\n`
    );
    const request = [
      '(',
      'DIR="$HOME/Backups/sheikha/published-i2-r2"',
      'find "$DIR" -maxdepth 1 -type f -printf \'%f\\n\' | wc -l',
      '( cd "$DIR"; sha256sum -c design-files.sha256 )',
      'python3 -m json.tool "$DIR/design-result.json"',
      'python3 -m json.tool "$DIR/design-terminal-record.json"',
      'READ_ONLY_PUBLISHED_I2_R2_VERIFICATION_COMPLETE=true',
      'I2_R2_RERUN_ALLOWED_NOW=false',
      'D6_AUTHORIZATION_ALLOWED_NOW=false',
      ')'
    ].join('\n');

    expect(isGovernedPublishedEvidenceVerificationRequest(request)).toBe(true);
    const result = await runGovernedPublishedEvidenceVerification(request, {
      homeDir: fixture.homeDir
    });

    expect(result).toMatchObject({
      success: true,
      route: 'SHEIKHA_GOVERNED_PUBLISHED_EVIDENCE_VERIFICATION_V1',
      verification: {
        fileCount: 3,
        digestCount: 2,
        validDigestCount: 2,
        result: resultRecord,
        terminal: terminalRecord,
        boundaries: {
          shellUsed: false,
          pythonExecuted: false,
          filesWritten: false,
          networkUsed: false
        }
      }
    });
    expect(result.answer).toContain('Status/Tracked/Untracked/Staged: 212/85/127/0');
    expect(result.answer).toContain('المرحلة التالية: READ_ONLY_I3');
  });
});
