/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  📊 مسارات التحليلات ومؤشرات الأداء — Analytics & KPI Routes
 *  الوصف: مؤشرات حقيقية من البيانات الفعلية للمشرفين والموردين والمشترين
 *  المرحلة: 3 — التحليلات والتشغيل الذكي
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const express = require('express');
const router = express.Router();
const database = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

// ─── دالة مساعدة: احتساب معدل النمو ─────────────────────────────────────────
function growthRate(current, previous) {
    if (!previous || previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
}

// ─── دالة مساعدة: تجميع البيانات حسب اليوم/الشهر ────────────────────────────
function groupByDay(items, dateField = 'createdAt') {
    const groups = {};
    items.forEach(item => {
        if (!item[dateField]) return;
        const day = item[dateField].slice(0, 10); // YYYY-MM-DD
        if (!groups[day]) groups[day] = [];
        groups[day].push(item);
    });
    return groups;
}

// ─── دالة مساعدة: آخر N يوم ──────────────────────────────────────────────────
function lastNDays(n) {
    const dates = [];
    for (let i = n - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().slice(0, 10));
    }
    return dates;
}

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/analytics/overview — نظرة شاملة (المشرف)
// ═══════════════════════════════════════════════════════════════════════════════
router.get('/overview', authenticate, authorize('admin'), (req, res) => {
    try {
        const users     = database.read('users')         || [];
        const products  = database.read('products')      || [];
        const orders    = database.read('market_orders') || [];
        const suppliers = database.read('suppliers')     || [];

        const now = new Date();
        const todayStr = now.toISOString().slice(0, 10);
        const thisMonth = now.toISOString().slice(0, 7);
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 7);

        // ─── مؤشرات المستخدمين ─────────────────────────────────────────────
        const usersThisMonth = users.filter(u => (u.createdAt || '').startsWith(thisMonth)).length;
        const usersLastMonth = users.filter(u => (u.createdAt || '').startsWith(lastMonth)).length;

        // ─── مؤشرات المنتجات ──────────────────────────────────────────────
        const activeProducts  = products.filter(p => p.status === 'active').length;
        const productsThisMonth = products.filter(p => (p.createdAt || '').startsWith(thisMonth)).length;

        // ─── مؤشرات الطلبات ───────────────────────────────────────────────
        const completedOrders   = orders.filter(o => o.status === 'completed');
        const pendingOrders     = orders.filter(o => o.status === 'pending');
        const ordersThisMonth   = orders.filter(o => (o.createdAt || '').startsWith(thisMonth));
        const ordersLastMonth   = orders.filter(o => (o.createdAt || '').startsWith(lastMonth));

        const revenueThisMonth  = ordersThisMonth.filter(o => o.status === 'completed').reduce((s, o) => s + (o.totalAmount || 0), 0);
        const revenueLastMonth  = ordersLastMonth.filter(o => o.status === 'completed').reduce((s, o) => s + (o.totalAmount || 0), 0);
        const totalRevenue      = completedOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);

        // ─── مبيعات آخر 30 يوم ────────────────────────────────────────────
        const days30 = lastNDays(30);
        const byDay  = groupByDay(orders);
        const salesTrend = days30.map(day => ({
            date: day,
            orders: (byDay[day] || []).length,
            revenue: (byDay[day] || []).filter(o => o.status === 'completed').reduce((s, o) => s + (o.totalAmount || 0), 0)
        }));

        // ─── توزيع المنتجات حسب التصنيف ──────────────────────────────────
        const categoryDist = {};
        products.filter(p => p.status === 'active').forEach(p => {
            categoryDist[p.category] = (categoryDist[p.category] || 0) + 1;
        });

        // ─── أفضل الموردين ─────────────────────────────────────────────────
        const supplierRevenue = {};
        completedOrders.forEach(o => {
            if (o.supplierId) supplierRevenue[o.supplierId] = (supplierRevenue[o.supplierId] || 0) + (o.totalAmount || 0);
        });
        const topSuppliers = Object.entries(supplierRevenue)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([id, revenue]) => {
                const sup = suppliers.find(s => s.userId === id) || {};
                return { supplierId: id, name: sup.name || sup.businessName || 'غير معروف', revenue };
            });

        res.json({
            success: true,
            timestamp: new Date().toISOString(),
            kpis: {
                users: {
                    total: users.length,
                    newThisMonth: usersThisMonth,
                    growth: growthRate(usersThisMonth, usersLastMonth),
                    buyers: users.filter(u => u.role === 'user' || u.role === 'buyer').length,
                    suppliers: users.filter(u => u.role === 'supplier').length,
                    admins: users.filter(u => u.role === 'admin').length
                },
                products: {
                    total: products.length,
                    active: activeProducts,
                    newThisMonth: productsThisMonth,
                    categories: Object.keys(categoryDist).length
                },
                orders: {
                    total: orders.length,
                    pending: pendingOrders.length,
                    completed: completedOrders.length,
                    thisMonth: ordersThisMonth.length,
                    growth: growthRate(ordersThisMonth.length, ordersLastMonth.length),
                    cancellationRate: orders.length > 0
                        ? Math.round((orders.filter(o => o.status === 'cancelled').length / orders.length) * 100)
                        : 0
                },
                revenue: {
                    total: Math.round(totalRevenue),
                    thisMonth: Math.round(revenueThisMonth),
                    lastMonth: Math.round(revenueLastMonth),
                    growth: growthRate(revenueThisMonth, revenueLastMonth),
                    currency: 'SAR'
                },
                suppliers: {
                    total: suppliers.length,
                    verified: suppliers.filter(s => s.verified).length,
                    active: suppliers.filter(s => s.status === 'active').length
                }
            },
            trends: { salesLast30Days: salesTrend },
            distributions: { categories: categoryDist },
            topSuppliers
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'خطأ في جلب التحليلات', error: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/analytics/supplier — تحليلات المورد الحالي
// ═══════════════════════════════════════════════════════════════════════════════
router.get('/supplier', authenticate, (req, res) => {
    try {
        const products = database.read('products') || [];
        const orders   = database.read('market_orders') || [];

        const myProducts = products.filter(p => p.supplierId === req.user.id);
        const myOrders   = orders.filter(o => o.supplierId === req.user.id);

        const now = new Date();
        const thisMonth = now.toISOString().slice(0, 7);
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 7);

        const completedOrders   = myOrders.filter(o => o.status === 'completed');
        const ordersThisMonth   = myOrders.filter(o => (o.createdAt || '').startsWith(thisMonth));
        const ordersLastMonth   = myOrders.filter(o => (o.createdAt || '').startsWith(lastMonth));
        const revenueThisMonth  = ordersThisMonth.filter(o => o.status === 'completed').reduce((s, o) => s + (o.totalAmount || 0), 0);
        const revenueLastMonth  = ordersLastMonth.filter(o => o.status === 'completed').reduce((s, o) => s + (o.totalAmount || 0), 0);

        // أفضل المنتجات مبيعاً
        const productOrderCount = {};
        myOrders.forEach(o => {
            (o.items || []).forEach(item => {
                if (item.productId) productOrderCount[item.productId] = (productOrderCount[item.productId] || 0) + 1;
            });
        });
        const topProducts = Object.entries(productOrderCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([id, count]) => {
                const p = myProducts.find(pr => pr.id === id) || {};
                return { productId: id, name: p.name || 'منتج', orders: count, views: p.views || 0 };
            });

        // اتجاه المبيعات
        const days30 = lastNDays(30);
        const byDay  = groupByDay(myOrders);
        const salesTrend = days30.map(day => ({
            date: day,
            orders: (byDay[day] || []).length,
            revenue: (byDay[day] || []).filter(o => o.status === 'completed').reduce((s, o) => s + (o.totalAmount || 0), 0)
        }));

        res.json({
            success: true,
            kpis: {
                products: {
                    total: myProducts.length,
                    active: myProducts.filter(p => p.status === 'active').length,
                    totalViews: myProducts.reduce((s, p) => s + (p.views || 0), 0)
                },
                orders: {
                    total: myOrders.length,
                    pending: myOrders.filter(o => o.status === 'pending').length,
                    completed: completedOrders.length,
                    thisMonth: ordersThisMonth.length,
                    growth: growthRate(ordersThisMonth.length, ordersLastMonth.length)
                },
                revenue: {
                    total: Math.round(completedOrders.reduce((s, o) => s + (o.totalAmount || 0), 0)),
                    thisMonth: Math.round(revenueThisMonth),
                    lastMonth: Math.round(revenueLastMonth),
                    growth: growthRate(revenueThisMonth, revenueLastMonth),
                    currency: 'SAR'
                }
            },
            topProducts,
            trends: { salesLast30Days: salesTrend }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'خطأ في جلب تحليلاتك', error: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/analytics/buyer — تحليلات المشتري الحالي
// ═══════════════════════════════════════════════════════════════════════════════
router.get('/buyer', authenticate, (req, res) => {
    try {
        const orders = database.read('market_orders') || [];
        const myOrders = orders.filter(o => o.buyerId === req.user.id);

        const completedOrders = myOrders.filter(o => o.status === 'completed');
        const totalSpent      = completedOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);

        // أكثر المنتجات شراءً
        const boughtProducts = {};
        myOrders.forEach(o => {
            (o.items || []).forEach(item => {
                if (item.productId) {
                    boughtProducts[item.productId] = boughtProducts[item.productId] || { name: item.productName, count: 0, total: 0 };
                    boughtProducts[item.productId].count += 1;
                    boughtProducts[item.productId].total += (item.quantity || 0) * (item.unitPrice || 0);
                }
            });
        });

        const topPurchased = Object.entries(boughtProducts)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 5)
            .map(([id, data]) => ({ productId: id, ...data }));

        res.json({
            success: true,
            kpis: {
                orders: {
                    total: myOrders.length,
                    active: myOrders.filter(o => !['completed', 'cancelled', 'refunded'].includes(o.status)).length,
                    completed: completedOrders.length,
                    cancelled: myOrders.filter(o => o.status === 'cancelled').length
                },
                spending: {
                    total: Math.round(totalSpent),
                    currency: 'SAR',
                    averageOrder: completedOrders.length > 0 ? Math.round(totalSpent / completedOrders.length) : 0
                }
            },
            topPurchased,
            recentOrders: myOrders.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1)).slice(0, 5)
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'خطأ في جلب تحليلاتك', error: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/analytics/market — مؤشرات السوق العامة (متاح للجميع)
// ═══════════════════════════════════════════════════════════════════════════════
router.get('/market', (req, res) => {
    try {
        const products  = database.read('products')      || [];
        const orders    = database.read('market_orders') || [];
        const suppliers = database.read('suppliers')     || [];

        const activeProducts  = products.filter(p => p.status === 'active');
        const completedOrders = orders.filter(o => o.status === 'completed');

        const defaultPrices = {
            gold:     { price: 285.40, change: '+1.2%', unit: 'g',  currency: 'SAR' },
            silver:   { price: 3.12,   change: '+0.8%', unit: 'g',  currency: 'SAR' },
            copper:   { price: 42.80,  change: '-0.3%', unit: 'kg', currency: 'SAR' },
            aluminum: { price: 28.50,  change: '+0.5%', unit: 'kg', currency: 'SAR' },
            iron:     { price: 3.20,   change: '+0.1%', unit: 'kg', currency: 'SAR' }
        };

        // جلب أسعار مخصصة من قاعدة البيانات إن وجدت
        const storedPrices = database.read('market_prices') || {};
        const prices = Object.assign({}, defaultPrices, storedPrices);

        res.json({
            success: true,
            market: {
                totalProducts: activeProducts.length,
                totalSuppliers: suppliers.filter(s => s.status === 'active').length,
                verifiedSuppliers: suppliers.filter(s => s.verified).length,
                totalTransactions: completedOrders.length,
                categories: [...new Set(activeProducts.map(p => p.category))].length
            },
            prices,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'خطأ في جلب مؤشرات السوق', error: err.message });
    }
});

module.exports = router;
