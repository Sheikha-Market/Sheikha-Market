/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ☪️ بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * SHEIKHA PLANT KNOWLEDGE ENGINE — علم النباتات الكامل
 *
 * المالك: سلمان أحمد بن سلمان الراجح
 *
 * "وَأَنزَلَ مِنَ السَّمَاءِ مَاءً فَأَخْرَجْنَا بِهِ أَزْوَاجًا مِّن نَّبَاتٍ شَتَّىٰ" — طه ٥٣
 * "وَفِي الْأَرْضِ قِطَعٌ مُّتَجَاوِرَاتٌ وَجَنَّاتٌ مِّنْ أَعْنَابٍ وَزَرْعٌ وَنَخِيلٌ" — الرعد ٤
 * "أَفَرَأَيْتُم مَّا تَحْرُثُونَ أَأَنتُمْ تَزْرَعُونَهُ أَمْ نَحْنُ الزَّارِعُونَ" — الواقعة ٦٣-٦٤
 *
 * ✅ أوقات نمو الغرسة حسب كل نوع (غرسة، ثمرة، نبتة، جذر)
 * ✅ وقت الإثمار والثمار
 * ✅ العناية والمحافظة
 * ✅ كيف تصبح الأفضل طعماً وقيمة وخواصها
 * ✅ أماكن النمو
 * ✅ رقمنة بالكتاب والسنة
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const path = require('path');
const fs = require('fs');

class SheikhaPlantKnowledgeEngine {
    constructor() {
        this.name = 'محرك علم النباتات الكامل';
        this.version = '1.0.0';
        this.startedAt = new Date().toISOString();
        this.dataPath = path.join(__dirname, '..', 'data', 'plant-knowledge.json');
        this.data = this._loadData();
    }

    _loadData() {
        try {
            const raw = fs.readFileSync(this.dataPath, 'utf8');
            return JSON.parse(raw);
        } catch (e) {
            console.warn('[PlantKnowledgeEngine] تعذر تحميل plant-knowledge.json:', e.message);
            return { metadata: {}, plants: [], plantTypes: {} };
        }
    }

    _reload() {
        this.data = this._loadData();
    }

    /**
     * جلب جميع النباتات
     */
    getAllPlants() {
        return this.data.plants || [];
    }

    /**
     * جلب نبات بالمعرف أو الاسم
     */
    getPlantByIdOrName(idOrName) {
        const plants = this.getAllPlants();
        const key = String(idOrName || '').toLowerCase().trim();
        return plants.find(
            (p) =>
                (p.id && p.id.toLowerCase() === key) ||
                (p.nameAr && p.nameAr.includes(idOrName)) ||
                (p.nameEn && p.nameEn.toLowerCase().includes(key))
        ) || null;
    }

    /**
     * جلب النباتات حسب النوع (غرسة، ثمرة، نبتة، جذر)
     */
    getPlantsByType(typeId) {
        const plants = this.getAllPlants();
        const key = String(typeId || '').toLowerCase();
        const validTypes = ['gharsa', 'thamra', 'nabta', 'jathr'];
        if (!validTypes.includes(key)) return plants;
        return plants.filter((p) => Array.isArray(p.type) && p.type.includes(key));
    }

    /**
     * جلب النباتات حسب وقت النمو (سريع، متوسط، بطيء)
     */
    getPlantsByGrowthSpeed(speed) {
        const plants = this.getAllPlants();
        const key = String(speed || '').toLowerCase();
        const getMaxDays = (p) => {
            const g = p.growth || {};
            const first = g.plantToFirstFruit || g.fullProduction || g.rootMaturity || g.tuberFormation || g.fruitRipening || {};
            const days = first.maxDays || first.minDays || 9999;
            return Number(days) || 9999;
        };
        if (key === 'fast' || key === 'سريع') {
            return plants.filter((p) => getMaxDays(p) <= 120);
        }
        if (key === 'medium' || key === 'متوسط') {
            return plants.filter((p) => {
                const d = getMaxDays(p);
                return d > 120 && d <= 365;
            });
        }
        if (key === 'slow' || key === 'بطيء') {
            return plants.filter((p) => getMaxDays(p) > 365);
        }
        return plants;
    }

    /**
     * جلب النباتات حسب المنطقة
     */
    getPlantsByRegion(region) {
        const plants = this.getAllPlants();
        const key = String(region || '').toLowerCase();
        if (!key) return plants;
        return plants.filter((p) => {
            const loc = p.growthLocations || {};
            const regions = loc.regions || [];
            const saudi = loc.saudiRegions || [];
            const all = [...regions, ...saudi].map((r) => String(r).toLowerCase());
            return all.some((r) => r.includes(key) || key.includes(r));
        });
    }

    /**
     * جلب ملخص أوقات النمو لنبات
     */
    getGrowthSummary(plant) {
        if (!plant || !plant.growth) return null;
        const g = plant.growth;
        const parts = [];
        if (g.seedlingToPlant && (g.seedlingToPlant.minDays || g.seedlingToPlant.maxDays)) {
            parts.push(`الغرس: ${g.seedlingToPlant.minDays || '?'}-${g.seedlingToPlant.maxDays || '?'} ${g.seedlingToPlant.unit || 'يوم'}`);
        }
        if (g.plantToFirstFruit && (g.plantToFirstFruit.minDays || g.plantToFirstFruit.maxDays)) {
            parts.push(`حتى أول ثمر: ${g.plantToFirstFruit.minDays || '?'}-${g.plantToFirstFruit.maxDays || '?'} ${g.plantToFirstFruit.unit || 'يوم'}`);
        }
        if (g.fullProduction && (g.fullProduction.minDays || g.fullProduction.maxDays)) {
            parts.push(`إنتاج كامل: ${g.fullProduction.minDays || '?'}-${g.fullProduction.maxDays || '?'} ${g.fullProduction.unit || 'يوم'}`);
        }
        if (g.fruitRipening && (g.fruitRipening.minDays || g.fruitRipening.maxDays)) {
            parts.push(`نضج الثمر: ${g.fruitRipening.minDays || '?'}-${g.fruitRipening.maxDays || '?'} ${g.fruitRipening.unit || 'يوم'}`);
        }
        if (g.rootMaturity && (g.rootMaturity.minDays || g.rootMaturity.maxDays)) {
            parts.push(`نضج الجذر: ${g.rootMaturity.minDays || '?'}-${g.rootMaturity.maxDays || '?'} ${g.rootMaturity.unit || 'يوم'}`);
        }
        if (g.tuberFormation && (g.tuberFormation.minDays || g.tuberFormation.maxDays)) {
            parts.push(`تكوين الدرنة: ${g.tuberFormation.minDays || '?'}-${g.tuberFormation.maxDays || '?'} ${g.tuberFormation.unit || 'يوم'}`);
        }
        return parts.join(' | ');
    }

    /**
     * لوحة تحكم علم النباتات
     */
    getDashboard() {
        const plants = this.getAllPlants();
        const byType = {
            gharsa: this.getPlantsByType('gharsa').length,
            thamra: this.getPlantsByType('thamra').length,
            nabta: this.getPlantsByType('nabta').length,
            jathr: this.getPlantsByType('jathr').length,
        };
        const quranPlants = plants.filter((p) => p.quranRef).length;
        return {
            name: this.name,
            version: this.version,
            startedAt: this.startedAt,
            summary: {
                totalPlants: plants.length,
                byType,
                quranPlants,
                plantTypes: Object.keys(this.data.plantTypes || {}).length,
            },
            quranRef: this.data.metadata?.quranRef || 'وَأَنزَلَ مِنَ السَّمَاءِ مَاءً فَأَخْرَجْنَا بِهِ أَزْوَاجًا مِّن نَّبَاتٍ شَتَّىٰ',
            plantTypes: this.data.plantTypes || {},
            plants: plants.map((p) => ({
                id: p.id,
                nameAr: p.nameAr,
                nameEn: p.nameEn,
                type: p.type,
                quranRef: p.quranRef || null,
                growthSummary: this.getGrowthSummary(p),
                regions: (p.growthLocations || {}).saudiRegions || [],
            })),
        };
    }

    /**
     * تفاصيل نبات كاملة
     */
    getPlantDetails(idOrName) {
        const plant = this.getPlantByIdOrName(idOrName);
        if (!plant) return null;
        return {
            ...plant,
            growthSummary: this.getGrowthSummary(plant),
        };
    }

    /**
     * بحث في النباتات
     */
    search(query) {
        const q = String(query || '').toLowerCase().trim();
        if (!q) return this.getAllPlants();
        const plants = this.getAllPlants();
        return plants.filter(
            (p) =>
                (p.nameAr && p.nameAr.includes(query)) ||
                (p.nameEn && p.nameEn.toLowerCase().includes(q)) ||
                (p.id && p.id.toLowerCase().includes(q)) ||
                ((p.growthLocations || {}).regions || []).some((r) => String(r).toLowerCase().includes(q)) ||
                ((p.growthLocations || {}).saudiRegions || []).some((r) => String(r).toLowerCase().includes(q)) ||
                ((p.care || {}).watering || '').toLowerCase().includes(q) ||
                ((p.bestPractices || {}).taste || '').toLowerCase().includes(q)
        );
    }

    /**
     * مسار فوري للحصول على نتائج مثمرة بجودة عالية
     */
    getQuickFruitPlan(options = {}) {
        const startMode = String(options.startMode || 'ready_seedling').toLowerCase();
        const region = String(options.region || '').trim();
        const maxDays = Number(options.maxDays || 120);
        const fast = this.getPlantsByGrowthSpeed('fast');
        const medium = this.getPlantsByGrowthSpeed('medium');
        const allCandidates = [...fast, ...medium];
        const candidates = region
            ? allCandidates.filter((p) => this.getPlantsByRegion(region).some((r) => r.id === p.id))
            : allCandidates;

        const prioritized = candidates
            .map((p) => {
                const growth = p.growth || {};
                const firstFruit = growth.plantToFirstFruit || growth.fruitRipening || growth.rootMaturity || growth.tuberFormation || {};
                const minDays = Number(firstFruit.minDays || 9999);
                return {
                    id: p.id,
                    nameAr: p.nameAr,
                    type: p.type || [],
                    expectedFirstResultDays: minDays,
                    growthSummary: this.getGrowthSummary(p),
                    care: p.care || {},
                    bestPractices: p.bestPractices || {}
                };
            })
            .filter((p) => p.expectedFirstResultDays <= maxDays)
            .sort((a, b) => a.expectedFirstResultDays - b.expectedFirstResultDays)
            .slice(0, 10);

        return {
            objective: 'نتائج مثمرة أسرع مع جودة أعلى',
            strategy: {
                startMode,
                note: startMode === 'ready_seedling'
                    ? 'الأسرع: ابدأ بشتلة جاهزة قوية بدل البذرة لتقليل زمن البداية.'
                    : (startMode === 'seedling' ? 'توازن ممتاز بين السرعة والتكلفة عبر الغرسة.' : 'البذرة أقل تكلفة لكن أبطأ زمنًا.')
            },
            timeline: [
                { phase: 'اليوم 1-3', action: 'تحضير التربة الجيدة التصريف + تسميد عضوي خفيف + ري تأسيسي' },
                { phase: 'اليوم 4-14', action: 'ري منتظم بدون إغراق + متابعة يومية للأوراق والجذور' },
                { phase: 'الأسبوع 3-4', action: 'تغذية نمو (N) بجرعات متزنة + تقوية الجذور' },
                { phase: 'الأسبوع 5-8', action: 'تغذية إزهار/إثمار (P/K) + ضبط الري لتحسين الطعم والقيمة' }
            ],
            careProtocol: {
                soil: 'تربة خفيفة جيدة التهوية والتصريف مع كمبوست.',
                irrigation: 'الري عند جفاف أول 2-4 سم من سطح التربة.',
                nutrition: 'تغذية خفيفة منتظمة وتجنب الجرعات العالية المفاجئة.',
                quality: 'حصاد وقت النضج الكامل + انتظام الري + اختيار صنف مناسب للمنطقة.'
            },
            candidates: prioritized,
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = SheikhaPlantKnowledgeEngine;
