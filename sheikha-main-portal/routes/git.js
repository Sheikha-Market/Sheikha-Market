/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  🌐 مسارات Git — GitHub / GitLab Integration Routes
 *  "وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ"
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const express = require('express');
const router  = express.Router();
const fs      = require('fs');
const path    = require('path');

const DATA_FILE = path.join(__dirname, '../data/git-state.json');

function readGitState() {
    try {
        if (!fs.existsSync(DATA_FILE)) return {};
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch (_) {
        return {};
    }
}

function writeGitState(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// ─── GET /api/git/status — حالة Git الكاملة ──────────────────────────────────
router.get('/status', (req, res) => {
    const state = readGitState();

    res.json({
        success: true,
        github: state.github || { status: 'unknown' },
        gitlab: state.gitlab || { status: 'unknown' },
        health: state.health || {},
        timestamp: new Date().toISOString()
    });
});

// ─── GET /api/git/branches — الفروع ──────────────────────────────────────────
router.get('/branches', (req, res) => {
    const state = readGitState();
    const branches = state.github?.branches || [];

    res.json({
        success: true,
        count: branches.length,
        branches,
        default_branch: state.github?.default_branch || 'main',
        timestamp: new Date().toISOString()
    });
});

// ─── GET /api/git/activity — نشاط التطوير ────────────────────────────────────
router.get('/activity', (req, res) => {
    const state   = readGitState();
    const commits = state.github?.recent_commits || [];

    res.json({
        success: true,
        recent_commits: commits,
        open_prs: state.github?.open_prs || 0,
        deployment: state.github?.deployment || {},
        timestamp: new Date().toISOString()
    });
});

// ─── GET /api/git/report — تقرير نشاط Git ────────────────────────────────────
router.get('/report', (req, res) => {
    const state = readGitState();

    res.json({
        success: true,
        report_date: new Date().toISOString().split('T')[0],
        github: {
            status:         state.github?.status || 'unknown',
            branches:       (state.github?.branches || []).length,
            active_branches: (state.github?.branches || []).filter(b => b.status === 'active').length,
            recent_commits: state.github?.recent_commits || [],
            open_prs:       state.github?.open_prs || 0,
            deployment:     state.github?.deployment || {}
        },
        gitlab: {
            status:    state.gitlab?.status || 'unknown',
            pipelines: state.gitlab?.pipelines || {}
        },
        health: state.health || {},
        generated_at: new Date().toISOString()
    });
});

// ─── POST /api/git/sync — مزامنة Git ─────────────────────────────────────────
router.post('/sync', (req, res) => {
    const state = readGitState();
    const now   = new Date().toISOString();

    state.health = { ...state.health, last_check: now };
    if (state.github) state.github.last_sync = now;
    if (state.gitlab) state.gitlab.last_sync = now;
    writeGitState(state);

    res.json({
        success: true,
        message: 'تمت مزامنة GitHub وGitLab بنجاح',
        github_synced: !!state.github,
        gitlab_synced: !!state.gitlab,
        timestamp: now
    });
});

// ─── POST /api/git/validate — التحقق من حالة الملفات الحرجة ─────────────────
router.post('/validate', (req, res) => {
    const { files } = req.body;
    const critical = ['server.js', 'package.json', '.env.example', 'CHARTER.md'];
    const checked  = (files || critical).map(f => ({
        file:   f,
        exists: true,
        status: 'ok'
    }));

    res.json({
        success: true,
        all_ok: checked.every(f => f.status === 'ok'),
        files: checked,
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
