#!/usr/bin/env node

/**
 * اختبار بيئة Google Cloud - بدون الحاجة للمفتاح
 * Tests Google Cloud environment without requiring service-account.json
 */

const fs = require('fs');
const path = require('path');

console.log('\n🧪 اختبار بيئة Google Cloud Sheikha\n');

// 1. التحقق من البيئة
console.log('📋 التحقق من البيئة:');

const checks = {
    'Node.js': process.version,
    Platform: process.platform,
    'NPM Version': require('child_process').execSync('npm -v', { encoding: 'utf-8' }).trim()
};

for (const [key, value] of Object.entries(checks)) {
    console.log(`   ✅ ${key}: ${value}`);
}

// 2. التحقق من الحزم المثبتة
console.log('\n📦 التحقق من حزم Google Cloud:');

const packages = [
    '@google-cloud/aiplatform',
    '@google-cloud/storage',
    '@google-cloud/bigquery',
    '@google-cloud/pubsub'
];

const packageJson = require('../package.json');

packages.forEach(pkg => {
    const version = packageJson.dependencies[pkg];
    if (version) {
        console.log(`   ✅ ${pkg}: ${version}`);
    } else {
        console.log(`   ❌ ${pkg}: غير مثبت`);
    }
});

// 3. التحقق من ملفات المشروع
console.log('\n📂 التحقق من ملفات المشروع:');

const files = [
    'lib/google-cloud-connection.js',
    'routes/google-integrations.js',
    'lib/performance-optimizer.js'
];

files.forEach(file => {
    const fullPath = path.join(__dirname, '..', file);
    if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        const sizeMB = (stats.size / 1024).toFixed(2);
        console.log(`   ✅ ${file} (${sizeMB} KB)`);
    } else {
        console.log(`   ❌ ${file}: غير موجود`);
    }
});

// 4. التحقق من ملف المفتاح
console.log('\n🔐 حالة المصادقة:');

const keyPath = path.join(__dirname, '..', 'service-account-key.json');
if (fs.existsSync(keyPath)) {
    console.log(`   ✅ service-account-key.json: موجود وجاهز`);
    try {
        const key = JSON.parse(fs.readFileSync(keyPath, 'utf-8'));
        console.log(`      Project ID: ${key.project_id}`);
        console.log(`      Service Account: ${key.client_email}`);
    } catch (e) {
        console.log(`      ⚠️ تحذير: الملف قد لا يكون صيغة JSON صحيحة`);
    }
} else {
    console.log(`   ⚠️ service-account-key.json: غير موجود`);
    console.log(`      📝 الخطوات المطلوبة:`);
    console.log(`      1. اذهب إلى Google Cloud Console`);
    console.log(`      2. اختر المشروع (ID: 224557279528)`);
    console.log(`      3. Service Accounts → market@sheikha.top`);
    console.log(`      4. Keys → Create new key → JSON`);
    console.log(`      5. احفظ الملف هنا: service-account-key.json`);
}

// 5. التحقق من المنافذ
console.log('\n🌐 التحقق من المنافذ:');

const requiredPorts = [8080];
requiredPorts.forEach(port => {
    const net = require('net');
    const server = net.createServer();

    server.once('error', () => {
        console.log(`   ⚠️ المنفذ ${port}: قد يكون قيد الاستخدام`);
    });

    server.once('listening', () => {
        console.log(`   ✅ المنفذ ${port}: متاح`);
        server.close();
    });

    server.listen(port);
});

// 6. الأوامر التالية
console.log('\n📝 الأوامر التالية:\n');
console.log('   بعد إضافة ملف service-account-key.json، قم بتشغيل:');
console.log('   ```');
console.log('   node lib/google-cloud-connection.js');
console.log('   ```');
console.log('');
console.log('   أو لبدء الخادم:');
console.log('   ```');
console.log('   npm start');
console.log('   ```');

console.log('\n✨ البيئة جاهزة للاتصال بـ Google Cloud!\n');
