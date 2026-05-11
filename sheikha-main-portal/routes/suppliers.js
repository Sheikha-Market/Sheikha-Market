/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  🏪 مسارات إدارة الموردين — Suppliers Management Routes
 *  الوصف: تسجيل الموردين، إدارة ملفاتهم، التقييمات، الإحصائيات
 *  المرحلة: 2 — نواة السوق (MVP)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const express = require('express');
const router = express.Router();
const { v4: uuid } = require('uuid');
const database = require('../config/database');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');

// ─── دالة مساعدة: بناء ملف المورد ────────────────────────────────────────────
function buildSupplierProfile(data, userId) {
    const now = new Date().toISOString();
    return {
        id: data.id || uuid(),
        userId: userId || data.userId,
        // معلومات أساسية
        name: String(data.name || '').trim(),
        nameEn: String(data.nameEn || '').trim(),
        businessName: String(data.businessName || data.name || '').trim(),
        businessType: data.businessType || 'individual', // individual | company | factory
        description: String(data.description || '').trim(),
        // التواصل
        email: data.email || null,
        phone: data.phone || null,
        website: data.website || null,
        whatsapp: data.whatsapp || null,
        // الموقع
        country: data.country || 'SA',
        city: data.city || null,
        region: data.region || null,
        address: data.address || null,
        // التصنيفات
        categories: Array.isArray(data.categories) ? data.categories : (data.category ? [data.category] : []),
        specializations: Array.isArray(data.specializations) ? data.specializations : [],
        // التحقق والامتثال
        verified: false,
        verificationDate: null,
        commercialRegistration: data.commercialRegistration || null,
        vatNumber: data.vatNumber || null,
        sharia: { compliant: true, noRiba: true, audited: false },
        // الإحصائيات
        stats: {
            totalProducts: 0,
            activeProducts: 0,
            totalOrders: 0,
            completedOrders: 0,
            totalRevenue: 0,
            rating: { average: 0, count: 0 }
        },
        // الحالة
        status: 'active', // active | suspended | pending
        featured: false,
        // الوثائق
        documents: [],
        logo: data.logo || null,
        createdAt: now,
        updatedAt: now
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/suppliers — قائمة الموردين (متاح للجميع)
// ═══════════════════════════════════════════════════════════════════════════════
router.get('/', optionalAuth, (req, res) => {
    try {
        const suppliers = database.read('suppliers') || [];
        const { category, region, verified, q, featured, page = 1, limit = 20 } = req.query;

        let filtered = suppliers.filter(s => s.status === 'active');

        if (category) filtered = filtered.filter(s => (s.categories || []).includes(category));
        if (region) filtered = filtered.filter(s => s.region === region || s.city === region);
        if (verified === 'true') filtered = filtered.filter(s => s.verified === true);
        if (featured === 'true') filtered = filtered.filter(s => s.featured === true);
        if (q) {
            const kw = q.toLowerCase();
            filtered = filtered.filter(s =>
                (s.name || '').toLowerCase().includes(kw) ||
                (s.businessName || '').toLowerCase().includes(kw) ||
                (s.description || '').toLowerCase().includes(kw)
            );
        }

        // ترتيب: الموردون المميزون أولاً ثم التقييم
        filtered.sort((a, b) => {
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            return (b.stats?.rating?.average || 0) - (a.stats?.rating?.average || 0);
        });

        const total = filtered.length;
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const paginated = filtered.slice((pageNum - 1) * limitNum, pageNum * limitNum);

        res.json({ success: true, count: paginated.length, total, page: pageNum, suppliers: paginated });
    } catch (err) {
        res.status(500).json({ success: false, message: 'خطأ في جلب الموردين', error: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/suppliers/me — ملف المورد الحالي
// ═══════════════════════════════════════════════════════════════════════════════
router.get('/me', authenticate, (req, res) => {
    try {
        const suppliers = database.read('suppliers') || [];
        const profile = suppliers.find(s => s.userId === req.user.id);

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'لم يتم إنشاء ملف مورد لحسابك. استخدم POST /api/suppliers/register'
            });
        }

        // إضافة إحصائيات المنتجات والطلبات المحدّثة
        const products = database.read('products') || [];
        const orders = database.read('market_orders') || [];

        const myProducts = products.filter(p => p.supplierId === req.user.id);
        const myOrders = orders.filter(o => o.supplierId === req.user.id);

        profile.stats = {
            totalProducts: myProducts.length,
            activeProducts: myProducts.filter(p => p.status === 'active').length,
            totalOrders: myOrders.length,
            completedOrders: myOrders.filter(o => o.status === 'completed').length,
            totalRevenue: myOrders.filter(o => o.status === 'completed').reduce((s, o) => s + (o.totalAmount || 0), 0),
            rating: profile.stats?.rating || { average: 0, count: 0 }
        };

        res.json({ success: true, profile });
    } catch (err) {
        res.status(500).json({ success: false, message: 'خطأ في جلب ملف المورد', error: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/suppliers/register — تسجيل كمورد
// ═══════════════════════════════════════════════════════════════════════════════
router.post('/register', authenticate, (req, res) => {
    try {
        const { name, businessName, categories } = req.body;

        if (!name || String(name).trim().length < 2) {
            return res.status(400).json({ success: false, message: 'اسم المورد مطلوب (حد أدنى حرفين)' });
        }

        // التحقق من عدم وجود ملف مورد مسبق
        const suppliers = database.read('suppliers') || [];
        const existing = suppliers.find(s => s.userId === req.user.id);
        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'لديك ملف مورد مسجل مسبقاً',
                supplierId: existing.id
            });
        }

        const profile = buildSupplierProfile({ ...req.body, email: req.body.email || req.user.email }, req.user.id);
        database.insert('suppliers', profile);

        // تحديث دور المستخدم إذا لم يكن مورداً
        const users = database.read('users') || [];
        const userIdx = users.findIndex(u => u.id === req.user.id);
        if (userIdx >= 0 && !['admin', 'supplier'].includes(users[userIdx].role)) {
            users[userIdx].role = 'supplier';
            database.write('users', users);
        }

        res.status(201).json({
            success: true,
            message: 'تم تسجيلك كمورد بنجاح. سيتم مراجعة الملف والتحقق منه.',
            profile
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'خطأ في تسجيل المورد', error: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/suppliers/:id — ملف مورد عام
// ═══════════════════════════════════════════════════════════════════════════════
router.get('/:id', optionalAuth, (req, res) => {
    try {
        const supplier = database.findById('suppliers', req.params.id);
        if (!supplier || supplier.status === 'suspended') {
            return res.status(404).json({ success: false, message: 'المورد غير موجود' });
        }

        // جلب منتجات المورد
        const products = database.read('products') || [];
        const supplierProducts = products.filter(p => p.supplierId === supplier.userId && p.status === 'active');

        res.json({
            success: true,
            supplier,
            products: supplierProducts.slice(0, 12),
            totalProducts: supplierProducts.length
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'خطأ في جلب ملف المورد', error: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PUT /api/suppliers/me — تعديل ملف المورد
// ═══════════════════════════════════════════════════════════════════════════════
router.put('/me', authenticate, (req, res) => {
    try {
        const suppliers = database.read('suppliers') || [];
        const profile = suppliers.find(s => s.userId === req.user.id);

        if (!profile) {
            return res.status(404).json({ success: false, message: 'لم يتم العثور على ملف المورد' });
        }

        const allowed = ['name', 'nameEn', 'businessName', 'description', 'phone', 'website',
                         'whatsapp', 'city', 'region', 'address', 'categories', 'specializations',
                         'commercialRegistration', 'vatNumber', 'logo'];
        const updates = {};
        allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

        const updated = database.update('suppliers', profile.id, updates);
        res.json({ success: true, message: 'تم تعديل ملف المورد بنجاح', profile: updated });
    } catch (err) {
        res.status(500).json({ success: false, message: 'خطأ في تعديل ملف المورد', error: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/suppliers/:id/rate — تقييم مورد
// ═══════════════════════════════════════════════════════════════════════════════
router.post('/:id/rate', authenticate, (req, res) => {
    try {
        const { rating, comment } = req.body;
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: 'التقييم يجب أن يكون بين 1 و5' });
        }

        const supplier = database.findById('suppliers', req.params.id);
        if (!supplier) return res.status(404).json({ success: false, message: 'المورد غير موجود' });

        const currentRating = supplier.stats?.rating || { average: 0, count: 0 };
        const newCount = currentRating.count + 1;
        const newAverage = ((currentRating.average * currentRating.count) + parseFloat(rating)) / newCount;

        database.update('suppliers', supplier.id, {
            'stats.rating': { average: Math.round(newAverage * 10) / 10, count: newCount }
        });

        res.json({ success: true, message: 'تم تسجيل تقييمك بنجاح', rating: { average: newAverage, count: newCount } });
    } catch (err) {
        res.status(500).json({ success: false, message: 'خطأ في تسجيل التقييم', error: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PUT /api/suppliers/:id/verify — التحقق من المورد (المشرف فقط)
// ═══════════════════════════════════════════════════════════════════════════════
router.put('/:id/verify', authenticate, authorize('admin'), (req, res) => {
    try {
        const supplier = database.findById('suppliers', req.params.id);
        if (!supplier) return res.status(404).json({ success: false, message: 'المورد غير موجود' });

        database.update('suppliers', supplier.id, {
            verified: true,
            verificationDate: new Date().toISOString(),
            verifiedBy: req.user.id
        });

        res.json({ success: true, message: 'تم التحقق من المورد بنجاح' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'خطأ في التحقق من المورد', error: err.message });
    }
});

module.exports = router;
