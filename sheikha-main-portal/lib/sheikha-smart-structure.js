'use strict';
/**
 * sheikha-smart-structure.js
 * العمود الثالث: الهياكل الذكية — هيكل رقمي + لوحات + مسارات + وكلاء + أصول
 * بسم الله الرحمن الرحيم
 */
const fs = require('fs');
const path = require('path');
const DATA_DIR = path.join(__dirname, '..', 'data');
const WF_FILE = path.join(DATA_DIR, 'smart-workflows.json');
const TWINS_FILE = path.join(DATA_DIR, 'smart-digital-twins.json');

class SheikhaSmartStructure {
    constructor() {
        this.name = 'sheikha-smart-structure';
        this.version = '1.1.0';

        this.digitalOrg = {
            sectors: [
                { id: 'tech', name: 'التقنية', departments: 8, head: null },
                { id: 'market', name: 'السوق', departments: 6, head: null },
                { id: 'sharia', name: 'الشريعة', departments: 4, head: null },
                { id: 'ops', name: 'العمليات', departments: 5, head: null },
                { id: 'finance', name: 'المالية', departments: 4, head: null },
                { id: 'marketing', name: 'التسويق', departments: 4, head: null },
                { id: 'legal', name: 'القانونية', departments: 3, head: null }
            ],
            totalDepartments: 34,
            totalEmployees: 197
        };

        this.agents = [
            { id: 'market-agent', name: 'وكيل السوق', role: 'مراقبة الأسعار والعرض والطلب', status: 'active' },
            { id: 'sharia-agent', name: 'وكيل الشريعة', role: 'فحص العمليات شرعياً', status: 'active' },
            { id: 'security-agent', name: 'وكيل الأمان', role: 'حماية المنظومة والكشف عن التهديدات', status: 'active' },
            { id: 'support-agent', name: 'وكيل الدعم', role: 'مساعدة التجار والمستخدمين', status: 'active' },
            { id: 'admin-agent', name: 'وكيل الأدمن', role: 'التبليغ والإشراف والتقارير', status: 'active' }
        ];

        this.workflowDefs = {
            register_trader: {
                name: 'تسجيل تاجر',
                steps: [
                    { id: 'kyc', name: 'التحقق من الهوية', auto: true },
                    { id: 'sharia', name: 'الفحص الشرعي', auto: true },
                    { id: 'approve', name: 'الموافقة', auto: false },
                    { id: 'activate', name: 'التفعيل', auto: true }
                ]
            },
            create_order: {
                name: 'إنشاء طلب',
                steps: [
                    { id: 'validate', name: 'التحقق', auto: true },
                    { id: 'price', name: 'التسعير', auto: true },
                    { id: 'contract', name: 'العقد', auto: true },
                    { id: 'pay', name: 'الدفع', auto: false },
                    { id: 'ship', name: 'الشحن', auto: true }
                ]
            },
            dispute: {
                name: 'نزاع',
                steps: [
                    { id: 'receive', name: 'استلام الشكوى', auto: true },
                    { id: 'analyze', name: 'تحليل', auto: true },
                    { id: 'judge', name: 'حكم ذكي', auto: true },
                    { id: 'resolve', name: 'الحل', auto: false }
                ]
            },
            register_company: {
                name: 'تسجيل شركة',
                steps: [
                    { id: 'docs', name: 'تحميل الوثائق', auto: false },
                    { id: 'verify', name: 'التحقق', auto: true },
                    { id: 'sharia', name: 'الفحص الشرعي', auto: true },
                    { id: 'approve', name: 'الموافقة', auto: false },
                    { id: 'activate', name: 'التفعيل', auto: true }
                ]
            },
            zakat_calc: {
                name: 'حساب الزكاة',
                steps: [
                    { id: 'inventory', name: 'جرد الأصول', auto: true },
                    { id: 'calc', name: 'الحساب الشرعي', auto: true },
                    { id: 'report', name: 'التقرير', auto: true }
                ]
            }
        };

        this.activeWorkflows = [];
        this.digitalTwins = new Map();
        this._loadPersisted();
    }

    _loadPersisted() {
        try {
            if (fs.existsSync(WF_FILE)) {
                this.activeWorkflows = JSON.parse(fs.readFileSync(WF_FILE, 'utf8'));
            }
        } catch (_) {}
        try {
            if (fs.existsSync(TWINS_FILE)) {
                const arr = JSON.parse(fs.readFileSync(TWINS_FILE, 'utf8'));
                for (const t of arr) this.digitalTwins.set(t.id, t);
            }
        } catch (_) {}
    }

    _persist() {
        try { fs.writeFileSync(WF_FILE, JSON.stringify(this.activeWorkflows, null, 2), 'utf8'); } catch (_) {}
        try {
            const arr = Array.from(this.digitalTwins.values());
            fs.writeFileSync(TWINS_FILE, JSON.stringify(arr, null, 2), 'utf8');
        } catch (_) {}
    }

    // ═══ 1. Digital Org ═══
    getOrg() {
        return {
            ...this.digitalOrg,
            agents: this.agents,
            activeWorkflows: this.activeWorkflows.length
        };
    }

    // ═══ 2. Smart Dashboard Generator ═══
    generateDashboard(role) {
        const ROLE_WIDGETS = {
            admin: {
                title: 'لوحة الأدمن الشاملة',
                widgets: [
                    'system-health', 'engine-status', 'user-stats', 'trade-volume',
                    'sharia-compliance', 'security-alerts', 'revenue', 'ai-insights',
                    'telemetry', 'firewall', 'workflows', 'agents',
                    'market-trends', 'support-tickets', 'performance', 'scale-status',
                    'learning-patterns', 'org-structure'
                ]
            },
            trader: {
                title: 'لوحة التاجر',
                widgets: ['my-products', 'market-prices', 'my-orders', 'my-balance', 'notifications', 'sharia-status']
            },
            company: {
                title: 'لوحة الشركة',
                widgets: ['offers', 'contracts', 'logistics', 'team', 'analytics', 'compliance']
            },
            government: {
                title: 'لوحة الحكومة',
                widgets: ['licenses', 'compliance-report', 'trade-stats', 'tax-report', 'regulations']
            },
            visitor: {
                title: 'صفحة الزائر',
                widgets: ['market-overview', 'top-metals', 'register-cta']
            }
        };
        return ROLE_WIDGETS[role] || ROLE_WIDGETS['visitor'];
    }

    // ═══ 3. Digital Workflow Engine ═══
    startWorkflow(type, data = {}) {
        const def = this.workflowDefs[type];
        if (!def) return { error: 'نوع المسار غير موجود' };

        const wf = {
            id: 'wf-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
            type,
            name: def.name,
            startedAt: new Date().toISOString(),
            status: 'running',
            currentStep: 0,
            steps: def.steps.map(s => ({ ...s, status: 'pending', completedAt: null })),
            data
        };

        for (let i = 0; i < wf.steps.length; i++) {
            if (wf.steps[i].auto) {
                wf.steps[i].status = 'completed';
                wf.steps[i].completedAt = new Date().toISOString();
                wf.currentStep = i + 1;
            } else {
                wf.steps[i].status = 'waiting';
                break;
            }
        }

        if (wf.currentStep >= wf.steps.length) {
            wf.status = 'completed';
            wf.completedAt = new Date().toISOString();
        }

        this.activeWorkflows.unshift(wf);
        if (this.activeWorkflows.length > 200) this.activeWorkflows.length = 200;
        this._persist();
        return wf;
    }

    advanceWorkflow(workflowId) {
        const wf = this.activeWorkflows.find(w => w.id === workflowId);
        if (!wf || wf.status === 'completed') return null;

        for (let i = wf.currentStep; i < wf.steps.length; i++) {
            if (wf.steps[i].status === 'waiting' || wf.steps[i].status === 'pending') {
                wf.steps[i].status = 'completed';
                wf.steps[i].completedAt = new Date().toISOString();
                wf.currentStep = i + 1;

                for (let j = i + 1; j < wf.steps.length; j++) {
                    if (wf.steps[j].auto) {
                        wf.steps[j].status = 'completed';
                        wf.steps[j].completedAt = new Date().toISOString();
                        wf.currentStep = j + 1;
                    } else {
                        wf.steps[j].status = 'waiting';
                        break;
                    }
                }
                break;
            }
        }

        if (wf.currentStep >= wf.steps.length) {
            wf.status = 'completed';
            wf.completedAt = new Date().toISOString();
        }
        this._persist();
        return wf;
    }

    // ═══ 4. Digital Assets / Twins ═══
    registerDigitalTwin(metalId, data) {
        const twin = {
            id: metalId,
            name: data.name || metalId,
            symbol: data.symbol || '',
            hsCode: data.hsCode || '',
            price: data.price || 0,
            priceHistory: data.priceHistory || [],
            specs: data.specs || {},
            certificates: data.certificates || [],
            origin: data.origin || '',
            shariaStatus: data.shariaStatus || 'halal',
            lastUpdated: new Date().toISOString()
        };
        this.digitalTwins.set(metalId, twin);
        this._persist();
        return twin;
    }

    getDigitalTwin(metalId) {
        return this.digitalTwins.get(metalId) || null;
    }

    // ═══ APIs ═══
    registerAPIs(app) {
        if (!app) return;

        app.get('/api/structure/org', (req, res) => {
            res.json({ success: true, data: this.getOrg(), timestamp: new Date().toISOString() });
        });

        app.get('/api/structure/dashboard/:role', (req, res) => {
            const dash = this.generateDashboard(req.params.role);
            res.json({ success: true, data: dash, timestamp: new Date().toISOString() });
        });

        app.post('/api/structure/workflow', (req, res) => {
            const type = req.body?.type || 'register_trader';
            const data = req.body?.data || {};
            const wf = this.startWorkflow(type, data);
            res.json({ success: !wf.error, data: wf, timestamp: new Date().toISOString() });
        });

        app.post('/api/structure/workflow/:id/advance', (req, res) => {
            const wf = this.advanceWorkflow(req.params.id);
            if (!wf) return res.status(404).json({ success: false, message: 'المسار غير موجود' });
            res.json({ success: true, data: wf, timestamp: new Date().toISOString() });
        });

        app.get('/api/structure/workflows', (req, res) => {
            res.json({ success: true, data: this.activeWorkflows.slice(0, 50), timestamp: new Date().toISOString() });
        });

        app.get('/api/structure/twin/:id', (req, res) => {
            const twin = this.getDigitalTwin(req.params.id);
            if (!twin) return res.status(404).json({ success: false, message: 'التوأم الرقمي غير موجود' });
            res.json({ success: true, data: twin, timestamp: new Date().toISOString() });
        });

        app.get('/api/structure/agents', (req, res) => {
            res.json({ success: true, data: this.agents, timestamp: new Date().toISOString() });
        });

        app.get('/api/structure/workflow-types', (req, res) => {
            const types = Object.entries(this.workflowDefs).map(([k, v]) => ({
                type: k,
                name: v.name,
                steps: v.steps.length,
                autoSteps: v.steps.filter(s => s.auto).length
            }));
            res.json({ success: true, data: types, timestamp: new Date().toISOString() });
        });
    }

    getStatus() {
        return {
            name: this.name,
            version: this.version,
            status: 'active',
            sectors: this.digitalOrg.sectors.length,
            agents: this.agents.length,
            workflows: this.activeWorkflows.length,
            twins: this.digitalTwins.size
        };
    }
}

module.exports = SheikhaSmartStructure;
