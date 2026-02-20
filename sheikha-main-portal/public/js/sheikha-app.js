/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ☪️ بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * SHEIKHA APP — النظام الموحد الشامل
 * 
 * المالك: سلمان أحمد بن سلمان الراجح
 * المرجعية: الكتاب والسنة
 * 
 * يحتوي على:
 *   ✅ Safe API — اتصال آمن صامت
 *   ✅ Motion — شعار متحرك + انتقالات
 *   ✅ Navigator — نظام تنقل موحد شامل
 *   ✅ Automation — أتمتة الوظائف
 * ═══════════════════════════════════════════════════════════════════════════════
 */
(function(){
'use strict';

// ══════════════════════════════════════════════════════════
// 1) SAFE API — اتصال آمن صامت
// ══════════════════════════════════════════════════════════
window.SHEIKHA_SILENT_MODE = true;

window.safeFetch = async function(url, options = {}) {
    try {
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), options.timeout || 8000);
        const res = await fetch(url, { ...options, signal: controller.signal, headers: { 'Content-Type':'application/json', ...(options.headers||{}) }});
        clearTimeout(t);
        if (!res.ok) { console.warn('[Sheikha]', url, res.status); return null; }
        const ct = res.headers.get('content-type') || '';
        return ct.includes('json') ? await res.json() : await res.text();
    } catch(e) { console.warn('[Sheikha] Silent:', url); return null; }
};

const _fetch = window.fetch;
window.fetch = async function(u, o) {
    try { return await _fetch.call(this, u, o); }
    catch(e) { console.warn('[Sheikha] Fetch:', e.message); return new Response('{"success":false}', {status:0, headers:{'Content-Type':'application/json'}}); }
};

window.addEventListener('error', function(e) {
    if (e.target && (e.target.tagName === 'SCRIPT' || e.target.tagName === 'LINK' || e.target.tagName === 'IMG')) { e.preventDefault(); return true; }
    return false;
}, true);
window.addEventListener('unhandledrejection', function(e) { e.preventDefault(); });

const _alert = window.alert;
const silentWords = ['الخادم','السيرفر','server','connection','fetch','network','ECONNREFUSED'];
window.alert = function(msg) {
    const m = (msg||'').toLowerCase();
    if (silentWords.some(w => m.includes(w.toLowerCase())) && window.SHEIKHA_SILENT_MODE) {
        console.warn('[Sheikha] Silenced:', msg);
        window._sheikhaToast?.(msg, 'warning');
        return;
    }
    window._sheikhaToast?.(msg, 'info');
};

// Toast
window._sheikhaToast = function(msg, type) {
    let c = document.getElementById('sh-toast');
    if (!c) { c = document.createElement('div'); c.id='sh-toast'; c.style.cssText='position:fixed;top:16px;left:50%;transform:translateX(-50%);z-index:999999;display:flex;flex-direction:column;align-items:center;gap:6px;pointer-events:none;max-width:90vw'; document.body.appendChild(c); }
    const colors = {info:'rgba(212,175,55,0.95)',success:'rgba(34,197,94,0.95)',warning:'rgba(245,158,11,0.9)',error:'rgba(239,68,68,0.9)'};
    const t = document.createElement('div');
    t.style.cssText = `background:${colors[type]||colors.info};color:${type==='info'||type==='warning'?'#050810':'#fff'};padding:10px 20px;border-radius:10px;font-family:'Tajawal',sans-serif;font-size:0.85rem;font-weight:600;box-shadow:0 6px 24px rgba(0,0,0,0.3);pointer-events:auto;cursor:pointer;opacity:0;transform:translateY(-16px);transition:all 0.3s;direction:rtl;text-align:center`;
    t.textContent = msg;
    c.appendChild(t);
    requestAnimationFrame(() => { t.style.opacity='1'; t.style.transform='translateY(0)'; });
    setTimeout(() => { t.style.opacity='0'; setTimeout(() => t.remove(), 300); }, type==='warning'?2000:3000);
    t.onclick = () => { t.style.opacity='0'; setTimeout(() => t.remove(), 200); };
};
window.showToast = window._sheikhaToast;

// ══════════════════════════════════════════════════════════
// 2) SPLASH — شاشة الترحيب
// ══════════════════════════════════════════════════════════
function initSplash() {
    if (performance.navigation?.type === 2) return;
    if (window.self !== window.top) return;
    if (sessionStorage.getItem('sh_sp')) return;
    sessionStorage.setItem('sh_sp', '1');

    const s = document.createElement('div');
    s.id = 'sheikha-splash';
    s.innerHTML = `
    <style>
    #sheikha-splash{position:fixed;inset:0;background:radial-gradient(ellipse at 50% 40%,#0d1220,#070a12 50%,#020305);display:flex;align-items:center;justify-content:center;z-index:999999;flex-direction:column}
    #sheikha-splash::before{content:'';position:absolute;inset:0;background-image:url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23D4AF37' stroke-width='.25' opacity='.06'%3E%3Cpolygon points='60,8 85,25 85,58 60,75 35,58 35,25'/%3E%3Ccircle cx='60' cy='42' r='15'/%3E%3C/g%3E%3C/svg%3E");animation:spBg 30s linear infinite}
    @keyframes spBg{from{background-position:0 0}to{background-position:120px 120px}}
    #sheikha-splash::after{content:'';position:absolute;width:400px;height:400px;top:50%;left:50%;transform:translate(-50%,-50%);background:radial-gradient(circle,rgba(212,175,55,0.06),transparent 60%);animation:spGlow 3s ease-in-out infinite alternate}
    @keyframes spGlow{from{opacity:0.4;transform:translate(-50%,-50%) scale(0.9)}to{opacity:1;transform:translate(-50%,-50%) scale(1.15)}}
    .sp-inner{position:relative;z-index:2;text-align:center;opacity:0;transform:translateY(10px);animation:spIn 800ms ease 200ms forwards}
    @keyframes spIn{to{opacity:1;transform:translateY(0)}}
    .sp-logo{width:140px;height:140px;margin:0 auto 16px;position:relative}
    .sp-ring{position:absolute;inset:0;border:2px solid rgba(212,175,55,0.15);border-radius:50%;opacity:0;animation:spRing 1s ease 400ms forwards}
    .sp-ring::after{content:'';position:absolute;inset:-2px;border:2px solid transparent;border-top-color:#D4AF37;border-radius:50%;animation:spSpin 4s linear infinite}
    @keyframes spRing{from{opacity:0;transform:scale(0.6)}to{opacity:1;transform:scale(1)}}
    @keyframes spSpin{to{transform:rotate(360deg)}}
    .sp-ri{position:absolute;inset:14px;border:1px solid rgba(212,175,55,0.08);border-radius:50%;opacity:0;animation:spRing 1s ease 600ms forwards}
    .sp-ri::after{content:'';position:absolute;inset:-1px;border:1px solid transparent;border-bottom-color:rgba(184,115,51,0.6);border-radius:50%;animation:spSpin 6s linear infinite reverse}
    .sp-sh{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:3.2rem;font-weight:900;font-family:'Tajawal',sans-serif;background:linear-gradient(135deg,#F5E6A3,#D4AF37 40%,#B87333);-webkit-background-clip:text;-webkit-text-fill-color:transparent;opacity:0;transform:scale(0.7);animation:spShIn 1s cubic-bezier(0.34,1.56,0.64,1) 500ms forwards;filter:drop-shadow(0 0 20px rgba(212,175,55,0.15))}
    @keyframes spShIn{to{opacity:1;transform:scale(1)}}
    .sp-bsm{font-family:'Amiri',serif;font-size:1rem;color:rgba(212,175,55,0.6);margin-bottom:4px;opacity:0;animation:spTxt 600ms ease 1s forwards}
    .sp-brand{font-size:1.5rem;font-weight:900;letter-spacing:6px;background:linear-gradient(135deg,#D4AF37,#F5E6A3,#D4AF37);-webkit-background-clip:text;-webkit-text-fill-color:transparent;opacity:0;animation:spTxt 600ms ease 1.2s forwards;text-transform:uppercase}
    .sp-tag{font-size:0.8rem;color:rgba(255,255,255,0.35);opacity:0;animation:spTxt 600ms ease 1.4s forwards}
    @keyframes spTxt{to{opacity:1;transform:translateY(0)}}
    .sp-bar{width:100px;height:2px;background:rgba(255,255,255,0.05);border-radius:2px;margin:20px auto 0;overflow:hidden;opacity:0;animation:spTxt 400ms ease 1.5s forwards}
    .sp-bar-fill{width:0;height:100%;background:linear-gradient(90deg,#D4AF37,#B87333);border-radius:2px;animation:spFill 1.6s ease 1.6s forwards}
    @keyframes spFill{to{width:100%}}
    .sp-hide{animation:spOut 500ms ease forwards!important}
    @keyframes spOut{to{opacity:0;visibility:hidden;pointer-events:none}}
    </style>
    <div class="sp-inner">
        <div class="sp-logo"><div class="sp-ring"></div><div class="sp-ri"></div><div class="sp-sh">◉</div></div>
        <div class="sp-bsm">بسم الله توكلنا على الله</div>
        <div class="sp-brand">SHEIKHA</div>
        <div class="sp-tag">منظومة وسوق شيخة — تشغيل بإتقان وقياس</div>
        <div class="sp-bar"><div class="sp-bar-fill"></div></div>
    </div>`;
    document.body.insertBefore(s, document.body.firstChild);
    setTimeout(() => { s.classList.add('sp-hide'); setTimeout(() => s.remove(), 600); }, 3200);
}

// ══════════════════════════════════════════════════════════
// 3) PAGE TRANSITIONS — انتقالات سلسة
// ══════════════════════════════════════════════════════════
function initTransitions() {
    // Overlay
    const ov = document.createElement('div');
    ov.id = 'sh-trans';
    ov.style.cssText = 'position:fixed;inset:0;pointer-events:none;opacity:0;z-index:999998;transition:opacity 180ms ease;background:radial-gradient(ellipse,rgba(5,8,16,0.3),rgba(0,0,0,0.5))';
    document.body.appendChild(ov);

    // Page enter animation
    document.body.style.animation = 'shPageIn 250ms ease';
    const style = document.createElement('style');
    style.textContent = '@keyframes shPageIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}';
    document.head.appendChild(style);

    document.addEventListener('click', function(e) {
        const a = e.target.closest('a');
        if (!a) return;
        const h = a.getAttribute('href');
        if (!h || h.startsWith('#') || h.startsWith('javascript:') || /^https?:\/\//i.test(h) && !h.includes(location.hostname)) return;
        if (a.hasAttribute('download') || a.getAttribute('target') === '_blank' || a.hasAttribute('onclick')) return;
        e.preventDefault();
        ov.style.opacity = '1';
        ov.style.pointerEvents = 'all';
        setTimeout(() => { window.location.href = h; }, 150);
    });
    window.addEventListener('pageshow', () => { ov.style.opacity = '0'; ov.style.pointerEvents = 'none'; });
}

// ══════════════════════════════════════════════════════════
// 4) NAVIGATOR — نظام التنقل الموحد الشامل
// ══════════════════════════════════════════════════════════

const NAV_MAP = {
    market: {
        title: 'السوق والتجارة', titleEn: 'Market', icon: '🏪',
        pages: [
            { url: '/', name: 'الصفحة الرئيسية', icon: '🏠' },
            { url: '/سوق-شيخة.html', name: 'سوق شيخة', icon: '🏪' },
            { url: '/تسجيل-الشركات.html', name: 'سجّل كتاجر', icon: '🏢' },
            { url: '/تسجيل-الدخول.html', name: 'تسجيل الدخول', icon: '🔐' },
            { url: '/marketing.html', name: 'التسويق', icon: '📢' },
            { url: '/المواد-التسويقية.html', name: 'المواد التسويقية', icon: '🎨' }
        ]
    },
    dashboards: {
        title: 'لوحات التحكم', titleEn: 'Dashboards', icon: '📊',
        pages: [
            { url: '/لوحة-تحكم-المستخدم.html', name: 'لوحة المستخدم', icon: '👤' },
            { url: '/لوحة-الشركة.html', name: 'لوحة الشركة', icon: '🏢' },
            { url: '/لوحة-الادمن.html', name: 'لوحة الإدارة', icon: '👑', requiresAdmin: true }
        ]
    },
    government: {
        title: 'الأنظمة الحكومية', titleEn: 'Government', icon: '🏛️',
        pages: [
            { url: '/لوحة-الحكومة-السعودية.html', name: '🇸🇦 حكومة السعودية', icon: '🏛️' },
            { url: '/لوحة-الحكومات-الدولية.html', name: '🌍 الحكومات الدولية', icon: '🌍' },
            { url: '/الشركات-الحكومية.html', name: 'الشركات الحكومية', icon: '🏢' },
            { url: '/تسجيل-حكومي.html', name: 'تسجيل حكومي', icon: '📋' },
            { url: '/gov-dashboard.html', name: 'لوحة حكومية عامة', icon: '📊' }
        ]
    },
    intelligence: {
        title: 'الذكاء والإنتاج', titleEn: 'Intelligence & Production', icon: '🧠',
        pages: [
            { url: '/منظومة-الذكاء-والتقدم.html', name: 'منظومة الذكاء', icon: '🧠' },
            { url: '/الإتقان-والتقدم.html', name: 'الإتقان والتقدم', icon: '🏆' },
            { url: '/الإنتاج-المنهجي.html', name: 'مصنع الإنتاج', icon: '🏭' },
            { url: '/التسويق-الرقمي.html', name: 'التسويق الرقمي', icon: '📊' },
            { url: '/فهرس-المنظومة.html', name: 'الفهرس والمراقبة', icon: '📋', internalOnly: true },
            { url: '/المخطط-الهيكلي.html', name: 'المخطط الهيكلي', icon: '🏗️', internalOnly: true }
        ]
    },
    experience: {
        title: 'التجربة والمحاكاة', titleEn: 'Experience', icon: '🎯',
        pages: [
            { url: '/تجربة-المنظومة.html', name: 'تجربة المنظومة', icon: '🎯' },
            { url: '/التجربة-التشغيلية.html', name: 'التجربة التشغيلية', icon: '🧪' }
        ]
    },
    barakah: {
        title: 'البركة والاقتصاد الإسلامي', titleEn: 'Barakah & Islamic Economy', icon: '☪️',
        pages: [
            { url: '/منظومة-البركة.html', name: 'منظومة البركة', icon: '☪️' },
            { url: '/الشريعة-الاسلامية.html', name: 'الشريعة الإسلامية', icon: '📖' },
            { url: '/المجتمع.html', name: 'المجتمع', icon: '🤝' }
        ]
    },
    networks: {
        title: 'الشبكات والاتصالات والطاقة', titleEn: 'Networks & Energy', icon: '🖧',
        pages: [
            { url: '/منظومة-الشبكات-والطاقة.html', name: 'منظومة الشبكات والطاقة', icon: '🖧' }
        ]
    },
    legal: {
        title: 'الشروط والسياسات', titleEn: 'Terms & Policies', icon: '📄',
        pages: [
            { url: '/الشروط-والسياسات.html', name: 'الشروط والأحكام', icon: '📄' },
            { url: '/سياسة-الخصوصية.html', name: 'سياسة الخصوصية', icon: '🔒' }
        ]
    }
};

function initNavigator() {
    var role = 'visitor';
    try { role = localStorage.getItem('sheikha_role') || 'visitor'; } catch(e) {}
    let token = '';
    try { token = localStorage.getItem('sheikha_token') || ''; } catch(e) {}
    const isLoggedIn = !!token;
    const isAdmin = isLoggedIn && (role === 'admin' || role === 'owner');

    // زر التنقل العائم
    const btn = document.createElement('div');
    btn.id = 'sh-nav-btn';
    btn.innerHTML = '☰';
    btn.title = 'التنقل السريع';
    btn.style.cssText = 'position:fixed;bottom:20px;right:20px;width:52px;height:52px;background:linear-gradient(135deg,#D4AF37,#B87333);color:#050810;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.2rem;font-weight:900;cursor:pointer;z-index:99990;box-shadow:0 4px 20px rgba(212,175,55,0.3);transition:all 0.3s;user-select:none';
    btn.onmouseenter = () => btn.style.transform = 'scale(1.1)';
    btn.onmouseleave = () => btn.style.transform = 'scale(1)';
    btn.onclick = toggleNav;
    document.body.appendChild(btn);

    // لوحة التنقل
    const panel = document.createElement('div');
    panel.id = 'sh-nav-panel';
    panel.style.cssText = 'position:fixed;bottom:80px;right:20px;width:340px;max-height:70vh;background:rgba(10,14,26,0.97);border:1px solid rgba(212,175,55,0.15);border-radius:18px;z-index:99989;overflow-y:auto;backdrop-filter:blur(20px);box-shadow:0 20px 60px rgba(0,0,0,0.5);transform:translateY(20px) scale(0.95);opacity:0;pointer-events:none;transition:all 0.3s ease;padding:16px';

    const currentPath = decodeURIComponent(window.location.pathname);

    let html = '<div style="text-align:center;margin-bottom:12px"><div style="color:#D4AF37;font-family:Amiri,serif;font-size:0.9rem;opacity:0.6">☪️ بسم الله الرحمن الرحيم</div><div style="font-size:1.1rem;font-weight:900;background:linear-gradient(135deg,#D4AF37,#F5E6A3);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-top:4px">خريطة منظومة شيخة</div></div>';

    const visibleSections = isAdmin
        ? Object.keys(NAV_MAP)
        : ['market', 'dashboards', 'barakah', 'legal'];

    for (const key of visibleSections) {
        const section = NAV_MAP[key];
        if (!section) continue;
        html += `<div style="margin-bottom:10px"><div style="font-size:0.75rem;font-weight:700;color:#D4AF37;padding:6px 8px;border-bottom:1px solid rgba(212,175,55,0.08);display:flex;align-items:center;gap:6px">${section.icon} ${section.title} <span style="font-size:0.6rem;color:#555;margin-right:auto">${section.titleEn}</span></div>`;
        for (const p of section.pages) {
            if (p.requiresAdmin && !isAdmin) continue;
            if (p.internalOnly && !isAdmin) continue;
            const isActive = currentPath === p.url || (p.url !== '/' && currentPath.includes(p.url));
            const bg = isActive ? 'rgba(212,175,55,0.1)' : 'transparent';
            const color = isActive ? '#D4AF37' : '#94a3b8';
            const dot = isActive ? '<span style="width:6px;height:6px;border-radius:50%;background:#D4AF37;flex-shrink:0"></span>' : '';
            html += `<a href="${p.url}" style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:10px;text-decoration:none;color:${color};background:${bg};font-size:0.82rem;font-weight:500;transition:all 0.2s" onmouseenter="this.style.background='rgba(212,175,55,0.06)';this.style.color='#D4AF37'" onmouseleave="this.style.background='${bg}';this.style.color='${color}'">${p.icon} ${p.name} ${dot}</a>`;
        }
        html += '</div>';
    }

    html += '<div style="text-align:center;padding:10px 0;border-top:1px solid rgba(212,175,55,0.08);margin-top:6px"><span style="font-size:0.65rem;color:#555">SHEIKHA Navigator v2.0 — تنقل آمن ومخصص حسب الصلاحية</span></div>';

    panel.innerHTML = html;
    document.body.appendChild(panel);
}

let navOpen = false;
function toggleNav() {
    const p = document.getElementById('sh-nav-panel');
    if (!p) return;
    navOpen = !navOpen;
    if (navOpen) {
        p.style.opacity = '1'; p.style.transform = 'translateY(0) scale(1)'; p.style.pointerEvents = 'auto';
    } else {
        p.style.opacity = '0'; p.style.transform = 'translateY(20px) scale(0.95)'; p.style.pointerEvents = 'none';
    }
}

// إغلاق عند النقر خارج اللوحة
document.addEventListener('click', (e) => {
    if (navOpen && !e.target.closest('#sh-nav-panel') && !e.target.closest('#sh-nav-btn')) toggleNav();
});

// ══════════════════════════════════════════════════════════
// 5) INIT — التهيئة
// ══════════════════════════════════════════════════════════
function boot() {
    // خط Amiri
    if (!document.querySelector('link[href*="Amiri"]')) {
        const f = document.createElement('link'); f.rel='stylesheet'; f.href='https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap'; document.head.appendChild(f);
    }
    initSplash();
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => { initTransitions(); initNavigator(); });
    } else {
        initTransitions(); initNavigator();
    }
}

boot();
console.log('☪️ [SHEIKHA APP] — المنظومة الموحدة مُفعّلة | Safe API + Motion + Navigator');
})();
