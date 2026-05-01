/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ☪️ بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * SHEIKHA Motion System — الشعار المتحرك + الانتقالات الذكية
 * 
 * المالك: سلمان أحمد بن سلمان الراجح
 * المرجعية: الكتاب والسنة
 * المبدأ: الحركة = سكينة وقوة — لا بهرجة
 * 
 * الميزات:
 *   ✅ شعار متحرك عند التشغيل (Splash)
 *   ✅ انتقالات سلسة بين الصفحات (Page Transition)
 *   ✅ ميكرو-شعار أثناء التنقل
 *   ✅ تحقن تلقائياً في كل الصفحات عبر server.js
 * ═══════════════════════════════════════════════════════════════════════════════
 */

(function() {
    'use strict';

    // ═══════════════════════════════════════════════════
    // 1) SPLASH SCREEN — شاشة الترحيب المتحركة
    // ═══════════════════════════════════════════════════

    function injectSplash() {
        // لا تعرض الـ Splash إذا كان التنقل عبر back/forward
        if (performance.navigation && performance.navigation.type === 2) return;
        // لا تعرض في الـ iframes
        if (window.self !== window.top) return;

        // تحقق من التخزين — لا تعرض إلا مرة كل جلسة
        const sessionKey = 'sheikha_splash_shown';
        if (sessionStorage.getItem(sessionKey)) return;
        sessionStorage.setItem(sessionKey, '1');

        const splash = document.createElement('div');
        splash.id = 'sheikha-splash';
        splash.setAttribute('aria-label', 'SHEIKHA — مرحباً');
        splash.innerHTML = `
            <div class="sheikha-splash-inner">
                <div class="sheikha-logo-animated">
                    <div class="logo-ring"></div>
                    <div class="logo-ring-inner"></div>
                    <div class="logo-shin">ش</div>
                </div>
                <div class="splash-bismillah">بسم الله توكلنا على الله</div>
                <div class="splash-brand">SHEIKHA</div>
                <div class="splash-tagline">منظومة وسوق شيخة — تشغيل بإتقان وقياس</div>
                <div class="splash-loader"><div class="splash-loader-bar"></div></div>
            </div>
        `;

        // حقن فوري في أعلى body
        if (document.body) {
            document.body.insertBefore(splash, document.body.firstChild);
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                document.body.insertBefore(splash, document.body.firstChild);
            });
        }

        // إخفاء بعد 3.2 ثانية (كافية لإظهار الشعار + التحميل)
        const visibleMs = 3200;
        setTimeout(() => {
            splash.classList.add('sheikha-splash-hide');
            setTimeout(() => {
                splash.remove();
            }, 700);
        }, visibleMs);
    }

    // ═══════════════════════════════════════════════════
    // 2) PAGE TRANSITION — انتقالات بين الصفحات
    // ═══════════════════════════════════════════════════

    function injectTransition() {
        // إنشاء طبقة الانتقال
        let overlay = document.getElementById('sheikha-transition');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'sheikha-transition';
            overlay.setAttribute('aria-hidden', 'true');
            document.body.appendChild(overlay);
        }

        // تأثير دخول الصفحة
        document.body.classList.add('sheikha-page-enter');
        setTimeout(() => document.body.classList.remove('sheikha-page-enter'), 350);

        // التقاط النقر على الروابط الداخلية
        document.addEventListener('click', function(e) {
            const link = e.target.closest('a');
            if (!link) return;

            const href = link.getAttribute('href');
            if (!href) return;

            // تجاهل الروابط الخارجية
            if (/^https?:\/\//i.test(href) && !href.includes(location.hostname)) return;
            // تجاهل الأنكرات
            if (href.startsWith('#')) return;
            // تجاهل التحميل
            if (link.hasAttribute('download')) return;
            // تجاهل فتح في تبويب جديد
            if (link.getAttribute('target') === '_blank') return;
            // تجاهل javascript:
            if (href.startsWith('javascript:')) return;
            // تجاهل onclick handlers
            if (link.hasAttribute('onclick')) return;

            e.preventDefault();

            // تفعيل الانتقال
            overlay.classList.add('active');

            // انتقل بعد تأخير بسيط للتأثير البصري
            setTimeout(() => {
                window.location.href = href;
            }, 180);
        });

        // إزالة الانتقال عند العودة من bfcache
        window.addEventListener('pageshow', function(event) {
            if (event.persisted) {
                overlay.classList.remove('active');
                document.body.classList.add('sheikha-page-enter');
                setTimeout(() => document.body.classList.remove('sheikha-page-enter'), 350);
            }
        });
    }

    // ═══════════════════════════════════════════════════
    // 3) التهيئة
    // ═══════════════════════════════════════════════════

    // حقن CSS إذا لم تكن محقونة
    function ensureCSS() {
        if (!document.querySelector('link[href*="sheikha-motion.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = '/css/sheikha-motion.css';
            document.head.appendChild(link);
        }
        // خط Amiri إذا لم يكن محمّلاً
        if (!document.querySelector('link[href*="Amiri"]')) {
            const font = document.createElement('link');
            font.rel = 'stylesheet';
            font.href = 'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap';
            document.head.appendChild(font);
        }
    }

    function init() {
        ensureCSS();
        injectSplash();

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', injectTransition);
        } else {
            injectTransition();
        }
    }

    // بدء فوري
    init();

    // تصدير للاستخدام الخارجي
    window.SheikhaMotion = {
        showSplash: injectSplash,
        version: '1.0'
    };

    console.log('☪️ [Sheikha Motion] — الشعار المتحرك والانتقالات مُفعّلة');
})();
