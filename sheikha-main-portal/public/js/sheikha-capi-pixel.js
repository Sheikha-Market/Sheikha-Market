/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║   📱 sheikha-capi-pixel.js — مكتبة Meta Pixel + CAPI المتصفح              ║
 * ║   Sheikha Dual-Fire: Browser Pixel ↔ Server CAPI (Deduplication)          ║
 * ║                                                                              ║
 * ║   بسم الله الرحمن الرحيم                                                    ║
 * ║   الإصدار: 1.0.0 — يعمل مع SheikhMetaEngine v1.0                          ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * الاستخدام:
 *   1. أضف هذا الملف في <head> بعد تحميل fbevents.js:
 *      <script src="/js/sheikha-capi-pixel.js"></script>
 *
 *   2. شيخة تُطلق تلقائياً:
 *      - PageView      → عند كل صفحة
 *      - LandingPageView → عند القدوم من إعلان Instagram (fbc موجود)
 *
 *   3. لإطلاق حدث يدوياً:
 *      SheikhaPixel.track('Lead', { value: 0, currency: 'SAR' });
 *      SheikhaPixel.track('Purchase', { value: 5000, currency: 'SAR', orderId: 'ORD-001' });
 */
(function (window, document) {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════════
    // ⚙️ الإعدادات — تُقرأ من data-attributes أو window.SHEIKHA_CONFIG
    // ═══════════════════════════════════════════════════════════════════════════
    var script = document.currentScript
        || document.querySelector('script[src*="sheikha-capi-pixel"]');
    var cfg = window.SHEIKHA_CONFIG || {};

    var PIXEL_ID   = (script && script.getAttribute('data-pixel-id'))   || cfg.pixelId   || '';
    var MARKET     = (script && script.getAttribute('data-market'))      || cfg.market     || '';
    var API_BASE   = (script && script.getAttribute('data-api-base'))    || cfg.apiBase    || '/api/شيخة-ميتا';
    var AUTO_FIRE  = (script && script.getAttribute('data-auto-fire'))   !== 'false';
    var DEBUG      = (script && script.getAttribute('data-debug'))       === 'true'
                     || cfg.debug === true;

    // ═══════════════════════════════════════════════════════════════════════════
    // 🔑 مساعدات
    // ═══════════════════════════════════════════════════════════════════════════

    /** توليد UUID v4 — للـ event_id (deduplication) */
    function uuid() {
        if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0;
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }

    /** قراءة قيمة Cookie */
    function getCookie(name) {
        var m = document.cookie.match(new RegExp('(?:^|;)\\s*' + name + '=([^;]*)'));
        return m ? decodeURIComponent(m[1]) : null;
    }

    /** قراءة UTM param من الـ URL */
    function getParam(name) {
        try {
            var u = new URL(window.location.href);
            return u.searchParams.get(name) || null;
        } catch (_) { return null; }
    }

    /**
     * تحديد placement من utm_source + utm_medium + fbclid
     * instagram_feed | instagram_stories | instagram_reels | instagram_explore | facebook_feed | unknown
     */
    function detectPlacement() {
        var src    = (getParam('utm_source')  || '').toLowerCase();
        var medium = (getParam('utm_medium')  || '').toLowerCase();
        var place  = (getParam('utm_content') || '').toLowerCase();

        if (src === 'instagram' || src.includes('ig')) {
            if (place.includes('stories') || place.includes('story')) return 'instagram_stories';
            if (place.includes('reels')   || place.includes('reel'))  return 'instagram_reels';
            if (place.includes('explore'))                              return 'instagram_explore';
            return 'instagram_feed';
        }
        if (src === 'facebook' || src.includes('fb')) {
            if (place.includes('stories')) return 'facebook_stories';
            return 'facebook_feed';
        }
        // fbclid موجود = من إعلان Meta (غير محدد placement)
        if (getParam('fbclid')) return 'meta_ad';
        return null;
    }

    /**
     * هل الزيارة قادمة من إعلان Meta؟
     * _fbc (فيسبوك كلِك كوكي) أو fbclid في الـ URL
     */
    function isFromMetaAd() {
        return !!(getCookie('_fbc') || getParam('fbclid'));
    }

    /** تحديث _fbc من fbclid عند أول زيارة */
    function refreshFbc() {
        var fbclid = getParam('fbclid');
        if (fbclid && !getCookie('_fbc')) {
            var ts = Math.floor(Date.now() / 1000);
            var fbc = 'fb.1.' + ts + '.' + fbclid;
            // صلاحية 90 يوم — توافق Meta CAPI
            var expires = new Date(Date.now() + 90 * 24 * 3600 * 1000).toUTCString();
            document.cookie = '_fbc=' + encodeURIComponent(fbc)
                + '; path=/; expires=' + expires + '; SameSite=Lax';
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 📡 إرسال حدث للخادم (CAPI) — مع نفس event_id للـ deduplication
    // ═══════════════════════════════════════════════════════════════════════════
    function sendToServer(eventName, customData, eventId) {
        var endpoint = eventName === 'LandingPageView'
            ? API_BASE + '/capi/landing-page-view'
            : API_BASE + '/capi/event';

        var body = {
            eventId: eventId,
            userData: {
                fbp: getCookie('_fbp') || undefined,
                fbc: getCookie('_fbc') || undefined,
            },
            customData: Object.assign({
                sourceUrl: window.location.href,
                eventName: eventName,
            }, customData || {}),
        };

        if (MARKET) body.customData.market = MARKET;

        // استخدام sendBeacon للموثوقية (لا يتأثر بإغلاق الصفحة)
        var json = JSON.stringify(body);
        if (navigator.sendBeacon && endpoint) {
            var blob = new Blob([json], { type: 'application/json' });
            var sent = navigator.sendBeacon(endpoint, blob);
            if (!sent) _fetchFallback(endpoint, json);
        } else {
            _fetchFallback(endpoint, json);
        }

        if (DEBUG) console.log('[SheikhaPixel] CAPI →', eventName, body);
    }

    function _fetchFallback(endpoint, json) {
        fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: json,
            keepalive: true,
        }).catch(function () {});
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🔥 إطلاق حدث مزدوج — Browser Pixel + Server CAPI بنفس event_id
    // ═══════════════════════════════════════════════════════════════════════════
    function fireEvent(eventName, browserParams, serverCustomData) {
        var eid = uuid();

        // 1. Browser Pixel (fbq)
        if (typeof window.fbq === 'function') {
            window.fbq('track', eventName, browserParams || {}, { eventID: eid });
            if (DEBUG) console.log('[SheikhaPixel] fbq →', eventName, browserParams, 'eventID:', eid);
        }

        // 2. Server CAPI — نفس event_id لإزالة التكرار
        sendToServer(eventName, Object.assign({ eventId: eid }, serverCustomData || {}), eid);

        return eid;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // 🌐 API العامة — window.SheikhaPixel
    // ═══════════════════════════════════════════════════════════════════════════
    var SheikhaPixel = {

        /**
         * تهيئة البيكسل — تُستدعى تلقائياً
         * @param {string} [pixelId] — معرّف البيكسل (يُقرأ من data-pixel-id افتراضياً)
         */
        init: function (pixelId) {
            PIXEL_ID = pixelId || PIXEL_ID;
            refreshFbc();

            if (DEBUG) {
                console.log('[SheikhaPixel] init | pixelId:', PIXEL_ID, '| market:', MARKET, '| apiBase:', API_BASE);
            }

            if (AUTO_FIRE && document.readyState !== 'loading') {
                this._autoFire();
            } else if (AUTO_FIRE) {
                document.addEventListener('DOMContentLoaded', this._autoFire.bind(this));
            }
        },

        /**
         * الإطلاق التلقائي عند تحميل الصفحة:
         * - LandingPageView إذا كانت الزيارة من إعلان Meta
         * - PageView لبقية الزيارات
         */
        _autoFire: function () {
            var fromAd   = isFromMetaAd();
            var placement = detectPlacement();

            if (fromAd) {
                this.landingPageView({ placement: placement });
            } else {
                this.pageView();
            }
        },

        /**
         * حدث PageView — عند كل تحميل صفحة
         */
        pageView: function () {
            return fireEvent('PageView', {}, {
                sourceUrl: window.location.href,
            });
        },

        /**
         * حدث LandingPageView — عند وصول زائر من إعلان Instagram/Meta
         * @param {object} [opts] — { placement, adId, adSetId, campaignId, value, currency }
         */
        landingPageView: function (opts) {
            opts = opts || {};
            return fireEvent('LandingPageView', {
                content_name: document.title || 'سوق شيخة',
            }, {
                sourceUrl:  window.location.href,
                placement:  opts.placement  || detectPlacement() || undefined,
                adId:       opts.adId       || getParam('ad_id')       || undefined,
                adSetId:    opts.adSetId    || getParam('adset_id')    || undefined,
                campaignId: opts.campaignId || getParam('campaign_id') || undefined,
                value:      opts.value      || 0,
                currency:   opts.currency   || 'SAR',
            });
        },

        /**
         * حدث Lead — تسجيل عميل محتمل
         * @param {object} [opts] — { value, currency, contentName, contentCategory }
         */
        lead: function (opts) {
            opts = opts || {};
            return fireEvent('Lead', {
                value:    opts.value    || 0,
                currency: opts.currency || 'SAR',
            }, opts);
        },

        /**
         * حدث Purchase — عملية شراء مكتملة
         * @param {object} opts — { value, currency, orderId, items }
         */
        purchase: function (opts) {
            opts = opts || {};
            return fireEvent('Purchase', {
                value:        opts.value    || 0,
                currency:     opts.currency || 'SAR',
                content_ids:  (opts.items || []).map(function (i) { return i.id || i; }),
                num_items:    (opts.items || []).length || 1,
            }, opts);
        },

        /**
         * حدث ViewContent — مشاهدة صفحة منتج/خدمة
         * @param {object} opts — { contentId, contentName, value, currency }
         */
        viewContent: function (opts) {
            opts = opts || {};
            return fireEvent('ViewContent', {
                content_ids:  opts.contentId ? [opts.contentId] : [],
                content_name: opts.contentName || document.title,
                value:        opts.value    || 0,
                currency:     opts.currency || 'SAR',
            }, opts);
        },

        /**
         * حدث AddToCart — إضافة لسلة التسوق
         * @param {object} opts — { contentId, contentName, value, currency }
         */
        addToCart: function (opts) {
            opts = opts || {};
            return fireEvent('AddToCart', {
                content_ids:  opts.contentId ? [opts.contentId] : [],
                content_name: opts.contentName || 'منتج شيخة',
                value:        opts.value    || 0,
                currency:     opts.currency || 'SAR',
            }, opts);
        },

        /**
         * حدث InitiateCheckout — بدء الدفع
         * @param {object} opts — { value, currency, numItems }
         */
        initiateCheckout: function (opts) {
            opts = opts || {};
            return fireEvent('InitiateCheckout', {
                value:     opts.value    || 0,
                currency:  opts.currency || 'SAR',
                num_items: opts.numItems || 1,
            }, opts);
        },

        /**
         * حدث Contact — تواصل مع المبيعات (واتساب/هاتف/نموذج)
         * @param {object} [opts]
         */
        contact: function (opts) {
            return fireEvent('Contact', {}, opts || {});
        },

        /**
         * إطلاق حدث مخصص بحرية
         * @param {string} eventName — اسم الحدث (Purchase | Lead | ...)
         * @param {object} [browserParams] — البارامترات لـ fbq
         * @param {object} [serverData]   — البيانات للـ CAPI
         */
        track: function (eventName, browserParams, serverData) {
            return fireEvent(eventName, browserParams || {}, serverData || {});
        },

        /** معرّف البيكسل الحالي */
        getPixelId:   function () { return PIXEL_ID; },
        /** السوق الحالي */
        getMarket:    function () { return MARKET; },
        /** هل الزيارة من إعلان؟ */
        isFromAd:     function () { return isFromMetaAd(); },
        /** placement Instagram المكتشف */
        getPlacement: function () { return detectPlacement(); },
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // 🚀 تهيئة تلقائية
    // ═══════════════════════════════════════════════════════════════════════════
    window.SheikhaPixel = SheikhaPixel;
    SheikhaPixel.init();

}(window, document));
