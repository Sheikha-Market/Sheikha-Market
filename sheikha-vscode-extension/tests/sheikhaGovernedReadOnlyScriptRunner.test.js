'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const {
  READ_ONLY_SCRIPT_ROUTE,
  buildReadOnlyScriptAnswer,
  buildSandboxArguments,
  inspectShellEnvelope,
  isGovernedReadOnlyScriptRequest,
  parseReadOnlyScriptRequest,
  runGovernedReadOnlyScript
} = require('../src/chat/sheikhaGovernedReadOnlyScriptRunner');

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function buildRequest(expectedSha256, stem = 'SHEIKHA_READ_ONLY_TEST') {
  return [
    '(',
    'set -Eeuo pipefail',
    'DOWNLOAD_DIR="$(xdg-user-dir DOWNLOAD)"',
    `EXPECTED="${expectedSha256}"`,
    'SCRIPT=""',
    'while IFS= read -r -d \'\' CANDIDATE; do',
    '  [[ "$(sha256sum "$CANDIDATE" | awk \'{print $1}\')" == "$EXPECTED" ]] || continue',
    '  SCRIPT="$CANDIDATE"',
    '  break',
    'done < <(',
    '  find "$DOWNLOAD_DIR" -maxdepth 1 -type f \\',
    `    -iname '${stem}*.sh' \\`,
    '    -print0',
    ')',
    '[[ -n "$SCRIPT" ]] || exit 1',
    'bash "$SCRIPT"',
    ')'
  ].join('\n');
}

async function createFixture(script, scriptName = 'SHEIKHA_READ_ONLY_TEST.sh') {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'sheikha-read-only-script-'));
  const homeDir = path.join(root, 'home');
  const downloadDir = path.join(homeDir, 'Downloads');
  const workspaceRoot = path.join(
    homeDir,
    'Projects',
    'sheikha',
    'sheikha-main-portal'
  );
  const backupRoot = path.join(homeDir, 'Backups', 'sheikha');
  await fs.mkdir(downloadDir, { recursive: true });
  await fs.mkdir(workspaceRoot, { recursive: true });
  await fs.mkdir(backupRoot, { recursive: true });
  const scriptPath = path.join(downloadDir, scriptName);
  await fs.writeFile(scriptPath, script);
  return {
    root,
    homeDir,
    downloadDir,
    workspaceRoot,
    backupRoot,
    script,
    scriptPath,
    scriptSha256: sha256(script)
  };
}

describe('Sheikha governed read-only script sandbox', () => {
  let fixture;

  afterEach(async () => {
    if (fixture) await fs.rm(fixture.root, { recursive: true, force: true });
    fixture = null;
  });

  test('recognizes, verifies and executes a hash-bound script through the sandbox runner', async () => {
    const script = [
      '#!/usr/bin/env bash',
      'set -Eeuo pipefail',
      'python3 - <<\'PY\'',
      'import json',
      'print(json.dumps({"decision":"READ_ONLY_OK","headMatchesExpected":True}))',
      'PY',
      'printf \'%s\\n\' "READ_ONLY_CAPTURE_COMPLETE=true"'
    ].join('\n');
    fixture = await createFixture(script);
    const request = buildRequest(fixture.scriptSha256);
    const sandboxRunner = jest.fn(async (context) => ({
      exitCode: 0,
      signal: null,
      stdout: '{"decision":"READ_ONLY_OK","headMatchesExpected":true}\nREAD_ONLY_CAPTURE_COMPLETE=true\n',
      stderr: '',
      context
    }));

    expect(isGovernedReadOnlyScriptRequest(request)).toBe(true);
    const result = await runGovernedReadOnlyScript(request, {
      homeDir: fixture.homeDir,
      downloadDir: fixture.downloadDir,
      workspaceRoot: fixture.workspaceRoot,
      syntaxChecker: async () => ({ ok: true, error: null }),
      sandboxRunner
    });

    expect(result).toMatchObject({
      success: true,
      route: READ_ONLY_SCRIPT_ROUTE,
      status: 'READ_ONLY_SCRIPT_EXECUTED',
      executed: true,
      actualSha256: fixture.scriptSha256,
      parsedOutput: {
        decision: 'READ_ONLY_OK',
        headMatchesExpected: true
      },
      markers: { READ_ONLY_CAPTURE_COMPLETE: 'true' },
      boundaries: {
        rootReadOnly: true,
        workspaceReadOnly: true,
        homeHidden: true,
        networkUnshared: true,
        hostFilesWritten: false
      }
    });
    expect(sandboxRunner).toHaveBeenCalledTimes(1);
    expect(result.answer).toContain('READ_ONLY_SCRIPT_EXECUTED');
  });

  test('reports a missing hash-bound script without invoking a shell', async () => {
    fixture = await createFixture('#!/usr/bin/env bash\nprintf ok\\n\n');
    const sandboxRunner = jest.fn();
    const result = await runGovernedReadOnlyScript(
      buildRequest('a'.repeat(64)),
      {
        homeDir: fixture.homeDir,
        downloadDir: fixture.downloadDir,
        workspaceRoot: fixture.workspaceRoot,
        sandboxRunner
      }
    );

    expect(result).toMatchObject({
      success: true,
      status: 'SCRIPT_NOT_FOUND',
      executed: false,
      candidateCount: 1,
      matchedCount: 0
    });
    expect(sandboxRunner).not.toHaveBeenCalled();
    expect(result.answer).toContain('SCRIPT_NOT_FOUND');
  });

  test('accepts FILE and a multi-wildcard find pattern with an escaped underscore', async () => {
    const scriptName =
      'SHEIKHA_READ_ONLY_PR28_POST_I2_R2_PRE_I3_LIVE_STATE_REBINDING_DESIGN_V1_F12_D5_I2_R3.sh';
    const script = '#!/usr/bin/env bash\nprintf \'I2_R3_SUCCESS=true\\n\'\n';
    fixture = await createFixture(script, scriptName);
    const request = [
      'DOWNLOAD_DIR="$(xdg-user-dir DOWNLOAD)"',
      `EXPECTED_SHA256="${fixture.scriptSha256}"`,
      'SCRIPT=""',
      'while IFS= read -r -d \'\' FILE; do',
      '  [[ "$(sha256sum "$FILE" | awk \'{print $1}\')" == "$EXPECTED_SHA256" ]] || continue',
      '  SCRIPT="$FILE"',
      '  break',
      'done < <(',
      '  find "$DOWNLOAD_DIR" -maxdepth 1 -type f \\',
      String.raw`    -iname 'SHEIKHA_READ_ONLY_PR28_POST_I2_R2_PRE_I3_LIVE_STATE_REBINDING_DESIGN*I2\_R3*.sh'`,
      '    -print0',
      ')',
      'bash "$SCRIPT"'
    ].join('\n');
    const parsed = parseReadOnlyScriptRequest(request);

    expect(parsed).toMatchObject({
      candidateVariable: 'FILE',
      filenamePattern:
        'SHEIKHA_READ_ONLY_PR28_POST_I2_R2_PRE_I3_LIVE_STATE_REBINDING_DESIGN*I2_R3*.sh'
    });
    expect(isGovernedReadOnlyScriptRequest(request)).toBe(true);
    const result = await runGovernedReadOnlyScript(request, {
      homeDir: fixture.homeDir,
      downloadDir: fixture.downloadDir,
      workspaceRoot: fixture.workspaceRoot,
      syntaxChecker: async () => ({ ok: true, error: null }),
      sandboxRunner: async () => ({
        exitCode: 0,
        signal: null,
        stdout: 'I2_R3_SUCCESS=true\n',
        stderr: ''
      })
    });

    expect(result).toMatchObject({
      status: 'READ_ONLY_SCRIPT_EXECUTED',
      scriptName,
      markers: { I2_R3_SUCCESS: 'true' }
    });
  });

  test('blocks mutating commands in the top-level shell envelope', async () => {
    const script = '#!/usr/bin/env bash\nrm -f "$HOME/example"\n';
    fixture = await createFixture(script);
    const sandboxRunner = jest.fn();
    const result = await runGovernedReadOnlyScript(
      buildRequest(fixture.scriptSha256),
      {
        homeDir: fixture.homeDir,
        downloadDir: fixture.downloadDir,
        workspaceRoot: fixture.workspaceRoot,
        syntaxChecker: async () => ({ ok: true, error: null }),
        sandboxRunner
      }
    );

    expect(inspectShellEnvelope(script)).toContain('FILESYSTEM_MUTATION');
    expect(result.status).toBe('READ_ONLY_POLICY_DENIED');
    expect(result.executed).toBe(false);
    expect(sandboxRunner).not.toHaveBeenCalled();
  });

  test('builds a sandbox with a hidden home, read-only mounts and no network', () => {
    const args = buildSandboxArguments({
      scriptPath: '/home/sheikha/Downloads/input.sh',
      workspaceRoot: '/home/sheikha/Projects/sheikha/sheikha-main-portal',
      backupRoot: '/home/sheikha/Backups/sheikha',
      homeDir: '/home/sheikha'
    });
    expect(args).toEqual(expect.arrayContaining([
      '--unshare-net',
      '--clearenv',
      '--remount-ro',
      '/run',
      '/usr/bin/bash',
      '--noprofile',
      '--norc'
    ]));
    expect(args.join(' ')).toContain('--tmpfs /home/sheikha');
    expect(args.join(' ')).toContain(
      '--ro-bind /home/sheikha/Projects/sheikha/sheikha-main-portal /home/sheikha/Projects/sheikha/sheikha-main-portal'
    );
  });

  test('promotes terminal markers into the Arabic summary without unavailable noise', () => {
    const answer = buildReadOnlyScriptAnswer({
      status: 'READ_ONLY_SCRIPT_EXECUTED',
      scriptMatched: true,
      scriptName: 'SHEIKHA_READ_ONLY_CONFIRMATION.sh',
      actualSha256: 'a'.repeat(64),
      matchedCount: 2,
      exitCode: 0,
      syntaxValid: true,
      policyViolations: [],
      parsedOutput: {
        decision: 'ACTIVE_OR_UNREVIEWED_DRIFT_REQUIRES_FRESH_REVIEW',
        current: {
          statusEntryCount: 216,
          trackedDiffPathCount: 87,
          untrackedPathCount: 129,
          stagedPathCount: 0
        }
      },
      markers: {
        CURRENT_216_87_129_STATE_STABLE: 'false',
        I2_R3_R1_READ_ONLY_REBINDING_DESIGN_ELIGIBLE: 'false',
        ACTIVE_WRITER_ATTRIBUTION_REVIEW_REQUIRED: 'true',
        WORKTREE_WRITER_STOP_AUTHORIZED: 'false',
        I3_REMEDIATION_EXECUTION_ALLOWED_NOW: 'false',
        D6_AUTHORIZATION_ALLOWED_NOW: 'false'
      }
    });

    expect(answer).toContain('الحالة ثابتة أثناء الالتقاط: لا');
    expect(answer).toContain('أهلية تصميم إعادة الربط القرائي: لا');
    expect(answer).toContain('مراجعة الكاتب النشط مطلوبة: نعم');
    expect(answer).toContain('إيقاف كاتب مساحة العمل مصرح: لا');
    expect(answer).toContain('تغيرت مساحة العمل أثناء القياس');
    expect(answer).toContain('إيقاف الكاتب غير مصرح به');
    expect(answer).toContain('دون I3 أو D6');
    expect(answer).not.toContain('غير متاح');
  });
});
