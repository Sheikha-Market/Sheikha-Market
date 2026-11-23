/**
 * 🧠 منظومة شيخة - السكربت الموحد الذكي
 * ═════════════════════════════════════════════════════════════
 * دمج المعمارية + الوسائط + حماية الملكية + أسئلة Google في ملف واحد
 */

const fs = require('fs');
const path = require('path');

const architectureUnified = require('../lib/sheikha-architecture-unified');
const { MediaGenerationEngine } = require('../lib/media-generation-engine');
const IPProtectionSystem = require('../lib/ip-protection-system');
const top10Questions = require('../docs/TOP_10_GOOGLE_QUESTIONS');
const SheikhaSovereignTwinEngine = require('../lib/sheikha-sovereign-twin-engine');

const sheikhaUniversalMaster = {
    parseArgs() {
        const rawArgs = process.argv.slice(2);
        const hasFlag = flag => rawArgs.includes(flag);
        const getValue = prefix => {
            const arg = rawArgs.find(item => item.startsWith(`${prefix}=`));
            return arg ? arg.substring(prefix.length + 1) : '';
        };

        return {
            apply: hasFlag('--apply'),
            media: hasFlag('--media'),
            twin: hasFlag('--twin'),
            protectPath: getValue('--protect'),
            reportOnly: hasFlag('--report-only')
        };
    },

    ensureDataDir() {
        const dataDir = path.join(process.cwd(), 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        return dataDir;
    },

    getQuestionsSummary() {
        const grouped = top10Questions.questions.reduce((acc, question) => {
            if (!acc[question.priority]) {
                acc[question.priority] = 0;
            }
            acc[question.priority] += 1;
            return acc;
        }, {});

        return {
            total: top10Questions.questions.length,
            byPriority: grouped,
            implementationPlan: top10Questions.implementationPlan,
            successCriteria: top10Questions.successCriteria
        };
    },

    async runFoundation(config) {
        const initState = architectureUnified.init();
        const checks = architectureUnified.validateArchitecture();

        return {
            mode: config.apply ? 'apply' : 'dry-run',
            architectureStatus: initState.status,
            environmentChecks: checks,
            note: config.apply
                ? 'تم تفعيل مرحلة التأسيس على الوضع التنفيذي.'
                : 'تشغيل آمن: لا يتم إجراء تغييرات تشغيلية خارج التقارير.'
        };
    },

    async runIntelligence(config) {
        if (!config.media) {
            return {
                mediaEnabled: false,
                note: 'تم تخطي توليد الوسائط. أضف --media للتفعيل.'
            };
        }

        const mediaEngine = new MediaGenerationEngine();
        const imageResult = await mediaEngine.generateProductImages({
            name: 'Sheikha_Gold_Sample',
            angles: ['front', 'side'],
            quality: '8K'
        });

        const videoResult = await mediaEngine.generateProductVideo({
            name: 'Sheikha_Gold_Sample',
            type: 'precious',
            quality: '1080p'
        });

        return {
            mediaEnabled: true,
            imageResult,
            videoResult
        };
    },

    runSecurity(config) {
        const ipSystem = new IPProtectionSystem();

        if (!config.protectPath) {
            return {
                ipProtectionEnabled: false,
                note: 'تم تخطي حماية الملفات. أضف --protect=path للتفعيل.',
                report: ipSystem.generateSecurityReport()
            };
        }

        const absoluteTarget = path.isAbsolute(config.protectPath)
            ? config.protectPath
            : path.join(process.cwd(), config.protectPath);

        if (!fs.existsSync(absoluteTarget)) {
            return {
                ipProtectionEnabled: false,
                error: `المسار غير موجود: ${absoluteTarget}`,
                report: ipSystem.generateSecurityReport()
            };
        }

        const targetStats = fs.statSync(absoluteTarget);
        const result = targetStats.isDirectory()
            ? ipSystem.protectDirectory(absoluteTarget)
            : ipSystem.protectFile(absoluteTarget);

        return {
            ipProtectionEnabled: true,
            target: absoluteTarget,
            result,
            report: ipSystem.generateSecurityReport()
        };
    },

    runTwinAndBlockchain(config) {
        if (!config.twin) {
            return {
                twinEnabled: false,
                note: 'تم تخطي التوأم الرقمي. أضف --twin للتفعيل.'
            };
        }

        const twinEngine = new SheikhaSovereignTwinEngine();
        const report = twinEngine.runFullActivation({
            apply: config.apply,
            location: 'Al-Khobar_Warehouses'
        });

        return {
            twinEnabled: true,
            report
        };
    },

    writeReport(payload) {
        const dataDir = this.ensureDataDir();
        const reportPath = path.join(dataDir, 'sheikha-universal-master-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(payload, null, 4));
        return reportPath;
    },

    printSummary(payload, reportPath) {
        console.log('═════════════════════════════════════════════════════════════');
        console.log('✅ Sheikha Universal Master - تقرير التفعيل الموحد');
        console.log(`• mode: ${payload.mode}`);
        console.log(`• questions: ${payload.strategy.total} سؤال استراتيجي`);
        console.log(`• media: ${payload.intelligence.mediaEnabled ? 'enabled' : 'disabled'}`);
        console.log(
            `• ip-protection: ${payload.security.ipProtectionEnabled ? 'enabled' : 'disabled'}`
        );
        console.log(`• digital-twin: ${payload.twin.twinEnabled ? 'enabled' : 'disabled'}`);
        console.log(`• report: ${reportPath}`);
        console.log('═════════════════════════════════════════════════════════════');
    },

    async launch() {
        const config = this.parseArgs();
        const mode = config.apply ? 'apply' : 'dry-run';

        const strategy = this.getQuestionsSummary();
        const foundation = await this.runFoundation(config);

        const intelligence = config.reportOnly
            ? { mediaEnabled: false, note: 'report-only mode' }
            : await this.runIntelligence(config);

        const security = this.runSecurity(config);
        const twin = this.runTwinAndBlockchain(config);

        const payload = {
            timestamp: new Date().toISOString(),
            mode,
            strategy,
            foundation,
            intelligence,
            security,
            twin
        };

        const reportPath = this.writeReport(payload);
        this.printSummary(payload, reportPath);
        return payload;
    }
};

if (require.main === module) {
    sheikhaUniversalMaster.launch().catch(error => {
        console.error('❌ فشل تشغيل السكربت الموحد:', error.message);
        process.exitCode = 1;
    });
}

module.exports = sheikhaUniversalMaster;
