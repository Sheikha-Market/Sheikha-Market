#!/usr/bin/env node
/**
 * بسم الله الرحمن الرحيم
 *
 * سكربت بذر البيانات التجريبية — المرحلة Beta
 * Beta Data Seeding Script
 *
 * الغرض: إنشاء بيانات تجريبية واقعية للمرحلة التجريبية
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('\n🌱 بدء بذر البيانات التجريبية...\n');

// مسارات البيانات
const dataDir = path.join(__dirname, '../data');

// التأكد من وجود المجلدات
const dirs = ['traders', 'companies', 'listings', 'users'];
dirs.forEach(dir => {
    const dirPath = path.join(dataDir, dir);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
});

// ═══════════════════════════════════════════════════════════════
// 1️⃣ التجار التجريبيون (20 تاجر)
// ═══════════════════════════════════════════════════════════════

const traders = [];
const traderNames = [
    'محمد بن عبدالله العتيبي',
    'أحمد بن سعد القحطاني',
    'خالد بن فهد الدوسري',
    'عبدالرحمن بن عمر الشمري',
    'سلطان بن راشد المطيري',
    'فيصل بن ناصر الزهراني',
    'عبدالعزيز بن إبراهيم الغامدي',
    'محمد بن صالح العنزي',
    'طارق بن ماجد الحربي',
    'يوسف بن علي السبيعي',
    'سعد بن محمد الدوسري',
    'عبدالله بن خالد الشهراني',
    'ماجد بن فهد العتيبي',
    'نواف بن سعود القرشي',
    'بندر بن عبدالعزيز المالكي',
    'تركي بن فيصل الجهني',
    'راشد بن سلطان الحربي',
    'فهد بن بندر القحطاني',
    'ناصر بن محمد العنزي',
    'سلمان بن خالد الدوسري'
];

const cities = ['الرياض', 'جدة', 'الدمام', 'مكة', 'المدينة', 'الخبر', 'الطائف'];
const specialties = [
    'حديد',
    'نحاس',
    'ألمنيوم',
    'رصاص',
    'نيكل',
    'سكراب سيارات',
    'سكراب مباني',
    'معادن نادرة'
];

traderNames.forEach((name, i) => {
    const trader = {
        id: `TRADER-BETA-${Date.now()}-${i}`,
        name: name,
        username: `trader${i + 1}`,
        email: `trader${i + 1}@sheikha.top`,
        phone: `+966${50 + i}000${1000 + i}`,
        city: cities[i % cities.length],
        specialty: specialties[i % specialties.length],
        rating: (3 + Math.random() * 2).toFixed(1),
        totalTrades: Math.floor(Math.random() * 100),
        joinedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        verified: true,
        status: 'active'
    };
    traders.push(trader);
});

fs.writeFileSync(
    path.join(dataDir, 'traders/beta-traders.json'),
    JSON.stringify({ traders: traders, count: traders.length }, null, 2)
);

console.log(`✅ تم إنشاء ${traders.length} تاجر تجريبي`);

// ═══════════════════════════════════════════════════════════════
// 2️⃣ المنتجات والإعلانات (50 منتج)
// ═══════════════════════════════════════════════════════════════

const listings = [];
const metals = [
    { name: 'حديد', hscode: '7207', unit: 'طن', priceRange: [1500, 2500] },
    { name: 'نحاس', hscode: '7403', unit: 'كجم', priceRange: [25, 35] },
    { name: 'ألمنيوم', hscode: '7601', unit: 'كجم', priceRange: [8, 12] },
    { name: 'رصاص', hscode: '7801', unit: 'كجم', priceRange: [5, 8] },
    { name: 'زنك', hscode: '7901', unit: 'كجم', priceRange: [10, 15] },
    { name: 'نيكل', hscode: '7502', unit: 'كجم', priceRange: [70, 90] },
    { name: 'قصدير', hscode: '8001', unit: 'كجم', priceRange: [90, 110] },
    { name: 'برونز', hscode: '7405', unit: 'كجم', priceRange: [20, 30] }
];

for (let i = 0; i < 50; i++) {
    const metal = metals[i % metals.length];
    const trader = traders[i % traders.length];
    const price = metal.priceRange[0] + Math.random() * (metal.priceRange[1] - metal.priceRange[0]);
    const quantity = Math.floor(100 + Math.random() * 1000);

    const listing = {
        id: `LISTING-BETA-${Date.now()}-${i}`,
        title: `${metal.name} ${['نقي', 'عالي الجودة', 'درجة أولى', 'ممتاز'][i % 4]}`,
        description: `${metal.name} نقي بجودة عالية، متوفر للتسليم الفوري في ${trader.city}`,
        seller: {
            id: trader.id,
            name: trader.name,
            city: trader.city,
            rating: trader.rating
        },
        metal: {
            name: metal.name,
            hscode: metal.hscode,
            purity: (95 + Math.random() * 5).toFixed(1) + '%'
        },
        price: {
            amount: parseFloat(price.toFixed(2)),
            currency: 'SAR',
            unit: metal.unit
        },
        quantity: {
            available: quantity,
            unit: metal.unit,
            minimum: Math.floor(quantity / 10)
        },
        location: trader.city,
        delivery: {
            available: true,
            cost: Math.floor(50 + Math.random() * 200),
            days: Math.floor(1 + Math.random() * 5)
        },
        images: [`/assets/metals/${metal.name.replace(' ', '-')}.jpg`],
        status: 'active',
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        views: Math.floor(Math.random() * 1000),
        inquiries: Math.floor(Math.random() * 50)
    };

    listings.push(listing);
}

fs.writeFileSync(
    path.join(dataDir, 'listings/beta-listings.json'),
    JSON.stringify({ listings: listings, count: listings.length }, null, 2)
);

console.log(`✅ تم إنشاء ${listings.length} إعلان منتج`);

// ═══════════════════════════════════════════════════════════════
// 3️⃣ الشركات (10 شركات)
// ═══════════════════════════════════════════════════════════════

const companies = [];
const companyTypes = [
    'مصنع إعادة تدوير',
    'شركة استيراد وتصدير',
    'مؤسسة تجارة معادن',
    'شركة مقاولات',
    'مصنع حديد ومعادن'
];

for (let i = 0; i < 10; i++) {
    const company = {
        id: `COMPANY-BETA-${Date.now()}-${i}`,
        name: `${companyTypes[i % companyTypes.length]} ${['النجاح', 'الأمل', 'البركة', 'الرخاء', 'التقدم'][i % 5]}`,
        crNumber: `${1010000000 + i}`,
        taxNumber: `${300000000000000 + i}`,
        type: companyTypes[i % companyTypes.length],
        city: cities[i % cities.length],
        address: `شارع ${['الملك فهد', 'العليا', 'التحلية', 'الأمير محمد بن عبدالعزيز'][i % 4]}`,
        phone: `+966${11 + i}000${1000 + i}`,
        email: `company${i + 1}@sheikha.top`,
        website: `https://company${i + 1}.sa`,
        employees: Math.floor(10 + Math.random() * 100),
        established: 2000 + Math.floor(Math.random() * 24),
        verified: true,
        status: 'active',
        services: ['شراء معادن', 'بيع سكراب', 'إعادة تدوير', 'تصدير'].slice(
            0,
            2 + Math.floor(Math.random() * 3)
        ),
        rating: (3.5 + Math.random() * 1.5).toFixed(1),
        totalTransactions: Math.floor(Math.random() * 500)
    };

    companies.push(company);
}

fs.writeFileSync(
    path.join(dataDir, 'companies/beta-companies.json'),
    JSON.stringify({ companies: companies, count: companies.length }, null, 2)
);

console.log(`✅ تم إنشاء ${companies.length} شركة`);

// ═══════════════════════════════════════════════════════════════
// 4️⃣ مناقصات RFQ (5 مناقصات)
// ═══════════════════════════════════════════════════════════════

const rfqs = [];

for (let i = 0; i < 5; i++) {
    const company = companies[i];
    const metal = metals[i % metals.length];

    const rfq = {
        id: `RFQ-BETA-${Date.now()}-${i}`,
        title: `مطلوب ${metal.name} بكمية كبيرة`,
        description: `نحن شركة ${company.name} نبحث عن موردين ${metal.name} بجودة عالية وكميات كبيرة`,
        buyer: {
            id: company.id,
            name: company.name,
            city: company.city
        },
        metal: {
            name: metal.name,
            hscode: metal.hscode
        },
        quantity: {
            needed: Math.floor(1000 + Math.random() * 10000),
            unit: metal.unit
        },
        budget: {
            min: metal.priceRange[0] * 0.9,
            max: metal.priceRange[1] * 1.1,
            currency: 'SAR'
        },
        deadline: new Date(
            Date.now() + (7 + Math.floor(Math.random() * 30)) * 24 * 60 * 60 * 1000
        ).toISOString(),
        status: 'open',
        bids: Math.floor(Math.random() * 10),
        createdAt: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString()
    };

    rfqs.push(rfq);
}

fs.writeFileSync(
    path.join(dataDir, 'listings/beta-rfqs.json'),
    JSON.stringify({ rfqs: rfqs, count: rfqs.length }, null, 2)
);

console.log(`✅ تم إنشاء ${rfqs.length} مناقصة (RFQ)`);

// ═══════════════════════════════════════════════════════════════
// 5️⃣ المعاملات التجريبية (30 معاملة)
// ═══════════════════════════════════════════════════════════════

const transactions = [];

for (let i = 0; i < 30; i++) {
    const listing = listings[i % listings.length];
    const buyer = traders[(i + 5) % traders.length];
    const quantity = Math.floor(listing.quantity.minimum * (1 + Math.random()));
    const totalAmount = listing.price.amount * quantity;

    const transaction = {
        id: `TXN-BETA-${Date.now()}-${i}`,
        listing: {
            id: listing.id,
            title: listing.title
        },
        seller: listing.seller,
        buyer: {
            id: buyer.id,
            name: buyer.name,
            city: buyer.city
        },
        quantity: quantity,
        unit: listing.price.unit,
        unitPrice: listing.price.amount,
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        currency: 'SAR',
        status: ['completed', 'pending', 'in-transit'][i % 3],
        createdAt: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000).toISOString(),
        shariahCompliant: true,
        blockchainHash: crypto
            .createHash('sha256')
            .update(`${listing.id}${buyer.id}${Date.now()}`)
            .digest('hex')
            .substring(0, 16)
    };

    transactions.push(transaction);
}

fs.writeFileSync(
    path.join(dataDir, 'transactions/beta-transactions.json'),
    JSON.stringify({ transactions: transactions, count: transactions.length }, null, 2)
);

console.log(`✅ تم إنشاء ${transactions.length} معاملة`);

// ═══════════════════════════════════════════════════════════════
// 📊 ملخص البيانات
// ═══════════════════════════════════════════════════════════════

const summary = {
    createdAt: new Date().toISOString(),
    purpose: 'بيانات تجريبية للمرحلة Beta',
    data: {
        traders: traders.length,
        listings: listings.length,
        companies: companies.length,
        rfqs: rfqs.length,
        transactions: transactions.length
    },
    totalValue: transactions.reduce((sum, t) => sum + t.totalAmount, 0),
    status: 'ready'
};

fs.writeFileSync(path.join(dataDir, 'beta-summary.json'), JSON.stringify(summary, null, 2));

console.log('\n═══════════════════════════════════════════════════════');
console.log('✅ تم بذر البيانات التجريبية بنجاح');
console.log('═══════════════════════════════════════════════════════');
console.log(`📊 الإحصائيات:`);
console.log(`   • ${traders.length} تاجر`);
console.log(`   • ${listings.length} إعلان`);
console.log(`   • ${companies.length} شركة`);
console.log(`   • ${rfqs.length} مناقصة`);
console.log(`   • ${transactions.length} معاملة`);
console.log(`   • ${summary.totalValue.toLocaleString()} ريال (إجمالي المعاملات)`);
console.log('═══════════════════════════════════════════════════════\n');
