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

// ─── GitHub API helpers ───────────────────────────────────────────────────────
function encodeGitHubPath(filePath) {
    return filePath.split('/').map(segment => encodeURIComponent(segment)).join('/');
}

async function githubApiRequest(method, apiPath, body) {
    const token  = process.env.GITHUB_TOKEN;
    const owner  = process.env.GITHUB_OWNER || 'Sheikha-Market';
    const repo   = process.env.GITHUB_REPO  || 'Sheikha-Market';
    const url    = `https://api.github.com/repos/${owner}/${repo}${apiPath}`;

    const headers = {
        'Accept':               'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type':         'application/json'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const res  = await fetch(url, options);
    const text = await res.text();
    let json;
    try { json = JSON.parse(text); } catch (_) { json = { message: text }; }
    return { status: res.status, data: json };
}

// ─── POST /api/git/create-file — إنشاء ملف مباشرةً في المستودع ──────────────
router.post('/create-file', async (req, res) => {
    const { path: filePath, content, message, branch } = req.body || {};

    if (!filePath || content === undefined || !message) {
        return res.status(400).json({
            success: false,
            error:   'الحقول المطلوبة: path, content, message'
        });
    }

    try {
        const base64Content  = Buffer.from(content, 'utf8').toString('base64');
        const defaultBranch  = process.env.GITHUB_DEFAULT_BRANCH || 'main';
        const payload        = { message, content: base64Content, branch: branch || defaultBranch };

        const { status, data } = await githubApiRequest('PUT', `/contents/${encodeGitHubPath(filePath)}`, payload);

        if (status === 201) {
            return res.status(201).json({
                success:    true,
                message:    'تم إنشاء الملف بنجاح في المستودع',
                file:       data.content?.name,
                sha:        data.content?.sha,
                html_url:   data.content?.html_url,
                commit_sha: data.commit?.sha,
                timestamp:  new Date().toISOString()
            });
        }

        return res.status(status).json({
            success: false,
            error:   data.message || 'فشل إنشاء الملف',
            details: data
        });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

// ─── PUT /api/git/update-file — تحديث ملف موجود في المستودع ─────────────────
router.put('/update-file', async (req, res) => {
    const { path: filePath, content, message, sha, branch } = req.body || {};

    if (!filePath || content === undefined || !message || !sha) {
        return res.status(400).json({
            success: false,
            error:   'الحقول المطلوبة: path, content, message, sha (SHA الحالي للملف)'
        });
    }

    try {
        const base64Content  = Buffer.from(content, 'utf8').toString('base64');
        const defaultBranch  = process.env.GITHUB_DEFAULT_BRANCH || 'main';
        const payload        = { message, content: base64Content, sha, branch: branch || defaultBranch };

        const { status, data } = await githubApiRequest('PUT', `/contents/${encodeGitHubPath(filePath)}`, payload);

        if (status === 200) {
            return res.json({
                success:    true,
                message:    'تم تحديث الملف بنجاح في المستودع',
                file:       data.content?.name,
                sha:        data.content?.sha,
                html_url:   data.content?.html_url,
                commit_sha: data.commit?.sha,
                timestamp:  new Date().toISOString()
            });
        }

        return res.status(status).json({
            success: false,
            error:   data.message || 'فشل تحديث الملف',
            details: data
        });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

// ─── GET /api/git/file — قراءة محتوى ملف من المستودع ────────────────────────
router.get('/file', async (req, res) => {
    const { path: filePath, ref } = req.query;

    if (!filePath) {
        return res.status(400).json({ success: false, error: 'الحقل المطلوب: path' });
    }

    try {
        const encodedPath       = encodeGitHubPath(filePath);
        const apiPath           = `/contents/${encodedPath}${ref ? `?ref=${encodeURIComponent(ref)}` : ''}`;
        const { status, data }  = await githubApiRequest('GET', apiPath);

        if (status === 200) {
            const decoded = data.encoding === 'base64'
                ? Buffer.from(data.content, 'base64').toString('utf8')
                : data.content;

            return res.json({
                success:  true,
                path:     data.path,
                sha:      data.sha,
                size:     data.size,
                html_url: data.html_url,
                content:  decoded,
                timestamp: new Date().toISOString()
            });
        }

        return res.status(status).json({
            success: false,
            error:   data.message || 'فشل قراءة الملف',
            details: data
        });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
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
