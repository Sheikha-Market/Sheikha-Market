/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  SHEIKHA SECURE CHANNEL — قناة الاتصال الآمن                                ║
 * ║                                                                              ║
 * ║  طبقات الأمان المتكاملة:                                                    ║
 * ║  Layer 1 — TLS/HTTPS: تشفير النقل (Transport Layer Security)                ║
 * ║  Layer 2 — JWT:       هوية الطلب (Request Identity)                         ║
 * ║  Layer 3 — HMAC:      توقيع الحمولة (Payload Signature)                     ║
 * ║  Layer 4 — DID:       هوية لامركزية (Decentralized Identity)                ║
 * ║  Layer 5 — AuditLog:  سجل لا يُمحى (Immutable Audit Trail)                  ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * "إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ إِلَىٰ أَهْلِهَا" — النساء:٥٨
 */

'use strict';

const crypto    = require('crypto');
const fs        = require('fs');
const path      = require('path');
const { EventEmitter } = require('events');

const AUDIT_DIR = path.join(__dirname, '../../data/audit');

// ═══════════════════════════════════════════════════════════════
// ① توصيات تكوين TLS/HTTPS
// ═══════════════════════════════════════════════════════════════
const TLS_CONFIG = {
    recommended: {
        minVersion:    'TLSv1.2',
        ciphers: [
            'TLS_AES_256_GCM_SHA384',
            'TLS_CHACHA20_POLY1305_SHA256',
            'TLS_AES_128_GCM_SHA256',
            'ECDHE-RSA-AES256-GCM-SHA384',
            'ECDHE-RSA-AES128-GCM-SHA256',
        ].join(':'),
        honorCipherOrder: true,
        sessionTimeout:   3600,
        dhparam:          null,         // يُوفَّر من ملف خارجي في الإنتاج
    },
    headers: {
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
        'Expect-CT':                 'max-age=86400, enforce',
        'Certificate-Transparency':  'enforce',
    },
    notes: [
        'TLS 1.0 و 1.1 محظوران',
        'يجب تجديد الشهادة قبل انتهائها بـ 30 يوم',
        'يُنصح بـ Let\'s Encrypt أو شهادة موثوقة',
        'Nginx Reverse Proxy أمام Node.js للإنتاج',
    ],
};

// ═══════════════════════════════════════════════════════════════
// ② توقيع الحمولة — HMAC
// ═══════════════════════════════════════════════════════════════
class PayloadSigner {

    constructor(secret) {
        this._secret = secret || process.env.HMAC_SECRET || crypto.randomBytes(32).toString('hex');
    }

    sign(payload) {
        const body = typeof payload === 'string' ? payload : JSON.stringify(payload);
        return crypto.createHmac('sha256', this._secret).update(body).digest('hex');
    }

    verify(payload, signature) {
        const expected = this.sign(payload);
        try {
            return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
        } catch (_) {
            return false;
        }
    }

    /**
     * middleware للتحقق من توقيع طلبات الـ API الحساسة
     * يتوقع رأس: X-Sheikha-Signature: sha256=<hex>
     */
    verifyMiddleware() {
        return (req, res, next) => {
            const sig = req.headers['x-sheikha-signature'];
            if (!sig) return next();     // لا توقيع = تجاوز (للمسارات العامة)

            const bodyStr = JSON.stringify(req.body || {});
            const hex     = sig.replace(/^sha256=/, '');
            if (!this.verify(bodyStr, hex)) {
                return res.status(400).json({
                    success: false,
                    message: 'توقيع الحمولة غير صحيح',
                    hint:    'X-Sheikha-Signature: sha256=<hmac_hex>',
                });
            }
            next();
        };
    }
}

// ═══════════════════════════════════════════════════════════════
// ③ الهوية اللامركزية — Sheikha DID
// ═══════════════════════════════════════════════════════════════
class SheikhaIdentityLayer {

    /**
     * توليد DID بسيط للخادم أو المستخدم
     * did:sheikha:<sha256(ip+timestamp)>
     */
    static generateDID(seed = '') {
        const raw = `${seed}_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
        const id  = crypto.createHash('sha256').update(raw).digest('hex').slice(0, 32);
        return `did:sheikha:${id}`;
    }

    /**
     * تحقق من أن DID بتنسيق صحيح
     */
    static isValidDID(did) {
        return typeof did === 'string' && /^did:sheikha:[0-9a-f]{32}$/.test(did);
    }

    /**
     * middleware — يُلصق DID بكل طلب
     */
    static middleware() {
        return (req, res, next) => {
            const clientDID = req.headers['x-sheikha-did'];
            req._did = SheikhaIdentityLayer.isValidDID(clientDID)
                ? clientDID
                : SheikhaIdentityLayer.generateDID(req.ip || '');
            res.setHeader('X-Sheikha-Server-DID', 'did:sheikha:server');
            next();
        };
    }
}

// ═══════════════════════════════════════════════════════════════
// ④ سجل التدقيق — ImmutableAuditLog
// ═══════════════════════════════════════════════════════════════
class ImmutableAuditLog extends EventEmitter {

    constructor() {
        super();
        this._entries = [];
        this._ensureDir();
        this._logFile = path.join(AUDIT_DIR, `audit_${new Date().toISOString().slice(0,10)}.ndjson`);
    }

    /**
     * تسجيل حدث أمني
     * @param {object} entry  — { actor, action, resource, ip, result, meta }
     */
    log(entry) {
        const record = {
            ts:       new Date().toISOString(),
            seq:      this._entries.length + 1,
            tawheed:  'لا إله إلا الله',
            ...entry,
        };
        // توقيع السجل لضمان عدم التزوير
        const signer = new PayloadSigner();
        record._hash = signer.sign(JSON.stringify({ ...record, _hash: undefined }));

        this._entries.push(record);
        if (this._entries.length > 10000) this._entries.shift();

        // كتابة غير متزامنة
        this._writeAsync(record);
        this.emit('entry', record);
        return record;
    }

    /**
     * middleware — يُسجّل كل طلب تلقائياً
     */
    middleware() {
        return (req, res, next) => {
            const ip   = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
            const orig = res.end.bind(res);
            res.end = (...args) => {
                this.log({
                    actor:    req.user?.id || req._did || ip,
                    action:   `${req.method} ${req.path}`,
                    resource: req.path,
                    ip,
                    result:   res.statusCode >= 400 ? 'ERROR' : 'SUCCESS',
                    status:   res.statusCode,
                    level:    req._accessLevel || 'UNKNOWN',
                });
                return orig(...args);
            };
            next();
        };
    }

    getRecent(limit = 100) {
        return this._entries.slice(-limit);
    }

    getByActor(actor, limit = 50) {
        return this._entries.filter((e) => e.actor === actor).slice(-limit);
    }

    _writeAsync(record) {
        try {
            fs.appendFileSync(this._logFile, JSON.stringify(record) + '\n', 'utf8');
        } catch (_) {}
    }

    _ensureDir() {
        try { if (!fs.existsSync(AUDIT_DIR)) fs.mkdirSync(AUDIT_DIR, { recursive: true }); } catch (_) {}
    }
}

// ═══════════════════════════════════════════════════════════════
// ⑤ القناة الآمنة الموحّدة — SecureChannel
// ═══════════════════════════════════════════════════════════════
class SecureChannel {

    constructor(secret) {
        this.signer   = new PayloadSigner(secret);
        this.audit    = new ImmutableAuditLog();
        this.identity = SheikhaIdentityLayer;
        this.tls      = TLS_CONFIG;
        this.nameAr   = 'قناة الاتصال الآمن — شيخة';
        this.verse    = { ref: 'النساء:٥٨', text: 'إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ إِلَىٰ أَهْلِهَا' };
    }

    /**
     * كل middleware مجمّع في ترتيب صحيح
     * app.use(secureChannel.pipeline())
     */
    pipeline() {
        return [
            this.identity.middleware(),
            this.signer.verifyMiddleware(),
            this.audit.middleware(),
        ];
    }

    getDashboard() {
        return {
            nameAr:          this.nameAr,
            tawheed:         'لا إله إلا الله',
            no_harm:         'لا ضرر ولا ضرار',
            tls:             this.tls.recommended,
            tls_headers:     this.tls.headers,
            tls_notes:       this.tls.notes,
            audit_entries:   this.audit._entries.length,
            verse:           this.verse,
            layers: [
                { n: 1, nameAr: 'TLS/HTTPS',       status: 'توصية — يُفعَّل عبر Nginx' },
                { n: 2, nameAr: 'JWT',              status: 'مُفعَّل في server.js' },
                { n: 3, nameAr: 'HMAC Signature',   status: 'مُفعَّل — رأس X-Sheikha-Signature' },
                { n: 4, nameAr: 'DID Identity',     status: 'مُفعَّل — رأس X-Sheikha-DID' },
                { n: 5, nameAr: 'Immutable Audit',  status: 'مُفعَّل — data/audit/' },
            ],
        };
    }
}

// ═══════════════════════════════════════════════════════════════
// Export
// ═══════════════════════════════════════════════════════════════
module.exports = {
    SecureChannel,
    PayloadSigner,
    SheikhaIdentityLayer,
    ImmutableAuditLog,
    TLS_CONFIG,
};
