/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🛡️ SHEIKHA WATERLINE — خط أمان شيخة الرقمي                                 ║
 * ║  Sheikha Waterline — Zero-Trust Security & Protection Layer                   ║
 * ║                                                                              ║
 * ║  "خط المياه" = الحد الفاصل بين الأمان والغرق الرقمي                         ║
 * ║  يحمي كل طبقة من طبقات منظومة شيخة: PAN ← LAN ← WAN ← Internet            ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * المبادئ:
 *  1. Zero-Trust  — لا ثقة افتراضية، كل طلب يُتحقق منه
 *  2. Waterline   — حد الأمان لكل طبقة شبكية
 *  3. AES-256     — تشفير قوي للبيانات الحساسة
 *  4. TLS 1.3     — أحدث معايير تشفير الاتصالات
 *  5. شرعي        — حماية الأمانة والخصوصية
 *
 * الاستخدام:
 *   const wl = require('./sheikha-waterline');
 *   const check = wl.checkRequest(req);       // zero-trust validation
 *   const enc   = wl.encrypt('secret data');  // AES-256 encryption
 *   const dec   = wl.decrypt(enc);            // decryption
 *   const token = wl.issueToken(userId, scope);
 *   const valid = wl.verifyToken(token);
 *
 * ﴿ يَا أَيُّهَا الَّذِينَ آمَنُوا قُوا أَنفُسَكُمْ وَأَهْلِيكُمْ نَاراً ﴾ — التحريم: 6
 */

'use strict';

const crypto = require('crypto');

// ─── ثوابت الأمان ────────────────────────────────────────────────────────────

const ALGORITHM_AES    = 'aes-256-gcm';
const KEY_LENGTH       = 32;   // bytes — 256 bit
const IV_LENGTH        = 16;   // bytes — 128 bit GCM nonce
const AUTH_TAG_LENGTH  = 16;   // bytes — GCM auth tag
const TOKEN_EXPIRY_MS  = 60 * 60 * 1000;   // 1 hour default

/** طبقات الشبكة وحدودها الأمنية (الخط المائي لكل طبقة) */
const NETWORK_LAYERS = {
    PAN:   {
        nameAr: 'شبكة منطقة شخصية', nameEn: 'Personal Area Network',
        range: '< 10m', protocols: ['Bluetooth', 'NFC', 'Zigbee'],
        waterline: { maxRatePerSec: 100, requiresAuth: false, encryptionRequired: false },
    },
    LAN:   {
        nameAr: 'شبكة محلية', nameEn: 'Local Area Network',
        range: '< 1km', protocols: ['Ethernet', 'WiFi'],
        waterline: { maxRatePerSec: 1000, requiresAuth: true, encryptionRequired: false },
    },
    WLAN:  {
        nameAr: 'شبكة محلية لاسلكية', nameEn: 'Wireless LAN',
        range: '< 100m', protocols: ['WiFi 6', 'WiFi 7'],
        waterline: { maxRatePerSec: 500, requiresAuth: true, encryptionRequired: true },
    },
    CAN:   {
        nameAr: 'شبكة منطقة المدينة', nameEn: 'Campus Area Network',
        range: '< 5km', protocols: ['Fiber', '5G'],
        waterline: { maxRatePerSec: 2000, requiresAuth: true, encryptionRequired: true },
    },
    MAN:   {
        nameAr: 'شبكة المدينة', nameEn: 'Metropolitan Area Network',
        range: '< 50km', protocols: ['Metro Ethernet', 'WiMAX'],
        waterline: { maxRatePerSec: 5000, requiresAuth: true, encryptionRequired: true },
    },
    WAN:   {
        nameAr: 'الشبكة الواسعة', nameEn: 'Wide Area Network',
        range: 'Global', protocols: ['MPLS', 'BGP', 'Submarine Cable'],
        waterline: { maxRatePerSec: 10000, requiresAuth: true, encryptionRequired: true },
    },
    VPN:   {
        nameAr: 'الشبكة الخاصة الافتراضية', nameEn: 'Virtual Private Network',
        range: 'Any', protocols: ['WireGuard', 'OpenVPN', 'IPSec'],
        waterline: { maxRatePerSec: 3000, requiresAuth: true, encryptionRequired: true, tunneled: true },
    },
    HTTP:  {
        nameAr: 'بروتوكول نقل النص التشعبي', nameEn: 'HTTP Protocol',
        range: 'Internet', protocols: ['HTTP/1.1', 'HTTP/2'],
        waterline: { maxRatePerSec: 200, requiresAuth: false, encryptionRequired: false, deprecated: true },
    },
    HTTPS: {
        nameAr: 'بروتوكول نقل النص التشعبي الآمن', nameEn: 'HTTPS Protocol',
        range: 'Internet', protocols: ['TLS 1.3', 'HTTP/2', 'HTTP/3'],
        waterline: { maxRatePerSec: 500, requiresAuth: false, encryptionRequired: true, tls: '1.3' },
    },
    TCPIP: {
        nameAr: 'بروتوكول الإنترنت الأساسي', nameEn: 'TCP/IP Protocol Stack',
        range: 'Universal', protocols: ['IPv4', 'IPv6', 'TCP', 'UDP'],
        waterline: { maxRatePerSec: 50000, requiresAuth: false, encryptionRequired: false, fundamental: true },
    },
};

/** مستويات خطورة الحوادث الأمنية */
const THREAT_LEVELS = {
    LOW:      { score: 1, color: '🟢', nameAr: 'منخفضة' },
    MEDIUM:   { score: 2, color: '🟡', nameAr: 'متوسطة' },
    HIGH:     { score: 3, color: '🟠', nameAr: 'عالية'   },
    CRITICAL: { score: 4, color: '🔴', nameAr: 'حرجة'    },
};

// ─── محرك الأمان ─────────────────────────────────────────────────────────────

class SheikhaWaterline {

    constructor() {
        this._encKey     = crypto.randomBytes(KEY_LENGTH);   // مفتاح AES-256 في الذاكرة
        this._incidents  = [];
        this._rateLimits = new Map();   // IP/userId → { count, windowStart }
        this._blocklist  = new Set();
        this._tokens     = new Map();   // tokenId → tokenPayload
        this._startedAt  = new Date().toISOString();
        this._stats      = {
            requests_checked: 0,
            requests_allowed: 0,
            requests_blocked: 0,
            tokens_issued:    0,
            tokens_verified:  0,
            encryptions:      0,
            decryptions:      0,
            incidents:        0,
        };

        // تنظيف دوري للرموز والحوادث القديمة
        const cleanup = setInterval(() => this._cleanupExpired(), 30 * 60 * 1000);
        if (cleanup.unref) cleanup.unref();
    }

    // ══════════════════════════════════════════════════════════════
    // التحقق من الطلبات — Zero Trust
    // ══════════════════════════════════════════════════════════════

    /**
     * يتحقق من طلب HTTP وفق مبدأ Zero-Trust
     * @param {object} req - كائن طلب Express
     * @param {object} [options] - { layer, requireToken }
     * @returns {{ allowed: boolean, score: number, reasons: string[], layer: object }}
     */
    checkRequest(req, options = {}) {
        this._stats.requests_checked++;
        const layer   = options.layer ? NETWORK_LAYERS[options.layer] : null;
        const reasons = [];
        let   blocked = false;
        let   score   = 0;

        const ip      = this._extractIP(req);
        const token   = this._extractToken(req);

        // 1. فحص القائمة السوداء
        if (this._blocklist.has(ip)) {
            blocked = true;
            reasons.push('ip_blocklisted');
            score   = 100;
        }

        // 2. فحص معدل الطلبات (Rate Limiting)
        if (!blocked) {
            const rateKey  = ip || 'unknown';
            const rateLimit = layer ? layer.waterline.maxRatePerSec : 100;
            const ratResult = this._checkRateLimit(rateKey, rateLimit);
            if (!ratResult.ok) {
                blocked = true;
                reasons.push('rate_limit_exceeded');
                score   = 80;
            }
        }

        // 3. فحص التوكن إذا طُلب
        if (!blocked && (options.requireToken || (layer && layer.waterline.requiresAuth))) {
            if (!token) {
                blocked = true;
                reasons.push('missing_auth_token');
                score   = 60;
            } else {
                const tokenResult = this.verifyToken(token);
                if (!tokenResult.valid) {
                    blocked = true;
                    reasons.push(`invalid_token: ${tokenResult.reason}`);
                    score   = 70;
                } else {
                    reasons.push('token_valid');
                    score = Math.max(score - 10, 0);
                }
            }
        }

        // 4. فحص المحتوى المشبوه
        if (!blocked) {
            const bodyCheck = this._checkBody(req.body);
            if (!bodyCheck.ok) {
                blocked = true;
                reasons.push(...bodyCheck.reasons);
                score   = 90;
                this._recordIncident('HIGH', `Suspicious body from ${ip}`, bodyCheck.reasons);
            }
        }

        if (blocked) {
            this._stats.requests_blocked++;
        } else {
            this._stats.requests_allowed++;
            reasons.push('waterline_clear');
        }

        return {
            allowed:  !blocked,
            score,
            ip,
            reasons,
            layer:    layer || null,
            checkedAt: new Date().toISOString(),
        };
    }

    // ══════════════════════════════════════════════════════════════
    // تشفير وفك تشفير — AES-256-GCM
    // ══════════════════════════════════════════════════════════════

    /**
     * يشفّر نصاً بـ AES-256-GCM
     * @param {string|object} data - البيانات للتشفير
     * @returns {{ iv: string, authTag: string, encrypted: string }}
     */
    encrypt(data) {
        const text = typeof data === 'object' ? JSON.stringify(data) : String(data);
        const iv   = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM_AES, this._encKey, iv);

        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted    += cipher.final('hex');
        const authTag = cipher.getAuthTag().toString('hex');

        this._stats.encryptions++;
        return {
            iv:        iv.toString('hex'),
            authTag,
            encrypted,
            algorithm: ALGORITHM_AES,
        };
    }

    /**
     * يفكّ تشفير بيانات مشفّرة بـ AES-256-GCM
     * @param {{ iv: string, authTag: string, encrypted: string }} encObj
     * @returns {string} - النص الأصلي
     */
    decrypt(encObj) {
        const { iv, authTag, encrypted } = encObj;
        const decipher = crypto.createDecipheriv(
            ALGORITHM_AES,
            this._encKey,
            Buffer.from(iv, 'hex')
        );
        decipher.setAuthTag(Buffer.from(authTag, 'hex'));

        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted    += decipher.final('utf8');

        this._stats.decryptions++;
        return decrypted;
    }

    // ══════════════════════════════════════════════════════════════
    // إصدار والتحقق من رموز الوصول
    // ══════════════════════════════════════════════════════════════

    /**
     * يُصدر رمز وصول (token) لمستخدم
     * @param {string} userId
     * @param {string[]} scopes - الصلاحيات المطلوبة
     * @param {number} [expiryMs] - مدة الصلاحية بالمللي ثانية
     */
    issueToken(userId, scopes = ['read'], expiryMs = TOKEN_EXPIRY_MS) {
        const tokenId  = `WL-${crypto.randomBytes(12).toString('hex').toUpperCase()}`;
        const payload  = {
            tokenId,
            userId,
            scopes,
            issuedAt:  Date.now(),
            expiresAt: Date.now() + expiryMs,
            waterline: 'Sheikha-WL/1.0',
        };

        // توقيع مبسّط بـ HMAC-SHA256
        const signature = crypto
            .createHmac('sha256', this._encKey)
            .update(JSON.stringify({ tokenId, userId, expiresAt: payload.expiresAt }))
            .digest('hex');

        this._tokens.set(tokenId, { ...payload, signature });
        this._stats.tokens_issued++;

        return {
            token:     `${tokenId}.${signature.slice(0, 16)}`,
            expiresAt: new Date(payload.expiresAt).toISOString(),
            scopes,
        };
    }

    /**
     * يتحقق من صحة رمز الوصول
     * @param {string} token
     * @returns {{ valid: boolean, payload?: object, reason?: string }}
     */
    verifyToken(token) {
        this._stats.tokens_verified++;
        if (!token || typeof token !== 'string') {
            return { valid: false, reason: 'missing_token' };
        }

        const [tokenId] = token.split('.');
        const stored    = this._tokens.get(tokenId);

        if (!stored) return { valid: false, reason: 'unknown_token' };
        if (Date.now() > stored.expiresAt) {
            this._tokens.delete(tokenId);
            return { valid: false, reason: 'token_expired' };
        }

        return { valid: true, payload: stored };
    }

    // ══════════════════════════════════════════════════════════════
    // إدارة القائمة السوداء
    // ══════════════════════════════════════════════════════════════

    blockIP(ip, reason = 'manual') {
        this._blocklist.add(ip);
        this._recordIncident('HIGH', `IP blocked: ${ip}`, [reason]);
        return { blocked: true, ip };
    }

    unblockIP(ip) {
        const existed = this._blocklist.has(ip);
        this._blocklist.delete(ip);
        return { unblocked: existed, ip };
    }

    // ══════════════════════════════════════════════════════════════
    // حالة الحماية والإحصاءات
    // ══════════════════════════════════════════════════════════════

    getStatus() {
        return {
            nameAr:     'خط أمان شيخة',
            nameEn:     'Sheikha Waterline',
            version:    '1.0.0',
            startedAt:  this._startedAt,
            uptime:     process.uptime(),
            stats:      { ...this._stats },
            blocklist:  this._blocklist.size,
            activeTokens: [...this._tokens.values()].filter(t => t.expiresAt > Date.now()).length,
            recentIncidents: this._incidents.slice(-5),
            verse:      '﴿ يَا أَيُّهَا الَّذِينَ آمَنُوا قُوا أَنفُسَكُمْ وَأَهْلِيكُمْ نَاراً ﴾ — التحريم: 6',
            hadith:     '«لا ضرر ولا ضرار» — ابن ماجه',
        };
    }

    getNetworkLayers() {
        return {
            nameAr:  'طبقات الشبكة وخطوط الأمان',
            layers:  Object.entries(NETWORK_LAYERS).map(([id, data]) => ({ id, ...data })),
            total:   Object.keys(NETWORK_LAYERS).length,
            verse:   '﴿ وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ ﴾ — الأنفال: 60',
        };
    }

    getIncidents(level = null, limit = 20) {
        let incidents = [...this._incidents];
        if (level) incidents = incidents.filter(i => i.level === level);
        return {
            incidents: incidents.slice(-limit),
            total:     incidents.length,
        };
    }

    // ══════════════════════════════════════════════════════════════
    // مساعدات داخلية
    // ══════════════════════════════════════════════════════════════

    _extractIP(req) {
        return (req && (req.ip || (req.headers && (req.headers['x-forwarded-for'] || req.headers['x-real-ip'])) || 'unknown')) || 'unknown';
    }

    _extractToken(req) {
        if (!req || !req.headers) return null;
        const auth = req.headers['authorization'] || req.headers['x-sheikha-token'] || '';
        if (auth.startsWith('Bearer ')) return auth.slice(7).trim();
        return auth.trim() || null;
    }

    _checkRateLimit(key, maxPerSec) {
        const now    = Date.now();
        const window = 1000;   // 1 second window
        const entry  = this._rateLimits.get(key);

        if (!entry || (now - entry.windowStart) > window) {
            this._rateLimits.set(key, { count: 1, windowStart: now });
            return { ok: true, count: 1, limit: maxPerSec };
        }

        entry.count++;
        if (entry.count > maxPerSec) {
            return { ok: false, count: entry.count, limit: maxPerSec };
        }
        return { ok: true, count: entry.count, limit: maxPerSec };
    }

    _checkBody(body) {
        if (!body) return { ok: true, reasons: [] };
        const SUSPICIOUS_PATTERNS = [
            { pattern: /<script[\s\S]*?>/i, reason: 'xss_script_tag' },
            { pattern: /;\s*drop\s+table/i, reason: 'sql_injection' },
            { pattern: /\.\.[/\\]/,          reason: 'path_traversal' },
            { pattern: /riba|ربا/i,           reason: 'sharia_violation_riba' },
        ];
        const str     = JSON.stringify(body);
        const reasons = SUSPICIOUS_PATTERNS
            .filter(({ pattern }) => pattern.test(str))
            .map(({ reason }) => reason);
        return { ok: reasons.length === 0, reasons };
    }

    _recordIncident(level, description, details = []) {
        this._stats.incidents++;
        const incident = {
            id:          `INC-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
            level,
            description,
            details,
            timestamp:   new Date().toISOString(),
            threatScore: THREAT_LEVELS[level]?.score || 1,
        };
        this._incidents.push(incident);
        if (this._incidents.length > 500) this._incidents.splice(0, this._incidents.length - 500);
        return incident;
    }

    _cleanupExpired() {
        const now = Date.now();
        let cleaned = 0;
        this._tokens.forEach((payload, id) => {
            if (payload.expiresAt < now) { this._tokens.delete(id); cleaned++; }
        });
        // تنظيف rate limits قديمة
        this._rateLimits.forEach((entry, key) => {
            if ((now - entry.windowStart) > 60000) { this._rateLimits.delete(key); }
        });
        return cleaned;
    }
}

// ─── Singleton ──────────────────────────────────────────────────────────────
const waterline = new SheikhaWaterline();

module.exports = {
    waterline,
    SheikhaWaterline,
    NETWORK_LAYERS,
    THREAT_LEVELS,
};
