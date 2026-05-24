/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  بسم الله الرحمن الرحيم                                                      ║
 * ║  SHEIKHA VIDEO & CONTENT MANAGEMENT ENGINE                                   ║
 * ║  نظام توليد الفيديو وإدارة المحتوى الكامل                                    ║
 * ║                                                                              ║
 * ║  المحاور:                                                                    ║
 * ║   1️⃣  توليد سيناريو الفيديو بالذكاء الاصطناعي (AI Script Generator)         ║
 * ║   2️⃣  توليد HTML5 مرئي (Canvas/CSS Animated Preview)                        ║
 * ║   3️⃣  مكتبة الفيديو (Library + Storage + Metadata)                          ║
 * ║   4️⃣  إدارة المحتوى الكامل (CMS — Post · Article · Reel · Story · Short)    ║
 * ║   5️⃣  تقويم النشر الذكي (Smart Publishing Calendar)                         ║
 * ║   6️⃣  خط أنابيب النشر (Publish Pipeline — Draft→Review→Approved→Published)   ║
 * ║   7️⃣  تحليلات وتقارير المحتوى                                               ║
 * ║                                                                              ║
 * ║  v1.0.0 — © 2026 سلمان أحمد بن سلمان الراجح                                 ║
 * ║  ﴿وَقُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ وَرَسُولُهُ﴾ — التوبة ١٠٥  ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */
'use strict';

const crypto       = require('crypto');
const fs           = require('fs');
const path         = require('path');
const EventEmitter = require('events');

// ── مسارات البيانات ──────────────────────────────────────────────────────────
const DATA_DIR      = path.join(__dirname, '..', 'data');
const VIDEO_DB      = path.join(DATA_DIR, 'video-library.json');
const CONTENT_DB    = path.join(DATA_DIR, 'content-management.json');
const CALENDAR_DB   = path.join(DATA_DIR, 'content-calendar.json');
const LOG_FILE      = path.join(DATA_DIR, 'operations', 'video-content.ndjson');
const PREVIEW_DIR   = path.join(__dirname, '..', 'public', 'video-previews');
const VERSION       = '1.0.0';

// ── ثوابت الهوية البصرية ────────────────────────────────────────────────────
const BRAND = {
    nameAr:    'شيخة',
    nameEn:    'SHEIKHA',
    siteUrl:   'https://sheikha.top',
    colors:    { primary: '#006c35', secondary: '#c9a42c', dark: '#1a1a2e', accent: '#1a5276', light: '#faf7f0', text: '#ffffff' },
    fonts:     { arabic: "'Amiri','Tajawal','Cairo',serif", english: "'Inter','Open Sans',sans-serif" },
    basmala:   'بسم الله الرحمن الرحيم',
    tagline:   { ar: 'السوق الذكي المتكامل', en: 'The Complete Smart Market' },
    islNote:   'لا صور ذوات أرواح — زخارف هندسية إسلامية فقط',
};

// ── أنواع المحتوى ────────────────────────────────────────────────────────────
const CONTENT_TYPES = {
    VIDEO_REEL:    { id: 'reel',     nameAr: 'ريل',             aspect: '9:16',  dur: [15, 60],   platforms: ['instagram', 'tiktok', 'snapchat'] },
    VIDEO_STORY:   { id: 'story',    nameAr: 'ستوري',           aspect: '9:16',  dur: [5, 15],    platforms: ['instagram', 'snapchat', 'whatsapp'] },
    VIDEO_SHORT:   { id: 'short',    nameAr: 'شورت يوتيوب',     aspect: '9:16',  dur: [15, 60],   platforms: ['youtube'] },
    VIDEO_SMI:     { id: 'smi',      nameAr: 'فيديو مؤشر SMI', aspect: '1:1',   dur: [15, 30],   platforms: ['linkedin', 'x', 'instagram'] },
    VIDEO_LONG:    { id: 'longform', nameAr: 'فيديو طويل',      aspect: '16:9',  dur: [120, 600], platforms: ['youtube'] },
    VIDEO_AD:      { id: 'ad',       nameAr: 'إعلان فيديو',     aspect: '1:1',   dur: [6, 30],    platforms: ['instagram', 'facebook', 'google'] },
    POST_IMAGE:    { id: 'post',     nameAr: 'بوست صورة',       aspect: '1:1',   dur: null,       platforms: ['instagram', 'linkedin', 'x'] },
    POST_CAROUSEL: { id: 'carousel', nameAr: 'كاروسيل',         aspect: '1:1',   dur: null,       platforms: ['instagram', 'linkedin'] },
    ARTICLE:       { id: 'article',  nameAr: 'مقال',            aspect: null,    dur: null,       platforms: ['blog', 'linkedin'] },
    INFOGRAPHIC:   { id: 'infograph',nameAr: 'إنفوجرافيك',      aspect: '9:16',  dur: null,       platforms: ['instagram', 'linkedin', 'x'] },
    WHATSAPP_MSG:  { id: 'whatsapp', nameAr: 'رسالة واتساب',    aspect: null,    dur: null,       platforms: ['whatsapp'] },
    EMAIL_BLAST:   { id: 'email',    nameAr: 'حملة بريد',       aspect: null,    dur: null,       platforms: ['email'] },
};

// ── قوالب سيناريوهات الفيديو ─────────────────────────────────────────────────
const VIDEO_SCRIPT_TEMPLATES = {
    smi_daily: {
        nameAr: 'مؤشر SMI اليومي',
        sections: [
            { sec: 'hook',     dur: 3,  textAr: '📊 أسعار المعادن اليوم — مؤشر شيخة SMI',       style: 'bold-center' },
            { sec: 'data',     dur: 10, textAr: '🥇 ذهب {gold}$/oz · 🥈 فضة {silver}$/oz\n⚙️ نحاس {copper}$/ton · 🔩 حديد {iron}$/ton', style: 'data-list' },
            { sec: 'insight',  dur: 5,  textAr: 'تحليل السوق: {insight}',                        style: 'highlight' },
            { sec: 'cta',      dur: 3,  textAr: '📲 تابع أسعار المعادن لحظياً — sheikha.top',    style: 'cta' },
        ],
        hashtags: ['#شيخة', '#SMI', '#معادن', '#أسعار_المعادن', '#تجارة_إسلامية'],
    },
    product_showcase: {
        nameAr: 'عرض منتج / معدن',
        sections: [
            { sec: 'hook',      dur: 3,  textAr: '✨ تعرف على {product} من سوق شيخة',          style: 'hook' },
            { sec: 'features',  dur: 8,  textAr: '✅ {feature1}\n✅ {feature2}\n✅ {feature3}',  style: 'bullets' },
            { sec: 'why',       dur: 5,  textAr: 'لماذا شيخة؟ أسعار شفافة · حلال 100% · شحن موثوق', style: 'why' },
            { sec: 'cta',       dur: 4,  textAr: '🛒 اطلب الآن من sheikha.top',                 style: 'cta' },
        ],
        hashtags: ['#شيخة', '#معادن', '#سوق_ذكي', '#SHEIKHA'],
    },
    educational: {
        nameAr: 'محتوى تعليمي',
        sections: [
            { sec: 'question', dur: 3,  textAr: '❓ هل تعلم أن {fact}?',                         style: 'question' },
            { sec: 'explain',  dur: 12, textAr: '{explanation}',                                  style: 'body' },
            { sec: 'takeaway', dur: 5,  textAr: '💡 الخلاصة: {takeaway}',                        style: 'highlight' },
            { sec: 'cta',      dur: 3,  textAr: '📚 المزيد على sheikha.top',                     style: 'cta' },
        ],
        hashtags: ['#شيخة', '#تعليم', '#معادن', '#اقتصاد_إسلامي'],
    },
    promo_flash: {
        nameAr: 'عرض ترويجي سريع',
        sections: [
            { sec: 'alert',  dur: 2, textAr: '⚡ عرض محدود!',            style: 'alert' },
            { sec: 'offer',  dur: 6, textAr: '{offer_details}',           style: 'offer' },
            { sec: 'urgency',dur: 4, textAr: '⏰ ينتهي خلال {countdown}', style: 'urgency' },
            { sec: 'cta',    dur: 3, textAr: '👉 احجز الآن — sheikha.top', style: 'cta' },
        ],
        hashtags: ['#شيخة', '#عرض_خاص', '#معادن'],
    },
    brand_story: {
        nameAr: 'قصة العلامة التجارية',
        sections: [
            { sec: 'vision',  dur: 5, textAr: '🌟 رؤيتنا: {vision}',      style: 'vision' },
            { sec: 'mission', dur: 8, textAr: 'مهمتنا: {mission}',         style: 'mission' },
            { sec: 'values',  dur: 7, textAr: 'قيمنا: {values}',           style: 'values' },
            { sec: 'invite',  dur: 5, textAr: 'انضم إلى مجتمع شيخة',       style: 'invite' },
        ],
        hashtags: ['#شيخة', '#SHEIKHA', '#رؤية_2030', '#قيم_إسلامية'],
    },
};

// ── مراحل خط الأنابيب ───────────────────────────────────────────────────────
const PIPELINE_STAGES = ['idea', 'scripted', 'produced', 'review', 'approved', 'scheduled', 'published', 'archived'];

// ══════════════════════════════════════════════════════════════════════════════
//  🎬 Video & Content Management Engine
// ══════════════════════════════════════════════════════════════════════════════
class SheikhaVCE extends EventEmitter {
    constructor(options = {}) {
        super();
        this.version   = VERSION;
        this.name      = 'Sheikha Video & Content Engine';
        this.nameAr    = 'نظام توليد الفيديو وإدارة المحتوى الكامل';
        this.brand     = BRAND;
        this.aiEngine  = options.aiEngine || null;   // OpenAI/Gemini instance
        this.vdb       = this._load(VIDEO_DB,    { videos: [] });
        this.cdb       = this._load(CONTENT_DB,  { items: [] });
        this.caldb     = this._load(CALENDAR_DB, { slots: [] });
        this._ensureDirs();
        this._log('BOOT', null, { version: VERSION });
    }

    // ══════════════════════════════════════════════════════
    // 1️⃣  توليد سيناريو الفيديو (AI Script Generator)
    // ══════════════════════════════════════════════════════

    /**
     * توليد سيناريو فيديو كامل
     * @param {string} templateKey  - مفتاح القالب (smi_daily | product_showcase | …)
     * @param {object} vars         - متغيرات القالب { gold, silver, product, … }
     * @param {object} opts         - خيارات إضافية { durationSec, contentType, lang }
     */
    generateScript(templateKey, vars = {}, opts = {}) {
        const tpl = VIDEO_SCRIPT_TEMPLATES[templateKey];
        if (!tpl) return { error: 'قالب غير موجود', available: Object.keys(VIDEO_SCRIPT_TEMPLATES) };

        const id     = 'SCR-' + crypto.randomUUID().substring(0, 8).toUpperCase();
        const lang   = opts.lang || 'ar';
        const type   = opts.contentType || 'reel';

        // استبدال المتغيرات في كل section
        const sections = tpl.sections.map(sec => ({
            ...sec,
            text: this._fillVars(sec.textAr, vars),
        }));

        const totalDuration = sections.reduce((s, x) => s + x.dur, 0);
        const script = {
            id,
            templateKey,
            nameAr:   tpl.nameAr,
            type,
            lang,
            sections,
            totalDuration,
            hashtags:     tpl.hashtags,
            vars,
            voiceoverText: sections.map(s => s.text).join('\n'),
            captionText:   sections.map(s => s.text).join('\n\n'),
            generatedAt:   new Date().toISOString(),
        };

        this._log('SCRIPT_GENERATED', id, { templateKey, type });
        return script;
    }

    /** قائمة القوالب المتاحة */
    getScriptTemplates() {
        return Object.entries(VIDEO_SCRIPT_TEMPLATES).map(([key, tpl]) => ({
            key,
            nameAr:    tpl.nameAr,
            sections:  tpl.sections.length,
            duration:  tpl.sections.reduce((s, x) => s + x.dur, 0),
            hashtags:  tpl.hashtags,
        }));
    }

    // ══════════════════════════════════════════════════════
    // 2️⃣  توليد HTML5 Preview (مرئي قابل للتصدير)
    // ══════════════════════════════════════════════════════

    /** توليد HTML5 أنيميشن كامل للفيديو */
    generateVideoPreview(script, videoType = 'reel') {
        const id   = 'PRV-' + crypto.randomUUID().substring(0, 8).toUpperCase();
        const html = this._buildVideoHTML(script, videoType);

        // حفظ الملف
        const filename = `${id}.html`;
        const filepath = path.join(PREVIEW_DIR, filename);
        try { fs.writeFileSync(filepath, html, 'utf-8'); } catch (_) { /* ignore write error */ }

        return {
            id,
            scriptId:     script.id || null,
            type:         videoType,
            filename,
            publicPath:   `/video-previews/${filename}`,
            html,         // للعرض المباشر
            createdAt:    new Date().toISOString(),
        };
    }

    /** توليد HTML5 preview من template مباشرة (بدون script منفصل) */
    quickPreview(templateKey, vars = {}, videoType = 'reel') {
        const script = this.generateScript(templateKey, vars, { contentType: videoType });
        if (script.error) return script;
        return this.generateVideoPreview(script, videoType);
    }

    // ══════════════════════════════════════════════════════
    // 3️⃣  مكتبة الفيديو (Video Library)
    // ══════════════════════════════════════════════════════

    /** إضافة فيديو للمكتبة */
    addVideo(data) {
        const id = 'VID-' + crypto.randomUUID().substring(0, 8).toUpperCase();
        const video = {
            id,
            title:       data.title || data.nameAr || 'فيديو جديد',
            titleAr:     data.titleAr || data.title || 'فيديو جديد',
            type:        data.type   || 'reel',
            scriptId:    data.scriptId || null,
            previewPath: data.previewPath || null,
            url:         data.url   || null,       // رابط خارجي (YouTube, Drive, …)
            thumbnailUrl:data.thumbnailUrl || null,
            platform:    data.platform || [],
            duration:    data.duration || 0,
            aspect:      data.aspect   || '9:16',
            tags:        data.tags     || [],
            campaignId:  data.campaignId || null,
            status:      'produced',
            views:        0,
            likes:        0,
            shares:       0,
            comments:     0,
            reach:        0,
            clicks:       0,
            shariaReview: data.shariaReview !== false,
            metadata:    data.metadata || {},
            createdAt:   new Date().toISOString(),
            updatedAt:   new Date().toISOString(),
        };

        this.vdb.videos.push(video);
        this._save(VIDEO_DB, this.vdb);
        this._log('VIDEO_ADDED', id, { title: video.title, type: video.type });
        this.emit('video:added', video);
        return video;
    }

    updateVideo(id, updates) {
        const idx = this.vdb.videos.findIndex(v => v.id === id);
        if (idx < 0) return { error: 'الفيديو غير موجود' };
        const allowed = ['title', 'titleAr', 'url', 'thumbnailUrl', 'platform', 'tags', 'status', 'metadata', 'campaignId', 'views', 'likes', 'shares', 'reach', 'clicks'];
        allowed.forEach(k => { if (updates[k] !== undefined) this.vdb.videos[idx][k] = updates[k]; });
        this.vdb.videos[idx].updatedAt = new Date().toISOString();
        this._save(VIDEO_DB, this.vdb);
        return this.vdb.videos[idx];
    }

    recordVideoMetric(id, metric, value = 1) {
        const v = this.vdb.videos.find(v => v.id === id);
        if (!v) return { error: 'الفيديو غير موجود' };
        const allowed = ['views', 'likes', 'shares', 'comments', 'reach', 'clicks'];
        if (allowed.includes(metric)) v[metric] = (v[metric] || 0) + Number(value);
        v.updatedAt = new Date().toISOString();
        this._save(VIDEO_DB, this.vdb);
        return v;
    }

    listVideos(filters = {}) {
        let r = [...this.vdb.videos];
        if (filters.type)       r = r.filter(v => v.type       === filters.type);
        if (filters.platform)   r = r.filter(v => (v.platform || []).includes(filters.platform));
        if (filters.campaignId) r = r.filter(v => v.campaignId === filters.campaignId);
        if (filters.status)     r = r.filter(v => v.status     === filters.status);
        r.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return r;
    }

    getVideo(id) { return this.vdb.videos.find(v => v.id === id) || null; }

    // ══════════════════════════════════════════════════════
    // 4️⃣  إدارة المحتوى الكاملة (CMS)
    // ══════════════════════════════════════════════════════

    /** إنشاء محتوى جديد */
    createContent(data) {
        const id = 'CNT-' + crypto.randomUUID().substring(0, 8).toUpperCase();
        const type = data.type || 'post';
        const typeInfo = Object.values(CONTENT_TYPES).find(t => t.id === type) || CONTENT_TYPES.POST_IMAGE;

        const item = {
            id,
            title:       data.title || 'محتوى جديد',
            titleAr:     data.titleAr || data.title || 'محتوى جديد',
            type,
            typeInfo,
            bodyAr:      data.bodyAr  || data.body  || '',
            bodyEn:      data.bodyEn  || '',
            summary:     data.summary || '',
            hashtags:    data.hashtags || [],
            mentions:    data.mentions || [],
            mediaIds:    data.mediaIds  || [],  // مرتبط بالفيديوهات
            videoId:     data.videoId  || null,
            scriptId:    data.scriptId || null,
            campaignId:  data.campaignId || null,
            platforms:   data.platforms || typeInfo.platforms || [],
            publishAt:   data.publishAt || null,   // ISO string
            publishedAt: null,
            timezone:    data.timezone  || 'Asia/Riyadh',
            lang:        data.lang      || 'ar',
            category:    data.category  || 'general',
            tags:        data.tags      || [],
            cta:         data.cta       || null,
            ctaUrl:      data.ctaUrl    || BRAND.siteUrl,
            status:      'idea',
            pipeline:    PIPELINE_STAGES,
            currentStage: 'idea',
            stageHistory: [{ stage: 'idea', at: new Date().toISOString(), by: data.createdBy || 'system' }],
            kpis: { impressions: 0, reach: 0, clicks: 0, likes: 0, shares: 0, comments: 0, saves: 0 },
            shariaReview: { required: true, approved: false, reviewer: null, notes: '', checkedAt: null },
            createdAt:   new Date().toISOString(),
            updatedAt:   new Date().toISOString(),
        };

        this.cdb.items.push(item);
        this._save(CONTENT_DB, this.cdb);
        this._log('CONTENT_CREATED', id, { title: item.title, type });
        this.emit('content:created', item);
        return item;
    }

    updateContent(id, updates) {
        const idx = this._cIdx(id);
        if (idx < 0) return { error: 'المحتوى غير موجود' };
        const allowed = ['titleAr', 'titleEn', 'bodyAr', 'bodyEn', 'summary', 'hashtags', 'mentions', 'platforms', 'publishAt', 'tags', 'category', 'cta', 'ctaUrl', 'mediaIds', 'videoId', 'campaignId'];
        allowed.forEach(k => { if (updates[k] !== undefined) this.cdb.items[idx][k] = updates[k]; });
        this.cdb.items[idx].updatedAt = new Date().toISOString();
        this._save(CONTENT_DB, this.cdb);
        return this.cdb.items[idx];
    }

    /** تقديم إلى المرحلة التالية في خط الأنابيب */
    advancePipeline(id, toStage, by = 'system', note = '') {
        const idx = this._cIdx(id);
        if (idx < 0) return { error: 'المحتوى غير موجود' };
        const item = this.cdb.items[idx];
        const validStages = PIPELINE_STAGES;
        if (!validStages.includes(toStage)) return { error: 'مرحلة غير صالحة', valid: validStages };

        item.currentStage = toStage;
        item.status       = toStage === 'published' ? 'published' : toStage === 'archived' ? 'archived' : 'active';
        item.stageHistory.push({ stage: toStage, at: new Date().toISOString(), by, note });
        if (toStage === 'published') item.publishedAt = new Date().toISOString();
        item.updatedAt = new Date().toISOString();

        this._save(CONTENT_DB, this.cdb);
        this.emit('content:pipeline', { id, toStage, by });
        return item;
    }

    /** موافقة شرعية */
    shariahApprove(id, approved, reviewer = 'system', notes = '') {
        const idx = this._cIdx(id);
        if (idx < 0) return { error: 'المحتوى غير موجود' };
        const item = this.cdb.items[idx];
        item.shariaReview = { required: true, approved, reviewer, notes, checkedAt: new Date().toISOString() };
        item.updatedAt = new Date().toISOString();
        this._save(CONTENT_DB, this.cdb);
        return item;
    }

    /** تسجيل KPI للمحتوى */
    recordContentKPI(id, kpi, value = 1) {
        const idx = this._cIdx(id);
        if (idx < 0) return { error: 'المحتوى غير موجود' };
        const item = this.cdb.items[idx];
        const allowed = ['impressions', 'reach', 'clicks', 'likes', 'shares', 'comments', 'saves'];
        if (allowed.includes(kpi)) item.kpis[kpi] = (item.kpis[kpi] || 0) + Number(value);
        item.updatedAt = new Date().toISOString();
        this._save(CONTENT_DB, this.cdb);
        return item.kpis;
    }

    listContent(filters = {}) {
        let r = [...this.cdb.items];
        if (filters.type)       r = r.filter(c => c.type       === filters.type);
        if (filters.status)     r = r.filter(c => c.status     === filters.status);
        if (filters.stage)      r = r.filter(c => c.currentStage === filters.stage);
        if (filters.platform)   r = r.filter(c => (c.platforms || []).includes(filters.platform));
        if (filters.campaignId) r = r.filter(c => c.campaignId === filters.campaignId);
        if (filters.category)   r = r.filter(c => c.category   === filters.category);
        r.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return r;
    }

    getContent(id) { return this.cdb.items.find(c => c.id === id) || null; }

    deleteContent(id) {
        const idx = this._cIdx(id);
        if (idx < 0) return { error: 'المحتوى غير موجود' };
        this.cdb.items.splice(idx, 1);
        this._save(CONTENT_DB, this.cdb);
        return { success: true, id };
    }

    // ══════════════════════════════════════════════════════
    // 5️⃣  تقويم النشر الذكي (Publishing Calendar)
    // ══════════════════════════════════════════════════════

    /** جدولة محتوى في التقويم */
    scheduleContent(contentId, slot) {
        const item = this.getContent(contentId);
        if (!item) return { error: 'المحتوى غير موجود' };

        const slotId = 'SLT-' + crypto.randomUUID().substring(0, 8).toUpperCase();
        const entry = {
            id:         slotId,
            contentId,
            title:      item.titleAr,
            type:       item.type,
            platforms:  slot.platforms || item.platforms,
            scheduledAt: slot.scheduledAt,    // ISO datetime
            timezone:   slot.timezone || 'Asia/Riyadh',
            status:     'scheduled',
            publishedAt: null,
            createdAt:  new Date().toISOString(),
        };

        this.caldb.slots.push(entry);
        // تحديث المحتوى نفسه
        item.publishAt = slot.scheduledAt;
        item.currentStage = 'scheduled';
        item.updatedAt = new Date().toISOString();
        this._save(CALENDAR_DB, this.caldb);
        this._save(CONTENT_DB, this.cdb);
        this.emit('content:scheduled', entry);
        return entry;
    }

    /** توليد تقويم محتوى شهري تلقائي */
    generateMonthlyCalendar(monthOffset = 0, campaignId = null) {
        const now   = new Date();
        const year  = now.getFullYear();
        const month = now.getMonth() + monthOffset;
        const start = new Date(year, month, 1);
        const end   = new Date(year, month + 1, 0);

        const slots = [];
        const schedule = [
            // الأحد: مؤشر SMI
            { dow: 0, type: 'smi',       hour: 9,  platform: ['linkedin', 'x', 'instagram'],   templateKey: 'smi_daily' },
            // الاثنين: بوست تعليمي
            { dow: 1, type: 'post',      hour: 10, platform: ['linkedin', 'instagram'],         templateKey: 'educational' },
            // الثلاثاء: ريل
            { dow: 2, type: 'reel',      hour: 18, platform: ['instagram', 'tiktok'],           templateKey: 'product_showcase' },
            // الأربعاء: إنفوجرافيك
            { dow: 3, type: 'infograph', hour: 11, platform: ['linkedin', 'x'],                 templateKey: 'educational' },
            // الخميس: ستوري + واتساب
            { dow: 4, type: 'story',     hour: 16, platform: ['instagram', 'whatsapp'],         templateKey: 'smi_daily' },
            // السبت: شورت يوتيوب
            { dow: 6, type: 'short',     hour: 19, platform: ['youtube'],                       templateKey: 'product_showcase' },
        ];

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dow = d.getDay();
            const sched = schedule.filter(s => s.dow === dow);
            sched.forEach(s => {
                const at = new Date(d);
                at.setHours(s.hour, 0, 0, 0);
                const slotId = 'CAL-' + crypto.randomUUID().substring(0, 6).toUpperCase();
                slots.push({
                    id:           slotId,
                    contentId:    null,        // يُربط لاحقاً
                    type:         s.type,
                    templateKey:  s.templateKey,
                    platforms:    s.platform,
                    scheduledAt:  at.toISOString(),
                    timezone:     'Asia/Riyadh',
                    campaignId:   campaignId,
                    status:       'empty',     // empty | planned | scheduled | published
                    createdAt:    new Date().toISOString(),
                });
            });
        }

        // إضافة للتقويم
        this.caldb.slots.push(...slots);
        this._save(CALENDAR_DB, this.caldb);
        this.emit('calendar:generated', { month: month + 1, year, count: slots.length });
        return { month: month + 1, year, slotsCreated: slots.length, slots };
    }

    getCalendar(filters = {}) {
        let r = [...this.caldb.slots];
        if (filters.from)     r = r.filter(s => new Date(s.scheduledAt) >= new Date(filters.from));
        if (filters.to)       r = r.filter(s => new Date(s.scheduledAt) <= new Date(filters.to));
        if (filters.type)     r = r.filter(s => s.type === filters.type);
        if (filters.platform) r = r.filter(s => (s.platforms || []).includes(filters.platform));
        if (filters.status)   r = r.filter(s => s.status === filters.status);
        r.sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
        return r;
    }

    // ══════════════════════════════════════════════════════
    // 6️⃣  نشر المحتوى (Publish Pipeline)
    // ══════════════════════════════════════════════════════

    /** نشر محتوى (تحديث الحالة + تسجيل) */
    publishContent(contentId, publishedBy = 'system', externalUrls = {}) {
        const idx = this._cIdx(contentId);
        if (idx < 0) return { error: 'المحتوى غير موجود' };
        const item = this.cdb.items[idx];

        if (!item.shariaReview.approved) {
            return { error: 'المحتوى لم يحصل على الموافقة الشرعية بعد', status: item.shariaReview };
        }

        item.currentStage = 'published';
        item.status       = 'published';
        item.publishedAt  = new Date().toISOString();
        item.externalUrls = externalUrls;  // { instagram: '...', linkedin: '...', youtube: '...' }
        item.stageHistory.push({ stage: 'published', at: item.publishedAt, by: publishedBy });
        item.updatedAt = new Date().toISOString();

        // تحديث slot التقويم
        const slot = this.caldb.slots.find(s => s.contentId === contentId);
        if (slot) { slot.status = 'published'; slot.publishedAt = item.publishedAt; }

        this._save(CONTENT_DB, this.cdb);
        this._save(CALENDAR_DB, this.caldb);
        this._log('CONTENT_PUBLISHED', contentId, { by: publishedBy, urls: externalUrls });
        this.emit('content:published', item);
        return item;
    }

    // ══════════════════════════════════════════════════════
    // 7️⃣  لوحة القيادة والتقارير
    // ══════════════════════════════════════════════════════

    getDashboard() {
        const items  = this.cdb.items;
        const videos = this.vdb.videos;
        const slots  = this.caldb.slots;
        const now    = new Date();
        const week   = 7 * 86_400_000;

        const recentItems = items.filter(i => now - new Date(i.createdAt) < week);
        const published   = items.filter(i => i.status === 'published');
        const pendingReview = items.filter(i => i.shariaReview.required && !i.shariaReview.approved && i.status !== 'archived');

        return {
            content: {
                total:       items.length,
                byStage:     this._groupBy(items, 'currentStage'),
                byType:      this._groupBy(items, 'type'),
                published:   published.length,
                pendingReview: pendingReview.length,
                thisWeek:    recentItems.length,
            },
            videos: {
                total:        videos.length,
                byType:       this._groupBy(videos, 'type'),
                totalViews:   videos.reduce((s, v) => s + (v.views || 0), 0),
                totalLikes:   videos.reduce((s, v) => s + (v.likes || 0), 0),
                totalShares:  videos.reduce((s, v) => s + (v.shares || 0), 0),
            },
            calendar: {
                totalSlots:   slots.length,
                upcoming:     slots.filter(s => s.status === 'scheduled' && new Date(s.scheduledAt) > now).length,
                empty:        slots.filter(s => s.status === 'empty').length,
                published:    slots.filter(s => s.status === 'published').length,
            },
            kpis: {
                totalImpressions: items.reduce((s, i) => s + (i.kpis?.impressions || 0), 0),
                totalReach:       items.reduce((s, i) => s + (i.kpis?.reach  || 0), 0),
                totalLikes:       items.reduce((s, i) => s + (i.kpis?.likes  || 0), 0),
                totalShares:      items.reduce((s, i) => s + (i.kpis?.shares || 0), 0),
                totalClicks:      items.reduce((s, i) => s + (i.kpis?.clicks || 0), 0),
            },
            pipeline: {
                idea:      items.filter(i => i.currentStage === 'idea').length,
                scripted:  items.filter(i => i.currentStage === 'scripted').length,
                produced:  items.filter(i => i.currentStage === 'produced').length,
                review:    items.filter(i => i.currentStage === 'review').length,
                approved:  items.filter(i => i.currentStage === 'approved').length,
                scheduled: items.filter(i => i.currentStage === 'scheduled').length,
            },
            contentTypes:  Object.values(CONTENT_TYPES),
            scriptTemplates: this.getScriptTemplates(),
            pipelineStages:  PIPELINE_STAGES,
            version:         this.version,
            lastUpdated:     now.toISOString(),
        };
    }

    getStatus() {
        return {
            nameAr:   this.nameAr,
            version:  this.version,
            videos:   this.vdb.videos.length,
            content:  this.cdb.items.length,
            calendar: this.caldb.slots.length,
            scriptTemplates: Object.keys(VIDEO_SCRIPT_TEMPLATES).length,
            contentTypes:    Object.keys(CONTENT_TYPES).length,
            pipelineStages:  PIPELINE_STAGES.length,
            apis:     28,
        };
    }

    // ══════════════════════════════════════════════════════
    // تسجيل مسارات Express
    // ══════════════════════════════════════════════════════

    registerRoutes(app) {
        const base = '/api/محتوى-شيخة';
        const en   = '/api/sheikha-content';

        // helpers
        const g  = (ar, fn) => { app.get(base + ar, fn); app.get(en + ar, fn); };
        const p  = (ar, fn) => { app.post(base + ar, fn); app.post(en + ar, fn); };
        const pu = (ar, fn) => { app.put(base + ar, fn);  app.put(en + ar, fn); };
        const d  = (ar, fn) => { app.delete(base + ar, fn); app.delete(en + ar, fn); };

        // ── لوحة القيادة ──────────────────────────────────────────────
        g('/dashboard',        (req, res) => res.json(this.getDashboard()));
        g('/status',           (req, res) => res.json(this.getStatus()));

        // ── السيناريوهات (Scripts) ─────────────────────────────────────
        g('/scripts/templates', (req, res) => res.json({ success: true, templates: this.getScriptTemplates() }));

        p('/scripts/generate', (req, res) => {
            const { templateKey, vars, opts } = req.body;
            const result = this.generateScript(templateKey, vars || {}, opts || {});
            res.json(result.error ? { success: false, ...result } : { success: true, script: result });
        });

        // ── معاينة الفيديو (Video Preview) ────────────────────────────
        p('/videos/preview', (req, res) => {
            const { templateKey, vars, videoType } = req.body;
            const result = this.quickPreview(templateKey, vars || {}, videoType || 'reel');
            res.json(result.error ? { success: false, ...result } : { success: true, preview: result });
        });

        app.get(`${base}/videos/preview/:id`, (req, res) => {
            const filePath = path.join(PREVIEW_DIR, req.params.id + '.html');
            if (fs.existsSync(filePath)) {
                res.set('Content-Type', 'text/html; charset=utf-8').sendFile(filePath);
            } else {
                res.status(404).json({ error: 'المعاينة غير موجودة' });
            }
        });
        app.get(`${en}/videos/preview/:id`, (req, res) => {
            const filePath = path.join(PREVIEW_DIR, req.params.id + '.html');
            if (fs.existsSync(filePath)) {
                res.set('Content-Type', 'text/html; charset=utf-8').sendFile(filePath);
            } else {
                res.status(404).json({ error: 'Preview not found' });
            }
        });

        // ── مكتبة الفيديو ──────────────────────────────────────────────
        g('/videos', (req, res) => {
            res.json({ success: true, videos: this.listVideos(req.query) });
        });

        p('/videos', (req, res) => {
            const video = this.addVideo(req.body);
            res.json({ success: true, video });
        });

        g('/videos/:id', (req, res) => {
            const v = this.getVideo(req.params.id);
            res.json(v ? { success: true, video: v } : { success: false, error: 'غير موجود' });
        });

        pu('/videos/:id', (req, res) => {
            const r = this.updateVideo(req.params.id, req.body);
            res.json(r.error ? { success: false, ...r } : { success: true, video: r });
        });

        p('/videos/:id/metric', (req, res) => {
            const { metric, value } = req.body;
            const r = this.recordVideoMetric(req.params.id, metric, value);
            res.json(r.error ? { success: false, ...r } : { success: true, video: r });
        });

        // ── إدارة المحتوى (CMS) ────────────────────────────────────────
        g('/items', (req, res) => {
            res.json({ success: true, items: this.listContent(req.query) });
        });

        p('/items', (req, res) => {
            const item = this.createContent(req.body);
            res.json({ success: true, item });
        });

        g('/items/:id', (req, res) => {
            const item = this.getContent(req.params.id);
            res.json(item ? { success: true, item } : { success: false, error: 'غير موجود' });
        });

        pu('/items/:id', (req, res) => {
            const r = this.updateContent(req.params.id, req.body);
            res.json(r.error ? { success: false, ...r } : { success: true, item: r });
        });

        d('/items/:id', (req, res) => {
            res.json(this.deleteContent(req.params.id));
        });

        // خط الأنابيب
        p('/items/:id/advance', (req, res) => {
            const { stage, by, note } = req.body;
            if (!stage) return res.status(400).json({ error: 'stage مطلوب', valid: PIPELINE_STAGES });
            const r = this.advancePipeline(req.params.id, stage, by, note);
            res.json(r.error ? { success: false, ...r } : { success: true, item: r });
        });

        // موافقة شرعية
        p('/items/:id/shariah', (req, res) => {
            const { approved, reviewer, notes } = req.body;
            const r = this.shariahApprove(req.params.id, approved !== false, reviewer, notes);
            res.json(r.error ? { success: false, ...r } : { success: true, item: r });
        });

        // KPI
        p('/items/:id/kpi', (req, res) => {
            const { kpi, value } = req.body;
            const r = this.recordContentKPI(req.params.id, kpi, value);
            res.json(r.error ? { success: false, ...r } : { success: true, kpis: r });
        });

        // نشر
        p('/items/:id/publish', (req, res) => {
            const { by, externalUrls } = req.body;
            const r = this.publishContent(req.params.id, by, externalUrls || {});
            res.json(r.error ? { success: false, ...r } : { success: true, item: r });
        });

        // ── تقويم النشر ────────────────────────────────────────────────
        g('/calendar', (req, res) => {
            res.json({ success: true, slots: this.getCalendar(req.query) });
        });

        p('/calendar/generate', (req, res) => {
            const { monthOffset, campaignId } = req.body;
            const r = this.generateMonthlyCalendar(monthOffset || 0, campaignId || null);
            res.json({ success: true, ...r });
        });

        p('/calendar/schedule', (req, res) => {
            const { contentId, scheduledAt, platforms, timezone } = req.body;
            if (!contentId || !scheduledAt) return res.status(400).json({ error: 'contentId و scheduledAt مطلوبان' });
            const r = this.scheduleContent(contentId, { scheduledAt, platforms, timezone });
            res.json(r.error ? { success: false, ...r } : { success: true, slot: r });
        });

        // ── أنواع المحتوى والقوالب ─────────────────────────────────────
        g('/types', (req, res) => {
            res.json({ success: true, types: Object.values(CONTENT_TYPES), pipeline: PIPELINE_STAGES });
        });

        // ── إنشاء فيديو + محتوى من قالب في خطوة واحدة (Quick Create) ──
        p('/quick-create', (req, res) => {
            try {
                const { templateKey, vars, videoType, platforms, campaignId, publishAt } = req.body;
                if (!templateKey || !VIDEO_SCRIPT_TEMPLATES[templateKey]) {
                    return res.status(400).json({ error: 'قالب غير صالح', available: Object.keys(VIDEO_SCRIPT_TEMPLATES) });
                }

                // 1. توليد السيناريو
                const script  = this.generateScript(templateKey, vars || {}, { contentType: videoType || 'reel' });

                // 2. توليد HTML Preview
                const preview = this.generateVideoPreview(script, videoType || 'reel');

                // 3. إضافة للمكتبة
                const video = this.addVideo({
                    titleAr:     script.nameAr,
                    type:        videoType || 'reel',
                    scriptId:    script.id,
                    previewPath: preview.publicPath,
                    platform:    platforms || ['instagram', 'whatsapp'],
                    campaignId:  campaignId || null,
                    duration:    script.totalDuration,
                });

                // 4. إنشاء محتوى مرتبط
                const content = this.createContent({
                    titleAr:    script.nameAr,
                    type:       videoType || 'reel',
                    bodyAr:     script.captionText,
                    hashtags:   script.hashtags,
                    videoId:    video.id,
                    scriptId:   script.id,
                    campaignId: campaignId || null,
                    platforms:  platforms || ['instagram', 'whatsapp'],
                    publishAt:  publishAt || null,
                });

                // 5. تقديم لمرحلة scripted
                this.advancePipeline(content.id, 'scripted', 'system', 'أُنشئ من Quick Create');

                res.json({
                    success: true,
                    script,
                    video,
                    preview: { id: preview.id, publicPath: preview.publicPath },
                    content,
                    message: `✅ تم إنشاء "${script.nameAr}" بنجاح — سيناريو + فيديو + محتوى + معاينة`,
                });
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        console.log(`✅ [VideoContentEngine v${this.version}] ${this.nameAr} | 28 API مسجّل | Base: ${base}`);
    }

    // ══════════════════════════════════════════════════════
    // 🎨 مولّد HTML5 الداخلي للفيديو
    // ══════════════════════════════════════════════════════

    _buildVideoHTML(script, videoType = 'reel') {
        const colors = BRAND.colors;
        const isVertical = ['reel', 'story', 'short'].includes(videoType);
        const W = isVertical ? 1080 : 1280;
        const H = isVertical ? 1920 : 720;

        // بناء شرائح الأنيميشن من sections السيناريو
        const sections = (script.sections || []);
        const totalDur = (script.totalDuration || 30) * 1000;  // ms
        let elapsed    = 0;

        const slidesJS = sections.map((sec, i) => {
            const start = elapsed;
            const end   = elapsed + sec.dur * 1000;
            elapsed     = end;
            return { idx: i, start, end, text: sec.text || '', style: sec.style || 'body' };
        });

        const slidesJson = JSON.stringify(slidesJS);

        return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${script.nameAr || 'فيديو شيخة'}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:#000;font-family:${BRAND.fonts.arabic}}
#stage{position:relative;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden}
.bg{position:absolute;inset:0;z-index:0}
.bg-gradient{background:linear-gradient(160deg,${colors.dark} 0%,${colors.primary} 55%,${colors.accent} 100%)}
.pattern{position:absolute;inset:0;opacity:.07;background-image:repeating-linear-gradient(45deg,${colors.secondary} 0,${colors.secondary} 1px,transparent 0,transparent 50%);background-size:35px 35px}
.geo{position:absolute;top:-100px;right:-100px;width:400px;height:400px;border:3px solid ${colors.secondary};opacity:.15;border-radius:50%;animation:spin 20s linear infinite}
.geo2{position:absolute;bottom:-80px;left:-80px;width:300px;height:300px;border:2px solid ${colors.primary};opacity:.2;border-radius:50%;animation:spin2 15s linear infinite}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes spin2{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}
#content{position:relative;z-index:10;display:flex;flex-direction:column;align-items:center;justify-content:center;width:90%;text-align:center;gap:${isVertical?'40':'24'}px;color:${colors.text}}
.slide{display:none;flex-direction:column;align-items:center;gap:${isVertical?'30':'16'}px;animation:fadeIn .6s ease}
.slide.active{display:flex}
@keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
.slide-hook   .text{font-size:${isVertical?'76':'46'}px;font-weight:900;line-height:1.3;color:${colors.secondary}}
.slide-data   .text{font-size:${isVertical?'52':'32'}px;line-height:2.1;direction:rtl}
.slide-insight .text{font-size:${isVertical?'58':'36'}px;font-weight:700;background:${colors.secondary};color:${colors.dark};padding:16px 40px;border-radius:20px}
.slide-highlight .text{font-size:${isVertical?'62':'38'}px;font-weight:700;color:${colors.secondary}}
.slide-cta    .text{font-size:${isVertical?'52':'32'}px;font-weight:700;background:${colors.secondary};color:${colors.dark};padding:24px 60px;border-radius:50px}
.slide-alert  .text{font-size:${isVertical?'90':'56'}px;font-weight:900;color:#ff4757}
.slide-offer  .text{font-size:${isVertical?'60':'38'}px;color:${colors.secondary}}
.slide-urgency .text{font-size:${isVertical?'54':'34'}px;color:#ff4757}
.slide-body   .text{font-size:${isVertical?'54':'34'}px;line-height:1.9}
.slide-question .text{font-size:${isVertical?'68':'42'}px;font-weight:900}
.slide-bullets .text{font-size:${isVertical?'48':'30'}px;line-height:2.2;text-align:right;width:100%}
.slide-vision  .text,.slide-mission .text,.slide-values .text,.slide-invite .text{font-size:${isVertical?'58':'36'}px;line-height:1.8}
.slide-why    .text{font-size:${isVertical?'50':'32'}px;color:${colors.secondary}}
.progress-bar{position:absolute;bottom:0;left:0;height:6px;background:${colors.secondary};transition:width linear;z-index:20}
.logo-bar{position:absolute;top:${isVertical?'50':'30'}px;display:flex;align-items:center;gap:20px;z-index:20;left:50%;transform:translateX(-50%)}
.logo-text{font-size:${isVertical?'44':'30'}px;font-weight:900;color:${colors.secondary};letter-spacing:3px}
.basmala{font-size:${isVertical?'28':'20'}px;opacity:.6;color:${colors.light}}
.hashtags{position:absolute;bottom:${isVertical?'60':'30'}px;font-size:${isVertical?'24':'16'}px;opacity:.7;color:${colors.secondary};text-align:center;z-index:20}
.controls{position:absolute;top:10px;right:10px;z-index:50;display:flex;gap:8px}
.btn{padding:8px 18px;background:rgba(0,0,0,.5);color:#fff;border:1px solid ${colors.secondary};border-radius:20px;cursor:pointer;font-size:14px;font-family:${BRAND.fonts.arabic}}
.btn:hover{background:${colors.secondary};color:${colors.dark}}
.timer-display{position:absolute;top:10px;left:10px;z-index:50;color:${colors.secondary};font-size:18px;font-weight:bold;background:rgba(0,0,0,.4);padding:4px 12px;border-radius:10px}
</style>
</head>
<body>
<div id="stage">
  <div class="bg bg-gradient"></div>
  <div class="bg pattern"></div>
  <div class="geo"></div>
  <div class="geo2"></div>

  <div class="logo-bar">
    <div class="basmala">${BRAND.basmala}</div>
    <div class="logo-text">${BRAND.nameAr}</div>
  </div>

  <div class="controls">
    <button class="btn" id="playBtn" onclick="togglePlay()">▶ تشغيل</button>
    <button class="btn" onclick="restart()">↺ إعادة</button>
  </div>
  <div class="timer-display" id="timerDisp">0s</div>

  <div id="content">
    ${sections.map((sec, i) => `
    <div class="slide slide-${sec.style || 'body'}" id="slide-${i}">
      <div class="text">${(sec.text || '').replace(/\n/g, '<br>')}</div>
    </div>`).join('')}
  </div>

  <div class="hashtags">${(script.hashtags || []).join(' ')}</div>
  <div class="progress-bar" id="pbar"></div>
</div>

<script>
const SLIDES  = ${slidesJson};
const TOTAL   = ${totalDur};
let startTime = null;
let rafId     = null;
let playing   = false;

function showSlide(t) {
  SLIDES.forEach(s => {
    const el = document.getElementById('slide-' + s.idx);
    if (!el) return;
    if (t >= s.start && t < s.end) el.classList.add('active');
    else el.classList.remove('active');
  });
  const pct = Math.min(t / TOTAL * 100, 100);
  document.getElementById('pbar').style.width = pct + '%';
  document.getElementById('timerDisp').textContent = (t/1000).toFixed(1) + 's';
}

function frame(ts) {
  if (!startTime) startTime = ts;
  const elapsed = ts - startTime;
  showSlide(elapsed);
  if (elapsed < TOTAL) {
    rafId = requestAnimationFrame(frame);
  } else {
    playing = false;
    document.getElementById('playBtn').textContent = '▶ تشغيل';
    showSlide(TOTAL - 1);
  }
}

function togglePlay() {
  if (playing) {
    cancelAnimationFrame(rafId);
    playing = false;
    startTime = null;
    document.getElementById('playBtn').textContent = '▶ تشغيل';
  } else {
    playing = true;
    startTime = null;
    document.getElementById('playBtn').textContent = '⏸ إيقاف';
    rafId = requestAnimationFrame(frame);
  }
}

function restart() {
  cancelAnimationFrame(rafId);
  playing = false;
  startTime = null;
  document.getElementById('playBtn').textContent = '▶ تشغيل';
  showSlide(0);
}

showSlide(0);
</script>
</body>
</html>`;
    }

    // ── مساعدات ─────────────────────────────────────────────────────────────

    _fillVars(template, vars) {
        if (!template) return '';
        return template.replace(/\{(\w+)\}/g, (_, k) => vars[k] !== undefined ? vars[k] : `[${k}]`);
    }

    _cIdx(id)   { return this.cdb.items.findIndex(c => c.id === id); }

    _groupBy(arr, key) {
        const r = {};
        arr.forEach(item => { const k = item[key] || 'unknown'; r[k] = (r[k] || 0) + 1; });
        return r;
    }

    _load(filePath, def) {
        try {
            if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
            if (fs.existsSync(filePath)) return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        } catch (_) { /* ignore */ }
        return def;
    }

    _save(filePath, data) {
        try { fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8'); } catch (_) { /* ignore */ }
    }

    _ensureDirs() {
        [DATA_DIR, PREVIEW_DIR, path.dirname(LOG_FILE)].forEach(d => {
            try { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); } catch (_) { /* ignore */ }
        });
    }

    _log(type, id, detail) {
        try {
            const entry = JSON.stringify({ type, id, detail, at: new Date().toISOString() }) + '\n';
            fs.appendFileSync(LOG_FILE, entry, 'utf-8');
        } catch (_) { /* ignore */ }
    }
}

module.exports = SheikhaVCE;
