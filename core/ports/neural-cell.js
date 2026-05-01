/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  SHEIKHA NEURAL PORT CELL — الخلية العصبية للمنفذ                           ║
 * ║                                                                              ║
 * ║  خلية ذاتية التحرر: لا تنشغل، لا تنتظر، تكتشف منفذاً حراً وتبدأ فوراً    ║
 * ║  خلية ذاتية الشفاء: إذا مات المنفذ تُولد خلية جديدة في نطاقها             ║
 * ║  خلية ذاتية التكاثر: تُبلّغ الشبكة العصبية بموقعها الحقيقي                 ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * "وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ" — هود:٨٨
 * "لا ضرر ولا ضرار" — ابن ماجه:٢٣٤٠
 *
 * المبدأ: المنفذ ليس ثابتاً — الخدمة هي الثابت
 * Principle: The port is not fixed — the SERVICE is what matters
 */

'use strict';

const net        = require('net');
const fs         = require('fs');
const path       = require('path');
const { EventEmitter } = require('events');

// ─── ثوابت ───────────────────────────────────────────────────────────────────
const PID_DIR    = path.join(__dirname, '../../data/ports');
const TAWHEED    = 'لا إله إلا الله';
const NO_HARM    = 'لا ضرر ولا ضرار';

// ═══════════════════════════════════════════════════════════════
// الخلية العصبية — NeuralPortCell
// ═══════════════════════════════════════════════════════════════
class NeuralPortCell extends EventEmitter {

    /**
     * @param {object} config
     * @param {string} config.id          معرّف الخلية (مثال: 'MAIN' | 'MARKETPLACE')
     * @param {string} config.nameAr      اسم الخلية بالعربية
     * @param {string} config.role        دور الخلية
     * @param {number} config.preferredPort المنفذ المفضل
     * @param {number} config.rangeStart  بداية نطاق المنافذ
     * @param {number} config.rangeEnd    نهاية نطاق المنافذ
     * @param {string} [config.bind]      العنوان (افتراضي: '0.0.0.0')
     * @param {number} [config.healDelay] تأخير إعادة الإطلاق بعد الموت (ms)
     */
    constructor(config) {
        super();
        this.id            = config.id;
        this.nameAr        = config.nameAr || config.id;
        this.role          = config.role   || 'GENERAL';
        this.preferredPort = config.preferredPort;
        this.rangeStart    = config.rangeStart || config.preferredPort;
        this.rangeEnd      = config.rangeEnd   || config.preferredPort + 10;
        this.bind          = config.bind       || '127.0.0.1';
        this.healDelay     = config.healDelay  || 2000;

        this.actualPort    = null;   // المنفذ الفعلي المُستخدم (يُحدَّد عند البدء)
        this.status        = 'IDLE'; // IDLE | SCANNING | ALIVE | HEALING | DEAD
        this.birthTime     = null;
        this.healCount     = 0;
        this.maxHealCount  = 5;

        this._scanAttempts = 0;
        this._pidFile      = path.join(PID_DIR, `${this.id.toLowerCase()}.port`);

        this._ensurePidDir();
    }

    // ─── ① اكتشاف منفذ حر (التحرر من الانشغال) ─────────────────────────────

    /**
     * يمسح نطاق المنافذ ويعيد أول منفذ حر
     * @returns {Promise<number>}
     */
    findFreePort() {
        this.status = 'SCANNING';
        this.emit('scanning', { cell: this.id, range: [this.rangeStart, this.rangeEnd] });

        return new Promise((resolve, reject) => {
            let current = this.preferredPort;

            const tryPort = (port) => {
                if (port > this.rangeEnd) {
                    this.status = 'DEAD';
                    return reject(new Error(
                        `[${this.id}] لا يوجد منفذ حر في النطاق ${this.rangeStart}-${this.rangeEnd}`
                    ));
                }

                const probe = net.createServer();

                probe.once('error', (err) => {
                    if (err.code === 'EADDRINUSE') {
                        this.emit('port-occupied', { cell: this.id, port, next: port + 1 });
                        tryPort(port + 1);   // تكاثر: انتقل للمنفذ التالي
                    } else {
                        reject(err);
                    }
                });

                probe.once('listening', () => {
                    const found = probe.address().port;
                    probe.close(() => resolve(found));
                });

                probe.listen(port, this.bind);
            };

            tryPort(current);
        });
    }

    // ─── ② حفظ الموقع في PID file (تبليغ الشبكة) ───────────────────────────

    saveLocation(port) {
        try {
            const record = JSON.stringify({
                id:       this.id,
                port,
                bind:     this.bind,
                pid:      process.pid,
                role:     this.role,
                tawheed:  TAWHEED,
                no_harm:  NO_HARM,
                born_at:  new Date().toISOString(),
            }, null, 2);
            fs.writeFileSync(this._pidFile, record, 'utf8');
        } catch (_) {
            // الملف ليس ضرورياً للتشغيل
        }
    }

    readLocation() {
        try {
            if (fs.existsSync(this._pidFile)) {
                return JSON.parse(fs.readFileSync(this._pidFile, 'utf8'));
            }
        } catch (_) {}
        return null;
    }

    clearLocation() {
        try { if (fs.existsSync(this._pidFile)) fs.unlinkSync(this._pidFile); } catch (_) {}
    }

    // ─── ③ الولادة: اكتشاف + حجز المنفذ + إبلاغ الشبكة ────────────────────

    async born() {
        this._scanAttempts++;
        try {
            const port = await this.findFreePort();
            this.actualPort = port;
            this.status     = 'ALIVE';
            this.birthTime  = new Date();
            this.saveLocation(port);

            const wasPreferred = port === this.preferredPort;
            this.emit('alive', {
                cell:          this.id,
                port,
                preferred:     this.preferredPort,
                relocated:     !wasPreferred,
                relocation_msg: wasPreferred
                    ? `✅ [${this.id}] المنفذ ${port} حر — بدأ مباشرةً`
                    : `🔄 [${this.id}] المنفذ ${this.preferredPort} مشغول — انتقل إلى ${port}`,
                tawheed:  TAWHEED,
                no_harm:  NO_HARM,
            });

            return port;

        } catch (err) {
            this.status = 'DEAD';
            this.emit('dead', { cell: this.id, error: err.message });
            throw err;
        }
    }

    // ─── ④ الشفاء الذاتي: إذا مات المنفذ تُعاد المحاولة ───────────────────

    async heal() {
        if (this.healCount >= this.maxHealCount) {
            this.status = 'DEAD';
            this.emit('dead', { cell: this.id, reason: 'تجاوز الحد الأقصى لمحاولات الشفاء' });
            return null;
        }

        this.healCount++;
        this.status = 'HEALING';
        this.actualPort = null;
        this.clearLocation();

        this.emit('healing', {
            cell:       this.id,
            attempt:    this.healCount,
            max:        this.maxHealCount,
            delay_ms:   this.healDelay,
        });

        await new Promise((r) => setTimeout(r, this.healDelay));
        return this.born();
    }

    // ─── ⑤ الوفاة النظيفة ────────────────────────────────────────────────────

    die(reason = 'طلب إيقاف') {
        this.status = 'DEAD';
        this.clearLocation();
        this.emit('dead', { cell: this.id, reason, graceful: true });
    }

    // ─── ⑥ بيانات الخلية الكاملة ─────────────────────────────────────────────

    getInfo() {
        return {
            id:             this.id,
            nameAr:         this.nameAr,
            role:           this.role,
            preferredPort:  this.preferredPort,
            actualPort:     this.actualPort,
            range:          [this.rangeStart, this.rangeEnd],
            bind:           this.bind,
            status:         this.status,
            birthTime:      this.birthTime,
            healCount:      this.healCount,
            tawheed:        TAWHEED,
            no_harm:        NO_HARM,
        };
    }

    // ─── مساعدات ──────────────────────────────────────────────────────────────

    _ensurePidDir() {
        try {
            if (!fs.existsSync(PID_DIR)) fs.mkdirSync(PID_DIR, { recursive: true });
        } catch (_) {}
    }
}

// ═══════════════════════════════════════════════════════════════
// Export
// ═══════════════════════════════════════════════════════════════
module.exports = { NeuralPortCell };
