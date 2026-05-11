/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  🛒 مسارات إدارة الطلبات — Orders Management Routes
 *  الوصف: إنشاء الطلبات، تتبعها، تحديث حالتها، والإحصائيات
 *  المرحلة: 2 — نواة السوق (MVP)
 *  ملاحظة: المسارات الثابتة (buyer/my, supplier/my) قبل الديناميكية (/:id)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const express = require('express');
const router = express.Router();
const { v4: uuid } = require('uuid');
const database = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const { orderShariaGuard } = require('../middleware/sharia-guard');

const ORDER_STATUSES = [
    'pending', 'confirmed', 'processing', 'shipped',
    'delivered', 'completed', 'cancelled', 'refunded'
];

const ALLOWED_TRANSITIONS = {
    pending:    ['confirmed', 'cancelled'],
    confirmed:  ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped:    ['delivered'],
    delivered:  ['completed', 'refunded'],
    completed:  [],
    cancelled:  [],
    refunded:   []
};

function buildOrder(data, buyerId, buyerName) {
    const now = new Date().toISOString();
    const items = Array.isArray(data.items) ? data.items : (data.productId ? [{
        productId: data.productId,
        productName: data.productName || 'منتج',
        quantity: parseFloat(data.quantity) || 1,
        unit: data.unit || 'kg',
        unitPrice: parseFloat(data.unitPrice) || 0,
        currency: data.currency || 'SAR'
    }] : []);

    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const orderSeq = `${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;

    return {
        id: uuid(),
        orderNumber: `ORD-${orderSeq}`,
        buyerId,
        buyerName: buyerName || 'مشتري',
        supplierId: data.supplierId || null,
        supplierName: data.supplierName || null,
        items,
        totalAmount,
        currency: data.currency || 'SAR',
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: data.paymentMethod || null,
        shippingAddress: data.shippingAddress || null,
        notes: data.notes || null,
        sharia: { compliant: true, noRiba: true },
        tracking: {
            history: [{ status: 'pending', timestamp: now, note: 'تم إنشاء الطلب' }],
            estimatedDelivery: data.estimatedDelivery || null
        },
        createdAt: now,
        updatedAt: now
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/orders — قائمة الطلبات (حسب دور المستخدم)
// ═══════════════════════════════════════════════════════════════════════════════
router.get('/', authenticate, (req, res) => {
    try {
        const allOrders = database.read('market_orders') || [];
        const { status, page = 1, limit = 20 } = req.query;

        let filtered = [...allOrders];

        if (req.user.role !== 'admin') {
            filtered = filtered.filter(o =>
                o.buyerId === req.user.id || o.supplierId === req.user.id
            );
        }

        if (status && ORDER_STATUSES.includes(status)) {
            filtered = filtered.filter(o => o.status === status);
        }

        filtered.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));

        const total = filtered.length;
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const paginated = filtered.slice((pageNum - 1) * limitNum, pageNum * limitNum);

        const stats = {
            total: filtered.length,
            pending:    filtered.filter(o => o.status === 'pending').length,
            confirmed:  filtered.filter(o => o.status === 'confirmed').length,
            processing: filtered.filter(o => o.status === 'processing').length,
            shipped:    filtered.filter(o => o.status === 'shipped').length,
            delivered:  filtered.filter(o => o.status === 'delivered').length,
            completed:  filtered.filter(o => o.status === 'completed').length,
            cancelled:  filtered.filter(o => o.status === 'cancelled').length
        };

        res.json({ success: true, stats, count: paginated.length, total, page: pageNum, orders: paginated });
    } catch (err) {
        res.status(500).json({ success: false, message: 'خطأ في جلب الطلبات', error: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/orders/buyer/my — طلبات المشتري الحالي
// يجب أن يكون قبل /:id
// ═══════════════════════════════════════════════════════════════════════════════
router.get('/buyer/my', authenticate, (req, res) => {
    try {
        const orders = database.read('market_orders') || [];
        const myOrders = orders.filter(o => o.buyerId === req.user.id);
        myOrders.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));

        const stats = {
            total: myOrders.length,
            active: myOrders.filter(o => !['completed', 'cancelled', 'refunded'].includes(o.status)).length,
            completed: myOrders.filter(o => o.status === 'completed').length,
            totalSpent: myOrders.filter(o => o.status === 'completed').reduce((s, o) => s + (o.totalAmount || 0), 0)
        };

        res.json({ success: true, stats, orders: myOrders });
    } catch (err) {
        res.status(500).json({ success: false, message: 'خطأ في جلب طلباتك', error: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/orders/supplier/my — طلبات المورد الحالي
// يجب أن يكون قبل /:id
// ═══════════════════════════════════════════════════════════════════════════════
router.get('/supplier/my', authenticate, (req, res) => {
    try {
        const orders = database.read('market_orders') || [];
        const myOrders = orders.filter(o => o.supplierId === req.user.id);
        myOrders.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));

        const stats = {
            total: myOrders.length,
            pending: myOrders.filter(o => o.status === 'pending').length,
            active: myOrders.filter(o => ['confirmed', 'processing', 'shipped'].includes(o.status)).length,
            completed: myOrders.filter(o => o.status === 'completed').length,
            totalRevenue: myOrders.filter(o => o.status === 'completed').reduce((s, o) => s + (o.totalAmount || 0), 0)
        };

        res.json({ success: true, stats, orders: myOrders });
    } catch (err) {
        res.status(500).json({ success: false, message: 'خطأ في جلب طلباتك', error: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/orders/:id — تفاصيل طلب واحد
// ═══════════════════════════════════════════════════════════════════════════════
router.get('/:id', authenticate, (req, res) => {
    try {
        const order = database.findById('market_orders', req.params.id);
        if (!order) return res.status(404).json({ success: false, message: 'الطلب غير موجود' });

        if (req.user.role !== 'admin' && order.buyerId !== req.user.id && order.supplierId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'ليس لديك صلاحية لعرض هذا الطلب' });
        }

        res.json({ success: true, order });
    } catch (err) {
        res.status(500).json({ success: false, message: 'خطأ في جلب الطلب', error: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/orders — إنشاء طلب جديد
// ═══════════════════════════════════════════════════════════════════════════════
router.post('/', authenticate, orderShariaGuard, (req, res) => {
    try {
        const { items, productId, supplierId } = req.body;

        if (!items && !productId) {
            return res.status(400).json({ success: false, message: 'يجب تحديد المنتجات (items) أو معرف المنتج (productId)' });
        }

        const orderItems = Array.isArray(items) ? items : [{
            productId,
            productName: req.body.productName,
            quantity: parseFloat(req.body.quantity) || 1,
            unit: req.body.unit || 'kg',
            unitPrice: parseFloat(req.body.unitPrice) || 0,
            currency: req.body.currency || 'SAR'
        }];

        if (orderItems.length === 0) {
            return res.status(400).json({ success: false, message: 'يجب إضافة منتج واحد على الأقل' });
        }

        for (const item of orderItems) {
            if (!item.productId) return res.status(400).json({ success: false, message: 'معرف المنتج مطلوب لكل عنصر' });
            if (!item.quantity || item.quantity <= 0) return res.status(400).json({ success: false, message: 'الكمية يجب أن تكون أكبر من صفر' });

            const product = database.findById('products', item.productId);
            if (!product) return res.status(404).json({ success: false, message: `المنتج ${item.productId} غير موجود` });
            if (product.status !== 'active') return res.status(400).json({ success: false, message: `المنتج ${product.name} غير متاح حالياً` });

            item.productName = item.productName || product.name;
            item.unitPrice = item.unitPrice || product.price;
            item.unit = item.unit || product.unit;
            item.supplierId = product.supplierId;
            item.supplierName = product.supplierName;
        }

        const order = buildOrder(
            { ...req.body, items: orderItems, supplierId: supplierId || orderItems[0].supplierId },
            req.user.id,
            req.user.name || req.user.email
        );

        database.insert('market_orders', order);

        orderItems.forEach(item => {
            const product = database.findById('products', item.productId);
            if (product) database.update('products', item.productId, { orders: (product.orders || 0) + 1 });
        });

        res.status(201).json({ success: true, message: 'تم إنشاء الطلب بنجاح', order });
    } catch (err) {
        res.status(500).json({ success: false, message: 'خطأ في إنشاء الطلب', error: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PUT /api/orders/:id/status — تحديث حالة الطلب
// ═══════════════════════════════════════════════════════════════════════════════
router.put('/:id/status', authenticate, (req, res) => {
    try {
        const { status, note } = req.body;
        if (!status) return res.status(400).json({ success: false, message: 'حالة الطلب مطلوبة' });
        if (!ORDER_STATUSES.includes(status)) {
            return res.status(400).json({ success: false, message: `حالة غير صحيحة. الخيارات: ${ORDER_STATUSES.join(', ')}` });
        }

        const order = database.findById('market_orders', req.params.id);
        if (!order) return res.status(404).json({ success: false, message: 'الطلب غير موجود' });

        const isAdmin    = req.user.role === 'admin';
        const isSupplier = order.supplierId === req.user.id;
        const isBuyer    = order.buyerId === req.user.id;

        if (!isAdmin && !isSupplier && !isBuyer) {
            return res.status(403).json({ success: false, message: 'ليس لديك صلاحية لتعديل هذا الطلب' });
        }

        const allowed = ALLOWED_TRANSITIONS[order.status] || [];
        if (!isAdmin && !allowed.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `لا يمكن الانتقال من "${order.status}" إلى "${status}"`,
                allowedNext: allowed
            });
        }

        const now = new Date().toISOString();
        const tracking = order.tracking || { history: [] };
        tracking.history.push({ status, timestamp: now, note: note || null, by: req.user.id });

        const updated = database.update('market_orders', order.id, {
            status,
            tracking,
            paymentStatus: status === 'completed' ? 'paid' : (status === 'refunded' ? 'refunded' : order.paymentStatus)
        });

        res.json({ success: true, message: `تم تحديث حالة الطلب إلى: ${status}`, order: updated });
    } catch (err) {
        res.status(500).json({ success: false, message: 'خطأ في تحديث حالة الطلب', error: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PUT /api/orders/:id/cancel — إلغاء الطلب
// ═══════════════════════════════════════════════════════════════════════════════
router.put('/:id/cancel', authenticate, (req, res) => {
    try {
        const order = database.findById('market_orders', req.params.id);
        if (!order) return res.status(404).json({ success: false, message: 'الطلب غير موجود' });

        if (req.user.role !== 'admin' && order.buyerId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'يمكن للمشتري فقط إلغاء الطلب' });
        }

        const allowed = ALLOWED_TRANSITIONS[order.status] || [];
        if (!allowed.includes('cancelled')) {
            return res.status(400).json({ success: false, message: `لا يمكن إلغاء الطلب في حالة: ${order.status}` });
        }

        const tracking = order.tracking || { history: [] };
        tracking.history.push({
            status: 'cancelled',
            timestamp: new Date().toISOString(),
            note: req.body.reason || 'إلغاء بطلب المشتري',
            by: req.user.id
        });

        database.update('market_orders', order.id, { status: 'cancelled', tracking });
        res.json({ success: true, message: 'تم إلغاء الطلب بنجاح' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'خطأ في إلغاء الطلب', error: err.message });
    }
});

module.exports = router;
