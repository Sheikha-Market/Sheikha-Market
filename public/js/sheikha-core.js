/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🏛️ منظومة شيخة الأساسية - Sheikha Core System
 * ═══════════════════════════════════════════════════════════════════════════════
 * نظام متكامل للتحكم في:
 * - الصفحات (قبل/بعد التسجيل)
 * - المصادقة والتكامل
 * - الكوكيز والسياسات
 * - تحليل البيانات
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const SheikhaCore = (function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════════
    // التكوين الأساسي
    // ═══════════════════════════════════════════════════════════════════════════
    const CONFIG = {
        apiBase: '/api',
        version: '2.0.0',
        cookiePrefix: 'sheikha_',
        sessionDuration: 24 * 60 * 60 * 1000, // 24 ساعة
        refreshTokenDuration: 7 * 24 * 60 * 60 * 1000, // 7 أيام
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // تصنيف الصفحات (عامة / تحتاج تسجيل)
    // ═══════════════════════════════════════════════════════════════════════════
    const PAGES = {
        // صفحات عامة (قبل التسجيل) - يمكن للجميع الوصول
        public: [
            '/',
            '/index.html',
            '/السوق.html',
            '/تسجيل-الدخول.html',
            '/تسجيل-تاجر.html',
            '/اللوائح-والقوانين-والاجراءات.html',
            '/الشروط-والسياسات.html',
            '/تحميل-التطبيق.html',
            '/خريطة-الموقع.html',
            '/آلية-البيع.html',
            '/الهوية-والبيئة-والجودة.html',
            '/معايير-الجودة.html',
            '/الشريعة-الاسلامية.html',
            '/api-docs.html'
        ],
        // صفحات تحتاج تسجيل دخول (للمستخدمين المسجلين)
        protected: [
            '/لوحة-التحكم.html',
            '/عرض-بضائع.html',
            '/مساعد-شيخة.html',
            '/المنتدى.html',
            '/مركز-الأبحاث.html',
            '/قاعدة-بيانات-الشركات.html',
            '/نظام-الإشعارات.html',
            '/لوحة-المؤشرات.html',
            '/نظام-المدفوعات.html',
            '/النظام-المحاسبي.html',
            '/سوق-سلسلة-التوريد.html',
            '/تجربة-العميل.html',
            '/التكاملات.html',
            '/تكامل.html',
            '/ريادة-الأعمال.html',
            '/تحليل-العملية-التجارية.html',
            '/رسومات-هندسية-وفنية.html',
            '/تخطيط-كل-مرحلة.html'
        ],
        // صفحات للتجار فقط (بعد التحقق من المتجر)
        trader: [
            '/نظام-اللوجستيات.html',
            '/سلاسل-الإمداد-المتقدمة.html',
            '/نظام-متابعة-وتنفيذ-وتحليل.html',
            '/رسم-سلسلة-التوريد.html',
            '/سلسلة-التوريد-رسم.html'
        ],
        // صفحات للمشرفين فقط
        admin: [
            '/ادارة-النظام.html',
            '/devops.html',
            '/نظام-البرمجة.html',
            '/تفعيل-النموذج.html',
            '/تجربة-منظومة-البرمجة.html'
        ]
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // مزودي المصادقة
    // ═══════════════════════════════════════════════════════════════════════════
    const AUTH_PROVIDERS = {
        nafath: {
            name: 'نفاذ',
            nameEn: 'Nafath',
            icon: '🇸🇦',
            color: '#006c35',
            enabled: true,
            url: 'https://www.iam.gov.sa',
            clientId: 'SHEIKHA_NAFATH_CLIENT',
            scope: 'openid profile'
        },
        google: {
            name: 'جوجل',
            nameEn: 'Google',
            icon: '🔵',
            color: '#4285F4',
            enabled: true,
            clientId: 'SHEIKHA_GOOGLE_CLIENT',
            scope: 'email profile'
        },
        microsoft: {
            name: 'مايكروسوفت',
            nameEn: 'Microsoft',
            icon: '🟦',
            color: '#00a4ef',
            enabled: true,
            clientId: 'SHEIKHA_MS_CLIENT',
            scope: 'user.read'
        },
        apple: {
            name: 'أبل',
            nameEn: 'Apple',
            icon: '🍎',
            color: '#000000',
            enabled: true,
            clientId: 'SHEIKHA_APPLE_CLIENT',
            scope: 'email name'
        }
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // إدارة الكوكيز
    // ═══════════════════════════════════════════════════════════════════════════
    const Cookies = {
        set(name, value, days = 365, options = {}) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            
            let cookie = `${CONFIG.cookiePrefix}${name}=${encodeURIComponent(JSON.stringify(value))}`;
            cookie += `; expires=${date.toUTCString()}`;
            cookie += `; path=${options.path || '/'}`;
            cookie += `; SameSite=${options.sameSite || 'Lax'}`;
            
            if (options.secure || location.protocol === 'https:') {
                cookie += '; Secure';
            }
            
            document.cookie = cookie;
        },

        get(name) {
            const fullName = CONFIG.cookiePrefix + name;
            const cookies = document.cookie.split(';');
            
            for (let cookie of cookies) {
                cookie = cookie.trim();
                if (cookie.startsWith(fullName + '=')) {
                    try {
                        return JSON.parse(decodeURIComponent(cookie.substring(fullName.length + 1)));
                    } catch {
                        return cookie.substring(fullName.length + 1);
                    }
                }
            }
            return null;
        },

        remove(name) {
            document.cookie = `${CONFIG.cookiePrefix}${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        },

        // التحقق من الموافقة على الكوكيز
        hasConsent() {
            return this.get('consent') === true;
        },

        setConsent(accepted) {
            this.set('consent', accepted, 365);
            this.set('consent_date', new Date().toISOString(), 365);
        }
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // إدارة الجلسات والمصادقة
    // ═══════════════════════════════════════════════════════════════════════════
    const Auth = {
        // التحقق من تسجيل الدخول
        isLoggedIn() {
            const token = localStorage.getItem('sheikha_token');
            const user = localStorage.getItem('sheikha_user');
            
            if (!token || !user) return false;
            
            // التحقق من صلاحية التوكن
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (payload.exp && payload.exp * 1000 < Date.now()) {
                    this.logout();
                    return false;
                }
                return true;
            } catch {
                return false;
            }
        },

        // الحصول على بيانات المستخدم
        getUser() {
            try {
                return JSON.parse(localStorage.getItem('sheikha_user'));
            } catch {
                return null;
            }
        },

        // التحقق من الصلاحيات
        hasRole(role) {
            const user = this.getUser();
            return user && user.roles && user.roles.includes(role);
        },

        // تسجيل الدخول
        async login(email, password) {
            try {
                const response = await fetch(`${CONFIG.apiBase}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    localStorage.setItem('sheikha_token', data.token);
                    localStorage.setItem('sheikha_user', JSON.stringify(data.user));
                    Cookies.set('session', { loggedIn: true, userId: data.user.id }, 1);
                    
                    // تسجيل الدخول في التحليلات
                    Analytics.track('login', { method: 'email', userId: data.user.id });
                    
                    return { success: true, user: data.user };
                }
                
                return { success: false, error: data.error || 'فشل تسجيل الدخول' };
            } catch (error) {
                return { success: false, error: 'خطأ في الاتصال' };
            }
        },

        // تسجيل الدخول عبر OAuth
        async loginWithProvider(provider) {
            const providerConfig = AUTH_PROVIDERS[provider];
            if (!providerConfig || !providerConfig.enabled) {
                return { success: false, error: 'مزود غير متاح' };
            }
            
            // فتح نافذة OAuth
            const width = 500, height = 600;
            const left = (screen.width - width) / 2;
            const top = (screen.height - height) / 2;
            
            const authWindow = window.open(
                `${CONFIG.apiBase}/auth/oauth/${provider}`,
                `${provider}_auth`,
                `width=${width},height=${height},left=${left},top=${top}`
            );
            
            return new Promise((resolve) => {
                window.addEventListener('message', function handler(event) {
                    if (event.data.type === 'oauth_callback') {
                        window.removeEventListener('message', handler);
                        authWindow.close();
                        
                        if (event.data.success) {
                            localStorage.setItem('sheikha_token', event.data.token);
                            localStorage.setItem('sheikha_user', JSON.stringify(event.data.user));
                            Analytics.track('login', { method: provider, userId: event.data.user.id });
                            resolve({ success: true, user: event.data.user });
                        } else {
                            resolve({ success: false, error: event.data.error });
                        }
                    }
                });
            });
        },

        // تسجيل الخروج
        logout() {
            localStorage.removeItem('sheikha_token');
            localStorage.removeItem('sheikha_user');
            Cookies.remove('session');
            Analytics.track('logout');
            window.location.href = '/';
        },

        // تسجيل مستخدم جديد
        async register(userData) {
            try {
                const response = await fetch(`${CONFIG.apiBase}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...userData,
                        acceptedTerms: true,
                        acceptedPrivacy: true,
                        consentDate: new Date().toISOString()
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    Analytics.track('register', { type: userData.type });
                    return { success: true, message: data.message };
                }
                
                return { success: false, error: data.error };
            } catch (error) {
                return { success: false, error: 'خطأ في الاتصال' };
            }
        }
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // التحكم في الصفحات
    // ═══════════════════════════════════════════════════════════════════════════
    const PageController = {
        init() {
            const currentPath = window.location.pathname;
            const decodedPath = decodeURIComponent(currentPath);
            
            // التحقق من صلاحية الوصول للصفحات المحمية
            if (this.isProtectedPage(decodedPath) && !Auth.isLoggedIn()) {
                // حفظ الصفحة المطلوبة للعودة إليها بعد تسجيل الدخول
                sessionStorage.setItem('returnUrl', currentPath);
                this.showLoginRequired();
                return false;
            }
            
            // التحقق من صفحات التجار
            if (this.isTraderPage(decodedPath) && !Auth.hasRole('trader')) {
                this.showTraderRequired();
                return false;
            }
            
            // التحقق من صفحات المشرفين
            if (this.isAdminPage(decodedPath) && !Auth.hasRole('admin')) {
                window.location.href = '/لوحة-التحكم.html';
                return false;
            }
            
            // تحديث واجهة المستخدم حسب حالة تسجيل الدخول
            this.updateUI();
            
            return true;
        },

        isProtectedPage(path) {
            return PAGES.protected.some(p => path.includes(p.replace('/', '')));
        },

        isTraderPage(path) {
            return PAGES.trader.some(p => path.includes(p.replace('/', '')));
        },

        isAdminPage(path) {
            return PAGES.admin.some(p => path.includes(p.replace('/', '')));
        },

        showLoginRequired() {
            // عرض رسالة تسجيل الدخول المطلوب
            const overlay = document.createElement('div');
            overlay.id = 'login-required-overlay';
            overlay.innerHTML = `
                <div style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(5,8,16,0.95);z-index:9999;display:flex;align-items:center;justify-content:center;">
                    <div style="background:#0d1424;border:1px solid #d4af37;border-radius:20px;padding:48px;max-width:450px;text-align:center;">
                        <div style="font-size:4rem;margin-bottom:20px;">🔐</div>
                        <h2 style="color:#d4af37;font-size:1.5rem;margin-bottom:16px;">تسجيل الدخول مطلوب</h2>
                        <p style="color:#94a3b8;margin-bottom:24px;line-height:1.8;">هذه الصفحة متاحة للمستخدمين المسجلين فقط.<br>سجّل الدخول للوصول إلى جميع الميزات.</p>
                        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
                            <a href="/تسجيل-الدخول.html" style="padding:14px 32px;background:linear-gradient(135deg,#f0d060,#d4af37);color:#0a0f1a;border-radius:12px;text-decoration:none;font-weight:700;">تسجيل الدخول</a>
                            <a href="/تسجيل-تاجر.html" style="padding:14px 32px;border:2px solid #d4af37;color:#d4af37;border-radius:12px;text-decoration:none;font-weight:700;">إنشاء حساب</a>
                        </div>
                        <a href="/" style="display:block;margin-top:20px;color:#64748b;text-decoration:none;font-size:0.9rem;">← العودة للرئيسية</a>
                    </div>
                </div>
            `;
            document.body.innerHTML = '';
            document.body.appendChild(overlay);
        },

        showTraderRequired() {
            // عرض رسالة للتجار فقط
            const overlay = document.createElement('div');
            overlay.innerHTML = `
                <div style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(5,8,16,0.95);z-index:9999;display:flex;align-items:center;justify-content:center;">
                    <div style="background:#0d1424;border:1px solid #0a5c36;border-radius:20px;padding:48px;max-width:450px;text-align:center;">
                        <div style="font-size:4rem;margin-bottom:20px;">🏪</div>
                        <h2 style="color:#10b981;font-size:1.5rem;margin-bottom:16px;">صفحة خاصة بالتجار</h2>
                        <p style="color:#94a3b8;margin-bottom:24px;line-height:1.8;">هذه الصفحة متاحة للتجار المسجلين فقط.<br>سجّل متجرك للوصول إلى أدوات التجارة.</p>
                        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
                            <a href="/تسجيل-تاجر.html" style="padding:14px 32px;background:linear-gradient(135deg,#0d7a47,#0a5c36);color:#fff;border-radius:12px;text-decoration:none;font-weight:700;">سجّل متجرك</a>
                            <a href="/لوحة-التحكم.html" style="padding:14px 32px;border:2px solid #0a5c36;color:#10b981;border-radius:12px;text-decoration:none;font-weight:700;">لوحة التحكم</a>
                        </div>
                        <a href="/" style="display:block;margin-top:20px;color:#64748b;text-decoration:none;font-size:0.9rem;">← العودة للرئيسية</a>
                    </div>
                </div>
            `;
            document.body.innerHTML = '';
            document.body.appendChild(overlay);
        },

        updateUI() {
            const isLoggedIn = Auth.isLoggedIn();
            const user = Auth.getUser();
            
            // تحديث أزرار التنقل
            document.querySelectorAll('[data-auth="logged-in"]').forEach(el => {
                el.style.display = isLoggedIn ? '' : 'none';
            });
            
            document.querySelectorAll('[data-auth="logged-out"]').forEach(el => {
                el.style.display = isLoggedIn ? 'none' : '';
            });
            
            // عرض اسم المستخدم
            document.querySelectorAll('[data-user="name"]').forEach(el => {
                el.textContent = user?.name || '';
            });
            
            document.querySelectorAll('[data-user="email"]').forEach(el => {
                el.textContent = user?.email || '';
            });

            // عرض القائمة المناسبة
            this.updateNavigation(isLoggedIn, user);
        },

        updateNavigation(isLoggedIn, user) {
            const nav = document.querySelector('.nav, .main-nav');
            if (!nav) return;

            // إضافة روابط حسب حالة تسجيل الدخول
            const protectedLinks = nav.querySelectorAll('[data-protected="true"]');
            protectedLinks.forEach(link => {
                link.style.display = isLoggedIn ? '' : 'none';
            });
        }
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // نظام التحليلات والبيانات
    // ═══════════════════════════════════════════════════════════════════════════
    const Analytics = {
        queue: [],
        
        init() {
            // تتبع زيارة الصفحة
            this.track('pageview', {
                path: window.location.pathname,
                referrer: document.referrer,
                userAgent: navigator.userAgent
            });
            
            // إرسال البيانات المجمعة كل 30 ثانية
            setInterval(() => this.flush(), 30000);
            
            // إرسال عند مغادرة الصفحة
            window.addEventListener('beforeunload', () => this.flush());
        },

        track(event, data = {}) {
            this.queue.push({
                event,
                data,
                timestamp: new Date().toISOString(),
                sessionId: this.getSessionId(),
                userId: Auth.getUser()?.id
            });
        },

        getSessionId() {
            let sessionId = sessionStorage.getItem('sheikha_session_id');
            if (!sessionId) {
                sessionId = 'sess_' + Math.random().toString(36).substr(2, 9);
                sessionStorage.setItem('sheikha_session_id', sessionId);
            }
            return sessionId;
        },

        async flush() {
            if (this.queue.length === 0) return;
            
            const events = [...this.queue];
            this.queue = [];
            
            try {
                await fetch(`${CONFIG.apiBase}/analytics/events`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ events })
                });
            } catch (error) {
                // إعادة الأحداث للقائمة في حالة الفشل
                this.queue.unshift(...events);
            }
        }
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // نظام تحليل البيانات وتحويلها لقرارات
    // ═══════════════════════════════════════════════════════════════════════════
    const DataIntelligence = {
        // تجميع البيانات من مصادر مختلفة
        aggregateData() {
            return {
                user: this.getUserInsights(),
                market: this.getMarketInsights(),
                behavior: this.getBehaviorInsights(),
                recommendations: this.generateRecommendations()
            };
        },

        // رؤى المستخدم
        getUserInsights() {
            const user = Auth.getUser();
            if (!user) return null;

            return {
                profile: {
                    completeness: this.calculateProfileCompleteness(user),
                    verificationStatus: user.verified || false,
                    membershipDuration: this.calculateMembershipDuration(user.createdAt)
                },
                activity: {
                    lastLogin: user.lastLogin,
                    totalOrders: user.ordersCount || 0,
                    totalSpent: user.totalSpent || 0
                }
            };
        },

        // رؤى السوق
        getMarketInsights() {
            return {
                trending: [],
                priceChanges: [],
                opportunities: []
            };
        },

        // رؤى السلوك
        getBehaviorInsights() {
            return {
                frequentPages: this.getFrequentPages(),
                searchHistory: this.getSearchHistory(),
                interests: this.inferInterests()
            };
        },

        // توليد التوصيات
        generateRecommendations() {
            return {
                products: [],
                traders: [],
                actions: []
            };
        },

        calculateProfileCompleteness(user) {
            const fields = ['name', 'email', 'phone', 'company', 'address', 'crNumber'];
            const filled = fields.filter(f => user[f]).length;
            return Math.round((filled / fields.length) * 100);
        },

        calculateMembershipDuration(createdAt) {
            if (!createdAt) return 0;
            const days = Math.floor((Date.now() - new Date(createdAt)) / (1000 * 60 * 60 * 24));
            return days;
        },

        getFrequentPages() {
            return JSON.parse(localStorage.getItem('sheikha_page_visits') || '{}');
        },

        getSearchHistory() {
            return JSON.parse(localStorage.getItem('sheikha_searches') || '[]');
        },

        inferInterests() {
            const visits = this.getFrequentPages();
            const searches = this.getSearchHistory();
            // تحليل الاهتمامات بناءً على السلوك
            return [];
        }
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // نظام التكامل
    // ═══════════════════════════════════════════════════════════════════════════
    const Integrations = {
        available: {
            nafath: { status: 'ready', name: 'نفاذ الوطني', icon: '🇸🇦' },
            google: { status: 'ready', name: 'Google', icon: '🔵' },
            microsoft: { status: 'ready', name: 'Microsoft', icon: '🟦' },
            apple: { status: 'ready', name: 'Apple', icon: '🍎' },
            mada: { status: 'ready', name: 'مدى', icon: '💳' },
            stcPay: { status: 'ready', name: 'STC Pay', icon: '📱' },
            applePay: { status: 'ready', name: 'Apple Pay', icon: '🍎' },
            googlePay: { status: 'ready', name: 'Google Pay', icon: '💰' },
            zatca: { status: 'ready', name: 'الفوترة الإلكترونية', icon: '📄' },
            saber: { status: 'ready', name: 'سابر', icon: '✅' },
            gosi: { status: 'ready', name: 'GOSI', icon: '🏛️' }
        },

        getStatus() {
            return this.available;
        },

        async connect(provider) {
            // محاكاة الاتصال
            return { success: true, provider, connected: true };
        }
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // واجهة إشعارات الكوكيز والسياسات
    // ═══════════════════════════════════════════════════════════════════════════
    const ConsentBanner = {
        show() {
            if (Cookies.hasConsent()) return;

            const banner = document.createElement('div');
            banner.id = 'consent-banner';
            banner.innerHTML = `
                <div class="consent-banner">
                    <div class="consent-content">
                        <div class="consent-icon">🍪</div>
                        <div class="consent-text">
                            <h4>سياسة الخصوصية والكوكيز</h4>
                            <p>نستخدم ملفات تعريف الارتباط لتحسين تجربتك. باستخدامك للموقع، فإنك توافق على 
                            <a href="/اللوائح-والقوانين-والاجراءات.html">سياسة الخصوصية</a> و
                            <a href="/اللوائح-والقوانين-والاجراءات.html#terms">الشروط والأحكام</a>.</p>
                        </div>
                    </div>
                    <div class="consent-actions">
                        <button class="btn-consent-settings" onclick="SheikhaCore.ConsentBanner.showSettings()">إعدادات</button>
                        <button class="btn-consent-reject" onclick="SheikhaCore.ConsentBanner.reject()">رفض</button>
                        <button class="btn-consent-accept" onclick="SheikhaCore.ConsentBanner.accept()">موافق</button>
                    </div>
                </div>
            `;
            
            // إضافة الأنماط
            const style = document.createElement('style');
            style.textContent = `
                .consent-banner {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: linear-gradient(135deg, #0d1424 0%, #1a2638 100%);
                    border-top: 1px solid rgba(212, 175, 55, 0.3);
                    padding: 20px 32px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 24px;
                    z-index: 10000;
                    box-shadow: 0 -4px 24px rgba(0,0,0,0.3);
                    animation: slideUp 0.3s ease;
                }
                @keyframes slideUp {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                .consent-content {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }
                .consent-icon {
                    font-size: 2.5rem;
                }
                .consent-text h4 {
                    color: #d4af37;
                    margin-bottom: 4px;
                }
                .consent-text p {
                    color: #94a3b8;
                    font-size: 0.9rem;
                }
                .consent-text a {
                    color: #d4af37;
                }
                .consent-actions {
                    display: flex;
                    gap: 12px;
                }
                .consent-actions button {
                    padding: 10px 24px;
                    border: none;
                    border-radius: 8px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s;
                    font-family: inherit;
                }
                .btn-consent-accept {
                    background: linear-gradient(135deg, #d4af37, #b8962e);
                    color: #0a0f1a;
                }
                .btn-consent-reject {
                    background: rgba(255,255,255,0.1);
                    color: #fff;
                    border: 1px solid rgba(255,255,255,0.2);
                }
                .btn-consent-settings {
                    background: transparent;
                    color: #94a3b8;
                }
                .consent-actions button:hover {
                    transform: translateY(-2px);
                }
                @media (max-width: 768px) {
                    .consent-banner {
                        flex-direction: column;
                        text-align: center;
                    }
                    .consent-content {
                        flex-direction: column;
                    }
                }
            `;
            
            document.head.appendChild(style);
            document.body.appendChild(banner);
        },

        accept() {
            Cookies.setConsent(true);
            Cookies.set('analytics', true);
            Cookies.set('marketing', true);
            Cookies.set('functional', true);
            document.getElementById('consent-banner')?.remove();
            Analytics.track('consent_accepted');
        },

        reject() {
            Cookies.setConsent(false);
            document.getElementById('consent-banner')?.remove();
            Analytics.track('consent_rejected');
        },

        showSettings() {
            // عرض نافذة إعدادات الكوكيز المتقدمة
            const modal = document.createElement('div');
            modal.id = 'consent-settings-modal';
            modal.innerHTML = `
                <div class="consent-modal-overlay">
                    <div class="consent-modal">
                        <h3>إعدادات الخصوصية</h3>
                        <div class="consent-option">
                            <label>
                                <input type="checkbox" checked disabled>
                                <span>ملفات تعريف الارتباط الضرورية</span>
                            </label>
                            <small>مطلوبة لعمل الموقع</small>
                        </div>
                        <div class="consent-option">
                            <label>
                                <input type="checkbox" id="analytics-consent" checked>
                                <span>ملفات التحليلات</span>
                            </label>
                            <small>تساعدنا على فهم كيفية استخدام الموقع</small>
                        </div>
                        <div class="consent-option">
                            <label>
                                <input type="checkbox" id="marketing-consent">
                                <span>ملفات التسويق</span>
                            </label>
                            <small>تستخدم لعرض إعلانات مخصصة</small>
                        </div>
                        <div class="consent-modal-actions">
                            <button onclick="SheikhaCore.ConsentBanner.saveSettings()">حفظ الإعدادات</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        },

        saveSettings() {
            Cookies.setConsent(true);
            Cookies.set('analytics', document.getElementById('analytics-consent')?.checked);
            Cookies.set('marketing', document.getElementById('marketing-consent')?.checked);
            document.getElementById('consent-settings-modal')?.remove();
            document.getElementById('consent-banner')?.remove();
        }
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // التهيئة الأولية
    // ═══════════════════════════════════════════════════════════════════════════
    function init() {
        // التحقق من DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', onReady);
        } else {
            onReady();
        }
    }

    function onReady() {
        // تهيئة التحكم بالصفحات
        PageController.init();
        
        // تهيئة التحليلات
        Analytics.init();
        
        // عرض بانر الموافقة
        ConsentBanner.show();
        
        // تتبع زيارات الصفحات
        trackPageVisit();
        
        console.log('🏛️ منظومة شيخة الأساسية - تم التهيئة بنجاح');
    }

    function trackPageVisit() {
        const visits = JSON.parse(localStorage.getItem('sheikha_page_visits') || '{}');
        const path = window.location.pathname;
        visits[path] = (visits[path] || 0) + 1;
        localStorage.setItem('sheikha_page_visits', JSON.stringify(visits));
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // API العام
    // ═══════════════════════════════════════════════════════════════════════════
    return {
        init,
        Auth,
        Cookies,
        Analytics,
        PageController,
        DataIntelligence,
        Integrations,
        ConsentBanner,
        AUTH_PROVIDERS,
        PAGES,
        CONFIG
    };
})();

// تشغيل تلقائي
SheikhaCore.init();

// تصدير للاستخدام العام
window.SheikhaCore = SheikhaCore;
