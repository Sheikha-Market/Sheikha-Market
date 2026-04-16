#!/usr/bin/env node
/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║   🧪 شيخة — اختبار Meta Conversions API (CAPI)                             ║
 * ║   Sheikha CAPI Connectivity Test                                           ║
 * ║                                                                              ║
 * ║   الاستخدام: node scripts/test-capi.js                                     ║
 * ║            أو: npm run meta:test-capi                                      ║
 * ║                                                                              ║
 * ║   لاختبار LandingPageView (هدف الزيارات Instagram):                        ║
 * ║            META_TEST_EVENT_TYPE=LandingPageView node scripts/test-capi.js  ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * يقرأ: META_CAPI_ACCESS_TOKEN أو META_CAPI_TOKEN (كلاهما مقبول)
 *        META_PIXEL_ID           (يُستخدم كـ Dataset ID)
 *        META_TEST_EVENT_CODE    (اختياري — للاختبار في Events Manager)
 *        META_TEST_EVENT_TYPE    (اختياري — PageView | LandingPageView، افتراضي: PageView)
 */

'use strict';

try { require('dotenv').config(); } catch (_) {}

const https  = require('https');
const crypto = require('crypto');

// ─── قراءة الإعدادات ────────────────────────────────────────────────────────
const TOKEN     = process.env.META_CAPI_ACCESS_TOKEN
               || process.env.META_CAPI_TOKEN
               || '';
const DATASET   = process.env.META_PIXEL_ID || '1283625109854806';
const TEST_CODE = process.env.META_TEST_EVENT_CODE || null;
const GV        = process.env.META_GRAPH_VERSION || 'v21.0';

// نوع الحدث — PageView (افتراضي) أو LandingPageView لاختبار حملات Instagram Traffic
const ALLOWED_TEST_EVENTS = ['PageView', 'LandingPageView'];
const EVENT_TYPE = ALLOWED_TEST_EVENTS.includes(process.env.META_TEST_EVENT_TYPE)
    ? process.env.META_TEST_EVENT_TYPE
    : 'PageView';

// ─── تحقق من الإعدادات ──────────────────────────────────────────────────────
console.log('\n🔍 شيخة — Meta CAPI Test');
console.log('─'.repeat(50));
console.log(`📦 Dataset ID : ${DATASET}`);
console.log(`🔑 Token      : ${TOKEN ? TOKEN.slice(0, 20) + '...' : '❌ غير موجود'}`);
console.log(`📡 Event Type : ${EVENT_TYPE}${EVENT_TYPE === 'LandingPageView' ? ' 📱 (Instagram Traffic)' : ''}`);
console.log(`🧪 Test Code  : ${TEST_CODE || '(بدون test_event_code)'}`);
console.log(`📡 API Version: ${GV}`);
console.log('─'.repeat(50));

if (!TOKEN) {
    console.error('\n❌ لم يتم العثور على التوكن.');
    console.error('   أضف في ملف .env:');
    console.error('   META_CAPI_ACCESS_TOKEN=EAAxxxxxxxx\n');
    process.exit(1);
}

// ─── بناء الحدث التجريبي ────────────────────────────────────────────────────
const eventTime = Math.floor(Date.now() / 1000);
const testEmail = crypto.createHash('sha256')
    .update('test@sheikha.market').digest('hex');

// LandingPageView يتطلب event_source_url ليربطه Meta بالإعلان الصحيح
const eventSourceUrl = EVENT_TYPE === 'LandingPageView'
    ? 'https://sheikha.top/?utm_source=instagram&utm_medium=paid&utm_campaign=traffic'
    : 'https://sheikha.market/';

const payload = {
    data: [
        {
            event_name: EVENT_TYPE,
            event_time: eventTime,
            action_source: 'website',
            event_source_url: eventSourceUrl,
            user_data: {
                em: [testEmail],
                client_ip_address: '127.0.0.1',
                client_user_agent: 'Sheikha/CAPI-Test-v1.0',
            },
        },
    ],
};

if (TEST_CODE) payload.test_event_code = TEST_CODE;

const bodyStr = JSON.stringify(payload);

// ─── إرسال الطلب عبر https المدمج (Node 12+) ─────────────────────────────
const url = `/v21.0/${DATASET}/events?access_token=${TOKEN}`;

const options = {
    hostname: 'graph.facebook.com',
    path: url,
    method: 'POST',
    headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(bodyStr),
    },
};

console.log(`\n📤 جارٍ إرسال حدث ${EVENT_TYPE} إلى Meta Graph API...\n`);

const req = https.request(options, (res) => {
    let raw = '';
    res.on('data', (chunk) => { raw += chunk; });
    res.on('end', () => {
        let data;
        try { data = JSON.parse(raw); } catch (_) { data = { raw }; }

        if (data.events_received !== undefined) {
            console.log(`✅ نجح الاتصال!`);
            console.log(`   event_type      : ${EVENT_TYPE}`);
            console.log(`   events_received : ${data.events_received}`);
            console.log(`   fbtrace_id      : ${data.fbtrace_id || '-'}`);
            if (TEST_CODE) {
                console.log(`\n💡 افتح Events Manager → Test Events للتحقق:`);
                console.log(`   https://business.facebook.com/events_manager2/list/pixel/${DATASET}/test_events`);
            }
            if (EVENT_TYPE === 'LandingPageView') {
                console.log(`\n📱 LandingPageView مُرسَل بنجاح!`);
                console.log(`   تحقق من إعلان Instagram في Ads Manager → النتائج → مشاهدة الصفحة المقصودة`);
                console.log(`   للاختبار الكامل: META_TEST_EVENT_TYPE=LandingPageView META_TEST_EVENT_CODE=TEST12345 node scripts/test-capi.js\n`);
            }
        } else if (data.error) {
            console.error(`❌ خطأ من Meta API:`);
            console.error(`   code    : ${data.error.code}`);
            console.error(`   message : ${data.error.message}`);
            console.error(`   type    : ${data.error.type}`);
            if (data.error.code === 190) {
                console.error('\n💡 التوكن منتهي أو خاطئ — جدد من:');
                console.error('   business.facebook.com → System Users → Generate Token\n');
            }
            process.exit(1);
        } else {
            console.error('❓ استجابة غير متوقعة:', raw);
            process.exit(1);
        }
    });
});

req.on('error', (err) => {
    console.error(`❌ فشل الاتصال بـ graph.facebook.com:`);
    console.error(`   ${err.message}`);
    console.error('\n💡 تأكد من:');
    console.error('   1. الاتصال بالإنترنت');
    console.error('   2. عدم حظر graph.facebook.com في الجدار الناري\n');
    process.exit(1);
});

req.write(bodyStr);
req.end();
