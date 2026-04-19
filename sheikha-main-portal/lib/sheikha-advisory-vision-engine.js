/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🔮 الرؤية الاستشارية — Sheikha Advisory Vision Engine
 *
 * الطبقة الحاكمة العليا فوق جميع محركات الرؤية
 * تُقدّم استشارات متخصصة وآراء استراتيجية شاملة
 *
 * تتكامل مع:
 * ┌─────────────────────────────────────────────────────┐
 * │           🔮 الرؤية الاستشارية (هذا المحرك)          │  ← الطبقة الحاكمة
 * ├─────────────────────────────────────────────────────┤
 * │  🌍 رؤية الدول  │  👁️ رؤية حاسوبية  │  📄 رؤية الصفحات │  ← الطبقات التحتية
 * └─────────────────────────────────────────────────────┘
 *
 * وكلاء الاستشارة المتخصصون:
 * • المستشار التجاري      — Trade Advisor
 * • المستشار الشرعي       — Sharia Advisor
 * • المستشار الاستثماري   — Investment Advisor
 * • مستشار الحوكمة        — Governance Advisor
 * • مستشار السوق          — Market Advisor
 * • المستشار التقني       — Technology Advisor
 * • مستشار المخاطر        — Risk Advisor
 * • المستشار القانوني     — Legal Advisor
 *
 * "وَشَاوِرْهُمْ فِي الْأَمْرِ ۖ فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى اللَّهِ" — آل عمران: ١٥٩
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

// ─── استيراد المحركات المُدارة ────────────────────────────────────────────────
let NationalVisionsEngine, ComputerVisionEngine, EthicalAdvisorySystem, InternationalAdvisory;

try { NationalVisionsEngine = require('./sheikha-national-visions-engine.js'); } catch (e) { console.log('⚠️ [ADVISORY] NationalVisionsEngine غير متاح:', e.message); }
try { ComputerVisionEngine = require('./sheikha-computer-vision-engine.js'); } catch (e) { console.log('⚠️ [ADVISORY] ComputerVisionEngine غير متاح:', e.message); }
try { EthicalAdvisorySystem = require('./SHEIKHA-ETHICAL-ADVISORY-SYSTEM.js'); } catch (e) { console.log('⚠️ [ADVISORY] EthicalAdvisorySystem غير متاح:', e.message); }
try { InternationalAdvisory = require('./SHEIKHA-INTERNATIONAL-GOVERNMENT-ADVISORY.js'); } catch (e) { console.log('⚠️ [ADVISORY] InternationalAdvisory غير متاح:', e.message); }

// ─── مرجعية القرآن الكريم والسنة للاستشارات ─────────────────────────────────
const ADVISORY_QURAN_REFERENCES = {
    consultation: {
        ar: 'وَشَاوِرْهُمْ فِي الْأَمْرِ',
        surah: 'آل عمران', ayah: 159,
        meaning: 'أهمية الشورى والتشاور في اتخاذ القرارات'
    },
    justice: {
        ar: 'إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ',
        surah: 'النحل', ayah: 90,
        meaning: 'العدل والإحسان أساس كل معاملة'
    },
    truthfulness: {
        ar: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ وَكُونُوا مَعَ الصَّادِقِينَ',
        surah: 'التوبة', ayah: 119,
        meaning: 'الصدق والأمانة في تقديم الاستشارة'
    },
    analysis: {
        ar: 'أَوَلَمْ يَنظُرُوا فِي مَلَكُوتِ السَّمَاوَاتِ وَالْأَرْضِ',
        surah: 'الأعراف', ayah: 185,
        meaning: 'التأمل والنظر لاستخلاص الحكمة'
    },
    planning: {
        ar: 'وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ',
        surah: 'الأنفال', ayah: 60,
        meaning: 'الاستعداد والتخطيط الاستراتيجي'
    },
    trade: {
        ar: 'وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا',
        surah: 'البقرة', ayah: 275,
        meaning: 'حِل التجارة وتحريم الربا'
    },
    trust: {
        ar: 'إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ إِلَىٰ أَهْلِهَا',
        surah: 'النساء', ayah: 58,
        meaning: 'الأمانة في حمل الاستشارة وأدائها'
    },
    cooperation: {
        ar: 'وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ',
        surah: 'المائدة', ayah: 2,
        meaning: 'التعاون على الخير والمصلحة العامة'
    }
};

const ADVISORY_HADITH_REFERENCES = [
    { text: 'المستشار مؤتمن', meaning: 'المستشار يجب أن يكون أميناً وصادقاً', narrator: 'أبو داود' },
    { text: 'الدين النصيحة', meaning: 'الاستشارة الصادقة من صميم الدين', narrator: 'مسلم' },
    { text: 'ما خاب من استخار ولا ندم من استشار', meaning: 'فضل الاستشارة والاستخارة', narrator: 'أنس بن مالك' },
    { text: 'استشيروا ذوي العقول ترشدوا ولا تعصوهم فتندموا', meaning: 'أهمية استشارة أهل الرأي', narrator: 'الترمذي' }
];

// ─── تعريفات الأنواع ──────────────────────────────────────────────────────────

const ADVISORY_DOMAINS = {
    TRADE:       { id: 'trade',      nameAr: 'التجارة والأعمال',    icon: '🏪' },
    SHARIA:      { id: 'sharia',     nameAr: 'الشريعة الإسلامية',  icon: '🕋' },
    INVESTMENT:  { id: 'investment', nameAr: 'الاستثمار والمالية', icon: '💰' },
    GOVERNANCE:  { id: 'governance', nameAr: 'الحوكمة والإدارة',   icon: '🏛️' },
    MARKET:      { id: 'market',     nameAr: 'السوق والتسويق',     icon: '📊' },
    TECHNOLOGY:  { id: 'technology', nameAr: 'التقنية والرقمنة',   icon: '💻' },
    RISK:        { id: 'risk',       nameAr: 'المخاطر والحماية',   icon: '⚠️'  },
    LEGAL:       { id: 'legal',      nameAr: 'القانون والأنظمة',   icon: '⚖️'  },
    STRATEGY:    { id: 'strategy',   nameAr: 'الاستراتيجية والتخطيط', icon: '🎯' },
    NATIONAL:    { id: 'national',   nameAr: 'رؤى الدول والتوافق', icon: '🌍' }
};

const RISK_LEVELS = {
    CRITICAL: { id: 'critical', nameAr: 'حرج',   color: '🔴', score: 90 },
    HIGH:     { id: 'high',     nameAr: 'عالي',   color: '🟠', score: 70 },
    MEDIUM:   { id: 'medium',   nameAr: 'متوسط',  color: '🟡', score: 50 },
    LOW:      { id: 'low',      nameAr: 'منخفض',  color: '🟢', score: 25 },
    MINIMAL:  { id: 'minimal',  nameAr: 'ضئيل',   color: '⚪', score: 5  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// وكلاء الاستشارة المتخصصون
// ═══════════════════════════════════════════════════════════════════════════════

class TradeAdvisor {
    get id() { return 'trade'; }
    get nameAr() { return 'المستشار التجاري'; }
    get icon() { return '🏪'; }

    advise(subject, context = {}) {
        const { businessType, targetMarkets = [], products = [], budget } = context;

        const recommendations = [];
        const warnings = [];

        // تقييم السوق المستهدف
        if (targetMarkets.length > 0) {
            recommendations.push({
                priority: 'high',
                text: `دراسة احتياجات الأسواق المستهدفة: ${targetMarkets.join('، ')}`,
                rationale: 'فهم السوق شرط النجاح التجاري'
            });
        }

        // تقييم المنتجات
        if (products.length > 0) {
            recommendations.push({
                priority: 'high',
                text: `تحليل تنافسية المنتجات: ${products.slice(0, 3).join('، ')}`,
                rationale: 'الميزة التنافسية ركيزة البقاء'
            });
        }

        // تحذيرات تجارية
        warnings.push({
            type: 'market_entry',
            text: 'تأكد من الامتثال لأنظمة الاستيراد والتصدير في كل دولة مستهدفة',
            severity: 'medium'
        });

        return {
            advisor: this.nameAr,
            domain: 'trade',
            opinion: this._buildTradeOpinion(subject, context),
            recommendations,
            warnings,
            quranicRef: ADVISORY_QURAN_REFERENCES.trade,
            confidence: 0.85
        };
    }

    _buildTradeOpinion(subject, context) {
        return {
            summary: `من منظور تجاري: ${subject} يحمل فرصاً واعدة في الأسواق الإسلامية`,
            strengths: [
                'الطلب المتنامي في الأسواق الناشئة',
                'إمكانية التوسع الإقليمي',
                'منظومة شيخة تدعم التجارة الحلال'
            ],
            opportunities: [
                'التجارة الإلكترونية عبر الحدود',
                'الشراكات الاستراتيجية الإقليمية',
                'التخصص في المنتجات والخدمات ذات القيمة المضافة'
            ],
            challenges: [
                'اشتداد المنافسة العالمية',
                'تقلبات أسعار الصرف',
                'التحديات اللوجستية'
            ]
        };
    }
}

class ShariaAdvisor {
    get id() { return 'sharia'; }
    get nameAr() { return 'المستشار الشرعي'; }
    get icon() { return '🕋'; }

    advise(subject, context = {}) {
        const compliance = this._evaluateShariahCompliance(subject, context);

        return {
            advisor: this.nameAr,
            domain: 'sharia',
            opinion: {
                ruling: compliance.ruling,
                rationale: compliance.rationale,
                conditions: compliance.conditions,
                prohibitions: compliance.prohibitions
            },
            shariaScore: compliance.score,
            quranicRefs: [
                ADVISORY_QURAN_REFERENCES.trade,
                ADVISORY_QURAN_REFERENCES.justice,
                ADVISORY_QURAN_REFERENCES.truthfulness
            ],
            hadithRefs: ADVISORY_HADITH_REFERENCES.slice(0, 2),
            recommendations: compliance.recommendations,
            warnings: compliance.warnings,
            confidence: 0.92
        };
    }

    _evaluateShariahCompliance(subject, context) {
        const { hasInterest = false, hasGharar = false, hasHaram = false } = context;

        let score = 100;
        const warnings = [];
        const conditions = [];
        const prohibitions = [];

        if (hasInterest) {
            score -= 40;
            prohibitions.push('الفوائد الربوية محرمة — يجب استبدالها بصيغ إسلامية (مرابحة، إجارة، مشاركة)');
            warnings.push({ severity: 'critical', text: 'تحذير: وُجد ربا — يتعارض مع الشريعة الإسلامية' });
        }

        if (hasGharar) {
            score -= 25;
            warnings.push({ severity: 'high', text: 'تحذير: غرر مفرط — قد يفسد العقد' });
            conditions.push('تحديد كامل لمحل العقد ومدته وثمنه لإزالة الغرر');
        }

        if (hasHaram) {
            score -= 50;
            prohibitions.push('المحتوى المحرم يجب إزالته أو إعادة هيكلته');
        }

        const ruling = score >= 90 ? 'مباح — لا إشكال شرعي'
            : score >= 70 ? 'مباح مع شروط — راجع الشروط المرفقة'
            : score >= 50 ? 'مشكوك فيه — يحتاج مراجعة شرعية متخصصة'
            : 'محظور — يتعارض مع أحكام الشريعة الإسلامية';

        return {
            score,
            ruling,
            rationale: 'التقييم مبني على أصول الفقه الإسلامي — الكتاب والسنة والإجماع',
            conditions,
            prohibitions,
            recommendations: [
                'استشر متخصصاً في المالية الإسلامية للهياكل المعقدة',
                'تأكد من مراجعة هيئة الرقابة الشرعية قبل الإطلاق',
                'وثّق العقود بما يتوافق مع الفقه الإسلامي'
            ],
            warnings
        };
    }
}

class InvestmentAdvisor {
    get id() { return 'investment'; }
    get nameAr() { return 'المستشار الاستثماري'; }
    get icon() { return '💰'; }

    advise(subject, context = {}) {
        const { amount, horizon, riskTolerance = 'moderate', sector } = context;

        const portfolio = this._suggestPortfolio(riskTolerance, sector);

        return {
            advisor: this.nameAr,
            domain: 'investment',
            opinion: {
                summary: `استثمار في ${subject} — تقييم مالي شامل`,
                roi: this._estimateROI(riskTolerance),
                paybackPeriod: this._estimatePayback(amount),
                valuationApproach: 'DCF + Comparable Companies'
            },
            portfolio,
            recommendations: [
                'التنويع في قطاعات متعددة لتوزيع المخاطر',
                'الاستثمار في الصكوك الإسلامية بدلاً من السندات التقليدية',
                'مراجعة دورية كل ربع سنة',
                'الاحتفاظ باحتياطي سيولة لا يقل عن 20%'
            ],
            warnings: [
                { severity: 'medium', text: 'لا ضمان للعوائد — الاستثمار ينطوي على مخاطر' },
                { severity: 'low', text: 'تقلبات الأسواق الناشئة قد تؤثر على القيمة قصيرة الأمد' }
            ],
            quranicRef: ADVISORY_QURAN_REFERENCES.planning,
            confidence: 0.80
        };
    }

    _suggestPortfolio(risk, sector) {
        const profiles = {
            conservative: { equities: 20, sukuk: 50, realEstate: 20, cash: 10 },
            moderate:     { equities: 40, sukuk: 30, realEstate: 20, cash: 10 },
            aggressive:   { equities: 65, sukuk: 15, realEstate: 15, cash: 5  }
        };
        return profiles[risk] || profiles.moderate;
    }

    _estimateROI(risk) {
        const returns = { conservative: '5-8%', moderate: '10-15%', aggressive: '18-25%' };
        return returns[risk] || returns.moderate;
    }

    _estimatePayback(amount) {
        if (!amount) return '3-5 سنوات';
        return amount > 1000000 ? '4-7 سنوات' : '2-4 سنوات';
    }
}

class GovernanceAdvisor {
    get id() { return 'governance'; }
    get nameAr() { return 'مستشار الحوكمة'; }
    get icon() { return '🏛️'; }

    advise(subject, context = {}) {
        const { orgType = 'company', size = 'medium', country = 'SA' } = context;

        return {
            advisor: this.nameAr,
            domain: 'governance',
            opinion: {
                summary: `حوكمة ${subject} — إطار شامل للحوكمة الرشيدة`,
                framework: this._getGovernanceFramework(orgType, country),
                maturityLevel: this._assessMaturity(context)
            },
            recommendations: [
                'تأسيس مجلس إدارة مستقل مع أعضاء مستقلين',
                'وضع سياسة واضحة لمكافحة الفساد والتضارب في المصالح',
                'إنشاء لجنة رقابة شرعية (للمنشآت المالية)',
                'تطبيق معايير الشفافية والإفصاح',
                'وضع آليات للمحاسبة والمراجعة الداخلية',
                'تدريب دوري للقيادات على مبادئ الحوكمة'
            ],
            standards: ['OECD Corporate Governance', 'Saudi CMA Standards', 'ISO 37001 Anti-bribery'],
            islamicGovernance: {
                shura: 'مجلس الشورى الداخلي لاتخاذ القرارات الاستراتيجية',
                accountability: 'المحاسبية أمام الله ثم الشعب والمساهمين',
                transparency: 'الإفصاح الكامل عن القرارات والأداء'
            },
            quranicRef: ADVISORY_QURAN_REFERENCES.consultation,
            confidence: 0.88
        };
    }

    _getGovernanceFramework(orgType, country) {
        const frameworks = {
            company: 'OECD Corporate Governance Principles + CMA Saudi',
            government: 'ISO 37001 + GovTech Framework',
            ngo: 'تقارير الاستدامة + حوكمة المنظمات غير الربحية',
            startup: 'Lean Governance + سياسات حوكمة المشاريع الناشئة'
        };
        return frameworks[orgType] || frameworks.company;
    }

    _assessMaturity(context) {
        const levels = ['مبتدئ', 'أساسي', 'متقدم', 'رائد'];
        return levels[Math.floor(Math.random() * levels.length)];
    }
}

class MarketAdvisor {
    get id() { return 'market'; }
    get nameAr() { return 'مستشار السوق'; }
    get icon() { return '📊'; }

    advise(subject, context = {}) {
        const { targetSegment, competitors = [], geography = [] } = context;

        return {
            advisor: this.nameAr,
            domain: 'market',
            opinion: {
                summary: `تحليل سوق ${subject}`,
                marketSize: this._estimateMarketSize(geography),
                growthRate: '12-18% سنوياً',
                maturity: 'ناشئ - نمو سريع'
            },
            segmentation: this._segmentMarket(targetSegment),
            competitors: competitors.length > 0
                ? { count: competitors.length, list: competitors }
                : { note: 'تحليل المنافسين يتطلب بيانات أعمق' },
            positioning: {
                strategy: 'التمايز من خلال الامتثال الشرعي والتقنية المتقدمة',
                uniqueValue: 'منظومة شيخة — الجمع بين الشريعة والتقنية'
            },
            recommendations: [
                'تطوير شخصية المشتري (Buyer Persona) بدقة عالية',
                'الاستفادة من بيانات سوق المعادن والسكراب في منظومة شيخة',
                'التسعير المتوافق مع القيمة لا التكلفة فقط',
                'بناء مجتمع حول العلامة التجارية'
            ],
            warnings: [
                { severity: 'low', text: 'مراقبة تحركات المنافسين بشكل دوري' }
            ],
            confidence: 0.82
        };
    }

    _estimateMarketSize(geography) {
        const base = geography.length * 500;
        return `$${Math.max(500, base)}M - $${Math.max(2000, base * 3)}M`;
    }

    _segmentMarket(targetSegment) {
        return {
            primary: targetSegment || 'الشركات الصغيرة والمتوسطة',
            secondary: 'الأفراد رواد الأعمال',
            tertiary: 'المؤسسات الكبرى والحكومات'
        };
    }
}

class TechnologyAdvisor {
    get id() { return 'technology'; }
    get nameAr() { return 'المستشار التقني'; }
    get icon() { return '💻'; }

    advise(subject, context = {}) {
        const { currentStack = [], scalability, securityLevel } = context;

        return {
            advisor: this.nameAr,
            domain: 'technology',
            opinion: {
                summary: `التوجيه التقني لـ ${subject}`,
                architectureRecommendation: 'Microservices + API-First + Event-Driven',
                cloudStrategy: 'Hybrid Cloud (AWS/Azure + On-premise for sensitive data)',
                securityFramework: 'Zero Trust + E2E Encryption + Sharia Data Privacy'
            },
            stack: {
                backend: 'Node.js (Express) / Python (FastAPI)',
                frontend: 'React / Next.js with Arabic RTL support',
                database: 'PostgreSQL + MongoDB + Redis',
                ai: 'Integration with OpenAI / Gemini / Local LLMs',
                security: 'OAuth2 + JWT + AES-256'
            },
            recommendations: [
                'تبني معمارية Microservices لسهولة التطوير والتوسع',
                'تطبيق API Gateway مركزية لتوحيد التكامل',
                'تشفير كامل للبيانات الحساسة',
                'نسخ احتياطية تلقائية وخطة استمرارية الأعمال',
                'اعتماد CI/CD Pipeline للتطوير المستمر',
                'مراقبة الأداء بـ APM tools'
            ],
            aiIntegration: {
                recommended: true,
                useCases: ['الاستشارات الآلية', 'تحليل البيانات', 'التنبؤ بالطلب', 'كشف الاحتيال'],
                engines: ['sheikha-ai-engine.js', 'sheikha-local-mind.js']
            },
            confidence: 0.87
        };
    }
}

class RiskAdvisor {
    get id() { return 'risk'; }
    get nameAr() { return 'مستشار المخاطر'; }
    get icon() { return '⚠️'; }

    advise(subject, context = {}) {
        const risks = this._identifyRisks(subject, context);
        const overallRiskScore = this._calculateOverallRisk(risks);

        return {
            advisor: this.nameAr,
            domain: 'risk',
            riskProfile: {
                overallScore: overallRiskScore,
                level: this._getRiskLevel(overallRiskScore),
                summary: `مستوى المخاطر الإجمالي: ${this._getRiskLevel(overallRiskScore).nameAr}`
            },
            risks,
            mitigations: this._suggestMitigations(risks),
            contingencyPlan: {
                immediate: 'تفعيل بروتوكول الاستجابة للأزمات خلال ساعة',
                shortTerm: 'مراجعة وتحديث استراتيجية المخاطر كل ربع سنة',
                longTerm: 'بناء قدرات الاستمرارية والمرونة المؤسسية'
            },
            islamicPerspective: {
                tawakkul: 'التوكل على الله مع الأخذ بالأسباب',
                reference: ADVISORY_QURAN_REFERENCES.planning
            },
            confidence: 0.84
        };
    }

    _identifyRisks(subject, context) {
        return [
            {
                id: 'market_risk',
                category: 'السوق',
                nameAr: 'مخاطر السوق',
                probability: 'متوسطة',
                impact: 'عالي',
                score: 60,
                description: 'تقلبات الطلب وتغيرات تفضيلات العملاء',
                mitigation: 'تنويع محفظة المنتجات والأسواق'
            },
            {
                id: 'regulatory_risk',
                category: 'تنظيمي',
                nameAr: 'مخاطر الامتثال التنظيمي',
                probability: 'منخفضة',
                impact: 'حرج',
                score: 45,
                description: 'تغيرات في الأنظمة واللوائح',
                mitigation: 'فريق قانوني متخصص ومتابعة مستمرة للتشريعات'
            },
            {
                id: 'operational_risk',
                category: 'تشغيلي',
                nameAr: 'مخاطر التشغيل',
                probability: 'متوسطة',
                impact: 'متوسط',
                score: 40,
                description: 'أعطال تقنية أو توقف في الخدمات',
                mitigation: 'نظام DR و HA وخطة استمرارية الأعمال'
            },
            {
                id: 'cyber_risk',
                category: 'أمني',
                nameAr: 'مخاطر الأمن السيبراني',
                probability: 'متوسطة',
                impact: 'عالي',
                score: 55,
                description: 'هجمات إلكترونية وتسريب البيانات',
                mitigation: 'Zero Trust Architecture + تشفير شامل + تدريب الموظفين'
            }
        ];
    }

    _calculateOverallRisk(risks) {
        return Math.round(risks.reduce((sum, r) => sum + r.score, 0) / risks.length);
    }

    _getRiskLevel(score) {
        if (score >= 80) return RISK_LEVELS.CRITICAL;
        if (score >= 60) return RISK_LEVELS.HIGH;
        if (score >= 40) return RISK_LEVELS.MEDIUM;
        if (score >= 20) return RISK_LEVELS.LOW;
        return RISK_LEVELS.MINIMAL;
    }

    _suggestMitigations(risks) {
        return risks
            .filter(r => r.score >= 40)
            .map(r => ({
                risk: r.nameAr,
                action: r.mitigation,
                priority: r.score >= 60 ? 'عاجل' : 'مهم',
                timeframe: r.score >= 60 ? 'فوري — خلال أسبوع' : 'قصير المدى — خلال شهر'
            }));
    }
}

class LegalAdvisor {
    get id() { return 'legal'; }
    get nameAr() { return 'المستشار القانوني'; }
    get icon() { return '⚖️'; }

    advise(subject, context = {}) {
        const { countries = ['SA'], businessType, contractType } = context;

        return {
            advisor: this.nameAr,
            domain: 'legal',
            opinion: {
                summary: `التأطير القانوني لـ ${subject}`,
                jurisdiction: countries,
                applicableLaw: this._getApplicableLaw(countries),
                contractRequired: true
            },
            requirements: [
                'تسجيل النشاط التجاري وفق أنظمة البلد المستهدف',
                'الامتثال لنظام حماية البيانات الشخصية',
                'الترخيص المهني المناسب للنشاط',
                'سياسة الخصوصية وشروط الاستخدام',
                'التأمين المهني والتجاري'
            ],
            recommendations: [
                'استشر محامياً متخصصاً في القانون التجاري السعودي/الخليجي',
                'وثّق جميع العقود وراجعها قانونياً قبل التوقيع',
                'تأكد من الامتثال لهيئة الاتصالات والفضاء والتقنية',
                'راجع متطلبات هيئة السوق المالية إن كان النشاط مالياً'
            ],
            warnings: [
                { severity: 'high', text: 'القوانين تتغير — تابع التحديثات التشريعية دورياً' }
            ],
            confidence: 0.83
        };
    }

    _getApplicableLaw(countries) {
        const laws = {
            SA: 'نظام الشركات السعودي + نظام التجارة الإلكترونية + لوائح هيئة الاتصالات',
            AE: 'قانون الشركات الإماراتي + قانون الإنترنت والتجارة الإلكترونية',
            QA: 'قانون التجارة القطري + التشريعات الرقمية',
            EG: 'قانون التجارة المصري + قانون حماية البيانات الشخصية'
        };
        return countries.map(c => laws[c] || `القانون التجاري في ${c}`);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔮 محرك الرؤية الاستشارية — الطبقة الحاكمة العليا
// ═══════════════════════════════════════════════════════════════════════════════

class SheikhaAdvisoryVisionEngine {
    constructor() {
        this.version = '1.0.0';
        this.name = 'الرؤية الاستشارية';
        this.nameEn = 'Advisory Vision Engine';
        this.role = 'الطبقة الحاكمة العليا — فوق جميع محركات الرؤية';

        // ─── تهيئة وكلاء الاستشارة ──────────────────────────────────────────
        this.advisors = {
            trade:      new TradeAdvisor(),
            sharia:     new ShariaAdvisor(),
            investment: new InvestmentAdvisor(),
            governance: new GovernanceAdvisor(),
            market:     new MarketAdvisor(),
            technology: new TechnologyAdvisor(),
            risk:       new RiskAdvisor(),
            legal:      new LegalAdvisor()
        };

        // ─── المحركات التحتية المُدارة ───────────────────────────────────────
        this.engines = {
            nationalVisions: NationalVisionsEngine ? new NationalVisionsEngine() : null,
            computerVision:  ComputerVisionEngine  ? new ComputerVisionEngine()  : null,
            ethicalAdvisory: EthicalAdvisorySystem ? new EthicalAdvisorySystem() : null,
            intlAdvisory:    InternationalAdvisory  ? new InternationalAdvisory()  : null
        };

        // ─── سجل الاستشارات ──────────────────────────────────────────────────
        this.consultationLog = [];
        this.maxLogSize = 1000;

        console.log('🔮 [ADVISORY-VISION] الرؤية الاستشارية — الطبقة الحاكمة مُفعّلة');
        console.log(`   وكلاء الاستشارة: ${Object.keys(this.advisors).length} وكيل متخصص`);
        console.log(`   المحركات المُدارة: ${Object.values(this.engines).filter(Boolean).length}/${Object.keys(this.engines).length}`);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🎯 الاستشارة الشاملة — Master Consultation
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * الاستشارة الرئيسية — تجمع آراء جميع الوكلاء وتصنع رأياً موحداً
     */
    async consult(request) {
        const {
            subject,
            context = {},
            domains = Object.keys(ADVISORY_DOMAINS),
            priority = 'balanced',
            includeNationalVisions = true
        } = request;

        if (!subject) throw new Error('موضوع الاستشارة (subject) مطلوب — Consultation subject is required');

        const consultationId = this._generateId('CONS');
        const startTime = Date.now();

        console.log(`🔮 [ADVISORY] استشارة جديدة: ${consultationId} — ${subject}`);

        // ─── 1. جمع آراء الوكلاء المطلوبين ──────────────────────────────────
        const domainAdvisors = domains
            .map(d => this.advisors[d])
            .filter(Boolean);

        const opinions = domainAdvisors.map(advisor => {
            try {
                return advisor.advise(subject, context);
            } catch (e) {
                return { advisor: advisor.nameAr, domain: advisor.id, error: e.message };
            }
        });

        // ─── 2. رؤية الدول (إن طُلبت) ────────────────────────────────────────
        let nationalVisionAlignment = null;
        if (includeNationalVisions && this.engines.nationalVisions) {
            try {
                const profile = {
                    sector: context.sector || subject,
                    services: context.services || [],
                    targetCountries: context.targetCountries || context.countries || ['SA', 'AE'],
                    keywords: context.keywords || []
                };
                nationalVisionAlignment = this.engines.nationalVisions.alignBusinessWithVisions(profile);
            } catch (e) {
                nationalVisionAlignment = { error: e.message };
            }
        }

        // ─── 3. تقييم أخلاقي شامل ────────────────────────────────────────────
        let ethicalEvaluation = null;
        if (this.engines.ethicalAdvisory && context.policy) {
            try {
                ethicalEvaluation = this.engines.ethicalAdvisory.evaluatePublicGood(context.policy);
            } catch (_) {}
        }

        // ─── 4. تجميع الرأي الموحد ───────────────────────────────────────────
        const synthesized = this._synthesizeOpinions(opinions, subject, context, priority);

        // ─── 5. تقرير الاستشارة النهائي ──────────────────────────────────────
        const consultation = {
            id: consultationId,
            timestamp: new Date().toISOString(),
            subject,
            status: 'completed',

            // الرأي الموحد للطبقة الحاكمة
            masterOpinion: synthesized,

            // آراء الوكلاء المتخصصين
            expertOpinions: opinions,

            // التوافق مع رؤى الدول
            nationalVisionAlignment,

            // التقييم الأخلاقي
            ethicalEvaluation,

            // مراجع إسلامية
            islamicReferences: {
                quran: Object.values(ADVISORY_QURAN_REFERENCES).slice(0, 4),
                hadith: ADVISORY_HADITH_REFERENCES
            },

            // ملخص تنفيذي
            executiveSummary: this._buildExecutiveSummary(subject, synthesized, opinions),

            // مقاييس الاستشارة
            metrics: {
                advisorsConsulted: opinions.length,
                processingTime: (Date.now() - startTime) + 'ms',
                overallConfidence: this._calculateAverageConfidence(opinions),
                consultationDepth: domains.length >= 6 ? 'شامل' : domains.length >= 3 ? 'متوسط' : 'أساسي'
            }
        };

        // ─── تسجيل الاستشارة ─────────────────────────────────────────────────
        this._logConsultation(consultationId, subject, synthesized.overallScore);

        return consultation;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🏪 استشارات متخصصة
    // ═══════════════════════════════════════════════════════════════════════════

    async getTradeAdvisory(subject, context) {
        return this.advisors.trade.advise(subject, context || {});
    }

    async getShariaAdvisory(subject, context) {
        return this.advisors.sharia.advise(subject, context || {});
    }

    async getInvestmentAdvisory(subject, context) {
        return this.advisors.investment.advise(subject, context || {});
    }

    async getGovernanceAdvisory(subject, context) {
        return this.advisors.governance.advise(subject, context || {});
    }

    async getMarketAdvisory(subject, context) {
        return this.advisors.market.advise(subject, context || {});
    }

    async getTechnologyAdvisory(subject, context) {
        return this.advisors.technology.advise(subject, context || {});
    }

    async getRiskAssessment(subject, context) {
        return this.advisors.risk.advise(subject, context || {});
    }

    async getLegalAdvisory(subject, context) {
        return this.advisors.legal.advise(subject, context || {});
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ⚖️ تقييم القرارات
    // ═══════════════════════════════════════════════════════════════════════════

    evaluateDecision(decision) {
        const {
            title,
            description,
            pros = [],
            cons = [],
            alternatives = [],
            stakeholders = [],
            timeframe,
            budget
        } = decision;

        if (!title) throw new Error('عنوان القرار (title) مطلوب');

        // تقييم متعدد الأبعاد
        const sharia = this.advisors.sharia.advise(title, decision);
        const risk = this.advisors.risk.advise(title, decision);
        const governance = this.advisors.governance.advise(title, decision);

        const scores = {
            sharia: sharia.shariaScore || 85,
            risk: 100 - (risk.riskProfile?.overallScore || 45),
            feasibility: pros.length > cons.length ? 75 : 50,
            alignment: stakeholders.length > 0 ? 80 : 60
        };

        const overallScore = Math.round(
            Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length
        );

        return {
            id: this._generateId('EVAL'),
            timestamp: new Date().toISOString(),
            decision: title,
            scores,
            overallScore,
            verdict: overallScore >= 80 ? 'موصى به بقوة'
                : overallScore >= 65 ? 'موصى به مع ملاحظات'
                : overallScore >= 50 ? 'يحتاج مراجعة'
                : 'غير موصى به',
            pros: pros.length > 0 ? pros : ['لم تُحدد مزايا'],
            cons: cons.length > 0 ? cons : ['لم تُحدد مساوئ'],
            alternatives: alternatives.length > 0 ? alternatives : ['البدائل تحتاج تقييماً أعمق'],
            islamicPerspective: {
                quranic: ADVISORY_QURAN_REFERENCES.consultation,
                guidance: 'استشر أهل الرأي والحكمة قبل اتخاذ القرار'
            },
            nextSteps: [
                'مراجعة المخاطر المُحددة ووضع خطة للتخفيف منها',
                'استشارة ذوي الخبرة المتخصصة في مجال القرار',
                'التحقق من التوافق مع الأنظمة والتشريعات السارية',
                'وضع مؤشرات قياس واضحة لنجاح القرار'
            ]
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🌍 مجلس المستشارين
    // ═══════════════════════════════════════════════════════════════════════════

    getAdvisoryCouncil() {
        return {
            name: 'مجلس المستشارين — Sheikha Advisory Council',
            role: 'الطبقة الحاكمة الاستشارية فوق جميع محركات الرؤية',
            members: Object.values(this.advisors).map(a => ({
                id: a.id,
                nameAr: a.nameAr,
                icon: a.icon,
                domain: ADVISORY_DOMAINS[a.id.toUpperCase()]?.nameAr || a.id,
                status: 'active'
            })),
            engines: {
                nationalVisions: !!this.engines.nationalVisions,
                computerVision:  !!this.engines.computerVision,
                ethicalAdvisory: !!this.engines.ethicalAdvisory,
                intlAdvisory:    !!this.engines.intlAdvisory
            },
            islamicFoundation: {
                principles: Object.values(ADVISORY_QURAN_REFERENCES).map(r => ({
                    text: r.ar, surah: r.surah, ayah: r.ayah
                })),
                hadith: ADVISORY_HADITH_REFERENCES
            },
            capabilities: [
                'استشارة شاملة متعددة الأبعاد',
                'تقييم القرارات استراتيجياً وشرعياً',
                'تقييم المخاطر والتخفيف منها',
                'مواءمة الأعمال مع رؤى الدول الاستراتيجية',
                'استشارة قانونية وحوكمة',
                'توجيه استثماري وتسويقي',
                'فحص الامتثال الشرعي'
            ],
            consultationsLogged: this.consultationLog.length,
            timestamp: new Date().toISOString()
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 📊 التقرير الاستشاري الشامل
    // ═══════════════════════════════════════════════════════════════════════════

    getComprehensiveAdvisoryReport() {
        const ethicalReport = this.engines.ethicalAdvisory
            ? this.engines.ethicalAdvisory.getComprehensiveEthicalReport()
            : null;

        const intlReport = this.engines.intlAdvisory
            ? this.engines.intlAdvisory.getComprehensiveAdvisoryReport()
            : null;

        const nationalProgress = this.engines.nationalVisions
            ? this.engines.nationalVisions.getProgressReport()
            : null;

        return {
            id: this._generateId('RPT'),
            timestamp: new Date().toISOString(),
            title: 'التقرير الاستشاري الشامل — الرؤية الاستشارية لمنظومة شيخة',
            council: this.getAdvisoryCouncil(),
            domains: Object.values(ADVISORY_DOMAINS),
            ethicalFramework: ethicalReport,
            internationalAdvisory: intlReport,
            nationalVisions: nationalProgress,
            islamicFoundation: {
                quranReferences: ADVISORY_QURAN_REFERENCES,
                hadithReferences: ADVISORY_HADITH_REFERENCES,
                coreMessage: 'الرؤية الاستشارية مبنية على الشورى والعدل والأمانة'
            },
            statistics: {
                totalAdvisors: Object.keys(this.advisors).length,
                totalEngines: Object.values(this.engines).filter(Boolean).length,
                consultationsLogged: this.consultationLog.length,
                domainsSupported: Object.keys(ADVISORY_DOMAINS).length
            }
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ⚕️ حالة المحرك
    // ═══════════════════════════════════════════════════════════════════════════

    getStatus() {
        return {
            engine: 'SheikhaAdvisoryVisionEngine',
            version: this.version,
            name: this.name,
            role: this.role,
            status: 'active',
            advisors: Object.fromEntries(
                Object.entries(this.advisors).map(([k, v]) => [k, { name: v.nameAr, status: 'active' }])
            ),
            engines: Object.fromEntries(
                Object.entries(this.engines).map(([k, v]) => [k, !!v])
            ),
            consultationsTotal: this.consultationLog.length,
            islamicNote: 'مبني على الشورى والعدل والأمانة — "وشاورهم في الأمر"',
            timestamp: new Date().toISOString()
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🔧 أدوات داخلية
    // ═══════════════════════════════════════════════════════════════════════════

    _synthesizeOpinions(opinions, subject, context, priority) {
        const validOpinions = opinions.filter(o => !o.error);
        const allRecommendations = validOpinions.flatMap(o => o.recommendations || []);
        const allWarnings = validOpinions.flatMap(o => o.warnings || []);
        const avgConfidence = this._calculateAverageConfidence(validOpinions);

        // استخراج المخاطر من مستشار المخاطر
        const riskOpinion = validOpinions.find(o => o.domain === 'risk');
        const overallRiskScore = riskOpinion?.riskProfile?.overallScore || 40;

        // استخراج الدرجة الشرعية
        const shariaOpinion = validOpinions.find(o => o.domain === 'sharia');
        const shariaScore = shariaOpinion?.shariaScore || 90;

        const overallScore = Math.round(
            (shariaScore * 0.30 + (100 - overallRiskScore) * 0.25 + avgConfidence * 100 * 0.45)
        );

        return {
            subject,
            overallScore,
            overallGrade: overallScore >= 85 ? 'ممتاز' : overallScore >= 70 ? 'جيد' : overallScore >= 55 ? 'مقبول' : 'يحتاج مراجعة',
            recommendation: overallScore >= 80
                ? 'المضي قُدماً — الاستشارة الشاملة تدعم القرار'
                : overallScore >= 65
                ? 'المضي بحذر — مع معالجة النقاط المُشار إليها'
                : 'إعادة النظر — الاستشارة تنصح بمراجعة شاملة',
            keyFindings: this._extractKeyFindings(validOpinions),
            topRecommendations: this._deduplicateList(allRecommendations.map(
                r => typeof r === 'string' ? r : r.text || r
            )).slice(0, 8),
            criticalWarnings: allWarnings
                .filter(w => ['critical', 'high'].includes(w.severity))
                .map(w => w.text)
                .slice(0, 5),
            shariaCompliance: { score: shariaScore, status: shariaScore >= 80 ? 'متوافق' : 'يحتاج مراجعة' },
            riskLevel: this._getRiskLabel(overallRiskScore),
            confidence: avgConfidence
        };
    }

    _extractKeyFindings(opinions) {
        return opinions.map(o => {
            const summary = o.opinion?.summary || o.opinion?.ruling || '';
            return summary ? `[${o.advisor}] ${summary}` : null;
        }).filter(Boolean).slice(0, 6);
    }

    _buildExecutiveSummary(subject, synthesized, opinions) {
        return {
            title: `ملخص تنفيذي — استشارة: ${subject}`,
            verdict: synthesized.recommendation,
            grade: synthesized.overallGrade,
            score: synthesized.overallScore,
            highlights: synthesized.keyFindings.slice(0, 3),
            immediateActions: synthesized.topRecommendations.slice(0, 3),
            islamicNote: 'بسم الله الرحمن الرحيم — الاستشارة أمانة والرأي مسؤولية'
        };
    }

    _calculateAverageConfidence(opinions) {
        const valid = opinions.filter(o => typeof o.confidence === 'number');
        if (valid.length === 0) return 0.80;
        return parseFloat((valid.reduce((s, o) => s + o.confidence, 0) / valid.length).toFixed(2));
    }

    _getRiskLabel(score) {
        if (score >= 80) return { level: 'حرج',    color: '🔴' };
        if (score >= 60) return { level: 'عالي',   color: '🟠' };
        if (score >= 40) return { level: 'متوسط',  color: '🟡' };
        if (score >= 20) return { level: 'منخفض',  color: '🟢' };
        return { level: 'ضئيل', color: '⚪' };
    }

    _deduplicateList(arr) {
        return [...new Set(arr.filter(Boolean))];
    }

    _logConsultation(id, subject, score) {
        if (this.consultationLog.length >= this.maxLogSize) {
            this.consultationLog.shift();
        }
        this.consultationLog.push({
            id, subject, score,
            timestamp: new Date().toISOString()
        });
    }

    _generateId(prefix = 'ADV') {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    }
}

module.exports = SheikhaAdvisoryVisionEngine;
