/**
 * Git / GitHub / GitLab Integration Routes
 * واجهات موحدة لحالة Git والتكاملات اليومية.
 */

const express = require('express');
const https = require('https');
const router = express.Router();
const { sheikhaRealtimeHub } = require('../lib/sheikha-realtime-hub');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'Sheikha-Market';
const GITHUB_REPO = process.env.GITHUB_REPO || 'Sheikha-Market';
const GITHUB_DEFAULT_BRANCH = process.env.GITHUB_DEFAULT_BRANCH || 'main';

const GITLAB_TOKEN = process.env.GITLAB_TOKEN || '';
const GITLAB_PROJECT_ID = process.env.GITLAB_PROJECT_ID || '';
const GITLAB_API_BASE = process.env.GITLAB_API_BASE || 'https://gitlab.com/api/v4';
const GITLAB_DEFAULT_BRANCH = process.env.GITLAB_DEFAULT_BRANCH || 'main';
const GIT_FORCE_IPV4 = process.env.GIT_FORCE_IPV4 !== 'false';

const HAS_VALID_GITHUB_TOKEN = !!GITHUB_TOKEN && GITHUB_TOKEN !== 'REPLACE_WITH_GITHUB_TOKEN';
const HAS_VALID_GITLAB_TOKEN = !!GITLAB_TOKEN && GITLAB_TOKEN !== 'REPLACE_WITH_GITLAB_TOKEN';

function now() {
    return new Date().toISOString();
}

function successResponse(res, message, data, statusCode = 200) {
    return res.status(statusCode).json({
        success: true,
        data,
        message,
        timestamp: now()
    });
}

function errorResponse(res, message, details = null, statusCode = 500) {
    return res.status(statusCode).json({
        success: false,
        data: details,
        message,
        timestamp: now()
    });
}

function httpJsonRequest({ hostname, path, method, headers, data }) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname,
            port: 443,
            path,
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            // نعتمد IPv4 افتراضياً لتفادي مشاكل IPv6 في بعض الشبكات.
            ...(GIT_FORCE_IPV4 ? { family: 4 } : {})
        };

        const req = https.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                const isJson = (res.headers['content-type'] || '').includes('application/json');
                const parsed = isJson && responseData ? JSON.parse(responseData) : responseData;

                if (res.statusCode >= 400) {
                    reject({
                        statusCode: res.statusCode,
                        message: (parsed && parsed.message) || `HTTP ${res.statusCode}`,
                        data: parsed
                    });
                    return;
                }

                resolve({
                    statusCode: res.statusCode,
                    data: parsed
                });
            });
        });

        req.on('error', (error) => {
            reject({
                statusCode: 500,
                message: 'HTTP request failed',
                data: error.message
            });
        });

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

function githubRequest(method, path, data = null) {
    const headers = {
        'User-Agent': 'Sheikha-Market',
        Accept: 'application/vnd.github+json'
    };

    if (HAS_VALID_GITHUB_TOKEN) {
        headers.Authorization = `token ${GITHUB_TOKEN}`;
    }

    return httpJsonRequest({
        hostname: 'api.github.com',
        path,
        method,
        headers,
        data
    });
}

function gitlabRequest(method, path, data = null) {
    const cleanBase = GITLAB_API_BASE.replace('https://', '').replace(/\/$/, '');
    const pathPrefix = cleanBase.includes('/') ? cleanBase.substring(cleanBase.indexOf('/')) : '';
    const hostname = cleanBase.split('/')[0];
    const finalPath = `${pathPrefix}${path}`;

    const headers = {
        'User-Agent': 'Sheikha-Market'
    };

    if (HAS_VALID_GITLAB_TOKEN) {
        headers['PRIVATE-TOKEN'] = GITLAB_TOKEN;
    }

    return httpJsonRequest({
        hostname,
        path: finalPath,
        method,
        headers,
        data
    });
}

function encodeBase64(content) {
    return Buffer.from(content).toString('base64');
}

function decodeBase64(encoded) {
    return Buffer.from(encoded, 'base64').toString('utf-8');
}

async function getGitHubStatus() {
    const response = await githubRequest('GET', `/repos/${GITHUB_OWNER}/${GITHUB_REPO}`);
    return {
        provider: 'github',
        available: true,
        repository: {
            name: response.data.name,
            owner: response.data.owner.login,
            fullName: response.data.full_name,
            description: response.data.description,
            url: response.data.html_url,
            defaultBranch: response.data.default_branch,
            pushedAt: response.data.pushed_at,
            isPrivate: response.data.private
        }
    };
}

async function getGitLabStatus() {
    if (!GITLAB_PROJECT_ID) {
        return {
            provider: 'gitlab',
            available: false,
            message: 'GITLAB_PROJECT_ID غير مهيأ'
        };
    }

    const response = await gitlabRequest('GET', `/projects/${encodeURIComponent(GITLAB_PROJECT_ID)}`);
    return {
        provider: 'gitlab',
        available: true,
        repository: {
            id: response.data.id,
            name: response.data.name,
            pathWithNamespace: response.data.path_with_namespace,
            description: response.data.description,
            url: response.data.web_url,
            defaultBranch: response.data.default_branch,
            visibility: response.data.visibility,
            lastActivityAt: response.data.last_activity_at
        }
    };
}

router.get('/health', (req, res) => {
    return successResponse(res, 'Git Integration Ready', {
        github: {
            owner: GITHUB_OWNER,
            repo: GITHUB_REPO,
            branch: GITHUB_DEFAULT_BRANCH,
            tokenConfigured: HAS_VALID_GITHUB_TOKEN
        },
        gitlab: {
            projectId: GITLAB_PROJECT_ID || null,
            branch: GITLAB_DEFAULT_BRANCH,
            tokenConfigured: HAS_VALID_GITLAB_TOKEN,
            apiBase: GITLAB_API_BASE
        }
    });
});

router.get('/file', async (req, res) => {
    try {
        const filePath = req.query.path;
        const branch = req.query.branch || GITHUB_DEFAULT_BRANCH;

        if (!filePath) {
            return errorResponse(res, 'Missing required parameter: path', null, 400);
        }

        const response = await githubRequest(
            'GET',
            `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}?ref=${branch}`
        );

        return successResponse(res, 'File fetched successfully', {
            file: {
                name: response.data.name,
                path: response.data.path,
                sha: response.data.sha,
                size: response.data.size,
                content: decodeBase64(response.data.content),
                encoding: response.data.encoding,
                url: response.data.url,
                htmlUrl: response.data.html_url,
                branch
            }
        });
    } catch (error) {
        return errorResponse(res, error.message || 'Failed to read file', error.data || null, error.statusCode || 500);
    }
});

router.post('/create-file', async (req, res) => {
    try {
        const { path, content, message, branch } = req.body;

        if (!path || !content || !message) {
            return errorResponse(res, 'Missing required fields: path, content, message', null, 400);
        }

        const targetBranch = branch || GITHUB_DEFAULT_BRANCH;
        const payload = {
            message,
            content: encodeBase64(content),
            branch: targetBranch
        };

        const response = await githubRequest(
            'PUT',
            `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`,
            payload
        );

        sheikhaRealtimeHub.emitEvent('git.file.created', {
            path,
            branch: targetBranch,
            sha: response.data.content.sha,
            commit: response.data.commit.sha
        });

        return successResponse(
            res,
            'File created successfully',
            {
                commit: {
                    sha: response.data.commit.sha,
                    url: response.data.commit.html_url,
                    message: response.data.commit.message,
                    author: response.data.commit.author
                },
                file: {
                    path: response.data.content.path,
                    sha: response.data.content.sha,
                    size: response.data.content.size,
                    url: response.data.content.url
                }
            },
            201
        );
    } catch (error) {
        return errorResponse(res, error.message || 'Failed to create file', error.data || null, error.statusCode || 500);
    }
});

router.put('/update-file', async (req, res) => {
    try {
        const { path, content, message, sha, branch } = req.body;

        if (!path || !content || !message || !sha) {
            return errorResponse(res, 'Missing required fields: path, content, message, sha', null, 400);
        }

        const targetBranch = branch || GITHUB_DEFAULT_BRANCH;
        const payload = {
            message,
            content: encodeBase64(content),
            sha,
            branch: targetBranch
        };

        const response = await githubRequest(
            'PUT',
            `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`,
            payload
        );

        sheikhaRealtimeHub.emitEvent('git.file.updated', {
            path,
            branch: targetBranch,
            sha: response.data.content.sha,
            commit: response.data.commit.sha
        });

        return successResponse(res, 'File updated successfully', {
            commit: {
                sha: response.data.commit.sha,
                url: response.data.commit.html_url,
                message: response.data.commit.message,
                author: response.data.commit.author
            },
            file: {
                path: response.data.content.path,
                sha: response.data.content.sha,
                size: response.data.content.size,
                url: response.data.content.url
            }
        });
    } catch (error) {
        return errorResponse(res, error.message || 'Failed to update file', error.data || null, error.statusCode || 500);
    }
});

router.get('/status', async (req, res) => {
    try {
        const source = (req.query.source || 'github').toLowerCase();

        if (source === 'gitlab') {
            const gitlabStatus = await getGitLabStatus();
            return successResponse(res, 'GitLab status fetched', gitlabStatus);
        }

        if (source === 'all') {
            const data = {
                github: null,
                gitlab: null
            };

            try {
                data.github = await getGitHubStatus();
            } catch (error) {
                data.github = { provider: 'github', available: false, message: error.message };
            }

            try {
                data.gitlab = await getGitLabStatus();
            } catch (error) {
                data.gitlab = { provider: 'gitlab', available: false, message: error.message };
            }

            return successResponse(res, 'Unified Git status fetched', data);
        }

        const githubStatus = await getGitHubStatus();
        return successResponse(res, 'GitHub status fetched', githubStatus);
    } catch (error) {
        return errorResponse(res, error.message || 'Failed to fetch repository status', error.data || null, error.statusCode || 500);
    }
});

router.get('/branches', async (req, res) => {
    try {
        const source = (req.query.source || 'all').toLowerCase();
        const perPage = Number.parseInt(req.query.limit, 10) || 20;
        const data = {};

        if (source === 'github' || source === 'all') {
            const github = await githubRequest(
                'GET',
                `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/branches?per_page=${perPage}`
            );
            data.github = github.data.map((branch) => ({
                name: branch.name,
                protected: !!branch.protected,
                commitSha: branch.commit ? branch.commit.sha : null
            }));
        }

        if (source === 'gitlab' || source === 'all') {
            if (!GITLAB_PROJECT_ID) {
                data.gitlab = {
                    warning: 'GITLAB_PROJECT_ID غير مهيأ',
                    branches: []
                };
            } else {
                const gitlab = await gitlabRequest(
                    'GET',
                    `/projects/${encodeURIComponent(GITLAB_PROJECT_ID)}/repository/branches?per_page=${perPage}`
                );
                data.gitlab = gitlab.data.map((branch) => ({
                    name: branch.name,
                    protected: !!branch.protected,
                    default: !!branch.default,
                    merged: !!branch.merged,
                    commitSha: branch.commit ? branch.commit.id : null
                }));
            }
        }

        return successResponse(res, 'Branches fetched successfully', data);
    } catch (error) {
        return errorResponse(res, error.message || 'Failed to fetch branches', error.data || null, error.statusCode || 500);
    }
});

router.get('/activity', async (req, res) => {
    try {
        const source = (req.query.source || 'all').toLowerCase();
        const perPage = Number.parseInt(req.query.limit, 10) || 10;
        const branch = req.query.branch || GITHUB_DEFAULT_BRANCH;
        const data = {};

        if (source === 'github' || source === 'all') {
            const github = await githubRequest(
                'GET',
                `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/commits?sha=${encodeURIComponent(branch)}&per_page=${perPage}`
            );
            data.github = github.data.map((commit) => ({
                sha: commit.sha,
                author: commit.commit && commit.commit.author ? commit.commit.author.name : 'unknown',
                message: commit.commit ? commit.commit.message : '',
                date: commit.commit && commit.commit.author ? commit.commit.author.date : null,
                url: commit.html_url
            }));
        }

        if (source === 'gitlab' || source === 'all') {
            if (!GITLAB_PROJECT_ID) {
                data.gitlab = {
                    warning: 'GITLAB_PROJECT_ID غير مهيأ',
                    commits: []
                };
            } else {
                const gitlab = await gitlabRequest(
                    'GET',
                    `/projects/${encodeURIComponent(GITLAB_PROJECT_ID)}/repository/commits?ref_name=${encodeURIComponent(GITLAB_DEFAULT_BRANCH)}&per_page=${perPage}`
                );
                data.gitlab = gitlab.data.map((commit) => ({
                    sha: commit.id,
                    author: commit.author_name,
                    message: commit.title || commit.message,
                    date: commit.committed_date,
                    url: commit.web_url
                }));
            }
        }

        return successResponse(res, 'Activity fetched successfully', data);
    } catch (error) {
        return errorResponse(res, error.message || 'Failed to fetch activity', error.data || null, error.statusCode || 500);
    }
});

router.get('/report', async (req, res) => {
    try {
        const [statusResult, branchesResult, activityResult] = await Promise.all([
            githubRequest('GET', `/repos/${GITHUB_OWNER}/${GITHUB_REPO}`),
            githubRequest('GET', `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/branches?per_page=100`),
            githubRequest('GET', `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/commits?sha=${encodeURIComponent(GITHUB_DEFAULT_BRANCH)}&per_page=5`)
        ]);

        const report = {
            github: {
                repository: {
                    name: statusResult.data.full_name,
                    defaultBranch: statusResult.data.default_branch,
                    pushedAt: statusResult.data.pushed_at,
                    openIssues: statusResult.data.open_issues_count
                },
                branchHealth: {
                    total: branchesResult.data.length,
                    protected: branchesResult.data.filter((branch) => branch.protected).length,
                    defaultExists: branchesResult.data.some((branch) => branch.name === GITHUB_DEFAULT_BRANCH)
                },
                recentActivity: activityResult.data.map((commit) => ({
                    sha: commit.sha,
                    author: commit.commit && commit.commit.author ? commit.commit.author.name : 'unknown',
                    date: commit.commit && commit.commit.author ? commit.commit.author.date : null,
                    message: commit.commit ? commit.commit.message : ''
                }))
            },
            gitlab: {
                configured: !!GITLAB_PROJECT_ID,
                tokenConfigured: HAS_VALID_GITLAB_TOKEN
            },
            syncState: {
                githubReady: HAS_VALID_GITHUB_TOKEN,
                gitlabReady: !!GITLAB_PROJECT_ID && HAS_VALID_GITLAB_TOKEN,
                mode: !!GITLAB_PROJECT_ID && HAS_VALID_GITLAB_TOKEN ? 'dual' : 'github-only'
            }
        };

        return successResponse(res, 'Unified git report generated', report);
    } catch (error) {
        return errorResponse(res, error.message || 'Failed to generate git report', error.data || null, error.statusCode || 500);
    }
});

router.post('/sync', async (req, res) => {
    try {
        const dryRun = req.body.dryRun !== false;
        const target = (req.body.target || 'github-gitlab').toLowerCase();

        const plan = {
            target,
            dryRun,
            steps: [
                'فحص branch health على GitHub',
                'فحص branch health على GitLab',
                'مقارنة latest commit لكل فرع رئيسي',
                'إنشاء تقرير تعارضات قبل الدمج',
                'تفعيل مزامنة آمنة بعد التحقق'
            ],
            commands: [
                'git fetch --all --prune',
                'git branch -vv',
                'git log --oneline --decorate -n 20',
                'git remote -v'
            ]
        };

        sheikhaRealtimeHub.emitEvent('git.sync.requested', {
            target,
            dryRun,
            source: 'api'
        });

        return successResponse(
            res,
            dryRun ? 'Sync dry-run plan generated' : 'Sync request accepted',
            plan,
            dryRun ? 200 : 202
        );
    } catch (error) {
        return errorResponse(res, error.message || 'Failed to build sync plan', error.data || null, error.statusCode || 500);
    }
});

router.post('/validate', async (req, res) => {
    try {
        const checks = {
            github: {
                tokenConfigured: HAS_VALID_GITHUB_TOKEN,
                ownerConfigured: !!GITHUB_OWNER,
                repoConfigured: !!GITHUB_REPO,
                defaultBranch: GITHUB_DEFAULT_BRANCH
            },
            gitlab: {
                tokenConfigured: HAS_VALID_GITLAB_TOKEN,
                projectConfigured: !!GITLAB_PROJECT_ID,
                defaultBranch: GITLAB_DEFAULT_BRANCH
            }
        };

        let githubApiReachable = false;
        let gitlabApiReachable = false;

        try {
            await githubRequest('GET', `/repos/${GITHUB_OWNER}/${GITHUB_REPO}`);
            githubApiReachable = true;
        } catch (_) {
            githubApiReachable = false;
        }

        if (GITLAB_PROJECT_ID) {
            try {
                await gitlabRequest('GET', `/projects/${encodeURIComponent(GITLAB_PROJECT_ID)}`);
                gitlabApiReachable = true;
            } catch (_) {
                gitlabApiReachable = false;
            }
        }

        checks.github.apiReachable = githubApiReachable;
        checks.gitlab.apiReachable = gitlabApiReachable;

        const ready = githubApiReachable || gitlabApiReachable;

        return successResponse(res, ready ? 'Git validation completed' : 'Git validation failed', {
            ready,
            checks
        }, ready ? 200 : 400);
    } catch (error) {
        return errorResponse(res, error.message || 'Failed to validate git integration', error.data || null, error.statusCode || 500);
    }
});

module.exports = router;
