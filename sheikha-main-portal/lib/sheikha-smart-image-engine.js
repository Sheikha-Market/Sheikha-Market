/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ﷽ — بسم الله الرحمن الرحيم
 *
 * SHEIKHA SMART IMAGE ENGINE — محرك الصور الذكي
 * أول منظومة ذكية لتحسين صور المنتجات في الخلفية
 *
 * المالك: سلمان أحمد بن سلمان الراجح
 * الدومين: sheikha.top
 *
 * المبدأ الشرعي: "إن الله جميل يحب الجمال" — رواه مسلم
 * "إن الله يحب إذا عمل أحدكم عملاً أن يتقنه" — رواه  الطبراني
 * ═══════════════════════════════════════════════════════════════════════════
 */

/* ═══════════════════════════════════════════════════════════════════════════
   الفصل الأول: قاعدة بيانات Unsplash للمعادن عالية الجودة
   ═══════════════════════════════════════════════════════════════════════════ */

const UNSPLASH_METALS_LIBRARY = {
    // ذهب — Gold (أصفر نقي براق)
    gold: [
        'photo-1610375461246-83df859d849d', // سبائك ذهب متراصة
        'photo-1610375461369-d613b564f6d7', // قطع ذهبية لامعة
        'photo-1518546305927-5a555bb7020d', // ذهب أصفر ثمين
        'photo-1524346169971-0e51cd87ba9e' // معدن ذهبي فاخر
    ],

    // نحاس — Copper (بُرونزي دافئ)
    copper: [
        'photo-1594844808180-bbc5db0f0001', // لفائف نحاسية صناعية
        'photo-1518531933037-91b2f5f229cc', // أنابيب نحاس لامعة
        'photo-1607344645866-009c320b63e0', // معدن نحاسي براق
        'photo-1611267254323-4db7b39c732c' // نحاس صناعي عالي الجودة
    ],

    // فضة — Silver (أبيض ناصع)
    silver: [
        'photo-1610375461369-d613b564f6d7', // عملات فضية نقية
        'photo-1563199697-8cc91b06484b', // معدن فضي لامع
        'photo-1617791160536-598cf32026fb', // فضة صناعية
        'photo-1534670007418-fbb7f6cf32c3' // معدن أبيض ناصع
    ],

    // فولاذ/حديد — Steel (رمادي قوي)
    steel: [
        'photo-1565883990511-95c7e27328ab', // فولاذ صناعي
        'photo-1511690656952-34342bb7c2f2', // حديد قوي
        'photo-1565950055830-c46a6ab41b1f', // معدن رمادي
        'photo-1591768793355-74d04bb6608f' // هيكل فولاذي
    ],

    // ألمنيوم — Aluminum (فضي خفيف)
    aluminum: [
        'photo-1617791160536-598cf32026fb', // ألمنيوم لامع
        'photo-1565950055830-c46a6ab41b1f', // معدن خفيف
        'photo-1527613426441-4da17471b66d', // سطح ألمنيوم
        'photo-1573935413347-bd64a249c784' // صفائح ألمنيوم
    ],

    // خامات — Ores (صخور طبيعية)
    ores: [
        'photo-1617268239912-ce0b2ba24395', // خام معدني
        'photo-1518531933037-91b2f5f229cc', // صخور طبيعية
        'photo-1611605698323-b1e99cfd37ea', // معادن خام
        'photo-1611267254323-4db7b39c732c' // حجر معدني
    ],

    // سكراب — Scrap (خردة معدنية)
    scrap: [
        'photo-1532187863486-abf9dbad1b69', // خردة معدنية
        'photo-1532187643603-ba119ca4109e', // سكراب صناعي
        'photo-1565883990511-95c7e27328ab', // معادن مُعاد تدويرها
        'photo-1591768793355-74d04bb6608f' // خردة ثقيلة
    ],

    // معادن نادرة — Rare Earth
    rare: [
        'photo-1635070041078-e363dbe005cb', // معادن نادرة
        'photo-1617791160536-598cf32026fb', // عناصر ثمينة
        'photo-1518531933037-91b2f5f229cc', // مواد نادرة
        'photo-1565950055830-c46a6ab41b1f' // معادن استراتيجية
    ],

    // تشليح — Salvage (قطع سيارات)
    salvage: [
        'photo-1520340356584-f9917d1eea6f', // قطع سيارات
        'photo-1542282088-fe8426682b8f', // محركات
        'photo-1449965408869-eaa3f722e40d', // إطارات
        'photo-1511919884226-fd3cad34687c' // هياكل معدنية
    ],

    // معادن ثمينة عامة — Precious
    precious: [
        'photo-1610375461246-83df859d849d', // معادن فاخرة
        'photo-1610375461369-d613b564f6d7', // ثمينة
        'photo-1518546305927-5a555bb7020d', // براقة
        'photo-1524346169971-0e51cd87ba9e' // لامعة
    ],

    // افتراضي — General
    general: [
        'photo-1565883990511-95c7e27328ab', // معدن عام
        'photo-1511690656952-34342bb7c2f2', // صناعي
        'photo-1565950055830-c46a6ab41b1f', // معدني
        'photo-1591768793355-74d04bb6608f' // صلب
    ]
};

const IMAGE_PROFILES = {
    standard: {
        width: 1600,
        height: 1200,
        fit: 'crop',
        quality: 92,
        auto: 'format,compress',
        sat: 8,
        con: 6,
        sharp: 12
    },
    'ultra-market': {
        width: 2200,
        height: 1460,
        fit: 'crop',
        quality: 94,
        auto: 'format,compress',
        sat: 10,
        con: 8,
        sharp: 16
    },
    thumbnail: {
        width: 720,
        height: 540,
        fit: 'crop',
        quality: 86,
        auto: 'format,compress',
        sat: 7,
        con: 6,
        sharp: 10
    }
};

/* ═══════════════════════════════════════════════════════════════════════════
   الفصل الثاني: المحرك الذكي — Smart Resolution Engine
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * يحدد أفضل صورة Unsplash بناءً على فئة المنتج واسمه
 * @param {Object} product - بيانات المنتج
 * @returns {string} - URL صورة Unsplash بدقة 1600×1200
 */
function resolveSmartPhotoId(product) {
    if (!product) return UNSPLASH_METALS_LIBRARY.general[0];

    const category = String(product.cat || 'general').toLowerCase();
    const name = String(product.name || '').toLowerCase();

    // منطق ذكي: حدد الفئة بناءً على الاسم إذا لم تكن الفئة واضحة
    let bestCategory = category;

    if (name.includes('ذهب') || name.includes('gold')) bestCategory = 'gold';
    else if (name.includes('نحاس') || name.includes('copper')) bestCategory = 'copper';
    else if (name.includes('فضة') || name.includes('silver')) bestCategory = 'silver';
    else if (name.includes('فولاذ') || name.includes('حديد') || name.includes('steel'))
        bestCategory = 'steel';
    else if (name.includes('ألمنيوم') || name.includes('aluminum')) bestCategory = 'aluminum';
    else if (name.includes('خام') || name.includes('ore')) bestCategory = 'ores';
    else if (name.includes('سكراب') || name.includes('خردة') || name.includes('scrap'))
        bestCategory = 'scrap';
    else if (name.includes('تشليح') || name.includes('سيارة') || name.includes('محرك'))
        bestCategory = 'salvage';

    // احصل على مجموعة الصور للفئة
    const imagePool = UNSPLASH_METALS_LIBRARY[bestCategory] || UNSPLASH_METALS_LIBRARY.general;

    // اختر صورة بناءً على معرّف المنتج (حتى نحصل على نفس الصورة دائماً لنفس المنتج)
    const productId = product.id || 0;
    const imageIndex = productId % imagePool.length;
    const photoId = imagePool[imageIndex];

    return photoId;
}

function resolveSmartUnsplashImage(product, options = {}) {
    if (!product) return getDefaultUnsplashImage();

    const profileName = String(options.profile || 'standard');
    const profile = IMAGE_PROFILES[profileName] || IMAGE_PROFILES.standard;
    const photoId = resolveSmartPhotoId(product);

    return buildUnsplashUrl(photoId, profile);
}

/**
 * بناء URL صورة Unsplash بمعاملات محسّنة
 */
function buildUnsplashUrl(photoId, options = {}) {
    const defaults = {
        width: 1600,
        height: 1200,
        fit: 'crop',
        quality: 92,
        auto: 'format,compress',
        sat: 8,
        con: 6,
        sharp: 12
    };

    const opts = { ...defaults, ...options };
    const params = new URLSearchParams({
        w: opts.width,
        h: opts.height,
        fit: opts.fit,
        q: opts.quality,
        auto: opts.auto,
        sat: opts.sat,
        con: opts.con,
        sharp: opts.sharp
    });

    if (opts.fm) params.set('fm', opts.fm);

    return `https://images.unsplash.com/${photoId}?${params.toString()}`;
}

/**
 * صورة افتراضية عند عدم التوفر
 */
function getDefaultUnsplashImage() {
    const defaultId = 'photo-1565883990511-95c7e27328ab'; // معدن صناعي عام
    return buildUnsplashUrl(defaultId, IMAGE_PROFILES.standard);
}

/* ═══════════════════════════════════════════════════════════════════════════
   الفصل الثالث: نظام التخزين المؤقت الذكي — Smart Cache
   ═══════════════════════════════════════════════════════════════════════════ */

const CACHE_KEY = 'sheikha_smart_images_cache_v1';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 أيام

/**
 * حفظ الصورة في ذاكرة التخزين المؤقت
 */
function getImageCacheKey(productId, profileName) {
    return `${String(productId)}::${String(profileName || 'standard')}`;
}

function cacheProductImage(productId, imageUrl, profileName = 'standard') {
    try {
        const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
        const cacheKey = getImageCacheKey(productId, profileName);
        cache[cacheKey] = {
            url: imageUrl,
            timestamp: Date.now()
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (e) {
        console.warn('[Sheikha Cache] تعذر حفظ الصورة:', e);
    }
}

/**
 * استرجاع صورة من الذاكرة المؤقتة
 */
function getCachedProductImage(productId, profileName = 'standard') {
    try {
        const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
        const cacheKey = getImageCacheKey(productId, profileName);
        const entry = cache[cacheKey];

        if (!entry) return null;

        // تحقق من صلاحية التخزين المؤقت
        const isExpired = Date.now() - entry.timestamp > CACHE_DURATION;
        if (isExpired) {
            delete cache[cacheKey];
            localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
            return null;
        }

        return entry.url;
    } catch (e) {
        return null;
    }
}

/**
 * مسح الذاكرة المؤقتة القديمة
 */
function cleanExpiredCache() {
    try {
        const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
        const now = Date.now();
        let cleaned = 0;

        Object.keys(cache).forEach(productId => {
            if (now - cache[productId].timestamp > CACHE_DURATION) {
                delete cache[productId];
                cleaned++;
            }
        });

        if (cleaned > 0) {
            localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
            console.log(`[Sheikha Cache] تم تنظيف ${cleaned} صورة منتهية الصلاحية`);
        }
    } catch (e) {
        console.warn('[Sheikha Cache] فشل التنظيف:', e);
    }
}

/* ═══════════════════════════════════════════════════════════════════════════
   الفصل الرابع: واجهة برمجية عامة — Public API
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * الدالة الرئيسية: احصل على أفضل صورة لمنتج
 * @param {Object} product - بيانات المنتج
 * @returns {string} - URL الصورة النهائي
 */
function getSmartProductImage(product, options = {}) {
    if (!product || !product.id) return getDefaultUnsplashImage();

    const profileName = String(options.profile || 'standard');

    // 1. تحقق من الذاكرة المؤقتة أولاً
    const cached = getCachedProductImage(product.id, profileName);
    if (cached) return cached;

    // 2. احسب الصورة الذكية
    const imageUrl = resolveSmartUnsplashImage(product, { profile: profileName });

    // 3. احفظها في الذاكرة المؤقتة
    cacheProductImage(product.id, imageUrl, profileName);

    return imageUrl;
}

function getSmartProductSources(product, options = {}) {
    if (!product) {
        return {
            avif: getDefaultUnsplashImage(),
            webp: getDefaultUnsplashImage(),
            jpg: getDefaultUnsplashImage()
        };
    }

    const profileName = String(options.profile || 'ultra-market');
    const profile = IMAGE_PROFILES[profileName] || IMAGE_PROFILES['ultra-market'];
    const photoId = resolveSmartPhotoId(product);

    return {
        avif: buildUnsplashUrl(photoId, { ...profile, fm: 'avif' }),
        webp: buildUnsplashUrl(photoId, { ...profile, fm: 'webp' }),
        jpg: buildUnsplashUrl(photoId, { ...profile, fm: 'jpg' })
    };
}

/**
 * معالجة دفعة منتجات (للخلفية)
 * @param {Array} products - قائمة المنتجات
 * @returns {Object} - خريطة { productId: imageUrl }
 */
function processProductsBatch(products) {
    if (!Array.isArray(products)) return {};

    const results = {};

    products.forEach(product => {
        if (product && product.id) {
            results[product.id] = getSmartProductImage(product);
        }
    });

    return results;
}

/**
 * تشغيل المحرك في الخلفية (يُنفذ عند تحميل الصفحة)
 */
function initSmartImageEngine(products) {
    console.log('[Sheikha Smart Engine] بدء التشغيل...');

    // نظف الذاكرة المؤقتة
    cleanExpiredCache();

    // معالجة جميع المنتجات
    const imageMap = processProductsBatch(products);

    console.log(`[Sheikha Smart Engine] تمت معالجة ${Object.keys(imageMap).length} منتج`);

    return imageMap;
}

/* ═══════════════════════════════════════════════════════════════════════════
   الفصل الخامس: تصدير للاستخدام العالمي
   ═══════════════════════════════════════════════════════════════════════════ */

// جعل الدوال متاحة عالمياً
if (typeof window !== 'undefined') {
    window.SheikhaSArtEngine = {
        getSmartProductImage,
        getSmartProductSources,
        processProductsBatch,
        initSmartImageEngine,
        resolveSmartUnsplashImage,
        getCachedProductImage,
        cleanExpiredCache,
        UNSPLASH_METALS_LIBRARY
    };

    console.log('✅ [Sheikha Smart Image Engine] جاهز للعمل');
}

// تصدير Node.js (إذا لزم الأمر)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getSmartProductImage,
        getSmartProductSources,
        processProductsBatch,
        initSmartImageEngine,
        resolveSmartUnsplashImage
    };
}
