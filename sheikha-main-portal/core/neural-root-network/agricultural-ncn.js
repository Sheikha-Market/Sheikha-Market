// بسم الله الرحمن الرحيم
/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  AGRICULTURAL NEURAL CELL NETWORK (AgNCN)                                  ║
 * ║  شبكة الخلايا الجذرية العصبية الزراعية — مرقّمة بالكتاب والسنة             ║
 * ║  الجنة من المزارع والأرض الزراعية — رقمنة دورة الحياة من البذرة للثمرة     ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * "أَفَرَأَيْتُم مَّا تَحْرُثُونَ — أَأَنتُمْ تَزْرَعُونَهُ أَمْ نَحْنُ الزَّارِعُونَ" — الواقعة:63-64
 *
 * دورة الحياة الزراعية الرقمية (12 خلية):
 *   1.  البذرة    — الواقعة:63    — خلية البذر والغرس          (Seed)
 *   2.  الجذور    — إبراهيم:24   — خلية التأسيس والثبات       (Root)
 *   3.  السقي     — الأنبياء:30  — خلية التغذية والرعاية      (Irrigation)
 *   4.  النمو     — النحل:11     — خلية الازدهار والنشأة       (Growth)
 *   5.  الفروع    — إبراهيم:24   — خلية التفرع والانتشار      (Branch)
 *   6.  الأزهار   — الرحمن:12    — خلية الإزهار والجمال       (Flower)
 *   7.  الثمار    — إبراهيم:25   — خلية الثمر والعطاء          (Fruit)
 *   8.  الحصاد    — الأنعام:141  — خلية جني الثمار وقطفها     (Harvest)
 *   9.  التذوق    — الحج:28      — خلية تجربة العميل والطعم    (Taste)
 *   10. التجارة   — البقرة:275   — خلية البيع في السوق         (Trade)
 *   11. إحياء     — ق:11         — خلية إحياء الأرض الميتة    (Revival)
 *   12. الأنهار   — البقرة:22    — خلية المروج والأنهار الرقمية (River)
 *
 * المالك: منظومة سوق شيخة™
 */

'use strict';

// ─── تعريف الخلايا الزراعية الاثنتي عشرة ─────────────────────────────────────

const AGRICULTURAL_CELLS = [
    {
        id: 'ag-seed',
        number: 1,
        nameAr: 'خلية البذرة',
        nameEn: 'Seed Cell',
        stage: 'بذر',
        stageEn: 'seeding',
        ayah: 'أَفَرَأَيْتُم مَّا تَحْرُثُونَ — الواقعة:63',
        description: 'بداية دورة الحياة — إنشاء قائمة المنتج أو الفكرة الأولى',
        marketState: 'draft',
        weight: 1.0,
        triggers: ['product.created', 'listing.draft', 'idea.submitted'],
    },
    {
        id: 'ag-root',
        number: 2,
        nameAr: 'خلية الجذور',
        nameEn: 'Root Cell',
        stage: 'تجذّر',
        stageEn: 'rooting',
        ayah: 'كَشَجَرَةٍ طَيِّبَةٍ أَصْلُهَا ثَابِتٌ وَفَرْعُهَا فِي السَّمَاءِ — إبراهيم:24',
        description: 'التأسيس والثبات — التحقق من بيانات المورد وتفعيل حسابه',
        marketState: 'verified',
        weight: 1.2,
        triggers: ['supplier.verified', 'account.activated', 'profile.complete'],
    },
    {
        id: 'ag-irrigation',
        number: 3,
        nameAr: 'خلية السقي والتغذية',
        nameEn: 'Irrigation Cell',
        stage: 'سقي',
        stageEn: 'irrigation',
        ayah: 'وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ — الأنبياء:30',
        description: 'تغذية المنظومة بالبيانات — تحليلات السوق والتسعير والطلب',
        marketState: 'data-fed',
        weight: 1.0,
        triggers: ['analytics.updated', 'price.refreshed', 'demand.signal'],
    },
    {
        id: 'ag-growth',
        number: 4,
        nameAr: 'خلية النمو',
        nameEn: 'Growth Cell',
        stage: 'نمو',
        stageEn: 'growth',
        ayah: 'يُنبِتُ لَكُم بِهِ الزَّرْعَ وَالزَّيْتُونَ — النحل:11',
        description: 'الازدهار والانتشار — ظهور المنتج في نتائج البحث والتصنيفات',
        marketState: 'active',
        weight: 1.0,
        triggers: ['product.published', 'listing.active', 'visibility.increased'],
    },
    {
        id: 'ag-branch',
        number: 5,
        nameAr: 'خلية الفروع والتفرعات',
        nameEn: 'Branch Cell',
        stage: 'تفرّع',
        stageEn: 'branching',
        ayah: 'وَفَرْعُهَا فِي السَّمَاءِ تُؤْتِي أُكُلَهَا كُلَّ حِينٍ — إبراهيم:24-25',
        description: 'التوسع والتنويع — تصنيفات فرعية وتوزيع جغرافي وشبكة موردين',
        marketState: 'expanded',
        weight: 0.9,
        triggers: ['category.added', 'region.expanded', 'network.extended'],
    },
    {
        id: 'ag-flower',
        number: 6,
        nameAr: 'خلية الأزهار والإزهار',
        nameEn: 'Flower Cell',
        stage: 'إزهار',
        stageEn: 'flowering',
        ayah: 'وَالنَّجْمُ وَالشَّجَرُ يَسْجُدَانِ — الرحمن:6',
        description: 'الإبراز والتميّز — المنتجات المُبرَزة والعروض المميزة',
        marketState: 'featured',
        weight: 0.9,
        triggers: ['product.featured', 'offer.highlighted', 'promo.active'],
    },
    {
        id: 'ag-fruit',
        number: 7,
        nameAr: 'خلية الثمار',
        nameEn: 'Fruit Cell',
        stage: 'إثمار',
        stageEn: 'fruiting',
        ayah: 'تُؤْتِي أُكُلَهَا كُلَّ حِينٍ بِإِذْنِ رَبِّهَا — إبراهيم:25',
        description: 'جاهزية البيع — المنتج مكتمل ومتاح للشراء الفوري',
        marketState: 'ready-to-sell',
        weight: 1.1,
        triggers: ['product.ready', 'stock.confirmed', 'price.set'],
    },
    {
        id: 'ag-harvest',
        number: 8,
        nameAr: 'خلية الحصاد',
        nameEn: 'Harvest Cell',
        stage: 'حصاد',
        stageEn: 'harvesting',
        ayah: 'وَآتُوا حَقَّهُ يَوْمَ حَصَادِهِ وَلَا تُسْرِفُوا — الأنعام:141',
        description: 'جني الثمار وقطفها — إتمام الصفقة وتحويل الملكية',
        marketState: 'transacted',
        weight: 1.3,
        triggers: ['order.placed', 'deal.closed', 'transaction.complete'],
    },
    {
        id: 'ag-taste',
        number: 9,
        nameAr: 'خلية التذوق',
        nameEn: 'Taste Cell',
        stage: 'تذوّق',
        stageEn: 'tasting',
        ayah: 'فَكُلُوا مِنْهَا وَأَطْعِمُوا الْبَائِسَ الْفَقِيرَ — الحج:28',
        description: 'تجربة العميل — التقييمات والمراجعات وجودة المنتج',
        marketState: 'reviewed',
        weight: 1.0,
        triggers: ['review.submitted', 'rating.given', 'feedback.received'],
    },
    {
        id: 'ag-trade',
        number: 10,
        nameAr: 'خلية التجارة',
        nameEn: 'Trade Cell',
        stage: 'تجارة',
        stageEn: 'trading',
        ayah: 'وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا — البقرة:275',
        description: 'البيع والتجارة الحلال — السوق المفتوح والعروض التجارية',
        marketState: 'traded',
        weight: 1.2,
        triggers: ['market.open', 'bid.placed', 'commercial.exchange'],
    },
    {
        id: 'ag-revival',
        number: 11,
        nameAr: 'خلية إحياء الأرض',
        nameEn: 'Revival Cell',
        stage: 'إحياء',
        stageEn: 'revival',
        ayah: 'وَأَحْيَيْنَا بِهِ بَلْدَةً مَّيْتًا كَذَٰلِكَ الْخُرُوجُ — ق:11',
        description: 'إحياء الأرض الميتة — إعادة تفعيل القوائم الخاملة والفرص المهجورة',
        marketState: 'revived',
        weight: 1.0,
        triggers: ['listing.reactivated', 'dormant.revived', 'market.reopened'],
    },
    {
        id: 'ag-river',
        number: 12,
        nameAr: 'خلية المروج والأنهار الرقمية',
        nameEn: 'Digital River Cell',
        stage: 'تدفّق',
        stageEn: 'flowing',
        ayah: 'وَأَنزَلْنَا مِنَ السَّمَاءِ مَاءً فَسَقَيْنَاكُمُوهُ — الحجر:22',
        description: 'المروج والأنهار الرقمية — تدفق البيانات وربط المنظومات',
        marketState: 'connected',
        weight: 1.0,
        triggers: ['data.flow', 'network.sync', 'integration.active'],
    },
];

// ─── مراحل دورة الحياة الزراعية الرقمية (مرتّبة) ────────────────────────────

const LIFECYCLE_STAGES = [
    { order: 1,  stage: 'بذر',    stageEn: 'seeding',    cellId: 'ag-seed',       icon: '🌱' },
    { order: 2,  stage: 'تجذّر', stageEn: 'rooting',    cellId: 'ag-root',       icon: '🌿' },
    { order: 3,  stage: 'سقي',   stageEn: 'irrigation', cellId: 'ag-irrigation', icon: '💧' },
    { order: 4,  stage: 'نمو',   stageEn: 'growth',     cellId: 'ag-growth',     icon: '🪴' },
    { order: 5,  stage: 'تفرّع', stageEn: 'branching',  cellId: 'ag-branch',     icon: '🌳' },
    { order: 6,  stage: 'إزهار', stageEn: 'flowering',  cellId: 'ag-flower',     icon: '🌸' },
    { order: 7,  stage: 'إثمار', stageEn: 'fruiting',   cellId: 'ag-fruit',      icon: '🍊' },
    { order: 8,  stage: 'حصاد',  stageEn: 'harvesting', cellId: 'ag-harvest',    icon: '🌾' },
    { order: 9,  stage: 'تذوّق', stageEn: 'tasting',    cellId: 'ag-taste',      icon: '🍽️' },
    { order: 10, stage: 'تجارة', stageEn: 'trading',    cellId: 'ag-trade',      icon: '🏪' },
    { order: 11, stage: 'إحياء', stageEn: 'revival',    cellId: 'ag-revival',    icon: '🌊' },
    { order: 12, stage: 'تدفّق', stageEn: 'flowing',    cellId: 'ag-river',      icon: '🏞️' },
];

// ─── الحالة الداخلية ──────────────────────────────────────────────────────────

let _ready     = false;
let _callCount = 0;
let _startedAt = null;
const _cellMap = new Map();

// ─── تهيئة الشبكة ────────────────────────────────────────────────────────────

/**
 * تهيئة شبكة الخلايا الزراعية العصبية
 */
function init() {
    if (_ready) return status();

    for (const cell of AGRICULTURAL_CELLS) {
        _cellMap.set(cell.id, {
            ...cell,
            activation: 0,
            fireCount: 0,
            lastFired: null,
            active: false,
        });
    }

    _ready     = true;
    _startedAt = new Date().toISOString();

    console.info(
        '[AgNCN] 🌱 شبكة الخلايا الجذرية العصبية الزراعية جاهزة —',
        AGRICULTURAL_CELLS.length, 'خلية زراعية — مرقّمة بالكتاب والسنة'
    );

    return status();
}

// ─── تفعيل خلية ──────────────────────────────────────────────────────────────

/**
 * تفعيل خلية زراعية بعينها
 * @param {string} cellId — معرّف الخلية
 * @param {object} context — سياق التفعيل
 */
function activateCell(cellId, context = {}) {
    if (!_ready) init();

    const cell = _cellMap.get(cellId);
    if (!cell) return null;

    cell.activation = Math.min(1, cell.activation + 0.1);
    cell.fireCount++;
    cell.lastFired = new Date().toISOString();
    cell.active    = true;

    return {
        cellId:     cell.id,
        nameAr:     cell.nameAr,
        stage:      cell.stage,
        ayah:       cell.ayah,
        activation: cell.activation,
        context,
    };
}

// ─── تقدير مرحلة المنتج ──────────────────────────────────────────────────────

/**
 * تقدير مرحلة المنتج في دورة الحياة الزراعية
 * @param {object} product — بيانات المنتج
 * @returns {object} — المرحلة الحالية والمرحلة التالية والتوصيات
 */
function assessProductStage(product = {}) {
    if (!_ready) init();
    _callCount++;

    const p = product;
    let currentStageOrder = 1;

    // تحديد المرحلة بناءً على حالة المنتج
    if (p.status === 'draft' || !p.status) {
        currentStageOrder = 1; // بذر
    } else if (p.supplierId && p.verified) {
        currentStageOrder = 2; // تجذّر
    } else if (p.analyticsUpdated || p.priceSet) {
        currentStageOrder = 3; // سقي
    } else if (p.status === 'active') {
        currentStageOrder = 4; // نمو
    } else if (p.categories && p.categories.length > 1) {
        currentStageOrder = 5; // تفرّع
    } else if (p.featured) {
        currentStageOrder = 6; // إزهار
    } else if (p.status === 'ready' || (p.stock > 0 && p.price > 0)) {
        currentStageOrder = 7; // إثمار
    } else if (p.status === 'sold' || p.orderCount > 0) {
        currentStageOrder = 8; // حصاد
    } else if (p.reviewCount > 0) {
        currentStageOrder = 9; // تذوّق
    } else if (p.status === 'traded') {
        currentStageOrder = 10; // تجارة
    } else if (p.status === 'inactive' && p.previousActivity) {
        currentStageOrder = 11; // إحياء
    }

    const currentStage = LIFECYCLE_STAGES.find(s => s.order === currentStageOrder);
    const nextStage    = LIFECYCLE_STAGES.find(s => s.order === currentStageOrder + 1) || null;

    // تفعيل الخلية المقابلة
    const fired = currentStage ? activateCell(currentStage.cellId, { product: p.id || 'unknown' }) : null;

    // توصيات الانتقال للمرحلة التالية
    const recommendations = _buildRecommendations(currentStageOrder, p);

    // هل وصلنا لمرحلة الحصاد (الثمرة)؟
    const reachedHarvest = currentStageOrder >= 8;
    const canTrade       = currentStageOrder >= 10;

    return {
        productId:    p.id || null,
        currentStage: currentStage ? {
            order:   currentStage.order,
            nameAr:  currentStage.stage,
            nameEn:  currentStage.stageEn,
            icon:    currentStage.icon,
            cellId:  currentStage.cellId,
        } : null,
        nextStage: nextStage ? {
            order:  nextStage.order,
            nameAr: nextStage.stage,
            nameEn: nextStage.stageEn,
            icon:   nextStage.icon,
        } : null,
        reachedHarvest,
        canTrade,
        recommendations,
        cellFired: fired,
        assessedAt: new Date().toISOString(),
    };
}

/**
 * بناء توصيات الانتقال للمرحلة التالية
 */
function _buildRecommendations(currentOrder, product) {
    const map = {
        1: ['أضف تفاصيل المنتج الكاملة', 'حدد التصنيف والسعر والكمية', 'أرفق صور المنتج'],
        2: ['أكمل ملف المورد', 'تحقق من شهادة التاجر', 'فعّل الحساب'],
        3: ['راجع أسعار السوق الحالية', 'حلّل الطلب في منطقتك', 'حدّث السعر'],
        4: ['روّج للمنتج في الكتالوج', 'أضفه لتصنيفات متعددة', 'نشّط SEO'],
        5: ['وسّع التغطية الجغرافية', 'أضف فئات فرعية', 'كوّن شبكة توزيع'],
        6: ['اطلب الإبراز في الصفحة الرئيسية', 'أنشئ عرضاً ترويجياً', 'سعّر بتنافسية'],
        7: ['أكد توفر المخزون', 'فعّل خيار الطلب الفوري', 'اضبط الحد الأدنى للكمية'],
        8: ['أتم الصفقة بالأمانة', 'أدِّ حق الحصاد', 'الزم بسرعة التسليم'],
        9: ['اطلب تقييم العميل', 'استجب للمراجعات', 'طوّر الجودة'],
        10: ['انضم للمزادات التجارية', 'وسّع قاعدة المشترين', 'اعرض للتصدير'],
        11: ['راجع سبب الخمول', 'حدّث البيانات والصور', 'أعد التسعير'],
        12: ['تأكد من تكامل البيانات', 'فعّل التزامن مع الأنظمة', 'وصّل الشبكة'],
    };
    return map[currentOrder] || ['استمر في دورة الحياة الزراعية'];
}

// ─── حصاد السوق (إتمام الصفقة) ──────────────────────────────────────────────

/**
 * تفعيل مرحلة الحصاد — إتمام الصفقة التجارية
 * "وَآتُوا حَقَّهُ يَوْمَ حَصَادِهِ" — الأنعام:141
 * @param {object} harvestData — بيانات الحصاد
 */
function harvest(harvestData = {}) {
    if (!_ready) init();
    _callCount++;

    const data = harvestData;

    // تحقق من وجود المعطيات الأساسية
    const errors = [];
    if (!data.productId)  errors.push('معرّف المنتج مطلوب');
    if (!data.buyerId)    errors.push('معرّف المشتري مطلوب');
    if (!data.supplierId) errors.push('معرّف المورد مطلوب');
    if (!data.quantity || data.quantity <= 0) errors.push('الكمية يجب أن تكون أكبر من الصفر');
    if (!data.price || data.price <= 0)       errors.push('السعر يجب أن يكون أكبر من الصفر');
    if (data.hasInterest || data.interestRate > 0) errors.push('الربا محرّم — لا يجوز');

    if (errors.length > 0) {
        return { success: false, errors, stage: 'حصاد', timestamp: new Date().toISOString() };
    }

    // تفعيل خلية الحصاد وخلية التجارة
    const harvestCell = activateCell('ag-harvest', { action: 'harvest', ...data });
    const tradeCell   = activateCell('ag-trade',   { action: 'trade',   ...data });

    const totalValue = parseFloat(data.price) * parseFloat(data.quantity);

    return {
        success: true,
        harvestId: `harvest_${Date.now()}`,
        productId:  data.productId,
        buyerId:    data.buyerId,
        supplierId: data.supplierId,
        quantity:   data.quantity,
        price:      data.price,
        totalValue: parseFloat(totalValue.toFixed(2)),
        currency:   data.currency || 'SAR',
        stage: 'حصاد',
        icon: '🌾',
        ayah: 'وَآتُوا حَقَّهُ يَوْمَ حَصَادِهِ — الأنعام:141',
        cellsActivated: [harvestCell, tradeCell].filter(Boolean).map(c => c.cellId),
        harvestedAt: new Date().toISOString(),
    };
}

// ─── إحياء الأرض الميتة ──────────────────────────────────────────────────────

/**
 * إحياء قائمة خاملة أو أرض تجارية ميتة
 * "وَأَحْيَيْنَا بِهِ بَلْدَةً مَّيْتًا" — ق:11
 * @param {object} revivalData — بيانات الإحياء
 */
function revive(revivalData = {}) {
    if (!_ready) init();
    _callCount++;

    const data = revivalData;

    if (!data.listingId && !data.productId) {
        return {
            success: false,
            errors: ['معرّف القائمة أو المنتج مطلوب للإحياء'],
            stage: 'إحياء',
            timestamp: new Date().toISOString(),
        };
    }

    // تفعيل خلية الإحياء ثم خلية السقي (إعادة التغذية)
    const revivalCell     = activateCell('ag-revival',    { action: 'revive', ...data });
    const irrigationCell  = activateCell('ag-irrigation', { action: 'refeed', ...data });
    const growthCell      = activateCell('ag-growth',     { action: 'regrow', ...data });

    return {
        success: true,
        revivalId:  `revival_${Date.now()}`,
        listingId:  data.listingId || data.productId,
        reason:     data.reason || 'إحياء دوري',
        newStatus:  'active',
        stage: 'إحياء',
        icon: '🌊',
        ayah: 'وَأَحْيَيْنَا بِهِ بَلْدَةً مَّيْتًا كَذَٰلِكَ الْخُرُوجُ — ق:11',
        cellsActivated: [revivalCell, irrigationCell, growthCell].filter(Boolean).map(c => c.cellId),
        revivedAt: new Date().toISOString(),
    };
}

// ─── المروج والأنهار الرقمية ─────────────────────────────────────────────────

/**
 * نظرة على المروج والأنهار الرقمية — حالة تدفق السوق
 * "وَأَنزَلْنَا مِنَ السَّمَاءِ مَاءً فَسَقَيْنَاكُمُوهُ" — الحجر:22
 */
function getMeadows() {
    if (!_ready) init();

    const cells = Array.from(_cellMap.values());
    const totalActivations = cells.reduce((s, c) => s + c.fireCount, 0);
    const mostActive = [...cells]
        .sort((a, b) => b.fireCount - a.fireCount)
        .slice(0, 3)
        .map(c => ({ nameAr: c.nameAr, stage: c.stage, fireCount: c.fireCount, icon: LIFECYCLE_STAGES.find(s => s.cellId === c.id)?.icon || '🌿' }));

    return {
        meadows: {
            nameAr: 'المروج الرقمية',
            description: 'الأراضي الخصبة — المنتجات النشطة والأسواق المزدهرة',
            icon: '🏞️',
            activeCells: cells.filter(c => c.active).length,
            totalCells: cells.length,
        },
        rivers: {
            nameAr: 'الأنهار الرقمية',
            description: 'تدفق البيانات والمعاملات عبر المنظومة',
            icon: '🌊',
            totalFlow: totalActivations,
            mostActive,
        },
        lifecycle: LIFECYCLE_STAGES.map(s => {
            const cell = _cellMap.get(s.cellId);
            return {
                ...s,
                active: cell ? cell.active : false,
                fireCount: cell ? cell.fireCount : 0,
            };
        }),
        ayah: 'وَأَنزَلْنَا مِنَ السَّمَاءِ مَاءً فَسَقَيْنَاكُمُوهُ — الحجر:22',
        generatedAt: new Date().toISOString(),
    };
}

// ─── حالة الشبكة ─────────────────────────────────────────────────────────────

function status() {
    if (!_ready) init();

    const cells = Array.from(_cellMap.values());
    return {
        network: 'AgNCN — Agricultural Neural Cell Network',
        nameAr: 'شبكة الخلايا الجذرية العصبية الزراعية',
        version: '1.0.0',
        ready: _ready,
        startedAt: _startedAt,
        totalCells: cells.length,
        activeCells: cells.filter(c => c.active).length,
        callCount: _callCount,
        principle: 'أَفَرَأَيْتُم مَّا تَحْرُثُونَ — أَأَنتُمْ تَزْرَعُونَهُ أَمْ نَحْنُ الزَّارِعُونَ — الواقعة:63-64',
        lifecycleStages: LIFECYCLE_STAGES.length,
        cells: cells.map(c => ({
            id: c.id, number: c.number, nameAr: c.nameAr, stage: c.stage,
            active: c.active, activation: c.activation, fireCount: c.fireCount,
        })),
    };
}

// ─── تهيئة تلقائية ────────────────────────────────────────────────────────────

init();

// ─── Export ───────────────────────────────────────────────────────────────────

module.exports = {
    init,
    status,
    activateCell,
    assessProductStage,
    harvest,
    revive,
    getMeadows,
    AGRICULTURAL_CELLS,
    LIFECYCLE_STAGES,
};
