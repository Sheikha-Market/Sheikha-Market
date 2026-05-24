/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ☪️ بسم الله الرحمن الرحيم
 * "إن الله يحب إذا عمل أحدكم عملاً أن يتقنه" — رواه الطبراني
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * SHEIKHA EXCELLENCE ENGINE — محرك الإتقان والتقدم
 *
 * ثلاثة محاور:
 *   1. التقدم العلمي  (Scientific Advancement)  — قياس + بحث + منهج
 *   2. التقدم التجاري (Commercial Advancement) — سوق + عملاء + نمو
 *   3. التقدم التقني  (Technical Advancement)  — كود + أداء + أمان
 *
 * + نظام الأول والأفضل (First & Best Benchmarking)
 * + نظام الإتقان (Itqan Quality System)
 *
 * المالك: سلمان أحمد بن سلمان الراجح
 * الإصدار: 1.0
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class SheikaExcellenceEngine {
    constructor(basePath) {
        this.basePath = basePath;
        this.dataDir = path.join(basePath, 'data');
        this.stateFile = path.join(this.dataDir, 'excellence-state.json');

        this.state = this._load(this.stateFile, this._defaults());
        this._ensureStructure();
        this._save();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 1. التقدم العلمي — Scientific Advancement
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * المنهج العلمي المعتمد: ملاحظة → قياس → تجربة → مراجعة → توثيق
     */
    recordScientificCycle(cycle) {
        const entry = {
            id: crypto.randomUUID(),
            phase: cycle.phase, // observation | measurement | experiment | review | documentation
            title: cycle.title || '',
            description: cycle.description || '',
            hypothesis: cycle.hypothesis || null,
            measurement: cycle.measurement || null,
            result: cycle.result || null,
            conclusion: cycle.conclusion || null,
            documented: !!cycle.documented,
            timestamp: new Date().toISOString()
        };
        this.state.scientific.cycles.push(entry);
        this._trim(this.state.scientific.cycles, 2000);
        this._recalculate('scientific');
        this._save();
        return entry;
    }

    /**
     * تسجيل اكتشاف أو معرفة جديدة
     */
    recordDiscovery(discovery) {
        const entry = {
            id: crypto.randomUUID(),
            title: discovery.title,
            domain: discovery.domain || 'general', // metals | market | technology | sharia | logistics
            impact: discovery.impact || 'medium', // low | medium | high | critical
            evidence: discovery.evidence || '',
            applied: false,
            timestamp: new Date().toISOString()
        };
        this.state.scientific.discoveries.push(entry);
        this._recalculate('scientific');
        this._save();
        return entry;
    }

    getScientificDashboard() {
        const s = this.state.scientific;
        const cycles = s.cycles || [];
        const phases = {};
        cycles.forEach(c => { phases[c.phase] = (phases[c.phase] || 0) + 1; });

        return {
            score: s.score,
            level: this._itqanLevel(s.score),
            methodology: {
                label: 'المنهج العلمي',
                steps: ['ملاحظة', 'قياس', 'تجربة', 'مراجعة', 'توثيق'],
                completedCycles: cycles.filter(c => c.phase === 'documentation').length,
                phaseDistribution: phases,
                totalEntries: cycles.length
            },
            discoveries: {
                total: s.discoveries.length,
                byDomain: this._countBy(s.discoveries, 'domain'),
                byImpact: this._countBy(s.discoveries, 'impact'),
                applied: s.discoveries.filter(d => d.applied).length,
                recent: s.discoveries.slice(-5).reverse()
            },
            metrics: s.metrics,
            principle: '"اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ" — العلق:1',
            timestamp: new Date().toISOString()
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 2. التقدم التجاري — Commercial Advancement
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * تسجيل مرحلة تجارية (Milestone)
     */
    recordCommercialMilestone(milestone) {
        const entry = {
            id: crypto.randomUUID(),
            title: milestone.title,
            category: milestone.category || 'general', // market_entry | customer | revenue | partnership | brand | expansion
            value: milestone.value || 0,
            unit: milestone.unit || '',
            target: milestone.target || null,
            achieved: milestone.achieved || false,
            evidence: milestone.evidence || '',
            timestamp: new Date().toISOString()
        };
        this.state.commercial.milestones.push(entry);
        this._recalculate('commercial');
        this._save();
        return entry;
    }

    /**
     * تسجيل مقياس تجاري
     */
    recordCommercialMetric(name, value, target) {
        if (!this.state.commercial.metrics[name]) {
            this.state.commercial.metrics[name] = { values: [], target };
        }
        this.state.commercial.metrics[name].values.push({
            value, timestamp: new Date().toISOString()
        });
        this._trim(this.state.commercial.metrics[name].values, 500);
        if (target !== undefined) this.state.commercial.metrics[name].target = target;
        this._recalculate('commercial');
        this._save();
    }

    getCommercialDashboard() {
        const c = this.state.commercial;
        const milestones = c.milestones || [];

        // مراحل التقدم التجاري
        const stages = [
            { id: 'foundation', label: 'التأسيس', target: 'بنية تحتية + هوية', status: 'completed' },
            { id: 'pilot', label: 'الدخول التجريبي', target: '10-50 مستخدم', status: 'active' },
            { id: 'validation', label: 'التحقق السوقي', target: 'تفاعل + ثقة', status: 'pending' },
            { id: 'launch', label: 'الإطلاق التجاري', target: 'بيع + دفع', status: 'pending' },
            { id: 'growth', label: 'النمو', target: 'توسع + شراكات', status: 'pending' },
            { id: 'regional', label: 'التوسع الإقليمي', target: 'خليجي + عربي', status: 'pending' }
        ];

        // حساب التقدم التجاري
        const completedStages = stages.filter(s => s.status === 'completed').length;
        const activeStages = stages.filter(s => s.status === 'active').length;

        return {
            score: c.score,
            level: this._itqanLevel(c.score),
            stages,
            progress: Math.round(((completedStages + activeStages * 0.5) / stages.length) * 100),
            milestones: {
                total: milestones.length,
                achieved: milestones.filter(m => m.achieved).length,
                byCategory: this._countBy(milestones, 'category'),
                recent: milestones.slice(-5).reverse()
            },
            metrics: this._metricsSnapshot(c.metrics),
            valueProposition: {
                primary: 'أول منصة رقمية إسلامية عالمية للمعادن والسكراب',
                differentiators: [
                    'الالتزام الشرعي الكامل',
                    'سلسلة إمداد رقمية شفافة',
                    'ذكاء اصطناعي منضبط',
                    'تسعير عادل بلا احتكار',
                    'منظومة متكاملة لا مجرد سوق'
                ]
            },
            principle: '"وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا" — البقرة:275',
            timestamp: new Date().toISOString()
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 3. التقدم التقني — Technical Advancement
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * تسجيل إنجاز تقني
     */
    recordTechnicalAchievement(achievement) {
        const entry = {
            id: crypto.randomUUID(),
            title: achievement.title,
            category: achievement.category || 'general', // architecture | performance | security | feature | fix | optimization
            component: achievement.component || '', // server | frontend | engine | database | api
            impact: achievement.impact || 'medium',
            measurable: achievement.measurable || null, // { before: X, after: Y, unit: Z }
            timestamp: new Date().toISOString()
        };
        this.state.technical.achievements.push(entry);
        this._recalculate('technical');
        this._save();
        return entry;
    }

    /**
     * تقييم جودة الكود والمعمارية
     */
    assessCodeQuality() {
        const checks = [];
        const libDir = path.join(this.basePath, 'lib');
        const dataDir = path.join(this.basePath, 'data');
        const publicDir = path.join(this.basePath, 'public');
        const serverFile = path.join(this.basePath, 'server.js');

        // 1. وجود الملفات الحرجة
        const criticalFiles = [
            { path: serverFile, label: 'server.js' },
            { path: path.join(libDir, 'sheikha-pilot-engine.js'), label: 'Pilot Engine' },
            { path: path.join(libDir, 'sheikha-marketing-engine.js'), label: 'Marketing Engine' },
            { path: path.join(libDir, 'sheikha-ai-engine.js'), label: 'AI Engine' },
            { path: path.join(libDir, 'sharia-compliance.js'), label: 'Sharia Engine' },
            { path: path.join(libDir, 'sheikha-excellence-engine.js'), label: 'Excellence Engine' }
        ];

        let existCount = 0;
        criticalFiles.forEach(f => {
            const exists = fs.existsSync(f.path);
            if (exists) existCount++;
            checks.push({ check: f.label, status: exists ? 'pass' : 'missing', critical: true });
        });

        // 2. حجم server.js
        let serverLines = 0;
        try {
            serverLines = fs.readFileSync(serverFile, 'utf8').split('\n').length;
        } catch (_) {}
        checks.push({
            check: 'حجم server.js',
            value: serverLines,
            status: serverLines > 15000 ? 'warning_large' : serverLines > 5000 ? 'acceptable' : 'good',
            recommendation: serverLines > 10000 ? 'يحتاج تقسيم لملفات routes منفصلة' : null
        });

        // 3. عدد المحركات
        let engineCount = 0;
        try {
            engineCount = fs.readdirSync(libDir).filter(f => f.endsWith('.js')).length;
        } catch (_) {}
        checks.push({ check: 'المحركات النشطة', value: engineCount, status: engineCount >= 6 ? 'excellent' : 'good' });

        // 4. ملفات البيانات
        let dataFiles = 0;
        try {
            dataFiles = fs.readdirSync(dataDir).filter(f => f.endsWith('.json')).length;
        } catch (_) {}
        checks.push({ check: 'ملفات البيانات', value: dataFiles, status: dataFiles > 0 ? 'good' : 'empty' });

        // 5. الأمان
        const envExists = fs.existsSync(path.join(this.basePath, '.env'));
        const hasJWT = envExists && fs.readFileSync(path.join(this.basePath, '.env'), 'utf8').includes('JWT_SECRET');
        checks.push({ check: 'ملف .env', status: envExists ? 'pass' : 'missing' });
        checks.push({ check: 'JWT_SECRET في .env', status: hasJWT ? 'pass' : 'missing', critical: true });

        // 6. صفحات HTML
        let htmlCount = 0;
        try {
            const countHTML = (dir) => {
                let count = 0;
                fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
                    if (entry.isFile() && entry.name.endsWith('.html')) count++;
                    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
                        try { count += countHTML(path.join(dir, entry.name)); } catch (_) {}
                    }
                });
                return count;
            };
            htmlCount = countHTML(publicDir);
        } catch (_) {}
        checks.push({ check: 'صفحات HTML', value: htmlCount, status: htmlCount > 50 ? 'comprehensive' : 'good' });

        // حساب النتيجة
        const passCount = checks.filter(c => c.status === 'pass' || c.status === 'good' || c.status === 'excellent' || c.status === 'comprehensive' || c.status === 'acceptable').length;
        const qualityScore = Math.round((passCount / checks.length) * 100);

        return {
            score: qualityScore,
            checks,
            summary: {
                engines: engineCount,
                serverLines,
                dataFiles,
                htmlPages: htmlCount,
                criticalFilesPresent: `${existCount}/${criticalFiles.length}`
            },
            grade: this._grade(qualityScore)
        };
    }

    getTechnicalDashboard() {
        const t = this.state.technical;
        const quality = this.assessCodeQuality();

        return {
            score: t.score,
            level: this._itqanLevel(t.score),
            codeQuality: quality,
            achievements: {
                total: t.achievements.length,
                byCategory: this._countBy(t.achievements, 'category'),
                byComponent: this._countBy(t.achievements, 'component'),
                recent: t.achievements.slice(-5).reverse()
            },
            architecture: {
                pattern: 'Monolithic Express.js + Engine Modules',
                layers: [
                    { name: 'Presentation', tech: 'HTML5/CSS3/Vanilla JS', status: 'active' },
                    { name: 'API Gateway', tech: 'Express.js + Middleware', status: 'active' },
                    { name: 'Business Logic', tech: '9 Engine Modules', status: 'active' },
                    { name: 'Data', tech: 'JSON File Storage', status: 'active' },
                    { name: 'Real-time', tech: 'WebSocket', status: 'active' },
                    { name: 'AI Layer', tech: 'OpenAI + Anthropic', status: 'active' }
                ],
                security: ['JWT Auth', 'Helmet', 'CORS', 'Rate Limit', 'XSS Sanitize', 'Compression', 'Input Validation', 'Sharia Audit']
            },
            metrics: this._metricsSnapshot(t.metrics),
            principle: '"وَقُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ" — التوبة:105',
            timestamp: new Date().toISOString()
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 4. نظام الأول والأفضل — First & Best
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * تسجيل ميزة "الأول" أو "الأفضل"
     */
    recordFirstBest(item) {
        const entry = {
            id: crypto.randomUUID(),
            title: item.title,
            type: item.type || 'first', // first | best | unique | innovative
            domain: item.domain || 'general', // market | technology | sharia | service | experience
            description: item.description || '',
            evidence: item.evidence || '',
            competitors: item.competitors || [],
            verified: false,
            timestamp: new Date().toISOString()
        };
        this.state.firstBest.items.push(entry);
        this._save();
        return entry;
    }

    getFirstBestDashboard() {
        const fb = this.state.firstBest;
        const items = fb.items || [];

        // القيم المميزة الأساسية
        const coreFirsts = [
            { title: 'أول سوق رقمي إسلامي للمعادن والسكراب في العالم', type: 'first', domain: 'market', verified: true },
            { title: 'أول منصة تدمج التدقيق الشرعي الآلي في التجارة الإلكترونية', type: 'first', domain: 'sharia', verified: true },
            { title: 'أول نظام AL/ML منضبط شرعياً (لا تنبؤ ولا تعلم ذاتي منفلت)', type: 'first', domain: 'technology', verified: true },
            { title: 'أول منصة تعتمد مؤشر البركة (Barakah Index) في التسويق', type: 'unique', domain: 'market', verified: true },
            { title: 'أول منظومة تدمج 12 مبدأ إسلامي في التسويق الرقمي', type: 'unique', domain: 'sharia', verified: true },
            { title: 'أول سلسلة إمداد رقمية شفافة للسكراب في الخليج', type: 'first', domain: 'service', verified: true },
            { title: 'تسعير عادل بدون احتكار أو غرر', type: 'best', domain: 'market', verified: true },
            { title: 'منظومة متكاملة (سوق + لوجستيات + تحليل + تسويق + حكومي)', type: 'best', domain: 'service', verified: true }
        ];

        return {
            coreFirsts,
            userItems: items,
            counts: {
                firsts: [...coreFirsts, ...items].filter(i => i.type === 'first').length,
                bests: [...coreFirsts, ...items].filter(i => i.type === 'best').length,
                unique: [...coreFirsts, ...items].filter(i => i.type === 'unique').length,
                innovative: [...coreFirsts, ...items].filter(i => i.type === 'innovative').length,
                total: coreFirsts.length + items.length
            },
            competitivePosition: {
                market: 'المعادن والسكراب الرقمي — الشرق الأوسط',
                position: 'الأول والوحيد',
                directCompetitors: 0,
                indirectCompetitors: ['LME (عالمي — بدون شريعة)', 'MetalX (محدود)', 'ScrapMonster (غربي)'],
                advantage: 'لا يوجد منافس مباشر في السوق الإسلامي الرقمي للمعادن'
            },
            principle: '"وَلَا تَهِنُوا وَلَا تَحْزَنُوا وَأَنتُمُ الْأَعْلَوْنَ إِن كُنتُم مُّؤْمِنِينَ" — آل عمران:139',
            timestamp: new Date().toISOString()
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 5. نظام الإتقان — Itqan Quality System
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * مستويات الإتقان الخمسة
     */
    get itqanLevels() {
        return [
            { level: 1, name: 'مبتدئ', nameEn: 'Foundation', range: [0, 39], description: 'بناء الأساس — التأسيس' },
            { level: 2, name: 'متعلّم', nameEn: 'Learning', range: [40, 59], description: 'التعلم والتجربة — اكتساب المهارة' },
            { level: 3, name: 'ماهر', nameEn: 'Proficient', range: [60, 74], description: 'الإنجاز المنضبط — الكفاءة' },
            { level: 4, name: 'متقن', nameEn: 'Master', range: [75, 89], description: 'الإتقان — الجودة العالية' },
            { level: 5, name: 'مبدع', nameEn: 'Excellence', range: [90, 100], description: 'الإبداع المتقن — التميز الكامل' }
        ];
    }

    /**
     * تسجيل معيار إتقان
     */
    recordItqanCheck(check) {
        const entry = {
            id: crypto.randomUUID(),
            area: check.area, // code | design | content | process | security | sharia
            item: check.item,
            score: Math.min(100, Math.max(0, check.score || 0)),
            notes: check.notes || '',
            improved: check.improved || false,
            timestamp: new Date().toISOString()
        };
        this.state.itqan.checks.push(entry);
        this._trim(this.state.itqan.checks, 2000);
        this._recalculate('itqan');
        this._save();
        return entry;
    }

    /**
     * تقييم الإتقان الشامل
     */
    getItqanAssessment() {
        const areas = {
            code: { label: 'إتقان الكود', weight: 20, checks: [] },
            design: { label: 'إتقان التصميم', weight: 15, checks: [] },
            content: { label: 'إتقان المحتوى', weight: 15, checks: [] },
            process: { label: 'إتقان العملية', weight: 15, checks: [] },
            security: { label: 'إتقان الأمان', weight: 15, checks: [] },
            sharia: { label: 'إتقان الانضباط الشرعي', weight: 20, checks: [] }
        };

        // توزيع الفحوصات
        (this.state.itqan.checks || []).forEach(c => {
            if (areas[c.area]) areas[c.area].checks.push(c);
        });

        // حساب نتيجة كل مجال
        let totalWeightedScore = 0;
        const details = {};
        for (const [key, area] of Object.entries(areas)) {
            const avgScore = area.checks.length > 0
                ? Math.round(area.checks.reduce((s, c) => s + c.score, 0) / area.checks.length)
                : this._defaultAreaScore(key);
            const weighted = Math.round((avgScore / 100) * area.weight);
            totalWeightedScore += weighted;
            details[key] = {
                label: area.label,
                weight: area.weight,
                score: avgScore,
                weighted,
                checksCount: area.checks.length,
                level: this._itqanLevel(avgScore),
                grade: this._grade(avgScore)
            };
        }

        return {
            totalScore: totalWeightedScore,
            maxScore: 100,
            level: this._itqanLevel(totalWeightedScore),
            levels: this.itqanLevels,
            areas: details,
            principle: '"إن الله يحب إذا عمل أحدكم عملاً أن يتقنه" — الطبراني',
            continuous: {
                label: 'التحسين المستمر',
                cycle: ['قياس', 'مقارنة', 'تعديل', 'تجربة', 'تثبيت', 'توثيق'],
                rule: 'لا قفزات — تحسين تدريجي منضبط'
            },
            timestamp: new Date().toISOString()
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 6. اللوحة الشاملة — Unified Excellence Dashboard
    // ═══════════════════════════════════════════════════════════════════════════

    getFullDashboard() {
        const scientific = this.getScientificDashboard();
        const commercial = this.getCommercialDashboard();
        const technical = this.getTechnicalDashboard();
        const firstBest = this.getFirstBestDashboard();
        const itqan = this.getItqanAssessment();

        // المؤشر الكلي للتقدم
        const overallScore = Math.round(
            (this.state.scientific.score * 0.25) +
            (this.state.commercial.score * 0.30) +
            (this.state.technical.score * 0.25) +
            (itqan.totalScore * 0.20)
        );

        return {
            overall: {
                score: overallScore,
                level: this._itqanLevel(overallScore),
                grade: this._grade(overallScore),
                version: 'SHEIKHA-DEV v1.6'
            },
            dimensions: {
                scientific: { score: this.state.scientific.score, weight: '25%', dashboard: scientific },
                commercial: { score: this.state.commercial.score, weight: '30%', dashboard: commercial },
                technical: { score: this.state.technical.score, weight: '25%', dashboard: technical },
                itqan: { score: itqan.totalScore, weight: '20%', dashboard: itqan }
            },
            firstBest,
            roadmap: [
                { version: 'v1.0', label: 'التأسيس', status: 'completed', score: 100 },
                { version: 'v1.5', label: 'التشغيل التجريبي', status: 'active', score: 60 },
                { version: 'v1.6', label: 'AL/ML + إتقان', status: 'active', score: 40 },
                { version: 'v2.0', label: 'الإطلاق التجاري', status: 'pending', score: 0 },
                { version: 'v3.0', label: 'التوسع الإقليمي', status: 'pending', score: 0 }
            ],
            governance: {
                reference: 'الكتاب والسنة',
                document: 'SHEIKHA-MASTER-ACTIVATION.md',
                rule: 'لا تنفيذ بلا قياس — لا قياس بلا توثيق — لا توثيق بلا مرجعية'
            },
            timestamp: new Date().toISOString()
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // تقييم + حسابات داخلية
    // ═══════════════════════════════════════════════════════════════════════════

    _recalculate(dimension) {
        switch (dimension) {
            case 'scientific': {
                const s = this.state.scientific;
                let score = 50;
                score += Math.min(20, s.cycles.length * 2);
                score += Math.min(15, s.discoveries.length * 3);
                score += Math.min(15, s.discoveries.filter(d => d.applied).length * 5);
                this.state.scientific.score = Math.min(100, score);
                break;
            }
            case 'commercial': {
                const c = this.state.commercial;
                let score = 40;
                score += Math.min(25, c.milestones.length * 5);
                score += Math.min(20, c.milestones.filter(m => m.achieved).length * 5);
                score += Math.min(15, Object.keys(c.metrics).length * 3);
                this.state.commercial.score = Math.min(100, score);
                break;
            }
            case 'technical': {
                const t = this.state.technical;
                let score = 55;
                score += Math.min(20, t.achievements.length * 2);
                const quality = this.assessCodeQuality();
                score += Math.round(quality.score * 0.25);
                this.state.technical.score = Math.min(100, score);
                break;
            }
            case 'itqan': {
                const checks = this.state.itqan.checks || [];
                if (checks.length > 0) {
                    this.state.itqan.score = Math.round(checks.reduce((s, c) => s + c.score, 0) / checks.length);
                }
                break;
            }
        }
    }

    _defaultAreaScore(area) {
        const defaults = { code: 70, design: 65, content: 70, process: 60, security: 75, sharia: 85 };
        return defaults[area] || 60;
    }

    _itqanLevel(score) {
        const lvl = this.itqanLevels.find(l => score >= l.range[0] && score <= l.range[1]);
        return lvl || this.itqanLevels[0];
    }

    _metricsSnapshot(metrics) {
        const snapshot = {};
        for (const [name, data] of Object.entries(metrics || {})) {
            const vals = data.values || [];
            const latest = vals.length > 0 ? vals[vals.length - 1].value : null;
            snapshot[name] = { latest, target: data.target, count: vals.length };
        }
        return snapshot;
    }

    _countBy(arr, key) {
        const c = {};
        (arr || []).forEach(i => { const v = i[key] || 'other'; c[v] = (c[v] || 0) + 1; });
        return c;
    }

    _grade(score) {
        if (score >= 90) return 'ممتاز';
        if (score >= 80) return 'جيد جداً';
        if (score >= 70) return 'جيد';
        if (score >= 60) return 'مقبول';
        return 'يحتاج تحسين';
    }

    _trim(arr, max) { if (arr.length > max) arr.splice(0, arr.length - Math.floor(max / 2)); }

    _ensureStructure() {
        if (!this.state.scientific) this.state.scientific = { score: 65, cycles: [], discoveries: [], metrics: {} };
        if (!this.state.commercial) this.state.commercial = { score: 55, milestones: [], metrics: {} };
        if (!this.state.technical) this.state.technical = { score: 70, achievements: [], metrics: {} };
        if (!this.state.firstBest) this.state.firstBest = { items: [] };
        if (!this.state.itqan) this.state.itqan = { score: 72, checks: [] };
    }

    _defaults() {
        return {
            scientific: { score: 65, cycles: [], discoveries: [], metrics: {} },
            commercial: { score: 55, milestones: [], metrics: {} },
            technical: { score: 70, achievements: [], metrics: {} },
            firstBest: { items: [] },
            itqan: { score: 72, checks: [] },
            createdAt: new Date().toISOString()
        };
    }

    _load(file, def) {
        try { if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (_) {}
        return def;
    }

    _save() {
        try {
            const dir = path.dirname(this.stateFile);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(this.stateFile, JSON.stringify(this.state, null, 2), 'utf8');
        } catch (e) { console.error('❌ خطأ حفظ Excellence:', e.message); }
    }
}

module.exports = SheikaExcellenceEngine;
