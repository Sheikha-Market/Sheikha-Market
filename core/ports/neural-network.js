/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  SHEIKHA NEURAL PORT NETWORK — الشبكة العصبية للمنافذ                       ║
 * ║                                                                              ║
 * ║  لا اعتماد على منفذ واحد — الشبكة تعيش بموت أي خلية                        ║
 * ║  تكاثر ذاتي — توازن حمل — شفاء فوري — اكتشاف المنافذ تلقائياً             ║
 * ║  المنفذ الأساسي + التكاثري + الاحتياطي = شبكة لا تنهار                      ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * "وَاللَّهُ مِن وَرَائِهِم مُّحِيطٌ" — البروج:٢٠
 * "الله في عون العبد ما كان العبد في عون أخيه" — مسلم:٢٦٩٩
 *
 * معمارية الشبكة العصبية:
 *
 *   ┌─────────────────────────────────────────────────────────┐
 *   │              SHEIKHA NEURAL PORT NETWORK                 │
 *   │                                                           │
 *   │  ┌──────────────┐     ┌──────────────┐                   │
 *   │  │  MAIN CELL   │     │  MARKET CELL │                   │
 *   │  │  8080→8089   │     │  8081→8091   │                   │
 *   │  │  preferred:  │     │  preferred:  │                   │
 *   │  │    8080      │     │    8081      │                   │
 *   │  └──────┬───────┘     └──────┬───────┘                   │
 *   │         │ alive/heal         │ alive/heal                │
 *   │  ┌──────▼──────────────────▼──────┐                     │
 *   │  │     NETWORK COORDINATOR         │                     │
 *   │  │  - Route discovery              │                     │
 *   │  │  - Health checks                │                     │
 *   │  │  - Auto-heal on failure         │                     │
 *   │  │  - Port state file broadcast    │                     │
 *   │  └─────────────────────────────────┘                     │
 *   └─────────────────────────────────────────────────────────┘
 */

'use strict';

const { EventEmitter }    = require('events');
const { NeuralPortCell }  = require('./neural-cell');

// ─── ثوابت ───────────────────────────────────────────────────────────────────
const TAWHEED = 'لا إله إلا الله';
const NO_HARM = 'لا ضرر ولا ضرار';

// ═══════════════════════════════════════════════════════════════
// تعريف خلايا الشبكة الافتراضية
// ═══════════════════════════════════════════════════════════════
// العنوان المُستخدَم لاكتشاف المنافذ — يُقرأ من متغير البيئة HOST:
//   0.0.0.0  → الإنتاج / Docker / GitHub Codespaces (الافتراضي)
//   127.0.0.1 → التطوير المحلي فقط (ضع HOST=127.0.0.1 في .env)
// .trim() يحمي من قيمة HOST تحتوي مسافات أو فارغة تمامًا
const _BIND_HOST = (process.env.HOST || '').trim() || '0.0.0.0';

const DEFAULT_CELLS_CONFIG = [
    {
        id:            'MAIN',
        nameAr:        'الخادم الرئيسي — شيخة الأساسي',
        role:          'CORE',
        preferredPort: 8080,
        rangeStart:    8080,
        rangeEnd:      8089,
        bind:          _BIND_HOST,
        healDelay:     1500,
        critical:      true,            // يجب أن تكون حية دائماً
        quranic_ref:   { ref: 'النحل:٩٠', text: 'إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ' },
    },
    {
        id:            'MARKETPLACE',
        nameAr:        'سوق الأسواق الجامع — بوابة الأسواق المتعددة',
        role:          'MARKETPLACE',
        preferredPort: 8081,
        rangeStart:    8081,
        rangeEnd:      8091,
        bind:          _BIND_HOST,
        healDelay:     2000,
        critical:      false,
        quranic_ref:   { ref: 'النساء:٢٩', text: 'إِلَّا أَن تَكُونَ تِجَارَةً عَن تَرَاضٍ مِّنكُمْ' },
    },
];

// ═══════════════════════════════════════════════════════════════
// الشبكة العصبية — NeuralPortNetwork
// ═══════════════════════════════════════════════════════════════
class NeuralPortNetwork extends EventEmitter {

    constructor(cellsConfig = DEFAULT_CELLS_CONFIG) {
        super();

        this.nameAr   = 'الشبكة العصبية لمنافذ شيخة';
        this.nameEn   = 'Sheikha Neural Port Network';
        this.tawheed  = TAWHEED;
        this.no_harm  = NO_HARM;
        this.status   = 'DORMANT';     // DORMANT | INITIALIZING | ALIVE | DEGRADED | DEAD
        this.startedAt = null;

        // إنشاء الخلايا
        this._cells = new Map();
        for (const cfg of cellsConfig) {
            const cell = new NeuralPortCell(cfg);
            this._cells.set(cfg.id, { cell, config: cfg });
            this._wireCell(cell, cfg);
        }

        // جدول الفحص الدوري (كل ٣٠ ثانية)
        this._healthTimer = null;
    }

    // ─── ① إطلاق الشبكة (تولّد كل الخلايا تلقائياً) ────────────────────────

    async ignite() {
        this.status    = 'INITIALIZING';
        this.startedAt = new Date();

        this.emit('network:igniting', {
            nameAr:  this.nameAr,
            cells:   this._cells.size,
            tawheed: this.tawheed,
        });

        const results = [];
        const errors  = [];

        for (const [id, { cell }] of this._cells) {
            try {
                const port = await cell.born();
                results.push({ id, port, status: 'ALIVE' });
            } catch (err) {
                errors.push({ id, error: err.message });
                // إذا لم تكن الخلية حرجة، تستمر الشبكة بدونها
                const cfg = this._cells.get(id).config;
                if (cfg.critical) {
                    this.status = 'DEAD';
                    this.emit('network:dead', { reason: `الخلية الحرجة [${id}] فشلت: ${err.message}` });
                    throw err;
                }
            }
        }

        const aliveCells = results.length;
        this.status = aliveCells > 0 ? (errors.length > 0 ? 'DEGRADED' : 'ALIVE') : 'DEAD';

        this._startHealthMonitor();

        const summary = this.getNetworkStatus();
        this.emit('network:alive', summary);

        this._printBanner(summary);
        return summary;
    }

    // ─── ② الفحص الدوري + الشفاء التلقائي ───────────────────────────────────

    _startHealthMonitor() {
        if (this._healthTimer) clearInterval(this._healthTimer);
        this._healthTimer = setInterval(() => this._runHealthCheck(), 30000);
        if (this._healthTimer.unref) this._healthTimer.unref(); // لا يمنع إغلاق العملية
    }

    async _runHealthCheck() {
        for (const [id, { cell, config }] of this._cells) {
            if (cell.status === 'DEAD' || cell.status === 'IDLE') {
                this.emit('network:cell-down', { id, status: cell.status });
                try {
                    await cell.heal();
                } catch (e) {
                    if (config.critical) {
                        this.status = 'DEGRADED';
                        this.emit('network:degraded', { reason: `[${id}] لم يتعافَ: ${e.message}` });
                    }
                }
            }
        }
        this.status = this._computeNetworkStatus();
    }

    _computeNetworkStatus() {
        const statuses = Array.from(this._cells.values()).map(({ cell }) => cell.status);
        if (statuses.every((s) => s === 'ALIVE')) return 'ALIVE';
        if (statuses.some((s) => s === 'ALIVE'))  return 'DEGRADED';
        return 'DEAD';
    }

    // ─── ③ الربط بأحداث الخلية ───────────────────────────────────────────────

    _wireCell(cell, config) {
        cell.on('alive', (info) => {
            this.emit('cell:alive', { ...info, critical: config.critical });
            this.status = this._computeNetworkStatus();
        });

        cell.on('port-occupied', (info) => {
            this.emit('cell:relocated', {
                ...info,
                msg: `🔄 [${info.cell}] المنفذ ${info.port} مشغول بعملية قديمة — الانتقال التلقائي إلى ${info.next}`,
                solution: 'لا إيقاف، لا خطأ — الشبكة العصبية تتكيف فوراً',
                no_harm: NO_HARM,
            });
        });

        cell.on('healing', (info) => {
            this.emit('cell:healing', info);
        });

        cell.on('dead', (info) => {
            this.emit('cell:dead', { ...info, critical: config.critical });
            if (config.critical) this.status = 'DEGRADED';
        });
    }

    // ─── ④ إيقاف الشبكة بأمان ────────────────────────────────────────────────

    shutdown(reason = 'طلب إيقاف نظيف') {
        if (this._healthTimer) clearInterval(this._healthTimer);
        for (const [, { cell }] of this._cells) cell.die(reason);
        this.status = 'DORMANT';
        this.emit('network:shutdown', { reason, tawheed: this.tawheed });
    }

    // ─── ⑤ الحالة الكاملة للشبكة ─────────────────────────────────────────────

    getNetworkStatus() {
        const cells = {};
        for (const [id, { cell, config }] of this._cells) {
            cells[id] = {
                ...cell.getInfo(),
                critical:    config.critical,
                quranic_ref: config.quranic_ref,
            };
        }

        return {
            nameAr:    this.nameAr,
            status:    this.status,
            startedAt: this.startedAt,
            tawheed:   this.tawheed,
            no_harm:   this.no_harm,
            cells,
            port_map:  this._buildPortMap(),
            verse: { ref: 'الأنفال:٦٠', text: 'وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ' },
        };
    }

    _buildPortMap() {
        const map = {};
        for (const [id, { cell }] of this._cells) {
            if (cell.actualPort) map[id] = cell.actualPort;
        }
        return map;
    }

    // ─── ⑥ اكتشاف منفذ خلية بالاسم ──────────────────────────────────────────

    getPort(cellId) {
        const entry = this._cells.get(cellId);
        if (!entry) return null;
        return entry.cell.actualPort;
    }

    getCell(cellId) {
        const entry = this._cells.get(cellId);
        return entry ? entry.cell : null;
    }

    // ─── ⑦ إضافة خلية جديدة للشبكة (التوسع الذاتي) ──────────────────────────

    async addCell(config) {
        if (this._cells.has(config.id)) return this._cells.get(config.id).cell.getInfo();
        const cell = new NeuralPortCell(config);
        this._cells.set(config.id, { cell, config });
        this._wireCell(cell, config);
        const port = await cell.born();
        return { ...cell.getInfo(), port };
    }

    // ─── ⑧ اللافتة التعريفية ────────────────────────────────────────────────

    _printBanner(summary) {
        const lines = Object.entries(summary.cells).map(([id, c]) =>
            `║  ${c.status === 'ALIVE' ? '✅' : '⚠️ '} ${id.padEnd(15)} → منفذ ${String(c.actualPort || '—').padStart(5)}  (مفضّل: ${c.preferredPort}) ${c.actualPort !== c.preferredPort ? '🔄 انتقل' : '     '} ║`
        );

        console.log(`
╔══════════════════════════════════════════════════════════╗
║       🧠 الشبكة العصبية لمنافذ شيخة — ${this.status.padEnd(10)}       ║
╠══════════════════════════════════════════════════════════╣
${lines.join('\n')}
╠══════════════════════════════════════════════════════════╣
║  ${this.tawheed.padEnd(42)}    ║
║  ${this.no_harm.padEnd(42)}   ║
╚══════════════════════════════════════════════════════════╝`);
    }
}

// ═══════════════════════════════════════════════════════════════
// الشبكة العصبية الافتراضية — Singleton
// ═══════════════════════════════════════════════════════════════
const network = new NeuralPortNetwork(DEFAULT_CELLS_CONFIG);

// ═══════════════════════════════════════════════════════════════
// Export
// ═══════════════════════════════════════════════════════════════
module.exports = {
    NeuralPortNetwork,
    network,
    DEFAULT_CELLS_CONFIG,
};
