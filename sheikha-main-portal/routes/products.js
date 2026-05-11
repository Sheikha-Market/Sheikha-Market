/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  📦 مسارات كتالوج المنتجات — Products Catalog Routes
 *  الوصف: إدارة المنتجات للموردين والمشترين والمشرفين
 *  المرحلة: 2 — نواة السوق (MVP)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const express = require('express');
const router = express.Router();
const { v4: uuid } = require('uuid');
const database = require('../config/database');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');

// ─── ثوابت ────────────────────────────────────────────────────────────────────
const VALID_CATEGORIES = [
    'iron', 'copper', 'aluminum', 'gold', 'silver', 'brass',
    'lead', 'zinc', 'scrap', 'recycling', 'industrial', 'other'
];

const VALID_UNITS = ['kg', 'ton', 'gram', 'piece', 'meter', 'liter'];
const VALID_CURRENCIES = ['SAR', 'USD', 'AED', 'EUR'];
const VALID_STATUS = ['active', 'inactive', 'sold', 'draft'];

// ─── دالة مساعدة: التحقق من المنتج ───────────────────────────────────────────
function validateProduct(data) {
    const errors = [];
    if (!data.name || String(data.name).trim().length < 2) errors.push('اسم المنتج مطلوب (حد أدنى حرفين)');
    if (!data.category) errors.push('تصنيف المنتج مطلوب');
    if (data.category && !VALID_CATEGORIES.includes(data.category)) errors.push(`تصنيف غير صحيح. الخيارات: ${VALID_CATEGORIES.join(', ')}`);
    if (data.price !== undefined && data.price !== null && isNaN(parseFloat(data.price))) errors.push('السعر يجب أن يكون رقماً');
    if (data.price !== undefined && data.price !== null && parseFloat(data.price) < 0) errors.push('السعر لا يمكن أن يكون سالباً');
    if (data.unit && !VALID_UNITS.includes(data.unit)) errors.push(`وحدة القياس غير صحيحة. الخيارات: ${VALID_UNITS.join(', ')}`);
    if (data.currency && !VALID_CURRENCIES.includes(data.currency)) errors.push(`العملة غير صحيحة. الخيارات: ${VALID_CURRENCIES.join(', ')}`);
    return errors;
}

// ─── دالة مساعدة: بناء كائن المنتج ──────────────────────────────────────────
function buildProduct(data, supplierId, supplierName) {
    return {
        id: data.id || uuid(),
        supplierId: supplierId || data.supplierId || null,
        supplierName: supplierName || data.supplierName || 'غير محدد',
        name: String(data.name || '').trim(),
        nameEn: String(data.nameEn || '').trim(),
        description: String(data.description || '').trim(),
        category: data.category || 'other',
        categoryName: data.categoryName || data.category || 'أخرى',
        price: parseFloat(data.price) || 0,
        currency: data.currency || 'SAR',
        unit: data.unit || 'kg',
        quantity: parseFloat(data.quantity) || 0,
        minQuantity: parseFloat(data.minQuantity) || 1,
        images: Array.isArray(data.images) ? data.images : [],
        location: data.location || null,
        region: data.region || null,
        grade: data.grade || null,
        specifications: data.specifications || {},
        sharia: {
            compliant: true,
            noRiba: true,
            halal: true
        },
        status: data.status || 'active',
        views: 0,
        orders: 0,
        rating: { average: 0, count: 0 },
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/products — قائمة المنتجات (متاح للجميع)
// ═══════════════════════════════════════════════════════════════════════════════
router.get('/', optionalAuth, (req, res) => {
    try {
        const products = database.read('products') || [];
        const {
            category, status = 'active', q, supplierId,
            minPrice, maxPrice, region,
            page = 1, limit = 20,
            sort = 'createdAt', order = 'desc'
        } = req.query;

        let filtered = [...products];

        // فلتر الحالة (غير المشرف يرى Active فقط)
        if (req.user && req.user.role === 'admin') {
            if (status) filtered = filtered.filter(p => p.status === status);
        } else {
            filtered = filtered.filter(p => p.status === 'active');
        }

        if (category) filtered = filtered.filter(p => p.category === category);
        if (supplierId) filtered = filtered.filter(p => p.supplierId === supplierId);
        if (region) filtered = filtered.filter(p => p.region === region);

        if (minPrice) filtered = filtered.filter(p => (p.price || 0) >= parseFloat(minPrice));
        if (maxPrice) filtered = filtered.filter(p => (p.price || 0) <= parseFloat(maxPrice));

        if (q) {
            const keyword = q.toLowerCase();
            filtered = filtered.filter(p =>
                (p.name || '').toLowerCase().includes(keyword) ||
                (p.nameEn || '').toLowerCase().includes(keyword) ||
                (p.description || '').toLowerCase().includes(keyword) ||
                (p.categoryName || '').toLowerCase().includes(keyword)
            );
        }

        // الترتيب
        filtered.sort((a, b) => {
            const aVal = a[sort] || 0;
            const bVal = b[sort] || 0;
            if (order === 'asc') return aVal > bVal ? 1 : -1;
            return aVal < bVal ? 1 : -1;
        });

        // الترقيم
        const total = filtered.length;
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const paginated = filtered.slice((pageNum - 1) * limitNum, pageNum * limitNum);

        res.json({
            success: true,
            count: paginated.length,
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
            products: paginated
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'خطأ في جلب المنتجات', error: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/products/categories — التصنيفات المتاحة
// ═══════════════════════════════════════════════════════════════════════════════
router.get('/categories', (req, res) => {
    const products = database.read('products') || [];
    const categoryCounts = {};

    products.filter(p => p.status === 'active').forEach(p => {
        if (p.category) {
            categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
        }
    });

    const categories = [
        { id: 'iron',       name: 'حديد',              nameEn: 'Iron',       icon: '🔩', count: categoryCounts['iron'] || 0 },
        { id: 'copper',     name: 'نحاس',              nameEn: 'Copper',     icon: '🟠', count: categoryCounts['copper'] || 0 },
        { id: 'aluminum',   name: 'ألومنيوم',          nameEn: 'Aluminum',   icon: '⚪', count: categoryCounts['aluminum'] || 0 },
        { id: 'gold',       name: 'ذهب',               nameEn: 'Gold',       icon: '🟡', count: categoryCounts['gold'] || 0 },
        { id: 'silver',     name: 'فضة',               nameEn: 'Silver',     icon: '⚫', count: categoryCounts['silver'] || 0 },
        { id: 'brass',      name: 'نحاس أصفر',         nameEn: 'Brass',      icon: '🟤', count: categoryCounts['brass'] || 0 },
        { id: 'lead',       name: 'رصاص',              nameEn: 'Lead',       icon: '🔘', count: categoryCounts['lead'] || 0 },
        { id: 'zinc',       name: 'زنك',               nameEn: 'Zinc',       icon: '🔵', count: categoryCounts['zinc'] || 0 },
        { id: 'scrap',      name: 'سكراب',             nameEn: 'Scrap',      icon: '♻️', count: categoryCounts['scrap'] || 0 },
        { id: 'recycling',  name: 'إعادة تدوير',       nameEn: 'Recycling',  icon: '🔄', count: categoryCounts['recycling'] || 0 },
        { id: 'industrial', name: 'صناعي',             nameEn: 'Industrial', icon: '🏭', count: categoryCounts['industrial'] || 0 },
        { id: 'other',      name: 'أخرى',              nameEn: 'Other',      icon: '📦', count: categoryCounts['other'] || 0 }
    ];

    res.json({ success: true, categories });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/products/search — بحث متقدم
// ═══════════════════════════════════════════════════════════════════════════════
router.get('/search', optionalAuth, (req, res) => {
    const { q = '' } = req.query;
    if (!q || q.trim().length < 1) {
        return res.status(400).json({ success: false, message: 'كلمة البحث مطلوبة' });
    }

    const products = database.read('products') || [];
    const keyword = q.toLowerCase().trim();

    const results = products.filter(p => p.status === 'active').filter(p =>
        (p.name || '').toLowerCase().includes(keyword) ||
        (p.nameEn || '').toLowerCase().includes(keyword) ||
        (p.description || '').toLowerCase().includes(keyword) ||
        (p.category || '').toLowerCase().includes(keyword) ||
        (p.grade || '').toLowerCase().includes(keyword)
    );

    res.json({
        success: true,
        query: q,
        count: results.length,
        products: results.slice(0, 50)
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/products/supplier/my — منتجات المورد الحالي
// ملاحظة: يجب تعريف هذا المسار قبل /:id لتجنب التعارض
// ═══════════════════════════════════════════════════════════════════════════════
router.get('/supplier/my', authenticate, (req, res) => {
    try {
        const products = database.read('products') || [];
        const myProducts = products.filter(p => p.supplierId === req.user.id);
        const stats = {
            total: myProducts.length,
            active: myProducts.filter(p => p.status === 'active').length,
            inactive: myProducts.filter(p => p.status === 'inactive').length,
            draft: myProducts.filter(p => p.status === 'draft').length,
            totalViews: myProducts.reduce((s, p) => s + (p.views || 0), 0),
            totalOrders: myProducts.reduce((s, p) => s + (p.orders || 0), 0)
        };
        res.json({ success: true, stats, products: myProducts });
    } catch (err) {
        res.status(500).json({ success: false, message: 'خطأ في جلب منتجاتك', error: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/products/:id — تفاصيل منتج واحد
// ═══════════════════════════════════════════════════════════════════════════════
router.get('/:id', optionalAuth, (req, res) => {
    try {
        const product = database.findById('products', req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'المنتج غير موجود' });

        if (product.status !== 'active' && (!req.user || (req.user.role !== 'admin' && req.user.id !== product.supplierId))) {
            return res.status(404).json({ success: false, message: 'المنتج غير متاح' });
        }

        // زيادة عداد المشاهدات
        database.update('products', req.params.id, { views: (product.views || 0) + 1 });

        res.json({ success: true, product });
    } catch (err) {
        res.status(500).json({ success: false, message: 'خطأ في جلب المنتج', error: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/products — إضافة منتج جديد (المورد فقط)
// ═══════════════════════════════════════════════════════════════════════════════
router.post('/', authenticate, authorize('supplier', 'admin', 'trader', 'company'), (req, res) => {
    try {
        const errors = validateProduct(req.body);
        if (errors.length > 0) return res.status(400).json({ success: false, errors });

        const product = buildProduct(req.body, req.user.id, req.user.name || req.user.email);
        database.insert('products', product);

        res.status(201).json({ success: true, message: 'تم إضافة المنتج بنجاح', product });
    } catch (err) {
        res.status(500).json({ success: false, message: 'خطأ في إضافة المنتج', error: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PUT /api/products/:id — تعديل منتج (صاحب المنتج أو المشرف)
// ═══════════════════════════════════════════════════════════════════════════════
router.put('/:id', authenticate, (req, res) => {
    try {
        const product = database.findById('products', req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'المنتج غير موجود' });

        if (req.user.role !== 'admin' && product.supplierId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'ليس لديك صلاحية لتعديل هذا المنتج' });
        }

        const errors = validateProduct({ ...product, ...req.body });
        if (errors.length > 0) return res.status(400).json({ success: false, errors });

        const allowed = ['name', 'nameEn', 'description', 'price', 'currency', 'unit',
                         'quantity', 'minQuantity', 'images', 'location', 'region',
                         'grade', 'specifications', 'status', 'categoryName'];
        const updates = {};
        allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

        // المشرف فقط يمكنه تغيير التصنيف
        if (req.user.role === 'admin' && req.body.category) updates.category = req.body.category;

        const updated = database.update('products', req.params.id, updates);
        res.json({ success: true, message: 'تم تعديل المنتج بنجاح', product: updated });
    } catch (err) {
        res.status(500).json({ success: false, message: 'خطأ في تعديل المنتج', error: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// DELETE /api/products/:id — حذف منتج (صاحب المنتج أو المشرف)
// ═══════════════════════════════════════════════════════════════════════════════
router.delete('/:id', authenticate, (req, res) => {
    try {
        const product = database.findById('products', req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'المنتج غير موجود' });

        if (req.user.role !== 'admin' && product.supplierId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'ليس لديك صلاحية لحذف هذا المنتج' });
        }

        database.delete('products', req.params.id);
        res.json({ success: true, message: 'تم حذف المنتج بنجاح' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'خطأ في حذف المنتج', error: err.message });
    }
});

module.exports = router;
