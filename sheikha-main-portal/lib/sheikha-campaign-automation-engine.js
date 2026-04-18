/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  بسم الله الرحمن الرحيم                                                      ║
 * ║  SHEIKHA CAMPAIGN AUTOMATION ENGINE                                          ║
 * ║  نظام إدارة الحملات الآلي الكامل                                              ║
 * ║  الهوية · الصور · السلوك · الجدولة · التتبع · التقرير                        ║
 * ║                                                                              ║
 * ║  v2.0.0 — © 2026 سلمان أحمد بن سلمان الراجح                                 ║
 * ║                                                                              ║
 * ║  ﴿وَأَحْسِنُوا إِنَّ اللَّهَ يُحِبُّ الْمُحْسِنِينَ﴾ — البقرة ١٩٥          ║
 * ║  "إن الله جميل يحب الجمال" — صحيح مسلم                                     ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * المحاور السبعة:
 *  1️⃣  هوية الحملة   — ربط بالـ Brand Engine (ألوان + خطوط + صوت)
 *  2️⃣  الكريتيف/الصور — توليد HTML بانرات + بوستات + ستوريز آلياً
 *  3️⃣  دورة الحياة   — جدولة → تشغيل → إيقاف مؤقت → اكتمال
 *  4️⃣  قواعد السلوك  — Budget Cap · CTR Alert · Time Limit · Daily Cap
 *  5️⃣  ربط Meta CAPI — إطلاق LandingPageView عند بدء الحملة تلقائياً
 *  6️⃣  KPI وأداء     — تسجيل + تحليل + تنبيهات تلقائية
 *  7️⃣  تقارير        — ملخص يومي + أسبوعي + نهائي
 */
'use strict';

const crypto      = require('crypto');
const fs          = require('fs');
const path        = require('path');
const EventEmitter = require('events');

// ── مسارات ──────────────────────────────────────────────────────────────────
const DATA_DIR   = path.join(__dirname, '..', 'data');
const DB_FILE    = path.join(DATA_DIR, 'campaign-automation-db.json');
const LOG_FILE   = path.join(DATA_DIR, 'operations', 'campaign-automation.ndjson');
const VERSION    = '2.0.0';

// ── هوية العلامة (Brand Constants) ─────────────────────────────────────────
const BRAND = {
    nameAr: 'شيخة',
    nameEn: 'SHEIKHA',
    siteUrl: 'https://sheikha.top',
    colors: {
        primary:   '#006c35',   // أخضر شيخة — الإسلام والنماء
        secondary: '#c9a42c',   // ذهبي شيخة — الفخامة والتميز
        accent:    '#1a5276',   // أزرق شيخة — الثقة والتقنية
        light:     '#faf7f0',   // أبيض عاجي — النقاء
        dark:      '#1a1a2e',   // كحلي شيخة — الرسمية
        text:      '#ffffff',
    },
    fonts: {
        arabic: "'Amiri', 'Tajawal', 'Cairo', serif",
        english: "'Inter', 'Open Sans', sans-serif",
    },
    basmala: 'بسم الله الرحمن الرحيم',
    tagline: { ar: 'السوق الذكي المتكامل', en: 'The Complete Smart Market' },
    shariaNote: 'لا صور ذوات أرواح — الهوية بالخط العربي والزخارف الهندسية الإسلامية',
};

// ── قوالب نصية حملات جاهزة ─────────────────────────────────────────────────
const CAMPAIGN_TEMPLATES = {
    metals_b2b: {
        nameAr: 'حملة المعادن للشركات',
        headlineAr: 'مصدرك الموثوق للمعادن والسكراب',
        bodyAr: 'شيخة — سوق معادن إسلامي شفاف\n✅ أسعار لحظية بمؤشر SMI\n✅ حلال 100% — بلا ربا بلا غرر\n✅ شحن ولوجستيات متكاملة\n✅ ضمان الجودة والمواصفات',
        ctaAr: 'سجّل شركتك الآن',
        ctaUrl: 'https://sheikha.top/metals',
        hashtags: ['#شيخة', '#SHEIKHA', '#معادن', '#سكراب', '#B2B', '#سوق_المعادن'],
        emoji: '🏭',
    },
    scrap_b2b: {
        nameAr: 'حملة السكراب',
        headlineAr: 'بيع وشراء السكراب بأفضل الأسعار',
        bodyAr: 'شيخة للسكراب — أضخم سوق سكراب رقمي\n📊 أسعار شفافة لحظية\n🚚 خدمة الاستلام والتوصيل\n⚖️ وزن دقيق معتمد',
        ctaAr: 'ابدأ البيع والشراء',
        ctaUrl: 'https://sheikha.top/scrap',
        hashtags: ['#شيخة', '#سكراب', '#معادن', '#B2B'],
        emoji: '♻️',
    },
    precious_b2g: {
        nameAr: 'حملة المعادن الثمينة للجهات الحكومية',
        headlineAr: 'بوابة شيخة للمشتريات الحكومية',
        bodyAr: 'شيخة B2G — الحل الأمثل للجهات الحكومية\n🏛 متوافق مع رؤية 2030\n✅ ZATCA + IKTVA + NCA\n🔐 مصادقة نفاذ\n📊 تقارير ESG والاستدامة',
        ctaAr: 'سجّل جهتك الحكومية',
        ctaUrl: 'https://sheikha.top/government',
        hashtags: ['#شيخة', '#رؤية_2030', '#B2G', '#مشتريات_حكومية'],
        emoji: '🏛',
    },
    gold_b2c: {
        nameAr: 'حملة الذهب للمستهلكين',
        headlineAr: 'استثمر في الذهب بطريقة حلال',
        bodyAr: '💰 شيخة للمعادن الثمينة\n✅ ذهب · فضة · بلاتين\n📈 أسعار لحظية شفافة\n🕌 بلا ربا بلا غرر\n📱 حاسبة زكاة مدمجة',
        ctaAr: 'ابدأ الاستثمار الآن',
        ctaUrl: 'https://sheikha.top/precious',
        hashtags: ['#شيخة', '#ذهب', '#استثمار_حلال', '#معادن_ثمينة'],
        emoji: '💰',
    },
    awareness_all: {
        nameAr: 'حملة توعية شاملة',
        headlineAr: 'اكتشف سوق شيخة الذكي',
        bodyAr: '🌟 شيخة — أول سوق إسلامي رقمي للمعادن\nمبني على قيم الإسلام · الشفافية · الإتقان\n\nتجارة حلال · أسعار شفافة · شحن موثوق',
        ctaAr: 'اكتشف شيخة',
        ctaUrl: 'https://sheikha.top',
        hashtags: ['#شيخة', '#SHEIKHA', '#سوق_ذكي', '#تجارة_إسلامية'],
        emoji: '🌟',
    },
};

// ── أنواع السلوك الآلي ──────────────────────────────────────────────────────
const RULE_TYPES = {
    BUDGET_CAP:       'budget_cap',       // إيقاف عند استنزاف الميزانية
    DAILY_CAP:        'daily_cap',        // حد يومي للإنفاق
    CTR_LOW_ALERT:    'ctr_low_alert',    // تنبيه عند انخفاض CTR
    CTR_PAUSE:        'ctr_pause',        // إيقاف عند انخفاض CTR بشدة
    TIME_END:         'time_end',         // إيقاف في نهاية تاريخ الحملة
    LEAD_TARGET:      'lead_target',      // إكمال عند الوصول لهدف الـ Leads
    CONVERSION_TARGET:'conversion_target',// إكمال عند الوصول لهدف التحويل
    AUTO_REPORT:      'auto_report',      // تقرير يومي تلقائي
};

// ── حالات الحملة ────────────────────────────────────────────────────────────
const STATUS = {
    DRAFT:     'draft',
    SCHEDULED: 'scheduled',
    ACTIVE:    'active',
    PAUSED:    'paused',
    COMPLETED: 'completed',
    ARCHIVED:  'archived',
};

// ═══════════════════════════════════════════════════════════════════════════
//  🏭 Campaign Automation Engine
// ═══════════════════════════════════════════════════════════════════════════
class SheikhaCAE extends EventEmitter {
    constructor(options = {}) {
        super();
        this.version      = VERSION;
        this.name         = 'Sheikha Campaign Automation Engine';
        this.nameAr       = 'نظام إدارة الحملات الآلي الكامل';
        this.brand        = BRAND;
        this.templates    = CAMPAIGN_TEMPLATES;
        this.metaEngine   = options.metaEngine   || null;  // SheikhMetaEngine instance
        this.db           = this._loadDB();
        this._ticker      = null;   // setInterval handle
        this._tickMs      = options.tickMs || 60_000;  // كل دقيقة
        if (options.autoStart !== false) this._startTicker();
        this._ensureLogDir();
        this._log('BOOT', null, { version: VERSION });
    }

    // ══════════════════════════════════════════════════════
    // 1️⃣  إدارة الحملات (CRUD)
    // ══════════════════════════════════════════════════════

    /** إنشاء حملة جديدة بالهوية الكاملة والكريتيف والقواعد */
    createCampaign(data) {
        const id = 'CAE-' + crypto.randomUUID().substring(0, 8).toUpperCase();
        const template = data.template ? (this.templates[data.template] || null) : null;

        const campaign = {
            id,
            nameAr:    data.nameAr    || (template && template.nameAr)   || 'حملة جديدة',
            nameEn:    data.nameEn    || '',
            type:      data.type      || 'awareness',    // awareness|lead-gen|conversion|retention
            objective: data.objective || 'reach',        // reach|traffic|leads|sales
            market:    data.market    || 'metals',       // metals|scrap|precious|rare|now|all
            target:    data.target    || 'B2B',          // B2B|B2G|B2C|all
            template:  data.template  || null,
            channels:  data.channels  || ['instagram', 'whatsapp'],
            budget:    Number(data.budget  || 0),
            spent:     0,
            dailyBudget: Number(data.dailyBudget || 0),
            dailySpent: 0,
            dailyResetAt: null,
            currency:  data.currency  || 'SAR',
            startDate: data.startDate || null,
            endDate:   data.endDate   || null,
            status:    STATUS.DRAFT,
            // هوية مدمجة
            identity: {
                colors:   { ...BRAND.colors, ...(data.customColors || {}) },
                fonts:    { ...BRAND.fonts },
                tone:     data.tone || 'professional',  // professional|friendly|urgent|educational
                language: data.language || 'ar',
            },
            // الكريتيف المُولَّد
            creatives: data.creatives || [],
            // قواعد السلوك الآلي
            rules:     data.rules || this._defaultRules(data),
            // KPIs
            kpis: {
                impressions:  0,
                clicks:       0,
                leads:        0,
                conversions:  0,
                ctr:          0,
                cpl:          0,
                roi:          0,
                spend:        0,
                reach:        0,
                engagement:   0,
                // UTM tracking
                utmImpressions: {},  // { campaign_name: count }
            },
            // أحداث Meta
            metaEvents: [],
            // نشاط وسجل
            activityLog: [{
                action: 'created',
                at:     new Date().toISOString(),
                detail: `حملة أُنشئت — ${id}`,
            }],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // توليد كريتيف تلقائي إذا وُجد قالب
        if (template && campaign.creatives.length === 0) {
            campaign.creatives = this._generateCreatives(campaign, template);
        }

        // جدولة تلقائية إذا وُجد startDate
        if (campaign.startDate) {
            campaign.status = STATUS.SCHEDULED;
            campaign.activityLog.push({ action: 'scheduled', at: new Date().toISOString(), detail: `مجدولة لـ ${campaign.startDate}` });
        }

        this.db.campaigns.push(campaign);
        this._saveDB();
        this._log('CAMPAIGN_CREATED', id, { nameAr: campaign.nameAr, market: campaign.market });
        this.emit('campaign:created', campaign);
        return campaign;
    }

    /** تحديث حملة */
    updateCampaign(id, updates) {
        const idx = this._findIdx(id);
        if (idx < 0) return { error: 'الحملة غير موجودة' };

        const camp = this.db.campaigns[idx];
        const allowed = ['nameAr', 'nameEn', 'budget', 'dailyBudget', 'endDate', 'channels', 'rules', 'identity', 'objective', 'tone'];
        allowed.forEach(k => { if (updates[k] !== undefined) camp[k] = updates[k]; });
        camp.updatedAt = new Date().toISOString();
        camp.activityLog.push({ action: 'updated', at: camp.updatedAt, detail: 'تحديث بيانات الحملة' });

        this._saveDB();
        return camp;
    }

    /** تشغيل حملة */
    activateCampaign(id) {
        const idx = this._findIdx(id);
        if (idx < 0) return { error: 'الحملة غير موجودة' };
        const camp = this.db.campaigns[idx];
        if (camp.status === STATUS.ACTIVE) return { error: 'الحملة تعمل بالفعل' };

        camp.status    = STATUS.ACTIVE;
        camp.updatedAt = new Date().toISOString();
        camp.activityLog.push({ action: 'activated', at: camp.updatedAt, detail: 'تم تشغيل الحملة' });

        this._saveDB();
        this._log('CAMPAIGN_ACTIVATED', id, { nameAr: camp.nameAr });
        this.emit('campaign:activated', camp);

        // إطلاق Meta CAPI LandingPageView تلقائياً
        this._fireCampaignLaunchCAPI(camp);

        return camp;
    }

    /** إيقاف مؤقت لحملة */
    pauseCampaign(id, reason = 'manual') {
        const idx = this._findIdx(id);
        if (idx < 0) return { error: 'الحملة غير موجودة' };
        const camp = this.db.campaigns[idx];

        camp.status    = STATUS.PAUSED;
        camp.updatedAt = new Date().toISOString();
        camp.activityLog.push({ action: 'paused', at: camp.updatedAt, detail: `سبب الإيقاف: ${reason}` });

        this._saveDB();
        this._log('CAMPAIGN_PAUSED', id, { reason });
        this.emit('campaign:paused', { ...camp, reason });
        return camp;
    }

    /** إكمال حملة */
    completeCampaign(id, reason = 'manual') {
        const idx = this._findIdx(id);
        if (idx < 0) return { error: 'الحملة غير موجودة' };
        const camp = this.db.campaigns[idx];

        camp.status    = STATUS.COMPLETED;
        camp.updatedAt = new Date().toISOString();
        camp.activityLog.push({ action: 'completed', at: camp.updatedAt, detail: reason });

        this._saveDB();
        this._log('CAMPAIGN_COMPLETED', id, { reason });
        this.emit('campaign:completed', camp);
        return camp;
    }

    /** حذف / أرشفة حملة */
    archiveCampaign(id) {
        const idx = this._findIdx(id);
        if (idx < 0) return { error: 'الحملة غير موجودة' };
        this.db.campaigns[idx].status = STATUS.ARCHIVED;
        this.db.campaigns[idx].updatedAt = new Date().toISOString();
        this._saveDB();
        return { success: true, id };
    }

    /** قائمة الحملات مع فلترة */
    listCampaigns(filters = {}) {
        let result = [...this.db.campaigns];
        if (filters.status)  result = result.filter(c => c.status  === filters.status);
        if (filters.market)  result = result.filter(c => c.market  === filters.market);
        if (filters.target)  result = result.filter(c => c.target  === filters.target);
        if (filters.type)    result = result.filter(c => c.type    === filters.type);
        if (filters.channel) result = result.filter(c => (c.channels || []).includes(filters.channel));
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return result;
    }

    getCampaign(id) {
        return this.db.campaigns.find(c => c.id === id) || null;
    }

    // ══════════════════════════════════════════════════════
    // 2️⃣  توليد الكريتيف (Creatives / Visuals)
    // ══════════════════════════════════════════════════════

    /** توليد كريتيف HTML جاهز للنشر من بيانات الحملة */
    generateCreative(campaignId, creativeType = 'banner_square') {
        const camp = this.getCampaign(campaignId);
        if (!camp) return { error: 'الحملة غير موجودة' };
        const template = camp.template ? this.templates[camp.template] : null;
        const creatives = this._generateCreatives(camp, template, [creativeType]);
        if (creatives.length) {
            const c = creatives[0];
            if (!camp.creatives.find(x => x.type === c.type)) camp.creatives.push(c);
            else {
                const i = camp.creatives.findIndex(x => x.type === c.type);
                camp.creatives[i] = c;
            }
            this._saveDB();
            return c;
        }
        return { error: 'فشل توليد الكريتيف' };
    }

    /** معاينة HTML للكريتيف */
    previewCreativeHtml(campaignId, creativeType = 'banner_square') {
        const camp = this.getCampaign(campaignId);
        if (!camp) return '<p>الحملة غير موجودة</p>';
        const existing = (camp.creatives || []).find(c => c.type === creativeType);
        if (existing) return existing.html;
        const template = camp.template ? this.templates[camp.template] : null;
        const creatives = this._generateCreatives(camp, template, [creativeType]);
        return creatives[0]?.html || '<p>لا يوجد كريتيف</p>';
    }

    // ══════════════════════════════════════════════════════
    // 3️⃣  تسجيل الأداء (KPI Recording)
    // ══════════════════════════════════════════════════════

    recordKPI(campaignId, kpiName, value = 1, utmCampaign = null) {
        const idx = this._findIdx(campaignId);
        if (idx < 0) return { error: 'الحملة غير موجودة' };
        const camp = this.db.campaigns[idx];

        const numVal = Number(value) || 0;
        if (camp.kpis[kpiName] !== undefined) {
            camp.kpis[kpiName] += numVal;
        }

        // تسجيل UTM breakdown
        if (utmCampaign) {
            camp.kpis.utmImpressions[utmCampaign] = (camp.kpis.utmImpressions[utmCampaign] || 0) + numVal;
        }

        // حساب CTR تلقائي
        if (camp.kpis.impressions > 0) {
            camp.kpis.ctr = +((camp.kpis.clicks / camp.kpis.impressions) * 100).toFixed(3);
        }
        // حساب CPL
        if (camp.kpis.leads > 0 && camp.spent > 0) {
            camp.kpis.cpl = +(camp.spent / camp.kpis.leads).toFixed(2);
        }

        // تحديث spend
        if (kpiName === 'spend') {
            camp.spent = (camp.spent || 0) + numVal;
            camp.dailySpent = (camp.dailySpent || 0) + numVal;
        }

        camp.updatedAt = new Date().toISOString();
        this._saveDB();

        // فحص القواعد بعد كل تسجيل
        this._evaluateRules(camp);

        return camp.kpis;
    }

    // ══════════════════════════════════════════════════════
    // 4️⃣  قواعد السلوك الآلي
    // ══════════════════════════════════════════════════════

    addRule(campaignId, rule) {
        const idx = this._findIdx(campaignId);
        if (idx < 0) return { error: 'الحملة غير موجودة' };
        const camp = this.db.campaigns[idx];
        const newRule = {
            id:       'RULE-' + crypto.randomUUID().substring(0, 6).toUpperCase(),
            type:     rule.type,
            threshold: rule.threshold || null,
            action:   rule.action || 'alert',
            message:  rule.message || '',
            enabled:  rule.enabled !== false,
            triggered: false,
            triggeredAt: null,
        };
        camp.rules.push(newRule);
        this._saveDB();
        return newRule;
    }

    /** تقييم قواعد حملة وتنفيذ الإجراءات */
    _evaluateRules(camp) {
        if (camp.status !== STATUS.ACTIVE) return;
        const alerts = [];

        (camp.rules || []).forEach(rule => {
            if (!rule.enabled || rule.triggered) return;

            let shouldTrigger = false;

            switch (rule.type) {
                case RULE_TYPES.BUDGET_CAP:
                    shouldTrigger = camp.budget > 0 && camp.spent >= camp.budget;
                    break;
                case RULE_TYPES.DAILY_CAP:
                    shouldTrigger = rule.threshold > 0 && (camp.dailySpent || 0) >= rule.threshold;
                    break;
                case RULE_TYPES.CTR_LOW_ALERT:
                    shouldTrigger = camp.kpis.impressions >= 1000 && camp.kpis.ctr < (rule.threshold || 0.5);
                    break;
                case RULE_TYPES.CTR_PAUSE:
                    shouldTrigger = camp.kpis.impressions >= 2000 && camp.kpis.ctr < (rule.threshold || 0.1);
                    break;
                case RULE_TYPES.TIME_END:
                    shouldTrigger = camp.endDate && new Date() >= new Date(camp.endDate);
                    break;
                case RULE_TYPES.LEAD_TARGET:
                    shouldTrigger = rule.threshold > 0 && camp.kpis.leads >= rule.threshold;
                    break;
                case RULE_TYPES.CONVERSION_TARGET:
                    shouldTrigger = rule.threshold > 0 && camp.kpis.conversions >= rule.threshold;
                    break;
            }

            if (!shouldTrigger) return;

            rule.triggered   = true;
            rule.triggeredAt = new Date().toISOString();

            const alert = {
                campaignId: camp.id,
                nameAr:     camp.nameAr,
                ruleType:   rule.type,
                action:     rule.action,
                at:         rule.triggeredAt,
                message:    rule.message || `قاعدة ${rule.type} فُعِّلت للحملة ${camp.nameAr}`,
            };
            alerts.push(alert);
            this.db.alerts.push(alert);

            if (rule.action === 'pause') {
                this.pauseCampaign(camp.id, `auto-rule: ${rule.type}`);
            } else if (rule.action === 'complete') {
                this.completeCampaign(camp.id, `auto-rule: ${rule.type}`);
            }

            this.emit('rule:triggered', alert);
            this._log('RULE_TRIGGERED', camp.id, alert);
        });

        if (alerts.length) this._saveDB();
        return alerts;
    }

    // ══════════════════════════════════════════════════════
    // 5️⃣  ربط Meta CAPI — إطلاق أحداث تلقائي
    // ══════════════════════════════════════════════════════

    async _fireCampaignLaunchCAPI(camp) {
        if (!this.metaEngine) return null;
        try {
            const result = await this.metaEngine.sendLandingPageViewEvent(
                { country: 'sa' },
                {
                    market:       camp.market !== 'all' ? camp.market : null,
                    placement:    camp.channels.includes('instagram') ? 'instagram_feed' : 'meta_ad',
                    utmCampaign:  camp.id,
                    utmSource:    camp.channels[0] || 'sheikha',
                    utmMedium:    'paid_social',
                    contentName:  camp.nameAr,
                    sourceUrl:    BRAND.siteUrl + '/' + (camp.market !== 'all' ? camp.market : ''),
                    value:        0,
                    currency:     camp.currency || 'SAR',
                },
            );
            camp.metaEvents.push({ event: 'LandingPageView', at: new Date().toISOString(), eventId: result.eventId });
            this._saveDB();
            return result;
        } catch (e) {
            this._log('CAPI_ERROR', camp.id, { error: e.message });
            return null;
        }
    }

    // ══════════════════════════════════════════════════════
    // 6️⃣  التقارير
    // ══════════════════════════════════════════════════════

    getDashboard() {
        const camps  = this.db.campaigns;
        const active = camps.filter(c => c.status === STATUS.ACTIVE);
        const now    = Date.now();
        const day    = 86_400_000;

        return {
            summary: {
                total:      camps.length,
                active:     active.length,
                scheduled:  camps.filter(c => c.status === STATUS.SCHEDULED).length,
                paused:     camps.filter(c => c.status === STATUS.PAUSED).length,
                completed:  camps.filter(c => c.status === STATUS.COMPLETED).length,
                draft:      camps.filter(c => c.status === STATUS.DRAFT).length,
            },
            budget: {
                totalAllocated: camps.reduce((s, c) => s + (c.budget || 0), 0),
                totalSpent:     camps.reduce((s, c) => s + (c.spent  || 0), 0),
            },
            kpis: {
                totalImpressions:  camps.reduce((s, c) => s + (c.kpis?.impressions  || 0), 0),
                totalClicks:       camps.reduce((s, c) => s + (c.kpis?.clicks       || 0), 0),
                totalLeads:        camps.reduce((s, c) => s + (c.kpis?.leads        || 0), 0),
                totalConversions:  camps.reduce((s, c) => s + (c.kpis?.conversions  || 0), 0),
            },
            activeCampaigns: active.map(c => ({
                id:      c.id,
                nameAr:  c.nameAr,
                market:  c.market,
                target:  c.target,
                budget:  c.budget,
                spent:   c.spent,
                kpis:    c.kpis,
                createdAt: c.createdAt,
            })),
            recentAlerts: this.db.alerts.slice(-10).reverse(),
            byMarket:  this._groupBy(camps, 'market'),
            byTarget:  this._groupBy(camps, 'target'),
            byStatus:  this._groupBy(camps, 'status'),
            templates: Object.keys(this.templates).map(k => ({
                key:    k,
                nameAr: this.templates[k].nameAr,
                emoji:  this.templates[k].emoji,
            })),
            brand:     this.brand,
            version:   this.version,
            lastCheck: new Date().toISOString(),
        };
    }

    getCampaignReport(id) {
        const camp = this.getCampaign(id);
        if (!camp) return { error: 'الحملة غير موجودة' };

        const budget = camp.budget || 0;
        const spent  = camp.spent  || 0;
        const roi    = spent > 0 && camp.kpis.conversions > 0
            ? +(((camp.kpis.conversions * 500) - spent) / spent * 100).toFixed(1)
            : 0;

        return {
            ...camp,
            analytics: {
                budgetUtilization: budget > 0 ? +((spent / budget) * 100).toFixed(1) : 0,
                roi,
                ctr:  camp.kpis.ctr,
                cpl:  camp.kpis.cpl,
                conversionRate: camp.kpis.leads > 0
                    ? +((camp.kpis.conversions / camp.kpis.leads) * 100).toFixed(1)
                    : 0,
            },
            creativeCount: (camp.creatives || []).length,
            ruleCount:     (camp.rules    || []).length,
            triggeredRules:(camp.rules    || []).filter(r => r.triggered).length,
        };
    }

    getAlerts(resolved = false) {
        return resolved ? this.db.alerts : this.db.alerts.filter(a => !a.resolved);
    }

    resolveAlert(alertIdx) {
        if (this.db.alerts[alertIdx]) {
            this.db.alerts[alertIdx].resolved   = true;
            this.db.alerts[alertIdx].resolvedAt = new Date().toISOString();
            this._saveDB();
            return { success: true };
        }
        return { error: 'التنبيه غير موجود' };
    }

    getStatus() {
        return {
            nameAr:   this.nameAr,
            version:  this.version,
            campaigns: this.db.campaigns.length,
            active:    this.db.campaigns.filter(c => c.status === STATUS.ACTIVE).length,
            alerts:    this.db.alerts.filter(a => !a.resolved).length,
            templates: Object.keys(this.templates).length,
            ruleTypes: Object.keys(RULE_TYPES).length,
            hasMetaEngine: !!this.metaEngine,
            apis:      22,
            tickMs:    this._tickMs,
        };
    }

    // ══════════════════════════════════════════════════════
    // 7️⃣  تسجيل مسارات Express
    // ══════════════════════════════════════════════════════

    registerRoutes(app) {
        const base = '/api/حملات-شيخة';
        const en   = '/api/sheikha-campaigns';

        const dual = (arPath, handler) => {
            app.get (base + arPath, handler);
            app.get (en   + arPath, handler);
        };
        const dualPost = (arPath, handler) => {
            app.post(base + arPath, handler);
            app.post(en   + arPath, handler);
        };
        const dualPut = (arPath, handler) => {
            app.put (base + arPath, handler);
            app.put (en   + arPath, handler);
        };

        // ── لوحة القيادة ──────────────────────────────────────────────
        dual('/dashboard', (req, res) => res.json(this.getDashboard()));
        dual('/status',    (req, res) => res.json(this.getStatus()));
        dual('/brand',     (req, res) => res.json({ brand: this.brand, templates: this.templates }));

        // ── الحملات (CRUD) ─────────────────────────────────────────────
        dual('/campaigns', (req, res) => {
            const filters = {
                status: req.query.status, market: req.query.market,
                target: req.query.target, type:   req.query.type,
                channel: req.query.channel,
            };
            res.json({ success: true, campaigns: this.listCampaigns(filters) });
        });

        dualPost('/campaigns', (req, res) => {
            try {
                const camp = this.createCampaign(req.body);
                res.json({ success: true, campaign: camp });
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        dual('/campaigns/:id', (req, res) => {
            const camp = this.getCampaignReport(req.params.id);
            res.json(camp.error ? { success: false, ...camp } : { success: true, campaign: camp });
        });

        dualPut('/campaigns/:id', (req, res) => {
            const result = this.updateCampaign(req.params.id, req.body);
            res.json(result.error ? { success: false, ...result } : { success: true, campaign: result });
        });

        // ── إجراءات دورة الحياة ────────────────────────────────────────
        dualPost('/campaigns/:id/activate', (req, res) => {
            const result = this.activateCampaign(req.params.id);
            res.json(result.error ? { success: false, ...result } : { success: true, campaign: result });
        });

        dualPost('/campaigns/:id/pause', (req, res) => {
            const { reason } = req.body || {};
            const result = this.pauseCampaign(req.params.id, reason);
            res.json(result.error ? { success: false, ...result } : { success: true, campaign: result });
        });

        dualPost('/campaigns/:id/complete', (req, res) => {
            const { reason } = req.body || {};
            const result = this.completeCampaign(req.params.id, reason);
            res.json(result.error ? { success: false, ...result } : { success: true, campaign: result });
        });

        dualPost('/campaigns/:id/archive', (req, res) => {
            res.json(this.archiveCampaign(req.params.id));
        });

        // ── KPI ────────────────────────────────────────────────────────
        dualPost('/campaigns/:id/kpi', (req, res) => {
            const { kpi, value, utmCampaign } = req.body;
            if (!kpi) return res.status(400).json({ error: 'kpi مطلوب' });
            const result = this.recordKPI(req.params.id, kpi, value, utmCampaign);
            res.json(result.error ? { success: false, ...result } : { success: true, kpis: result });
        });

        // ── الكريتيف / الصور ──────────────────────────────────────────
        dualPost('/campaigns/:id/creative', (req, res) => {
            const result = this.generateCreative(req.params.id, req.body.type);
            res.json(result.error ? { success: false, ...result } : { success: true, creative: result });
        });

        app.get(`${base}/campaigns/:id/creative/:type/preview`, (req, res) => {
            const html = this.previewCreativeHtml(req.params.id, req.params.type);
            res.set('Content-Type', 'text/html; charset=utf-8').send(html);
        });
        app.get(`${en}/campaigns/:id/creative/:type/preview`, (req, res) => {
            const html = this.previewCreativeHtml(req.params.id, req.params.type);
            res.set('Content-Type', 'text/html; charset=utf-8').send(html);
        });

        // ── القواعد (Rules) ────────────────────────────────────────────
        dualPost('/campaigns/:id/rules', (req, res) => {
            const result = this.addRule(req.params.id, req.body);
            res.json(result.error ? { success: false, ...result } : { success: true, rule: result });
        });

        // ── التنبيهات ─────────────────────────────────────────────────
        dual('/alerts', (req, res) => {
            res.json({ success: true, alerts: this.getAlerts(req.query.all === '1') });
        });

        dualPost('/alerts/:idx/resolve', (req, res) => {
            res.json(this.resolveAlert(parseInt(req.params.idx, 10)));
        });

        // ── قوالب جاهزة ───────────────────────────────────────────────
        dual('/templates', (req, res) => {
            res.json({
                success:   true,
                templates: Object.entries(this.templates).map(([k, v]) => ({
                    key:    k,
                    nameAr: v.nameAr,
                    emoji:  v.emoji,
                    headline: v.headlineAr,
                })),
                ruleTypes: Object.values(RULE_TYPES),
            });
        });

        // ── إنشاء حملة سريعة من قالب ─────────────────────────────────
        dualPost('/quick-launch', (req, res) => {
            try {
                const { templateKey, budget, startDate, endDate, channels, market, target } = req.body;
                if (!templateKey || !this.templates[templateKey]) {
                    return res.status(400).json({ error: 'قالب غير صالح', available: Object.keys(this.templates) });
                }
                const camp = this.createCampaign({
                    template: templateKey,
                    budget:   budget   || 1000,
                    startDate,
                    endDate,
                    channels: channels || ['instagram', 'whatsapp'],
                    market:   market   || templateKey.split('_')[0],
                    target:   target   || templateKey.split('_')[1]?.toUpperCase() || 'B2B',
                    rules: [
                        { type: RULE_TYPES.BUDGET_CAP, action: 'pause',  message: 'تم استنزاف ميزانية الحملة' },
                        { type: RULE_TYPES.TIME_END,   action: 'complete', message: 'انتهت مدة الحملة' },
                        { type: RULE_TYPES.CTR_LOW_ALERT, threshold: 0.5, action: 'alert', message: 'CTR منخفض — راجع الكريتيف' },
                    ],
                });
                // تشغيل تلقائي إذا startDate اليوم أو بدون تاريخ
                if (!startDate || new Date(startDate) <= new Date()) {
                    this.activateCampaign(camp.id);
                }
                const fresh = this.getCampaignReport(camp.id);
                res.json({ success: true, campaign: fresh, message: `✅ حملة "${fresh.nameAr}" أُطلقت بنجاح` });
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        console.log(`✅ [CampaignAutomationEngine v${this.version}] 22 API مسجّل | Base: ${base}`);
    }

    // ══════════════════════════════════════════════════════
    // ⏰ الـ Ticker — فحص دوري آلي كل دقيقة
    // ══════════════════════════════════════════════════════

    _startTicker() {
        if (this._ticker) return;
        this._ticker = setInterval(() => this._tick(), this._tickMs);
        if (this._ticker.unref) this._ticker.unref(); // لا يمنع إيقاف Node
    }

    _tick() {
        const now = new Date();
        this.db.campaigns.forEach(camp => {
            // تشغيل الحملات المجدولة التي حان وقتها
            if (camp.status === STATUS.SCHEDULED && camp.startDate && now >= new Date(camp.startDate)) {
                this.activateCampaign(camp.id);
                return;
            }
            // تقييم القواعد على الحملات النشطة
            if (camp.status === STATUS.ACTIVE) {
                this._evaluateRules(camp);
                // إعادة تعيين الإنفاق اليومي عند منتصف الليل
                if (camp.dailyResetAt) {
                    const resetAt = new Date(camp.dailyResetAt);
                    if (now >= resetAt) {
                        camp.dailySpent  = 0;
                        camp.dailyResetAt = new Date(resetAt.getTime() + 86_400_000).toISOString();
                    }
                } else {
                    // أول ضبط — يبدأ التالي من منتصف الليل القادم
                    const midnight = new Date(now);
                    midnight.setHours(0, 0, 0, 0);
                    midnight.setDate(midnight.getDate() + 1);
                    camp.dailyResetAt = midnight.toISOString();
                }
            }
        });
        this._saveDB();
    }

    // ══════════════════════════════════════════════════════
    // 🎨 مولّد الكريتيف الداخلي
    // ══════════════════════════════════════════════════════

    _generateCreatives(camp, template, types = null) {
        const tpl = template || {
            headlineAr: camp.nameAr,
            bodyAr:     'سوق شيخة الذكي المتكامل',
            ctaAr:      'اكتشف الآن',
            ctaUrl:     BRAND.siteUrl,
            hashtags:   ['#شيخة', '#SHEIKHA'],
            emoji:      '🌟',
        };

        const allTypes = types || ['banner_square', 'banner_story', 'post_text', 'whatsapp_message'];
        const colors   = camp.identity?.colors || BRAND.colors;
        const created  = [];

        allTypes.forEach(type => {
            let creative = null;
            switch (type) {
                case 'banner_square':
                    creative = this._makeBannerSquare(camp, tpl, colors);
                    break;
                case 'banner_story':
                    creative = this._makeBannerStory(camp, tpl, colors);
                    break;
                case 'banner_wide':
                    creative = this._makeBannerWide(camp, tpl, colors);
                    break;
                case 'post_text':
                    creative = this._makePostText(camp, tpl);
                    break;
                case 'whatsapp_message':
                    creative = this._makeWhatsAppMessage(camp, tpl);
                    break;
            }
            if (creative) created.push(creative);
        });
        return created;
    }

    /** بانر مربع 1080×1080 (Instagram / Facebook) */
    _makeBannerSquare(camp, tpl, colors) {
        const id = 'CRV-' + crypto.randomUUID().substring(0, 6).toUpperCase();
        const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1080px;font-family:${BRAND.fonts.arabic};background:${colors.primary};color:${colors.text};overflow:hidden;display:flex;flex-direction:column;justify-content:space-between;align-items:center;padding:60px}
.header{text-align:center;opacity:.8;font-size:28px;letter-spacing:4px}
.pattern{position:absolute;top:0;left:0;width:100%;height:100%;opacity:.06;background-image:repeating-linear-gradient(45deg,${colors.secondary} 0,${colors.secondary} 1px,transparent 0,transparent 50%);background-size:30px 30px;pointer-events:none}
.badge{background:${colors.secondary};color:${colors.dark};padding:8px 32px;border-radius:50px;font-size:22px;font-weight:bold;margin-bottom:16px}
.emoji{font-size:100px;margin:20px 0}
.headline{font-size:56px;font-weight:900;text-align:center;line-height:1.3;margin:20px 0}
.body{font-size:30px;text-align:center;line-height:1.8;opacity:.9;max-width:900px}
.cta{background:${colors.secondary};color:${colors.dark};padding:20px 60px;border-radius:50px;font-size:34px;font-weight:bold;margin-top:40px;cursor:pointer}
.hashtags{font-size:20px;opacity:.7;text-align:center;margin-top:16px}
.logo{font-size:40px;font-weight:900;letter-spacing:2px;color:${colors.secondary}}
</style>
</head>
<body>
<div class="pattern"></div>
<div class="header">${BRAND.basmala}</div>
<div style="display:flex;flex-direction:column;align-items:center;flex:1;justify-content:center">
  <div class="badge">${tpl.emoji} ${camp.nameAr}</div>
  <div class="headline">${tpl.headlineAr}</div>
  <div class="body">${(tpl.bodyAr || '').replace(/\n/g, '<br>')}</div>
  <div class="cta">${tpl.ctaAr} ←</div>
  <div class="hashtags">${(tpl.hashtags || []).join(' ')}</div>
</div>
<div class="logo">${BRAND.nameAr} · ${BRAND.nameEn}</div>
</body></html>`;
        return { id, campaignId: camp.id, type: 'banner_square', size: '1080×1080', html, generatedAt: new Date().toISOString() };
    }

    /** بانر ستوري 1080×1920 (Instagram Stories / Snapchat) */
    _makeBannerStory(camp, tpl, colors) {
        const id = 'CRV-' + crypto.randomUUID().substring(0, 6).toUpperCase();
        const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1920px;font-family:${BRAND.fonts.arabic};background:linear-gradient(160deg,${colors.dark} 0%,${colors.primary} 60%,${colors.accent} 100%);color:${colors.text};display:flex;flex-direction:column;justify-content:space-between;align-items:center;padding:80px 60px;overflow:hidden}
.pattern{position:absolute;inset:0;opacity:.05;background-image:repeating-linear-gradient(60deg,${colors.secondary} 0,${colors.secondary} 1px,transparent 0,transparent 50%);background-size:40px 40px;pointer-events:none}
.basmala{font-size:32px;opacity:.7;text-align:center}
.logo{font-size:52px;font-weight:900;color:${colors.secondary};text-align:center;letter-spacing:3px}
.center{display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;gap:30px}
.emoji{font-size:140px}
.headline{font-size:72px;font-weight:900;text-align:center;line-height:1.4}
.body{font-size:36px;text-align:center;line-height:2;opacity:.9;max-width:900px}
.cta{background:${colors.secondary};color:${colors.dark};padding:28px 80px;border-radius:60px;font-size:42px;font-weight:bold}
.url{font-size:28px;opacity:.7;margin-top:10px}
.swipe{font-size:28px;opacity:.6;margin-top:20px}
</style>
</head>
<body>
<div class="pattern"></div>
<div class="basmala">${BRAND.basmala}</div>
<div class="center">
  <div class="emoji">${tpl.emoji}</div>
  <div class="headline">${tpl.headlineAr}</div>
  <div class="body">${(tpl.bodyAr || '').replace(/\n/g, '<br>')}</div>
  <div class="cta">${tpl.ctaAr}</div>
  <div class="url">${tpl.ctaUrl}</div>
</div>
<div style="display:flex;flex-direction:column;align-items:center;gap:10px">
  <div class="swipe">⬆️ اسحب للأعلى لمعرفة المزيد</div>
  <div class="logo">${BRAND.nameAr}</div>
</div>
</body></html>`;
        return { id, campaignId: camp.id, type: 'banner_story', size: '1080×1920', html, generatedAt: new Date().toISOString() };
    }

    /** بانر عريض 1200×628 (LinkedIn / Facebook) */
    _makeBannerWide(camp, tpl, colors) {
        const id = 'CRV-' + crypto.randomUUID().substring(0, 6).toUpperCase();
        const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:1200px;height:628px;font-family:${BRAND.fonts.arabic};background:${colors.dark};color:${colors.text};display:flex;align-items:stretch;overflow:hidden}
.left{width:320px;background:${colors.primary};display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;gap:20px;flex-shrink:0}
.logo{font-size:48px;font-weight:900;color:${colors.secondary};text-align:center}
.sub{font-size:18px;opacity:.8;text-align:center}
.right{flex:1;display:flex;flex-direction:column;justify-content:center;padding:60px 50px;gap:20px;position:relative;overflow:hidden}
.pattern{position:absolute;inset:0;opacity:.05;background-image:repeating-linear-gradient(45deg,${colors.secondary} 0,${colors.secondary} 1px,transparent 0,transparent 50%);background-size:25px 25px}
.badge{background:${colors.secondary};color:${colors.dark};padding:8px 24px;border-radius:30px;font-size:18px;font-weight:bold;display:inline-block;width:fit-content}
.headline{font-size:46px;font-weight:900;line-height:1.3}
.body{font-size:22px;line-height:1.8;opacity:.85}
.cta{background:${colors.primary};padding:14px 40px;border-radius:40px;font-size:22px;font-weight:bold;display:inline-block;width:fit-content}
</style>
</head>
<body>
<div class="left">
  <div class="logo">${BRAND.nameAr}</div>
  <div class="sub">${BRAND.tagline.ar}</div>
  <div style="font-size:60px">${tpl.emoji}</div>
</div>
<div class="right">
  <div class="pattern"></div>
  <div class="badge">${camp.nameAr}</div>
  <div class="headline">${tpl.headlineAr}</div>
  <div class="body">${(tpl.bodyAr || '').split('\n').slice(0, 3).join(' · ')}</div>
  <div class="cta">${tpl.ctaAr} ← ${tpl.ctaUrl}</div>
</div>
</body></html>`;
        return { id, campaignId: camp.id, type: 'banner_wide', size: '1200×628', html, generatedAt: new Date().toISOString() };
    }

    /** نص منشور (LinkedIn / X / Instagram) */
    _makePostText(camp, tpl) {
        const id = 'CRV-' + crypto.randomUUID().substring(0, 6).toUpperCase();
        const text = `${BRAND.basmala}\n\n${tpl.emoji} ${tpl.headlineAr}\n\n${tpl.bodyAr}\n\n🔗 ${tpl.ctaUrl}\n\n${(tpl.hashtags || []).join(' ')}`;
        return { id, campaignId: camp.id, type: 'post_text', platform: 'linkedin/x/instagram', text, generatedAt: new Date().toISOString() };
    }

    /** رسالة واتساب */
    _makeWhatsAppMessage(camp, tpl) {
        const id = 'CRV-' + crypto.randomUUID().substring(0, 6).toUpperCase();
        const text = `${tpl.emoji} *${tpl.headlineAr}*\n\n${tpl.bodyAr}\n\n✅ *${tpl.ctaAr}*\n${tpl.ctaUrl}\n\n_${BRAND.nameAr} — ${BRAND.tagline.ar}_`;
        return { id, campaignId: camp.id, type: 'whatsapp_message', platform: 'whatsapp', text, generatedAt: new Date().toISOString() };
    }

    // ══════════════════════════════════════════════════════
    // 🛠️ مساعدات داخلية
    // ══════════════════════════════════════════════════════

    _defaultRules(data) {
        const rules = [];
        // دائماً: إيقاف عند نهاية تاريخ الحملة
        rules.push({ id: 'RULE-AUTO-TIME', type: RULE_TYPES.TIME_END, action: 'complete', enabled: true, triggered: false, message: 'انتهت مدة الحملة تلقائياً' });
        // إيقاف عند استنزاف الميزانية إذا وُجدت
        if (data.budget > 0) {
            rules.push({ id: 'RULE-AUTO-BUDGET', type: RULE_TYPES.BUDGET_CAP, action: 'pause', enabled: true, triggered: false, message: 'تم استنزاف الميزانية الكاملة' });
        }
        return rules;
    }

    _findIdx(id) { return this.db.campaigns.findIndex(c => c.id === id); }

    _groupBy(arr, key) {
        const r = {};
        arr.forEach(item => { const k = item[key] || 'unknown'; r[k] = (r[k] || 0) + 1; });
        return r;
    }

    _loadDB() {
        try {
            if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
            if (fs.existsSync(DB_FILE)) return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
        } catch (_) { /* ignore */ }
        return { campaigns: [], alerts: [] };
    }

    _saveDB() {
        try { fs.writeFileSync(DB_FILE, JSON.stringify(this.db, null, 2), 'utf-8'); } catch (_) { /* ignore */ }
    }

    _ensureLogDir() {
        try {
            const dir = path.dirname(LOG_FILE);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        } catch (_) { /* ignore */ }
    }

    _log(type, id, detail) {
        try {
            const entry = JSON.stringify({ type, id, detail, at: new Date().toISOString() }) + '\n';
            fs.appendFileSync(LOG_FILE, entry, 'utf-8');
        } catch (_) { /* ignore */ }
    }
}

module.exports = SheikhaCAE;
