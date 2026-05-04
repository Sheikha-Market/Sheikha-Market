/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║   SHEIKHA GITHUB SIRN INTEGRATION                                           ║
 * ║   تكامل SIRN/IFL مع VS Code + GitHub Copilot + GitHub Systems               ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * ﴿بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ﴾
 *
 * ── مرقّمة بالكتاب والسنة ووحدها لله ──
 *
 * ١. ﴿وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ﴾ — الأنفال: ٦٠
 *    [INTEGRATION] الاستعداد الكامل للتكامل مع أنظمة التطوير العالمية
 *
 * ٢. ﴿وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ﴾ — المائدة: ٢
 *    [COLLAB] التعاون مع GitHub Copilot وباقي الأنظمة للخير
 *
 * ٣. ﴿وَشَاوِرْهُمْ فِي الْأَمْرِ﴾ — آل عمران: ١٥٩
 *    [COPILOT] Copilot كمستشار برمجي — المستخدم يقرر دائماً
 *
 * ٤. ﴿إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ إِلَىٰ أَهْلِهَا﴾ — النساء: ٥٨
 *    [TRUST] أمانة البيانات — لا تسريب للأسرار والمفاتيح
 *
 * ٥. ﴿صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ﴾ — النمل: ٨٨
 *    [ITQAN] إتقان كل نقطة تكامل في الشبكة
 *
 * ٦. «المسلم أخو المسلم» — البخاري
 *    [COMMUNITY] شبكة المطورين المسلمين — تكامل وتعاون ومشاركة
 *
 * ──────────────────────────────────────────────────────────────────────────────
 * أنظمة التكامل:
 *
 * ① VS Code Extension (sheikha-copilot)
 *    - أوامر SIRN في Command Palette
 *    - اقتراحات IFL في IntelliSense
 *    - تحليل SIRN للكود المحدد
 *    - شريط حالة SIRN في أسفل الشاشة
 *
 * ② GitHub Copilot
 *    - تعليمات SIRN في copilot-instructions.md
 *    - ربط SIRN بـ Copilot Chat
 *    - إضافة سياق IFL لاقتراحات Copilot
 *    - توجيه Copilot نحو الوظائف الصحيحة
 *
 * ③ GitHub Systems (Actions + API)
 *    - GitHub Actions workflow لـ SIRN
 *    - تحليل PR باستخدام SIRN/IFL
 *    - تعليقات تلقائية بالمراجع الشرعية
 *    - تصنيف Issues حسب نطاقات IFL
 *
 * ④ GitHub MCP (Model Context Protocol)
 *    - SIRN كـ MCP Tool
 *    - IFL functions كـ MCP Resources
 *    - إتاحة SIRN لكل الـ AI Agents
 *
 * @module sheikha-github-sirn-integration
 * @version 1.0.0
 * @tawheed لا إله إلا الله محمد رسول الله
 * @bismillah بسم الله الرحمن الرحيم
 */

'use strict';

const EventEmitter = require('events');

// ─── استيراد SIRN-IFL Layer ───────────────────────────────────────────────────
let _sirnIflLayer = null;
try {
    _sirnIflLayer = require('../core/sheikha-sirn-ifl-layer');
} catch (err) {
    console.warn('[GITHUB-SIRN] ⚠️  sirn-ifl-layer غير متاح:', err.message);
}

let _sirnEngine = null;
try {
    _sirnEngine = require('./sheikha-sirn-engine');
} catch (err) {
    console.warn('[GITHUB-SIRN] ⚠️  sirn-engine غير متاح:', err.message);
}

// ─── ثوابت ───────────────────────────────────────────────────────────────────
const TAWHEED   = 'لا إله إلا الله محمد رسول الله';
const BISMILLAH = 'بسم الله الرحمن الرحيم';
const VERSION   = '1.0.0';

// ═══════════════════════════════════════════════════════════════════════════════
// القسم الأول: VS Code Integration Bridge
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * جسر تكامل VS Code — يوفر واجهة لـ extension.js
 * ﴿وَشَاوِرْهُمْ فِي الْأَمْرِ﴾ — آل عمران: ١٥٩
 */
const VSCodeBridge = {

    /**
     * تحليل SIRN للكود المحدد في المحرر
     * @param {string} selectedCode — الكود المحدد
     * @param {string} language — لغة البرمجة
     * @returns {Promise<object>}
     */
    async analyzeSelection(selectedCode, language = 'javascript') {
        if (!_sirnIflLayer) {
            return { ok: false, error: 'SIRN-IFL Layer غير متاح' };
        }
        return _sirnIflLayer.process({
            query:  `تحليل كود ${language}: ${selectedCode.slice(0, 500)}`,
            domain: 'SOFTWARE',
            data:   { code: selectedCode, language },
        });
    },

    /**
     * اقتراحات IFL للموضع الحالي في الكود
     * @param {string} context — سياق الكود
     * @param {string} language
     * @returns {Promise<object>}
     */
    async getIFLSuggestions(context, language = 'javascript') {
        if (!_sirnIflLayer) return { ok: false, suggestions: [] };

        const result = await _sirnIflLayer.process({
            query:  context.slice(0, 300),
            domain: 'SOFTWARE',
            data:   { context, language },
        });

        if (!result.ok) return { ok: false, suggestions: [] };

        return {
            ok:          true,
            domain:      result.routing?.domain,
            iflId:       result.routing?.iflId,
            confidence:  result.routing?.confidence,
            suggestions: this._buildSuggestions(result),
            quranRef:    result.sirn?.quranRef,
        };
    },

    /**
     * بناء اقتراحات VS Code من نتيجة SIRN
     * @private
     */
    _buildSuggestions(sirnResult) {
        const suggestions = [];
        const domain = sirnResult.routing?.domain;

        const domainSuggestions = {
            SOFTWARE:     ['// تحديد المميزة التفاعلية', '// iFL: ربط المتطلبات بالتنفيذ'],
            MEDICAL:      ['// رصد الوظائف الحيوية', '// IFL Online: مراقبة صحية'],
            ENVIRONMENTAL:['// تحليل البيانات البيئية', '// IFL ENV: رصد الغابات'],
            CHEMICAL:     ['// حساب الجرعات الكيميائية', '// IFL Regimen: بروتوكول العلاج'],
            TRADE:        ['// التحقق من الامتثال الشرعي', '// حساب الزكاة'],
            SHARIA:       ['// فحص الحلال والحرام', '// استشارة شرعية'],
        };

        const list = domainSuggestions[domain] || [];
        for (const s of list) {
            suggestions.push({ text: s, domain, source: 'Sheikha SIRN' });
        }

        return suggestions;
    },

    /**
     * إنتاج HTML لحالة SIRN في Status Bar
     * @returns {object}
     */
    getStatusBarItem() {
        const sirn = _sirnEngine ? _sirnEngine.getInstance() : null;
        const stats = sirn ? sirn.status().stats : {};

        return {
            text:     `⚡ SIRN: ${stats.classified || 0} استدلال`,
            tooltip:  `Sheikha SIRN Engine — ${TAWHEED}`,
            command:  'sheikha.sirnStatus',
        };
    },
};

// ═══════════════════════════════════════════════════════════════════════════════
// القسم الثاني: GitHub Copilot Integration
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * تكامل GitHub Copilot مع SIRN
 * ﴿وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ﴾ — المائدة: ٢
 */
const CopilotIntegration = {

    /**
     * إنتاج سياق SIRN لإضافته لـ Copilot Chat
     * @param {string} userMessage — رسالة المستخدم
     * @returns {Promise<object>}
     */
    async buildCopilotContext(userMessage) {
        if (!_sirnIflLayer) {
            return { context: '', sirnDomain: null };
        }

        const sirnResult = _sirnIflLayer.infer(userMessage);

        if (!sirnResult.ok) {
            return { context: '', sirnDomain: null };
        }

        const contextLines = [
            `// Sheikha SIRN Analysis:`,
            `// Domain: ${sirnResult.domain} (IFL: ${sirnResult.iflDomain})`,
            `// Confidence: ${(sirnResult.confidence * 100).toFixed(1)}%`,
            `// ${sirnResult.quranRef}`,
            `// شريعة: ${sirnResult.shariaCompliant ? '✅ متوافق' : '⚠️ تحقق مطلوب'}`,
        ];

        return {
            context:     contextLines.join('\n'),
            sirnDomain:  sirnResult.domain,
            iflId:       sirnResult.iflId,
            confidence:  sirnResult.confidence,
            quranRef:    sirnResult.quranRef,
        };
    },

    /**
     * تعليمات SIRN الديناميكية للـ Copilot
     * @returns {string}
     */
    generateCopilotInstructions() {
        const sirn = _sirnEngine ? _sirnEngine.getInstance() : null;
        const domains = sirn ? Object.keys(sirn.status().domains || {}) : [];

        return [
            '## Sheikha SIRN Context',
            '',
            'When generating code for this project, use SIRN semantic routing:',
            '',
            '### Active IFL Domains:',
            '- [3] ENVIRONMENTAL: Forest/climate analysis → use IFL-F-003/004',
            '- [4] SOFTWARE: Feature location → use IFL-F-005/006',
            '- [5] MEDICAL: Vital functions → use IFL-F-007/008',
            '- [6] CHEMICAL: IFL Regimen → use IFL-F-009/010',
            '- [7] TRADE: Islamic commerce → use IFL-F-011/012',
            '',
            '### SIRN API Usage:',
            '```javascript',
            "const sirnIfl = require('./core/sheikha-sirn-ifl-layer');",
            "const result = await sirnIfl.process({ query: 'your query', data: {} });",
            '```',
            '',
            '### Sharia Rules:',
            '- No riba (ربا), gharar (غرر), or gambling in any function',
            '- All outputs must reference Quran/Sunnah where applicable',
            '- Arabic RTL for all user-facing strings',
        ].join('\n');
    },
};

// ═══════════════════════════════════════════════════════════════════════════════
// القسم الثالث: GitHub Systems Integration (Actions + API)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * تكامل GitHub Actions وAPI مع SIRN
 * ﴿وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ﴾ — الأنفال: ٦٠
 */
const GitHubSystemsIntegration = {

    /**
     * تحليل Pull Request باستخدام SIRN
     * @param {object} pr — { title, body, files, diff }
     * @returns {Promise<object>}
     */
    async analyzePR(pr = {}) {
        if (!_sirnIflLayer) {
            return { ok: false, error: 'SIRN غير متاح' };
        }

        const prText = `${pr.title || ''} ${pr.body || ''} ${(pr.files || []).join(' ')}`;

        const sirnResult = _sirnIflLayer.infer(prText);

        const analysis = {
            ok:          true,
            prTitle:     pr.title,
            sirnDomain:  sirnResult.domain,
            iflDomain:   sirnResult.iflDomain,
            confidence:  sirnResult.confidence,
            shariaCheck: sirnResult.shariaCompliant,
            reviewLabel: this._getPRLabel(sirnResult.domain),
            comment:     this._buildPRComment(sirnResult),
            timestamp:   new Date().toISOString(),
        };

        return analysis;
    },

    /**
     * تصنيف GitHub Issue حسب نطاقات IFL
     * @param {object} issue — { title, body }
     * @returns {object}
     */
    classifyIssue(issue = {}) {
        if (!_sirnIflLayer) return { ok: false };

        const text = `${issue.title || ''} ${issue.body || ''}`;
        const sirnResult = _sirnIflLayer.infer(text);

        return {
            ok:      true,
            labels:  [
                `sirn:${(sirnResult.domain || 'general').toLowerCase()}`,
                `ifl:${(sirnResult.iflDomain || 'unknown').toLowerCase()}`,
                sirnResult.shariaCompliant ? 'sharia:compliant' : 'sharia:review-needed',
            ],
            domain:  sirnResult.domain,
            quranRef: sirnResult.quranRef,
        };
    },

    /**
     * إنتاج تقرير SIRN لـ GitHub Actions
     * @param {object} context — سياق الـ workflow
     * @returns {object}
     */
    generateWorkflowReport(context = {}) {
        const sirn = _sirnEngine ? _sirnEngine.getInstance() : null;
        const stats = sirn ? sirn.status() : null;

        return {
            bismillah:  BISMILLAH,
            tawheed:    TAWHEED,
            timestamp:  new Date().toISOString(),
            workflow:   context.workflow || 'unknown',
            sirn: stats ? {
                version:    stats.version,
                cells:      stats.architecture?.totalCells,
                layers:     stats.architecture?.layers,
                embedDim:   stats.architecture?.embedDim,
                queries:    stats.stats?.queries,
                classified: stats.stats?.classified,
            } : null,
            quranRef:   '﴿صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ﴾ — النمل: ٨٨',
        };
    },

    /** تحديد label مناسب للـ PR حسب النطاق */
    _getPRLabel(domain) {
        const labels = {
            SOFTWARE:     'domain:software',
            MEDICAL:      'domain:medical',
            ENVIRONMENTAL:'domain:environmental',
            CHEMICAL:     'domain:chemical',
            TRADE:        'domain:trade',
            SHARIA:       'domain:sharia',
            KNOWLEDGE:    'domain:knowledge',
            GOVERNANCE:   'domain:governance',
            SECURITY:     'domain:security',
        };
        return labels[domain] || 'domain:general';
    },

    /** بناء تعليق على الـ PR */
    _buildPRComment(sirnResult) {
        return [
            '### 🧠 Sheikha SIRN Analysis',
            '',
            `**النطاق الدلالي:** ${sirnResult.domain || 'عام'}`,
            `**IFL Domain:** ${sirnResult.iflDomain || 'N/A'}`,
            `**مستوى الثقة:** ${((sirnResult.confidence || 0) * 100).toFixed(1)}%`,
            `**التوافق الشرعي:** ${sirnResult.shariaCompliant ? '✅ متوافق' : '⚠️ يحتاج مراجعة'}`,
            '',
            `> ${sirnResult.quranRef || '﴿صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ﴾'}`,
            '',
            `*${TAWHEED}*`,
        ].join('\n');
    },
};

// ═══════════════════════════════════════════════════════════════════════════════
// القسم الرابع: MCP (Model Context Protocol) Integration
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * SIRN كـ MCP Tool — يتيح استخدام SIRN من أي AI Agent
 * ﴿وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ﴾ — المائدة: ٢
 */
const MCPIntegration = {

    /** تعريف SIRN كـ MCP Tool */
    getMCPToolDefinition() {
        return {
            name:        'sheikha_sirn_analyze',
            description: 'Semantic analysis using Sheikha SIRN — classify text into Islamic/IFL domains',
            inputSchema: {
                type:       'object',
                properties: {
                    text:   { type: 'string', description: 'Text to analyze' },
                    domain: { type: 'string', description: 'Optional explicit domain' },
                },
                required: ['text'],
            },
        };
    },

    /** تعريف IFL Functions كـ MCP Resources */
    getMCPResourceDefinitions() {
        return [
            {
                uri:         'sheikha://ifl/domains',
                name:        'IFL Domains',
                description: 'List of IFL domains (ENV, SOFT, MED, CHEM, TRADE)',
                mimeType:    'application/json',
            },
            {
                uri:         'sheikha://ifl/functions',
                name:        'IFL Functions',
                description: 'Interactive Functions List — all registered functions',
                mimeType:    'application/json',
            },
            {
                uri:         'sheikha://sirn/status',
                name:        'SIRN Status',
                description: 'Current SIRN engine status and statistics',
                mimeType:    'application/json',
            },
        ];
    },

    /**
     * تنفيذ MCP Tool Call
     * @param {string} toolName
     * @param {object} args
     * @returns {Promise<object>}
     */
    async executeMCPTool(toolName, args = {}) {
        if (toolName !== 'sheikha_sirn_analyze') {
            return { error: `أداة غير معروفة: ${toolName}` };
        }

        if (!_sirnIflLayer) {
            return { error: 'SIRN-IFL Layer غير متاح' };
        }

        const result = await _sirnIflLayer.process({
            query:  args.text,
            domain: args.domain,
        });

        return {
            content: [{
                type: 'text',
                text: JSON.stringify({
                    domain:     result.routing?.domain,
                    iflId:      result.routing?.iflId,
                    confidence: result.routing?.confidence,
                    sharia:     result.sirn?.shariaCompliant,
                    quranRef:   result.sirn?.quranRef,
                    tawheed:    TAWHEED,
                }, null, 2),
            }],
        };
    },
};

// ═══════════════════════════════════════════════════════════════════════════════
// القسم الخامس: API Endpoints لتكامل الأنظمة الخارجية
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * تسجيل endpoints SIRN في Express server
 * @param {object} app — Express app
 * @param {object} options — { prefix }
 */
function registerAPIEndpoints(app, options = {}) {
    const prefix = options.prefix || '/api/sirn';

    // POST /api/sirn/infer — استدلال SIRN
    app.post(`${prefix}/infer`, async (req, res) => {
        try {
            const { text, query, data } = req.body || {};
            if (!text && !query) {
                return res.status(400).json({
                    success: false, message: 'text أو query مطلوب', timestamp: new Date().toISOString(),
                });
            }
            const result = _sirnIflLayer
                ? _sirnIflLayer.infer(text || query)
                : { ok: false, error: 'SIRN غير متاح' };

            res.json({ success: result.ok, data: result, timestamp: new Date().toISOString() });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message, timestamp: new Date().toISOString() });
        }
    });

    // POST /api/sirn/process — معالجة كاملة SIRN→IFL→IDA
    app.post(`${prefix}/process`, async (req, res) => {
        try {
            const result = _sirnIflLayer
                ? await _sirnIflLayer.process(req.body || {})
                : { ok: false, error: 'SIRN غير متاح' };

            res.json({ success: result.ok, data: result, timestamp: new Date().toISOString() });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message, timestamp: new Date().toISOString() });
        }
    });

    // GET /api/sirn/status — حالة SIRN
    app.get(`${prefix}/status`, (req, res) => {
        const st = _sirnIflLayer ? _sirnIflLayer.status() : { ready: false };
        res.json({ success: true, data: st, timestamp: new Date().toISOString() });
    });

    // GET /api/sirn/domains — نطاقات SIRN
    app.get(`${prefix}/domains`, (req, res) => {
        const domains = _sirnIflLayer ? _sirnIflLayer.listDomains() : [];
        res.json({ success: true, data: domains, timestamp: new Date().toISOString() });
    });

    // POST /api/sirn/github/analyze-pr — تحليل PR
    app.post(`${prefix}/github/analyze-pr`, async (req, res) => {
        try {
            const result = await GitHubSystemsIntegration.analyzePR(req.body || {});
            res.json({ success: result.ok, data: result, timestamp: new Date().toISOString() });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message, timestamp: new Date().toISOString() });
        }
    });

    // POST /api/sirn/github/classify-issue — تصنيف Issue
    app.post(`${prefix}/github/classify-issue`, (req, res) => {
        const result = GitHubSystemsIntegration.classifyIssue(req.body || {});
        res.json({ success: result.ok, data: result, timestamp: new Date().toISOString() });
    });

    // POST /api/sirn/vscode/analyze — تحليل كود VS Code
    app.post(`${prefix}/vscode/analyze`, async (req, res) => {
        try {
            const { code, language } = req.body || {};
            const result = await VSCodeBridge.analyzeSelection(code || '', language);
            res.json({ success: result.ok, data: result, timestamp: new Date().toISOString() });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message, timestamp: new Date().toISOString() });
        }
    });

    // POST /api/sirn/copilot/context — سياق Copilot
    app.post(`${prefix}/copilot/context`, async (req, res) => {
        try {
            const { message } = req.body || {};
            const result = await CopilotIntegration.buildCopilotContext(message || '');
            res.json({ success: true, data: result, timestamp: new Date().toISOString() });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message, timestamp: new Date().toISOString() });
        }
    });

    // POST /api/sirn/mcp/tool — تنفيذ MCP Tool
    app.post(`${prefix}/mcp/tool`, async (req, res) => {
        try {
            const { name, args } = req.body || {};
            const result = await MCPIntegration.executeMCPTool(name, args || {});
            res.json({ success: !result.error, data: result, timestamp: new Date().toISOString() });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message, timestamp: new Date().toISOString() });
        }
    });

    console.log(`[GITHUB-SIRN] 📡 API endpoints مسجّلة على: ${prefix}/*`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// القسم السادس: حالة التكامل الشاملة
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * حالة جميع التكاملات
 * @returns {object}
 */
function status() {
    return {
        name:       'Sheikha GitHub SIRN Integration',
        nameAr:     'تكامل SIRN مع GitHub وVS Code وCopilot',
        version:    VERSION,
        bismillah:  BISMILLAH,
        tawheed:    TAWHEED,
        integrations: {
            vscode:  { available: true,  description: 'VS Code Extension + SIRN Commands' },
            copilot: { available: true,  description: 'GitHub Copilot Context + Instructions' },
            github:  { available: true,  description: 'GitHub Actions + PR Analysis + Issue Labels' },
            mcp:     { available: true,  description: 'Model Context Protocol Tools + Resources' },
            api:     { available: true,  description: 'REST API Endpoints /api/sirn/*' },
        },
        sirnReady:   !!_sirnIflLayer,
        quranRef:    '﴿وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ﴾ — الأنفال: ٦٠',
        timestamp:   new Date().toISOString(),
    };
}

// ─── تصدير ───────────────────────────────────────────────────────────────────

module.exports = {
    VSCodeBridge,
    CopilotIntegration,
    GitHubSystemsIntegration,
    MCPIntegration,
    registerAPIEndpoints,
    status,
    TAWHEED,
    BISMILLAH,
    VERSION,
};
