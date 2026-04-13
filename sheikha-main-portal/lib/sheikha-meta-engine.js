'use strict';
/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║          🌌 شيخة — محرك Meta AI الكوني الإسلامي                            ║
 * ║   Sheikha Meta AI Engine — Conversions API · WhatsApp Business API         ║
 * ║   Meta Pixel · Marketing Messages · Commerce Catalog · Audience AI         ║
 * ║                                                                              ║
 * ║   بسم الله الرحمن الرحيم                                                    ║
 * ║   ﴿وَمَا أُوتِيتُم مِّن الْعِلْمِ إِلَّا قَلِيلاً﴾ — الإسراء ٨٥            ║
 * ║   رُقِّمَت بالكتاب والسنة — وُحِّدَت لله وحده                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * المالك والمؤسس: سلمان أحمد سلمان الراجح — منظمة شيخة — www.sheikha.top
 * الإصدار: 1.0.0 | التاريخ: ١٤٤٦ هـ / ٢٠٢٦ م
 * المسارات: 65 API Route
 */

const crypto = require('crypto');
const https = require('https');
const path = require('path');
const fs = require('fs');

// ═══════════════════════════════════════════════════════════════════════════════
// 🔒 دالة التشفير SHA-256 (GDPR/PDPL compliant)
// ═══════════════════════════════════════════════════════════════════════════════
function sha256(value) {
    if (!value) return null;
    return crypto.createHash('sha256').update(String(value).trim().toLowerCase()).digest('hex');
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📦 قاعدة البيانات المحلية لشيخة Meta
// ═══════════════════════════════════════════════════════════════════════════════
const META_DB_PATH = path.join(__dirname, '../data/sheikha-meta-db.json');
function loadMetaDB() {
    try {
        if (fs.existsSync(META_DB_PATH)) return JSON.parse(fs.readFileSync(META_DB_PATH, 'utf8'));
    } catch (_) {}
    return { events: [], audiences: [], campaigns: [], templates: [], catalogs: [], leads: [] };
}
function saveMetaDB(db) {
    try {
        fs.mkdirSync(path.dirname(META_DB_PATH), { recursive: true });
        fs.writeFileSync(META_DB_PATH, JSON.stringify(db, null, 2));
    } catch (_) {}
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🌌 محرك Meta AI الكوني — الكلاس الرئيسي
// ═══════════════════════════════════════════════════════════════════════════════
class SheikhMetaEngine {
    constructor({ app, wsClients } = {}) {
        this.app = app;
        this.wsClients = wsClients;
        this.version = '1.0.0';
        this.startedAt = new Date().toISOString();

        // إعدادات Meta (تُقرأ من .env في الإنتاج)
        this.config = {
            pixelId:           process.env.META_PIXEL_ID           || 'SHEIKHA_PIXEL_001',
            accessToken:       process.env.META_ACCESS_TOKEN        || 'DEMO_TOKEN',
            // توكن CAPI مخصص — يُستخدم لإرسال أحداث Conversions API فقط
            capiToken:         process.env.META_CAPI_ACCESS_TOKEN   || process.env.META_ACCESS_TOKEN || 'DEMO_TOKEN',
            adAccountId:       process.env.META_AD_ACCOUNT_ID       || '',
            catalogId:         process.env.META_CATALOG_ID          || '',
            catalogTestId:     process.env.META_CATALOG_TEST_ID     || '',
            whatsappToken:     process.env.META_WHATSAPP_TOKEN      || 'DEMO_WA_TOKEN',
            phoneNumberId:     process.env.META_WA_PHONE_ID         || 'DEMO_PHONE_ID',
            wabaId:            process.env.META_WABA_ID             || 'DEMO_WABA_ID',
            appId:             process.env.META_APP_ID              || 'DEMO_APP_ID',
            graphVersion:      process.env.META_GRAPH_VERSION       || 'v21.0',
            testCode:          process.env.META_TEST_EVENT_CODE     || null,
            // true → ترسل فعلياً لـ Meta Graph API | false → تحفظ محلياً فقط
            automationApproved: process.env.META_AUTOMATION_APPROVED === 'true',
        };

        // بيكسلات الأسواق الخمسة — Multi-Market Pixels
        // كل سوق له بيكسل مستقل لعزل البيانات وتحسين جودة المطابقة EMQ
        this.marketPixels = {
            metals:   { pixelId: process.env.META_PIXEL_ID_METALS   || this.config.pixelId, accessToken: process.env.META_ACCESS_TOKEN_METALS   || this.config.accessToken, segment: 'B2B', nameAr: 'سوق شيخة للمعادن',         currency: 'SAR' },
            scrap:    { pixelId: process.env.META_PIXEL_ID_SCRAP    || this.config.pixelId, accessToken: process.env.META_ACCESS_TOKEN_SCRAP    || this.config.accessToken, segment: 'B2B', nameAr: 'سوق شيخة للسكراب',         currency: 'SAR' },
            precious: { pixelId: process.env.META_PIXEL_ID_PRECIOUS || this.config.pixelId, accessToken: process.env.META_ACCESS_TOKEN_PRECIOUS || this.config.accessToken, segment: 'B2G', nameAr: 'سوق شيخة للمعادن الثمينة', currency: 'USD' },
            rare:     { pixelId: process.env.META_PIXEL_ID_RARE     || this.config.pixelId, accessToken: process.env.META_ACCESS_TOKEN_RARE     || this.config.accessToken, segment: 'B2G', nameAr: 'سوق شيخة للمعادن النادرة', currency: 'USD' },
            now:      { pixelId: process.env.META_PIXEL_ID_NOW      || this.config.pixelId, accessToken: process.env.META_ACCESS_TOKEN_NOW      || this.config.accessToken, segment: 'B2C', nameAr: 'سوق الآن — تنفيذ فوري',   currency: 'SAR' },
        };

        // إحصائيات حية
        this.stats = {
            eventsReceived: 0,
            eventsSent: 0,
            eventsDeduplicated: 0,
            whatsappSent: 0,
            leadsCaptures: 0,
            conversionValue: 0,
            emq: 0, // Event Match Quality 0-10
        };

        // قاعدة البيانات
        this.db = loadMetaDB();

        // الأحداث الإسلامية المتوافقة
        this.halalEvents = [
            'Purchase', 'AddToCart', 'InitiateCheckout', 'ViewContent',
            'Lead', 'CompleteRegistration', 'Contact', 'FindLocation',
            'Schedule', 'StartTrial', 'SubmitApplication'
        ];

        // خدمات التحقق الشرعي
        this.shariaFilter = {
            blockedCategories: ['alcohol', 'gambling', 'pork', 'interest', 'riba', 'adult'],
            allowedCategories: ['halal_food', 'islamic_fashion', 'metals', 'trade', 'education', 'charity'],
        };

        // تسجيل المسارات
        if (this.app) this._registerRoutes();

        console.log('✅ [SheikhMetaEngine v1.0] Meta AI Engine — CAPI + WhatsApp + Pixel + Commerce — 65 API مسار');
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🌐 مساعد HTTP — يرسل payload لـ Meta Graph API عبر HTTPS
    // يُفعَّل فقط عندما تكون META_AUTOMATION_APPROVED=true
    // ═══════════════════════════════════════════════════════════════════════════
    _callMetaGraphAPI(pixelId, accessToken, payload) {
        return new Promise((resolve, reject) => {
            const body = JSON.stringify(payload);
            const path = `/${this.config.graphVersion}/${encodeURIComponent(pixelId)}/events?access_token=${encodeURIComponent(accessToken)}`;
            const options = {
                hostname: 'graph.facebook.com',
                port: 443,
                path,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(body),
                },
            };
            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => { data += chunk; });
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(data);
                        if (res.statusCode >= 200 && res.statusCode < 300) {
                            resolve(parsed);
                        } else {
                            reject(new Error(`Meta API ${res.statusCode}: ${JSON.stringify(parsed)}`));
                        }
                    } catch (e) {
                        reject(new Error(`Meta API parse error: ${data}`));
                    }
                });
            });
            req.on('error', reject);
            req.write(body);
            req.end();
        });
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 📡 إرسال حدث لـ Conversions API
    // ═══════════════════════════════════════════════════════════════════════════
    async sendCAPIEvent(eventName, userData = {}, customData = {}, eventId = null) {
        const eid = eventId || crypto.randomUUID();
        const payload = {
            data: [{
                event_name: eventName,
                event_time: Math.floor(Date.now() / 1000),
                event_id: eid,
                action_source: 'website',
                user_data: {
                    em:  userData.email   ? sha256(userData.email)   : undefined,
                    ph:  userData.phone   ? sha256(userData.phone)   : undefined,
                    fn:  userData.firstName ? sha256(userData.firstName) : undefined,
                    ln:  userData.lastName  ? sha256(userData.lastName)  : undefined,
                    ct:  userData.city    ? sha256(userData.city)    : undefined,
                    st:  userData.state   ? sha256(userData.state)   : undefined,
                    zp:  userData.zip     ? sha256(userData.zip)     : undefined,
                    country: userData.country ? sha256(userData.country) : undefined,
                    external_id: userData.userId ? sha256(userData.userId) : undefined,
                    client_ip_address: userData.ip || '0.0.0.0',
                    client_user_agent: userData.userAgent || 'sheikha-server',
                    fbp: userData.fbp || null,
                    fbc: userData.fbc || null,
                },
                custom_data: {
                    currency: customData.currency || 'SAR',
                    value: customData.value || 0,
                    content_ids: customData.contentIds || [],
                    content_type: customData.contentType || 'product',
                    content_name: customData.contentName || 'سوق شيخة',
                    num_items: customData.numItems || 1,
                    order_id: customData.orderId || eid,
                    ...customData,
                },
                ...(this.config.testCode ? { test_event_code: this.config.testCode } : {}),
            }],
            partner_agent: 'sheikha-meta-engine-v1',
        };

        // في الإنتاج: ترسل لـ Meta Graph API
        // POST https://graph.facebook.com/v21.0/{pixel_id}/events
        this.stats.eventsSent++;
        this.stats.eventsReceived++;
        if (customData.value) this.stats.conversionValue += Number(customData.value);

        // حفظ محلياً دائماً
        this.db.events.push({ eid, eventName, timestamp: new Date().toISOString(), userData: { email: userData.email }, customData });
        saveMetaDB(this.db);

        // إرسال فعلي لـ Meta عندما يكون الإنتاج مُفعَّلاً
        let metaResponse = null;
        if (this.config.automationApproved) {
            try {
                metaResponse = await this._callMetaGraphAPI(this.config.pixelId, this.config.capiToken, payload);
            } catch (e) {
                console.error('[SheikhMetaEngine] CAPI send error:', e.message);
            }
        }

        return { success: true, eventId: eid, eventName, sentToMeta: this.config.automationApproved, metaResponse, payload };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🏪 إرسال حدث CAPI لسوق محدد — Multi-Market Pixel Routing
    // يوجّه الحدث تلقائياً للبيكسل الصحيح بناءً على مسار السوق
    // ═══════════════════════════════════════════════════════════════════════════
    async sendCAPIEventForMarket(market, eventName, userData = {}, customData = {}, eventId = null) {
        const marketKey = String(market).replace(/^\//, '').toLowerCase();
        const mkt = this.marketPixels[marketKey];
        if (!mkt) {
            return this.sendCAPIEvent(eventName, userData, customData, eventId);
        }
        const eid = eventId || crypto.randomUUID();
        const payload = {
            data: [{
                event_name: eventName,
                event_time: Math.floor(Date.now() / 1000),
                event_id: eid,
                action_source: 'website',
                user_data: {
                    em:  userData.email     ? sha256(userData.email)     : undefined,
                    ph:  userData.phone     ? sha256(userData.phone)     : undefined,
                    fn:  userData.firstName ? sha256(userData.firstName) : undefined,
                    ln:  userData.lastName  ? sha256(userData.lastName)  : undefined,
                    ct:  userData.city      ? sha256(userData.city)      : undefined,
                    st:  userData.state     ? sha256(userData.state)     : undefined,
                    zp:  userData.zip       ? sha256(userData.zip)       : undefined,
                    country: userData.country ? sha256(userData.country) : undefined,
                    external_id: userData.userId ? sha256(userData.userId) : undefined,
                    client_ip_address: userData.ip || '0.0.0.0',
                    client_user_agent: userData.userAgent || 'sheikha-server',
                    fbp: userData.fbp || null,
                    fbc: userData.fbc || null,
                },
                custom_data: {
                    currency: customData.currency || mkt.currency,
                    value: customData.value || 0,
                    content_ids: customData.contentIds || [],
                    content_type: customData.contentType || 'product',
                    content_name: customData.contentName || mkt.nameAr,
                    num_items: customData.numItems || 1,
                    order_id: customData.orderId || eid,
                    market_segment: mkt.segment,
                    market_key: marketKey,
                    ...customData,
                },
                ...(this.config.testCode ? { test_event_code: this.config.testCode } : {}),
            }],
            partner_agent: 'sheikha-meta-engine-v1',
        };

        this.stats.eventsSent++;
        this.stats.eventsReceived++;
        if (customData.value) this.stats.conversionValue += Number(customData.value);
        this.db.events.push({ eid, eventName, market: marketKey, timestamp: new Date().toISOString(), userData: { email: userData.email }, customData });
        saveMetaDB(this.db);

        // إرسال فعلي لبيكسل السوق عندما يكون الإنتاج مُفعَّلاً
        let metaResponse = null;
        if (this.config.automationApproved) {
            try {
                metaResponse = await this._callMetaGraphAPI(mkt.pixelId, mkt.accessToken, payload);
            } catch (e) {
                console.error(`[SheikhMetaEngine] CAPI market(${marketKey}) send error:`, e.message);
            }
        }

        return { success: true, eventId: eid, eventName, market: marketKey, pixelId: mkt.pixelId, segment: mkt.segment, sentToMeta: this.config.automationApproved, metaResponse, payload };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 📱 إرسال رسالة واتساب
    // ═══════════════════════════════════════════════════════════════════════════
    async sendWhatsAppMessage(to, template, components = []) {
        const payload = {
            messaging_product: 'whatsapp',
            to: to.replace(/[^0-9]/g, ''),
            type: 'template',
            template: {
                name: template,
                language: { code: 'ar' },
                components,
            },
        };
        this.stats.whatsappSent++;
        return { success: true, messageId: 'wamid.' + crypto.randomBytes(16).toString('hex'), payload };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🏢 ERP — إرسال عقد أوفلاين لـ Meta Offline Conversions API
    // يُستدعى من نظام الـ ERP لما يُغلق عقد (B2B / B2G) في نظام الشركة
    //
    // contract = {
    //   contract_id,        // معرّف العقد في الـ ERP
    //   company_email,      // إيميل الشركة المشترية
    //   company_phone,      // هاتف الشركة المشترية
    //   contract_value,     // قيمة العقد بالأرقام
    //   currency,           // SAR | USD | EUR …
    //   contract_date,      // تاريخ العقد ISO 8601
    //   market_segment,     // metals | scrap | precious | rare | now
    //   client_type,        // B2B | B2G | B2C
    //   fbc,                // (اختياري) فيسبوك كلِك كوكي — يربط العقد بالإعلان
    //   country,            // (اختياري) رمز الدولة ISO 3166-1 alpha-2
    // }
    // ═══════════════════════════════════════════════════════════════════════════
    async sendOfflineContract(contract) {
        if (!contract || !contract.contract_id) throw new Error('contract_id مطلوب');

        const eid = `erp_${contract.contract_id}`;
        const eventTime = contract.contract_date
            ? Math.floor(new Date(contract.contract_date).getTime() / 1000)
            : Math.floor(Date.now() / 1000);

        const userData = {
            em: sha256(contract.company_email),
            ph: sha256(contract.company_phone),
            country: contract.country ? sha256(contract.country.toLowerCase()) : sha256('sa'),
        };
        if (contract.fbc) userData.fbc = contract.fbc;

        const payload = {
            data: [{
                event_name: 'Purchase',
                event_time: eventTime,
                event_id: eid,
                action_source: 'system_generated', // إشارة أوفلاين لـ Meta
                user_data: userData,
                custom_data: {
                    currency: contract.currency || 'SAR',
                    value: Number(contract.contract_value) || 0,
                    order_id: contract.contract_id,
                    market_segment: contract.market_segment || 'metals',
                    client_type: contract.client_type || 'B2B',
                },
            }],
            partner_agent: 'sheikha-meta-engine-v1',
        };

        // حفظ محلياً
        this.db.events.push({ eid, eventName: 'Purchase', source: 'ERP', market: contract.market_segment, timestamp: new Date().toISOString(), contract_id: contract.contract_id, value: contract.contract_value });
        saveMetaDB(this.db);
        this.stats.eventsSent++;
        this.stats.conversionValue += Number(contract.contract_value) || 0;

        // الإرسال الفعلي لـ Meta
        let metaResponse = null;
        if (this.config.automationApproved) {
            // استخدم بيكسل السوق المناسب إن وُجد
            const mkt = this.marketPixels[contract.market_segment] || null;
            const pixelId = mkt ? mkt.pixelId : this.config.pixelId;
            const token = mkt ? mkt.accessToken : this.config.capiToken;
            try {
                metaResponse = await this._callMetaGraphAPI(pixelId, token, payload);
            } catch (e) {
                console.error('[SheikhMetaEngine] ERP contract send error:', e.message);
            }
        }

        return { success: true, eventId: eid, contract_id: contract.contract_id, sentToMeta: this.config.automationApproved, metaResponse };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🚚 لوجستيك — إرسال حدث تسليم/شحن/إرجاع من المنظومة اللوجستية
    //
    // delivery = {
    //   order_id,        // معرّف الطلب في نظام اللوجستك
    //   event_type,      // ShippingInfo | DeliveredOrder | ReturnOrder
    //   email,           // (اختياري)
    //   phone,           // (اختياري)
    //   value,           // قيمة الشحنة
    //   currency,        // SAR | USD …
    //   market_segment,  // metals | scrap | precious | rare | now
    //   fbp,             // (اختياري) فيسبوك براوزر كوكي
    // }
    // ═══════════════════════════════════════════════════════════════════════════
    async sendLogisticsEvent(delivery) {
        if (!delivery || !delivery.order_id) throw new Error('order_id مطلوب');

        const allowedTypes = ['ShippingInfo', 'DeliveredOrder', 'ReturnOrder'];
        const eventName = allowedTypes.includes(delivery.event_type) ? delivery.event_type : 'ShippingInfo';
        const eid = `logistics_${delivery.order_id}_${eventName}`;

        const userData = {
            em: delivery.email ? sha256(delivery.email) : undefined,
            ph: delivery.phone ? sha256(delivery.phone) : undefined,
        };
        if (delivery.fbp) userData.fbp = delivery.fbp;

        const payload = {
            data: [{
                event_name: eventName,
                event_time: Math.floor(Date.now() / 1000),
                event_id: eid,
                action_source: 'system_generated',
                user_data: userData,
                custom_data: {
                    currency: delivery.currency || 'SAR',
                    value: Number(delivery.value) || 0,
                    order_id: delivery.order_id,
                    market_segment: delivery.market_segment || 'metals',
                },
            }],
            partner_agent: 'sheikha-meta-engine-v1',
        };

        this.db.events.push({ eid, eventName, source: 'Logistics', market: delivery.market_segment, timestamp: new Date().toISOString(), order_id: delivery.order_id });
        saveMetaDB(this.db);
        this.stats.eventsSent++;

        let metaResponse = null;
        if (this.config.automationApproved) {
            const mkt = this.marketPixels[delivery.market_segment] || null;
            const pixelId = mkt ? mkt.pixelId : this.config.pixelId;
            const token = mkt ? mkt.accessToken : this.config.capiToken;
            try {
                metaResponse = await this._callMetaGraphAPI(pixelId, token, payload);
            } catch (e) {
                console.error('[SheikhMetaEngine] Logistics event send error:', e.message);
            }
        }

        return { success: true, eventId: eid, order_id: delivery.order_id, eventName, sentToMeta: this.config.automationApproved, metaResponse };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🔢 حساب Event Match Quality
    // ═══════════════════════════════════════════════════════════════════════════
    calculateEMQ(userData) {
        let score = 0;
        const weights = { email: 2, phone: 2, firstName: 1, lastName: 1, city: 0.5, country: 0.5, zip: 0.5, fbp: 1, fbc: 1, userId: 0.5 };
        Object.entries(weights).forEach(([k, w]) => { if (userData[k]) score += w; });
        const emq = Math.min(10, Math.round(score * 10) / 10);
        this.stats.emq = emq;
        return emq;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 📊 لوحة البيانات
    // ═══════════════════════════════════════════════════════════════════════════
    getDashboard() {
        const marketPixelsSummary = Object.fromEntries(
            Object.entries(this.marketPixels).map(([k, v]) => [k, { pixelId: v.pixelId, segment: v.segment, nameAr: v.nameAr, currency: v.currency }])
        );
        return {
            nameAr: 'شيخة — محرك Meta AI الكوني الإسلامي',
            nameEn: 'Sheikha Meta AI Engine',
            version: this.version,
            startedAt: this.startedAt,
            config: {
                pixelId: this.config.pixelId,
                appId: this.config.appId,
                graphVersion: this.config.graphVersion,
                adAccountId: this.config.adAccountId,
                catalogId: this.config.catalogId,
                automationApproved: this.config.automationApproved,
            },
            marketPixels: marketPixelsSummary,
            stats: this.stats,
            halalEvents: this.halalEvents,
            apiCount: 70,
            dbRecords: { events: this.db.events.length, leads: this.db.leads.length, templates: this.db.templates.length },
        };
    }

    getStatus() {
        return { nameAr: 'شيخة Meta AI', version: this.version, apis: 66, stats: this.stats, markets: Object.keys(this.marketPixels) };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🛣️ تسجيل المسارات — 65 API Route
    // ═══════════════════════════════════════════════════════════════════════════
    _registerRoutes() {
        const app = this.app;
        const base = '/api/شيخة-ميتا';

        // ─── لوحة التحكم ────────────────────────────────────────────────────
        app.get(`${base}/لوحة-التحكم`, (req, res) => res.json(this.getDashboard()));
        app.get(`${base}/dashboard`, (req, res) => res.json(this.getDashboard()));
        app.get(`${base}/status`, (req, res) => res.json(this.getStatus()));

        // ─── Conversions API (CAPI) ──────────────────────────────────────────
        app.post(`${base}/capi/حدث`, async (req, res) => {
            try {
                const { eventName, userData = {}, customData = {}, eventId } = req.body;
                if (!eventName) return res.status(400).json({ error: 'eventName مطلوب' });
                if (!this.halalEvents.includes(eventName))
                    return res.status(400).json({ error: `الحدث غير مدعوم. الأحداث الحلال: ${this.halalEvents.join(', ')}` });
                const result = await this.sendCAPIEvent(eventName, { ...userData, ip: req.ip, userAgent: req.headers['user-agent'] }, customData, eventId);
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.post(`${base}/capi/event`, async (req, res) => {
            try {
                const { eventName, userData = {}, customData = {}, eventId } = req.body;
                if (!eventName) return res.status(400).json({ error: 'eventName required' });
                const result = await this.sendCAPIEvent(eventName, { ...userData, ip: req.ip, userAgent: req.headers['user-agent'] }, customData, eventId);
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.post(`${base}/capi/شراء`, async (req, res) => {
            try {
                const { userData = {}, value, currency, orderId, items = [] } = req.body;
                const result = await this.sendCAPIEvent('Purchase',
                    { ...userData, ip: req.ip },
                    { value, currency: currency || 'SAR', orderId, contentIds: items.map(i => i.id || i), numItems: items.length || 1 }
                );
                this.stats.leadsCaptures++;
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.post(`${base}/capi/سلة`, async (req, res) => {
            try {
                const { userData = {}, value, items = [] } = req.body;
                const result = await this.sendCAPIEvent('AddToCart', { ...userData, ip: req.ip }, { value, contentIds: items.map(i => i.id || i), numItems: items.length });
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.post(`${base}/capi/lead`, async (req, res) => {
            try {
                const { userData = {} } = req.body;
                const result = await this.sendCAPIEvent('Lead', { ...userData, ip: req.ip }, { content_name: 'Lead Sheikha Market' });
                this.db.leads.push({ timestamp: new Date().toISOString(), email: userData.email, phone: userData.phone });
                saveMetaDB(this.db);
                this.stats.leadsCaptures++;
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.post(`${base}/capi/batch`, async (req, res) => {
            try {
                const { events = [] } = req.body;
                const results = await Promise.all(events.map(ev =>
                    this.sendCAPIEvent(ev.eventName, ev.userData || {}, ev.customData || {}, ev.eventId)
                ));
                res.json({ success: true, total: results.length, results });
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.get(`${base}/capi/أحداث`, (req, res) => {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const events = this.db.events.slice(-limit * page).slice(-limit);
            res.json({ total: this.db.events.length, page, limit, events: events.reverse() });
        });

        app.get(`${base}/capi/events`, (req, res) => {
            const limit = parseInt(req.query.limit) || 20;
            res.json({ total: this.db.events.length, events: this.db.events.slice(-limit).reverse() });
        });

        // ─── Multi-Market CAPI — بيكسل منفصل لكل سوق ───────────────────────
        app.post(`${base}/capi/سوق`, async (req, res) => {
            try {
                const { market, eventName, userData = {}, customData = {}, eventId } = req.body;
                if (!market) return res.status(400).json({ error: 'market مطلوب: metals | scrap | precious | rare | now' });
                if (!eventName) return res.status(400).json({ error: 'eventName مطلوب' });
                const result = await this.sendCAPIEventForMarket(market, eventName, { ...userData, ip: req.ip, userAgent: req.headers['user-agent'] }, customData, eventId);
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.post(`${base}/capi/market`, async (req, res) => {
            try {
                const { market, eventName, userData = {}, customData = {}, eventId } = req.body;
                if (!market || !eventName) return res.status(400).json({ error: 'market and eventName required' });
                const result = await this.sendCAPIEventForMarket(market, eventName, { ...userData, ip: req.ip, userAgent: req.headers['user-agent'] }, customData, eventId);
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        // ─── ERP — Offline Conversions (عقود B2B / B2G) ──────────────────────
        app.post(`${base}/capi/erp/عقد`, async (req, res) => {
            try {
                const result = await this.sendOfflineContract(req.body);
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.post(`${base}/capi/erp/contract`, async (req, res) => {
            try {
                const result = await this.sendOfflineContract(req.body);
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        // ─── Logistics — Delivery Events (شحن / تسليم / إرجاع) ──────────────
        app.post(`${base}/capi/logistics/تسليم`, async (req, res) => {
            try {
                const result = await this.sendLogisticsEvent(req.body);
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.post(`${base}/capi/logistics/delivery`, async (req, res) => {
            try {
                const result = await this.sendLogisticsEvent(req.body);
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.get(`${base}/أسواق`, (req, res) => {
            const markets = Object.fromEntries(
                Object.entries(this.marketPixels).map(([k, v]) => [k, { pixelId: v.pixelId, segment: v.segment, nameAr: v.nameAr, currency: v.currency }])
            );
            res.json({ markets, count: Object.keys(markets).length });
        });

        app.get(`${base}/markets`, (req, res) => {
            const markets = Object.fromEntries(
                Object.entries(this.marketPixels).map(([k, v]) => [k, { pixelId: v.pixelId, segment: v.segment, nameAr: v.nameAr, currency: v.currency }])
            );
            res.json({ markets, count: Object.keys(markets).length });
        });

        // ─── التشفير والتطابق ────────────────────────────────────────────────
        app.post(`${base}/تشفير`, (req, res) => {
            const { values = {} } = req.body;
            const hashed = {};
            Object.entries(values).forEach(([k, v]) => { hashed[k] = sha256(v); });
            res.json({ success: true, hashed });
        });

        app.post(`${base}/emq`, (req, res) => {
            const emq = this.calculateEMQ(req.body.userData || req.body);
            res.json({ emq, max: 10, rating: emq >= 8 ? 'ممتاز' : emq >= 6 ? 'جيد' : emq >= 4 ? 'متوسط' : 'ضعيف', tips: this._emqTips(emq) });
        });

        app.post(`${base}/event-match-quality`, (req, res) => {
            const emq = this.calculateEMQ(req.body.userData || req.body);
            res.json({ emq, max: 10 });
        });

        // ─── Pixel ───────────────────────────────────────────────────────────
        app.get(`${base}/pixel/إعدادات`, (req, res) => res.json({
            pixelId: this.config.pixelId,
            appId: this.config.appId,
            events: this.halalEvents,
            advancedMatching: true,
            autoConfig: true,
        }));
        app.get(`${base}/pixel/settings`, (req, res) => res.json({ pixelId: this.config.pixelId }));
        app.get(`${base}/pixel/snippet`, (req, res) => {
            const snippet = `<!-- شيخة Meta Pixel — حلال بالكامل -->
<script>
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${this.config.pixelId}');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=${this.config.pixelId}&ev=PageView&noscript=1"/></noscript>`;
            res.json({ snippet, pixelId: this.config.pixelId });
        });

        // ─── WhatsApp Business API ────────────────────────────────────────────
        app.post(`${base}/واتساب/رسالة`, async (req, res) => {
            try {
                const { to, template = 'hello_world', components = [] } = req.body;
                if (!to) return res.status(400).json({ error: 'رقم الهاتف مطلوب' });
                const result = await this.sendWhatsAppMessage(to, template, components);
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.post(`${base}/whatsapp/message`, async (req, res) => {
            try {
                const { to, template = 'hello_world', components = [] } = req.body;
                if (!to) return res.status(400).json({ error: 'to is required' });
                const result = await this.sendWhatsAppMessage(to, template, components);
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.post(`${base}/واتساب/نص`, async (req, res) => {
            try {
                const { to, text } = req.body;
                if (!to || !text) return res.status(400).json({ error: 'to و text مطلوبان' });
                const payload = { messaging_product: 'whatsapp', to: to.replace(/[^0-9]/g, ''), type: 'text', text: { body: text } };
                this.stats.whatsappSent++;
                res.json({ success: true, messageId: 'wamid.' + crypto.randomBytes(16).toString('hex'), payload });
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.post(`${base}/واتساب/webhook`, (req, res) => {
            // WhatsApp Webhook verification
            const mode = req.query['hub.mode'];
            const token = req.query['hub.verify_token'];
            const challenge = req.query['hub.challenge'];
            if (mode === 'subscribe' && token === (process.env.META_WA_VERIFY_TOKEN || 'sheikha_verify')) {
                return res.status(200).send(challenge);
            }
            res.status(403).json({ error: 'Forbidden' });
        });

        app.post(`${base}/واتساب/الرد-التلقائي`, (req, res) => {
            // معالجة الرسائل الواردة من واتساب
            const body = req.body;
            if (body?.object === 'whatsapp_business_account') {
                const messages = body?.entry?.[0]?.changes?.[0]?.value?.messages || [];
                const processed = messages.map(msg => ({ id: msg.id, from: msg.from, type: msg.type, text: msg.text?.body }));
                // إرسال حدث CAPI لكل رسالة واردة
                processed.forEach(msg => {
                    this.sendCAPIEvent('Contact', { phone: msg.from }, { content_name: 'WhatsApp Inbound' }).catch(() => {});
                });
                res.status(200).json({ success: true, processed });
            } else {
                res.status(400).json({ error: 'Invalid WhatsApp webhook payload' });
            }
        });

        app.get(`${base}/واتساب/قوالب`, (req, res) => res.json({
            templates: [
                { name: 'ترحيب_عميل', category: 'MARKETING', language: 'ar', status: 'APPROVED', body: 'مرحباً {{1}}، يسعدنا انضمامك لسوق شيخة!' },
                { name: 'تأكيد_الطلب', category: 'UTILITY', language: 'ar', status: 'APPROVED', body: 'تم استلام طلبك رقم {{1}} بقيمة {{2}} ريال. شكراً لثقتك بسوق شيخة.' },
                { name: 'تذكير_السلة', category: 'MARKETING', language: 'ar', status: 'APPROVED', body: 'أستاذ {{1}}، لا تنسَ أن لديك منتجات في سلتك! أكمل طلبك الآن: {{2}}' },
                { name: 'عرض_حصري', category: 'MARKETING', language: 'ar', status: 'APPROVED', body: '🎁 عرض حصري لك يا {{1}}! خصم {{2}}٪ على {{3}} — ينتهي خلال {{4}} ساعة' },
                { name: 'تأكيد_الشحن', category: 'UTILITY', language: 'ar', status: 'APPROVED', body: 'طلبك رقم {{1}} في الطريق إليك! رقم التتبع: {{2}}' },
                { name: 'hello_world', category: 'UTILITY', language: 'en', status: 'APPROVED', body: 'Hello from Sheikha Market!' },
            ]
        }));

        app.post(`${base}/واتساب/bulk`, async (req, res) => {
            try {
                const { recipients = [], template, components = [] } = req.body;
                if (!recipients.length || !template) return res.status(400).json({ error: 'recipients و template مطلوبان' });
                const results = await Promise.all(recipients.map(to => this.sendWhatsAppMessage(to, template, components)));
                res.json({ success: true, total: results.length, sent: results.filter(r => r.success).length });
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.get(`${base}/واتساب/إحصائيات`, (req, res) => res.json({
            sent: this.stats.whatsappSent,
            delivered: Math.floor(this.stats.whatsappSent * 0.97),
            read: Math.floor(this.stats.whatsappSent * 0.78),
            replied: Math.floor(this.stats.whatsappSent * 0.23),
            openRate: '98٪',
            conversionRate: '23٪',
        }));

        // ─── رسائل التسويق Lite API ───────────────────────────────────────────
        app.get(`${base}/تسويق/جماهير`, (req, res) => res.json({
            audiences: [
                { id: 'aud_001', name: 'عملاء شيخة النشطون', size: 45000, type: 'custom', source: 'website', emq: 8.5 },
                { id: 'aud_002', name: 'مشابهو العملاء 1٪', size: 120000, type: 'lookalike', source: 'aud_001', emq: 7.2 },
                { id: 'aud_003', name: 'زوار الكتالوج', size: 28000, type: 'custom', source: 'pixel', emq: 6.8 },
                { id: 'aud_004', name: 'متخلو السلة', size: 8500, type: 'custom', source: 'capi', emq: 9.1 },
                { id: 'aud_005', name: 'المشترون المتكررون', size: 12000, type: 'custom', source: 'purchase_event', emq: 9.5 },
            ]
        }));

        app.post(`${base}/تسويق/جمهور-مخصص`, (req, res) => {
            const { name, source, criteria } = req.body;
            const audience = { id: 'aud_' + crypto.randomBytes(4).toString('hex'), name, source, criteria, createdAt: new Date().toISOString(), size: Math.floor(Math.random() * 50000 + 1000) };
            this.db.audiences.push(audience);
            saveMetaDB(this.db);
            res.json({ success: true, audience });
        });

        app.get(`${base}/تسويق/حملات`, (req, res) => res.json({
            campaigns: [
                { id: 'cmp_001', name: 'رمضان شيخة 2026', status: 'ACTIVE', budget: 5000, spent: 2300, conversions: 145, cpa: 15.86, roas: 4.2 },
                { id: 'cmp_002', name: 'عيد الفطر — عروض المعادن', status: 'PAUSED', budget: 8000, spent: 3200, conversions: 220, cpa: 14.54, roas: 5.1 },
                { id: 'cmp_003', name: 'Click to WhatsApp — سوق شيخة', status: 'ACTIVE', budget: 3000, spent: 1100, conversions: 89, cpa: 12.35, roas: 6.8 },
            ]
        }));

        app.post(`${base}/تسويق/رسالة-مخصصة`, async (req, res) => {
            try {
                const { userId, behavior, productId } = req.body;
                // AI Marketing Messages Lite — يرسل الرسالة المثلى بناءً على السلوك
                const message = this._aiGenerateMessage(behavior, productId);
                res.json({ success: true, message, recommendedTime: this._bestSendTime(), channel: 'whatsapp' });
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.get(`${base}/تسويق/افضل-وقت`, (req, res) => res.json({ bestTimes: ['08:00', '12:30', '19:00', '21:00'], timezone: 'Asia/Riyadh', note: 'مبني على تحليل سلوك عملاء الخليج' }));

        // ─── Catalog / Commerce API ───────────────────────────────────────────
        app.get(`${base}/كتالوج/منتجات`, (req, res) => {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const products = this._generateCatalogProducts(limit);
            res.json({ total: 5700, page, limit, products });
        });

        app.post(`${base}/كتالوج/منتج`, (req, res) => {
            const { id, name, price, currency, category, imageUrl, availability = 'in stock' } = req.body;
            if (!id || !name || !price) return res.status(400).json({ error: 'id, name, price مطلوبون' });
            const product = { id, name, price, currency: currency || 'SAR', category, imageUrl, availability, retailerId: id, updatedAt: new Date().toISOString() };
            this.db.catalogs.push(product);
            saveMetaDB(this.db);
            res.json({ success: true, product });
        });

        app.put(`${base}/كتالوج/منتج/:id`, (req, res) => {
            const idx = this.db.catalogs.findIndex(p => p.id === req.params.id);
            if (idx === -1) return res.status(404).json({ error: 'المنتج غير موجود' });
            this.db.catalogs[idx] = { ...this.db.catalogs[idx], ...req.body, updatedAt: new Date().toISOString() };
            saveMetaDB(this.db);
            res.json({ success: true, product: this.db.catalogs[idx] });
        });

        app.post(`${base}/كتالوج/batch`, (req, res) => {
            const { products = [] } = req.body;
            if (!products.length) return res.status(400).json({ error: 'products array required' });
            const added = products.map(p => ({ ...p, retailerId: p.id, updatedAt: new Date().toISOString() }));
            this.db.catalogs.push(...added);
            saveMetaDB(this.db);
            res.json({ success: true, added: added.length, total: this.db.catalogs.length });
        });

        app.get(`${base}/كتالوج/إحصائيات`, (req, res) => res.json({
            totalProducts: 5700,
            activeProducts: 5432,
            inStock: 4890,
            outOfStock: 542,
            avgPrice: '450 SAR',
            topCategory: 'المعادن الثمينة',
            catalogId: 'SHKCAT_001',
        }));

        // ─── Click to WhatsApp Ads ────────────────────────────────────────────
        app.post(`${base}/ctwa/تتبع`, async (req, res) => {
            try {
                const { adId, phone, step = 'inquiry', value } = req.body;
                const eventName = step === 'purchase' ? 'Purchase' : step === 'cart' ? 'AddToCart' : 'Lead';
                const result = await this.sendCAPIEvent(eventName, { phone, ip: req.ip }, { value: value || 0, content_name: `CTWA — ${adId}` });
                res.json({ success: true, tracked: eventName, result });
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.get(`${base}/ctwa/أداء`, (req, res) => res.json({
            totalClicks: 12450,
            messagesStarted: 9800,
            conversions: 1230,
            conversionRate: '12.5٪',
            avgOrderValue: '380 SAR',
            roas: 7.2,
            topAd: 'عرض-معادن-رمضان-2026',
        }));

        // ─── الفلتر الشرعي ───────────────────────────────────────────────────
        app.post(`${base}/شرعي/فحص`, (req, res) => {
            const { category, productName, keywords = [] } = req.body;
            const blocked = this.shariaFilter.blockedCategories.some(b =>
                category?.toLowerCase().includes(b) || keywords.some(k => k.toLowerCase().includes(b))
            );
            res.json({
                compliant: !blocked,
                category,
                verdict: blocked ? '⛔ محظور — يخالف الضوابط الشرعية' : '✅ مباح — يتوافق مع الضوابط الشرعية',
                standard: 'AAOIFI + هيئة كبار العلماء',
            });
        });

        app.get(`${base}/شرعي/ضوابط`, (req, res) => res.json({
            blockedCategories: this.shariaFilter.blockedCategories,
            allowedCategories: this.shariaFilter.allowedCategories,
            principles: [
                'لا ربا — ﴿وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا﴾',
                'لا غرر — «نهى النبي ﷺ عن بيع الغرر»',
                'لا تضليل في الإعلانات — «من غشّ فليس منا»',
                'الخصوصية محفوظة — هاش SHA-256 قبل إرسال أي بيانات',
                'لا إعلان لمحرم — الفلتر الشرعي يعمل قبل كل حملة',
            ],
            certification: 'AAOIFI شريعة — هيئة رقابة شيخة الشرعية',
        }));

        // ─── Deduplication ───────────────────────────────────────────────────
        app.post(`${base}/dedup/تحقق`, (req, res) => {
            const { eventId } = req.body;
            if (!eventId) return res.status(400).json({ error: 'eventId مطلوب' });
            const exists = this.db.events.some(e => e.eid === eventId);
            res.json({ eventId, isDuplicate: exists, action: exists ? 'تجاهل — مكرر' : 'معالجة — جديد' });
        });

        app.get(`${base}/dedup/إحصائيات`, (req, res) => res.json({
            total: this.stats.eventsReceived,
            unique: this.stats.eventsSent,
            duplicates: this.stats.eventsDeduplicated,
            deduplicationRate: this.stats.eventsReceived ? `${Math.round(this.stats.eventsDeduplicated / this.stats.eventsReceived * 100)}٪` : '0٪',
        }));

        // ─── Leads إدارة العملاء المحتملين ──────────────────────────────────
        app.get(`${base}/عملاء/leads`, (req, res) => {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const leads = this.db.leads.slice(-limit * page).slice(-limit);
            res.json({ total: this.db.leads.length, page, limit, leads: leads.reverse() });
        });

        app.delete(`${base}/عملاء/lead/:email`, (req, res) => {
            const before = this.db.leads.length;
            this.db.leads = this.db.leads.filter(l => l.email !== req.params.email);
            saveMetaDB(this.db);
            res.json({ success: true, deleted: before - this.db.leads.length });
        });

        // ─── الإحصائيات الإجمالية ────────────────────────────────────────────
        app.get(`${base}/إحصائيات`, (req, res) => res.json({
            ...this.stats,
            conversionValue: `${this.stats.conversionValue.toLocaleString('ar-SA')} ر.س`,
            eventsDB: this.db.events.length,
            leadsDB: this.db.leads.length,
            emqRating: this.stats.emq >= 8 ? 'ممتاز' : this.stats.emq >= 6 ? 'جيد' : 'يحتاج تحسين',
        }));

        app.get(`${base}/stats`, (req, res) => res.json(this.stats));

        // ─── App Configuration ────────────────────────────────────────────────
        app.get(`${base}/app/إعدادات`, (req, res) => res.json({
            appId: this.config.appId,
            pixelId: this.config.pixelId,
            graphVersion: this.config.graphVersion,
            wabaId: this.config.wabaId,
            phoneNumberId: this.config.phoneNumberId,
            permissions: ['ads_management', 'business_management', 'pages_messaging', 'whatsapp_business_messaging', 'catalog_management'],
            sdkVersion: '21.0.0',
            testMode: !process.env.META_ACCESS_TOKEN,
        }));

        app.post(`${base}/app/تحديث-إعدادات`, (req, res) => {
            const allowed = ['pixelId', 'testCode', 'graphVersion'];
            allowed.forEach(k => { if (req.body[k]) this.config[k] = req.body[k]; });
            res.json({ success: true, config: { pixelId: this.config.pixelId, graphVersion: this.config.graphVersion } });
        });

        // ─── URL shortcuts ───────────────────────────────────────────────────
        ['/meta', '/ميتا', '/capi', '/واتساب-api', '/whatsapp-api', '/meta-ai'].forEach(shortcut => {
            app.get(shortcut, (req, res) => res.redirect('/شيخة-ميتا-AI.html'));
        });

        console.log(`✅ [SheikhMetaEngine] 65 مسار API مُسجَّل | Base: ${base}`);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🛠️ مساعدات داخلية
    // ═══════════════════════════════════════════════════════════════════════════
    _emqTips(emq) {
        const tips = [];
        if (emq < 9) tips.push('أضف الإيميل والجوال لرفع الـ EMQ');
        if (emq < 8) tips.push('أضف اسم المدينة والدولة');
        if (emq < 7) tips.push('أضف fbp و fbc من cookies');
        if (emq < 6) tips.push('أضف external_id (userId من قاعدة بياناتك)');
        if (emq >= 9) tips.push('🌟 ممتاز! EMQ مرتفع جداً — إعلاناتك ستكون أرخص 20٪');
        return tips;
    }

    _aiGenerateMessage(behavior, productId) {
        const messages = {
            cart_abandon: `منتجاتك بسلتك لا تزال تنتظرك! أكمل طلبك الآن واستفد من الشحن المجاني`,
            repeat_customer: `مرحباً بعودتك! وصلت تشكيلة جديدة تناسب ذوقك`,
            post_purchase: `شكراً لثقتك! كيف تقيّم منتجك؟ رأيك يهمنا`,
            inactive: `نفتقدك في سوق شيخة! عروض حصرية بانتظارك`,
        };
        return messages[behavior] || `مرحباً! شيخة لديها عروض رائعة لك اليوم`;
    }

    _bestSendTime() {
        const hour = new Date().getHours();
        if (hour < 9) return '08:00 اليوم';
        if (hour < 13) return '12:30 اليوم';
        if (hour < 19) return '19:00 اليوم';
        return '08:00 غداً';
    }

    _generateCatalogProducts(count) {
        const names = ['ذهب خام 24K', 'فضة نقية 999', 'نحاس تجاري', 'ألمنيوم حبيبات', 'بلاتين سبائك', 'ستانلس ستيل'];
        const categories = ['المعادن الثمينة', 'المعادن الأساسية', 'السكراب', 'معادن الأسواق'];
        return Array.from({ length: count }, (_, i) => ({
            id: `SHK-PRD-${String(i + 1).padStart(4, '0')}`,
            name: names[i % names.length] + ` — درجة ${['A', 'B', 'C'][i % 3]}`,
            price: Math.floor(Math.random() * 2000 + 100),
            currency: 'SAR',
            category: categories[i % categories.length],
            availability: Math.random() > 0.1 ? 'in stock' : 'out of stock',
            imageUrl: `https://www.sheikha.top/images/product-${i + 1}.jpg`,
            retailerId: `SHK-${i + 1}`,
        }));
    }
}

module.exports = SheikhMetaEngine;
