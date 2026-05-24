/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════
 * نظام القضاء الرقمي - إمبراطورية شيخة
 * Digital Judiciary System - Sheikha Empire
 * ═══════════════════════════════════════════════════════════════════
 *
 * المرجع: القرآن الكريم والسنة النبوية
 * المبدأ الأساسي: العدل المطلق - لا ضرر ولا ضرار
 *
 * الغرض: الفصل في النزاعات التجارية بالعدل والأمانة
 * ═══════════════════════════════════════════════════════════════════
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * نظام القضاء الرقمي
 */
class DigitalJudiciarySystem {
    constructor(config = {}) {
        this.owner = config.owner || 'سلمان أحمد الراجح';

        // المبادئ القضائية
        this.principles = {
            justice: 'العدل المطلق',
            noHarm: 'لا ضرر ولا ضرار',
            transparency: 'الشفافية الكاملة',
            mercy: 'الرحمة في التطبيق',
            wisdom: 'الحكمة في الحكم'
        };

        // قاعدة بيانات القضايا
        this.cases = [];
        this.resolvedCases = [];

        // الإحصائيات
        this.statistics = {
            totalCases: 0,
            resolved: 0,
            pending: 0,
            appealed: 0
        };

        // حالة النظام
        this.status = {
            operational: false,
            lastCase: null
        };
    }

    /**
     * تهيئة نظام القضاء
     */
    async initialize() {
        console.log('\n╔═══════════════════════════════════════════════════════════════╗');
        console.log('║                ⚖️ نظام القضاء الرقمي ⚖️                   ║');
        console.log('╠═══════════════════════════════════════════════════════════════╣');
        console.log('║  المرجع: القرآن والسنة                                      ║');
        console.log('║  المبدأ: العدل المطلق - لا ضرر ولا ضرار                   ║');
        console.log('╚═══════════════════════════════════════════════════════════════╝\n');

        this.status.operational = true;

        console.log('✅ نظام القضاء الرقمي مفعل وجاهز - الحمد لله\n');

        return {
            success: true,
            message: 'نظام القضاء جاهز للفصل في المنازعات',
            timestamp: new Date().toISOString()
        };
    }

    /**
     * تقديم قضية جديدة
     */
    async submitCase(caseData) {
        const caseId = `CASE-${Date.now()}`;

        const newCase = {
            id: caseId,
            plaintiff: caseData.plaintiff,
            defendant: caseData.defendant,
            type: caseData.type,
            description: caseData.description,
            evidence: caseData.evidence || [],
            status: 'pending',
            submittedAt: new Date()
        };

        this.cases.push(newCase);
        this.statistics.totalCases++;
        this.statistics.pending++;

        console.log(`\n📋 قضية جديدة: ${caseId}`);
        console.log(`   النوع: ${caseData.type}`);
        console.log(`   الحالة: في انتظار الفصل\n`);

        return {
            success: true,
            caseId: caseId,
            message: 'تم استلام القضية وستتم معالجتها'
        };
    }

    /**
     * الفصل في قضية
     */
    async adjudicateCase(caseId) {
        const caseIndex = this.cases.findIndex(c => c.id === caseId);

        if (caseIndex === -1) {
            return {
                success: false,
                message: 'القضية غير موجودة'
            };
        }

        const currentCase = this.cases[caseIndex];

        // تحليل القضية بناءً على المبادئ الشرعية
        const ruling = await this.analyzeBySharia(currentCase);

        // تحديث القضية
        currentCase.status = 'resolved';
        currentCase.ruling = ruling;
        currentCase.resolvedAt = new Date();

        // نقل للقضايا المحلولة
        this.resolvedCases.push(currentCase);
        this.cases.splice(caseIndex, 1);

        this.statistics.resolved++;
        this.statistics.pending--;
        this.status.lastCase = caseId;

        console.log(`\n⚖️ تم الفصل في القضية: ${caseId}`);
        console.log(`   الحكم: ${ruling.verdict}`);
        console.log(`   الأساس: ${ruling.basis}\n`);

        return {
            success: true,
            caseId: caseId,
            ruling: ruling,
            message: 'تم الفصل في القضية بالعدل'
        };
    }

    /**
     * التحليل بناءً على الشريعة
     */
    async analyzeBySharia(caseData) {
        const ruling = {
            caseId: caseData.id,
            verdict: '',
            basis: '',
            action: '',
            compensation: null,
            reasoning: []
        };

        // التحقق من الضرر
        if (caseData.evidence.some(e => e.type === 'harm_caused')) {
            ruling.verdict = 'يجب رد الضرر ودفع التعويض';
            ruling.basis = 'لا ضرر ولا ضرار (حديث نبوي شريف)';
            ruling.action = 'إعادة الحق لصاحبه مع التعويض عن الضرر';
            ruling.compensation = this.calculateCompensation(caseData);
            ruling.reasoning.push('ثبت وقوع الضرر');
            ruling.reasoning.push('الضرر يجب إزالته شرعاً');
        }
        // التحقق من الغرر
        else if (caseData.evidence.some(e => e.type === 'gharar')) {
            ruling.verdict = 'العقد باطل لوجود غرر';
            ruling.basis = 'نهي النبي ﷺ عن بيع الغرر';
            ruling.action = 'فسخ العقد وإعادة الأموال';
            ruling.reasoning.push('وجود جهالة في العقد');
            ruling.reasoning.push('العقد غير صحيح شرعاً');
        }
        // التحقق من الغش
        else if (caseData.evidence.some(e => e.type === 'fraud')) {
            ruling.verdict = 'ثبت الغش - يجب الرد والتعويض';
            ruling.basis = 'من غشنا فليس منا (حديث نبوي)';
            ruling.action = 'رد المال مع غرامة رادعة';
            ruling.compensation = this.calculateCompensation(caseData) * 1.5; // زيادة للردع
            ruling.reasoning.push('ثبت الغش والخداع');
            ruling.reasoning.push('الغش محرم شرعاً');
        }
        // التحقق من الشفافية
        else if (caseData.evidence.some(e => e.type === 'lack_of_transparency')) {
            ruling.verdict = 'نقص في الشفافية - يُعطى المشتري خيار الفسخ';
            ruling.basis = 'البيع عن تراضٍ وبيان';
            ruling.action = 'خيار الفسخ للمشتري أو تصحيح العقد';
            ruling.reasoning.push('لم تتحقق الشفافية الكاملة');
            ruling.reasoning.push('المشتري له حق الخيار');
        }
        // العقد صحيح
        else {
            ruling.verdict = 'العقد صحيح والالتزامات ملزمة';
            ruling.basis = 'استيفاء الشروط الشرعية للعقد';
            ruling.action = 'تنفيذ العقد كما هو';
            ruling.reasoning.push('العقد مستوفٍ للشروط');
            ruling.reasoning.push('لا مانع شرعي من التنفيذ');
        }

        return ruling;
    }

    /**
     * حساب التعويض
     */
    calculateCompensation(caseData) {
        // حساب تقريبي بناءً على الضرر
        const baseAmount = caseData.disputedAmount || 10000;
        const severity = caseData.severityLevel || 'medium';

        const multipliers = {
            low: 0.1,
            medium: 0.25,
            high: 0.5
        };

        return baseAmount * multipliers[severity];
    }

    /**
     * الحصول على إحصائيات القضاء
     */
    getStatistics() {
        return {
            total: this.statistics.totalCases,
            resolved: this.statistics.resolved,
            pending: this.statistics.pending,
            appealed: this.statistics.appealed,
            resolutionRate:
                this.statistics.totalCases > 0
                    ? ((this.statistics.resolved / this.statistics.totalCases) * 100).toFixed(2) +
                      '%'
                    : '0%'
        };
    }

    /**
     * الحصول على القضايا المعلقة
     */
    getPendingCases() {
        return this.cases.filter(c => c.status === 'pending');
    }

    /**
     * الحصول على القضايا المحلولة
     */
    getResolvedCases() {
        return this.resolvedCases;
    }
}

module.exports = DigitalJudiciarySystem;
