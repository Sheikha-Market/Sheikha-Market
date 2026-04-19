/**
 * ════════════════════════════════════════════════════════════════════════════
 * ☪️ بسم الله الرحمن الرحيم
 * ════════════════════════════════════════════════════════════════════════════
 * SHEIKHA HAY ENGINE — محرك شيخة الحي الحي
 * نظام الحي الذكي: حي · حية · تنبض بالحياة · تعقل · تتفكر
 *
 * "وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ" — الأنبياء ٣٠
 * "أَوَمَن كَانَ مَيْتًا فَأَحْيَيْنَاهُ وَجَعَلْنَا لَهُ نُورًا يَمْشِي بِهِ فِي النَّاسِ" — الأنعام ١٢٢
 * "إِنَّ فِي خَلْقِ السَّمَاوَاتِ وَالْأَرْضِ وَاخْتِلَافِ اللَّيْلِ وَالنَّهَارِ لَآيَاتٍ لِّأُولِي الْأَلْبَابِ" — آل عمران ١٩٠
 *
 * المفهوم:
 *  ① الحي الحي   — نظام حي ينبض بالنشاط اللحظي
 *  ② تعقل        — ذكاء اصطناعي يحلل ويفهم احتياجات الحي
 *  ③ تتفكر       — تأمل عميق في البيانات لاستخراج الحكمة
 *  ④ تنبض        — دقات حية تعكس نشاط السوق والمجتمع
 *  ⑤ تربط        — توصيل البائعين والمشترين وأصحاب الخدمات
 * ════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const EventEmitter = require('events');
const crypto = require('crypto');

// ─── هوية المحرك ─────────────────────────────────────────────────────────────
const HAY_IDENTITY = {
    name:       'Sheikha Hay Engine',
    nameAr:     'محرك شيخة الحي الحي',
    version:    '1.0.0',
    slogan:     'حي وتنبض بالحياة وتعقل وتتفكر',
    mission:    'تفعيل الحي الذكي المتكامل — ربط أصحاب المحلات والسكان والخدمات في منظومة حية واحدة',
    verses: [
        { ref: 'الأنبياء:٣٠',   text: 'وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ' },
        { ref: 'الأنعام:١٢٢',  text: 'أَوَمَن كَانَ مَيْتًا فَأَحْيَيْنَاهُ وَجَعَلْنَا لَهُ نُورًا يَمْشِي بِهِ فِي النَّاسِ' },
        { ref: 'آل عمران:١٩٠', text: 'إِنَّ فِي خَلْقِ السَّمَاوَاتِ وَالْأَرْضِ وَاخْتِلَافِ اللَّيْلِ وَالنَّهَارِ لَآيَاتٍ لِّأُولِي الْأَلْبَابِ' },
        { ref: 'البقرة:٢٦٧',   text: 'يَا أَيُّهَا الَّذِينَ آمَنُوا أَنفِقُوا مِن طَيِّبَاتِ مَا كَسَبْتُمْ' },
        { ref: 'الحجرات:١٣',   text: 'يَا أَيُّهَا النَّاسُ إِنَّا خَلَقْنَاكُم مِّن ذَكَرٍ وَأُنثَىٰ وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا' },
    ],
    hadiths: [
        { text: 'المؤمن للمؤمن كالبنيان يشد بعضه بعضاً', narrator: 'متفق عليه', topic: 'التعاضد في الحي' },
        { text: 'خير الناس أنفعهم للناس', narrator: 'حسن', topic: 'خدمة أهل الحي' },
        { text: 'من كان في حاجة أخيه كان الله في حاجته', narrator: 'متفق عليه', topic: 'التكافل المجتمعي' },
        { text: 'لا يؤمن أحدكم حتى يحب لأخيه ما يحب لنفسه', narrator: 'متفق عليه', topic: 'المحبة في الحي' },
    ],
};

// ─── أنواع المحلات والخدمات في الحي ─────────────────────────────────────────
const HAY_SHOP_TYPES = [
    { id: 'GROCERY',       nameAr: 'بقالة / سوبرماركت',   nameEn: 'Grocery',       icon: '🛒', category: 'غذاء' },
    { id: 'BAKERY',        nameAr: 'مخبز',                 nameEn: 'Bakery',         icon: '🍞', category: 'غذاء' },
    { id: 'BUTCHER',       nameAr: 'ملحمة',                nameEn: 'Butcher',        icon: '🥩', category: 'غذاء' },
    { id: 'PHARMACY',      nameAr: 'صيدلية',               nameEn: 'Pharmacy',       icon: '💊', category: 'صحة' },
    { id: 'CLINIC',        nameAr: 'عيادة',                nameEn: 'Clinic',         icon: '🏥', category: 'صحة' },
    { id: 'ELECTRONICS',   nameAr: 'محل إلكترونيات',      nameEn: 'Electronics',    icon: '📱', category: 'تقنية' },
    { id: 'CLOTHING',      nameAr: 'محل ملابس',            nameEn: 'Clothing',       icon: '👔', category: 'أزياء' },
    { id: 'RESTAURANT',    nameAr: 'مطعم',                 nameEn: 'Restaurant',     icon: '🍽️', category: 'غذاء' },
    { id: 'COFFEE',        nameAr: 'مقهى',                 nameEn: 'Café',           icon: '☕', category: 'غذاء' },
    { id: 'STATIONERY',    nameAr: 'قرطاسية',              nameEn: 'Stationery',     icon: '✏️', category: 'تعليم' },
    { id: 'BARBERSHOP',    nameAr: 'صالون حلاقة',          nameEn: 'Barbershop',     icon: '💈', category: 'خدمات' },
    { id: 'LAUNDRY',       nameAr: 'مغسلة',                nameEn: 'Laundry',        icon: '👕', category: 'خدمات' },
    { id: 'HARDWARE',      nameAr: 'أدوات بناء',           nameEn: 'Hardware',       icon: '🔧', category: 'بناء' },
    { id: 'GOLD_JEWELRY',  nameAr: 'صاغة / مجوهرات',      nameEn: 'Jewelry',        icon: '💍', category: 'مجوهرات' },
    { id: 'BOOKSTORE',     nameAr: 'مكتبة',                nameEn: 'Bookstore',      icon: '📚', category: 'تعليم' },
    { id: 'MOSQUE_SUPPLY', nameAr: 'محل مستلزمات دينية',  nameEn: 'Islamic Supply', icon: '🕌', category: 'ديني' },
    { id: 'FRUITS_VEG',    nameAr: 'خضار وفاكهة',          nameEn: 'Fruits & Veg',   icon: '🥦', category: 'غذاء' },
    { id: 'AUTO_REPAIR',   nameAr: 'ورشة سيارات',          nameEn: 'Auto Repair',    icon: '🚗', category: 'خدمات' },
    { id: 'REAL_ESTATE',   nameAr: 'مكتب عقارات',          nameEn: 'Real Estate',    icon: '🏠', category: 'عقارات' },
    { id: 'OTHER',         nameAr: 'أخرى',                 nameEn: 'Other',          icon: '🏪', category: 'أخرى' },
];

// ─── طبقات الحي الحي ─────────────────────────────────────────────────────────
const HAY_LAYERS = [
    { id: 'L1_PULSE',      nameAr: 'طبقة النبض اللحظي',    nameEn: 'Live Pulse Layer',       desc: 'رصد النشاط في الوقت الفعلي' },
    { id: 'L2_THINK',      nameAr: 'طبقة التفكير',         nameEn: 'Thinking Layer',          desc: 'تحليل البيانات واستخراج الأنماط' },
    { id: 'L3_CONTEMPLATE',nameAr: 'طبقة التأمل',          nameEn: 'Contemplation Layer',     desc: 'التأمل العميق في احتياجات الحي' },
    { id: 'L4_CONNECT',    nameAr: 'طبقة الربط',           nameEn: 'Connection Layer',        desc: 'ربط البائعين والمشترين والخدمات' },
    { id: 'L5_HEAL',       nameAr: 'طبقة الإصلاح الذاتي', nameEn: 'Self-Healing Layer',      desc: 'معالجة الاختلالات وتصحيح المسار' },
];

// ─── مؤشرات النبض ────────────────────────────────────────────────────────────
const PULSE_INDICATORS = [
    { key: 'activeShops',      nameAr: 'محلات نشطة',        unit: 'محل' },
    { key: 'liveTransactions', nameAr: 'معاملات حية',        unit: 'معاملة/دقيقة' },
    { key: 'visitorsOnline',   nameAr: 'زوار متصلون',        unit: 'شخص' },
    { key: 'openRequests',     nameAr: 'طلبات مفتوحة',       unit: 'طلب' },
    { key: 'fulfilledToday',   nameAr: 'طلبات مُنجزة اليوم', unit: 'طلب' },
    { key: 'alertsActive',     nameAr: 'تنبيهات نشطة',       unit: 'تنبيه' },
    { key: 'hayHealthScore',   nameAr: 'مؤشر صحة الحي',      unit: '%' },
    { key: 'communityScore',   nameAr: 'مؤشر التكافل',       unit: 'نقطة' },
];

// ─── محرك شيخة الحي ──────────────────────────────────────────────────────────

class SheikhaHayEngine extends EventEmitter {
    constructor(opts = {}) {
        super();

        this.identity   = HAY_IDENTITY;
        this.version    = HAY_IDENTITY.version;
        this.nameAr     = HAY_IDENTITY.nameAr;
        this.activatedAt = new Date().toISOString();
        this.isAlive    = true;  // حية

        // ── حالة الحي ─────────────────────────────────────────────────────
        this._state = {
            pulse: {
                heartbeat:         0,
                lastBeat:          null,
                bpm:               0,           // دقات في الدقيقة
                rhythm:            'steady',     // steady | fast | slow
            },
            stats: {
                activeShops:       0,
                liveTransactions:  0,
                visitorsOnline:    0,
                openRequests:      0,
                fulfilledToday:    0,
                alertsActive:      0,
                hayHealthScore:    100,
                communityScore:    100,
            },
            shops: new Map(),          // مخزن المحلات المسجّلة
            activities: [],            // سجل الأنشطة
            thoughts: [],              // أفكار المحرك (نتائج التحليل)
            contemplations: [],        // تأملات المحرك (استنتاجات عميقة)
            alerts: [],                // تنبيهات نشطة
        };

        // ── محرك دقات القلب ──────────────────────────────────────────────
        this._beatInterval  = null;
        this._thinkInterval = null;

        this._startHeartbeat();
        this._startThinking();

        console.log(`✅ [HayEngine v${this.version}] ${this.nameAr} — حي وتنبض بالحياة`);
    }

    // ════════════════════════════════════════════════════════════════════
    // ① النبض — Heartbeat (الحياة اللحظية)
    // ════════════════════════════════════════════════════════════════════

    _startHeartbeat() {
        const BEAT_MS = 5_000;  // كل ٥ ثوانٍ

        this._beatInterval = setInterval(() => {
            const now = Date.now();
            this._state.pulse.heartbeat++;
            this._state.pulse.lastBeat = new Date().toISOString();
            this._state.pulse.bpm      = Math.round(60_000 / BEAT_MS);

            // تحديث لحظي للإحصاءات
            this._updateLiveStats();

            // بث حدث النبض
            this.emit('pulse', {
                beat:      this._state.pulse.heartbeat,
                timestamp: this._state.pulse.lastBeat,
                stats:     { ...this._state.stats },
            });
        }, BEAT_MS);

        if (this._beatInterval.unref) this._beatInterval.unref();
    }

    _updateLiveStats() {
        const s = this._state.stats;

        // حساب نقاط صحة الحي
        const shopCount    = this._state.shops.size;
        const baseHealth   = shopCount > 0 ? Math.min(100, 60 + shopCount * 2) : 60;
        s.hayHealthScore   = baseHealth;

        // مؤشر التكافل
        s.communityScore   = Math.min(100, 50 + this._state.activities.length * 5);

        // إيقاع النبض
        if (s.liveTransactions > 10) {
            this._state.pulse.rhythm = 'fast';
        } else if (s.liveTransactions > 0) {
            this._state.pulse.rhythm = 'steady';
        } else {
            this._state.pulse.rhythm = 'slow';
        }
    }

    // ════════════════════════════════════════════════════════════════════
    // ② التفكير — Thinking (التحليل الذكي)
    // ════════════════════════════════════════════════════════════════════

    _startThinking() {
        const THINK_MS = 30_000;  // كل ٣٠ ثانية

        this._thinkInterval = setInterval(() => {
            const thought = this._think();
            if (thought) {
                this._state.thoughts.unshift(thought);
                if (this._state.thoughts.length > 50) {
                    this._state.thoughts = this._state.thoughts.slice(0, 50);
                }
                this.emit('thought', thought);
            }

            // تأمل كل ٣ دورات تفكير
            if (this._state.pulse.heartbeat % 18 === 0) {
                const contemplation = this._contemplate();
                if (contemplation) {
                    this._state.contemplations.unshift(contemplation);
                    if (this._state.contemplations.length > 20) {
                        this._state.contemplations = this._state.contemplations.slice(0, 20);
                    }
                    this.emit('contemplation', contemplation);
                }
            }
        }, THINK_MS);

        if (this._thinkInterval.unref) this._thinkInterval.unref();
    }

    _think() {
        const stats  = this._state.stats;
        const shops  = this._state.shops.size;
        const now    = new Date().toISOString();

        const insights = [];

        if (shops === 0) {
            insights.push('الحي في طور التأسيس — انتظار تسجيل أول محل');
        } else if (shops < 5) {
            insights.push(`${shops} محلات مسجّلة — الحي في مرحلة النمو المبكر`);
        } else if (shops < 20) {
            insights.push(`${shops} محلات — الحي يكتسب حيويته وينبض بالنشاط`);
        } else {
            insights.push(`${shops} محلات — حي مزدهر ونابض بالحياة`);
        }

        if (stats.openRequests > 5) {
            insights.push(`${stats.openRequests} طلبات مفتوحة تحتاج انتباهاً — فرصة تجارية`);
        }

        if (stats.hayHealthScore < 70) {
            insights.push('مؤشر صحة الحي منخفض — يُنصح بمزيد من التفعيل والتسجيل');
        }

        const randomVerse = this.identity.verses[Math.floor(Math.random() * this.identity.verses.length)];

        return {
            id:        crypto.randomUUID ? crypto.randomUUID() : `thought-${Date.now()}`,
            timestamp: now,
            type:      'analysis',
            insights,
            verse:     randomVerse,
            healthScore: stats.hayHealthScore,
        };
    }

    _contemplate() {
        const hadith  = this.identity.hadiths[Math.floor(Math.random() * this.identity.hadiths.length)];
        const shops   = this._state.shops.size;
        const activities = this._state.activities.length;

        const wisdoms = [
            'الحي الصالح يبني مجتمعاً صالحاً — كل محل يُفتح بنية نافعة يُعلي البنيان',
            'التجارة العادلة في الحي تُقوي الثقة وتُديم الرزق بإذن الله',
            'الربط بين أصحاب الحاجة وأصحاب البضاعة هو جوهر سوق شيخة',
            'الحي المتكافل لا يُعدم فيه محتاج ولا يُحتقر فيه بائع',
            'كل نبضة في هذا النظام تعكس حركة السوق وحياة الناس',
            'العقل الذي يُدير الحي يستمد مبادئه من الكتاب والسنة',
            'النظام الحي يتعلم من كل تفاعل ويتطور نحو الأفضل',
        ];

        return {
            id:          crypto.randomUUID ? crypto.randomUUID() : `contemplate-${Date.now()}`,
            timestamp:   new Date().toISOString(),
            type:        'wisdom',
            wisdom:      wisdoms[Math.floor(Math.random() * wisdoms.length)],
            hadith,
            context: {
                shopsRegistered: shops,
                activitiesLogged: activities,
            },
        };
    }

    // ════════════════════════════════════════════════════════════════════
    // ③ إدارة المحلات — Shop Management
    // ════════════════════════════════════════════════════════════════════

    registerShop(shopData = {}) {
        const { name, type = 'OTHER', owner, phone, address, description } = shopData;

        if (!name) {
            return { success: false, message: 'اسم المحل مطلوب' };
        }

        const shopType = HAY_SHOP_TYPES.find(t => t.id === type) || HAY_SHOP_TYPES.find(t => t.id === 'OTHER');
        const shopId   = `SHOP-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

        const shop = {
            id:           shopId,
            name,
            type:         shopType.id,
            typeNameAr:   shopType.nameAr,
            icon:         shopType.icon,
            category:     shopType.category,
            owner:        owner || 'غير محدد',
            phone:        phone || null,
            address:      address || 'الحي',
            description:  description || '',
            isOpen:       true,
            rating:       5.0,
            reviewCount:  0,
            joinedAt:     new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            transactions: 0,
        };

        this._state.shops.set(shopId, shop);
        this._state.stats.activeShops = this._state.shops.size;

        this._logActivity({
            type:    'SHOP_REGISTERED',
            nameAr:  `انضم ${name} إلى الحي`,
            shopId,
        });

        this.emit('shopRegistered', shop);

        return { success: true, message: `✅ ${name} انضم إلى الحي بنجاح`, shop };
    }

    getShop(shopId) {
        const shop = this._state.shops.get(shopId);
        if (!shop) return { success: false, message: 'المحل غير موجود' };
        return { success: true, shop };
    }

    listShops(opts = {}) {
        const { category, type, isOpen, limit = 50 } = opts;
        let shops = Array.from(this._state.shops.values());

        if (category) shops = shops.filter(s => s.category === category);
        if (type)     shops = shops.filter(s => s.type === type);
        if (isOpen !== undefined) shops = shops.filter(s => s.isOpen === isOpen);

        return {
            success: true,
            total:   shops.length,
            shops:   shops.slice(0, limit),
        };
    }

    updateShopStatus(shopId, isOpen) {
        const shop = this._state.shops.get(shopId);
        if (!shop) return { success: false, message: 'المحل غير موجود' };

        shop.isOpen       = isOpen;
        shop.lastActivity = new Date().toISOString();

        this._logActivity({
            type:   isOpen ? 'SHOP_OPENED' : 'SHOP_CLOSED',
            nameAr: `${shop.name} ${isOpen ? 'فتح أبوابه' : 'أغلق أبوابه'}`,
            shopId,
        });

        return { success: true, message: `تم تحديث حالة ${shop.name}`, shop };
    }

    // ════════════════════════════════════════════════════════════════════
    // ④ الطلبات — Requests (ربط المحتاج بصاحب البضاعة)
    // ════════════════════════════════════════════════════════════════════

    submitRequest(requestData = {}) {
        const { title, category, description, requester, contactPhone } = requestData;

        if (!title) return { success: false, message: 'عنوان الطلب مطلوب' };

        const requestId = `REQ-${Date.now()}`;
        const request   = {
            id:           requestId,
            title,
            category:     category || 'عام',
            description:  description || '',
            requester:    requester || 'زائر',
            contactPhone: contactPhone || null,
            status:       'open',
            createdAt:    new Date().toISOString(),
            responses:    0,
        };

        if (!this._state._requests) this._state._requests = new Map();
        this._state._requests.set(requestId, request);
        this._state.stats.openRequests = (this._state._requests?.size || 0);

        this._logActivity({
            type:   'REQUEST_SUBMITTED',
            nameAr: `طلب جديد: ${title}`,
            requestId,
        });

        this.emit('newRequest', request);

        return { success: true, message: 'تم تسجيل طلبك في الحي', request };
    }

    listRequests(opts = {}) {
        const { status, category, limit = 30 } = opts;
        if (!this._state._requests) return { success: true, total: 0, requests: [] };

        let requests = Array.from(this._state._requests.values());
        if (status)   requests = requests.filter(r => r.status === status);
        if (category) requests = requests.filter(r => r.category === category);

        return {
            success:  true,
            total:    requests.length,
            requests: requests.slice(0, limit),
        };
    }

    // ════════════════════════════════════════════════════════════════════
    // ⑤ التنبيهات — Alerts
    // ════════════════════════════════════════════════════════════════════

    addAlert(alertData = {}) {
        const { title, message, level = 'info', shopId } = alertData;

        const alert = {
            id:        `ALERT-${Date.now()}`,
            title:     title || 'تنبيه',
            message:   message || '',
            level,      // info | warning | critical
            shopId:    shopId || null,
            createdAt: new Date().toISOString(),
            read:      false,
        };

        this._state.alerts.unshift(alert);
        if (this._state.alerts.length > 100) {
            this._state.alerts = this._state.alerts.slice(0, 100);
        }
        this._state.stats.alertsActive = this._state.alerts.filter(a => !a.read).length;

        this.emit('alert', alert);

        return { success: true, alert };
    }

    // ════════════════════════════════════════════════════════════════════
    // ⑥ سجل الأنشطة — Activity Log
    // ════════════════════════════════════════════════════════════════════

    _logActivity(data = {}) {
        const activity = {
            id:        `ACT-${Date.now()}`,
            timestamp: new Date().toISOString(),
            ...data,
        };
        this._state.activities.unshift(activity);
        if (this._state.activities.length > 200) {
            this._state.activities = this._state.activities.slice(0, 200);
        }
    }

    getActivityLog(limit = 20) {
        return {
            success:    true,
            total:      this._state.activities.length,
            activities: this._state.activities.slice(0, limit),
        };
    }

    // ════════════════════════════════════════════════════════════════════
    // ⑦ لوحة القيادة — Dashboard
    // ════════════════════════════════════════════════════════════════════

    getDashboard() {
        return {
            identity:       this.identity,
            isAlive:        this.isAlive,
            activatedAt:    this.activatedAt,
            pulse:          { ...this._state.pulse },
            stats:          { ...this._state.stats },
            shopTypes:      HAY_SHOP_TYPES,
            layers:         HAY_LAYERS,
            pulseIndicators:PULSE_INDICATORS,
            latestThought:  this._state.thoughts[0] || null,
            latestContemplation: this._state.contemplations[0] || null,
            recentActivities: this._state.activities.slice(0, 10),
            activeAlerts:   this._state.alerts.filter(a => !a.read).slice(0, 5),
            summary: {
                totalShops:        this._state.shops.size,
                totalShopTypes:    HAY_SHOP_TYPES.length,
                totalLayers:       HAY_LAYERS.length,
                totalIndicators:   PULSE_INDICATORS.length,
                totalVerses:       this.identity.verses.length,
                totalHadiths:      this.identity.hadiths.length,
                hayHealthScore:    this._state.stats.hayHealthScore,
                communityScore:    this._state.stats.communityScore,
                totalThoughts:     this._state.thoughts.length,
                totalContemplations: this._state.contemplations.length,
            },
        };
    }

    getStatus() {
        return {
            name:        this.identity.name,
            nameAr:      this.nameAr,
            version:     this.version,
            isAlive:     this.isAlive,
            shops:       this._state.shops.size,
            healthScore: this._state.stats.hayHealthScore,
            pulse:       this._state.pulse.bpm,
            rhythm:      this._state.pulse.rhythm,
            apis:        12,
        };
    }

    // ════════════════════════════════════════════════════════════════════
    // ⑧ تسجيل المسارات — registerRoutes(app)
    // ════════════════════════════════════════════════════════════════════

    registerRoutes(app) {
        const base = '/api/hay';

        // ── GET /api/hay/status ─────────────────────────────────────────
        app.get(`${base}/status`, (req, res) => {
            res.json({
                success: true,
                message: 'شيخة الحي حية وتنبض بالحياة',
                ...this.getStatus(),
                timestamp: new Date().toISOString(),
            });
        });

        // ── GET /api/hay/dashboard ──────────────────────────────────────
        app.get(`${base}/dashboard`, (req, res) => {
            res.json({ success: true, data: this.getDashboard() });
        });

        // ── GET /api/hay/pulse ──────────────────────────────────────────
        app.get(`${base}/pulse`, (req, res) => {
            res.json({
                success:   true,
                nameAr:    'نبض شيخة الحي',
                pulse:     this._state.pulse,
                stats:     this._state.stats,
                indicators: PULSE_INDICATORS,
                timestamp: new Date().toISOString(),
            });
        });

        // ── GET /api/hay/thoughts ───────────────────────────────────────
        app.get(`${base}/thoughts`, (req, res) => {
            const limit = Math.min(parseInt(req.query.limit) || 10, 50);
            res.json({
                success:   true,
                nameAr:    'أفكار شيخة الحي',
                thoughts:  this._state.thoughts.slice(0, limit),
                total:     this._state.thoughts.length,
            });
        });

        // ── GET /api/hay/contemplations ─────────────────────────────────
        app.get(`${base}/contemplations`, (req, res) => {
            const limit = Math.min(parseInt(req.query.limit) || 10, 20);
            res.json({
                success:        true,
                nameAr:         'تأملات شيخة الحي',
                contemplations: this._state.contemplations.slice(0, limit),
                total:          this._state.contemplations.length,
            });
        });

        // ── GET /api/hay/shops ──────────────────────────────────────────
        app.get(`${base}/shops`, (req, res) => {
            const { category, type, isOpen, limit } = req.query;
            const isOpenBool = isOpen !== undefined ? isOpen === 'true' : undefined;
            res.json(this.listShops({
                category,
                type,
                isOpen: isOpenBool,
                limit:  limit ? parseInt(limit) : 50,
            }));
        });

        // ── GET /api/hay/shops/types ────────────────────────────────────
        app.get(`${base}/shops/types`, (req, res) => {
            res.json({ success: true, types: HAY_SHOP_TYPES });
        });

        // ── GET /api/hay/shops/:id ──────────────────────────────────────
        app.get(`${base}/shops/:id`, (req, res) => {
            res.json(this.getShop(req.params.id));
        });

        // ── POST /api/hay/shops/register ────────────────────────────────
        app.post(`${base}/shops/register`, (req, res) => {
            const result = this.registerShop(req.body || {});
            res.status(result.success ? 201 : 400).json(result);
        });

        // ── PATCH /api/hay/shops/:id/status ────────────────────────────
        app.patch(`${base}/shops/:id/status`, (req, res) => {
            const { isOpen } = req.body || {};
            if (typeof isOpen !== 'boolean') {
                return res.status(400).json({ success: false, message: 'يرجى إرسال isOpen: true أو false' });
            }
            res.json(this.updateShopStatus(req.params.id, isOpen));
        });

        // ── GET /api/hay/requests ───────────────────────────────────────
        app.get(`${base}/requests`, (req, res) => {
            const { status, category, limit } = req.query;
            res.json(this.listRequests({
                status,
                category,
                limit: limit ? parseInt(limit) : 30,
            }));
        });

        // ── POST /api/hay/requests ──────────────────────────────────────
        app.post(`${base}/requests`, (req, res) => {
            const result = this.submitRequest(req.body || {});
            res.status(result.success ? 201 : 400).json(result);
        });

        // ── GET /api/hay/alerts ─────────────────────────────────────────
        app.get(`${base}/alerts`, (req, res) => {
            const unread = this._state.alerts.filter(a => !a.read);
            res.json({
                success: true,
                total:   this._state.alerts.length,
                unread:  unread.length,
                alerts:  this._state.alerts.slice(0, 20),
            });
        });

        // ── POST /api/hay/alerts ────────────────────────────────────────
        app.post(`${base}/alerts`, (req, res) => {
            res.json(this.addAlert(req.body || {}));
        });

        // ── GET /api/hay/activity ───────────────────────────────────────
        app.get(`${base}/activity`, (req, res) => {
            const limit = Math.min(parseInt(req.query.limit) || 20, 100);
            res.json(this.getActivityLog(limit));
        });

        // ── GET /api/hay/identity ───────────────────────────────────────
        app.get(`${base}/identity`, (req, res) => {
            res.json({
                success:  true,
                identity: this.identity,
                layers:   HAY_LAYERS,
            });
        });

        console.log(`✅ [HayEngine] ١٣ مسار مسجّل على ${base}`);
    }

    // ────────────────────────────────────────────────────────────────────
    destroy() {
        if (this._beatInterval)  clearInterval(this._beatInterval);
        if (this._thinkInterval) clearInterval(this._thinkInterval);
        this.isAlive = false;
        this.removeAllListeners();
    }
}

module.exports = SheikhaHayEngine;
