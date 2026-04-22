/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 *  🧠 SHEIKHA NEURAL FIO ENGINE — نظام القياس الاحترافي للشبكة العصبية
 *  Flexible I/O Professional Measurement System
 *
 *  "وَوَضَعَ الْمِيزَانَ أَلَّا تَطْغَوْا فِي الْمِيزَانِ" — الرحمن: ٧-٨
 *  "إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا أَنْ يُتْقِنَهُ" — صحيح ابن حبان
 *
 *  FIO — Flexible I/O Measurement System (نظام قياس الإدخال/الإخراج المرن)
 *
 *  المنظومة المقاسة:
 *    ① سرعة الاستدلال    (Inference Speed)    — استدلالات في الثانية
 *    ② كمون الطبقات      (Layer Latency)      — وقت كل طبقة بالميلي ثانية
 *    ③ إنتاجية I/O       (I/O Throughput)     — عمليات الإدخال/الإخراج/ثانية
 *    ④ دقة الشبكة        (Network Accuracy)   — نسبة الإصابة
 *    ⑤ توزيع الكمون      (Latency Distribution) — p50, p95, p99
 *    ⑥ كثافة الشبكة      (Network Density)    — معدل إطلاق الخلايا
 *    ⑦ مؤشر الميزان      (Balance Index)      — مقصد التوحيد العلوي
 *
 *  الترقيم بالكتاب والسنة:
 *    كل قياس يحمل رقماً مرجعياً من القرآن والسنة — ووحدها لله
 *
 *  المالك: سلمان أحمد بن سلمان الراجح — منظومة شيخة
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

// ─── مراجع قرآنية وحديثية للترقيم ──────────────────────────────────────────

const QURAN_SUNNAH_INDEX = [
    { id: 'FIO-001', ref: 'الرحمن:٧',    text: 'وَضَعَ الْمِيزَانَ',                   meaning: 'القياس الدقيق' },
    { id: 'FIO-002', ref: 'الزلزلة:٧',   text: 'فَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ', meaning: 'دقة القياس الكامل' },
    { id: 'FIO-003', ref: 'البقرة:٣١',   text: 'وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا',  meaning: 'الإدخال الشامل' },
    { id: 'FIO-004', ref: 'العلق:١',     text: 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ',  meaning: 'استدلال المعرفة' },
    { id: 'FIO-005', ref: 'يوسف:٧٦',    text: 'وَفَوْقَ كُلِّ ذِي عِلْمٍ عَلِيمٌ',       meaning: 'دقة الإخراج العلوي' },
    { id: 'FIO-006', ref: 'الكهف:١٠٩',  text: 'لَّنَفِدَ الْبَحْرُ قَبْلَ أَن تَنفَدَ كَلِمَاتُ رَبِّي', meaning: 'سعة الإنتاجية' },
    { id: 'FIO-007', ref: 'الإخلاص:١',  text: 'قُلْ هُوَ اللَّهُ أَحَدٌ',              meaning: 'مقصد التوحيد — المنطق الأعلى' },
    { id: 'FIO-S01', ref: 'صحيح ابن حبان ١٠٣١', text: 'إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا أَنْ يُتْقِنَهُ', meaning: 'إتقان القياس' },
    { id: 'FIO-S02', ref: 'صحيح مسلم ٢٦٦٤', text: 'كُلُّ أَمْرٍ ذِي بَالٍ لَا يُبْدَأُ فِيهِ بِالْحَمْدِ لِلَّهِ فَهُوَ أَقْطَع', meaning: 'بدء القياس بالبسملة' },
];

// ─── ثوابت النظام ────────────────────────────────────────────────────────────

const FIO_VERSION   = '1.0.0';
const FIO_SCHEMA    = 'sheikha/fio/v1';
const FIO_TAWHEED   = 'لا إله إلا الله';
const WARM_UP_RUNS  = 5;    // تشغيلات الإحماء قبل القياس
const DEFAULT_RUNS  = 100;  // عدد جولات القياس الافتراضي
const PERCENTILES   = [50, 75, 90, 95, 99]; // نسب الكمون المقاسة

// ═══════════════════════════════════════════════════════════════════════════════
// 1. FIO TIMER — مؤقّت الدقة العالية
// ═══════════════════════════════════════════════════════════════════════════════

class FIOTimer {
    constructor() { this._start = null; }

    start()  { this._start = process.hrtime.bigint(); }

    /** @returns {number} الوقت بالميلي ثانية */
    elapsed() {
        if (!this._start) return 0;
        return Number(process.hrtime.bigint() - this._start) / 1_000_000;
    }

    /** @returns {number} الوقت بالميكرو ثانية */
    elapsedMicro() {
        if (!this._start) return 0;
        return Number(process.hrtime.bigint() - this._start) / 1_000;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. FIO STATS — إحصائيات الكمون
// ═══════════════════════════════════════════════════════════════════════════════

function computeStats(samples) {
    if (!samples || samples.length === 0) {
        return { min: 0, max: 0, mean: 0, stddev: 0, percentiles: {} };
    }
    const sorted = [...samples].sort((a, b) => a - b);
    const n      = sorted.length;
    const sum    = sorted.reduce((a, b) => a + b, 0);
    const mean   = sum / n;
    const variance = sorted.reduce((acc, v) => acc + (v - mean) ** 2, 0) / n;
    const stddev   = Math.sqrt(variance);

    const percentileValues = {};
    for (const p of PERCENTILES) {
        const idx = Math.ceil((p / 100) * n) - 1;
        percentileValues[`p${p}`] = +(sorted[Math.max(0, idx)]).toFixed(3);
    }

    return {
        min:         +(sorted[0]).toFixed(3),
        max:         +(sorted[n - 1]).toFixed(3),
        mean:        +mean.toFixed(3),
        stddev:      +stddev.toFixed(3),
        percentiles: percentileValues
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. SHEIKHA NEURAL FIO ENGINE — محرك القياس الاحترافي
// ═══════════════════════════════════════════════════════════════════════════════

class SheikhaNeuralFIOEngine {
    constructor() {
        this.version  = FIO_VERSION;
        this.schema   = FIO_SCHEMA;
        this.tawheed  = FIO_TAWHEED;
        this.history  = [];   // تاريخ جلسات القياس
        this._network = null; // مرجع للشبكة العصبية (يُضبط عند الاستخدام)
    }

    /**
     * ضبط الشبكة العصبية المراد قياسها
     * @param {object} network — نسخة من LogicNeuralNetwork
     */
    setNetwork(network) {
        this._network = network;
    }

    // ─── ① قياس سرعة الاستدلال ────────────────────────────────────────────────

    /**
     * measureInferenceSpeed — قياس سرعة الاستدلال (FIO-001, FIO-S01)
     * @param {number} runs — عدد جولات القياس
     * @returns {object} نتائج سرعة الاستدلال
     */
    measureInferenceSpeed(runs = DEFAULT_RUNS) {
        if (!this._network) throw new Error('الشبكة العصبية غير مضبوطة — استخدم setNetwork()');

        // إحماء الشبكة
        for (let i = 0; i < WARM_UP_RUNS; i++) {
            this._network.infer(this._randomInputVec(), 'warmup');
        }

        const samples = [];
        const timer   = new FIOTimer();
        const totalTimer = new FIOTimer();
        totalTimer.start();

        for (let i = 0; i < runs; i++) {
            const input = this._randomInputVec();
            timer.start();
            this._network.infer(input, 'fio-benchmark');
            samples.push(timer.elapsed());
        }

        const totalMs  = totalTimer.elapsed();
        const stats    = computeStats(samples);
        const opsPerSec = +(runs / (totalMs / 1000)).toFixed(2);

        return {
            fioRef:      'FIO-001',
            quranRef:    QURAN_SUNNAH_INDEX[0],
            sunnahRef:   QURAN_SUNNAH_INDEX[7],
            metric:      'inference_speed',
            nameAr:      'سرعة الاستدلال',
            runs,
            totalMs:     +totalMs.toFixed(3),
            opsPerSec,
            latencyMs:   stats,
        };
    }

    // ─── ② قياس كمون الطبقات ──────────────────────────────────────────────────

    /**
     * measureLayerLatency — قياس وقت كل طبقة على حدة (FIO-003)
     * يُشغّل الطبقات يدوياً بنفس الأوزان ليعزل كمون كل طبقة
     * @param {number} runs — عدد جولات القياس لكل طبقة
     * @returns {object} كمون كل طبقة
     */
    measureLayerLatency(runs = 50) {
        if (!this._network) throw new Error('الشبكة العصبية غير مضبوطة — استخدم setNetwork()');

        const net    = this._network;
        const layers = [
            { key: 'coreLayer',    nameAr: 'طبقة المنطق الأصلي',   layer: net.coreLayer    },
            { key: 'extLayer',     nameAr: 'طبقة المنطق الموسّع',  layer: net.extLayer     },
            { key: 'synthLayer',   nameAr: 'طبقة التكامل',          layer: net.synthLayer   },
            { key: 'masterLayer',  nameAr: 'طبقة المنطق الأعلى',   layer: net.masterLayer  },
            { key: 'rankingLayer', nameAr: 'طبقة الترتيب',          layer: net.rankingLayer },
        ];

        const { Matrix } = this._requireMatrix();
        const results = {};

        for (const { key, nameAr, layer } of layers) {
            const inSize  = layer.inSize;
            const samples = [];
            const timer   = new FIOTimer();

            for (let i = 0; i < WARM_UP_RUNS; i++) {
                const X = Matrix.random(1, inSize, 0.5);
                layer.forward(X);
            }

            for (let i = 0; i < runs; i++) {
                const X = Matrix.random(1, inSize, 0.5);
                timer.start();
                layer.forward(X);
                samples.push(timer.elapsed());
            }

            results[key] = {
                nameAr,
                inSize,
                outSize: layer.outSize,
                stats: computeStats(samples)
            };
        }

        return {
            fioRef:   'FIO-003',
            quranRef: QURAN_SUNNAH_INDEX[2],
            metric:   'layer_latency',
            nameAr:   'كمون الطبقات',
            runs,
            layers:   results,
        };
    }

    // ─── ③ قياس إنتاجية I/O ──────────────────────────────────────────────────

    /**
     * measureIOThroughput — قياس إنتاجية الإدخال/الإخراج (FIO-006)
     * يقيس عدد عمليات I/O (إدخال + استدلال + قراءة الإخراج) في الثانية
     * @param {number} durationMs — مدة القياس بالميلي ثانية
     * @returns {object} إنتاجية I/O
     */
    measureIOThroughput(durationMs = 2000) {
        if (!this._network) throw new Error('الشبكة العصبية غير مضبوطة — استخدم setNetwork()');

        const timer = new FIOTimer();
        let ops     = 0;
        let bytesIn = 0;
        let bytesOut = 0;

        // إحماء
        for (let i = 0; i < WARM_UP_RUNS; i++) {
            this._network.infer(this._randomInputVec(), 'warmup');
        }

        timer.start();
        while (timer.elapsed() < durationMs) {
            const input  = this._randomInputVec();
            const result = this._network.infer(input, 'fio-io');
            bytesIn     += input.length * 8;    // Float64 = 8 bytes
            bytesOut    += (result.allResults ? result.allResults.length * 8 : 8);
            ops++;
        }

        const actualMs  = timer.elapsed();
        const opsPerSec = +(ops / (actualMs / 1000)).toFixed(2);
        const mbPerSec  = +((bytesIn + bytesOut) / (actualMs / 1000) / (1024 * 1024)).toFixed(4);

        return {
            fioRef:    'FIO-006',
            quranRef:  QURAN_SUNNAH_INDEX[5],
            metric:    'io_throughput',
            nameAr:    'إنتاجية الإدخال/الإخراج',
            durationMs: +actualMs.toFixed(1),
            ops,
            opsPerSec,
            bytesIn,
            bytesOut,
            mbPerSec,
        };
    }

    // ─── ④ قياس دقة الشبكة ───────────────────────────────────────────────────

    /**
     * measureAccuracy — قياس دقة استدلال المنطقيات (FIO-004, FIO-005)
     * يُجرّب تنبؤات معروفة ويقيس نسبة الإصابة
     * @returns {object} نتائج الدقة
     */
    measureAccuracy() {
        if (!this._network) throw new Error('الشبكة العصبية غير مضبوطة — استخدم setNetwork()');

        // عينات اختبار: (context, expectedTopLogicId)
        const testSamples = [
            { context: 'تجارة وبيع وشراء وعقد',          expected: 'commercial'    },
            { context: 'علم وبحث ودراسة ونظرية',          expected: 'scientific'    },
            { context: 'تكنولوجيا رقمي ذكاء اصطناعي',     expected: 'technological' },
            { context: 'إدارة قيادة مدير تنظيم',          expected: 'administrative'},
            { context: 'تخطيط استراتيجية خطة رؤية',       expected: 'planning'      },
            { context: 'شبكة شراكة تواصل اتصال',          expected: 'network'       },
            { context: 'تحسين كايزن رفع الجودة',           expected: 'improvement'   },
            { context: 'قانون تشريع نظام حوكمة',           expected: 'legislative'   },
        ];

        const { encodeContext } = this._requireEncodeContext();
        let correct = 0;
        const details = [];

        for (const { context, expected } of testSamples) {
            const input  = encodeContext(context);
            const result = this._network.infer(input, `accuracy-test: ${context}`);
            const topId  = result.allResults && result.allResults[0] ? result.allResults[0].id : null;
            const hit    = topId === expected;
            if (hit) correct++;
            details.push({ context, expected, predicted: topId, correct: hit });
        }

        const accuracy = +(correct / testSamples.length * 100).toFixed(2);

        return {
            fioRef:    'FIO-004',
            quranRef:  QURAN_SUNNAH_INDEX[3],
            quranRef2: QURAN_SUNNAH_INDEX[4],
            metric:    'accuracy',
            nameAr:    'دقة الشبكة',
            total:     testSamples.length,
            correct,
            accuracy,
            grade:     accuracy >= 87.5 ? 'ممتاز' : accuracy >= 75 ? 'جيد' : accuracy >= 62.5 ? 'مقبول' : 'يحتاج تدريب',
            details,
        };
    }

    // ─── ⑤ قياس كثافة الشبكة ─────────────────────────────────────────────────

    /**
     * measureNetworkDensity — قياس كثافة إطلاق الخلايا العصبية (FIO-002)
     * @param {number} runs — عدد جولات الاستدلال
     * @returns {object} إحصائيات كثافة الإطلاق
     */
    measureNetworkDensity(runs = 50) {
        if (!this._network) throw new Error('الشبكة العصبية غير مضبوطة — استخدم setNetwork()');

        const firingCounts = {};
        this._network.neurons.forEach(n => { firingCounts[n.id] = 0; });

        for (let i = 0; i < runs; i++) {
            const result = this._network.infer(this._randomInputVec(), 'density-test');
            (result.allResults || []).forEach(r => {
                if (r.neuronFiring) firingCounts[r.id]++;
            });
        }

        const neurons      = this._network.neurons.map(n => n.id);
        const totalFirings = Object.values(firingCounts).reduce((a, b) => a + b, 0);
        const maxPossible  = neurons.length * runs;
        const density      = +(totalFirings / maxPossible * 100).toFixed(2);

        const sorted = neurons
            .map(id => ({ id, fires: firingCounts[id], rate: +(firingCounts[id] / runs * 100).toFixed(1) }))
            .sort((a, b) => b.fires - a.fires);

        return {
            fioRef:        'FIO-002',
            quranRef:      QURAN_SUNNAH_INDEX[1],
            metric:        'network_density',
            nameAr:        'كثافة الشبكة العصبية',
            runs,
            totalFirings,
            maxPossible,
            densityPct:    density,
            neuronsRanked: sorted,
        };
    }

    // ─── ⑥ التقرير الشامل ────────────────────────────────────────────────────

    /**
     * runFullBenchmark — تشغيل جلسة قياس كاملة (FIO-007 — التوحيد)
     * @param {object} options — خيارات القياس
     * @returns {object} التقرير الشامل
     */
    async runFullBenchmark(options = {}) {
        const {
            inferenceRuns  = DEFAULT_RUNS,
            layerRuns      = 50,
            ioDurationMs   = 2000,
            densityRuns    = 50,
        } = options;

        if (!this._network) throw new Error('الشبكة العصبية غير مضبوطة — استخدم setNetwork()');

        const sessionId = `FIO-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
        const startedAt = new Date().toISOString();

        const inferenceSpeed  = this.measureInferenceSpeed(inferenceRuns);
        const layerLatency    = this.measureLayerLatency(layerRuns);
        const ioThroughput    = this.measureIOThroughput(ioDurationMs);
        const accuracy        = this.measureAccuracy();
        const networkDensity  = this.measureNetworkDensity(densityRuns);

        // مؤشر الميزان — وزن مركّب لجميع المقاييس
        const balanceIndex = this._computeBalanceIndex({
            opsPerSec:  inferenceSpeed.opsPerSec,
            accuracy:   accuracy.accuracy,
            density:    networkDensity.densityPct,
            iops:       ioThroughput.opsPerSec,
        });

        const report = {
            schema:        FIO_SCHEMA,
            tawheed:       FIO_TAWHEED,
            version:       FIO_VERSION,
            sessionId,
            startedAt,
            completedAt:   new Date().toISOString(),
            fioMasterRef:  QURAN_SUNNAH_INDEX[6], // FIO-007 — الإخلاص (التوحيد)
            network: {
                totalNeurons:    (this._network.neurons || []).length + 1, // +1 المنطق الأعلى
                trainedSteps:    this._network.trainedSteps    || 0,
                totalInferences: this._network.totalInferences || 0,
                masterShield:    this._network.masterShield    || true,
            },
            measurements: {
                inferenceSpeed,
                layerLatency,
                ioThroughput,
                accuracy,
                networkDensity,
            },
            balanceIndex,
            grade:         this._grade(balanceIndex.composite),
            recommendation: this._recommend(balanceIndex),
            quranSunnahIndex: QURAN_SUNNAH_INDEX,
        };

        this.history.push({ sessionId, startedAt, balanceIndex });
        if (this.history.length > 20) this.history.shift();

        return report;
    }

    // ─── ⑦ مؤشر الميزان ──────────────────────────────────────────────────────

    _computeBalanceIndex({ opsPerSec, accuracy, density, iops }) {
        // تطبيع القيم — كل مقياس يُحوَّل إلى 0-100
        const speedScore    = Math.min(100, (opsPerSec / 10) * 100);          // 10 ops/s = 100%
        const accuracyScore = accuracy;                                         // مباشرة 0-100%
        const densityScore  = Math.min(100, density);                           // 0-100%
        const iopsScore     = Math.min(100, (iops / 10) * 100);               // 10 iops/s = 100%

        // أوزان المقاييس — الدقة تحمل أعلى وزن
        const weights = { speed: 0.25, accuracy: 0.40, density: 0.20, iops: 0.15 };

        const composite = +(
            speedScore    * weights.speed    +
            accuracyScore * weights.accuracy +
            densityScore  * weights.density  +
            iopsScore     * weights.iops
        ).toFixed(2);

        return {
            composite,
            components: {
                speedScore:    +speedScore.toFixed(2),
                accuracyScore: +accuracyScore.toFixed(2),
                densityScore:  +densityScore.toFixed(2),
                iopsScore:     +iopsScore.toFixed(2),
            },
            weights,
            quranRef: QURAN_SUNNAH_INDEX[0], // الميزان — الرحمن:٧
        };
    }

    _grade(composite) {
        if (composite >= 90) return { ar: 'ممتاز',  en: 'Excellent', stars: '⭐⭐⭐⭐⭐' };
        if (composite >= 75) return { ar: 'جيد جداً', en: 'Very Good', stars: '⭐⭐⭐⭐' };
        if (composite >= 60) return { ar: 'جيد',     en: 'Good',      stars: '⭐⭐⭐' };
        if (composite >= 45) return { ar: 'مقبول',   en: 'Fair',      stars: '⭐⭐' };
        return { ar: 'يحتاج تحسين', en: 'Needs Improvement', stars: '⭐' };
    }

    _recommend(balance) {
        const rec = [];
        const { speedScore, accuracyScore, densityScore, iopsScore } = balance.components;

        if (speedScore < 50)    rec.push('💡 زِد جولات التدريب لرفع سرعة الاستدلال');
        if (accuracyScore < 75) rec.push('💡 دّرب الشبكة على عينات أكثر لرفع الدقة');
        if (densityScore < 30)  rec.push('💡 فعّل المزيد من الخلايا بضبط أوزان الاتصال');
        if (iopsScore < 50)     rec.push('💡 حسّن I/O بالمعالجة الدُفعية (Batch Processing)');

        if (rec.length === 0) {
            rec.push('✅ الشبكة العصبية في حالة مثالية — الحمد لله');
        }

        return rec;
    }

    // ─── حالة جلسات القياس ───────────────────────────────────────────────────

    getHistory() {
        return {
            schema:      FIO_SCHEMA,
            tawheed:     FIO_TAWHEED,
            totalSessions: this.history.length,
            sessions:    this.history,
        };
    }

    // ─── دوال مساعدة ─────────────────────────────────────────────────────────

    _randomInputVec() {
        const { N_INPUT } = this._requireNN();
        return new Array(N_INPUT).fill(0).map(() => Math.random());
    }

    _requireNN() {
        try { return require('./sheikha-neural-core.js'); } catch (_) { /* fallback */ }
        try { return require('../models/LogicNeuralNetwork.js'); } catch (_) { /* fallback */ }
        return { N_INPUT: 20 };
    }

    _requireMatrix() {
        try {
            const nn = require('../models/LogicNeuralNetwork.js');
            return { Matrix: nn.Matrix || _localMatrix() };
        } catch (_) {
            return { Matrix: _localMatrix() };
        }
    }

    _requireEncodeContext() {
        try {
            return require('../models/LogicNeuralNetwork.js');
        } catch (_) {
            return {
                encodeContext: (text) => {
                    return new Array(20).fill(0.5);
                }
            };
        }
    }
}

/** مصفوفة محلية بسيطة للطوارئ */
function _localMatrix() {
    return {
        random(r, c, scale = 0.5) {
            const data = new Float32Array(r * c).map(() => (Math.random() * 2 - 1) * scale);
            return { rows: r, cols: c, data };
        }
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. SINGLETON — نسخة واحدة مشتركة لمحرك FIO
// ═══════════════════════════════════════════════════════════════════════════════

let _fioInstance = null;

function getFIOEngine() {
    if (!_fioInstance) {
        _fioInstance = new SheikhaNeuralFIOEngine();
        // ربط الشبكة العصبية تلقائياً
        try {
            const { getNetwork } = require('../models/LogicNeuralNetwork.js');
            _fioInstance.setNetwork(getNetwork());
        } catch (_) { /* ستُضبط يدوياً عبر setNetwork */ }
    }
    return _fioInstance;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
    SheikhaNeuralFIOEngine,
    getFIOEngine,
    QURAN_SUNNAH_INDEX,
    FIO_VERSION,
    FIO_SCHEMA,
    computeStats,
    FIOTimer,
};
