'use strict';

const {
    CONSULTING_ARCHITECTURE,
    CONSULTING_SERVICES,
    CONSULTING_PARTNERSHIPS,
    CONSULTING_SYSTEM
} = require('./sheikha-consulting');

class SheikhaConsultingRouter {
    route({ intent, data = {} } = {}) {
        const normalizedIntent = String(intent || '').trim().toLowerCase();

        switch (normalizedIntent) {
            case 'consulting.session':
                return this.handleConsultingSession(data);
            case 'roadmap.get':
                return this.handleRoadmapGet(data);
            case 'dominance.axes':
                return this.handleDominanceAxes();
            case 'consulting.network':
                return this.handleConsultingNetwork(data);
            default:
                return {
                    success: false,
                    message: 'intent غير مدعوم في Sheikha Consulting Router',
                    timestamp: new Date().toISOString(),
                    data: {
                        intent: normalizedIntent,
                        supportedIntents: [
                            'consulting.session',
                            'roadmap.get',
                            'dominance.axes',
                            'consulting.network'
                        ]
                    }
                };
        }
    }

    handleConsultingSession(data) {
        const clientId = String(data.clientId || 'did:sheikha:client:unknown');
        const domainId = String(data.domainId || 'GENERAL');
        const challenge = String(data.challenge || 'تحدٍ عام');

        const domainProfiles = {
            'TECH-AI': {
                name: 'استراتيجية الذكاء الاصطناعي',
                tracks: ['الحوكمة', 'البنية السحابية', 'البيانات', 'تبني الوكلاء الذكيين'],
                frameworks: ['SDAIA', 'NCA ECC', 'ISO 42001', 'NIST AI RMF']
            },
            FINANCE: {
                name: 'التمويل الإسلامي',
                tracks: ['حوكمة المنتجات', 'المخاطر', 'الامتثال الشرعي'],
                frameworks: ['AAOIFI', 'IFSB']
            },
            GOV: {
                name: 'التحول الحكومي',
                tracks: ['رقمنة الخدمات', 'إدارة الأداء', 'تجربة المستفيد'],
                frameworks: ['Vision 2030', 'Gov Excellence']
            }
        };

        const profile = domainProfiles[domainId] || {
            name: 'مسار استشاري عام',
            tracks: ['تشخيص', 'تصميم', 'تنفيذ'],
            frameworks: ['Best Practice']
        };

        return {
            success: true,
            message: 'تم إنشاء جلسة استشارية بنجاح',
            timestamp: new Date().toISOString(),
            data: {
                sessionId: `CONS-${Date.now()}`,
                clientId,
                domainId,
                challenge,
                profile,
                architectureLayer: CONSULTING_ARCHITECTURE.layers.technology,
                firstActions: [
                    'تحديد الحالة الراهنة (As-Is) خلال 7 أيام',
                    'بناء مستهدف 12-18 شهر (To-Be)',
                    'تشكيل فريق قيادة تنفيذي + شرعي + تقني',
                    'إنشاء لوحة مؤشرات قيمية وتشغيلية'
                ],
                covenant: 'وحدها لله ورقمنها بالكتاب والسنة'
            }
        };
    }

    handleRoadmapGet(data) {
        const phase = String(data.phase || '1');

        const phases = {
            '1': {
                name: 'الأساس',
                durationWeeks: 6,
                outcomes: ['تشخيص الوضع', 'حوكمة المبادرة', 'خارطة القدرات']
            },
            '2': {
                name: 'المسار التقني المسارع',
                durationWeeks: 12,
                outcomes: [
                    'منصة بيانات موحدة',
                    'إطلاق 3 حالات استخدام AI عالية الأثر',
                    'تفعيل مركز قيادة تشغيلي مباشر',
                    'ضوابط أخلاقية وشرعية قابلة للتدقيق'
                ],
                workstreams: [
                    'AI Governance',
                    'Data Foundation',
                    'Model Ops',
                    'Adoption & Capability Building'
                ]
            },
            '3': {
                name: 'التمكين والاتساع',
                durationWeeks: 16,
                outcomes: ['توسيع النطاق', 'أتمتة متقدمة', 'رفع النضج المؤسسي']
            }
        };

        const selected = phases[phase] || phases['1'];

        return {
            success: true,
            message: 'تم جلب خارطة الطريق',
            timestamp: new Date().toISOString(),
            data: {
                requestedPhase: phase,
                roadmap: selected,
                reference: CONSULTING_SYSTEM.getEngineStats()
            }
        };
    }

    handleDominanceAxes() {
        const axes = [
            'التوحيد القيمي والأخلاقي',
            'حوكمة البيانات',
            'سيادة البنية التحتية',
            'أمن رقمي استباقي',
            'جودة النماذج وموثوقيتها',
            'امتثال شرعي وتنظيمي',
            'إدارة المخاطر المؤسسية',
            'كفاءة العمليات والسرعة',
            'تمكين الكفاءات البشرية',
            'أثر اقتصادي مستدام',
            'شبكات شراكة استراتيجية',
            'قياس أثر شفاف وقابل للتدقيق'
        ];

        return {
            success: true,
            message: 'تم جلب محاور الهيمنة الأخلاقية الـ 12',
            timestamp: new Date().toISOString(),
            data: {
                count: axes.length,
                axes
            }
        };
    }

    handleConsultingNetwork(data) {
        const level = String(data.level || 'regional').toLowerCase();

        const mapByLevel = {
            local: {
                hubs: ['Saudi Government', 'National Regulators', 'Industrial Leaders']
            },
            regional: {
                hubs: ['GCC Policy Network', 'Regional Investment Corridors', 'Cross-border Programs']
            },
            universal: {
                hubs: [
                    'OIC + IsDB Strategic Network',
                    'UN/World Bank Knowledge Nodes',
                    'Global Technology & Research Alliances'
                ]
            }
        };

        return {
            success: true,
            message: 'تم جلب شبكة الاستشارات',
            timestamp: new Date().toISOString(),
            data: {
                level,
                network: mapByLevel[level] || mapByLevel.regional,
                partnerships: CONSULTING_PARTNERSHIPS.getPartnershipMap()
            }
        };
    }
}

const consultingRouter = new SheikhaConsultingRouter();

module.exports = {
    SheikhaConsultingRouter,
    consultingRouter
};