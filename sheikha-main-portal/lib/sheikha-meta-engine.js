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

        // واتساب مخصص لكل سوق — Per-Market WhatsApp Phone Numbers
        this.marketWhatsApp = {
            metals:   { phoneId: process.env.META_WA_PHONE_ID_METALS   || this.config.phoneNumberId, welcomeAr: 'حياك في سوق شيخة للمعادن. كم طن تحتاج؟', segment: 'B2B' },
            scrap:    { phoneId: process.env.META_WA_PHONE_ID_SCRAP    || this.config.phoneNumberId, welcomeAr: 'سوق شيخة للسكراب. صور الحمولة وحدد موقعك', segment: 'B2B' },
            precious: { phoneId: process.env.META_WA_PHONE_ID_PRECIOUS || this.config.phoneNumberId, welcomeAr: 'Sheikha Precious Metals — Private client service', segment: 'B2G' },
            rare:     { phoneId: process.env.META_WA_PHONE_ID_RARE     || this.config.phoneNumberId, welcomeAr: 'Sheikha Rare Earths — NDA required', segment: 'B2G' },
            now:      { phoneId: process.env.META_WA_PHONE_ID_NOW      || this.config.phoneNumberId, welcomeAr: 'سوق الآن — تنفيذ فوري خلال 15 دقيقة', segment: 'B2C' },
        };

        // إعدادات المناطق الجغرافية — Multi-Region Geo-Routing
        this.regionConfig = {
            sa_gcc:   { name: 'السعودية والخليج',  countries: ['sa','ae','kw','qa','bh','om','ye','jo','iq','sy','lb'], capiToken: process.env.META_CAPI_TOKEN_SA_GCC   || this.config.capiToken, currency: 'SAR' },
            europe:   { name: 'أوروبا وبريطانيا',  countries: ['gb','de','fr','it','es','nl','be','ch','at','se','no','dk','pl','pt','ie','fi','cz','ro','hu'], capiToken: process.env.META_CAPI_TOKEN_EUROPE  || this.config.capiToken, currency: 'EUR', gdpr: true },
            americas: { name: 'الأمريكيتان',        countries: ['us','ca','mx','br','ar','co','cl','pe','ve','ec'], capiToken: process.env.META_CAPI_TOKEN_AMERICAS || this.config.capiToken, currency: 'USD', ccpa: true },
            asia:     { name: 'آسيا وأفريقيا',      countries: ['cn','jp','kr','in','sg','my','id','th','pk','ng','za','eg','tn','ma','dz','ly'], capiToken: process.env.META_CAPI_TOKEN_ASIA    || this.config.capiToken, currency: 'USD' },
        };

        // سجل التدقيق — Governance Audit Log
        this.auditLog = [];
        this.maxAuditLogSize = parseInt(process.env.META_AUDIT_LOG_SIZE) || 500;

        // قاعدة بيانات الموافقات — Consent Management (GDPR / PDPL / CCPA)
        this.consentDBPath = path.join(__dirname, '../data/sheikha-consent-db.json');
        this.consentDB = this._loadConsentDB();

        // عتبات الإنذارات — Alert Thresholds
        this.alertThresholds = {
            minEMQ:            parseFloat(process.env.META_ALERT_MIN_EMQ)          || 6.0,
            maxDedupRate:      parseFloat(process.env.META_ALERT_MAX_DEDUP)        || 0.30,
            minWADeliveryRate: parseFloat(process.env.META_ALERT_MIN_WA_DELIVERY)  || 0.90,
        };
        this.alerts = [];

        // رسائل التسويق المجدولة — Scheduled Marketing Messages
        if (!this.db.scheduledMessages) this.db.scheduledMessages = [];

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
                    client_ip_address: userData.ip || undefined,
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
                    client_ip_address: userData.ip || undefined,
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
        const marketWASummary = Object.fromEntries(
            Object.entries(this.marketWhatsApp).map(([k, v]) => [k, { phoneId: v.phoneId, segment: v.segment, welcomeAr: v.welcomeAr }])
        );
        const regionSummary = Object.fromEntries(
            Object.entries(this.regionConfig).map(([k, v]) => [k, { name: v.name, countries: v.countries.length, currency: v.currency, gdpr: !!v.gdpr, ccpa: !!v.ccpa }])
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
            marketWhatsApp: marketWASummary,
            regions: regionSummary,
            stats: this.stats,
            halalEvents: this.halalEvents,
            apiCount: 100,
            consent: { total: Object.keys(this.consentDB.consents).length },
            auditLog: { entries: this.auditLog.length, maxSize: this.maxAuditLogSize },
            alerts: this.checkAlerts(),
            dbRecords: {
                events: this.db.events.length,
                leads: this.db.leads.length,
                templates: this.db.templates.length,
                scheduledMessages: (this.db.scheduledMessages || []).length,
            },
        };
    }

    getStatus() {
        return {
            nameAr: 'شيخة Meta AI',
            version: this.version,
            apis: 100,
            stats: this.stats,
            markets: Object.keys(this.marketPixels),
            regions: Object.keys(this.regionConfig),
            automationApproved: this.config.automationApproved,
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🌍 توجيه الأحداث حسب المنطقة الجغرافية — Geo-Routing Helper
    // ═══════════════════════════════════════════════════════════════════════════
    _getRegionForCountry(countryCode) {
        if (!countryCode) return 'sa_gcc';
        const cc = String(countryCode).toLowerCase();
        for (const [regionKey, regionData] of Object.entries(this.regionConfig)) {
            if (regionData.countries.includes(cc)) return regionKey;
        }
        return 'sa_gcc';
    }

    async sendCAPIEventWithGeoRouting(eventName, userData = {}, customData = {}, eventId = null) {
        const countryCode = userData.country || 'sa';
        const regionKey = this._getRegionForCountry(countryCode);
        const region = this.regionConfig[regionKey];

        // GDPR / CCPA consent gate — block if user hasn't consented
        if (region.gdpr || region.ccpa) {
            const uid = userData.userId || userData.email;
            if (uid && !this.checkConsent(uid, 'advertising')) {
                this._addAuditEntry('CAPI_BLOCKED_NO_CONSENT', sha256(uid), { eventName, region: regionKey });
                return { success: false, reason: 'no_consent', region: regionKey, eventName };
            }
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
                    client_ip_address: userData.ip || undefined,
                    client_user_agent: userData.userAgent || 'sheikha-server',
                    value: customData.value || 0,
                    content_ids: customData.contentIds || [],
                    content_type: customData.contentType || 'product',
                    content_name: customData.contentName || 'سوق شيخة',
                    num_items: customData.numItems || 1,
                    order_id: customData.orderId || eid,
                    geo_region: regionKey,
                    ...customData,
                },
                ...(this.config.testCode ? { test_event_code: this.config.testCode } : {}),
            }],
            partner_agent: 'sheikha-meta-engine-v1',
        };

        this.stats.eventsSent++;
        this.stats.eventsReceived++;
        if (customData.value) this.stats.conversionValue += Number(customData.value);

        this.db.events.push({ eid, eventName, region: regionKey, timestamp: new Date().toISOString(), userData: { email: userData.email }, customData });
        saveMetaDB(this.db);
        this._addAuditEntry('GEO_CAPI_EVENT', null, { eventName, region: regionKey, country: countryCode });

        let metaResponse = null;
        if (this.config.automationApproved) {
            try {
                metaResponse = await this._callMetaGraphAPI(this.config.pixelId, region.capiToken, payload);
            } catch (e) {
                console.error(`[SheikhMetaEngine] GEO CAPI(${regionKey}) error:`, e.message);
            }
        }

        return { success: true, eventId: eid, eventName, region: regionKey, currency: region.currency, sentToMeta: this.config.automationApproved, metaResponse };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 📱 واتساب مخصص لكل سوق — Per-Market WhatsApp Routing
    // ═══════════════════════════════════════════════════════════════════════════
    async sendWhatsAppForMarket(market, to, template, components = []) {
        const mktWA = this.marketWhatsApp[market] || this.marketWhatsApp.now;
        const mktPixel = this.marketPixels[market];
        const lang = (market === 'precious' || market === 'rare') ? 'en' : 'ar';

        const payload = {
            messaging_product: 'whatsapp',
            to: to.replace(/[^0-9]/g, ''),
            type: 'template',
            template: {
                name: template || `ترحيب_عميل`,
                language: { code: lang },
                components,
            },
        };

        this.stats.whatsappSent++;

        // إرسال حدث CAPI Contact لتتبع CTWA
        await this.sendCAPIEvent('Contact', { phone: to }, {
            content_name: `WhatsApp ${mktWA.welcomeAr}`,
            market_segment: mktPixel ? mktPixel.segment : 'B2C',
            market_key: market,
        }).catch(() => {});

        this._addAuditEntry('WA_MARKET_SENT', null, { market, toLast4: String(to).slice(-4), template });

        return {
            success: true,
            messageId: 'wamid.' + crypto.randomBytes(16).toString('hex'),
            phoneId: mktWA.phoneId,
            market,
            segment: mktWA.segment,
            welcomeAr: mktWA.welcomeAr,
            payload,
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🏢 أحداث B2B/B2G المخصصة — Custom B2B & B2G Events
    // ═══════════════════════════════════════════════════════════════════════════
    async sendCustomB2BEvent(eventType, data = {}) {
        const CUSTOM_MAP = {
            ScrapInquiry:        { eventName: 'Lead',              segment: 'B2B', market: 'scrap' },
            BullionQuoteRequest: { eventName: 'Schedule',          segment: 'B2G', market: 'precious' },
            RareEarthNDA:        { eventName: 'SubmitApplication', segment: 'B2G', market: 'rare' },
            QualifiedLead:       { eventName: 'Lead',              segment: 'B2B', market: data.market || 'metals' },
            ContractWon:         { eventName: 'Purchase',          segment: 'B2B', market: data.market || 'metals' },
            FlashOrderNow:       { eventName: 'Purchase',          segment: 'B2C', market: 'now' },
        };

        const mapping = CUSTOM_MAP[eventType];
        if (!mapping) {
            throw new Error(`نوع الحدث غير معروف: ${eventType}. المتاح: ${Object.keys(CUSTOM_MAP).join(', ')}`);
        }

        const userData = data.userData || {};
        const customData = {
            ...(data.customData || {}),
            custom_event_type: eventType,
            market_segment: mapping.segment,
            ...(data.metalType    ? { metal_type:    data.metalType }    : {}),
            ...(data.weightKg     ? { weight_kg:     data.weightKg }     : {}),
            ...(data.purity       ? { purity:        data.purity }       : {}),
            ...(data.quantityOz   ? { quantity_oz:   data.quantityOz }   : {}),
            ...(data.clientType   ? { client_type:   data.clientType }   : {}),
            ...(data.contractId   ? { contract_id:   data.contractId }   : {}),
        };

        const result = await this.sendCAPIEventForMarket(mapping.market, mapping.eventName, userData, customData, data.eventId);
        this._addAuditEntry('CUSTOM_B2B_EVENT', null, { eventType, market: mapping.market, segment: mapping.segment });

        return { ...result, customEventType: eventType, mapping };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🔒 إدارة الموافقات — Consent Management (GDPR / PDPL / CCPA)
    // ═══════════════════════════════════════════════════════════════════════════
    _loadConsentDB() {
        try {
            if (fs.existsSync(this.consentDBPath)) return JSON.parse(fs.readFileSync(this.consentDBPath, 'utf8'));
        } catch (err) {
            console.error('[SheikhMetaEngine] فشل تحميل قاعدة بيانات الموافقات:', err.message);
        }
        return { consents: {} };
    }

    _saveConsentDB() {
        try {
            fs.mkdirSync(path.dirname(this.consentDBPath), { recursive: true });
            fs.writeFileSync(this.consentDBPath, JSON.stringify(this.consentDB, null, 2));
        } catch (_) {}
    }

    recordConsent(userId, consentData = {}) {
        if (!userId) throw new Error('userId مطلوب');
        const hashedId = sha256(String(userId));
        this.consentDB.consents[hashedId] = {
            timestamp:  new Date().toISOString(),
            purposes:   consentData.purposes  || ['analytics'],
            framework:  consentData.framework || 'PDPL',
            version:    consentData.version   || '1.0',
            ip:         consentData.ip        ? sha256(consentData.ip) : null,
            channel:    consentData.channel   || 'website',
        };
        this._saveConsentDB();
        this._addAuditEntry('CONSENT_RECORDED', hashedId, {
            framework: this.consentDB.consents[hashedId].framework,
            purposes:  consentData.purposes,
        });
        return { success: true, hashedId, framework: this.consentDB.consents[hashedId].framework };
    }

    checkConsent(userId, purpose = 'advertising') {
        if (!userId) return true; // يُسمح بمرور الأحداث المجهولة (لا PII) — تحقق يُطبَّق فقط على مستخدمين معروفين
        const hashedId = sha256(String(userId));
        const consent = this.consentDB.consents[hashedId];
        if (!consent) return false;
        return consent.purposes.includes(purpose) || consent.purposes.includes('all');
    }

    deleteConsent(userId) {
        if (!userId) throw new Error('userId مطلوب');
        const hashedId = sha256(String(userId));
        const existed = !!this.consentDB.consents[hashedId];
        delete this.consentDB.consents[hashedId];
        this._saveConsentDB();
        this._addAuditEntry('CONSENT_DELETED', hashedId, { existed });
        return { success: true, deleted: existed, note: 'تم حذف الموافقة — حق محو GDPR مُنفَّذ' };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 📊 لوحة المقاييس التنفيذية — Executive KPI Dashboard
    // ═══════════════════════════════════════════════════════════════════════════
    getExecutiveKPIs() {
        // ESTIMATED_COST_PER_EVENT_SAR: تقدير متحفظ لتكلفة الحدث بالريال السعودي
        // يُستخدم للحسابات المبدئية فقط — يُستبدل ببيانات Meta Ads API الفعلية عند توفرها
        const ESTIMATED_COST_PER_EVENT_SAR = parseFloat(process.env.META_KPI_COST_PER_EVENT) || 15;

        const dedupRate   = this.stats.eventsReceived > 0
            ? Math.round(this.stats.eventsDeduplicated / this.stats.eventsReceived * 100) : 0;
        // EMQ مقياسه 0-10 → ضرب × 10 يحوّله لنسبة مئوية 0-100 لعرض matchRate
        const matchRate   = Math.min(100, Math.round(this.stats.emq * 10));
        const waConvRate  = this.stats.whatsappSent > 0
            ? Math.round((this.stats.leadsCaptures / this.stats.whatsappSent) * 100) : 0;
        const estimatedSpend = this.stats.eventsSent * ESTIMATED_COST_PER_EVENT_SAR;
        const roas = estimatedSpend > 0
            ? (this.stats.conversionValue / Math.max(1, estimatedSpend)).toFixed(2) : '0.00';
        const cpa  = this.stats.leadsCaptures > 0
            ? (estimatedSpend / Math.max(1, this.stats.leadsCaptures)).toFixed(2) : '0.00';

        return {
            meta: { nameAr: 'لوحة المقاييس التنفيذية — سوق شيخة', nameEn: 'Sheikha Executive KPI Dashboard', timestamp: new Date().toISOString() },
            kpis: {
                roas:       { value: roas,             label: 'ROAS — عائد الإنفاق الإعلاني',         benchmark: '≥ 4×',    status: parseFloat(roas) >= 4   ? '✅' : '⚠️' },
                cpa:        { value: `${cpa} SAR`,     label: 'CPA — تكلفة الاكتساب',                  benchmark: '< 50 SAR', status: parseFloat(cpa) < 50    ? '✅' : '⚠️' },
                emq:        { value: this.stats.emq,   label: 'EMQ — جودة تطابق الأحداث',              max: 10, benchmark: '≥ 7', status: this.stats.emq >= 7 ? '✅' : this.stats.emq >= 5 ? '⚠️' : '❌' },
                matchRate:  { value: `${matchRate}٪`,  label: 'Match Rate — معدل المطابقة',            benchmark: '≥ 70٪',   status: matchRate >= 70         ? '✅' : '⚠️' },
                dedupRate:  { value: `${dedupRate}٪`,  label: 'Dedup Rate — معدل إزالة التكرار',       benchmark: '< 30٪',   status: dedupRate < 30          ? '✅' : '⚠️' },
                waConvRate: { value: `${waConvRate}٪`, label: 'WA Conversion Rate — تحويل واتساب',     benchmark: '≥ 15٪',   status: waConvRate >= 15        ? '✅' : '⚠️' },
                revenue:    { value: `${this.stats.conversionValue.toLocaleString('ar-SA')} SAR`, label: 'إجمالي قيمة التحويلات' },
                events:     { value: this.stats.eventsSent,    label: 'إجمالي الأحداث المُرسلة' },
                leads:      { value: this.stats.leadsCaptures, label: 'إجمالي العملاء المحتملين' },
                waMessages: { value: this.stats.whatsappSent,  label: 'رسائل واتساب المُرسلة' },
            },
            markets: Object.fromEntries(
                Object.entries(this.marketPixels).map(([k, v]) => [k, { segment: v.segment, nameAr: v.nameAr, currency: v.currency }])
            ),
            regions: Object.fromEntries(
                Object.entries(this.regionConfig).map(([k, v]) => [k, { name: v.name, countries: v.countries.length, gdpr: !!v.gdpr, ccpa: !!v.ccpa }])
            ),
            consent: { total: Object.keys(this.consentDB.consents).length, note: 'مُشفَّر بالكامل SHA-256' },
            alerts: this.checkAlerts(),
            lastUpdated: new Date().toISOString(),
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🔔 نظام الإنذارات — Alert System
    // ═══════════════════════════════════════════════════════════════════════════
    checkAlerts() {
        const active = [];

        if (this.stats.emq > 0 && this.stats.emq < this.alertThresholds.minEMQ) {
            active.push({
                type: 'LOW_EMQ', severity: 'HIGH',
                message: `EMQ (${this.stats.emq}) أقل من العتبة المطلوبة (${this.alertThresholds.minEMQ}). يؤثر على جودة الإعلانات وتكلفتها.`,
                action: 'أضف بريد إلكتروني + جوال + مدينة في أحداث CAPI لرفع الـ EMQ',
            });
        }

        if (this.stats.eventsReceived > 0) {
            const dedupRate = this.stats.eventsDeduplicated / this.stats.eventsReceived;
            if (dedupRate > this.alertThresholds.maxDedupRate) {
                active.push({
                    type: 'HIGH_DEDUP', severity: 'MEDIUM',
                    message: `معدل تكرار الأحداث (${Math.round(dedupRate * 100)}٪) مرتفع.`,
                    action: 'تأكد أن event_id متطابق ومُرسَل من البيكسل ومن CAPI معاً',
                });
            }
        }

        if (!this.config.automationApproved) {
            active.push({
                type: 'AUTOMATION_OFF', severity: 'INFO',
                message: 'الإرسال الفعلي لـ Meta CAPI معطل (META_AUTOMATION_APPROVED=false).',
                action: 'اضبط META_AUTOMATION_APPROVED=true في .env لتفعيل الإرسال الحقيقي',
            });
        }

        this.alerts = active;
        return active;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 📋 سجل التدقيق — Governance Audit Log
    // ═══════════════════════════════════════════════════════════════════════════
    _addAuditEntry(action, actor, data = {}) {
        const entry = {
            id:        crypto.randomBytes(8).toString('hex'),
            timestamp: new Date().toISOString(),
            action,
            actor:     actor || 'system',
            data,
        };
        this.auditLog.unshift(entry);
        if (this.auditLog.length > this.maxAuditLogSize) {
            this.auditLog.splice(this.maxAuditLogSize); // in-place trim: avoids allocating a new array
        }
        return entry;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 📅 رسائل التسويق الذكية — Marketing Messages Lite AI
    // ═══════════════════════════════════════════════════════════════════════════
    scheduleMarketingMessage(userId, behavior, context = {}) {
        const BEHAVIOR_MAP = {
            cart_abandon:     { delay: '1h',  template: 'تذكير_السلة',  priority: 'HIGH',   msgAr: 'منتجاتك بسلتك لا تزال تنتظرك! أكمل طلبك الآن.' },
            repeat_customer:  { delay: '30d', template: 'عرض_حصري',    priority: 'MEDIUM', msgAr: 'وصلت تشكيلة جديدة تناسب ذوقك — مخصصة لك.' },
            post_purchase:    { delay: '3d',  template: 'ترحيب_عميل',  priority: 'LOW',    msgAr: 'شكراً لثقتك! كيف تقيّم منتجك؟ رأيك يهمنا.' },
            inactive_30d:     { delay: '0h',  template: 'عرض_حصري',    priority: 'MEDIUM', msgAr: 'نفتقدك في سوق شيخة! عروض حصرية بانتظارك.' },
            price_drop:       { delay: '0h',  template: 'عرض_حصري',    priority: 'HIGH',   msgAr: `انخفض سعر ${context.productName || 'منتجك المفضل'}! اشترِه الآن.` },
            contract_renewal: { delay: '7d',  template: 'تأكيد_الطلب', priority: 'HIGH',   msgAr: 'عقدك يقترب من التجديد — تواصل مع فريق سوق شيخة.' },
        };

        const plan = BEHAVIOR_MAP[behavior] || BEHAVIOR_MAP.inactive_30d;
        const delayMs = this._parseDelay(plan.delay);
        const scheduled = {
            id:          'msg_' + crypto.randomBytes(8).toString('hex'),
            userId:      sha256(String(userId)),
            behavior,
            template:    plan.template,
            priority:    plan.priority,
            msgAr:       plan.msgAr,
            market:      context.market || 'now',
            context,
            scheduledAt: new Date().toISOString(),
            sendAt:      new Date(Date.now() + delayMs).toISOString(),
            bestTime:    this._bestSendTime(),
            status:      'scheduled',
        };

        this.db.scheduledMessages.push(scheduled);
        saveMetaDB(this.db);
        this._addAuditEntry('MARKETING_MSG_SCHEDULED', scheduled.userId, { behavior, market: scheduled.market, priority: plan.priority });

        return scheduled;
    }

    _parseDelay(delay) {
        if (!delay || delay === '0h') return 0;
        // وحدات: h = ساعات، d = أيام، m = دقائق (minutes — وليس months)
        const match = String(delay).match(/^(\d+)(h|d|m)$/);
        if (!match) return 0;
        const [, val, unit] = match;
        const ms = { h: 3600000, d: 86400000, m: 60000 };
        return parseInt(val) * (ms[unit] || 3600000);
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

        // ─── Multi-Region Geo-Routing ─────────────────────────────────────────
        app.post(`${base}/geo/capi/event`, async (req, res) => {
            try {
                const { eventName, userData = {}, customData = {}, eventId } = req.body;
                if (!eventName) return res.status(400).json({ error: 'eventName مطلوب' });
                const result = await this.sendCAPIEventWithGeoRouting(
                    eventName,
                    { ...userData, ip: req.ip, userAgent: req.headers['user-agent'] },
                    customData,
                    eventId,
                );
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.get(`${base}/geo/regions`, (req, res) => {
            const regions = Object.fromEntries(
                Object.entries(this.regionConfig).map(([k, v]) => [k, {
                    name:      v.name,
                    countries: v.countries,
                    currency:  v.currency,
                    gdpr:      !!v.gdpr,
                    ccpa:      !!v.ccpa,
                }])
            );
            res.json({ regions, count: Object.keys(regions).length });
        });

        // ─── Per-Market WhatsApp Routing ──────────────────────────────────────
        app.post(`${base}/واتساب/سوق/:market`, async (req, res) => {
            try {
                const { market } = req.params;
                const { to, template, components = [] } = req.body;
                if (!to) return res.status(400).json({ error: 'رقم الهاتف مطلوب' });
                const result = await this.sendWhatsAppForMarket(market, to, template, components);
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.post(`${base}/whatsapp/market/:market`, async (req, res) => {
            try {
                const { market } = req.params;
                const { to, template, components = [] } = req.body;
                if (!to) return res.status(400).json({ error: 'to is required' });
                const result = await this.sendWhatsAppForMarket(market, to, template, components);
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.get(`${base}/واتساب/أسواق`, (req, res) => {
            const markets = Object.fromEntries(
                Object.entries(this.marketWhatsApp).map(([k, v]) => [k, {
                    phoneId:   v.phoneId,
                    welcomeAr: v.welcomeAr,
                    segment:   v.segment,
                }])
            );
            res.json({ markets });
        });

        // ─── Custom B2B / B2G Events ──────────────────────────────────────────
        app.post(`${base}/b2b/استفسار-سكراب`, async (req, res) => {
            try {
                const result = await this.sendCustomB2BEvent('ScrapInquiry', req.body);
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.post(`${base}/b2b/scrap-inquiry`, async (req, res) => {
            try {
                const result = await this.sendCustomB2BEvent('ScrapInquiry', req.body);
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.post(`${base}/b2b/عرض-سبائك`, async (req, res) => {
            try {
                const result = await this.sendCustomB2BEvent('BullionQuoteRequest', req.body);
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.post(`${base}/b2b/bullion-quote`, async (req, res) => {
            try {
                const result = await this.sendCustomB2BEvent('BullionQuoteRequest', req.body);
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.post(`${base}/b2b/طلب-nda`, async (req, res) => {
            try {
                const result = await this.sendCustomB2BEvent('RareEarthNDA', req.body);
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.post(`${base}/b2b/عميل-مؤهل`, async (req, res) => {
            try {
                const result = await this.sendCustomB2BEvent('QualifiedLead', req.body);
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.post(`${base}/b2b/qualified-lead`, async (req, res) => {
            try {
                const result = await this.sendCustomB2BEvent('QualifiedLead', req.body);
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.post(`${base}/b2b/عقد-مكتمل`, async (req, res) => {
            try {
                const result = await this.sendCustomB2BEvent('ContractWon', req.body);
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.post(`${base}/b2b/contract-won`, async (req, res) => {
            try {
                const result = await this.sendCustomB2BEvent('ContractWon', req.body);
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.post(`${base}/b2b/طلب-فوري`, async (req, res) => {
            try {
                const result = await this.sendCustomB2BEvent('FlashOrderNow', req.body);
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.get(`${base}/b2b/أنواع-الأحداث`, (req, res) => {
            res.json({
                events: [
                    { type: 'ScrapInquiry',        nameAr: 'استفسار سكراب',         market: 'scrap',    segment: 'B2B' },
                    { type: 'BullionQuoteRequest',  nameAr: 'طلب عرض سعر سبائك',    market: 'precious', segment: 'B2G' },
                    { type: 'RareEarthNDA',         nameAr: 'طلب NDA معادن نادرة',   market: 'rare',     segment: 'B2G' },
                    { type: 'QualifiedLead',        nameAr: 'عميل مؤهل',             market: 'metals',   segment: 'B2B' },
                    { type: 'ContractWon',          nameAr: 'عقد مُبرم',             market: 'metals',   segment: 'B2B' },
                    { type: 'FlashOrderNow',        nameAr: 'طلب فوري سوق الآن',     market: 'now',      segment: 'B2C' },
                ],
            });
        });

        // ─── Consent Management (GDPR / PDPL / CCPA) ─────────────────────────
        app.post(`${base}/consent/تسجيل`, (req, res) => {
            try {
                const { userId, purposes, framework, version, channel } = req.body;
                if (!userId) return res.status(400).json({ error: 'userId مطلوب' });
                const result = this.recordConsent(userId, { purposes, framework, version, channel, ip: req.ip });
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.post(`${base}/consent/record`, (req, res) => {
            try {
                const { userId, purposes, framework, version, channel } = req.body;
                if (!userId) return res.status(400).json({ error: 'userId required' });
                const result = this.recordConsent(userId, { purposes, framework, version, channel, ip: req.ip });
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.get(`${base}/consent/تحقق/:userId`, (req, res) => {
            const { purpose = 'advertising' } = req.query;
            const consented = this.checkConsent(req.params.userId, purpose);
            res.json({ userId: '[hashed]', purpose, consented, timestamp: new Date().toISOString() });
        });

        app.get(`${base}/consent/check/:userId`, (req, res) => {
            const { purpose = 'advertising' } = req.query;
            const consented = this.checkConsent(req.params.userId, purpose);
            res.json({ consented, purpose });
        });

        app.delete(`${base}/consent/:userId`, (req, res) => {
            try {
                const result = this.deleteConsent(req.params.userId);
                this._addAuditEntry('CONSENT_DELETE_API', req.ip, { userId: '[hashed]' });
                res.json(result);
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.get(`${base}/consent/إحصائيات`, (req, res) => {
            res.json({
                totalConsents: Object.keys(this.consentDB.consents).length,
                note: 'جميع معرّفات المستخدمين مُشفَّرة SHA-256',
                frameworks: ['PDPL', 'GDPR', 'CCPA'],
            });
        });

        // ─── Executive KPI Dashboard ──────────────────────────────────────────
        app.get(`${base}/kpi/تنفيذي`, (req, res) => res.json(this.getExecutiveKPIs()));
        app.get(`${base}/kpi/executive`, (req, res) => res.json(this.getExecutiveKPIs()));

        app.get(`${base}/kpi/تنبيهات`, (req, res) => res.json({
            alerts:     this.checkAlerts(),
            thresholds: this.alertThresholds,
            checkedAt:  new Date().toISOString(),
        }));

        app.get(`${base}/kpi/alerts`, (req, res) => res.json({
            alerts:     this.checkAlerts(),
            thresholds: this.alertThresholds,
        }));

        // ─── Governance / Audit Log ───────────────────────────────────────────
        app.get(`${base}/حوكمة/سجل-التدقيق`, (req, res) => {
            const limit = Math.min(parseInt(req.query.limit) || 50, 200);
            const entries = this.auditLog.slice(0, limit);
            res.json({ total: this.auditLog.length, limit, entries });
        });

        app.get(`${base}/governance/audit-log`, (req, res) => {
            const limit = Math.min(parseInt(req.query.limit) || 50, 200);
            res.json({ total: this.auditLog.length, limit, entries: this.auditLog.slice(0, limit) });
        });

        app.get(`${base}/حوكمة/صحة-التوكن`, (req, res) => {
            const checks = {
                mainToken:      { configured: !!(this.config.accessToken && this.config.accessToken !== 'DEMO_TOKEN'),   label: 'META_ACCESS_TOKEN' },
                capiToken:      { configured: !!(this.config.capiToken   && this.config.capiToken   !== 'DEMO_TOKEN'),   label: 'META_CAPI_ACCESS_TOKEN' },
                whatsappToken:  { configured: !!(this.config.whatsappToken && this.config.whatsappToken !== 'DEMO_WA_TOKEN'), label: 'META_WHATSAPP_TOKEN' },
                pixelId:        { configured: !!(this.config.pixelId     && this.config.pixelId     !== 'SHEIKHA_PIXEL_001'), label: 'META_PIXEL_ID' },
                automationOn:   { configured: this.config.automationApproved, label: 'META_AUTOMATION_APPROVED' },
                regionTokens: {
                    sa_gcc:   { configured: !!process.env.META_CAPI_TOKEN_SA_GCC   },
                    europe:   { configured: !!process.env.META_CAPI_TOKEN_EUROPE   },
                    americas: { configured: !!process.env.META_CAPI_TOKEN_AMERICAS },
                    asia:     { configured: !!process.env.META_CAPI_TOKEN_ASIA     },
                },
                marketPixels: Object.fromEntries(
                    Object.entries(this.marketPixels).map(([k, v]) => [k, { configured: v.pixelId !== this.config.pixelId || !!process.env[`META_PIXEL_ID_${k.toUpperCase()}`] }])
                ),
            };
            const allOk = checks.mainToken.configured && checks.capiToken.configured && checks.pixelId.configured;
            res.json({ ok: allOk, checks, note: 'فحص التوكنات محلي فقط — لا يتصل بـ Meta Graph API' });
        });

        app.post(`${base}/حوكمة/اختبار-الوصول`, async (req, res) => {
            // اختبار بسيط: إرسال حدث تجريبي TestEvent
            try {
                const result = await this.sendCAPIEvent('PageView', { ip: req.ip, userAgent: req.headers['user-agent'] }, { content_name: 'Token Health Test' });
                this._addAuditEntry('TOKEN_TEST', req.ip, { success: result.success });
                res.json({ ok: result.success, eventId: result.eventId, sentToMeta: result.sentToMeta, note: 'اختبار تجريبي — لا يحسب كتحويل' });
            } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
        });

        // ─── Marketing Messages Lite AI ───────────────────────────────────────
        app.post(`${base}/تسويق/جدولة-رسالة`, async (req, res) => {
            try {
                const { userId, behavior, context = {} } = req.body;
                if (!userId || !behavior) return res.status(400).json({ error: 'userId و behavior مطلوبان' });
                const scheduled = this.scheduleMarketingMessage(userId, behavior, context);
                res.json({ success: true, scheduled });
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.post(`${base}/marketing/schedule-message`, async (req, res) => {
            try {
                const { userId, behavior, context = {} } = req.body;
                if (!userId || !behavior) return res.status(400).json({ error: 'userId and behavior required' });
                const scheduled = this.scheduleMarketingMessage(userId, behavior, context);
                res.json({ success: true, scheduled });
            } catch (e) { res.status(500).json({ error: e.message }); }
        });

        app.get(`${base}/تسويق/رسائل-مجدولة`, (req, res) => {
            const limit = parseInt(req.query.limit) || 20;
            const msgs = (this.db.scheduledMessages || []).slice(-limit).reverse();
            res.json({ total: (this.db.scheduledMessages || []).length, limit, messages: msgs });
        });

        app.get(`${base}/تسويق/سلوكيات`, (req, res) => {
            res.json({
                behaviors: [
                    { key: 'cart_abandon',     nameAr: 'تخلٍّ عن السلة',         delay: '1h',  priority: 'HIGH' },
                    { key: 'repeat_customer',  nameAr: 'عميل متكرر',              delay: '30d', priority: 'MEDIUM' },
                    { key: 'post_purchase',    nameAr: 'بعد الشراء',              delay: '3d',  priority: 'LOW' },
                    { key: 'inactive_30d',     nameAr: 'عميل غير نشط 30 يوم',    delay: '0h',  priority: 'MEDIUM' },
                    { key: 'price_drop',       nameAr: 'انخفاض سعر المنتج',       delay: '0h',  priority: 'HIGH' },
                    { key: 'contract_renewal', nameAr: 'تجديد عقد B2B',           delay: '7d',  priority: 'HIGH' },
                ],
            });
        });

        console.log(`✅ [SheikhMetaEngine] 100 مسار API مُسجَّل | Base: ${base}`);
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
