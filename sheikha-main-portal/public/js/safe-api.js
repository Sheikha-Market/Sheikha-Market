/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ☪️ بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * SHEIKHA Safe API — نظام الاتصال الآمن والصامت
 * 
 * ✅ يمنع ظهور أي رسالة خطأ للمستخدم أثناء التنقل
 * ✅ يتعامل مع فشل الاتصال بصمت تام
 * ✅ يعرض إشعارات لطيفة فقط عند الحاجة (Toast)
 * ✅ يسجّل الأخطاء في console فقط (للمطور)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

(function() {
    'use strict';

    const trackedMetaEvents = new Set();

    // ═══ الوضع الصامت — Silent Mode ═══
    window.SHEIKHA_SILENT_MODE = true;

    // ═══ Meta Pixel Bootstrap — تفعيل تتبع PageView على الصفحات المشتركة ═══
    (function initMetaPixel() {
        const pixelId = '1283625109854806';
        if (!pixelId || window.fbq) return;

        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');

        window.fbq('init', pixelId);
        window.fbq('track', 'PageView');
    })();

    // ═══ طبقة تتبع Meta موحدة وآمنة ═══
    function normalizeMetaPayload(payload) {
        if (!payload || typeof payload !== 'object') {
            return {};
        }

        const next = {};
        Object.keys(payload).forEach((key) => {
            const value = payload[key];
            if (value === undefined || value === null || value === '') {
                return;
            }
            next[key] = value;
        });
        return next;
    }

    window.sheikhaTrackMetaEvent = function(eventName, payload = {}, options = {}) {
        try {
            if (!eventName || typeof window.fbq !== 'function') {
                return false;
            }

            const safePayload = normalizeMetaPayload(payload);
            const dedupeKey = options.dedupeKey || [eventName, safePayload.content_name, safePayload.seller].filter(Boolean).join('::');
            if (dedupeKey && trackedMetaEvents.has(dedupeKey)) {
                return false;
            }

            window.fbq('track', eventName, safePayload);
            if (dedupeKey) {
                trackedMetaEvents.add(dedupeKey);
            }
            return true;
        } catch (error) {
            console.warn('[Sheikha Meta] track failed:', eventName, error.message);
            return false;
        }
    };

    window.sheikhaTrackViewContent = function(details = {}) {
        const contentName = details.content_name || details.contentName || '';
        const sellerName = details.seller || details.seller_name || '';
        return window.sheikhaTrackMetaEvent('ViewContent', {
            content_name: contentName,
            content_category: details.content_category || details.contentCategory || 'seller_page',
            platform: details.platform || 'شيخة',
            seller: sellerName,
            seller_city: details.seller_city || details.sellerCity || undefined,
            seller_country: details.seller_country || details.sellerCountry || undefined
        }, {
            dedupeKey: details.dedupeKey || ['ViewContent', contentName, sellerName].filter(Boolean).join('::')
        });
    };

    const sheikhaPilotStorageKeys = {
        registrations: 'sheikha_beta_registrations',
        registry: 'sheikha_beta_registration_registry',
        bannerClosed: 'sheikha_beta_banner_closed'
    };

    function readStoredJson(key, fallbackValue) {
        try {
            const rawValue = localStorage.getItem(key);
            return rawValue ? JSON.parse(rawValue) : fallbackValue;
        } catch (error) {
            console.warn('[Sheikha Pilot] storage read failed:', key, error.message);
            return fallbackValue;
        }
    }

    function writeStoredJson(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.warn('[Sheikha Pilot] storage write failed:', key, error.message);
            return false;
        }
    }

    function getPilotState() {
        const totalSeats = 1000;
        const baseTaken = 153;
        const betaEndsAt = '2026-05-31T23:59:59+03:00';
        const registrations = parseInt(localStorage.getItem(sheikhaPilotStorageKeys.registrations) || '0', 10) || 0;
        const remainingSeats = Math.max(0, totalSeats - baseTaken - registrations);

        return {
            totalSeats: totalSeats,
            baseTaken: baseTaken,
            registrations: registrations,
            remainingSeats: remainingSeats,
            betaEndsAt: betaEndsAt,
            bannerClosed: localStorage.getItem(sheikhaPilotStorageKeys.bannerClosed) === '1',
            isActive: Date.now() < new Date(betaEndsAt).getTime() && remainingSeats > 0
        };
    }

    function resolveGlobalUserProfile() {
        const language = (navigator.language || 'ar-SA').toLowerCase();
        const languages = (navigator.languages || [navigator.language || 'ar-SA']).map((lang) => String(lang || '').toLowerCase());
        const timezone = (Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC').toLowerCase();
        const locale = language.split('-')[0] || 'ar';

        let region = 'global';
        let continent = 'global';

        if (/riyadh|saudi|kuwait|qatar|bahrain|muscat|dubai|uae|oman|jeddah|doha|manama|abudhabi/.test(timezone)) {
            region = 'gcc';
            continent = 'asia';
        } else if (/cairo|amman|beirut|baghdad|jerusalem|gaza|damascus|khartoum|casablanca|algiers|tripoli|tunis|rabat/.test(timezone)) {
            region = 'arab';
            continent = 'asia-africa';
        } else if (/tokyo|seoul|shanghai|singapore|jakarta|karachi|kolkata|bangkok|manila|kuala_lumpur/.test(timezone)) {
            region = 'asia';
            continent = 'asia';
        } else if (/london|paris|berlin|madrid|rome|amsterdam|stockholm|warsaw|athens|lisbon/.test(timezone)) {
            region = 'europe';
            continent = 'europe';
        } else if (/new_york|chicago|los_angeles|toronto|vancouver|mexico_city|sao_paulo|buenos_aires|bogota|lima/.test(timezone)) {
            region = 'americas';
            continent = 'americas';
        } else if (/lagos|nairobi|johannesburg|cairo|casablanca|accra|addis_ababa/.test(timezone)) {
            region = 'africa';
            continent = 'africa';
        } else if (/sydney|melbourne|brisbane|auckland/.test(timezone)) {
            region = 'oceania';
            continent = 'oceania';
        } else if (/antarctica|arctic/.test(timezone)) {
            region = 'polar';
            continent = 'polar';
        }

        return {
            locale: locale,
            language: language,
            languages: languages,
            timezone: timezone,
            region: region,
            continent: continent,
            isRtl: /^(ar|ur|fa|ps|he)$/.test(locale)
        };
    }

    function injectGlobalBetaAssets() {
        if (window.__SHEIKHA_BETA_ASSETS_ATTACHED__) {
            return;
        }

        const cssHref = '/css/sheikha-beta-banner.css';
        const jsSrc = '/js/sheikha-beta-banner.js';

        const hasCss = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).some((linkEl) => {
            return (linkEl.getAttribute('href') || '').indexOf(cssHref) >= 0;
        });
        if (!hasCss) {
            const cssLink = document.createElement('link');
            cssLink.rel = 'stylesheet';
            cssLink.href = cssHref;
            document.head.appendChild(cssLink);
        }

        const hasScript = Array.from(document.querySelectorAll('script')).some((scriptEl) => {
            return (scriptEl.getAttribute('src') || '').indexOf(jsSrc) >= 0;
        });
        if (!hasScript) {
            const scriptEl = document.createElement('script');
            scriptEl.src = jsSrc;
            scriptEl.defer = true;
            document.head.appendChild(scriptEl);
        }

        window.__SHEIKHA_BETA_ASSETS_ATTACHED__ = true;
    }

    window.SheikhaPilot = {
        getState: getPilotState,
        getUserProfile: resolveGlobalUserProfile,
        getRemainingSeats: function() {
            return getPilotState().remainingSeats;
        },
        closeBanner: function() {
            localStorage.setItem(sheikhaPilotStorageKeys.bannerClosed, '1');
            window.dispatchEvent(new CustomEvent('sheikha:pilot-state', { detail: getPilotState() }));
        },
        resetBannerDismissal: function() {
            localStorage.removeItem(sheikhaPilotStorageKeys.bannerClosed);
            window.dispatchEvent(new CustomEvent('sheikha:pilot-state', { detail: getPilotState() }));
        },
        registerSeat: function(options = {}) {
            const identifier = String(options.identifier || options.email || options.phone || '').trim().toLowerCase();
            const registry = readStoredJson(sheikhaPilotStorageKeys.registry, {});

            if (identifier && registry[identifier]) {
                return {
                    success: true,
                    duplicate: true,
                    state: getPilotState()
                };
            }

            const currentRegistrations = parseInt(localStorage.getItem(sheikhaPilotStorageKeys.registrations) || '0', 10) || 0;
            localStorage.setItem(sheikhaPilotStorageKeys.registrations, String(currentRegistrations + 1));

            if (identifier) {
                registry[identifier] = {
                    source: options.source || 'registration',
                    at: new Date().toISOString()
                };
                writeStoredJson(sheikhaPilotStorageKeys.registry, registry);
            }

            const nextState = getPilotState();
            window.dispatchEvent(new CustomEvent('sheikha:pilot-state', { detail: nextState }));
            return {
                success: true,
                duplicate: false,
                state: nextState
            };
        }
    };

    injectGlobalBetaAssets();

    // ═══ safeFetch — بديل آمن عن fetch ═══
    window.safeFetch = async function(url, options = {}) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), options.timeout || 8000);
            
            const res = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    ...(options.headers || {})
                }
            });
            
            clearTimeout(timeoutId);

            if (!res.ok) {
                console.warn('[Sheikha API]', url, '→', res.status);
                return null;
            }

            const contentType = res.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
                return await res.json();
            }
            return await res.text();
        } catch (err) {
            if (err.name === 'AbortError') {
                console.warn('[Sheikha API] Timeout:', url);
            } else {
                console.warn('[Sheikha API] Silent fail:', url);
            }
            return null;
        }
    };

    // ═══ تغليف fetch الأصلي — Safe Fetch Wrapper ═══
    const _originalFetch = window.fetch;
    window.fetch = async function(url, options) {
        try {
            const response = await _originalFetch.call(this, url, options);
            return response;
        } catch (err) {
            console.warn('[Sheikha] Fetch intercepted error:', typeof url === 'string' ? url : '(Request)', err.message);
            // إرجاع Response فارغ بدلاً من رمي الخطأ
            return new Response(JSON.stringify({ success: false, error: 'connection_failed' }), {
                status: 0,
                statusText: 'Connection Failed',
                headers: { 'Content-Type': 'application/json' }
            });
        }
    };

    // ═══ كتم أخطاء JavaScript العامة أثناء التنقل ═══
    window.addEventListener('error', function(event) {
        // أخطاء الشبكة وتحميل الموارد
        if (event.target && (event.target.tagName === 'SCRIPT' || event.target.tagName === 'LINK' || event.target.tagName === 'IMG')) {
            console.warn('[Sheikha] Resource load failed:', event.target.src || event.target.href);
            event.preventDefault();
            return true;
        }
        // أخطاء JS عامة — سجّل بصمت
        console.warn('[Sheikha] JS Error:', event.message, 'at', event.filename, ':', event.lineno);
        // لا تمنع ظهور الخطأ في console لكن امنع أي popup
        return false;
    }, true);

    // ═══ كتم Promise rejections غير المعالجة ═══
    window.addEventListener('unhandledrejection', function(event) {
        console.warn('[Sheikha] Unhandled rejection:', event.reason?.message || event.reason);
        event.preventDefault();
    });

    // ═══ تغليف alert — استبدال alert بإشعار لطيف ═══
    const _originalAlert = window.alert;
    window.alert = function(message) {
        // قائمة الرسائل التي يجب كتمها (أخطاء اتصال)
        const silentPatterns = [
            'تأكد أن الخادم',
            'الخادم يعمل',
            'خطأ في الاتصال',
            'تعذر الاتصال',
            'السيرفر',
            'connection',
            'server',
            'network',
            'ETIMEDOUT',
            'ECONNREFUSED',
            'Failed to fetch'
        ];

        const msgLower = (message || '').toLowerCase();
        const shouldSilence = silentPatterns.some(p => msgLower.includes(p.toLowerCase()));

        if (shouldSilence && window.SHEIKHA_SILENT_MODE) {
            console.warn('[Sheikha] Silenced alert:', message);
            showToast(message, 'warning');
            return;
        }

        // إشعارات المستخدم العادية — حوّلها لـ Toast جميل
        showToast(message, 'info');
    };

    // ═══ نظام الإشعارات اللطيفة — Toast Notifications ═══
    function showToast(message, type = 'info') {
        // إنشاء حاوية التنبيهات إذا لم تكن موجودة
        let container = document.getElementById('sheikha-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'sheikha-toast-container';
            container.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:99999;display:flex;flex-direction:column;align-items:center;gap:8px;pointer-events:none;max-width:90vw';
            document.body.appendChild(container);
        }

        const colors = {
            info: { bg: 'rgba(212,175,55,0.95)', text: '#050810', icon: '💡' },
            success: { bg: 'rgba(34,197,94,0.95)', text: '#fff', icon: '✅' },
            warning: { bg: 'rgba(245,158,11,0.9)', text: '#050810', icon: '⚠️' },
            error: { bg: 'rgba(239,68,68,0.9)', text: '#fff', icon: '❌' }
        };

        const c = colors[type] || colors.info;

        const toast = document.createElement('div');
        toast.style.cssText = `
            background:${c.bg};color:${c.text};padding:12px 24px;border-radius:12px;
            font-family:'Tajawal',sans-serif;font-size:0.9rem;font-weight:600;
            box-shadow:0 8px 30px rgba(0,0,0,0.3);backdrop-filter:blur(10px);
            pointer-events:auto;cursor:pointer;opacity:0;transform:translateY(-20px);
            transition:all 0.3s ease;direction:rtl;text-align:center;max-width:400px;
            display:flex;align-items:center;gap:8px;
        `;
        toast.innerHTML = `<span>${c.icon}</span><span>${message}</span>`;
        container.appendChild(toast);

        // Animation
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        });

        // إزالة تلقائية
        const duration = type === 'warning' ? 2500 : 3500;
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-20px)';
            setTimeout(() => toast.remove(), 300);
        }, duration);

        // إزالة عند النقر
        toast.onclick = () => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        };
    }

    // تصدير showToast للاستخدام العام
    window.showToast = showToast;
    window.safeFetch = window.safeFetch;

    console.log('☪️ [Sheikha Safe API] — نظام الاتصال الآمن والصامت مُفعّل');
})();
