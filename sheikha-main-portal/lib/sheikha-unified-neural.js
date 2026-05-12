'use strict';

const SECTION_RANGES = {
    fiber: [1, 1],
    access: [2, 9],
    transport: [10, 19],
    control: [20, 23]
};

const BASE_CELLS = [
    ['CELL_SHEIKHA_FIBER', 'الألياف الموحدة', 'الأنبياء:30', 'البيهقي', 'fiber'],
    ['CELL_SHEIKHA_5G', 'الوصول الذكي 5G', 'النحل:8', 'أبو نعيم', 'access'],
    ['CELL_SHEIKHA_EMERGENCY', 'الاستجابة للطوارئ', 'المائدة:2', 'البخاري ومسلم', 'access'],
    ['CELL_SHEIKHA_GOVNET', 'الحوكمة الشبكية', 'النساء:59', 'البخاري', 'access'],
    ['CELL_SHEIKHA_IOT', 'إنترنت الأشياء', 'الرعد:8', 'الترمذي', 'access'],
    ['CELL_SHEIKHA_SATELLITE', 'الربط الفضائي', 'الأنعام:97', 'البخاري', 'access'],
    ['CELL_SHEIKHA_AIR', 'المسار الجوي', 'الملك:19', 'الترمذي', 'access'],
    ['CELL_SHEIKHA_SEA', 'المسار البحري', 'يونس:22', 'الترمذي', 'access'],
    ['CELL_SHEIKHA_LAND', 'المسار البري', 'سبأ:18', 'الترمذي', 'access'],
    ['CELL_SHEIKHA_PAN', 'الطبقة الشخصية', 'البقرة:29', 'أثر', 'transport'],
    ['CELL_SHEIKHA_LAN', 'الطبقة المحلية', 'آل عمران:103', 'أثر', 'transport'],
    ['CELL_SHEIKHA_CAN', 'طبقة الحرم الشبكي', 'النساء:36', 'أثر', 'transport'],
    ['CELL_SHEIKHA_MAN', 'الطبقة المدينية', 'المائدة:48', 'أثر', 'transport'],
    ['CELL_SHEIKHA_WAN', 'الطبقة الواسعة', 'الأنعام:153', 'أثر', 'transport'],
    ['CELL_SHEIKHA_SAN', 'الطبقة التخزينية', 'الأعراف:31', 'أثر', 'transport'],
    ['CELL_SHEIKHA_VPN', 'النفق الآمن', 'التوبة:105', 'أثر', 'transport'],
    ['CELL_SHEIKHA_QOS', 'جودة الخدمة', 'الإسراء:35', 'أثر', 'transport'],
    ['CELL_SHEIKHA_TLS', 'التأمين النقلي', 'النور:35', 'أثر', 'transport'],
    ['CELL_SHEIKHA_SHTTP', 'بروتوكول شيخة الآمن', 'يوسف:55', 'أثر', 'transport'],
    ['CELL_SHEIKHA_DNS', 'دليل الأسماء', 'البقرة:31', 'أثر', 'control'],
    ['CELL_SHEIKHA_DBUS', 'ناقل الرسائل', 'المائدة:8', 'أثر', 'control'],
    ['CELL_SHEIKHA_NEURAL', 'القلب العصبي', 'النساء:83', 'أثر', 'control'],
    ['CELL_SHEIKHA_WATERLINE', 'خطوط الحماية', 'التحريم:6', 'أثر', 'control']
];

class SheikhaUnifiedNeural {
    constructor() {
        this.startedAt = new Date().toISOString();
        this.cells = BASE_CELLS.map(([key, label, ayah, hadithRef, section], index) => ({
            id: index + 1,
            key,
            label,
            ayah,
            hadithRef,
            section,
            active: false,
            state: 'idle'
        }));
        this.synapses = this.buildSynapses();
    }

    buildSynapses() {
        const synapses = [];

        for (let from = 1; from <= 23; from += 1) {
            for (let step = 1; step <= 6; step += 1) {
                const to = from + step;
                if (to <= 23) {
                    synapses.push({
                        from,
                        to,
                        weight: Number((1 - ((step - 1) * 0.08)).toFixed(2)),
                        type: step === 1 ? 'adjacent' : 'relay'
                    });
                }
            }
        }

        const overlaySynapses = [
            [1, 10, 0.88, 'overlay'],
            [1, 20, 0.84, 'overlay'],
            [2, 11, 0.86, 'overlay'],
            [2, 20, 0.83, 'overlay'],
            [3, 12, 0.85, 'overlay'],
            [4, 13, 0.84, 'overlay'],
            [5, 14, 0.84, 'overlay'],
            [6, 15, 0.83, 'overlay'],
            [7, 16, 0.82, 'overlay'],
            [8, 17, 0.82, 'overlay'],
            [9, 18, 0.81, 'overlay'],
            [10, 22, 0.9, 'control'],
            [20, 22, 0.91, 'control'],
            [22, 23, 0.95, 'security']
        ];

        overlaySynapses.forEach(([from, to, weight, type]) => {
            synapses.push({ from, to, weight, type });
        });

        return synapses;
    }

    getTopology() {
        return {
            startedAt: this.startedAt,
            cells: this.cells,
            synapses: this.synapses,
            totals: {
                cells: this.cells.length,
                synapses: this.synapses.length
            }
        };
    }

    activate() {
        const activatedAt = new Date().toISOString();
        this.cells = this.cells.map((cell) => ({
            ...cell,
            active: true,
            state: 'active',
            activatedAt
        }));

        return {
            activated: true,
            activatedAt,
            totals: {
                cells: this.cells.length,
                synapses: this.synapses.length
            }
        };
    }

    getDivineRefs() {
        return this.cells.map((cell) => ({
            id: cell.id,
            key: cell.key,
            ayah: cell.ayah,
            hadithRef: cell.hadithRef
        }));
    }

    getCell(id) {
        const numericId = Number(id);
        return this.cells.find((cell) => cell.id === numericId) || null;
    }

    getSection(name) {
        const normalizedName = String(name || '').trim().toLowerCase();
        const range = SECTION_RANGES[normalizedName];

        if (!range) {
            return null;
        }

        const [start, end] = range;
        return {
            name: normalizedName,
            cells: this.cells.filter((cell) => cell.id >= start && cell.id <= end),
            synapses: this.synapses.filter((synapse) => synapse.from >= start && synapse.from <= end)
        };
    }

    signal(cellId) {
        const source = this.getCell(cellId);
        if (!source) {
            return null;
        }

        return {
            source,
            outgoing: this.synapses.filter((synapse) => synapse.from === source.id),
            propagatedAt: new Date().toISOString()
        };
    }
}

const sheikhaUnifiedNeural = new SheikhaUnifiedNeural();

module.exports = sheikhaUnifiedNeural;
module.exports.SheikhaUnifiedNeural = SheikhaUnifiedNeural;
module.exports.sheikhaUnifiedNeural = sheikhaUnifiedNeural;