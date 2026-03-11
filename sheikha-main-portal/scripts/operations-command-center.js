#!/usr/bin/env node
/**
 * بسم الله الرحمن الرحيم
 *
 * إمبراطورية شيخة - غرفة العمليات المركزية
 * Sheikha Empire - Operations Command Center
 *
 * القائد: سلمان بن أحمد الراجح
 * المنظمة: 224557279528
 * البريد: market@sheikha.top
 *
 * الهدف: مراقبة لحظية لجميع الأنظمة والشراكات والحوارات
 *
 * المبادئ: الشفافية | المساءلة | الإتقان | الأمانة
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ═══════════════════════════════════════════════════════════════════
// 🎯 التكوين (Configuration)
// ═══════════════════════════════════════════════════════════════════

const CONFIG = {
    refreshInterval: 5000, // 5 ثواني
    organization: '224557279528',
    operator: 'market@sheikha.top',
    leader: 'سلمان بن أحمد الراجح'
};

// ═══════════════════════════════════════════════════════════════════
// 🎛️ غرفة العمليات المركزية (Command Center)
// ═══════════════════════════════════════════════════════════════════

class OperationsCommandCenter {
    constructor() {
        this.startTime = Date.now();
        this.checkCount = 0;
        this.alerts = [];
    }

    /**
     * 🚀 بدء المراقبة (Start Monitoring)
     */
    async start() {
        console.clear();
        this.printHeader();

        await this.runFullDiagnostics();

        console.log('\n' + '═'.repeat(80));
        console.log('✅ غرفة العمليات المركزية نشطة وتعمل');
        console.log('═'.repeat(80) + '\n');
    }

    /**
     * 📊 طباعة الترويسة (Print Header)
     */
    printHeader() {
        const now = new Date();
        console.log('═'.repeat(80));
        console.log('🌟 بسم الله الرحمن الرحيم');
        console.log('═'.repeat(80));
        console.log('🎛️  إمبراطورية شيخة - غرفة العمليات المركزية');
        console.log('    Sheikha Empire - Operations Command Center');
        console.log('═'.repeat(80));
        console.log(
            `📅 التاريخ: ${now.toLocaleDateString('ar-SA')} | ${now.toLocaleDateString('en-US')}`
        );
        console.log(
            `⏰ الوقت:  ${now.toLocaleTimeString('ar-SA')} | ${now.toLocaleTimeString('en-US')}`
        );
        console.log(`👤 القائد: ${CONFIG.leader}`);
        console.log(`🏢 المنظمة: ${CONFIG.organization}`);
        console.log(`📧 البريد: ${CONFIG.operator}`);
        console.log('═'.repeat(80) + '\n');
    }

    /**
     * 🔍 تشخيص كامل للأنظمة (Full System Diagnostics)
     */
    async runFullDiagnostics() {
        this.checkCount++;
        console.log(`🔍 الفحص رقم: ${this.checkCount}`);
        console.log(`⏱️  وقت التشغيل: ${this.getUptime()}\n`);

        // 1. فحص البيئة التشغيلية
        await this.checkEnvironment();

        // 2. فحص PM2 والعمليات الخلفية
        await this.checkPM2Status();

        // 3. فحص الملفات المولدة
        await this.checkGeneratedArtifacts();

        // 4. فحص حالة التكامل مع الشركاء
        await this.checkPartnersStatus();

        // 5. فحص حالة Google Cloud
        await this.checkGoogleCloudStatus();

        // 6. عرض التنبيهات
        this.displayAlerts();

        // 7. التوصيات
        this.displayRecommendations();
    }

    /**
     * 🖥️ فحص البيئة التشغيلية (Check Environment)
     */
    async checkEnvironment() {
        console.log('┌─ 🖥️  البيئة التشغيلية');
        console.log('│');

        try {
            const nodeVersion = process.version;
            console.log(`│  ✅ Node.js: ${nodeVersion}`);

            const npmVersion = execSync('npm --version', { encoding: 'utf-8' }).trim();
            console.log(`│  ✅ npm: v${npmVersion}`);

            const gitInstalled = this.commandExists('git');
            console.log(
                `│  ${gitInstalled ? '✅' : '❌'} Git: ${gitInstalled ? 'مثبت' : 'غير مثبت'}`
            );

            const gcloudInstalled = this.commandExists('gcloud');
            console.log(
                `│  ${gcloudInstalled ? '✅' : '⚠️ '} gcloud SDK: ${gcloudInstalled ? 'مثبت' : 'غير مثبت'}`
            );

            if (!gcloudInstalled) {
                this.addAlert('warning', 'gcloud SDK غير مثبت - مطلوب لـ Google Cloud');
            }

            const workspaceDir = process.cwd();
            console.log(`│  📁 المسار: ${workspaceDir}`);
        } catch (error) {
            console.log(`│  ❌ خطأ في فحص البيئة: ${error.message}`);
            this.addAlert('error', `خطأ في فحص البيئة: ${error.message}`);
        }

        console.log('└─\n');
    }

    /**
     * ⚙️ فحص حالة PM2 (Check PM2 Status)
     */
    async checkPM2Status() {
        console.log('┌─ ⚙️  العمليات الخلفية (PM2)');
        console.log('│');

        try {
            const pm2List = execSync('npx pm2 jlist', { encoding: 'utf-8' });
            const processes = JSON.parse(pm2List);

            if (processes.length === 0) {
                console.log('│  ⚠️  لا توجد عمليات PM2 نشطة');
                this.addAlert('warning', 'لا توجد عمليات PM2 نشطة');
            } else {
                processes.forEach(proc => {
                    const status = proc.pm2_env.status;
                    const uptime = this.formatUptime(proc.pm2_env.pm_uptime);
                    const memory = this.formatBytes(proc.monit.memory);
                    const cpu = proc.monit.cpu;

                    const statusIcon = status === 'online' ? '✅' : '❌';
                    console.log(`│  ${statusIcon} ${proc.name}`);
                    console.log(`│     الحالة: ${status} | المدة: ${uptime}`);
                    console.log(`│     الذاكرة: ${memory} | المعالج: ${cpu}%`);
                    console.log(`│`);

                    if (status !== 'online') {
                        this.addAlert('error', `عملية ${proc.name} متوقفة`);
                    }
                });
            }
        } catch (error) {
            console.log(`│  ℹ️  PM2 غير مفعل أو لا توجد عمليات`);
        }

        console.log('└─\n');
    }

    /**
     * 📦 فحص الملفات المولدة (Check Generated Artifacts)
     */
    async checkGeneratedArtifacts() {
        console.log('┌─ 📦 الملفات المولدة');
        console.log('│');

        const artifacts = [
            'AUTO-GCLOUD-ACTIVATION-STATUS.json',
            'PRODUCTION-COVENANT-SYNC-REPORT.json',
            'SHEIKHA-GOOGLE-SUMMIT-PACK.json',
            'SHEIKHA-GOOGLE-SUMMIT-PACK.md',
            'ENTREPRENEURS-ENABLEMENT-PLAN.json',
            'LLM-DIALOGUE-TRAINING-REPORT.json',
            'AUTOMATED-SYNERGY-DIALOGUE-REPORT.json',
            'AUTOMATED-SYNERGY-DIALOGUE-REPORT.md',
            'PARTNERS-INTEGRATION-REPORT.json',
            'PARTNERS-INTEGRATION-REPORT.md',
            'data/SHEIKHA-TAWHEED-UNITY.json'
        ];

        let foundCount = 0;
        let missingCount = 0;

        artifacts.forEach(artifact => {
            const artifactPath = path.join(__dirname, '..', artifact);
            const exists = fs.existsSync(artifactPath);

            if (exists) {
                const stats = fs.statSync(artifactPath);
                const size = this.formatBytes(stats.size);
                const time = stats.mtime.toLocaleString('ar-SA');
                console.log(`│  ✅ ${artifact}`);
                console.log(`│     الحجم: ${size} | آخر تعديل: ${time}`);
                foundCount++;
            } else {
                console.log(`│  ❌ ${artifact} (مفقود)`);
                missingCount++;
            }
        });

        console.log(`│`);
        console.log(`│  📊 الإجمالي: ${foundCount} موجود، ${missingCount} مفقود`);
        console.log('└─\n');
    }

    /**
     * 🤝 فحص حالة الشركاء (Check Partners Status)
     */
    async checkPartnersStatus() {
        console.log('┌─ 🤝 حالة الشركاء');
        console.log('│');

        const reportPath = path.join(__dirname, '..', 'PARTNERS-INTEGRATION-REPORT.json');

        if (fs.existsSync(reportPath)) {
            try {
                const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));

                console.log(`│  📊 إجمالي الشركاء: ${report.summary.totalPartners}`);
                console.log(`│  ✅ جاهز: ${report.summary.ready}`);
                console.log(`│  ⚠️  محظور: ${report.summary.blocked}`);
                console.log(`│  📅 مخطط: ${report.summary.planned}`);
                console.log(`│`);

                // عرض الشركاء الاستراتيجيين
                console.log(`│  🎯 الشركاء الاستراتيجيون:`);
                report.strategicPartners.forEach(p => {
                    const icon =
                        p.readiness === 'ready' ? '✅' : p.readiness === 'blocked' ? '⚠️' : '📅';
                    console.log(`│     ${icon} ${p.partnerName}: ${p.readiness}`);
                });
            } catch (error) {
                console.log(`│  ❌ خطأ في قراءة تقرير الشركاء: ${error.message}`);
            }
        } else {
            console.log(`│  ⚠️  تقرير الشركاء غير موجود`);
            console.log(`│  💡 تشغيل: node scripts/partners-integration-engine.js`);
        }

        console.log('└─\n');
    }

    /**
     * ☁️ فحص حالة Google Cloud (Check Google Cloud Status)
     */
    async checkGoogleCloudStatus() {
        console.log('┌─ ☁️  Google Cloud Platform');
        console.log('│');

        const statusPath = path.join(__dirname, '..', 'AUTO-GCLOUD-ACTIVATION-STATUS.json');

        if (fs.existsSync(statusPath)) {
            try {
                const status = JSON.parse(fs.readFileSync(statusPath, 'utf-8'));

                console.log(`│  المنظمة: ${status.organization}`);
                console.log(`│  المشاريع: ${status.projects.join(', ')}`);
                console.log(`│`);
                console.log(`│  الحالة:`);

                const checks = status.readinessChecks || status.checks || {};
                Object.entries(checks).forEach(([key, value]) => {
                    const icon = value ? '✅' : '❌';
                    console.log(`│    ${icon} ${key}: ${value ? 'جاهز' : 'غير جاهز'}`);
                });

                // فحص الجاهزية الإجمالية
                const allReady = Object.values(checks).every(v => v === true);
                console.log(`│`);
                if (allReady) {
                    console.log(`│  🎉 Google Cloud جاهز بالكامل!`);
                } else {
                    console.log(`│  ⏳ Google Cloud ينتظر المتطلبات`);
                    this.addAlert('info', 'Google Cloud ينتظر اكتمال المتطلبات');
                }
            } catch (error) {
                console.log(`│  ❌ خطأ في قراءة حالة Google Cloud: ${error.message}`);
            }
        } else {
            console.log(`│  ⚠️  ملف حالة Google Cloud غير موجود`);
        }

        console.log('└─\n');
    }

    /**
     * 🚨 عرض التنبيهات (Display Alerts)
     */
    displayAlerts() {
        if (this.alerts.length === 0) {
            return;
        }

        console.log('┌─ 🚨 التنبيهات');
        console.log('│');

        this.alerts.forEach((alert, idx) => {
            const icon = alert.level === 'error' ? '🔴' : alert.level === 'warning' ? '🟡' : 'ℹ️';
            console.log(`│  ${icon} ${alert.message}`);
        });

        console.log('└─\n');
    }

    /**
     * 💡 عرض التوصيات (Display Recommendations)
     */
    displayRecommendations() {
        console.log('┌─ 💡 التوصيات الحالية');
        console.log('│');
        console.log('│  1. الحصول على بطاقة ائتمان (ليس mada) لـ Google Cloud');
        console.log('│  2. تثبيت gcloud SDK: curl https://sdk.cloud.google.com | bash');
        console.log('│  3. تكوين DNS (MX, SPF) لنطاق sheikha.top');
        console.log('│  4. المصادقة مع gcloud: gcloud auth login');
        console.log('│  5. ربط حساب الفوترة بالمنظمة 224557279528');
        console.log('│  6. تفعيل Vertex AI لخدمات الذكاء الاصطناعي');
        console.log('└─\n');
    }

    /**
     * 🕐 حساب وقت التشغيل (Get Uptime)
     */
    getUptime() {
        const uptime = Date.now() - this.startTime;
        return this.formatUptime(uptime);
    }

    /**
     * 📏 تنسيق وقت التشغيل (Format Uptime)
     */
    formatUptime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ${hours % 24}h`;
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }

    /**
     * 💾 تنسيق الحجم (Format Bytes)
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
    }

    /**
     * ✅ فحص وجود أمر (Command Exists)
     */
    commandExists(command) {
        try {
            execSync(`which ${command}`, { stdio: 'ignore' });
            return true;
        } catch {
            return false;
        }
    }

    /**
     * 🚨 إضافة تنبيه (Add Alert)
     */
    addAlert(level, message) {
        this.alerts.push({ level, message, timestamp: Date.now() });
    }

    /**
     * 💾 حفظ تقرير اللقطة (Save Snapshot Report)
     */
    async saveSnapshot() {
        const snapshot = {
            timestamp: new Date().toISOString(),
            uptime: this.getUptime(),
            checkCount: this.checkCount,
            alerts: this.alerts,
            organization: CONFIG.organization,
            operator: CONFIG.operator
        };

        const snapshotPath = path.join(__dirname, '..', 'OPERATIONS-COMMAND-CENTER-SNAPSHOT.json');
        fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2), 'utf-8');

        console.log(`\n💾 تم حفظ لقطة غرفة العمليات: ${snapshotPath}\n`);
    }
}

// ═══════════════════════════════════════════════════════════════════
// 🚀 التنفيذ الرئيسي (Main Execution)
// ═══════════════════════════════════════════════════════════════════

async function main() {
    const center = new OperationsCommandCenter();
    await center.start();
    await center.saveSnapshot();

    console.log('═'.repeat(80));
    console.log('📊 تم إنشاء تقرير غرفة العمليات المركزية بنجاح');
    console.log('═'.repeat(80) + '\n');
}

// ═══════════════════════════════════════════════════════════════════
// 🎬 تشغيل السكربت (Run Script)
// ═══════════════════════════════════════════════════════════════════

if (require.main === module) {
    main().catch(error => {
        console.error('❌ خطأ في غرفة العمليات المركزية:', error.message);
        process.exit(1);
    });
}

module.exports = { OperationsCommandCenter };
