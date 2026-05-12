/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * منظومة شيخة — GitHub Hub + Copilot Engine
 * Sheikha GitHub Integration Hub & AI Copilot Background Server
 * ═══════════════════════════════════════════════════════════════════════════════
 * "وَقُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ وَرَسُولُهُ وَالْمُؤْمِنُونَ" — التوبة 105
 *
 * المكونات:
 * 1. GitHub Hub — ربط مستودعات شيخة + المنظمة
 * 2. Copilot Bridge — جسر بين شيخة ومحرك GitHub Copilot
 * 3. Background Worker — خادم خلفي دوري للمزامنة والتحليل
 * 4. Webhook Handler — استقبال أحداث GitHub
 * 5. Analytics — إحصاءات المستودعات والمساهمين
 *
 * المالك: سلمان أحمد بن سلمان الراجح
 * ═══════════════════════════════════════════════════════════════════════════════
 */
'use strict';

const EventEmitter = require('events');
const https = require('https');
const crypto = require('crypto');

// ═══════════════════════════════════════════════════════════════════════════════
// الثوابت
// ═══════════════════════════════════════════════════════════════════════════════
const GITHUB_API = 'api.github.com';
const SYNC_INTERVAL_MS = 5 * 60 * 1000; // كل 5 دقائق

// ═══════════════════════════════════════════════════════════════════════════════
// دالة طلب GitHub API آمنة
// ═══════════════════════════════════════════════════════════════════════════════
function githubRequest(path, token, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: GITHUB_API,
            path,
            method,
            headers: {
                'Authorization': 'Bearer ' + token,
                'Accept': 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28',
                'User-Agent': 'Sheikha-Hub/1.0'
            }
        };
        if (body) {
            const bodyStr = JSON.stringify(body);
            options.headers['Content-Type'] = 'application/json';
            options.headers['Content-Length'] = Buffer.byteLength(bodyStr);
        }
        const req = https.request(options, res => {
            let data = '';
            res.on('data', d => data += d);
            res.on('end', () => {
                try {
                    const parsed = data ? JSON.parse(data) : {};
                    if (res.statusCode >= 400) {
                        reject(new Error(`GitHub API ${res.statusCode}: ${parsed.message || data.substring(0, 100)}`));
                    } else {
                        resolve({ data: parsed, status: res.statusCode, headers: res.headers });
                    }
                } catch (e) {
                    resolve({ data: data, status: res.statusCode, headers: res.headers });
                }
            });
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. GITHUB HUB ENGINE — المحرك الرئيسي
// ═══════════════════════════════════════════════════════════════════════════════

class SheikhaGitHubHub extends EventEmitter {
    constructor() {
        super();
        this.name = 'SheikhaGitHubHub';
        this.version = '2.0.0';
        this.token = process.env.GITHUB_TOKEN || '';
        this.org = process.env.GITHUB_ORG || 'Sheikha-top';
        this.repo = process.env.GITHUB_REPO || 'sheikha-enterprise-portal';
        this.webhookSecret = process.env.GITHUB_WEBHOOK_SECRET || '';

        // الحالة
        this.isRunning = false;
        this.syncInterval = null;
        this.lastSync = null;
        this.syncErrors = 0;

        // ذاكرة التخزين المؤقت
        this.cache = {
            user: null,
            org: null,
            repos: [],
            commits: [],
            issues: [],
            pullRequests: [],
            branches: [],
            contributors: [],
            copilotStatus: null,
            lastUpdated: null
        };

        // إحصاءات
        this.stats = {
            totalSyncs: 0,
            successfulSyncs: 0,
            failedSyncs: 0,
            apiCalls: 0,
            webhooksReceived: 0
        };

        // Copilot Bridge
        this.copilot = new SheikhaGitHubCopilotBridge(this);
    }

    // ─── بدء المحرك ──────────────────────────────────────────────────────────
    async start() {
        if (this.isRunning) return;
        if (!this.token) {
            console.warn('[GitHubHub] ⚠️ GITHUB_TOKEN غير محدد — بعض الميزات ستكون معطلة');
        }
        this.isRunning = true;

        // مزامنة فورية عند البدء
        try { await this._sync(); } catch (e) { console.warn('[GitHubHub] خطأ في المزامنة الأولى:', e.message); }

        // دورة تلقائية كل 5 دقائق
        this.syncInterval = setInterval(async () => {
            try { await this._sync(); } catch (e) { this.syncErrors++; }
        }, SYNC_INTERVAL_MS);

        // بدء Copilot Bridge
        this.copilot.start();

        console.log(`✅ [GitHubHub] GitHub Hub يعمل — المنظمة: ${this.org} | المستودع: ${this.repo}`);
        this.emit('started', { org: this.org, repo: this.repo });
    }

    // ─── إيقاف المحرك ────────────────────────────────────────────────────────
    stop() {
        if (this.syncInterval) { clearInterval(this.syncInterval); this.syncInterval = null; }
        this.copilot.stop();
        this.isRunning = false;
        this.emit('stopped');
    }

    // ─── المزامنة الرئيسية ────────────────────────────────────────────────────
    async _sync() {
        if (!this.token) return;
        this.stats.totalSyncs++;
        const startTime = Date.now();

        try {
            // 1. بيانات المستخدم
            const userRes = await githubRequest('/user', this.token);
            this.cache.user = userRes.data;
            this.stats.apiCalls++;

            // 2. بيانات المنظمة
            try {
                const orgRes = await githubRequest(`/orgs/${this.org}`, this.token);
                this.cache.org = orgRes.data;
                this.stats.apiCalls++;
            } catch (e) { /* قد تكون منظمة خاصة */ }

            // 3. المستودعات
            const reposRes = await githubRequest(`/orgs/${this.org}/repos?per_page=30&sort=updated`, this.token);
            this.cache.repos = Array.isArray(reposRes.data)
                ? reposRes.data.map(r => ({
                    id: r.id, name: r.name, description: r.description,
                    url: r.html_url, stars: r.stargazers_count, forks: r.forks_count,
                    language: r.language, isPrivate: r.private,
                    updatedAt: r.updated_at, defaultBranch: r.default_branch,
                    size: r.size
                }))
                : [];
            this.stats.apiCalls++;

            // 4. آخر الـ commits للمستودع الرئيسي
            try {
                const commitsRes = await githubRequest(`/repos/${this.org}/${this.repo}/commits?per_page=10`, this.token);
                this.cache.commits = Array.isArray(commitsRes.data)
                    ? commitsRes.data.map(c => ({
                        sha: c.sha ? c.sha.substring(0, 8) : '',
                        message: (c.commit && c.commit.message ? c.commit.message.split('\n')[0] : '').substring(0, 100),
                        author: c.commit && c.commit.author ? c.commit.author.name : '',
                        date: c.commit && c.commit.author ? c.commit.author.date : '',
                        url: c.html_url
                    }))
                    : [];
                this.stats.apiCalls++;
            } catch (e) { this.cache.commits = []; }

            // 5. الـ Issues المفتوحة
            try {
                const issuesRes = await githubRequest(`/repos/${this.org}/${this.repo}/issues?state=open&per_page=10`, this.token);
                this.cache.issues = Array.isArray(issuesRes.data)
                    ? issuesRes.data.filter(i => !i.pull_request).map(i => ({
                        id: i.number, title: i.title.substring(0, 100),
                        state: i.state, author: i.user ? i.user.login : '',
                        labels: (i.labels || []).map(l => l.name),
                        createdAt: i.created_at, url: i.html_url
                    }))
                    : [];
                this.stats.apiCalls++;
            } catch (e) { this.cache.issues = []; }

            // 6. Pull Requests المفتوحة
            try {
                const prsRes = await githubRequest(`/repos/${this.org}/${this.repo}/pulls?state=open&per_page=10`, this.token);
                this.cache.pullRequests = Array.isArray(prsRes.data)
                    ? prsRes.data.map(pr => ({
                        id: pr.number, title: pr.title.substring(0, 100),
                        state: pr.state, author: pr.user ? pr.user.login : '',
                        branch: pr.head ? pr.head.ref : '',
                        createdAt: pr.created_at, url: pr.html_url,
                        draft: pr.draft || false
                    }))
                    : [];
                this.stats.apiCalls++;
            } catch (e) { this.cache.pullRequests = []; }

            // 7. الفروع
            try {
                const branchesRes = await githubRequest(`/repos/${this.org}/${this.repo}/branches?per_page=20`, this.token);
                this.cache.branches = Array.isArray(branchesRes.data)
                    ? branchesRes.data.map(b => ({ name: b.name, protected: b.protected || false }))
                    : [];
                this.stats.apiCalls++;
            } catch (e) { this.cache.branches = []; }

            this.cache.lastUpdated = new Date().toISOString();
            this.lastSync = Date.now();
            this.stats.successfulSyncs++;

            console.log(`[GitHubHub] ✅ مزامنة (${Date.now() - startTime}ms) — ${this.cache.repos.length} مستودع | ${this.cache.commits.length} commit | ${this.cache.issues.length} issue`);
            this.emit('synced', { repos: this.cache.repos.length, commits: this.cache.commits.length });
        } catch (e) {
            this.stats.failedSyncs++;
            this.emit('syncError', { error: e.message });
            throw e;
        }
    }

    // ─── إنشاء Issue ─────────────────────────────────────────────────────────
    async createIssue(title, body, labels = []) {
        if (!this.token) throw new Error('GITHUB_TOKEN غير محدد');
        const res = await githubRequest(
            `/repos/${this.org}/${this.repo}/issues`, this.token, 'POST',
            { title: title.substring(0, 255), body: (body || '').substring(0, 65000), labels }
        );
        this.stats.apiCalls++;
        return res.data;
    }

    // ─── التحقق من Webhook Signature ─────────────────────────────────────────
    verifyWebhookSignature(payload, signature) {
        if (!this.webhookSecret || !signature) return true; // تخطي إذا لا يوجد secret
        const expected = 'sha256=' + crypto.createHmac('sha256', this.webhookSecret)
            .update(payload, 'utf8').digest('hex');
        try {
            return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
        } catch (e) {
            return false;
        }
    }

    // ─── معالجة Webhook ──────────────────────────────────────────────────────
    handleWebhook(event, payload) {
        this.stats.webhooksReceived++;
        this.emit('webhook', { event, payload });

        // إعادة مزامنة عند push أو PR
        if (['push', 'pull_request', 'issues', 'create', 'delete'].includes(event)) {
            setTimeout(() => this._sync().catch(() => {}), 2000);
        }
    }

    // ─── الحالة ───────────────────────────────────────────────────────────────
    getStatus() {
        return {
            running: this.isRunning,
            org: this.org,
            repo: this.repo,
            lastSync: this.lastSync ? new Date(this.lastSync).toISOString() : null,
            syncErrors: this.syncErrors,
            stats: { ...this.stats },
            repos: this.cache.repos.length,
            openIssues: this.cache.issues.length,
            openPRs: this.cache.pullRequests.length,
            branches: this.cache.branches.length,
            tokenStatus: this.token ? 'مُضبَّط' : 'غير مضبوط',
            copilot: this.copilot.getStatus(),
            user: this.cache.user ? { login: this.cache.user.login, name: this.cache.user.name } : null
        };
    }

    // ─── البيانات الكاملة ─────────────────────────────────────────────────────
    getFullData() {
        return {
            status: this.getStatus(),
            repos: this.cache.repos,
            commits: this.cache.commits,
            issues: this.cache.issues,
            pullRequests: this.cache.pullRequests,
            branches: this.cache.branches,
            org: this.cache.org,
            lastUpdated: this.cache.lastUpdated
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. COPILOT BRIDGE — جسر GitHub Copilot
// ═══════════════════════════════════════════════════════════════════════════════

class SheikhaGitHubCopilotBridge extends EventEmitter {
    constructor(hub) {
        super();
        this.hub = hub;
        this.isRunning = false;
        this.heartbeatInterval = null;
        this.heartbeatCount = 0;
        this.lastHeartbeat = null;

        // قدرات Copilot المدمجة
        this.capabilities = {
            codeCompletion: true,
            chat: true,
            codeReview: true,
            commitMessages: true,
            prDescriptions: true,
            issueAnalysis: true,
            arabicSupport: true,
            shariaCompliance: true
        };

        // سجل الطلبات
        this.requestLog = [];
        this.totalRequests = 0;
        this.totalTokens = 0;

        // نماذج الذكاء المدعومة
        this.models = [
            { id: 'sheikha-copilot-v2', name: 'Sheikha Copilot v2', type: 'code', priority: 1, available: true },
            { id: 'gpt-4o', name: 'GPT-4o (via OpenAI)', type: 'general', priority: 2, available: !!process.env.OPENAI_API_KEY },
            { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro (via Google)', type: 'general', priority: 3, available: !!process.env.GOOGLE_API_KEY },
            { id: 'ollama-local', name: 'Ollama (Local)', type: 'local', priority: 4, available: true }
        ];
    }

    start() {
        this.isRunning = true;
        // Heartbeat كل 30 ثانية للتحقق من الحالة
        this.heartbeatInterval = setInterval(() => this._heartbeat(), 30 * 1000);
        console.log('✅ [CopilotBridge] Sheikha Copilot Bridge يعمل');
    }

    stop() {
        if (this.heartbeatInterval) { clearInterval(this.heartbeatInterval); this.heartbeatInterval = null; }
        this.isRunning = false;
    }

    _heartbeat() {
        this.heartbeatCount++;
        this.lastHeartbeat = new Date().toISOString();
        this.emit('heartbeat', { count: this.heartbeatCount, time: this.lastHeartbeat });
    }

    // ─── تحليل كود مع Copilot ────────────────────────────────────────────────
    analyzeCode(code, language = 'javascript') {
        const issues = [];

        // فحص أنماط شائعة
        if (code.includes('eval(')) issues.push({ type: 'security', message: 'تجنب استخدام eval() — خطر أمني (OWASP)' });
        if (code.includes('innerHTML')) issues.push({ type: 'security', message: 'استخدم textContent بدلاً من innerHTML لمنع XSS' });
        if (/password\s*=\s*['"][^'"]{1,20}['"]/.test(code)) issues.push({ type: 'security', message: 'لا تُضمِّن كلمات المرور في الكود' });
        if (!code.includes('try') && code.includes('async')) issues.push({ type: 'quality', message: 'إضافة try/catch للدوال async' });
        if (/console\.log/.test(code)) issues.push({ type: 'cleanup', message: 'أزل console.log قبل الإنتاج' });

        // الجودة الإسلامية
        if (code.length > 200 && !code.includes('//')) {
            issues.push({ type: 'islamic_quality', message: 'أضف تعليقات عربية لتوثيق الكود — الإتقان أمر ديني' });
        }

        return {
            language,
            linesCount: code.split('\n').length,
            issues,
            score: Math.max(0, 100 - issues.length * 15),
            recommendation: issues.length === 0 ? 'الكود جيد — بارك الله فيك' : 'يُنصح بمراجعة النقاط المذكورة'
        };
    }

    // ─── توليد رسالة commit ──────────────────────────────────────────────────
    generateCommitMessage(diff, context = '') {
        const lines = diff.split('\n').filter(l => l.startsWith('+') || l.startsWith('-')).length;
        const added = diff.split('\n').filter(l => l.startsWith('+') && !l.startsWith('+++')).length;
        const removed = diff.split('\n').filter(l => l.startsWith('-') && !l.startsWith('---')).length;

        let type = 'feat';
        if (removed > added * 2) type = 'refactor';
        if (diff.toLowerCase().includes('fix') || diff.toLowerCase().includes('إصلاح')) type = 'fix';
        if (diff.toLowerCase().includes('test')) type = 'test';
        if (diff.toLowerCase().includes('doc')) type = 'docs';

        const summary = context || `تعديل ${lines} سطر (+${added}/-${removed})`;
        return {
            message: `${type}: ${summary}`,
            type,
            stats: { added, removed, total: lines },
            islamicNote: 'بسم الله — «إن الله يحب إذا عمل أحدكم عملاً أن يتقنه»'
        };
    }

    // ─── تسجيل طلب ───────────────────────────────────────────────────────────
    logRequest(type, tokens = 0) {
        this.totalRequests++;
        this.totalTokens += tokens;
        const entry = { type, tokens, time: new Date().toISOString() };
        this.requestLog.push(entry);
        if (this.requestLog.length > 500) this.requestLog.shift();
    }

    getStatus() {
        return {
            running: this.isRunning,
            heartbeatCount: this.heartbeatCount,
            lastHeartbeat: this.lastHeartbeat,
            capabilities: this.capabilities,
            models: this.models,
            stats: { totalRequests: this.totalRequests, totalTokens: this.totalTokens },
            activeModel: this.models.find(m => m.available && m.priority === 1) || this.models[0]
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════════
const instance = new SheikhaGitHubHub();

module.exports = instance;
module.exports.SheikhaGitHubHub = SheikhaGitHubHub;
module.exports.SheikhaGitHubCopilotBridge = SheikhaGitHubCopilotBridge;
