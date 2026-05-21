#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const MODE = (process.argv[2] || 'audit').toLowerCase();
const ALLOW_PUSH = process.argv.includes('--push');
const ROOT_DIR = process.cwd();
const READ_ONLY_PUSH_URL = 'no_push://read-only-remote';

const topology = [
    {
        key: 'portal-enterprise',
        repoPath: '.',
        branch: 'stable/runtime-baseline',
        remotes: [
            { name: 'origin', url: 'git@github.com:Sheikha-Market/sheikha-main-portal.git', mode: 'rw' },
            { name: 'github', url: 'https://github.com/Sheikha-Market/sheikha-main-portal.git', mode: 'ro' },
            { name: 'enterprise', url: 'git@github.com:Sheikha-Market/sheikha-enterprise-portal.git', mode: 'rw' },
            { name: 'gitlab', url: 'git@gitlab.com:Sheikha-Market/sheikha.git', mode: 'ro' }
        ]
    },
    {
        key: 'sheikha-market-mirror',
        repoPath: 'Sheikha-Market',
        branch: 'main',
        remotes: [
            { name: 'origin', url: 'git@github.com:Sheikha-Market/Sheikha-Market.git', mode: 'rw' },
            { name: 'upstream-read', url: 'https://github.com/Sheikha-Market/Sheikha-Market.git', mode: 'ro' }
        ]
    }
];

function sh(cmd, cwd) {
    return execSync(cmd, {
        cwd,
        stdio: ['ignore', 'pipe', 'pipe'],
        encoding: 'utf8'
    }).trim();
}

function safeSh(cmd, cwd) {
    try {
        return { ok: true, out: sh(cmd, cwd) };
    } catch (err) {
        const stderr = err.stderr ? String(err.stderr) : String(err.message || err);
        return { ok: false, out: stderr.trim() };
    }
}

function repoExists(absPath) {
    return fs.existsSync(path.join(absPath, '.git'));
}

function remoteExists(absPath, remoteName) {
    const res = safeSh(`git remote get-url ${remoteName}`, absPath);
    return res.ok;
}

function getRemoteFetchUrl(absPath, remoteName) {
    const res = safeSh(`git remote get-url ${remoteName}`, absPath);
    return res.ok ? res.out : '';
}

function getRemotePushUrl(absPath, remoteName) {
    const res = safeSh(`git remote get-url --push ${remoteName}`, absPath);
    return res.ok ? res.out : '';
}

function ensureRemote(absPath, remote) {
    if (!remoteExists(absPath, remote.name)) {
        sh(`git remote add ${remote.name} ${remote.url}`, absPath);
    } else {
        sh(`git remote set-url ${remote.name} ${remote.url}`, absPath);
    }

    if (remote.mode === 'ro') {
        sh(`git remote set-url --push ${remote.name} ${READ_ONLY_PUSH_URL}`, absPath);
    } else {
        sh(`git remote set-url --push ${remote.name} ${remote.url}`, absPath);
    }
}

function ensureBranch(absPath, branch) {
    if (!branch) return;
    const current = safeSh('git branch --show-current', absPath);
    if (!current.ok || !current.out) return;
    if (current.out !== branch) return;
    safeSh(`git branch --set-upstream-to=origin/${branch} ${branch}`, absPath);
}

function runAudit(entry) {
    const absPath = path.resolve(ROOT_DIR, entry.repoPath);
    const report = {
        key: entry.key,
        repoPath: entry.repoPath,
        exists: repoExists(absPath),
        branch: '',
        remotes: []
    };

    if (!report.exists) return report;

    report.branch = safeSh('git branch --show-current', absPath).out;

    for (const remote of entry.remotes) {
        report.remotes.push({
            name: remote.name,
            desiredMode: remote.mode,
            desiredUrl: remote.url,
            fetchUrl: getRemoteFetchUrl(absPath, remote.name),
            pushUrl: getRemotePushUrl(absPath, remote.name)
        });
    }

    return report;
}

function runApply(entry) {
    const absPath = path.resolve(ROOT_DIR, entry.repoPath);
    if (!repoExists(absPath)) {
        return { key: entry.key, status: 'skipped', reason: 'repo_not_found' };
    }

    for (const remote of entry.remotes) {
        ensureRemote(absPath, remote);
    }

    ensureBranch(absPath, entry.branch);

    return { key: entry.key, status: 'updated' };
}

function runSync(entry) {
    const absPath = path.resolve(ROOT_DIR, entry.repoPath);
    if (!repoExists(absPath)) {
        return { key: entry.key, status: 'skipped', reason: 'repo_not_found' };
    }

    safeSh('git fetch --all --prune', absPath);

    const currentBranch = safeSh('git branch --show-current', absPath).out;
    if (ALLOW_PUSH && currentBranch) {
        const rwRemotes = entry.remotes.filter((r) => r.mode === 'rw');
        for (const remote of rwRemotes) {
            safeSh(`git push ${remote.name} ${currentBranch}`, absPath);
        }
    }

    return { key: entry.key, status: 'synced', pushed: ALLOW_PUSH };
}

function print(data) {
    process.stdout.write(`${JSON.stringify(data, null, 2)}\n`);
}

function main() {
    if (!['audit', 'apply', 'sync'].includes(MODE)) {
        process.stderr.write('Usage: node scripts/repo-topology-sync.js [audit|apply|sync] [--push]\n');
        process.exit(1);
    }

    const out = {
        mode: MODE,
        allowPush: ALLOW_PUSH,
        generatedAt: new Date().toISOString(),
        repos: []
    };

    for (const entry of topology) {
        if (MODE === 'audit') {
            out.repos.push(runAudit(entry));
        } else if (MODE === 'apply') {
            out.repos.push(runApply(entry));
        } else {
            out.repos.push(runSync(entry));
        }
    }

    const reportDir = path.join(ROOT_DIR, 'logs', 'runtime');
    fs.mkdirSync(reportDir, { recursive: true });
    const reportPath = path.join(reportDir, `repo-topology-${MODE}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(out, null, 2), 'utf8');

    print({ ...out, reportPath });
}

main();
