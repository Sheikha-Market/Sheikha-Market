/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🌐 SHEIKHA DNS — نظام أسماء النطاقات الداخلي                               ║
 * ║  Sheikha Internal DNS — Service Discovery, Zones, Load Balancing & Routing   ║
 * ║                                                                              ║
 * ║  المميزات:                                                                   ║
 * ║  • مناطق DNS (Zones) مرتبة بطبقات شيخة الشبكية                             ║
 * ║  • سجلات لكل طبقة من طبقات شيخة (PAN → SHTTP/HTTPS)                       ║
 * ║  • ذاكرة تخزين مؤقت بـ TTL                                                  ║
 * ║  • موازنة تحميل (Round-Robin) لعدة خوادم خلفية                              ║
 * ║  • بحث عكسي IP:Port → اسم الخدمة                                           ║
 * ║  • فحص صحة الخدمات (Health Check)                                           ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * الاستخدام:
 *   const { sheikha_dns } = require('./sheikha-dns');
 *
 *   sheikha_dns.resolve('market')                   // → SRV record
 *   sheikha_dns.resolve('lan.sheikha.net')          // → Sheikha LAN record
 *   sheikha_dns.resolveZone('sheikha.market')       // → all records in zone
 *   sheikha_dns.reverseLookup('localhost', 3000)    // → service name
 *   sheikha_dns.resolveBalanced('market')           // → next backend (round-robin)
 *   sheikha_dns.register('my-svc', { ... })
 *   sheikha_dns.registerBackend('market', { host: '10.0.0.2', port: 3001 })
 *   sheikha_dns.runHealthCheck()                    // → health report
 *
 * ﴿ وَلِكُلٍّ وِجْهَةٌ هُوَ مُوَلِّيهَا ﴾ — البقرة: 148
 */

'use strict';

const crypto = require('crypto');
const http   = require('http');
const https  = require('https');

// ══════════════════════════════════════════════════════════════════════════════
// أنواع السجلات
// ══════════════════════════════════════════════════════════════════════════════

/**
 * أنواع سجلات Sheikha DNS:
 *  A     — عنوان IPv4
 *  AAAA  — عنوان IPv6
 *  SRV   — سجل الخدمة (host + port + protocol)
 *  TXT   — نص وصفي / بيانات تكوين
 *  CNAME — اسم بديل
 *  NS    — خادم الأسماء للمنطقة
 *  MX    — بريد إلكتروني (للمستقبل)
 */
const RECORD_TYPES = ['A', 'AAAA', 'SRV', 'TXT', 'CNAME', 'NS', 'MX'];

// ══════════════════════════════════════════════════════════════════════════════
// مناطق DNS — Sheikha DNS Zones
// ══════════════════════════════════════════════════════════════════════════════

/**
 * كل منطقة (Zone) تجمع خدمات ذات طابع واحد تحت نطاق فرعي موحّد.
 *
 *  sheikha.local   — الخدمات الداخلية الأساسية
 *  sheikha.market  — خدمات التجارة والسوق
 *  sheikha.net     — طبقات الشبكة (PAN / LAN / WAN …)
 *  sheikha.ai      — الذكاء الاصطناعي والشبكة العصبية
 *  sheikha.secure  — الأمان والتشفير
 *  sheikha.pay     — المدفوعات والمالية الإسلامية
 *  sheikha.know    — المعرفة والعلوم الإسلامية
 */
const DNS_ZONES = {
    'sheikha.local':  { nameAr: 'المنطقة الداخلية الأساسية',     ttl: 300, ns: 'dns.sheikha.local'    },
    'sheikha.market': { nameAr: 'منطقة التجارة والسوق',           ttl: 120, ns: 'dns.sheikha.market'   },
    'sheikha.net':    { nameAr: 'منطقة طبقات الشبكة',            ttl: 600, ns: 'dns.sheikha.net'      },
    'sheikha.ai':     { nameAr: 'منطقة الذكاء الاصطناعي',        ttl: 60,  ns: 'dns.sheikha.ai'       },
    'sheikha.secure': { nameAr: 'منطقة الأمان والحماية',          ttl: 300, ns: 'dns.sheikha.secure'   },
    'sheikha.pay':    { nameAr: 'منطقة المدفوعات الإسلامية',      ttl: 120, ns: 'dns.sheikha.pay'      },
    'sheikha.know':   { nameAr: 'منطقة المعرفة الإسلامية',        ttl: 600, ns: 'dns.sheikha.know'     },
};

// ══════════════════════════════════════════════════════════════════════════════
// السجلات المدمجة
// ══════════════════════════════════════════════════════════════════════════════

const BUILT_IN_RECORDS = {

    // ═══════════════════════════════════════════════
    // Zone: sheikha.local — الخدمات الأساسية
    // ═══════════════════════════════════════════════

    'api.sheikha.local': {
        type: 'A', zone: 'sheikha.local',
        nameAr: 'البوابة الرئيسية للـ API',
        host: 'localhost', port: 3000, protocol: 'HTTP',
        path: '/', weight: 100, priority: 1, healthy: true,
        tags: ['core', 'gateway'],
    },
    'auth.sheikha.local': {
        type: 'SRV', zone: 'sheikha.local',
        nameAr: 'خدمة المصادقة',
        host: 'localhost', port: 3000, protocol: 'HTTPS',
        path: '/api/auth', weight: 100, priority: 1, healthy: true,
        tags: ['security', 'core'],
    },
    'dns.sheikha.local': {
        type: 'NS', zone: 'sheikha.local',
        nameAr: 'خادم أسماء المنطقة الداخلية',
        host: 'localhost', port: 3000, protocol: 'HTTPS',
        path: '/api/network/dns', weight: 100, priority: 1, healthy: true,
        tags: ['network', 'core'],
    },

    // ═══════════════════════════════════════════════
    // Zone: sheikha.market — التجارة والسوق
    // ═══════════════════════════════════════════════

    'market.sheikha.market': {
        type: 'SRV', zone: 'sheikha.market',
        nameAr: 'سوق شيخة الرئيسي',
        host: 'localhost', port: 3000, protocol: 'HTTPS',
        path: '/api/smart-market', weight: 100, priority: 1, healthy: true,
        tags: ['core', 'commerce'],
    },
    'store.sheikha.market': {
        type: 'CNAME', zone: 'sheikha.market',
        nameAr: 'المتجر (اسم بديل)',
        target: 'market.sheikha.market',
        tags: ['commerce'],
    },
    'shop.sheikha.market': {
        type: 'CNAME', zone: 'sheikha.market',
        nameAr: 'التسوق (اسم بديل)',
        target: 'market.sheikha.market',
        tags: ['commerce'],
    },
    'orders.sheikha.market': {
        type: 'SRV', zone: 'sheikha.market',
        nameAr: 'خدمة الطلبات',
        host: 'localhost', port: 3000, protocol: 'HTTPS',
        path: '/api/orders', weight: 100, priority: 1, healthy: true,
        tags: ['commerce'],
    },
    'products.sheikha.market': {
        type: 'SRV', zone: 'sheikha.market',
        nameAr: 'خدمة المنتجات',
        host: 'localhost', port: 3000, protocol: 'HTTPS',
        path: '/api/products', weight: 100, priority: 1, healthy: true,
        tags: ['commerce'],
    },
    'scm.sheikha.market': {
        type: 'SRV', zone: 'sheikha.market',
        nameAr: 'سلسلة الإمداد',
        host: 'localhost', port: 3000, protocol: 'HTTPS',
        path: '/api/scm', weight: 90, priority: 2, healthy: true,
        tags: ['commerce', 'logistics'],
    },
    'exchange.sheikha.market': {
        type: 'SRV', zone: 'sheikha.market',
        nameAr: 'منصة التبادل الدولي',
        host: 'localhost', port: 3000, protocol: 'HTTPS',
        path: '/api/global-exchange', weight: 90, priority: 2, healthy: true,
        tags: ['commerce', 'international'],
    },

    // ═══════════════════════════════════════════════
    // Zone: sheikha.net — طبقات الشبكة (PAN→SHTTP/HTTPS)
    // ═══════════════════════════════════════════════

    'pan.sheikha.net': {
        type: 'SRV', zone: 'sheikha.net',
        nameAr: 'Sheikha PAN — شبكة المنطقة الشخصية',
        nameEn: 'Sheikha Personal Area Network',
        host: 'localhost', port: 3000, protocol: 'HTTP',
        path: '/api/network/layers/Sheikha%20PAN',
        weight: 60, priority: 10, healthy: true,
        layer: 'Sheikha PAN', layerOrder: 1,
        tags: ['network', 'pan', 'bluetooth', 'nfc'],
    },
    'lan.sheikha.net': {
        type: 'SRV', zone: 'sheikha.net',
        nameAr: 'Sheikha LAN — شبكة المتاجر والمستودعات',
        nameEn: 'Sheikha Local Area Network',
        host: 'localhost', port: 3000, protocol: 'HTTPS',
        path: '/api/network/layers/Sheikha%20LAN',
        weight: 80, priority: 8, healthy: true,
        layer: 'Sheikha LAN', layerOrder: 2,
        tags: ['network', 'lan', 'ethernet'],
    },
    'wlan.sheikha.net': {
        type: 'SRV', zone: 'sheikha.net',
        nameAr: 'Sheikha WLAN — WiFi للنقاط التجارية والمعارض',
        nameEn: 'Sheikha Wireless LAN',
        host: 'localhost', port: 3000, protocol: 'HTTPS',
        path: '/api/network/layers/Sheikha%20WLAN',
        weight: 80, priority: 7, healthy: true,
        layer: 'Sheikha WLAN', layerOrder: 3,
        tags: ['network', 'wlan', 'wifi'],
    },
    'can.sheikha.net': {
        type: 'SRV', zone: 'sheikha.net',
        nameAr: 'Sheikha CAN — شبكة التكامل بين الفروع',
        nameEn: 'Sheikha Campus Area Network',
        host: 'localhost', port: 3000, protocol: 'HTTPS',
        path: '/api/network/layers/Sheikha%20CAN',
        weight: 85, priority: 6, healthy: true,
        layer: 'Sheikha CAN', layerOrder: 4,
        tags: ['network', 'can', 'campus'],
    },
    'man.sheikha.net': {
        type: 'SRV', zone: 'sheikha.net',
        nameAr: 'Sheikha MAN — شبكة المدينة للمناطق التجارية',
        nameEn: 'Sheikha Metropolitan Area Network',
        host: 'localhost', port: 3000, protocol: 'HTTPS',
        path: '/api/network/layers/Sheikha%20MAN',
        weight: 90, priority: 5, healthy: true,
        layer: 'Sheikha MAN', layerOrder: 5,
        tags: ['network', 'man', 'city'],
    },
    'wan.sheikha.net': {
        type: 'SRV', zone: 'sheikha.net',
        nameAr: 'Sheikha WAN — الشبكة الواسعة لربط الأسواق الدولية',
        nameEn: 'Sheikha Wide Area Network',
        host: 'localhost', port: 3000, protocol: 'HTTPS',
        path: '/api/network/layers/Sheikha%20WAN',
        weight: 95, priority: 4, healthy: true,
        layer: 'Sheikha WAN', layerOrder: 6,
        tags: ['network', 'wan', 'international'],
    },
    'vpn.sheikha.net': {
        type: 'SRV', zone: 'sheikha.net',
        nameAr: 'Sheikha VPN — تشفير الاتصالات التجارية الحساسة',
        nameEn: 'Sheikha Virtual Private Network',
        host: 'localhost', port: 3000, protocol: 'HTTPS',
        path: '/api/network/layers/Sheikha%20VPN',
        weight: 90, priority: 3, healthy: true,
        layer: 'Sheikha VPN', layerOrder: 7,
        tags: ['network', 'vpn', 'security', 'encryption'],
    },
    'tcpip.sheikha.net': {
        type: 'SRV', zone: 'sheikha.net',
        nameAr: 'Sheikha TCP/IP — الأساس البروتوكولي لكل الاتصالات',
        nameEn: 'Sheikha TCP/IP Stack',
        host: 'localhost', port: 3000, protocol: 'HTTPS',
        path: '/api/network/layers/Sheikha%20TCP%2FIP',
        weight: 100, priority: 2, healthy: true,
        layer: 'Sheikha TCP/IP', layerOrder: 8,
        tags: ['network', 'tcpip', 'fundamental'],
    },
    'https.sheikha.net': {
        type: 'SRV', zone: 'sheikha.net',
        nameAr: 'Sheikha HTTP/HTTPS — بروتوكولات التطبيقات والواجهات',
        nameEn: 'Sheikha HTTP/HTTPS Layer',
        host: 'localhost', port: 3000, protocol: 'HTTPS',
        path: '/api/network/layers/Sheikha%20HTTP%2FHTTPS',
        weight: 100, priority: 2, healthy: true,
        layer: 'Sheikha HTTP/HTTPS', layerOrder: 9,
        tags: ['network', 'https', 'tls'],
    },
    'shttp.sheikha.net': {
        type: 'SRV', zone: 'sheikha.net',
        nameAr: 'Sheikha SHTTP/HTTPS — الطبقة الحاكمة لكل الشبكة',
        nameEn: 'Sheikha Sovereign HTTPS — Governing Layer',
        host: 'localhost', port: 3000, protocol: 'HTTPS',
        path: '/api/network/layers/Sheikha%20SHTTP%2FHTTPS',
        weight: 100, priority: 1, healthy: true,
        layer: 'Sheikha SHTTP/HTTPS', layerOrder: 10,
        sovereign: true,
        tags: ['network', 'shttp', 'sovereign', 'governing'],
    },
    // اسم بديل لطبقة الحاكمة
    'sovereign.sheikha.net': {
        type: 'CNAME', zone: 'sheikha.net',
        nameAr: 'الطبقة الحاكمة (اسم بديل)',
        target: 'shttp.sheikha.net',
        tags: ['network', 'sovereign'],
    },
    // بوابة الشبكة الكاملة
    'gateway.sheikha.net': {
        type: 'SRV', zone: 'sheikha.net',
        nameAr: 'بوابة شبكة شيخة الموحدة',
        host: 'localhost', port: 3000, protocol: 'HTTPS',
        path: '/api/network', weight: 100, priority: 1, healthy: true,
        tags: ['network', 'gateway'],
    },
    // الاتصالات
    'telecom.sheikha.net': {
        type: 'SRV', zone: 'sheikha.net',
        nameAr: 'منظومة اتصالات شيخة',
        host: 'localhost', port: 3000, protocol: 'HTTPS',
        path: '/api/telecom', weight: 100, priority: 1, healthy: true,
        tags: ['network', 'telecom'],
    },
    'satellite.sheikha.net': {
        type: 'SRV', zone: 'sheikha.net',
        nameAr: 'بوابة الأقمار الصناعية',
        host: 'localhost', port: 3000, protocol: 'HTTPS',
        path: '/api/telecom/satellite', weight: 80, priority: 2, healthy: true,
        tags: ['network', 'satellite', 'gps'],
    },

    // ═══════════════════════════════════════════════
    // Zone: sheikha.ai — الذكاء الاصطناعي
    // ═══════════════════════════════════════════════

    'neural.sheikha.ai': {
        type: 'SRV', zone: 'sheikha.ai',
        nameAr: 'محرك الشبكة العصبية',
        host: 'localhost', port: 3000, protocol: 'HTTPS',
        path: '/api/network/neural', weight: 100, priority: 1, healthy: true,
        tags: ['ai', 'neural', 'core'],
    },
    'infer.sheikha.ai': {
        type: 'SRV', zone: 'sheikha.ai',
        nameAr: 'خدمة الاستدلال العصبي',
        host: 'localhost', port: 3000, protocol: 'HTTPS',
        path: '/api/network/neural/infer', weight: 100, priority: 1, healthy: true,
        tags: ['ai', 'inference'],
    },
    'recommend.sheikha.ai': {
        type: 'SRV', zone: 'sheikha.ai',
        nameAr: 'خدمة التوصيات الذكية',
        host: 'localhost', port: 3000, protocol: 'HTTPS',
        path: '/api/network/neural/recommend', weight: 100, priority: 1, healthy: true,
        tags: ['ai', 'recommendations'],
    },
    'sharia-ai.sheikha.ai': {
        type: 'SRV', zone: 'sheikha.ai',
        nameAr: 'محرك الذكاء الاصطناعي الشرعي',
        host: 'localhost', port: 3000, protocol: 'HTTPS',
        path: '/api/sharia', weight: 100, priority: 1, healthy: true,
        tags: ['ai', 'sharia'],
    },
    'ai.sheikha.ai': {
        type: 'CNAME', zone: 'sheikha.ai',
        nameAr: 'الذكاء الاصطناعي (اسم بديل)',
        target: 'neural.sheikha.ai',
        tags: ['ai'],
    },

    // ═══════════════════════════════════════════════
    // Zone: sheikha.secure — الأمان والتشفير
    // ═══════════════════════════════════════════════

    'waterline.sheikha.secure': {
        type: 'SRV', zone: 'sheikha.secure',
        nameAr: 'خط أمان شيخة',
        host: 'localhost', port: 3000, protocol: 'HTTPS',
        path: '/api/network/waterline', weight: 100, priority: 1, healthy: true,
        tags: ['security', 'waterline', 'zero-trust'],
    },
    'auth.sheikha.secure': {
        type: 'CNAME', zone: 'sheikha.secure',
        nameAr: 'المصادقة (اسم بديل آمن)',
        target: 'auth.sheikha.local',
        tags: ['security', 'auth'],
    },
    'encrypt.sheikha.secure': {
        type: 'SRV', zone: 'sheikha.secure',
        nameAr: 'خدمة التشفير AES-256',
        host: 'localhost', port: 3000, protocol: 'HTTPS',
        path: '/api/network/waterline/encrypt', weight: 100, priority: 1, healthy: true,
        tags: ['security', 'encryption', 'aes256'],
    },
    'token.sheikha.secure': {
        type: 'SRV', zone: 'sheikha.secure',
        nameAr: 'خدمة رموز الوصول',
        host: 'localhost', port: 3000, protocol: 'HTTPS',
        path: '/api/network/waterline/token', weight: 100, priority: 1, healthy: true,
        tags: ['security', 'token', 'jwt'],
    },
    'dbus.sheikha.secure': {
        type: 'SRV', zone: 'sheikha.secure',
        nameAr: 'ناقل الرسائل الآمن',
        host: 'localhost', port: 3000, protocol: 'HTTPS',
        path: '/api/network/dbus', weight: 100, priority: 1, healthy: true,
        tags: ['security', 'messaging'],
    },

    // ═══════════════════════════════════════════════
    // Zone: sheikha.pay — المدفوعات الإسلامية
    // ═══════════════════════════════════════════════

    'payment.sheikha.pay': {
        type: 'SRV', zone: 'sheikha.pay',
        nameAr: 'خدمة الدفع الإسلامي الخالي من الربا',
        host: 'localhost', port: 3000, protocol: 'HTTPS',
        path: '/api/payment', weight: 100, priority: 1, healthy: true,
        tags: ['payment', 'sharia', 'islamic'],
    },
    'wallet.sheikha.pay': {
        type: 'SRV', zone: 'sheikha.pay',
        nameAr: 'المحفظة الرقمية الإسلامية',
        host: 'localhost', port: 3000, protocol: 'HTTPS',
        path: '/api/wallet', weight: 100, priority: 1, healthy: true,
        tags: ['payment', 'wallet', 'digital'],
    },
    'currency.sheikha.pay': {
        type: 'SRV', zone: 'sheikha.pay',
        nameAr: 'خدمة العملات والصرف',
        host: 'localhost', port: 3000, protocol: 'HTTPS',
        path: '/api/digital-currency', weight: 90, priority: 2, healthy: true,
        tags: ['payment', 'currency', 'exchange'],
    },

    // ═══════════════════════════════════════════════
    // Zone: sheikha.know — المعرفة الإسلامية
    // ═══════════════════════════════════════════════

    'knowledge.sheikha.know': {
        type: 'SRV', zone: 'sheikha.know',
        nameAr: 'قاعدة المعرفة الإسلامية',
        host: 'localhost', port: 3000, protocol: 'HTTPS',
        path: '/api/telecom/knowledge-base', weight: 90, priority: 1, healthy: true,
        tags: ['knowledge', 'islamic', 'quran'],
    },
    'sharia.sheikha.know': {
        type: 'SRV', zone: 'sheikha.know',
        nameAr: 'المرجعية الشرعية',
        host: 'localhost', port: 3000, protocol: 'HTTPS',
        path: '/api/sharia', weight: 100, priority: 1, healthy: true,
        tags: ['knowledge', 'sharia', 'fiqh'],
    },

    // ═══════════════════════════════════════════════
    // سجلات قصيرة للتوافق مع الكود القديم (short aliases)
    // ═══════════════════════════════════════════════

    'market':     { type: 'CNAME', target: 'market.sheikha.market',     nameAr: 'سوق شيخة (مختصر)'              },
    'auth':       { type: 'CNAME', target: 'auth.sheikha.local',         nameAr: 'المصادقة (مختصر)'              },
    'payment':    { type: 'CNAME', target: 'payment.sheikha.pay',        nameAr: 'الدفع (مختصر)'                 },
    'neural':     { type: 'CNAME', target: 'neural.sheikha.ai',          nameAr: 'الشبكة العصبية (مختصر)'        },
    'telecom':    { type: 'CNAME', target: 'telecom.sheikha.net',        nameAr: 'الاتصالات (مختصر)'             },
    'waterline':  { type: 'CNAME', target: 'waterline.sheikha.secure',   nameAr: 'خط الأمان (مختصر)'            },
    'dbus':       { type: 'CNAME', target: 'dbus.sheikha.secure',        nameAr: 'ناقل الرسائل (مختصر)'          },
    'dns':        { type: 'CNAME', target: 'dns.sheikha.local',          nameAr: 'DNS (مختصر)'                   },
    'satellite':  { type: 'CNAME', target: 'satellite.sheikha.net',      nameAr: 'الأقمار الصناعية (مختصر)'      },
    'sharia':     { type: 'CNAME', target: 'sharia.sheikha.know',        nameAr: 'الشريعة (مختصر)'              },
    'knowledge':  { type: 'CNAME', target: 'knowledge.sheikha.know',     nameAr: 'قاعدة المعرفة (مختصر)'         },
    'store':      { type: 'CNAME', target: 'store.sheikha.market',       nameAr: 'المتجر (مختصر)'               },
    'shop':       { type: 'CNAME', target: 'shop.sheikha.market',        nameAr: 'التسوق (مختصر)'               },
    'login':      { type: 'CNAME', target: 'auth.sheikha.local',         nameAr: 'تسجيل الدخول (مختصر)'         },
    'ai':         { type: 'CNAME', target: 'neural.sheikha.ai',          nameAr: 'الذكاء الاصطناعي (مختصر)'     },
    'security':   { type: 'CNAME', target: 'waterline.sheikha.secure',   nameAr: 'الأمان (مختصر)'               },
    'msg':        { type: 'CNAME', target: 'dbus.sheikha.secure',        nameAr: 'الرسائل (مختصر)'              },
    'pay':        { type: 'CNAME', target: 'payment.sheikha.pay',        nameAr: 'الدفع السريع (مختصر)'          },
    'wallet':     { type: 'CNAME', target: 'wallet.sheikha.pay',         nameAr: 'المحفظة (مختصر)'              },

    // ── TXT — بيانات تعريفية لمنظومة شيخة ──────────────────────
    'sheikha.market': {
        type: 'TXT', zone: 'sheikha.market',
        nameAr: 'المعرّف الرئيسي لمنظومة شيخة',
        value: 'v=sheikha2; owner=salman-bin-salman-alrajeh; tawheed=true; sharia=compliant; layers=10; zones=7',
        tags: ['meta', 'identity'],
    },
    '_dmarc.sheikha.market': {
        type: 'TXT', zone: 'sheikha.market',
        nameAr: 'سجل حماية البريد',
        value: 'v=DMARC1; p=reject; rua=mailto:admin@sheikha.market',
        tags: ['meta', 'email'],
    },
    '_description.sheikha.net': {
        type: 'TXT', zone: 'sheikha.net',
        nameAr: 'وصف طبقات الشبكة',
        value: 'Sheikha Network Layers: PAN(1)→LAN(2)→WLAN(3)→CAN(4)→MAN(5)→WAN(6)→VPN(7)→TCP/IP(8)→HTTP/HTTPS(9)→SHTTP/HTTPS(10=sovereign)',
        tags: ['meta', 'layers'],
    },
};

// ══════════════════════════════════════════════════════════════════════════════
// محرك Sheikha DNS
// ══════════════════════════════════════════════════════════════════════════════

class SheikhaInternalDNS {

    constructor() {
        this._records    = new Map();   // fqdn → DnsRecord
        this._ttlCache   = new Map();   // fqdn → { record, expiresAt }
        this._backends   = new Map();   // fqdn → DnsRecord[] (load balancing)
        this._lbCounters = new Map();   // fqdn → number (round-robin pointer)
        this._reverseMap = new Map();   // 'host:port' → fqdn
        this._queryLog   = [];
        this._healthLog  = [];
        this._stats      = { queries: 0, hits: 0, misses: 0, cacheHits: 0, registered: 0, healthChecks: 0 };
        this._startedAt  = new Date().toISOString();

        // تحميل السجلات المدمجة
        Object.entries(BUILT_IN_RECORDS).forEach(([name, record]) => {
            const key = name.toLowerCase();
            const full = {
                ...record,
                name:      key,
                ttl:       record.ttl || (record.zone ? DNS_ZONES[record.zone]?.ttl : 300) || 300,
                builtin:   true,
                createdAt: this._startedAt,
                updatedAt: this._startedAt,
            };
            this._records.set(key, full);
            // بناء الخريطة العكسية للسجلات SRV/A
            if (full.host && full.port) {
                this._reverseMap.set(`${full.host}:${full.port}:${full.path || '/'}`, key);
            }
        });
    }

    // ══════════════════════════════════════════════════════════════
    // حل الاسم → سجل الخدمة  (مع TTL cache)
    // ══════════════════════════════════════════════════════════════

    /**
     * يحوّل اسم خدمة أو FQDN إلى سجله الكامل
     * يتتبع CNAME تلقائياً ويستخدم ذاكرة TTL
     * @param {string} name
     * @param {string} [type]
     * @returns {object|null}
     */
    resolve(name, type = null) {
        if (!name || typeof name !== 'string') return null;
        const key = name.toLowerCase().trim();
        this._stats.queries++;

        // فحص TTL cache
        const cached = this._ttlCache.get(key);
        if (cached && Date.now() < cached.expiresAt && (!type || cached.record.type === type)) {
            this._stats.cacheHits++;
            this._stats.hits++;
            this._logQuery(key, type, true, true);
            return { ...cached.record, _fromCache: true };
        }

        let record = this._records.get(key);
        if (!record) {
            this._stats.misses++;
            this._logQuery(key, type, false);
            return null;
        }

        // متابعة سلسلة CNAME (حتى 10 مستويات)
        const chain = [];
        let depth = 0;
        while (record && record.type === 'CNAME' && depth < 10) {
            chain.push(record.name);
            record = this._records.get((record.target || '').toLowerCase());
            depth++;
        }

        if (!record) { this._stats.misses++; return null; }
        if (type && record.type !== type) { this._stats.misses++; return null; }

        this._stats.hits++;
        this._logQuery(key, type, true);

        const result = {
            name:       key,
            fqdn:       record.name,
            cnameChain: chain.length > 0 ? chain : undefined,
            resolvedAt: new Date().toISOString(),
            ...record,
        };

        // تخزين في TTL cache
        const ttlMs = (record.ttl || 300) * 1000;
        this._ttlCache.set(key, { record: result, expiresAt: Date.now() + ttlMs });

        return result;
    }

    // ══════════════════════════════════════════════════════════════
    // حل الاسم مع موازنة تحميل (Round-Robin)
    // ══════════════════════════════════════════════════════════════

    /**
     * يعيد أحد الخوادم الخلفية المسجّلة بالتناوب (Round-Robin)
     * إذا لم توجد خوادم خلفية، يعود إلى resolve() العادي
     * @param {string} name
     * @returns {object|null}
     */
    resolveBalanced(name) {
        const key      = name.toLowerCase().trim();
        const backends = this._backends.get(key);

        if (backends && backends.length > 0) {
            const healthyBackends = backends.filter(b => b.healthy !== false);
            if (healthyBackends.length > 0) {
                const idx     = (this._lbCounters.get(key) || 0) % healthyBackends.length;
                this._lbCounters.set(key, idx + 1);
                const backend = healthyBackends[idx];
                this._stats.queries++;
                this._logQuery(key, 'SRV-LB', true);
                return { ...backend, _loadBalanced: true, _backendIndex: idx, _totalBackends: healthyBackends.length };
            }
        }

        // fallback إلى الحل العادي
        return this.resolve(name);
    }

    // ══════════════════════════════════════════════════════════════
    // تسجيل خادم خلفي لموازنة التحميل
    // ══════════════════════════════════════════════════════════════

    /**
     * يضيف خادماً خلفياً لخدمة موجودة (لموازنة التحميل)
     * @param {string} name - اسم الخدمة
     * @param {object} backend - { host, port, protocol, path, weight }
     */
    registerBackend(name, backend) {
        if (!name || !backend || !backend.host) throw new TypeError('DNS: اسم الخدمة والـ host مطلوبان');
        const key = name.toLowerCase().trim();
        if (!this._backends.has(key)) this._backends.set(key, []);

        const entry = {
            host:     backend.host,
            port:     backend.port || 3000,
            protocol: backend.protocol || 'HTTP',
            path:     backend.path || '/',
            weight:   backend.weight !== undefined ? backend.weight : 100,
            healthy:  true,
            addedAt:  new Date().toISOString(),
        };
        this._backends.get(key).push(entry);

        return { success: true, name: key, backend: entry, totalBackends: this._backends.get(key).length };
    }

    /**
     * جلب قائمة الخوادم الخلفية لخدمة
     */
    getBackends(name) {
        const key = name.toLowerCase().trim();
        return {
            name,
            backends:      this._backends.get(key) || [],
            totalBackends: (this._backends.get(key) || []).length,
            healthyCount:  (this._backends.get(key) || []).filter(b => b.healthy !== false).length,
        };
    }

    // ══════════════════════════════════════════════════════════════
    // حل المنطقة — جميع سجلات zone معيّن
    // ══════════════════════════════════════════════════════════════

    /**
     * يعيد كل السجلات في منطقة DNS محدّدة
     * @param {string} zone  مثال: 'sheikha.net' أو 'sheikha.market'
     */
    resolveZone(zone) {
        const z = (zone || '').toLowerCase().trim();
        const meta = DNS_ZONES[z] || null;
        const records = [];
        this._records.forEach((record, name) => {
            if (record.zone === z) records.push({ name, ...record });
        });
        return {
            zone:    z,
            meta,
            records,
            count:   records.length,
            healthy: records.filter(r => r.healthy !== false && r.type !== 'CNAME' && r.type !== 'TXT').length,
        };
    }

    /**
     * جلب كل المناطق المتاحة
     */
    listZones() {
        const zones = Object.entries(DNS_ZONES).map(([id, meta]) => {
            const records = [];
            this._records.forEach((r) => { if (r.zone === id) records.push(r); });
            return {
                id, ...meta,
                recordCount:  records.length,
                healthyCount: records.filter(r => r.healthy !== false && r.type !== 'CNAME' && r.type !== 'TXT').length,
            };
        });
        return { zones, total: zones.length };
    }

    // ══════════════════════════════════════════════════════════════
    // بحث عكسي — IP:Port → اسم الخدمة
    // ══════════════════════════════════════════════════════════════

    /**
     * يبحث عن اسم الخدمة بناءً على host + port (+ path اختياري)
     * @param {string} host
     * @param {number} port
     * @param {string} [path]
     * @returns {{ name: string, record: object }|null}
     */
    reverseLookup(host, port, path = null) {
        // محاولة المطابقة الكاملة أولاً
        if (path) {
            const exactKey = `${host}:${port}:${path}`;
            const name = this._reverseMap.get(exactKey);
            if (name) return { name, record: this._records.get(name) || null };
        }

        // مطابقة host:port فقط
        let found = null;
        this._records.forEach((record, name) => {
            if (!found && record.host === host && record.port === port) {
                found = { name, record };
            }
        });
        return found;
    }

    // ══════════════════════════════════════════════════════════════
    // تسجيل خدمة جديدة
    // ══════════════════════════════════════════════════════════════

    register(name, recordData) {
        if (!name || typeof name !== 'string') throw new TypeError('DNS: اسم الخدمة مطلوب');
        if (!recordData || typeof recordData !== 'object') throw new TypeError('DNS: بيانات السجل مطلوبة');

        const key      = name.toLowerCase().trim();
        const now      = new Date().toISOString();
        const existing = this._records.get(key);
        const zone     = recordData.zone || null;

        const record = {
            type:      recordData.type     || 'SRV',
            nameAr:    recordData.nameAr   || name,
            host:      recordData.host     || 'localhost',
            port:      recordData.port     || 3000,
            protocol:  recordData.protocol || 'HTTP',
            path:      recordData.path     || '/',
            weight:    recordData.weight   !== undefined ? recordData.weight   : 100,
            priority:  recordData.priority !== undefined ? recordData.priority : 10,
            healthy:   recordData.healthy  !== false,
            tags:      recordData.tags     || [],
            zone,
            ttl:       recordData.ttl      || (zone ? DNS_ZONES[zone]?.ttl : 60) || 60,
            builtin:   false,
            name:      key,
            createdAt: existing ? existing.createdAt : now,
            updatedAt: now,
        };

        this._records.set(key, record);
        this._ttlCache.delete(key);   // إبطال الـ cache

        // تحديث الخريطة العكسية
        if (record.host && record.port) {
            this._reverseMap.set(`${record.host}:${record.port}:${record.path}`, key);
        }

        this._stats.registered++;
        return { success: true, name: key, record, messageAr: `تم تسجيل '${key}' في Sheikha DNS` };
    }

    // ══════════════════════════════════════════════════════════════
    // إلغاء تسجيل خدمة
    // ══════════════════════════════════════════════════════════════

    unregister(name) {
        const key    = name.toLowerCase().trim();
        const record = this._records.get(key);
        if (!record) return { success: false, error: 'not_found' };
        if (record.builtin) return { success: false, error: 'cannot_remove_builtin', messageAr: 'لا يمكن حذف السجلات المدمجة' };
        this._records.delete(key);
        this._ttlCache.delete(key);
        this._reverseMap.forEach((v, k) => { if (v === key) this._reverseMap.delete(k); });
        return { success: true, name: key, messageAr: `تم إلغاء تسجيل '${key}'` };
    }

    // ══════════════════════════════════════════════════════════════
    // تحديث حالة الصحة
    // ══════════════════════════════════════════════════════════════

    setHealth(name, healthy) {
        const key    = name.toLowerCase().trim();
        const record = this._records.get(key);
        if (!record) return { success: false, error: 'not_found' };
        record.healthy   = healthy;
        record.updatedAt = new Date().toISOString();
        this._ttlCache.delete(key);
        return { success: true, name: key, healthy };
    }

    // ══════════════════════════════════════════════════════════════
    // فحص الصحة الفعلي — Health Check
    // ══════════════════════════════════════════════════════════════

    /**
     * يُجري فحص صحة HTTP لكل خدمة SRV نشطة ويُحدّث حالتها
     * @param {string[]} [names] - أسماء محددة (إذا فارغة يفحص الكل)
     * @returns {Promise<object>} - تقرير الصحة
     */
    async runHealthCheck(names = []) {
        this._stats.healthChecks++;
        const targets = [];

        if (names.length > 0) {
            names.forEach(n => {
                const r = this._records.get(n.toLowerCase());
                if (r && r.type === 'SRV' && r.host) targets.push(r);
            });
        } else {
            this._records.forEach(r => {
                if (r.type === 'SRV' && r.host) targets.push(r);
            });
        }

        const results = await Promise.all(targets.map(r => this._pingService(r)));
        const report  = {
            checkedAt:   new Date().toISOString(),
            total:       results.length,
            healthy:     results.filter(r => r.healthy).length,
            unhealthy:   results.filter(r => !r.healthy).length,
            results,
        };

        this._healthLog.push({ ...report, results: undefined });
        if (this._healthLog.length > 100) this._healthLog.splice(0, this._healthLog.length - 100);

        return report;
    }

    /**
     * آخر تقرير صحة دون إعادة الفحص
     */
    getHealthReport() {
        return {
            lastCheck:   this._healthLog[this._healthLog.length - 1] || null,
            log:         this._healthLog.slice(-10),
            totalChecks: this._stats.healthChecks,
        };
    }

    // ══════════════════════════════════════════════════════════════
    // البحث
    // ══════════════════════════════════════════════════════════════

    search(query) {
        const q = (query || '').toLowerCase().trim();
        const results = [];
        this._records.forEach((record, name) => {
            const inName    = name.includes(q);
            const inNameAr  = (record.nameAr || '').includes(q);
            const inTags    = (record.tags || []).some(t => t.toLowerCase().includes(q));
            const inZone    = (record.zone || '').includes(q);
            const inLayer   = (record.layer || '').toLowerCase().includes(q);
            if (inName || inNameAr || inTags || inZone || inLayer) results.push({ name, ...record });
        });
        return { query, results, count: results.length };
    }

    listAll(tag = null, zone = null) {
        const records = [];
        this._records.forEach((record, name) => {
            const matchTag  = !tag  || (record.tags || []).includes(tag);
            const matchZone = !zone || record.zone === zone;
            if (matchTag && matchZone) records.push({ name, ...record });
        });
        return {
            records,
            count: records.length,
            tags:  [...new Set(records.flatMap(r => r.tags || []))],
            zones: [...new Set(records.map(r => r.zone).filter(Boolean))],
        };
    }

    // ══════════════════════════════════════════════════════════════
    // حالة النظام
    // ══════════════════════════════════════════════════════════════

    getStatus() {
        const allRecords = [...this._records.values()];
        return {
            nameAr:        'نظام أسماء النطاقات الداخلي — شيخة',
            nameEn:        'Sheikha Internal DNS',
            version:       '2.0.0',
            startedAt:     this._startedAt,
            uptime:        process.uptime(),
            stats:         { ...this._stats },
            totalRecords:  this._records.size,
            builtinCount:  allRecords.filter(r => r.builtin).length,
            customCount:   allRecords.filter(r => !r.builtin).length,
            healthyCount:  allRecords.filter(r => r.healthy !== false && r.type === 'SRV').length,
            srvCount:      allRecords.filter(r => r.type === 'SRV').length,
            cnameCount:    allRecords.filter(r => r.type === 'CNAME').length,
            txtCount:      allRecords.filter(r => r.type === 'TXT').length,
            zonesCount:    Object.keys(DNS_ZONES).length,
            cacheSize:     this._ttlCache.size,
            lbServices:    this._backends.size,
            lastQueries:   this._queryLog.slice(-10),
            lastHealthCheck: this._healthLog[this._healthLog.length - 1] || null,
            verse:         '﴿ وَلِكُلٍّ وِجْهَةٌ هُوَ مُوَلِّيهَا ﴾ — البقرة: 148',
            hadith:        '«التَّاجِرُ الصَّدُوقُ الأَمِينُ مَعَ النَّبِيِّينَ» — الترمذي',
        };
    }

    // ══════════════════════════════════════════════════════════════
    // مساعدات داخلية
    // ══════════════════════════════════════════════════════════════

    /** فحص HTTP مبسّط لخدمة واحدة */
    _pingService(record) {
        return new Promise((resolve) => {
            const proto   = (record.protocol || 'HTTP').toUpperCase();
            const lib     = proto === 'HTTPS' ? https : http;
            const timeout = 3000;

            const req = lib.request(
                {
                    hostname: record.host   || 'localhost',
                    port:     record.port   || 3000,
                    path:     record.path   || '/',
                    method:   'GET',
                    timeout,
                    rejectUnauthorized: false,
                },
                (res) => {
                    const healthy = res.statusCode < 500;
                    // تحديث السجل مباشرة
                    const stored = this._records.get(record.name);
                    if (stored) { stored.healthy = healthy; stored.updatedAt = new Date().toISOString(); }
                    this._ttlCache.delete(record.name);
                    resolve({ name: record.name, healthy, statusCode: res.statusCode, host: record.host, port: record.port });
                }
            );

            req.on('error',   () => this._markUnhealthy(record, resolve));
            req.on('timeout', () => { req.destroy(); this._markUnhealthy(record, resolve); });
            req.end();
        });
    }

    _markUnhealthy(record, resolve) {
        const stored = this._records.get(record.name);
        if (stored) { stored.healthy = false; stored.updatedAt = new Date().toISOString(); }
        this._ttlCache.delete(record.name);
        resolve({ name: record.name, healthy: false, error: 'unreachable', host: record.host, port: record.port });
    }

    _logQuery(name, type, resolved, fromCache = false) {
        this._queryLog.push({ name, type, resolved, fromCache, ts: new Date().toISOString() });
        if (this._queryLog.length > 200) this._queryLog.splice(0, this._queryLog.length - 200);
    }
}

// ─── Singleton ──────────────────────────────────────────────────────────────
const sheikha_dns = new SheikhaInternalDNS();

module.exports = {
    sheikha_dns,
    SheikhaInternalDNS,
    BUILT_IN_RECORDS,
    RECORD_TYPES,
    DNS_ZONES,
};

