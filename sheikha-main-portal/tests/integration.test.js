/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  🧪 اختبارات تكامل — Sheikha Market MVP Integration Tests
 *  رحلة المستخدم الكاملة: تسجيل → تصفح → إضافة منتج → طلب → تتبع
 *  يعمل بدون مكتبات خارجية — Node.js built-in http + assert
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const http   = require('http');
const assert = require('assert');
const crypto = require('crypto');
const { DEFAULT_COPILOT_PORT, DEFAULT_META_PORT, VERSION: NODE_LAYER_VERSION } = require('../core/sheikha-node-layer');

// ─── إعداد ───────────────────────────────────────────────────────────────────
const BASE = process.env.TEST_BASE_URL || 'http://localhost:8080';
const TIMEOUT_MS = parseInt(process.env.TEST_TIMEOUT_MS || '8000', 10);

// بيانات فريدة لكل تشغيل اختبار
const RUN_ID = Date.now().toString(36);
const BUYER_EMAIL    = `buyer-${RUN_ID}@test.sheikha.local`;
const SUPPLIER_EMAIL = `supplier-${RUN_ID}@test.sheikha.local`;
const ADMIN_EMAIL    = `admin-${RUN_ID}@test.sheikha.local`;
const ENTERPRISE_EMAIL = `enterprise-${RUN_ID}@test.sheikha.local`;
const TEST_PASSWORD  = 'TestPass@2026!';

let BUYER_TOKEN    = null;
let SUPPLIER_TOKEN = null;
let ENTERPRISE_TOKEN = null;
let BUYER_ID       = null;
let SUPPLIER_ID    = null;
let PRODUCT_ID     = null;
let ORDER_ID       = null;
let SUP_PROFILE_ID = null;

// ─── دالة HTTP مساعدة ─────────────────────────────────────────────────────────
function req(method, path, body = null, token = null) {
    return new Promise((resolve, reject) => {
        const url   = new URL(path, BASE);
        const data  = body ? JSON.stringify(body) : null;
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        if (data)  headers['Content-Length'] = Buffer.byteLength(data);

        const options = {
            hostname: url.hostname,
            port: url.port || 80,
            path: url.pathname + url.search,
            method,
            headers,
            timeout: TIMEOUT_MS
        };

        const r = http.request(options, (res) => {
            let raw = '';
            res.on('data', chunk => (raw += chunk));
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(raw) });
                } catch {
                    resolve({ status: res.statusCode, body: raw });
                }
            });
        });

        r.on('timeout', () => { r.destroy(); reject(new Error(`Timeout: ${method} ${path}`)); });
        r.on('error', reject);

        if (data) r.write(data);
        r.end();
    });
}

// ─── دوال مساعدة ──────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;

async function test(name, fn) {
    try {
        await fn();
        console.log(`  ✅ ${name}`);
        passed++;
    } catch (err) {
        console.error(`  ❌ ${name}`);
        console.error(`     ${err.message}`);
        failed++;
    }
}

function group(title) {
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`📦 ${title}`);
    console.log('─'.repeat(60));
}

// ═══════════════════════════════════════════════════════════════════════════════
// المجموعة 0 — التحقق من صحة الخادم
// ═══════════════════════════════════════════════════════════════════════════════
async function testHealth() {
    group('0. صحة الخادم — Server Health');

    await test('GET /api/health → 200', async () => {
        const r = await req('GET', '/api/health');
        assert.ok(r.status === 200, `Expected 200, got ${r.status}`);
        assert.ok(r.body.status, 'Missing status field');
    });

    await test('GET /api/market-analytics/market → 200', async () => {
        const r = await req('GET', '/api/market-analytics/market');
        assert.ok(r.status === 200, `Expected 200, got ${r.status}`);
        assert.ok(r.body.success, 'Expected success:true');
        assert.ok(r.body.market, 'Missing market field');
        assert.ok(r.body.prices, 'Missing prices field');
    });

    await test('GET /api/catalog/categories → 200', async () => {
        const r = await req('GET', '/api/catalog/categories');
        assert.ok(r.status === 200, `Expected 200, got ${r.status}`);
        assert.ok(Array.isArray(r.body.categories), 'categories should be array');
        assert.ok(r.body.categories.length > 0, 'categories should not be empty');
    });

    await test('GET /api/sheikha/status → اللوحة الكونية الشاملة — v2.0.0', async () => {
        const r = await req('GET', '/api/sheikha/status');
        assert.ok(r.status === 200, `Expected 200, got ${r.status}`);
        assert.ok(r.body.success, 'Expected success:true');
        // الطبقة الكونية
        assert.ok(r.body.sheikhaNode, 'Missing sheikhaNode field');
        assert.ok(r.body.sheikhaNode.layer === 'sheikha-node', 'Unexpected sheikhaNode layer');
        assert.ok(r.body.sheikhaNode.version === NODE_LAYER_VERSION, `Unexpected sheikhaNode version — يجب أن تكون ${NODE_LAYER_VERSION}`);
        assert.ok(r.body.sheikhaNode.rank === 'COSMIC-SUPREME', 'Missing COSMIC-SUPREME rank');
        // الخوادم الخلفية
        assert.ok(Array.isArray(r.body.backgroundServers), 'backgroundServers should be array');
        assert.ok(r.body.backgroundServers.length >= 2, 'backgroundServers should include background services');
        const backgroundPorts = r.body.backgroundServers.map(server => server.port).sort((a, b) => a - b);
        const expectedBackgroundPorts = [DEFAULT_COPILOT_PORT, DEFAULT_META_PORT].sort((a, b) => a - b);
        assert.deepStrictEqual(
            backgroundPorts,
            expectedBackgroundPorts,
            `Unexpected background ports: ${backgroundPorts.join(',')}`
        );
        // الشبكة العصبية الجذرية
        assert.ok(r.body.engines && r.body.engines.rootNeuralCellNetwork, 'Missing rootNeuralCellNetwork engine status');
        assert.ok(r.body.engines.rootNeuralCellNetwork.layers === 7, 'Unexpected rootNeuralCellNetwork layers');
        // الشبكات العصبية الكونية
        assert.ok(r.body.neuralNetworks, 'Missing neuralNetworks field');
        assert.ok(r.body.neuralNetworks.rootNCNLayer, 'Missing rootNCNLayer in neuralNetworks');
        assert.ok(r.body.neuralNetworks.universalNN, 'Missing universalNN in neuralNetworks');
        // إحصاءات الطاقة الكونية
        assert.ok(r.body.cosmicStats, 'Missing cosmicStats');
        assert.ok(typeof r.body.cosmicStats.totalNeuralCells === 'number', 'totalNeuralCells should be number');
        assert.ok(r.body.cosmicStats.totalNeuralCells > 0, 'totalNeuralCells should be > 0');
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// المجموعة 1 — تسجيل الحسابات
// ═══════════════════════════════════════════════════════════════════════════════
async function testRegistration() {
    group('1. تسجيل الحسابات — Account Registration');

    await test('POST /api/auth/register — مشتري جديد', async () => {
        const r = await req('POST', '/api/auth/register', {
            name: `مشتري اختبار ${RUN_ID}`,
            email: BUYER_EMAIL,
            password: TEST_PASSWORD,
            role: 'user'
        });
        assert.ok([200, 201].includes(r.status), `Expected 2xx, got ${r.status}: ${JSON.stringify(r.body)}`);
        assert.ok(r.body.token, 'Missing JWT token');
        assert.ok(r.body.user, 'Missing user object');
        BUYER_TOKEN = r.body.token;
        BUYER_ID    = r.body.user.id;
    });

    await test('POST /api/auth/register — مورد جديد', async () => {
        const r = await req('POST', '/api/auth/register', {
            name: `مورد اختبار ${RUN_ID}`,
            email: SUPPLIER_EMAIL,
            password: TEST_PASSWORD,
            role: 'supplier'
        });
        assert.ok([200, 201].includes(r.status), `Expected 2xx, got ${r.status}: ${JSON.stringify(r.body)}`);
        assert.ok(r.body.token, 'Missing JWT token');
        SUPPLIER_TOKEN = r.body.token;
        SUPPLIER_ID    = r.body.user.id;
    });

    await test('POST /api/auth/register — حساب مؤسسي', async () => {
        const r = await req('POST', '/api/auth/register', {
            name: `مؤسسي اختبار ${RUN_ID}`,
            email: ENTERPRISE_EMAIL,
            password: TEST_PASSWORD,
            role: 'enterprise'
        });
        assert.ok([200, 201].includes(r.status), `Expected 2xx, got ${r.status}: ${JSON.stringify(r.body)}`);
        assert.ok(r.body.token, 'Missing JWT token');
        ENTERPRISE_TOKEN = r.body.token;
    });

    await test('تسجيل بريد مكرر → 409', async () => {
        const r = await req('POST', '/api/auth/register', {
            name: 'مكرر',
            email: BUYER_EMAIL,
            password: TEST_PASSWORD
        });
        assert.ok(r.status === 409, `Expected 409, got ${r.status}`);
    });

    await test('تسجيل بدون بيانات مطلوبة → 400', async () => {
        const r = await req('POST', '/api/auth/register', { name: 'ناقص' });
        assert.ok(r.status === 400, `Expected 400, got ${r.status}`);
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// المجموعة 2 — تسجيل الدخول
// ═══════════════════════════════════════════════════════════════════════════════
async function testLogin() {
    group('2. تسجيل الدخول — Authentication');

    await test('POST /api/auth/login — بيانات صحيحة', async () => {
        const r = await req('POST', '/api/auth/login', {
            email: BUYER_EMAIL,
            password: TEST_PASSWORD
        });
        assert.ok([200, 201].includes(r.status), `Expected 2xx, got ${r.status}: ${JSON.stringify(r.body)}`);
        assert.ok(r.body.token, 'Missing JWT token');
    });

    await test('POST /api/auth/login — كلمة مرور خاطئة → 401', async () => {
        const r = await req('POST', '/api/auth/login', {
            email: BUYER_EMAIL,
            password: 'wrongpassword999'
        });
        assert.ok([400, 401, 403, 429].includes(r.status), `Expected 4xx, got ${r.status}`);
    });

    await test('مسار محمي بدون توكن → 401', async () => {
        const r = await req('GET', '/api/market-orders');
        assert.ok(r.status === 401, `Expected 401, got ${r.status}`);
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// المجموعة 3 — تسجيل المورد
// ═══════════════════════════════════════════════════════════════════════════════
async function testSupplierRegistration() {
    group('3. تسجيل المورد — Supplier Profile');

    await test('POST /api/suppliers/register — تسجيل ملف مورد', async () => {
        const r = await req('POST', '/api/suppliers/register', {
            name: `شركة اختبار ${RUN_ID}`,
            businessType: 'company',
            description: 'شركة اختبار للمعادن والسكراب',
            city: 'الرياض',
            categories: ['iron', 'copper']
        }, SUPPLIER_TOKEN);
        assert.ok([200, 201].includes(r.status), `Expected 2xx, got ${r.status}: ${JSON.stringify(r.body)}`);
        assert.ok(r.body.profile, 'Missing profile object');
        SUP_PROFILE_ID = r.body.profile.id;
    });

    await test('GET /api/suppliers/me — جلب ملفي', async () => {
        const r = await req('GET', '/api/suppliers/me', null, SUPPLIER_TOKEN);
        assert.ok(r.status === 200, `Expected 200, got ${r.status}: ${JSON.stringify(r.body)}`);
        assert.ok(r.body.profile, 'Missing profile');
    });

    await test('GET /api/suppliers — قائمة الموردين العامة', async () => {
        const r = await req('GET', '/api/suppliers');
        assert.ok(r.status === 200, `Expected 200, got ${r.status}`);
        assert.ok(Array.isArray(r.body.suppliers), 'suppliers should be array');
    });

    await test('تسجيل مكرر → 409', async () => {
        const r = await req('POST', '/api/suppliers/register', {
            name: 'مكرر'
        }, SUPPLIER_TOKEN);
        assert.ok(r.status === 409, `Expected 409, got ${r.status}`);
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// المجموعة 4 — كتالوج المنتجات
// ═══════════════════════════════════════════════════════════════════════════════
async function testProductCatalog() {
    group('4. كتالوج المنتجات — Product Catalog');

    await test('POST /api/catalog — إضافة منتج', async () => {
        const r = await req('POST', '/api/catalog', {
            name: `حديد مقاطع اختبار ${RUN_ID}`,
            category: 'iron',
            price: 3.5,
            currency: 'SAR',
            unit: 'kg',
            quantity: 5000,
            grade: 'Grade A',
            description: 'حديد مقاطع جودة عالية للاختبار',
            region: 'الرياض'
        }, SUPPLIER_TOKEN);
        assert.ok([200, 201].includes(r.status), `Expected 2xx, got ${r.status}: ${JSON.stringify(r.body)}`);
        assert.ok(r.body.product, 'Missing product object');
        assert.ok(r.body.product.id, 'Missing product ID');
        PRODUCT_ID = r.body.product.id;
    });

    await test('GET /api/catalog — قائمة المنتجات', async () => {
        const r = await req('GET', '/api/catalog');
        assert.ok(r.status === 200, `Expected 200, got ${r.status}`);
        assert.ok(Array.isArray(r.body.products), 'products should be array');
        assert.ok(typeof r.body.total === 'number', 'Missing total');
    });

    await test('GET /api/catalog/search?q=حديد — بحث نصي', async () => {
        const r = await req('GET', '/api/catalog/search?q=حديد');
        assert.ok(r.status === 200, `Expected 200, got ${r.status}`);
        assert.ok(Array.isArray(r.body.products), 'products should be array');
    });

    await test('GET /api/catalog?category=iron — فلتر تصنيف', async () => {
        const r = await req('GET', '/api/catalog?category=iron');
        assert.ok(r.status === 200, `Expected 200, got ${r.status}`);
        if (r.body.products.length > 0) {
            assert.ok(r.body.products.every(p => p.category === 'iron'), 'All products should be iron');
        }
    });

    await test('GET /api/catalog/:id — تفاصيل منتج', async () => {
        if (!PRODUCT_ID) { throw new Error('No product ID from previous test'); }
        const r = await req('GET', `/api/catalog/${PRODUCT_ID}`);
        assert.ok(r.status === 200, `Expected 200, got ${r.status}`);
        assert.ok(r.body.product.id === PRODUCT_ID, 'Wrong product ID');
    });

    await test('GET /api/catalog/supplier/my — منتجاتي', async () => {
        const r = await req('GET', '/api/catalog/supplier/my', null, SUPPLIER_TOKEN);
        assert.ok(r.status === 200, `Expected 200, got ${r.status}`);
        assert.ok(r.body.products.some(p => p.id === PRODUCT_ID), 'My product should be in list');
    });

    await test('إضافة منتج بدون توكن → 401', async () => {
        const r = await req('POST', '/api/catalog', { name: 'غير مسموح', category: 'iron' });
        assert.ok(r.status === 401, `Expected 401, got ${r.status}`);
    });

    await test('إضافة منتج ببيانات ناقصة → 400', async () => {
        const r = await req('POST', '/api/catalog', { price: 10 }, SUPPLIER_TOKEN);
        assert.ok(r.status === 400, `Expected 400, got ${r.status}`);
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// المجموعة 5 — إدارة الطلبات
// ═══════════════════════════════════════════════════════════════════════════════
async function testOrders() {
    group('5. إدارة الطلبات — Order Management');

    await test('POST /api/market-orders — إنشاء طلب', async () => {
        if (!PRODUCT_ID) { throw new Error('No product ID from previous test'); }
        const r = await req('POST', '/api/market-orders', {
            productId: PRODUCT_ID,
            quantity: 100,
            notes: 'طلب اختبار — يُرجى التجاهل'
        }, BUYER_TOKEN);
        assert.ok([200, 201].includes(r.status), `Expected 2xx, got ${r.status}: ${JSON.stringify(r.body)}`);
        assert.ok(r.body.order, 'Missing order object');
        assert.ok(r.body.order.id, 'Missing order ID');
        assert.ok(r.body.order.status === 'pending', 'Initial status should be pending');
        ORDER_ID = r.body.order.id;
    });

    await test('GET /api/market-orders — قائمة طلباتي', async () => {
        const r = await req('GET', '/api/market-orders', null, BUYER_TOKEN);
        assert.ok(r.status === 200, `Expected 200, got ${r.status}`);
        assert.ok(Array.isArray(r.body.orders), 'orders should be array');
    });

    await test('GET /api/market-orders/buyer/my — طلباتي كمشتري', async () => {
        const r = await req('GET', '/api/market-orders/buyer/my', null, BUYER_TOKEN);
        assert.ok(r.status === 200, `Expected 200, got ${r.status}`);
        assert.ok(r.body.orders.some(o => o.id === ORDER_ID), 'My order should be in list');
    });

    await test('GET /api/market-orders/:id — تفاصيل طلب', async () => {
        if (!ORDER_ID) { throw new Error('No order ID'); }
        const r = await req('GET', `/api/market-orders/${ORDER_ID}`, null, BUYER_TOKEN);
        assert.ok(r.status === 200, `Expected 200, got ${r.status}`);
        assert.ok(r.body.order.id === ORDER_ID, 'Wrong order ID');
    });

    await test('PUT /api/market-orders/:id/status — تحديث الحالة (مورد يؤكد)', async () => {
        if (!ORDER_ID) { throw new Error('No order ID'); }
        const r = await req('PUT', `/api/market-orders/${ORDER_ID}/status`, {
            status: 'confirmed',
            note: 'تم التأكيد'
        }, SUPPLIER_TOKEN);
        assert.ok(r.status === 200, `Expected 200, got ${r.status}: ${JSON.stringify(r.body)}`);
        assert.ok(r.body.order.status === 'confirmed', 'Status should be confirmed');
    });

    await test('انتقال حالة غير مسموح → 400', async () => {
        if (!ORDER_ID) { throw new Error('No order ID'); }
        // لا يمكن الانتقال من confirmed إلى completed مباشرة
        const r = await req('PUT', `/api/market-orders/${ORDER_ID}/status`, {
            status: 'completed'
        }, SUPPLIER_TOKEN);
        assert.ok(r.status === 400, `Expected 400, got ${r.status}`);
    });

    await test('GET /api/market-orders/supplier/my — طلباتي كمورد', async () => {
        const r = await req('GET', '/api/market-orders/supplier/my', null, SUPPLIER_TOKEN);
        assert.ok(r.status === 200, `Expected 200, got ${r.status}`);
        assert.ok(r.body.orders.some(o => o.id === ORDER_ID), 'My order should be in supplier list');
    });

    await test('عرض طلب شخص آخر → 403', async () => {
        if (!ORDER_ID) { throw new Error('No order ID'); }
        // مستخدم غير مرتبط بالطلب
        const r = await req('GET', `/api/market-orders/${ORDER_ID}`, null, null);
        assert.ok([401, 403].includes(r.status), `Expected 401/403, got ${r.status}`);
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// المجموعة 6 — التحليلات والمؤشرات
// ═══════════════════════════════════════════════════════════════════════════════
async function testAnalytics() {
    group('6. التحليلات والمؤشرات — Analytics & KPIs');

    await test('GET /api/market-analytics/market — مؤشرات السوق العامة', async () => {
        const r = await req('GET', '/api/market-analytics/market');
        assert.ok(r.status === 200, `Expected 200, got ${r.status}`);
        assert.ok(r.body.market, 'Missing market object');
        assert.ok(r.body.prices, 'Missing prices');
        assert.ok(typeof r.body.market.totalProducts === 'number', 'totalProducts should be number');
    });

    await test('GET /api/market-analytics/supplier — تحليلات المورد', async () => {
        const r = await req('GET', '/api/market-analytics/supplier', null, SUPPLIER_TOKEN);
        assert.ok(r.status === 200, `Expected 200, got ${r.status}`);
        assert.ok(r.body.kpis, 'Missing kpis');
        assert.ok(r.body.kpis.orders, 'Missing orders kpi');
        assert.ok(r.body.kpis.revenue, 'Missing revenue kpi');
    });

    await test('GET /api/market-analytics/buyer — تحليلات المشتري', async () => {
        const r = await req('GET', '/api/market-analytics/buyer', null, BUYER_TOKEN);
        assert.ok(r.status === 200, `Expected 200, got ${r.status}`);
        assert.ok(r.body.kpis, 'Missing kpis');
        assert.ok(r.body.kpis.orders, 'Missing orders kpi');
        assert.ok(r.body.kpis.spending, 'Missing spending kpi');
    });

    await test('GET /api/market-analytics/overview — نظرة المشرف (بدون توكن → 401)', async () => {
        const r = await req('GET', '/api/market-analytics/overview');
        assert.ok([401, 403].includes(r.status), `Expected 401/403, got ${r.status}`);
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// المجموعة 7 — تعديل وحذف المنتج
// ═══════════════════════════════════════════════════════════════════════════════
async function testProductManagement() {
    group('7. إدارة المنتجات — Product Management');

    await test('PUT /api/catalog/:id — تعديل منتج (صاحبه)', async () => {
        if (!PRODUCT_ID) { throw new Error('No product ID'); }
        const r = await req('PUT', `/api/catalog/${PRODUCT_ID}`, {
            price: 3.8,
            quantity: 4500,
            description: 'تم تعديله في الاختبار'
        }, SUPPLIER_TOKEN);
        assert.ok(r.status === 200, `Expected 200, got ${r.status}: ${JSON.stringify(r.body)}`);
        assert.ok(r.body.product.price === 3.8, 'Price should be updated');
    });

    await test('PUT /api/catalog/:id — تعديل منتج (مشتري → 403)', async () => {
        if (!PRODUCT_ID) { throw new Error('No product ID'); }
        const r = await req('PUT', `/api/catalog/${PRODUCT_ID}`, { price: 1 }, BUYER_TOKEN);
        assert.ok(r.status === 403, `Expected 403, got ${r.status}`);
    });

    await test('GET /api/catalog/:id — المنتج المعدّل', async () => {
        if (!PRODUCT_ID) { throw new Error('No product ID'); }
        const r = await req('GET', `/api/catalog/${PRODUCT_ID}`);
        assert.ok(r.status === 200, `Expected 200, got ${r.status}`);
        assert.ok(r.body.product.price === 3.8, 'Should see updated price');
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// المجموعة 8 — إلغاء الطلب
// ═══════════════════════════════════════════════════════════════════════════════
async function testOrderCancellation() {
    group('8. إلغاء الطلب — Order Cancellation');

    // نصنع طلباً جديداً للإلغاء
    let cancelOrderId = null;

    await test('إنشاء طلب جديد للإلغاء', async () => {
        if (!PRODUCT_ID) { throw new Error('No product ID'); }
        const r = await req('POST', '/api/market-orders', {
            productId: PRODUCT_ID,
            quantity: 50
        }, BUYER_TOKEN);
        assert.ok([200, 201].includes(r.status), `Expected 2xx, got ${r.status}: ${JSON.stringify(r.body)}`);
        cancelOrderId = r.body.order?.id;
        assert.ok(cancelOrderId, 'Missing order ID');
    });

    await test('PUT /api/market-orders/:id/cancel — إلغاء الطلب', async () => {
        if (!cancelOrderId) { throw new Error('No cancel order ID'); }
        const r = await req('PUT', `/api/market-orders/${cancelOrderId}/cancel`, {
            reason: 'اختبار الإلغاء'
        }, BUYER_TOKEN);
        assert.ok(r.status === 200, `Expected 200, got ${r.status}: ${JSON.stringify(r.body)}`);
    });

    await test('تأكيد حالة الطلب = cancelled', async () => {
        if (!cancelOrderId) { throw new Error('No cancel order ID'); }
        const r = await req('GET', `/api/market-orders/${cancelOrderId}`, null, BUYER_TOKEN);
        assert.ok(r.status === 200, `Expected 200`);
        assert.ok(r.body.order.status === 'cancelled', 'Order should be cancelled');
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// المجموعة 9 — التفعيل المؤسسي الموحّد
// ═══════════════════════════════════════════════════════════════════════════════
async function testTopEnterpriseIntegration() {
    group('9. التفعيل المؤسسي الموحّد — Top Enterprise Integration');

    let createdOrgId = null;

    await test('GET /api/top-enterprise/status — حالة موحّدة', async () => {
        const r = await req('GET', '/api/top-enterprise/status');
        assert.ok(r.status === 200, `Expected 200, got ${r.status}`);
        assert.ok(r.body.success, 'Expected success:true');
        assert.ok(r.body.model && r.body.model.enterpriseAccount, 'Missing enterpriseAccount model');
        assert.ok(r.body.model && r.body.model.organizationAccount, 'Missing organizationAccount model');
        assert.ok(r.body.model && r.body.model.domainProfile, 'Missing domainProfile model');
        assert.ok(r.body.model && r.body.model.neuralStatus, 'Missing neuralStatus model');
    });

    await test('POST /api/top-enterprise/activation/workflow — بدون توكن → 401', async () => {
        const r = await req('POST', '/api/top-enterprise/activation/workflow', {});
        assert.ok(r.status === 401, `Expected 401, got ${r.status}`);
    });

    await test('POST /api/top-enterprise/activation/workflow — فشل جزئي قبل تفعيل المنظمة', async () => {
        const r = await req('POST', '/api/top-enterprise/activation/workflow', {}, ENTERPRISE_TOKEN);
        assert.ok([200, 409].includes(r.status), `Expected 200/409, got ${r.status}`);
        assert.ok(r.body.report, 'Missing report');
    });

    await test('POST /api/organizations — إنشاء منظمة', async () => {
        const r = await req('POST', '/api/organizations', {
            nameAr: `منظمة اختبار ${RUN_ID}`,
            type: 'specialized',
            sector: 'technology'
        });
        assert.ok([200, 201].includes(r.status), `Expected 2xx, got ${r.status}: ${JSON.stringify(r.body)}`);
        assert.ok(r.body.organization && r.body.organization.id, 'Missing organization id');
        createdOrgId = r.body.organization.id;
    });

    await test('POST /api/organizations/:id/accept-charter — تفعيل المنظمة', async () => {
        const r = await req('POST', `/api/organizations/${createdOrgId}/accept-charter`, {
            acceptedBy: `enterprise-${RUN_ID}`,
            confirmations: {
                noRiba: true,
                noGharar: true,
                noGhish: true,
                noIhtikar: true,
                noDarar: true,
                acceptsKitabAndSunnah: true
            }
        });
        assert.ok(r.status === 200, `Expected 200, got ${r.status}`);
        assert.ok(r.body.success, 'Expected success:true');
    });

    await test('POST /api/top-enterprise/activation/retry — إعادة محاولة التفعيل', async () => {
        const r = await req('POST', '/api/top-enterprise/activation/retry', {}, ENTERPRISE_TOKEN);
        assert.ok([200, 409].includes(r.status), `Expected 200/409, got ${r.status}`);
        assert.ok(r.body.report, 'Missing report');
        assert.ok(['activated', 'partial-failure'].includes(r.body.report.status), 'Unexpected workflow status');
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// نقطة الدخول الرئيسية
// ═══════════════════════════════════════════════════════════════════════════════
async function main() {
    console.log('');
    console.log('═'.repeat(60));
    console.log('🧪 Sheikha Market — اختبارات التكامل الشاملة');
    console.log(`🌐 Base URL: ${BASE}`);
    console.log(`⏱  Timeout: ${TIMEOUT_MS}ms`);
    console.log(`🆔 Run ID: ${RUN_ID}`);
    console.log('═'.repeat(60));

    // التحقق من توفر الخادم
    try {
        await req('GET', '/api/health');
    } catch (err) {
        console.error('\n❌ الخادم غير متاح! تأكد من تشغيله على:', BASE);
        console.error('   node server.js أو npm start\n');
        process.exit(1);
    }

    const start = Date.now();

    await testHealth();
    await testRegistration();
    await testLogin();
    await testSupplierRegistration();
    await testProductCatalog();
    await testOrders();
    await testAnalytics();
    await testProductManagement();
    await testOrderCancellation();
    await testTopEnterpriseIntegration();

    const elapsed = ((Date.now() - start) / 1000).toFixed(1);

    console.log(`\n${'═'.repeat(60)}`);
    console.log(`📊 النتيجة النهائية: ${passed} نجح ، ${failed} فشل ، ${elapsed}s`);
    console.log('═'.repeat(60));

    if (failed > 0) {
        console.log('\n❌ بعض الاختبارات فشلت — راجع الأخطاء أعلاه');
        process.exit(1);
    } else {
        console.log('\n✅ جميع الاختبارات نجحت — المنظومة تعمل بكفاءة');
        process.exit(0);
    }
}

main().catch(err => {
    console.error('خطأ غير متوقع:', err);
    process.exit(1);
});
