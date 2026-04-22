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

    // ═══ الوضع الصامت — Silent Mode ═══
    window.SHEIKHA_SILENT_MODE = true;

    // ═══ safeFetch — بديل آمن عن fetch مع دعم أوفلاين ═══
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
                console.warn('[Sheikha API] Silent fail (offline?):', url);
            }
            // إذا كان هناك طلب POST معلّق → أضفه لقائمة المزامنة
            if (options.method === 'POST' && options.body && window.SheikhaOfflineDB && window.SheikhaOfflineDB._ready) {
                try {
                    const body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
                    await window.SheikhaOfflineDB.saveOperation({
                        syncUrl: url,
                        method: 'POST',
                        payload: body,
                        type: options._offlineType || 'generic',
                    });
                    console.log('[Sheikha API] ✅ تم حفظ الطلب محلياً للمزامنة لاحقاً');
                } catch (_) {}
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
