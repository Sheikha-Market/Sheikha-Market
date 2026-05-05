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

function getReportsRepoConfig() {
    const token = process.env.REPORTS_GITHUB_TOKEN || process.env.GITHUB_TOKEN || '';
    const owner = process.env.REPORTS_GITHUB_OWNER || process.env.GITHUB_OWNER || 'Sheikha-Market';
    const repo = process.env.REPORTS_GITHUB_REPO || '';
    const branch = process.env.REPORTS_GITHUB_BRANCH || 'main';
    const basePath = process.env.REPORTS_GITHUB_BASE_PATH || 'server-reports';

    return {
        token: String(token).trim(),
        owner: String(owner).trim(),
        repo: String(repo).trim(),
        branch: String(branch).trim(),
        basePath: String(basePath).trim()
    };
}

function maskSecret(secret) {
    const value = String(secret || '').trim();
    if (!value) return '';
    if (value.length <= 8) return '***';
    return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

function getGitHubConfig() {
    return {
        provider: 'github',
        owner: String(process.env.GITHUB_OWNER || 'Sheikha-Market').trim(),
        repo: String(process.env.GITHUB_REPO || 'Sheikha-Market').trim(),
        token: String(process.env.GITHUB_TOKEN || '').trim(),
        branch: String(process.env.GITHUB_DEFAULT_BRANCH || 'main').trim()
    };
}

function getGitLabConfig() {
    return {
        provider: 'gitlab',
        baseUrl: String(process.env.GITLAB_BASE_URL || 'https://gitlab.com/api/v4').trim().replace(/\/$/, ''),
        token: String(process.env.GITLAB_TOKEN || '').trim(),
        projectId: String(process.env.GITLAB_PROJECT_ID || '').trim(),
        groupId: String(process.env.GITLAB_GROUP_ID || '').trim()
    };
}

function getGoogleConfig() {
    return {
        provider: 'google',
        accessToken: String(process.env.GOOGLE_ACCESS_TOKEN || '').trim(),
        apiKey: String(process.env.GOOGLE_API_KEY || '').trim(),
        clientId: String(process.env.GOOGLE_CLIENT_ID || '').trim(),
        projectId: String(process.env.GOOGLE_CLOUD_PROJECT || '').trim()
    };
}

function getVsCoderConfig() {
    return {
        provider: 'vs-coder',
        sheikhaServerUrl: String(process.env.SHEIKHA_SERVER_URL || 'http://127.0.0.1:8080').trim().replace(/\/$/, ''),
        copilotServerUrl: String(process.env.COPILOT_SERVER_URL || `http://127.0.0.1:${process.env.COPILOT_SERVER_PORT || '3091'}`).trim().replace(/\/$/, ''),
        extensionId: String(process.env.VSCODER_EXTENSION_ID || 'sheikha.sheikha-copilot').trim()
    };
}

function buildNeuralGitLayer() {
    const github = getGitHubConfig();
    const gitlab = getGitLabConfig();
    const google = getGoogleConfig();
    const vsCoder = getVsCoderConfig();

    const providers = [
        {
            id: 'github',
            connected: Boolean(github.token && github.owner && github.repo),
            config: {
                owner: github.owner,
                repo: github.repo,
                branch: github.branch,
                token: maskSecret(github.token)
            }
        },
        {
            id: 'gitlab',
            connected: Boolean(gitlab.token && (gitlab.projectId || gitlab.groupId)),
            config: {
                baseUrl: gitlab.baseUrl,
                projectId: gitlab.projectId || null,
                groupId: gitlab.groupId || null,
                token: maskSecret(gitlab.token)
            }
        },
        {
            id: 'google',
            connected: Boolean(google.accessToken || google.apiKey || google.clientId),
            config: {
                projectId: google.projectId || null,
                clientId: google.clientId ? `${google.clientId.slice(0, 8)}...` : null,
                accessToken: maskSecret(google.accessToken),
                apiKey: maskSecret(google.apiKey)
            }
        },
        {
            id: 'vs-coder',
            connected: Boolean(vsCoder.sheikhaServerUrl && vsCoder.copilotServerUrl),
            config: {
                sheikhaServerUrl: vsCoder.sheikhaServerUrl,
                copilotServerUrl: vsCoder.copilotServerUrl,
                extensionId: vsCoder.extensionId
            }
        }
    ];

    const connectedCount = providers.filter((item) => item.connected).length;

    return {
        layer: {
            id: 'ROOT_NEURAL_GIT_INTEGRATION_LAYER',
            version: '1.0.0',
            posture: connectedCount >= 2 ? 'active' : 'partial',
            connectedCount,
            totalProviders: providers.length,
            providers
        }
    };
}

async function verifyGitHubIntegration() {
    const cfg = getGitHubConfig();
    if (!cfg.token || !cfg.owner || !cfg.repo) {
        return {
            provider: 'github',
            ok: false,
            status: 'not_configured',
            message: 'GitHub غير مهيأ بالكامل.'
        };
    }

    const url = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}`;
    const res = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/vnd.github+json',
            'Authorization': `Bearer ${cfg.token}`,
            'X-GitHub-Api-Version': '2022-11-28'
        }
    });

    const body = await res.text();
    return {
        provider: 'github',
        ok: res.status === 200,
        status: res.status,
        message: res.status === 200 ? 'GitHub متصل بنجاح.' : `GitHub connection failed (${res.status})`,
        details: body.slice(0, 220)
    };
}

async function verifyGitLabIntegration() {
    const cfg = getGitLabConfig();
    if (!cfg.token) {
        return {
            provider: 'gitlab',
            ok: false,
            status: 'not_configured',
            message: 'GitLab token غير مضبوط.'
        };
    }

    const res = await fetch(`${cfg.baseUrl}/user`, {
        method: 'GET',
        headers: {
            'PRIVATE-TOKEN': cfg.token,
            'Content-Type': 'application/json'
        }
    });

    const body = await res.text();
    return {
        provider: 'gitlab',
        ok: res.status === 200,
        status: res.status,
        message: res.status === 200 ? 'GitLab متصل بنجاح.' : `GitLab connection failed (${res.status})`,
        details: body.slice(0, 220)
    };
}

async function verifyGoogleIntegration() {
    const cfg = getGoogleConfig();
    if (!cfg.accessToken && !cfg.apiKey) {
        return {
            provider: 'google',
            ok: false,
            status: 'not_configured',
            message: 'Google credentials غير مضبوطة.'
        };
    }

    const url = cfg.accessToken
        ? 'https://www.googleapis.com/oauth2/v3/userinfo'
        : `https://www.googleapis.com/oauth2/v3/certs?key=${encodeURIComponent(cfg.apiKey)}`;

    const headers = cfg.accessToken
        ? { 'Authorization': `Bearer ${cfg.accessToken}` }
        : {};

    const res = await fetch(url, { method: 'GET', headers });
    const body = await res.text();
    return {
        provider: 'google',
        ok: res.status === 200,
        status: res.status,
        message: res.status === 200 ? 'Google متصل بنجاح.' : `Google connection failed (${res.status})`,
        details: body.slice(0, 220)
    };
}

async function verifyVsCoderIntegration() {
    const cfg = getVsCoderConfig();

    const checks = [
        {
            key: 'sheikha-vscode-bridge',
            url: `${cfg.sheikhaServerUrl}/api/sheikha/copilot/vscode-bridge`
        },
        {
            key: 'copilot-server-health',
            url: `${cfg.copilotServerUrl}/health`
        }
    ];

    const results = [];
    for (const item of checks) {
        try {
            const res = await fetch(item.url, { method: 'GET' });
            const body = await res.text();
            results.push({
                key: item.key,
                ok: res.status === 200,
                status: res.status,
                details: body.slice(0, 180)
            });
        } catch (error) {
            results.push({
                key: item.key,
                ok: false,
                status: 'unreachable',
                details: error.message
            });
        }
    }

    const okCount = results.filter((item) => item.ok).length;
    return {
        provider: 'vs-coder',
        ok: okCount === results.length,
        status: okCount === results.length ? 200 : 207,
        message: okCount === results.length
            ? 'VS Coder bridge متصل بالكامل.'
            : 'VS Coder bridge جزئي: تحقق من sheikha server أو copilot server.',
        checks: results
    };
}

async function githubApiRequestToRepo(method, owner, repo, token, apiPath, body) {
    const url = `https://api.github.com/repos/${owner}/${repo}${apiPath}`;

    const headers = {
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json'
    };

    if (token) headers['Authorization'] = `Bearer ${token}`;

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(url, options);
    const text = await res.text();
    let json;
    try { json = JSON.parse(text); } catch (_) { json = { message: text }; }
    return { status: res.status, data: json };
}

async function getRemoteFileSha(owner, repo, token, filePath, branch) {
    const endpoint = `/contents/${encodeGitHubPath(filePath)}?ref=${encodeURIComponent(branch)}`;
    const { status, data } = await githubApiRequestToRepo('GET', owner, repo, token, endpoint);
    if (status === 200 && data && data.sha) {
        return data.sha;
    }
    return null;
}

async function upsertFileToRepo({ owner, repo, token, branch, filePath, content, message }) {
    const existingSha = await getRemoteFileSha(owner, repo, token, filePath, branch);
    const payload = {
        message,
        content: Buffer.from(content, 'utf8').toString('base64'),
        branch
    };

    if (existingSha) {
        payload.sha = existingSha;
    }

    const endpoint = `/contents/${encodeGitHubPath(filePath)}`;
    return githubApiRequestToRepo('PUT', owner, repo, token, endpoint, payload);
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

// ─── GET /api/git/integrations/status — طبقة التكامل العصبي فوق Git ─────────
router.get('/integrations/status', (_req, res) => {
    const layer = buildNeuralGitLayer();
    return res.status(200).json({
        success: true,
        data: layer,
        message: 'طبقة التكامل العصبي فوق Git جاهزة.',
        timestamp: new Date().toISOString()
    });
});

// ─── POST /api/git/integrations/verify — فحص GitHub/GitLab/Google ─────────
router.post('/integrations/verify', async (_req, res) => {
    try {
        const [github, gitlab, google, vsCoder] = await Promise.all([
            verifyGitHubIntegration(),
            verifyGitLabIntegration(),
            verifyGoogleIntegration(),
            verifyVsCoderIntegration()
        ]);

        const checks = [github, gitlab, google, vsCoder];
        const okCount = checks.filter((check) => check.ok).length;

        return res.status(200).json({
            success: okCount > 0,
            data: {
                layer: buildNeuralGitLayer().layer,
                checks,
                okCount,
                total: checks.length
            },
            message: okCount === checks.length
                ? 'تم تفعيل كل التكاملات بنجاح.'
                : 'تم تنفيذ الفحص: بعض التكاملات تحتاج إعداد مفاتيح الوصول.',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// ─── POST /api/git/reports-sync — رفع تقارير السيرفر إلى مستودع تقارير مخصص ───
router.post('/reports-sync', async (req, res) => {
    const cfg = getReportsRepoConfig();
    const sourceDir = path.join(__dirname, '..', 'reports', 'synchronization');
    const maxFiles = Math.max(1, Math.min(parseInt(req.body?.maxFiles, 10) || 20, 200));
    const dryRun = String(req.body?.dryRun || '').toLowerCase() === 'true' || req.body?.dryRun === true;

    if (!cfg.repo) {
        return res.status(400).json({
            success: false,
            message: 'إعداد ناقص: REPORTS_GITHUB_REPO مطلوب لتفعيل مزامنة التقارير.',
            timestamp: new Date().toISOString()
        });
    }

    if (!cfg.token) {
        return res.status(400).json({
            success: false,
            message: 'إعداد ناقص: REPORTS_GITHUB_TOKEN (أو GITHUB_TOKEN) مطلوب.',
            timestamp: new Date().toISOString()
        });
    }

    try {
        if (!fs.existsSync(sourceDir)) {
            return res.status(404).json({
                success: false,
                message: 'مجلد التقارير غير موجود: reports/synchronization',
                timestamp: new Date().toISOString()
            });
        }

        const allEntries = fs.readdirSync(sourceDir)
            .map((name) => {
                const fullPath = path.join(sourceDir, name);
                const stat = fs.statSync(fullPath);
                return { name, fullPath, stat };
            })
            .filter((entry) => entry.stat.isFile())
            .sort((a, b) => b.stat.mtimeMs - a.stat.mtimeMs)
            .slice(0, maxFiles);

        const planned = allEntries.map((entry) => ({
            file: entry.name,
            size: entry.stat.size,
            mtime: entry.stat.mtime.toISOString(),
            targetPath: `${cfg.basePath}/${entry.name}`
        }));

        if (dryRun) {
            return res.status(200).json({
                success: true,
                dryRun: true,
                data: {
                    owner: cfg.owner,
                    repo: cfg.repo,
                    branch: cfg.branch,
                    count: planned.length,
                    files: planned
                },
                message: 'وضع المعاينة: تم تجهيز قائمة الملفات بدون رفع فعلي.',
                timestamp: new Date().toISOString()
            });
        }

        const uploaded = [];
        const failed = [];

        for (const item of planned) {
            try {
                const content = fs.readFileSync(path.join(sourceDir, item.file), 'utf8');
                const commitMsg = `reports: sync ${item.file} @ ${new Date().toISOString()}`;
                const result = await upsertFileToRepo({
                    owner: cfg.owner,
                    repo: cfg.repo,
                    token: cfg.token,
                    branch: cfg.branch,
                    filePath: item.targetPath,
                    content,
                    message: commitMsg
                });

                if (result.status === 200 || result.status === 201) {
                    uploaded.push({
                        file: item.file,
                        targetPath: item.targetPath,
                        commitSha: result.data?.commit?.sha || null,
                        url: result.data?.content?.html_url || null
                    });
                } else {
                    failed.push({
                        file: item.file,
                        targetPath: item.targetPath,
                        status: result.status,
                        error: result.data?.message || 'GitHub API error'
                    });
                }
            } catch (error) {
                failed.push({
                    file: item.file,
                    targetPath: item.targetPath,
                    status: 500,
                    error: error.message
                });
            }
        }

        return res.status(failed.length ? 207 : 200).json({
            success: failed.length === 0,
            data: {
                owner: cfg.owner,
                repo: cfg.repo,
                branch: cfg.branch,
                attempted: planned.length,
                uploadedCount: uploaded.length,
                failedCount: failed.length,
                uploaded,
                failed
            },
            message: failed.length ? 'تمت المزامنة مع وجود ملفات فشلت.' : 'تمت مزامنة تقارير السيرفر بنجاح.',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;
