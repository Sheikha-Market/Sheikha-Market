/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * ShariaPipeline — خط أنابيب التدقيق الشرعي
 * "وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا" — البقرة ٢٧٥
 *
 * يُمرّر كل معاملة أو منتج عبر بوابات التدقيق الشرعي:
 *   1. التحقق من غياب الربا
 *   2. التحقق من غياب الغرر (الجهالة)
 *   3. التحقق من غياب الغش والتدليس
 *   4. التحقق من التراضي بين الطرفين
 *   5. التحقق من غياب الضرر
 * ═══════════════════════════════════════════════════════════════════════════════
 */
'use strict';

const PipelineEngine = require('./PipelineEngine');

// ── الأدلة الشرعية ─────────────────────────────────────────────────────────────
const SHARIA_RULES = {
    noRiba: {
        nameAr: 'لا ربا',
        evidence: 'وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا — البقرة ٢٧٥',
        check: (item) => {
            const rate = item.interestRate || item.فائدة || 0;
            return { passed: rate === 0, violation: rate !== 0 ? 'يحتوي على فائدة ربوية' : null };
        }
    },
    noGharar: {
        nameAr: 'لا غرر',
        evidence: 'نهى رسول الله ﷺ عن بيع الغرر — مسلم',
        check: (item) => {
            // طلبات البحث والاستعلام لا تحتاج سعراً وكمية
            if (item._type === 'query' || item._type === 'search' || item._type === 'read') {
                return { passed: true, violation: null };
            }
            const hasPrice    = item.price !== undefined && item.price !== null && !isNaN(item.price);
            const hasQuantity = item.quantity !== undefined && item.quantity !== null;
            const passed      = hasPrice && hasQuantity;
            return { passed, violation: !passed ? 'السعر أو الكمية غير محددة (غرر)' : null };
        }
    },
    noGhish: {
        nameAr: 'لا غش',
        evidence: 'مَنْ غَشَّنَا فَلَيْسَ مِنَّا — مسلم',
        check: (item) => {
            const suspicious = item._suspicious || item.مشبوه || false;
            return { passed: !suspicious, violation: suspicious ? 'محتوى مشبوه أو مضلِّل' : null };
        }
    },
    mutualConsent: {
        nameAr: 'التراضي',
        evidence: 'إِلَّا أَن تَكُونَ تِجَارَةً عَن تَرَاضٍ مِّنكُمْ — النساء ٢٩',
        check: (item) => {
            // التراضي مطلوب في عمليات البيع، وليس في الاستعلام
            if (item._type === 'query' || item._type === 'read') return { passed: true, violation: null };
            const consented = item.consented || item.تراضٍ || item._type === 'listing';
            return { passed: !!consented, violation: !consented ? 'لم يثبت التراضي بين الطرفين' : null };
        }
    },
    noHarm: {
        nameAr: 'لا ضرر ولا ضرار',
        evidence: 'لا ضرر ولا ضرار — ابن ماجه',
        check: (item) => {
            const harmful = item._harmful || item.ضار || false;
            return { passed: !harmful, violation: harmful ? 'العملية تُلحق ضرراً' : null };
        }
    }
};

/**
 * ينشئ خط أنابيب التدقيق الشرعي
 * @param {object} [options]
 * @returns {PipelineEngine}
 */
function createShariaPipeline(options = {}) {
    const pipeline = new PipelineEngine({
        name: options.name || 'sharia-pipeline',
        nameAr: options.nameAr || 'خط أنابيب التدقيق الشرعي',
        mode: 'serial',
        stopOnError: false   // لا نوقف — نجمع كل الانتهاكات
    });

    // ── الخطوة 1: جمع جميع بوابات التدقيق الشرعي ─────────────────────────────
    pipeline.addStep({
        name: 'sharia-audit',
        nameAr: 'التدقيق الشرعي الشامل',
        handler: async (input) => {
            const items = Array.isArray(input) ? input : [input];

            return items.map(item => {
                const checks   = {};
                const violations = [];
                let compliant  = true;

                for (const [ruleKey, rule] of Object.entries(SHARIA_RULES)) {
                    const result = rule.check(item);
                    checks[ruleKey] = { ...result, nameAr: rule.nameAr, evidence: rule.evidence };
                    if (!result.passed) {
                        compliant = false;
                        violations.push({ rule: ruleKey, nameAr: rule.nameAr, reason: result.violation });
                    }
                }

                return {
                    ...item,
                    _shariaAudit: {
                        compliant,
                        checks,
                        violations,
                        auditedAt: new Date().toISOString()
                    }
                };
            });
        }
    });

    // ── الخطوة 2: الفصل — مقبول / مرفوض ─────────────────────────────────────
    pipeline.addStep({
        name: 'classify',
        nameAr: 'تصنيف النتائج',
        handler: async (items) => {
            const compliant    = items.filter(i => i._shariaAudit?.compliant);
            const nonCompliant = items.filter(i => !i._shariaAudit?.compliant);

            return {
                compliant,
                nonCompliant,
                summary: {
                    total:          items.length,
                    compliantCount: compliant.length,
                    rejectedCount:  nonCompliant.length,
                    passRate:       items.length > 0
                        ? Math.round((compliant.length / items.length) * 100)
                        : 100
                }
            };
        }
    });

    return pipeline;
}

module.exports = { createShariaPipeline, SHARIA_RULES };
