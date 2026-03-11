#!/usr/bin/env node
/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════
 * سكربت تشخيص وإصلاح البريد الإلكتروني - إمبراطورية شيخة
 * Email Diagnostic & Fix Script - Sheikha Empire
 * ═══════════════════════════════════════════════════════════════════
 *
 * القائد: سلمان أحمد بن سلمان الراجح
 * البريد: market@sheikha.top
 *
 * الغرض: تشخيص مشاكل البريد وإصلاحها فوراً
 * ═══════════════════════════════════════════════════════════════════
 */

const dns = require('dns').promises;
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

/**
 * نظام تشخيص وإصلاح البريد الإلكتروني
 */
class EmailDiagnosticSystem {
    constructor() {
        this.domain = 'sheikha.top';
        this.email = 'market@sheikha.top';
        this.issues = [];
        this.solutions = [];
    }

    /**
     * تشغيل التشخيص الشامل
     */
    async runCompleteDiagnostic() {
        console.log('\n╔═══════════════════════════════════════════════════════════════╗');
        console.log('║            🔍 تشخيص البريد الإلكتروني الشامل 🔍           ║');
        console.log('╠═══════════════════════════════════════════════════════════════╣');
        console.log(`║  النطاق: ${this.domain}                                      `);
        console.log(`║  البريد: ${this.email}                                       `);
        console.log('╚═══════════════════════════════════════════════════════════════╝\n');

        // 1. فحص DNS records
        await this.checkDNSRecords();

        // 2. فحص MX records
        await this.checkMXRecords();

        // 3. فحص SPF
        await this.checkSPFRecord();

        // 4. فحص DKIM
        await this.checkDKIMRecord();

        // 5. فحص DMARC
        await this.checkDMARCRecord();

        // 6. عرض التقرير النهائي
        this.displayReport();

        // 7. تطبيق الحلول
        await this.applySolutions();

        return {
            success: this.issues.length === 0,
            issues: this.issues,
            solutions: this.solutions
        };
    }

    /**
     * فحص DNS Records
     */
    async checkDNSRecords() {
        console.log('📡 [1/5] فحص DNS Records...\n');

        try {
            const addresses = await dns.resolve4(this.domain);
            console.log(`   ✅ DNS يعمل بشكل صحيح`);
            console.log(`      العناوين: ${addresses.join(', ')}\n`);
        } catch (error) {
            console.log(`   ❌ خطأ في DNS: ${error.message}\n`);
            this.issues.push({
                type: 'DNS',
                severity: 'high',
                message: 'DNS غير متاح أو غير مضبوط',
                solution: 'تأكد من إعدادات DNS في مزود النطاق'
            });
        }
    }

    /**
     * فحص MX Records
     */
    async checkMXRecords() {
        console.log('📬 [2/5] فحص MX Records (خوادم البريد)...\n');

        try {
            const mxRecords = await dns.resolveMx(this.domain);

            if (mxRecords && mxRecords.length > 0) {
                console.log(`   ✅ تم العثور على ${mxRecords.length} خادم بريد:`);
                mxRecords.forEach(mx => {
                    console.log(`      • ${mx.exchange} (أولوية: ${mx.priority})`);
                });
                console.log('');
            } else {
                throw new Error('لا توجد خوادم بريد');
            }
        } catch (error) {
            console.log(`   ❌ خطأ في MX Records: ${error.message}\n`);
            this.issues.push({
                type: 'MX',
                severity: 'critical',
                message: 'لا توجد خوادم بريد مضبوطة',
                solution: 'أضف MX records في إعدادات DNS'
            });

            this.solutions.push({
                title: 'إضافة MX Records',
                steps: [
                    'اذهب إلى لوحة تحكم النطاق',
                    'أضف MX record يشير إلى خادم Google Workspace أو بريدك',
                    'مثال: MX 10 aspmx.l.google.com',
                    'انتظر 15-60 دقيقة لتفعيل التغييرات'
                ]
            });
        }
    }

    /**
     * فحص SPF Record
     */
    async checkSPFRecord() {
        console.log('🛡️ [3/5] فحص SPF Record (مكافحة الانتحال)...\n');

        try {
            const txtRecords = await dns.resolveTxt(this.domain);
            const spfRecord = txtRecords.find(record => record.join('').includes('v=spf1'));

            if (spfRecord) {
                console.log(`   ✅ SPF موجود: ${spfRecord.join('')}\n`);
            } else {
                throw new Error('SPF غير موجود');
            }
        } catch (error) {
            console.log(`   ⚠️ تحذير: SPF غير مضبوط\n`);
            this.issues.push({
                type: 'SPF',
                severity: 'medium',
                message: 'SPF record غير موجود',
                solution: 'أضف SPF record لحماية من Spoofing'
            });

            this.solutions.push({
                title: 'إضافة SPF Record',
                steps: [
                    'أضف TXT record في DNS:',
                    'النوع: TXT',
                    'الاسم: @ (أو sheikha.top)',
                    'القيمة: v=spf1 include:_spf.google.com ~all',
                    'هذا يسمح لـ Google بإرسال بريد باسم النطاق'
                ]
            });
        }
    }

    /**
     * فحص DKIM Record
     */
    async checkDKIMRecord() {
        console.log('🔐 [4/5] فحص DKIM Record (التوقيع الرقمي)...\n');

        try {
            // محاولة فحص DKIM selector الشائع
            const dkimSelector = 'google._domainkey';
            const dkimDomain = `${dkimSelector}.${this.domain}`;

            const dkimRecords = await dns.resolveTxt(dkimDomain);

            if (dkimRecords && dkimRecords.length > 0) {
                console.log(`   ✅ DKIM موجود\n`);
            } else {
                throw new Error('DKIM غير موجود');
            }
        } catch (error) {
            console.log(`   ⚠️ تحذير: DKIM غير مضبوط أو غير موجود\n`);
            this.issues.push({
                type: 'DKIM',
                severity: 'medium',
                message: 'DKIM record غير موجود',
                solution: 'أضف DKIM record من Google Workspace'
            });

            this.solutions.push({
                title: 'إضافة DKIM Record',
                steps: [
                    'اذهب إلى Google Workspace Admin',
                    'التطبيقات > Google Workspace > Gmail > Authenticate email',
                    'انسخ DKIM key',
                    'أضفه كـ TXT record في DNS',
                    'الاسم: google._domainkey',
                    'القيمة: المفتاح من Google'
                ]
            });
        }
    }

    /**
     * فحص DMARC Record
     */
    async checkDMARCRecord() {
        console.log('⚔️ [5/5] فحص DMARC Record (سياسة الحماية)...\n');

        try {
            const dmarcDomain = `_dmarc.${this.domain}`;
            const dmarcRecords = await dns.resolveTxt(dmarcDomain);

            if (dmarcRecords && dmarcRecords.length > 0) {
                console.log(`   ✅ DMARC موجود: ${dmarcRecords[0].join('')}\n`);
            } else {
                throw new Error('DMARC غير موجود');
            }
        } catch (error) {
            console.log(`   ⚠️ تحذير: DMARC غير مضبوط\n`);
            this.issues.push({
                type: 'DMARC',
                severity: 'low',
                message: 'DMARC record غير موجود',
                solution: 'أضف DMARC record لسياسة الحماية'
            });

            this.solutions.push({
                title: 'إضافة DMARC Record',
                steps: [
                    'أضف TXT record في DNS:',
                    'الاسم: _dmarc',
                    'القيمة: v=DMARC1; p=quarantine; rua=mailto:dmarc@sheikha.top',
                    'هذا يحمي من انتحال النطاق'
                ]
            });
        }
    }

    /**
     * عرض التقرير النهائي
     */
    displayReport() {
        console.log('\n╔═══════════════════════════════════════════════════════════════╗');
        console.log('║                    📊 التقرير النهائي 📊                   ║');
        console.log('╚═══════════════════════════════════════════════════════════════╝\n');

        if (this.issues.length === 0) {
            console.log('✅ الحمد لله! النطاق مضبوط بشكل كامل\n');
            console.log('   البريد جاهز للعمل بكفاءة عالية\n');
        } else {
            console.log(`⚠️ تم اكتشاف ${this.issues.length} مشكلة:\n`);

            this.issues.forEach((issue, index) => {
                const icon =
                    issue.severity === 'critical'
                        ? '🔴'
                        : issue.severity === 'high'
                          ? '🟠'
                          : issue.severity === 'medium'
                            ? '🟡'
                            : '🟢';

                console.log(`   ${icon} [${index + 1}] ${issue.type}: ${issue.message}`);
                console.log(`      الحل: ${issue.solution}\n`);
            });
        }
    }

    /**
     * تطبيق الحلول
     */
    async applySolutions() {
        if (this.solutions.length === 0) {
            return;
        }

        console.log('\n╔═══════════════════════════════════════════════════════════════╗');
        console.log('║                  🔧 الحلول المقترحة 🔧                    ║');
        console.log('╚═══════════════════════════════════════════════════════════════╝\n');

        this.solutions.forEach((solution, index) => {
            console.log(`📋 الحل ${index + 1}: ${solution.title}\n`);
            solution.steps.forEach((step, stepIndex) => {
                console.log(`   ${stepIndex + 1}. ${step}`);
            });
            console.log('');
        });

        console.log('═══════════════════════════════════════════════════════════════');
        console.log('⚡ بعد تطبيق الحلول أعلاه:');
        console.log('   1. انتظر 15-60 دقيقة لانتشار DNS');
        console.log('   2. شغّل هذا السكربت مرة أخرى للتأكد');
        console.log('   3. اختبر إرسال بريد من market@sheikha.top');
        console.log('═══════════════════════════════════════════════════════════════\n');
    }

    /**
     * اختبار إرسال بريد تجريبي
     */
    async testEmailSending() {
        console.log('\n📧 اختبار إرسال بريد تجريبي...\n');

        console.log('   ℹ️  لاختبار البريد يدوياً:');
        console.log('      1. اذهب إلى mail.google.com');
        console.log('      2. سجّل دخول بـ market@sheikha.top');
        console.log('      3. أرسل رسالة لنفسك أو لبريد آخر');
        console.log('      4. تأكد من وصول الرسالة\n');
    }
}

/**
 * تشغيل التشخيص
 */
async function main() {
    try {
        const diagnostic = new EmailDiagnosticSystem();
        const result = await diagnostic.runCompleteDiagnostic();

        await diagnostic.testEmailSending();

        console.log('╔═══════════════════════════════════════════════════════════════╗');
        console.log('║              ✅ التشخيص مكتمل - الحمد لله ✅              ║');
        console.log('╚═══════════════════════════════════════════════════════════════╝\n');

        process.exit(result.success ? 0 : 1);
    } catch (error) {
        console.error('\n❌ خطأ في التشخيص:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = EmailDiagnosticSystem;
