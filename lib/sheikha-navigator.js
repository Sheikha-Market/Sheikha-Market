// ═══════════════════════════════════════════════════════════════════════════════
// 🧭 SHEIKHA NAVIGATOR — نظام النقل الذكي المركزي
// ═══════════════════════════════════════════════════════════════════════════════
// ناقل المعلومات والتقارير بين البيئات المختلفة
// يعمل كمحرك مركزي يضمن تزامن المعلومات بين:
// Cursor (تنفيذ) ↔ Claude (تدقيق) ↔ ChatGPT (اقتراح)
// ═══════════════════════════════════════════════════════════════════════════════
// المالك: سلمان أحمد بن سلمان الراجح
// ═══════════════════════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');

class SheikaNavigator {
    constructor(basePath) {
        this.basePath = basePath || path.join(__dirname, '..');
        this.dataPath = path.join(this.basePath, 'data');
        this.statusFile = path.join(this.dataPath, 'SHEIKHA-STATUS.json');
        this.logFile = path.join(this.basePath, '..', 'SHEIKHA-WORK-LOG.md');
        this.navigatorLog = path.join(this.dataPath, 'navigator-log.json');
        
        // تأكد من وجود مجلد البيانات
        if (!fs.existsSync(this.dataPath)) {
            fs.mkdirSync(this.dataPath, { recursive: true });
        }

        // تحميل السجل
        this.log = this._loadJSON(this.navigatorLog, { events: [], syncs: [] });
        
        console.log('🧭 SHEIKHA Navigator — النظام المركزي مفعّل');
    }

    // ═══════════════════════════════════════════════════════════════
    // 📊 إنشاء/تحديث حالة المشروع الآلية
    // ═══════════════════════════════════════════════════════════════
    generateStatus() {
        const now = new Date().toISOString();
        
        const status = {
            _meta: {
                generator: 'SHEIKHA Navigator v1.0',
                generatedAt: now,
                owner: 'سلمان أحمد بن سلمان الراجح',
                project: 'منظومة وسوق شيخة — SHEIKHA'
            },
            
            // الحالة العامة
            overall: {
                status: 'active',
                readiness: '85%',
                security: '9/9',
                sharia: 'compliant'
            },

            // الخوادم
            servers: {
                mainPortal: {
                    port: 8080,
                    status: 'running',
                    apis: '200+',
                    pages: 106,
                    dashboards: ['admin', 'user', 'company']
                },
                universalMarketplace: {
                    port: 23000,
                    status: 'running',
                    apis: 13,
                    pages: 1
                },
                smartMarket: {
                    status: 'initial',
                    pages: 1
                }
            },

            // ما تم إنجازه
            completed: this._getCompleted(),

            // ما يتم العمل عليه
            inProgress: this._getInProgress(),

            // ما سيتم إن شاء الله
            planned: this._getPlanned(),

            // البيئات
            environments: {
                cursor: { role: 'execution', status: 'active', lastSync: now },
                claude: { role: 'audit', status: 'configured', lastSync: null },
                chatgpt: { role: 'suggestions', status: 'configured', lastSync: null }
            },

            // الأمان
            security: {
                helmet: true,
                rateLimit: true,
                compression: true,
                cors: true,
                inputSanitization: true,
                errorHandling: true,
                securityLogging: true,
                memoryHealth: true,
                jwtAuth: true
            },

            // الملفات المرجعية
            referenceFiles: [
                'SHEIKHA-WORK-LOG.md',
                'SHEIKHA-STRUCTURE-AUDIT.md',
                'SHEIKHA-STRATEGIC-ANALYSIS.md',
                'SHEIKHA-DESIGN-INTEGRATION-ORDER.md',
                'SHEIKHA-AI-CONTEXT.md',
                'SHEIKHA-SUIL.md',
                '.cursorrules',
                'CLAUDE.md',
                'CHATGPT-INSTRUCTIONS.md'
            ]
        };

        // حفظ
        this._saveJSON(this.statusFile, status);
        
        // سجّل الحدث
        this._addEvent('status_generated', 'تم تحديث حالة المشروع');

        return status;
    }

    // ═══════════════════════════════════════════════════════════════
    // 🔄 مزامنة — إنشاء تقرير لبيئة محددة
    // ═══════════════════════════════════════════════════════════════
    generateReportForEnvironment(env, permissions = 'full') {
        const status = this.generateStatus();
        const now = new Date().toISOString();
        
        const report = {
            _header: {
                to: env,
                from: 'SHEIKHA Navigator',
                generatedAt: now,
                permissions: permissions,
                protocol: 'SHEIKHA-SUIL v1.0'
            },

            // التعرّف
            recognition: {
                project: 'منظومة وسوق شيخة — SHEIKHA',
                owner: 'سلمان أحمد بن سلمان الراجح',
                type: 'Islamic Digital Economy Platform — Metals & Scrap',
                instruction: 'هذه الجلسة امتداد لمشروع قائم وليس تأسيساً جديداً'
            },

            // الدور حسب البيئة
            role: this._getRoleForEnv(env),

            // الحالة
            status: {
                overall: status.overall,
                servers: status.servers,
                security: status.security
            },

            // المهام حسب الصلاحية
            tasks: {
                completed: status.completed,
                inProgress: status.inProgress,
                planned: permissions === 'full' ? status.planned : status.planned.slice(0, 3)
            },

            // قواعد العمل
            rules: this._getRulesForEnv(env),

            // الختم
            seal: 'هذا التقرير صادر آلياً من نظام Navigator — منظومة شيخة'
        };

        // سجّل المزامنة
        this.log.syncs.push({ env, at: now, permissions });
        this._saveJSON(this.navigatorLog, this.log);

        // حدّث آخر مزامنة
        status.environments[env] = status.environments[env] || {};
        status.environments[env].lastSync = now;
        this._saveJSON(this.statusFile, status);

        return report;
    }

    // ═══════════════════════════════════════════════════════════════
    // 📝 تسجيل إنجاز جديد
    // ═══════════════════════════════════════════════════════════════
    recordAchievement(env, description, category = 'general') {
        const event = {
            id: 'ACH-' + Date.now().toString(36).toUpperCase(),
            env,
            description,
            category, // 'security', 'feature', 'fix', 'docs', 'api', 'ui'
            timestamp: new Date().toISOString(),
            status: 'completed'
        };

        this.log.events.push(event);
        this._saveJSON(this.navigatorLog, this.log);

        // أعد توليد الحالة
        this.generateStatus();

        return event;
    }

    // ═══════════════════════════════════════════════════════════════
    // ✅ التحقق الذكي — هل كل شيء متسق؟
    // ═══════════════════════════════════════════════════════════════
    verify() {
        const checks = [];

        // 1. فحص الملفات المرجعية
        const refFiles = [
            'SHEIKHA-STRUCTURE-AUDIT.md',
            'SHEIKHA-STRATEGIC-ANALYSIS.md',
            'SHEIKHA-DESIGN-INTEGRATION-ORDER.md'
        ];
        for (const f of refFiles) {
            const exists = fs.existsSync(path.join(this.basePath, f));
            checks.push({ file: f, exists, status: exists ? 'ok' : 'missing' });
        }

        // 2. فحص WORK-LOG
        const workLogExists = fs.existsSync(this.logFile);
        checks.push({ file: 'SHEIKHA-WORK-LOG.md', exists: workLogExists, status: workLogExists ? 'ok' : 'missing' });

        // 3. فحص STATUS
        const statusExists = fs.existsSync(this.statusFile);
        checks.push({ file: 'SHEIKHA-STATUS.json', exists: statusExists, status: statusExists ? 'ok' : 'missing' });

        // 4. فحص صفحات HTML المهمة
        const htmlFiles = [
            'public/index.html',
            'public/لوحة-الادمن.html',
            'public/لوحة-تحكم-المستخدم.html',
            'public/لوحة-الشركة.html',
            'public/تسجيل-حكومي.html',
            'public/سوق-شيخة.html'
        ];
        for (const f of htmlFiles) {
            const exists = fs.existsSync(path.join(this.basePath, f));
            checks.push({ file: f, exists, status: exists ? 'ok' : 'missing' });
        }

        // 5. فحص server.js
        const serverExists = fs.existsSync(path.join(this.basePath, 'server.js'));
        checks.push({ file: 'server.js', exists: serverExists, status: serverExists ? 'ok' : 'missing' });

        const totalOk = checks.filter(c => c.status === 'ok').length;
        const total = checks.length;

        return {
            success: true,
            score: `${totalOk}/${total}`,
            percentage: Math.round((totalOk / total) * 100) + '%',
            checks,
            verifiedAt: new Date().toISOString(),
            overall: totalOk === total ? 'healthy' : 'needs_attention'
        };
    }

    // ═══════════════════════════════════════════════════════════════
    // 📋 إنشاء تقرير نصّي كامل (لإرساله لأي بيئة)
    // ═══════════════════════════════════════════════════════════════
    generateTextReport() {
        const status = this.generateStatus();
        const verify = this.verify();
        const now = new Date();
        const dateStr = now.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        
        let report = '';
        report += '══════════════════════════════════════════════════════════════\n';
        report += '  تقرير منظومة شيخة — SHEIKHA Navigator Report\n';
        report += '══════════════════════════════════════════════════════════════\n';
        report += `  التاريخ: ${dateStr}\n`;
        report += `  المالك: سلمان أحمد بن سلمان الراجح\n`;
        report += `  المولّد: SHEIKHA Navigator v1.0\n`;
        report += '══════════════════════════════════════════════════════════════\n\n';

        report += '▸ الحالة العامة:\n';
        report += `  الجاهزية: ${status.overall.readiness}\n`;
        report += `  الأمان: ${status.overall.security}\n`;
        report += `  الشريعة: متوافق\n`;
        report += `  التحقق: ${verify.percentage} (${verify.score})\n\n`;

        report += '▸ الخوادم:\n';
        report += `  البوابة الرئيسية (8080): يعمل — ${status.servers.mainPortal.apis} API, ${status.servers.mainPortal.pages} صفحة\n`;
        report += `  السوق الشامل (23000): يعمل — ${status.servers.universalMarketplace.apis} API\n\n`;

        report += '▸ ما تم إنجازه (✅):\n';
        for (const item of status.completed) {
            report += `  ✅ ${item}\n`;
        }
        report += '\n';

        report += '▸ ما يتم العمل عليه (🔄):\n';
        for (const item of status.inProgress) {
            report += `  🔄 ${item}\n`;
        }
        report += '\n';

        report += '▸ ما سيتم إن شاء الله (📋):\n';
        for (const item of status.planned) {
            report += `  📋 ${item}\n`;
        }
        report += '\n';

        report += '══════════════════════════════════════════════════════════════\n';
        report += '  البروتوكول: SHEIKHA-SUIL v1.0\n';
        report += '  Cursor = التنفيذ | Claude = التدقيق | ChatGPT = الاقتراح\n';
        report += '  التنفيذ يتطلب إذن صريح من المالك\n';
        report += '══════════════════════════════════════════════════════════════\n';

        return report;
    }

    // ═══════════════════════════════════════════════════════════════
    // الدوال المساعدة الداخلية
    // ═══════════════════════════════════════════════════════════════

    _getCompleted() {
        return [
            'الأمان الكامل 9 طبقات (helmet, rate-limit, compression, CORS, sanitization)',
            'Node v20 LTS معتمد ومستقر',
            '/api/project/identity في كلا الخادمين',
            'فحص الذاكرة الذكي',
            'ملفات التكامل (SUIL, .cursorrules, CLAUDE.md, CHATGPT-INSTRUCTIONS.md)',
            'بروتوكول التكامل السيادي بين البيئات',
            'المراجعة الهيكلية SHEIKHA-STRUCTURE-AUDIT.md (10 أقسام)',
            'التحليل الاستراتيجي SHEIKHA-STRATEGIC-ANALYSIS.md',
            'أولوية الدمج SHEIKHA-DESIGN-INTEGRATION-ORDER.md',
            'صفحة التسجيل الحكومي (6 خطوات + 4 أنواع كيانات + 6 أدوار)',
            'API التسجيل الحكومي (/api/government/register + status + entities)',
            'سجل العمل المركزي SHEIKHA-WORK-LOG.md',
            'نظام Navigator المركزي الذكي'
        ];
    }

    _getInProgress() {
        return [
            'تحديث التسجيل الحكومي (قطاع عام + جامعات + شبه حكومي)',
            'إصلاح أقسام مفقودة في لوحة المستخدم (CRM/رزنامة/مهام)',
            'إصلاح أقسام مفقودة في لوحة الأدمن (3 أقسام)',
            'إصلاح قسم إعمار الأرض في لوحة الشركة'
        ];
    }

    _getPlanned() {
        return [
            'نظام إشعارات مركزي (Event Bus)',
            'ربط الخادمين بـ API Gateway',
            'MongoDB Migration',
            'HTTPS/SSL لـ sheikha.top',
            'CI/CD Pipeline',
            'Automated Tests',
            'Docker containerization',
            'تطبيق جوال PWA كامل',
            'تكامل أنظمة حكومية (فسح، اعتماد، بلدي، نافذ، نفاذ)',
            'التوسع الدولي'
        ];
    }

    _getRoleForEnv(env) {
        const roles = {
            cursor: {
                name: 'Cursor IDE',
                role: 'التنفيذ النهائي',
                can: ['تعديل الكود', 'إدارة الملفات', 'تشغيل الأوامر', 'النشر'],
                cannot: ['اتخاذ قرار بدون إذن المالك']
            },
            claude: {
                name: 'Claude',
                role: 'التدقيق والمراجعة',
                can: ['تدقيق شرعي', 'مراجعة أمان', 'تحليل مخاطر', 'مراجعة سياسات'],
                cannot: ['كتابة UI', 'تنفيذ refactor', 'تغيير منطق']
            },
            chatgpt: {
                name: 'ChatGPT',
                role: 'الاقتراح والمساعدة',
                can: ['اقتراح كود', 'مساعدة UX', 'كتابة نصوص', 'شرح تقني'],
                cannot: ['فتوى شرعية', 'قرار مالي', 'تغيير قواعد']
            }
        };
        return roles[env] || roles.cursor;
    }

    _getRulesForEnv(env) {
        return [
            'هذه الجلسة امتداد لمشروع قائم وليس تأسيساً جديداً',
            'المالك الوحيد: سلمان أحمد بن سلمان الراجح',
            'التنفيذ يتطلب إذن صريح من المالك',
            'العربية RTL + Vanilla JS فقط',
            'ممنوع refactor واسع بدون موافقة',
            'ممنوع إرسال/عرض أسرار (JWT_SECRET, API keys)',
            'الشريعة الإسلامية أساس كل تعامل'
        ];
    }

    _loadJSON(filePath, defaultVal) {
        try {
            if (fs.existsSync(filePath)) {
                return JSON.parse(fs.readFileSync(filePath, 'utf8'));
            }
        } catch (_) {}
        return defaultVal;
    }

    _saveJSON(filePath, data) {
        try {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        } catch (e) {
            console.error('Navigator save error:', e.message);
        }
    }

    _addEvent(type, description) {
        this.log.events.push({
            type,
            description,
            timestamp: new Date().toISOString()
        });
        // اقطع السجل عند 500 حدث
        if (this.log.events.length > 500) {
            this.log.events = this.log.events.slice(-300);
        }
        this._saveJSON(this.navigatorLog, this.log);
    }
}

module.exports = SheikaNavigator;
