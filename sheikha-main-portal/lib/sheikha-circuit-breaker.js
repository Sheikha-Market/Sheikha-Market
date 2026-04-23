// ═══════════════════════════════════════════════════════════════════════════════
// ⚡ Sheikha Circuit Breaker — قاطع دائري لحماية الشبكة
// ═══════════════════════════════════════════════════════════════════════════════
// يمنع انهيار النظام حين يفشل API خارجي متكرراً.
// ثلاث حالات: CLOSED (طبيعي) → OPEN (مفتوح/محجوب) → HALF_OPEN (اختبار)
// ═══════════════════════════════════════════════════════════════════════════════

'use strict';

const EventEmitter = require('events');

const STATE = { CLOSED: 'CLOSED', OPEN: 'OPEN', HALF_OPEN: 'HALF_OPEN' };

class CircuitBreaker extends EventEmitter {
    /**
     * @param {Function} fn       - الدالة المحمية (async)
     * @param {object}   options
     * @param {number}   options.failureThreshold  - عدد الإخفاقات قبل الفتح (افتراضي: 5)
     * @param {number}   options.successThreshold  - عدد النجاحات في HALF_OPEN للإغلاق (افتراضي: 2)
     * @param {number}   options.timeout           - مهلة الاستجابة ms (افتراضي: 10000)
     * @param {number}   options.resetTimeout      - مدة الانتظار في OPEN قبل HALF_OPEN ms (افتراضي: 30000)
     * @param {string}   options.name              - اسم القاطع للتسجيل
     */
    constructor(fn, options = {}) {
        super();
        this._fn               = fn;
        this.name              = options.name || 'circuit';
        this.failureThreshold  = options.failureThreshold  ?? 5;
        this.successThreshold  = options.successThreshold  ?? 2;
        this.timeout           = options.timeout           ?? 10_000;
        this.resetTimeout      = options.resetTimeout      ?? 30_000;

        this._state            = STATE.CLOSED;
        this._failureCount     = 0;
        this._successCount     = 0;
        this._nextAttempt      = Date.now();
        this._stats            = { calls: 0, successes: 0, failures: 0, rejected: 0 };
    }

    get state() { return this._state; }

    // ─── تنفيذ الدالة المحمية ──────────────────────────────────────────────────
    async call(...args) {
        this._stats.calls++;

        if (this._state === STATE.OPEN) {
            if (Date.now() < this._nextAttempt) {
                this._stats.rejected++;
                const err = new Error(`[CircuitBreaker:${this.name}] الدائرة مفتوحة — الطلب محجوب | Circuit is OPEN — request blocked`);
                err.code = 'CIRCUIT_OPEN';
                err.messageAr = 'الدائرة مفتوحة — الطلب محجوب';
                err.messageEn = 'Circuit is OPEN — request blocked';
                throw err;
            }
            this._toHalfOpen();
        }

        try {
            const result = await this._callWithTimeout(...args);
            this._onSuccess();
            return result;
        } catch (err) {
            if (err.code !== 'CIRCUIT_OPEN') this._onFailure(err);
            throw err;
        }
    }

    // ─── مهلة الاستجابة ───────────────────────────────────────────────────────
    _callWithTimeout(...args) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                const err = new Error(`[CircuitBreaker:${this.name}] انتهت المهلة (${this.timeout}ms)`);
                err.code = 'CIRCUIT_TIMEOUT';
                reject(err);
            }, this.timeout);

            Promise.resolve()
                .then(() => this._fn(...args))
                .then((v) => { clearTimeout(timer); resolve(v); })
                .catch((e) => { clearTimeout(timer); reject(e); });
        });
    }

    // ─── انتقالات الحالة ──────────────────────────────────────────────────────
    _onSuccess() {
        this._stats.successes++;
        this._failureCount = 0;
        if (this._state === STATE.HALF_OPEN) {
            this._successCount++;
            if (this._successCount >= this.successThreshold) this._toClosed();
        }
    }

    _onFailure(err) {
        this._stats.failures++;
        this._failureCount++;
        if (this._state === STATE.HALF_OPEN || this._failureCount >= this.failureThreshold) {
            this._toOpen(err);
        }
    }

    _toClosed() {
        this._state        = STATE.CLOSED;
        this._failureCount = 0;
        this._successCount = 0;
        this.emit('close', { name: this.name });
    }

    _toOpen(err) {
        this._state        = STATE.OPEN;
        this._nextAttempt  = Date.now() + this.resetTimeout;
        this._successCount = 0;
        this.emit('open', { name: this.name, error: err?.message });
    }

    _toHalfOpen() {
        this._state        = STATE.HALF_OPEN;
        this._successCount = 0;
        this.emit('halfOpen', { name: this.name });
    }

    // ─── الحالة للمراقبة ──────────────────────────────────────────────────────
    status() {
        return {
            name:          this.name,
            state:         this._state,
            failureCount:  this._failureCount,
            successCount:  this._successCount,
            nextAttemptIn: this._state === STATE.OPEN
                ? Math.max(0, this._nextAttempt - Date.now())
                : 0,
            stats:         { ...this._stats }
        };
    }
}

// ─── مسجّل مركزي للقواطع ──────────────────────────────────────────────────────
const _registry = new Map();

/**
 * أنشئ قاطعاً أو أعد استخدام القائم
 * @param {string}   name
 * @param {Function} fn
 * @param {object}   options
 * @returns {CircuitBreaker}
 */
function getBreaker(name, fn, options = {}) {
    if (!_registry.has(name)) {
        const cb = new CircuitBreaker(fn, { name, ...options });
        cb.on('open',     (d) => console.warn(`⚡ [CircuitBreaker] ${d.name} → OPEN`));
        cb.on('halfOpen', (d) => console.log(`⚡ [CircuitBreaker] ${d.name} → HALF_OPEN`));
        cb.on('close',    (d) => console.log(`⚡ [CircuitBreaker] ${d.name} → CLOSED`));
        _registry.set(name, cb);
    }
    return _registry.get(name);
}

function allStatus() {
    return Array.from(_registry.values()).map(cb => cb.status());
}

module.exports = { CircuitBreaker, getBreaker, allStatus, STATE };
