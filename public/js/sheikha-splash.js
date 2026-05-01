/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ☪️ بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * SHEIKHA Splash & Page Transition Engine
 * شاشة الترحيب المتحركة ونظام الانتقال بين الصفحات
 * 
 * المنهجية: UX Engineering + Islamic Design Principles + Motion Design
 * المالك: سلمان أحمد بن سلمان الراجح
 * ═══════════════════════════════════════════════════════════════════════════════
 */

(function() {
    'use strict';

    // ═══ التكوين ═══
    const CONFIG = {
        splashDuration: 2200,
        transitionDuration: 600,
        showSplashOnce: true,
        storageKey: 'sheikha_splash_shown',
        sessionKey: 'sheikha_session_active'
    };

    // ═══ الألوان ═══
    const COLORS = {
        gold: '#D4AF37',
        goldLight: '#F5E6A3',
        copper: '#B87333',
        dark: '#050810',
        darkCard: '#0a0f1a',
        green: '#006c35',
        text: '#f1f5f9',
        dim: '#94a3b8'
    };

    // ═══ SVG شعار شيخة المتحرك ═══
    const LOGO_SVG = `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" class="sheikha-logo-svg">
        <!-- الإطار الهندسي الإسلامي -->
        <defs>
            <linearGradient id="sh-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:${COLORS.goldLight};stop-opacity:1"/>
                <stop offset="50%" style="stop-color:${COLORS.gold};stop-opacity:1"/>
                <stop offset="100%" style="stop-color:${COLORS.copper};stop-opacity:1"/>
            </linearGradient>
            <linearGradient id="sh-glow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:${COLORS.gold};stop-opacity:0.3"/>
                <stop offset="100%" style="stop-color:${COLORS.copper};stop-opacity:0.1"/>
            </linearGradient>
            <filter id="sh-glow-filter">
                <feGaussianBlur stdDeviation="3" result="blur"/>
                <feMerge>
                    <feMergeNode in="blur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>

        <!-- الدائرة الخارجية المتحركة -->
        <circle cx="100" cy="100" r="90" fill="none" stroke="url(#sh-gold-grad)" stroke-width="1.5" opacity="0.3" class="sh-ring sh-ring-outer"/>

        <!-- النمط الهندسي الإسلامي — المثمّن -->
        <g class="sh-octagon" opacity="0.2" stroke="url(#sh-gold-grad)" stroke-width="0.8" fill="none">
            <polygon points="100,18 137,37 156,74 156,126 137,163 100,182 63,163 44,126 44,74 63,37" class="sh-geo-1"/>
            <polygon points="100,35 128,48 143,76 143,124 128,152 100,165 72,152 57,124 57,76 72,48" class="sh-geo-2"/>
        </g>

        <!-- الدائرة الداخلية المتحركة -->
        <circle cx="100" cy="100" r="65" fill="none" stroke="url(#sh-gold-grad)" stroke-width="1" opacity="0.15" class="sh-ring sh-ring-inner"/>

        <!-- حرف الشين — الشعار -->
        <text x="100" y="115" text-anchor="middle" font-family="'Tajawal','Arial'" font-size="72" font-weight="900" fill="url(#sh-gold-grad)" filter="url(#sh-glow-filter)" class="sh-letter">ش</text>

        <!-- النقاط الثلاث المتحركة -->
        <g class="sh-dots">
            <circle cx="83" cy="72" r="3.5" fill="${COLORS.gold}" class="sh-dot sh-dot-1"/>
            <circle cx="100" cy="65" r="3.5" fill="${COLORS.goldLight}" class="sh-dot sh-dot-2"/>
            <circle cx="117" cy="72" r="3.5" fill="${COLORS.copper}" class="sh-dot sh-dot-3"/>
        </g>

        <!-- هلال صغير علوي -->
        <g class="sh-crescent" transform="translate(100,25)" opacity="0.6">
            <path d="M0,-8 A8,8 0 1,1 0,8 A5,5 0 1,0 0,-8" fill="${COLORS.gold}" class="sh-crescent-path"/>
        </g>
    </svg>`;

    // ═══ CSS المتحرك ═══
    const STYLES = `
    <style id="sheikha-splash-styles">
    /* ═══ شاشة الترحيب ═══ */
    .sheikha-splash {
        position: fixed; inset: 0; z-index: 999999;
        background: ${COLORS.dark};
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        opacity: 1; transition: opacity 0.5s ease;
    }
    .sheikha-splash.hide {
        opacity: 0; pointer-events: none;
    }
    .sheikha-splash::before {
        content: ''; position: absolute; inset: 0;
        background: radial-gradient(ellipse at center, rgba(212,175,55,0.04) 0%, transparent 60%);
    }

    /* الشعار */
    .splash-logo-wrap {
        width: 160px; height: 160px; position: relative; z-index: 2;
        animation: sh-logo-enter 1s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    @keyframes sh-logo-enter {
        0% { opacity: 0; transform: scale(0.5) rotate(-15deg); }
        60% { transform: scale(1.08) rotate(2deg); }
        100% { opacity: 1; transform: scale(1) rotate(0); }
    }

    .sheikha-logo-svg { width: 100%; height: 100%; }

    /* حركة الحلقات */
    .sh-ring-outer {
        stroke-dasharray: 570; stroke-dashoffset: 570;
        animation: sh-ring-draw 1.8s ease-out 0.2s forwards;
    }
    .sh-ring-inner {
        stroke-dasharray: 410; stroke-dashoffset: 410;
        animation: sh-ring-draw 1.5s ease-out 0.5s forwards;
    }
    @keyframes sh-ring-draw {
        to { stroke-dashoffset: 0; }
    }

    /* حركة المثمّن */
    .sh-geo-1 {
        stroke-dasharray: 600; stroke-dashoffset: 600;
        animation: sh-ring-draw 2s ease-out 0.3s forwards;
    }
    .sh-geo-2 {
        stroke-dasharray: 500; stroke-dashoffset: 500;
        animation: sh-ring-draw 1.8s ease-out 0.6s forwards;
    }

    /* حركة الحرف */
    .sh-letter {
        opacity: 0;
        animation: sh-letter-in 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.4s forwards;
    }
    @keyframes sh-letter-in {
        0% { opacity: 0; transform: translateY(10px) scale(0.8); }
        100% { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* حركة النقاط */
    .sh-dot {
        opacity: 0;
        animation: sh-dot-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }
    .sh-dot-1 { animation-delay: 0.7s; }
    .sh-dot-2 { animation-delay: 0.85s; }
    .sh-dot-3 { animation-delay: 1s; }
    @keyframes sh-dot-pop {
        0% { opacity: 0; r: 0; }
        100% { opacity: 1; r: 3.5; }
    }

    /* حركة الهلال */
    .sh-crescent {
        opacity: 0;
        animation: sh-crescent-in 0.6s ease 1.1s forwards;
    }
    @keyframes sh-crescent-in {
        0% { opacity: 0; transform: translate(100px, 25px) scale(0) rotate(-90deg); }
        100% { opacity: 0.6; transform: translate(100px, 25px) scale(1) rotate(0); }
    }

    /* دوران بطيء مستمر */
    .sh-octagon {
        animation: sh-slow-rotate 30s linear infinite;
        transform-origin: 100px 100px;
    }
    @keyframes sh-slow-rotate {
        to { transform: rotate(360deg); }
    }

    /* نبض الحلقة الخارجية */
    .sh-ring-outer {
        animation: sh-ring-draw 1.8s ease-out 0.2s forwards, sh-ring-pulse 3s ease-in-out 2s infinite;
    }
    @keyframes sh-ring-pulse {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 0.5; }
    }

    /* النصوص */
    .splash-bismillah {
        font-family: 'Amiri', 'Tajawal', serif;
        font-size: 1.15rem; color: rgba(212,175,55,0.5);
        margin-top: 28px; opacity: 0; z-index: 2;
        animation: sh-text-up 0.7s ease 0.6s forwards;
    }
    .splash-title {
        font-family: 'Tajawal', sans-serif;
        font-size: 2rem; font-weight: 900; z-index: 2;
        background: linear-gradient(135deg, ${COLORS.goldLight}, ${COLORS.gold}, ${COLORS.copper});
        -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        margin-top: 12px; opacity: 0;
        animation: sh-text-up 0.7s ease 0.8s forwards;
    }
    .splash-subtitle {
        font-family: 'Tajawal', sans-serif;
        font-size: 0.88rem; color: ${COLORS.dim}; z-index: 2;
        margin-top: 6px; opacity: 0; letter-spacing: 0.15em;
        animation: sh-text-up 0.6s ease 1s forwards;
    }
    @keyframes sh-text-up {
        0% { opacity: 0; transform: translateY(16px); }
        100% { opacity: 1; transform: translateY(0); }
    }

    /* شريط التحميل */
    .splash-loader {
        width: 180px; height: 2px; background: rgba(212,175,55,0.1);
        border-radius: 2px; margin-top: 30px; overflow: hidden; z-index: 2;
        opacity: 0; animation: sh-text-up 0.5s ease 1.2s forwards;
    }
    .splash-loader-bar {
        height: 100%; background: linear-gradient(90deg, ${COLORS.gold}, ${COLORS.copper});
        border-radius: 2px; width: 0%;
        animation: sh-load 1.5s ease 1.3s forwards;
    }
    @keyframes sh-load {
        0% { width: 0%; }
        60% { width: 75%; }
        100% { width: 100%; }
    }

    /* ═══ انتقال الصفحات ═══ */
    .sheikha-page-transition {
        position: fixed; inset: 0; z-index: 99998;
        background: ${COLORS.dark};
        display: flex; align-items: center; justify-content: center;
        opacity: 0; pointer-events: none;
        transition: opacity 0.3s ease;
    }
    .sheikha-page-transition.active {
        opacity: 1; pointer-events: all;
    }
    .transition-logo {
        width: 70px; height: 70px;
        animation: sh-transition-spin 0.8s ease;
    }
    @keyframes sh-transition-spin {
        0% { opacity: 0; transform: scale(0.6) rotate(-10deg); }
        50% { opacity: 1; transform: scale(1.05) rotate(0); }
        100% { opacity: 1; transform: scale(1) rotate(0); }
    }

    /* ═══ توافق الجوال ═══ */
    @media (max-width: 640px) {
        .splash-logo-wrap { width: 120px; height: 120px; }
        .splash-title { font-size: 1.5rem; }
        .splash-bismillah { font-size: 1rem; }
    }
    </style>`;

    // ═══════════════════════════════════════════════════════════════
    // شاشة الترحيب — Splash Screen
    // ═══════════════════════════════════════════════════════════════
    function showSplash() {
        // هل نعرض الشاشة؟
        const isSessionActive = sessionStorage.getItem(CONFIG.sessionKey);
        if (CONFIG.showSplashOnce && isSessionActive) return;

        // حقن CSS
        if (!document.getElementById('sheikha-splash-styles')) {
            document.head.insertAdjacentHTML('beforeend', STYLES);
        }

        const splash = document.createElement('div');
        splash.className = 'sheikha-splash';
        splash.id = 'sheikha-splash';
        splash.innerHTML = `
            <div class="splash-logo-wrap">${LOGO_SVG}</div>
            <div class="splash-bismillah">☪️ بسم الله الرحمن الرحيم</div>
            <div class="splash-title">شيخة</div>
            <div class="splash-subtitle">SHEIKHA — أول سوق إسلامي رقمي للمعادن</div>
            <div class="splash-loader"><div class="splash-loader-bar"></div></div>
        `;

        // إضافة للصفحة
        document.body.appendChild(splash);
        sessionStorage.setItem(CONFIG.sessionKey, 'true');

        // إخفاء بعد انتهاء الحركة
        setTimeout(() => {
            splash.classList.add('hide');
            setTimeout(() => splash.remove(), 500);
        }, CONFIG.splashDuration);
    }

    // ═══════════════════════════════════════════════════════════════
    // انتقال الصفحات — Page Transition
    // ═══════════════════════════════════════════════════════════════
    function initPageTransitions() {
        // حقن CSS إذا لم يكن موجوداً
        if (!document.getElementById('sheikha-splash-styles')) {
            document.head.insertAdjacentHTML('beforeend', STYLES);
        }

        // إنشاء عنصر الانتقال
        const transition = document.createElement('div');
        transition.className = 'sheikha-page-transition';
        transition.id = 'sheikha-page-transition';
        transition.innerHTML = `<div class="transition-logo">${LOGO_SVG}</div>`;
        document.body.appendChild(transition);

        // التقاط النقر على الروابط
        document.addEventListener('click', function(e) {
            const link = e.target.closest('a[href]');
            if (!link) return;

            const href = link.getAttribute('href');
            if (!href) return;

            // تجاهل الروابط الخارجية و API و # و javascript:
            if (href.startsWith('http') || href.startsWith('//') ||
                href.startsWith('#') || href.startsWith('javascript:') ||
                href.startsWith('/api/') || href.startsWith('mailto:') ||
                href.startsWith('tel:') || link.target === '_blank') {
                return;
            }

            // تفعيل الانتقال
            e.preventDefault();
            const transEl = document.getElementById('sheikha-page-transition');
            if (transEl) {
                transEl.classList.add('active');
                setTimeout(() => {
                    window.location.href = href;
                }, CONFIG.transitionDuration);
            } else {
                window.location.href = href;
            }
        });

        // إخفاء عند العودة (back)
        window.addEventListener('pageshow', function() {
            const transEl = document.getElementById('sheikha-page-transition');
            if (transEl) transEl.classList.remove('active');
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // التهيئة
    // ═══════════════════════════════════════════════════════════════
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', onReady);
        } else {
            onReady();
        }
    }

    function onReady() {
        showSplash();
        initPageTransitions();
        console.log('☪️ [Sheikha Splash] — شاشة الترحيب ونظام الانتقال مُفعّل');
    }

    // ═══ API العام ═══
    window.SheikaSplash = {
        show: showSplash,
        LOGO_SVG: LOGO_SVG,
        CONFIG: CONFIG
    };

    init();
})();
