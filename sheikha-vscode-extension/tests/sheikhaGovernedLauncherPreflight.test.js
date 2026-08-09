'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const {
  PREFLIGHT_ROUTE,
  canonicalArraySha256,
  globPatternToRegex,
  isGovernedLauncherPreflightRequest,
  runGovernedLauncherPreflight
} = require('../src/chat/sheikhaGovernedLauncherPreflight');

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function buildRequest(launcherSha256) {
  return [
    '(',
    'set -Eeuo pipefail',
    'DOWNLOAD_DIR="$(xdg-user-dir DOWNLOAD)"',
    `EXPECTED_SHA256="${launcherSha256}"`,
    'LAUNCHER=""',
    'while IFS= read -r -d \'\' FILE; do',
    '  [[ "$(sha256sum "$FILE" | awk \'{print $1}\')" == "$EXPECTED_SHA256" ]] || continue',
    '  LAUNCHER="$FILE"',
    'done < <(find "$DOWNLOAD_DIR" -maxdepth 1 -type f -iname \'SHEIKHA_LAUNCH_TEST*.sh\' -print0)',
    'bash "$LAUNCHER"',
    ')'
  ].join('\n');
}

async function createFixture() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'sheikha-preflight-'));
  const homeDir = path.join(root, 'home');
  const downloadDirectory = path.join(homeDir, 'Downloads');
  const workspaceRoot = path.join(
    homeDir,
    'Projects',
    'sheikha',
    'sheikha-main-portal'
  );
  await fs.mkdir(downloadDirectory, { recursive: true });
  await fs.mkdir(workspaceRoot, { recursive: true });

  const packageJson = '{"name":"fixture"}\n';
  const packageLock = '{"lockfileVersion":3}\n';
  await fs.writeFile(path.join(workspaceRoot, 'package.json'), packageJson);
  await fs.writeFile(path.join(workspaceRoot, 'package-lock.json'), packageLock);

  const status = [' M package.json', '?? note.txt'];
  const tracked = ['package.json'];
  const script = [
    '#!/usr/bin/env bash',
    'set -Eeuo pipefail',
    'EXPECTED_MAIN_HEAD="abc123"',
    'EXPECTED_MAIN_TREE="tree123"',
    `EXPECTED_CURRENT_PACKAGE_SHA="${sha256(packageJson)}"`,
    `EXPECTED_CURRENT_LOCK_SHA="${sha256(packageLock)}"`,
    'EXPECTED_STATUS_COUNT="2"',
    'EXPECTED_TRACKED_COUNT="1"',
    'EXPECTED_UNTRACKED_COUNT="1"',
    `EXPECTED_STATUS_PATHS_CANONICAL_SHA256="${canonicalArraySha256(status)}"`,
    `EXPECTED_TRACKED_PATHS_CANONICAL_SHA256="${canonicalArraySha256(tracked)}"`,
    'MAIN_CHECKOUT="$HOME/Projects/sheikha/sheikha-main-portal"',
    'BACKUP_ROOT="$HOME/Backups/sheikha"',
    'DESIGN_ROOT="$BACKUP_ROOT/designs"',
    'mkdir -p "$DESIGN_ROOT"',
    'git -C "$MAIN_CHECKOUT" diff --cached --quiet'
  ].join('\n');
  const scriptSha256 = sha256(script);
  const scriptName = 'SHEIKHA_READ_ONLY_TEST.sh';
  await fs.writeFile(path.join(downloadDirectory, scriptName), script);

  const bundle = 'fixture zip bytes';
  const bundleSha256 = sha256(bundle);
  await fs.writeFile(path.join(downloadDirectory, 'SHEIKHA_TEST_BUNDLE.zip'), bundle);

  const launcher = [
    '#!/usr/bin/env bash',
    `EXPECTED_BUNDLE_SHA256="${bundleSha256}"`,
    `EXPECTED_SCRIPT_SHA256="${scriptSha256}"`,
    "find \"$DOWNLOAD_DIR\" -iname 'SHEIKHA_TEST_BUNDLE*.zip' -print0",
    'unzip -o "$BUNDLE" -d "$DOWNLOAD_DIR"',
    "find \"$DOWNLOAD_DIR\" -iname 'SHEIKHA_READ_ONLY_TEST*.sh' -print0",
    'chmod 700 "$SCRIPT"',
    'bash "$SCRIPT" 2>&1 | tee "$LOG"'
  ].join('\n');
  const launcherSha256 = sha256(launcher);
  await fs.writeFile(
    path.join(downloadDirectory, 'SHEIKHA_LAUNCH_TEST(1).sh'),
    launcher
  );

  return {
    root,
    homeDir,
    downloadDirectory,
    workspaceRoot,
    launcherSha256,
    status,
    tracked
  };
}

function createGitRunner(fixture, overrides = {}) {
  return jest.fn(async (_repository, args) => {
    const command = args.join(' ');
    const values = {
      'rev-parse HEAD': 'abc123',
      'show -s --format=%T HEAD': 'tree123',
      'status --porcelain=v1 --untracked-files=all': fixture.status.join('\n'),
      'diff --name-only --': fixture.tracked.join('\n'),
      'ls-files --others --exclude-standard': 'note.txt',
      'diff --cached --name-only': '',
      ...overrides
    };
    if (!(command in values)) throw new Error(`Unexpected Git read: ${command}`);
    return values[command];
  });
}

describe('Sheikha governed launcher preflight', () => {
  let fixture;

  beforeEach(async () => {
    fixture = await createFixture();
  });

  afterEach(async () => {
    await fs.rm(fixture.root, { recursive: true, force: true });
  });

  test('verifies artifacts and preconditions without executing the launcher', async () => {
    const request = buildRequest(fixture.launcherSha256);

    expect(isGovernedLauncherPreflightRequest(request)).toBe(true);
    const result = await runGovernedLauncherPreflight(request, {
      homeDir: fixture.homeDir,
      downloadDirectory: fixture.downloadDirectory,
      workspaceRoot: fixture.workspaceRoot,
      gitRunner: createGitRunner(fixture)
    });

    expect(result).toMatchObject({
      success: true,
      route: PREFLIGHT_ROUTE,
      decision: 'PREFLIGHT_VERIFIED_AWAITING_HUMAN_EXECUTION_GATE',
      boundaries: {
        launcherExecuted: false,
        shellUsed: false,
        archiveExtracted: false,
        filesWritten: false,
        networkUsed: false,
        gitMutationExecuted: false,
        automaticExecutionAllowed: false
      }
    });
    expect(result.launcher.matchCount).toBe(1);
    expect(result.bundle.matchCount).toBe(1);
    expect(result.script.matchCount).toBe(1);
    expect(result.preconditions.drift).toEqual([]);
    expect(result.answer).toContain('لم أشغّل المشغّل أو السكربت الداخلي');
  });

  test('blocks execution when the live worktree count drifts', async () => {
    const request = buildRequest(fixture.launcherSha256);
    const result = await runGovernedLauncherPreflight(request, {
      homeDir: fixture.homeDir,
      downloadDirectory: fixture.downloadDirectory,
      workspaceRoot: fixture.workspaceRoot,
      gitRunner: createGitRunner(fixture, {
        'status --porcelain=v1 --untracked-files=all': [
          ...fixture.status,
          '?? new-file.txt'
        ].join('\n'),
        'ls-files --others --exclude-standard': 'note.txt\nnew-file.txt'
      })
    });

    expect(result.decision).toBe('BLOCKED_PRECONDITION_DRIFT');
    expect(result.preconditions.drift.map((check) => check.id))
      .toEqual(expect.arrayContaining([
        'STATUS_COUNT',
        'UNTRACKED_COUNT',
        'STATUS_PATHS_SHA256'
      ]));
    expect(result.answer).toContain('يلزم إصدار عقد جديد مبني على الحالة الحالية');
  });

  test('denies artifact patterns that can escape the downloads directory', () => {
    expect(() => globPatternToRegex('../SHEIKHA_LAUNCH_*.sh'))
      .toThrow('SHEIKHA_LAUNCHER_PATTERN_DENIED');
  });
});
