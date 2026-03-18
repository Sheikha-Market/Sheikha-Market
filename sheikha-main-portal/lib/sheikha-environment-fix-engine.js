/**
 * ════════════════════════════════════════════════════════════════════════
 * ☪️ بسم الله الرحمن الرحيم
 * ════════════════════════════════════════════════════════════════════════
 * SHEIKHA ENVIRONMENT FIX ENGINE
 * محرك تطهير البيئة وفك حظر الامتثال
 *
 * الهدف: تحويل الرؤية التشغيلية إلى تنفيذ تقني مهني ومقبول.
 * ════════════════════════════════════════════════════════════════════════
 */

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

class SheikhaEnvironmentFixEngine {
    constructor() {
        this.name = 'Sheikha Environment Fix Engine';
        this.version = '1.0.0';
        this.rootDir = path.resolve(__dirname, '..');
        this.reportDir = path.join(this.rootDir, 'reports', 'operations');
        this.reportPath = path.join(this.reportDir, 'environment-fix-status.json');
    }

    readPackageJson() {
        const packagePath = path.join(this.rootDir, 'package.json');
        if (!fs.existsSync(packagePath)) return null;
        return JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    }

    resetContext() {
        const packageJson = this.readPackageJson();
        const scripts = packageJson?.scripts || {};
        const adcPath = path.join(
            os.homedir(),
            '.config',
            'gcloud',
            'application_default_credentials.json'
        );

        const checks = {
            inProjectRoot: fs.existsSync(path.join(this.rootDir, 'server.js')),
            packageJsonExists: !!packageJson,
            globalPulseFile: fs.existsSync(
                path.join(this.rootDir, 'scripts', 'activate-global-pulse.js')
            ),
            globalPulseScriptRegistered: !!scripts['sovereign:global-pulse'],
            gratitudeScriptRegistered: !!scripts['sovereign:gratitude'],
            adcReady: fs.existsSync(adcPath),
            envFileExists: fs.existsSync(path.join(this.rootDir, '.env')),
            reportsDirReady: fs.existsSync(path.join(this.rootDir, 'reports'))
        };

        const passed = Object.values(checks).filter(Boolean).length;
        const score = Math.round((passed / Object.keys(checks).length) * 100);

        return {
            policy: 'Enterprise_Professional_Context',
            checks,
            professionalMappings: {
                sovereign: 'enterprise',
                alliance: 'integration',
                pulse: 'health-monitoring',
                charter: 'governance-model',
                barakah: 'impact-value',
                noHarm: 'compliance-and-safety'
            },
            score,
            status: 'Technical_Flow_Secured_By_Honesty ✅'
        };
    }

    ensureFlow(contextReport) {
        const actions = [];

        if (!contextReport.checks.inProjectRoot) {
            actions.push('شغّل الأوامر من جذر المشروع sheikha-main-portal.');
        }
        if (!contextReport.checks.adcReady) {
            actions.push('فعّل ADC عبر gcloud auth application-default login.');
        }
        if (!contextReport.checks.globalPulseScriptRegistered) {
            actions.push('حدّث package.json أو اسحب آخر نسخة من المستودع.');
        }
        if (!contextReport.checks.envFileExists) {
            actions.push('أنشئ ملف .env من القيم المعتمدة قبل التشغيل.');
        }
        if (!actions.length) {
            actions.push(
                'البيئة جاهزة؛ شغّل npm run sovereign:global-pulse ثم npm run sovereign:gratitude.'
            );
        }

        return {
            zeroInterruption: contextReport.score >= 85,
            actions,
            recommendedRunbook: [
                'npm run sovereign:global-pulse',
                'npm run sovereign:gratitude',
                'npm run sovereign:microsoft:governance'
            ],
            status: 'Technical_Flow_Secured_By_Honesty ✅'
        };
    }

    async activate() {
        const contextReport = this.resetContext();
        const flow = this.ensureFlow(contextReport);

        const report = {
            timestamp: new Date().toISOString(),
            engine: this.name,
            version: this.version,
            auth: 'market@sheikha.top',
            context: contextReport,
            flow,
            summary: {
                score: contextReport.score,
                level:
                    contextReport.score >= 90
                        ? 'excellent'
                        : contextReport.score >= 70
                          ? 'high'
                          : 'needs-attention'
            }
        };

        if (!fs.existsSync(this.reportDir)) {
            fs.mkdirSync(this.reportDir, { recursive: true });
        }
        fs.writeFileSync(this.reportPath, JSON.stringify(report, null, 2), 'utf8');

        console.log('═════════════════════════════════════════════════════════════');
        console.log('✅ Sheikha Environment Fix');
        console.log(`• score: ${report.summary.score}`);
        console.log(`• level: ${report.summary.level}`);
        console.log(`• adc-ready: ${report.context.checks.adcReady ? 'yes' : 'no'}`);
        console.log(
            `• global-pulse-registered: ${report.context.checks.globalPulseScriptRegistered ? 'yes' : 'no'}`
        );
        console.log('• report: reports/operations/environment-fix-status.json');
        console.log('═════════════════════════════════════════════════════════════');

        return report;
    }
}

module.exports = SheikhaEnvironmentFixEngine;

if (require.main === module) {
    const engine = new SheikhaEnvironmentFixEngine();
    engine.activate().catch(error => {
        console.error('❌ فشل التفعيل:', error.message);
        process.exitCode = 1;
    });
}
