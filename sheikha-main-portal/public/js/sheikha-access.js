/**
 * ═══════════════════════════════════════════════════════════════
 * نظام صلاحيات شيخة — Sheikha Access Control System
 * ═══════════════════════════════════════════════════════════════
 * يتحكم في ما يراه كل مستخدم حسب دوره:
 *   visitor  → زائر غير مسجّل (الصفحات العامة فقط)
 *   user     → تاجر مسجّل (+ لوحة تحكمه)
 *   company  → شركة مسجّلة (+ لوحة الشركة)
 *   gov      → جهة حكومية (+ لوحات الحكومة)
 *   admin    → المدير العام (كل شيء)
 * ═══════════════════════════════════════════════════════════════
 */
(function() {
    'use strict';

    // ═══ تصنيف الصفحات حسب الصلاحيات ═══
    var ACCESS_MAP = {
        public: [
            '/', '/index.html', '/سوق-شيخة.html', '/الشريعة-الاسلامية.html',
            '/المجتمع.html', '/تسجيل-الشركات.html', '/تسجيل-الدخول.html',
            '/تسجيل-حكومي.html', '/الشروط-والسياسات.html', '/سياسة-الخصوصية.html',
            '/هوية-السوق.html', '/سوق-المدينة.html', '/منظومة-البركة.html',
            '/آيات-التجارة.html', '/معايير-الأحاديث.html', '/بنك-شيخة.html',
            '/العاصمة-الاقتصادية.html', '/المشرع-الذكي.html', '/المُشرِّع-الذكي.html',
            '/لوحة-المؤشرات.html', '/خريطة-الأهداف.html', '/تعليم-المجتمع.html'
        ],
        user: ['/لوحة-تحكم-المستخدم.html'],
        company: ['/لوحة-الشركة.html'],
        gov: ['/لوحة-الحكومة-السعودية.html', '/لوحة-الحكومات-الدولية.html', '/gov-dashboard.html', '/الشركات-الحكومية.html'],
        admin: [
            '/لوحة-الادمن.html', '/التسويق-الرقمي.html', '/المواد-التسويقية.html',
            '/marketing.html', '/المخطط-الهيكلي.html', '/فهرس-المنظومة.html',
            '/خريطة-شيخة.html', '/منظومة-الذكاء-والتقدم.html', '/الإنتاج-المنهجي.html',
            '/الإتقان-والتقدم.html', '/التجربة-التشغيلية.html', '/تجربة-المنظومة.html',
            '/منظومة-الشبكات-والطاقة.html', '/منظومة-الأرض-والسماء.html',
            '/منظومة-الحكمة-والمنطق.html', '/الهيكل-الإداري.html'
        ]
    };
    var ADMIN_PREFIXES = ['/_admin/', '/marketing/', '/_engines/'];
    // صفحات عامة نمطية (لمنع إعادة توجيه خاطئة في صفحات المجتمع/التعليم)
    var PUBLIC_PREFIXES = ['/المجتمع', '/community', '/تعليم', '/education'];

    function normalizePath(path) {
        var p = String(path || '/');
        try { p = decodeURIComponent(p); } catch(e) {}
        if (!p) p = '/';
        if (p.length > 1 && p.charAt(p.length - 1) === '/') p = p.slice(0, -1);
        return p;
    }

    // الحالة — يبدأ كزائر حتى يثبت العكس من السيرفر
    var _verifiedRole = null; // null = لم يُتحقق بعد
    var _verifying = false;

    // ═══ الحصول على الدور المحلي (قبل التحقق من السيرفر) ═══
    function getLocalRole() {
        try {
            var token = localStorage.getItem('sheikha_token');
            if (!token) return 'visitor';
            // التوكنات المُحاكاة — لا قيمة لها
            if (token.startsWith('nafath_') || token.startsWith('sheikha_') || token.startsWith('dev-token-')) {
                localStorage.removeItem('sheikha_token');
                localStorage.removeItem('sheikha_user');
                localStorage.removeItem('sheikha_role');
                return 'visitor';
            }
            return localStorage.getItem('sheikha_role') || 'user';
        } catch(e) { return 'visitor'; }
    }

    function getCurrentRole() {
        if (_verifiedRole !== null) return _verifiedRole;
        return getLocalRole();
    }

    function getCurrentUser() {
        try {
            var u = localStorage.getItem('sheikha_user');
            return u ? JSON.parse(u) : null;
        } catch(e) { return null; }
    }

    // ═══ فحص الصلاحية ═══
    function hasAccess(role, path) {
        path = normalizePath(path);
        if (role === 'admin') return true;
        if (ACCESS_MAP.public.indexOf(path) !== -1) return true;
        for (var p = 0; p < PUBLIC_PREFIXES.length; p++) {
            if (path.indexOf(PUBLIC_PREFIXES[p]) === 0) return true;
        }
        for (var i = 0; i < ADMIN_PREFIXES.length; i++) {
            if (path.indexOf(ADMIN_PREFIXES[i]) === 0) return false;
        }
        if (ACCESS_MAP.admin.indexOf(path) !== -1) return false;
        if (ACCESS_MAP.user.indexOf(path) !== -1) return role !== 'visitor';
        if (ACCESS_MAP.company.indexOf(path) !== -1) return role === 'company' || role === 'admin';
        if (ACCESS_MAP.gov.indexOf(path) !== -1) return role === 'gov' || role === 'admin';
        return role !== 'visitor';
    }

    // ═══ حماية الصفحة الحالية ═══
    function protectCurrentPage() {
        var role = getLocalRole();
        var path = normalizePath(window.location.pathname);
        if (!hasAccess(role, path)) {
            if (role === 'visitor') {
                window.location.href = '/تسجيل-الدخول.html?redirect=' + encodeURIComponent(path);
            } else {
                window.location.href = '/?access=denied';
            }
        }
    }

    // ═══ إخفاء/إظهار عناصر التنقل حسب الدور ═══
    function applyNavVisibility() {
        var role = getCurrentRole();

        // إخفاء/إظهار عناصر data-access
        var elements = document.querySelectorAll('[data-access]');
        for (var i = 0; i < elements.length; i++) {
            var el = elements[i];
            var required = el.getAttribute('data-access').split(',');
            // "all" = مرئي للجميع
            if (required.indexOf('all') !== -1) { el.style.display = ''; continue; }
            // هل الدور الحالي مطلوب؟
            if (required.indexOf(role) !== -1) {
                el.style.display = '';
            } else {
                el.style.display = 'none';
            }
        }

        // إخفاء/إظهار روابط القائمة المنسدلة
        var megaLinks = document.querySelectorAll('.mega-link[data-access], .mega-sep[data-access]');
        for (var j = 0; j < megaLinks.length; j++) {
            var link = megaLinks[j];
            var req = link.getAttribute('data-access').split(',');
            if (req.indexOf('all') !== -1 || req.indexOf(role) !== -1) {
                link.style.display = '';
            } else {
                link.style.display = 'none';
            }
        }

        // إخفاء أي روابط حساسة (أدمن/محركات) من الواجهة العامة
        // تبقى شغالة بالخلفية ولا تظهر إلا للمدير.
        var sensitiveLinks = document.querySelectorAll('a[href^="/_admin/"], a[href^="/_engines/"], a[href="/لوحة-الادمن.html"]');
        for (var k = 0; k < sensitiveLinks.length; k++) {
            if (role !== 'admin') sensitiveLinks[k].style.display = 'none';
            else sensitiveLinks[k].style.display = '';
        }

        // إخفاء أي عناصر واجهة تشير إلى "لوحة المدير/الإدارة" أو "المحركات" لغير الأدمن
        if (role !== 'admin') {
            var allNodes = document.querySelectorAll('a, button, .card, .menu-item, .quick-link, .tile, .widget, .stat-card');
            for (var n = 0; n < allNodes.length; n++) {
                var node = allNodes[n];
                var text = (node.textContent || '').trim();
                var href = (node.getAttribute('href') || '').trim();
                var isSensitive = href.indexOf('/_admin/') === 0 ||
                    href.indexOf('/_engines/') === 0 ||
                    href === '/لوحة-الادمن.html' ||
                    text.indexOf('لوحة المدير') !== -1 ||
                    text.indexOf('لوحة الإدارة') !== -1 ||
                    text.indexOf('المحركات') !== -1 ||
                    text.indexOf('محرك') !== -1 ||
                    text.indexOf('Engine') !== -1;
                if (isSensitive) node.style.display = 'none';
            }
        }

        // تحديث واجهة الدخول
        updateAuthUI(role);
    }

    // ═══ تحديث أزرار الدخول/الخروج ═══
    function updateAuthUI(role) {
        var loginBtn = document.getElementById('nav-login-btn');
        var userMenu = document.getElementById('nav-user-menu');

        if (role === 'visitor') {
            if (loginBtn) loginBtn.style.display = '';
            if (userMenu) userMenu.style.display = 'none';
        } else {
            if (loginBtn) loginBtn.style.display = 'none';
            if (userMenu) userMenu.style.display = '';

            // اسم المستخدم
            var user = getCurrentUser();
            var nameEl = document.getElementById('nav-user-name');
            if (nameEl) {
                nameEl.textContent = (user && user.name) ? user.name : 'حسابي';
            }

            // رابط لوحة التحكم حسب الدور
            var dashMap = {
                'user': '/لوحة-تحكم-المستخدم.html',
                'company': '/لوحة-الشركة.html',
                'gov': '/gov-dashboard.html',
                'admin': '/لوحة-الادمن.html'
            };
            var dashLink = document.getElementById('nav-dash-link');
            var dashLink2 = document.getElementById('nav-dash-link-2');
            if (dashLink) dashLink.href = dashMap[role] || dashMap['user'];
            if (dashLink2) dashLink2.href = dashMap[role] || dashMap['user'];
        }
    }

    // ═══ تحقق من التوكن مع السيرفر ═══
    function verifyTokenWithServer() {
        var token = null;
        try { token = localStorage.getItem('sheikha_token'); } catch(e) {}
        if (!token || _verifying) return;
        _verifying = true;

        // التوكنات المحاكاة — احذفها فوراً
        if (token.startsWith('nafath_') || token.startsWith('sheikha_') || token.startsWith('dev-token-')) {
            localStorage.removeItem('sheikha_token');
            localStorage.removeItem('sheikha_user');
            localStorage.removeItem('sheikha_role');
            _verifiedRole = 'visitor';
            _verifying = false;
            applyNavVisibility();
            return;
        }

        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/me', true);
        xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        xhr.timeout = 5000;
        xhr.onload = function() {
            _verifying = false;
            try {
                var data = JSON.parse(xhr.responseText);
                if (data.success && data.user) {
                    var role = data.user.role || 'user';
                    _verifiedRole = role;
                    localStorage.setItem('sheikha_role', role);
                    localStorage.setItem('sheikha_user', JSON.stringify(data.user));
                } else {
                    // توكن منتهي — امسح
                    _verifiedRole = 'visitor';
                    localStorage.removeItem('sheikha_token');
                    localStorage.removeItem('sheikha_user');
                    localStorage.removeItem('sheikha_role');
                }
            } catch(e) {
                _verifiedRole = 'visitor';
                localStorage.removeItem('sheikha_token');
                localStorage.removeItem('sheikha_user');
                localStorage.removeItem('sheikha_role');
            }
            applyNavVisibility();
        };
        xhr.onerror = function() { _verifying = false; };
        xhr.ontimeout = function() { _verifying = false; };
        xhr.send();
    }

    // ═══ تسجيل الخروج ═══
    window.sheikhaLogout = function() {
        localStorage.removeItem('sheikha_token');
        localStorage.removeItem('sheikha_user');
        localStorage.removeItem('sheikha_role');
        try {
            document.cookie = 'sheikha_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
            document.cookie = 'sheikha_token=; path=/; domain=.sheikha.top; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
        } catch(e) {}
        _verifiedRole = 'visitor';
        window.location.href = '/';
    };
    // توافق مع صفحات تستخدم logout() مباشرة
    window.logout = window.sheikhaLogout;

    // CSP يمنع onclick في بعض الصفحات، لذا نربط أزرار الخروج برمجياً.
    function bindLogoutButtons() {
        var selector = [
            '[data-action="logout"]',
            '.logout-btn',
            'a[onclick*="sheikhaLogout"]',
            'a[onclick*="logout()"]',
            'button[onclick*="logout()"]',
            'div[onclick*="logout()"]',
            'a[href*="logout"]',
            'button[id*="logout"]',
            'a[id*="logout"]'
        ].join(',');
        var nodes = document.querySelectorAll(selector);
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            if (node.dataset && node.dataset.shkLogoutBound === '1') continue;
            if (node.dataset) node.dataset.shkLogoutBound = '1';
            node.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                window.sheikhaLogout();
            });
        }
    }

    // دعم عناصر الخروج المضافة ديناميكياً (مثل قوائم أعلى الصفحة/الإشعارات)
    document.addEventListener('click', function(e) {
        var target = e.target;
        if (!target) return;
        var clickable = target.closest('a,button,div,[role="button"],.nav-item,.menu-item,.dropdown-item');
        if (!clickable) return;
        var text = String(clickable.textContent || '').trim();
        var hasLogoutText = text.indexOf('تسجيل الخروج') !== -1 || text === 'خروج';
        var isMarkedLogout = clickable.matches('[data-action="logout"], .logout-btn') ||
            String(clickable.getAttribute('onclick') || '').indexOf('logout') !== -1 ||
            String(clickable.getAttribute('id') || '').toLowerCase().indexOf('logout') !== -1;
        if (!hasLogoutText && !isMarkedLogout) return;
        e.preventDefault();
        e.stopPropagation();
        window.sheikhaLogout();
    }, true);

    // ═══ API عامة ═══
    window.SheikhaAccess = {
        getRole: getCurrentRole,
        getUser: getCurrentUser,
        hasAccess: hasAccess,
        isAdmin: function() { return getCurrentRole() === 'admin'; },
        isLoggedIn: function() { return getCurrentRole() !== 'visitor'; },
        logout: window.sheikhaLogout
    };

    // ═══ التشغيل ═══
    protectCurrentPage();

    function onReady() {
        applyNavVisibility();
        bindLogoutButtons();
        verifyTokenWithServer();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onReady);
    } else {
        onReady();
    }

    window.addEventListener('storage', function(e) {
        if (e.key === 'sheikha_role' || e.key === 'sheikha_token') {
            _verifiedRole = null;
            applyNavVisibility();
        }
    });

})();
