#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 *  🌱 Sheikha Market — بذر بيانات تجريبية أولية
 *  Seed Script: يُضيف موردين وتجاراً ومنتجات وطلبات للتجربة والاختبار
 *  التشغيل: node scripts/seed-market-data.js
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const http   = require('http');
const crypto = require('crypto');

const BASE = process.env.SEED_BASE_URL || 'http://localhost:8080';
const SEED_PASSWORD = process.env.SEED_PASSWORD || 'Sheikha@Seed2026!';

// ─── بيانات البذر ─────────────────────────────────────────────────────────────
const SEED_SUPPLIERS = [
    {
        name: 'شركة النور للمعادن',
        email: 'alnoor@sheikha.seed',
        businessType: 'company',
        description: 'شركة رائدة في تجارة المعادن والسكراب منذ 2010. متخصصون في الحديد والنحاس.',
        city: 'الرياض', region: 'الرياض',
        categories: ['iron', 'copper', 'scrap'],
        phone: '+966501111001'
    },
    {
        name: 'مصنع الخليج للألومنيوم',
        email: 'khalij@sheikha.seed',
        businessType: 'factory',
        description: 'مصنع متخصص في الألومنيوم بجميع أشكاله وسبائكه للمشاريع الكبرى.',
        city: 'جدة', region: 'مكة المكرمة',
        categories: ['aluminum', 'industrial'],
        phone: '+966502222002'
    },
    {
        name: 'تاجر المعادن النفيسة',
        email: 'noble@sheikha.seed',
        businessType: 'individual',
        description: 'تخصص في الذهب والفضة وفق أحكام الشريعة الإسلامية. لا ربا ولا غرر.',
        city: 'المدينة المنورة', region: 'المدينة المنورة',
        categories: ['gold', 'silver'],
        phone: '+966503333003'
    }
];

const SEED_PRODUCTS = [
    // النور للمعادن
    { name: 'حديد مقاطع A-grade', category: 'iron', price: 3.50, unit: 'kg', quantity: 50000, grade: 'Grade A', description: 'حديد مقاطع مطابق للمواصفات السعودية SASO. متوفر بأحجام 6–16mm', currency: 'SAR', region: 'الرياض' },
    { name: 'نحاس أصفر خردة', category: 'copper', price: 28.00, unit: 'kg', quantity: 8000, grade: 'Mixed', description: 'نحاس أصفر خردة مطلوب نقاء 60-80%', currency: 'SAR', region: 'الرياض' },
    { name: 'سكراب حديد ثقيل', category: 'scrap', price: 1.80, unit: 'kg', quantity: 120000, description: 'سكراب حديد ثقيل من مواقع البناء. يُستلم بالمصنع', currency: 'SAR', region: 'الرياض' },

    // الخليج للألومنيوم
    { name: 'ألومنيوم 6061-T6', category: 'aluminum', price: 32.00, unit: 'kg', quantity: 15000, grade: '6061-T6', description: 'سبيكة ألومنيوم 6061-T6 للتطبيقات الصناعية والبناء الهيكلي. شهادة جودة ISO', currency: 'SAR', region: 'جدة' },
    { name: 'ألومنيوم ورق رول', category: 'aluminum', price: 38.50, unit: 'kg', quantity: 5000, grade: '1100-H14', description: 'رول ألومنيوم 0.5mm للتغليف والتصنيع. متوفر بعرض 1m', currency: 'SAR', region: 'جدة' },
    { name: 'مقاطع ألومنيوم بثق', category: 'industrial', price: 45.00, unit: 'kg', quantity: 3000, grade: '6063-T5', description: 'مقاطع بثق ألومنيوم مخصصة للنوافذ والأبواب. يمكن التصنيع حسب الطلب', currency: 'SAR', region: 'جدة' },

    // المعادن النفيسة
    { name: 'ذهب 24 قيراط سبائك', category: 'gold', price: 285.00, unit: 'gram', quantity: 500, grade: '999.9', description: 'سبائك ذهب 24 قيراط نقاء 999.9 مع شهادة مصافي معتمدة. حلال 100% لا ربا', currency: 'SAR', region: 'المدينة المنورة', minQuantity: 10 },
    { name: 'فضة خالصة أقراص', category: 'silver', price: 3.10, unit: 'gram', quantity: 5000, grade: '999', description: 'فضة خالصة 999 على شكل أقراص. للمجوهرات والصناعة وحفظ القيمة', currency: 'SAR', region: 'المدينة المنورة', minQuantity: 100 }
];

const SEED_BUYER = {
    name: 'شركة الأمين للمقاولات',
    email: 'buyer@sheikha.seed',
    role: 'user'
};

// ─── Helper ──────────────────────────────────────────────────────────────────
function req(method, path, body = null, token = null) {
    return new Promise((resolve, reject) => {
        const url     = new URL(path, BASE);
        const data    = body ? JSON.stringify(body) : null;
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        if (data)  headers['Content-Length'] = Buffer.byteLength(data);

        const options = {
            hostname: url.hostname,
            port: url.port || 80,
            path: url.pathname,
            method, headers,
            timeout: 10000
        };

        const r = http.request(options, (res) => {
            let raw = '';
            res.on('data', c => (raw += c));
            res.on('end', () => {
                try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
                catch { resolve({ status: res.statusCode, body: raw }); }
            });
        });

        r.on('timeout', () => { r.destroy(); reject(new Error(`Timeout: ${method} ${path}`)); });
        r.on('error', reject);
        if (data) r.write(data);
        r.end();
    });
}

// ─── تشغيل البذر ──────────────────────────────────────────────────────────────
async function seed() {
    console.log('');
    console.log('═'.repeat(55));
    console.log('🌱 Sheikha Market — بذر البيانات التجريبية');
    console.log(`🌐 ${BASE}`);
    console.log('═'.repeat(55));

    // التحقق من الخادم
    try {
        const r = await req('GET', '/api/health');
        if (!r.body.success && !r.body.status) throw new Error('invalid response');
        console.log('✅ الخادم يعمل');
    } catch {
        console.error('❌ الخادم غير متاح على:', BASE);
        process.exit(1);
    }

    const supplierTokens = [];
    const productIds = [];

    // ─── 1. إنشاء الموردين ────────────────────────────────────────────────────
    console.log('\n📌 (1/4) إنشاء حسابات الموردين...');
    for (const sup of SEED_SUPPLIERS) {
        let token = null;

        // تسجيل أو دخول
        let r = await req('POST', '/api/auth/register', { name: sup.name, email: sup.email, password: SEED_PASSWORD, role: 'supplier' });
        if (r.status === 409) {
            r = await req('POST', '/api/auth/login', { email: sup.email, password: SEED_PASSWORD });
        }

        if (!r.body.token) { console.log(`  ⚠️ ${sup.name} — تعذّر (${r.body.message || r.status})`); continue; }

        token = r.body.token;
        console.log(`  ✅ ${sup.name}`);

        // تسجيل ملف المورد
        const rSup = await req('POST', '/api/suppliers/register', {
            name: sup.name, businessType: sup.businessType,
            description: sup.description, city: sup.city,
            phone: sup.phone, categories: sup.categories
        }, token);

        if (rSup.status === 201 || rSup.status === 200 || rSup.status === 409) {
            supplierTokens.push({ name: sup.name, token });
        }
    }

    // ─── 2. إضافة المنتجات ────────────────────────────────────────────────────
    console.log('\n📌 (2/4) إضافة المنتجات التجريبية...');
    for (let i = 0; i < SEED_PRODUCTS.length; i++) {
        const prod = SEED_PRODUCTS[i];
        const supIdx = Math.floor(i / (SEED_PRODUCTS.length / supplierTokens.length));
        const { token, name } = supplierTokens[Math.min(supIdx, supplierTokens.length - 1)];

        const r = await req('POST', '/api/catalog', prod, token);
        if (r.status === 201 || r.status === 200) {
            productIds.push(r.body.product?.id);
            console.log(`  ✅ ${prod.name} (${name})`);
        } else {
            console.log(`  ⚠️ ${prod.name} — ${r.body.message || r.status}`);
        }
    }

    // ─── 3. إنشاء المشتري ────────────────────────────────────────────────────
    console.log('\n📌 (3/4) إنشاء حساب المشتري...');
    let buyerToken = null;

    let r = await req('POST', '/api/auth/register', { ...SEED_BUYER, password: SEED_PASSWORD });
    if (r.status === 409) {
        r = await req('POST', '/api/auth/login', { email: SEED_BUYER.email, password: SEED_PASSWORD });
    }

    if (r.body.token) {
        buyerToken = r.body.token;
        console.log(`  ✅ ${SEED_BUYER.name}`);
    }

    // ─── 4. إنشاء طلبات تجريبية ─────────────────────────────────────────────
    if (buyerToken && productIds.length > 0) {
        console.log('\n📌 (4/4) إنشاء طلبات تجريبية...');
        const ordersToCreate = productIds.slice(0, 3); // أول 3 منتجات

        for (const pid of ordersToCreate) {
            if (!pid) continue;
            const r = await req('POST', '/api/market-orders', {
                productId: pid,
                quantity: Math.floor(Math.random() * 500) + 100,
                notes: 'طلب تجريبي من البذر الأولي'
            }, buyerToken);

            if (r.status === 201 || r.status === 200) {
                console.log(`  ✅ طلب: ${r.body.order?.orderNumber}`);
            } else {
                console.log(`  ⚠️ طلب — ${r.body.message || r.status}`);
            }
        }
    }

    // ─── ملخص ──────────────────────────────────────────────────────────────────
    console.log('\n' + '═'.repeat(55));
    console.log('✅ اكتمل البذر!');
    console.log('');
    console.log('📋 بيانات الدخول للاختبار:');
    console.log('');
    console.log(`  المشتري:   ${SEED_BUYER.email}  /  ${SEED_PASSWORD}`);
    SEED_SUPPLIERS.forEach(s => {
        console.log(`  مورد:      ${s.email}  /  ${SEED_PASSWORD}`);
    });
    console.log('');
    console.log('🌐 البوابة العامة:  /portal.html');
    console.log('🛠️  لوحة المشرف:   /admin/market-control.html');
    console.log('📚 توثيق API:      /docs/API-REFERENCE.md');
    console.log('═'.repeat(55));
}

seed().catch(err => {
    console.error('خطأ:', err.message);
    process.exit(1);
});
