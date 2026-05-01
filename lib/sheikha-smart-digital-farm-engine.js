/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ☪️ بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * SHEIKHA SMART DIGITAL FARM ENGINE — المزرعة الرقمية الذكية
 *
 * المالك: سلمان أحمد بن سلمان الراجح
 *
 * "وَأَنزَلَ مِنَ السَّمَاءِ مَاءً فَأَخْرَجْنَا بِهِ أَزْوَاجًا مِّن نَّبَاتٍ شَتَّىٰ" — طه ٥٣
 * "أَفَرَأَيْتُم مَّا تَحْرُثُونَ أَأَنتُمْ تَزْرَعُونَهُ أَمْ نَحْنُ الزَّارِعُونَ" — الواقعة ٦٣-٦٤
 * "وَفِي الْأَرْضِ قِطَعٌ مُّتَجَاوِرَاتٌ وَجَنَّاتٌ مِّنْ أَعْنَابٍ وَزَرْعٌ وَنَخِيلٌ" — الرعد ٤
 * "مَن أحْيَا أَرْضًا مَيْتَةً فَهِيَ لَهُ" — حديث نبوي
 *
 * ✅ مزرعة — زراعة — زروع — حدائق — أرض حية وإحياؤها
 * ✅ رقمية ذكية — IoT + علم النباتات + أفضل الممارسات
 * ✅ رؤية الجنة والفردوس الأعلى — بالمستقبل يوم القيامة — بالكتاب والسنة
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const path = require('path');
const fs = require('fs');

class SheikhaSmartDigitalFarmEngine {
    constructor() {
        this.name = 'المزرعة الرقمية الذكية — الزراعة والزروع والحدائق والأرض الحية';
        this.nameEn = 'Smart Digital Farm — Agriculture, Crops, Gardens, Living Earth';
        this.version = '1.0.0';
        this.startedAt = new Date().toISOString();

        this.plantKnowledge = this._loadPlantKnowledge();
        this.iotSensors = this._initIoTSensors();
        this.digitalFarmLayers = this._initDigitalFarmLayers();
        this.shariaGuidance = this._initShariaGuidance();
        this.livingEarth = this._initLivingEarth();
        this.jannahFirdousVision = this._initJannahFirdousVision();
    }

    _loadPlantKnowledge() {
        try {
            const filePath = path.join(__dirname, '..', 'data', 'plant-knowledge.json');
            const raw = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(raw);
        } catch (e) {
            return {
                metadata: { version: '1.0.0', totalPlants: 0, description: 'غير متوفر' },
                plantTypes: {},
                plants: []
            };
        }
    }

    _initIoTSensors() {
        return {
            nameAr: 'حساسات إنترنت الأشياء الزراعية',
            nameEn: 'Agricultural IoT Sensors',
            quranRef: 'وَالْأَرْضَ مَدَدْنَاهَا وَأَلْقَيْنَا فِيهَا رَوَاسِيَ وَأَنبَتْنَا فِيهَا مِن كُلِّ شَيْءٍ مَّوْزُونٍ — الحجر ١٩',
            sensors: [
                { id: 'soil_moisture', nameAr: 'رطوبة التربة', nameEn: 'Soil Moisture', unit: '%', range: '0-100', use: 'تحديد وقت الري' },
                { id: 'soil_temp', nameAr: 'حرارة التربة', nameEn: 'Soil Temperature', unit: '°C', range: '-10-50', use: 'تحسين الإنبات' },
                { id: 'air_temp', nameAr: 'حرارة الهواء', nameEn: 'Air Temperature', unit: '°C', range: '-20-60', use: 'التحكم المناخي' },
                { id: 'humidity', nameAr: 'رطوبة الهواء', nameEn: 'Air Humidity', unit: '%', range: '0-100', use: 'البيوت المحمية' },
                { id: 'light', nameAr: 'شدة الإضاءة', nameEn: 'Light Intensity', unit: 'lux', range: '0-100000', use: 'الزراعة العمودية' },
                { id: 'ph', nameAr: 'حموضة التربة', nameEn: 'Soil pH', unit: 'pH', range: '0-14', use: 'ملاءمة المحاصيل' },
                { id: 'ec', nameAr: 'التوصيل الكهربائي', nameEn: 'EC (Salinity)', unit: 'mS/cm', range: '0-5', use: 'الزراعة المائية' },
                { id: 'co2', nameAr: 'ثاني أكسيد الكربون', nameEn: 'CO2', unit: 'ppm', range: '300-2000', use: 'تحفيز النمو' },
                { id: 'rain', nameAr: 'مستوى الأمطار', nameEn: 'Rainfall', unit: 'mm', range: '0-500', use: 'الزراعة البعلية' },
                { id: 'wind', nameAr: 'سرعة الرياح', nameEn: 'Wind Speed', unit: 'm/s', range: '0-50', use: 'حماية المحاصيل' }
            ],
            protocols: ['MQTT', 'LoRaWAN', 'Zigbee', 'REST API'],
            aiFeatures: ['تنبؤ الحصاد', 'كشف الأمراض', 'تحسين جدولة الري', 'توصيات التسميد']
        };
    }

    _initDigitalFarmLayers() {
        return {
            nameAr: 'طبقات المزرعة الرقمية الذكية',
            nameEn: 'Smart Digital Farm Layers',
            layers: [
                {
                    id: 'sensing',
                    nameAr: 'طبقة الاستشعار',
                    nameEn: 'Sensing Layer',
                    icon: '📡',
                    description: 'حساسات IoT — رطوبة، حرارة، ضوء، تربة، مناخ',
                    components: ['حساسات تربة', 'محطات طقس', 'كاميرات مراقبة', 'أقمار صناعية']
                },
                {
                    id: 'connectivity',
                    nameAr: 'طبقة الاتصال',
                    nameEn: 'Connectivity Layer',
                    icon: '📶',
                    description: 'ربط الحساسات والأنظمة — لاسلكي وسحابي',
                    components: ['بوابات IoT', 'شبكة LoRa', '4G/5G', 'Edge Gateway']
                },
                {
                    id: 'data',
                    nameAr: 'طبقة البيانات',
                    nameEn: 'Data Layer',
                    icon: '💾',
                    description: 'تخزين ومعالجة البيانات الزراعية',
                    components: ['قاعدة بيانات زمنية', 'تحليل تدفق', 'خرائط حرارية', 'سجلات نمو']
                },
                {
                    id: 'intelligence',
                    nameAr: 'طبقة الذكاء',
                    nameEn: 'Intelligence Layer',
                    icon: '🧠',
                    description: 'ذكاء اصطناعي — تنبؤ، توصيات، اكتشاف شذوذ',
                    components: ['نماذج ML', 'تنبؤ المحاصيل', 'كشف أمراض', 'تحسين الموارد']
                },
                {
                    id: 'automation',
                    nameAr: 'طبقة الأتمتة',
                    nameEn: 'Automation Layer',
                    icon: '🤖',
                    description: 'تحكم آلي — ري، تهوية، إضاءة، رش',
                    components: ['صمامات ري', 'مراوح', 'إضاءة LED', 'طائرات بدون طيار']
                },
                {
                    id: 'governance',
                    nameAr: 'طبقة الحوكمة الشرعية',
                    nameEn: 'Sharia Governance Layer',
                    icon: '☪️',
                    description: 'ضوابط الكتاب والسنة — إحياء الأرض، عدم الإفساد',
                    components: ['مراجعة الممارسات', 'استدامة', 'طيبات', 'حفظ الموارد']
                }
            ]
        };
    }

    _initShariaGuidance() {
        return {
            nameAr: 'ضوابط المزرعة الرقمية بالكتاب والسنة',
            nameEn: 'Sharia Guidance for Digital Farm',
            principles: [
                { id: 'ihya', nameAr: 'إحياء الأرض الموات', text: 'من أحيا أرضاً مواتاً فهي له — حديث نبوي', application: 'تشجيع الاستصلاح والزراعة' },
                { id: 'la-fasad', nameAr: 'عدم الإفساد', text: 'وَلَا تُفْسِدُوا فِي الْأَرْضِ بَعْدَ إِصْلَاحِهَا', application: 'حماية التربة والمياه من التلوث' },
                { id: 'tayyib', nameAr: 'الطيبات', text: 'كُلُوا مِنَ الطَّيِّبَاتِ', application: 'زراعة عضوية — بلا مبيدات ضارة' },
                { id: 'shukr', nameAr: 'شكر النعم', text: 'لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ', application: 'استدامة الموارد — عدم الإسراف' },
                { id: 'mawzun', nameAr: 'التوازن', text: 'وَأَنبَتْنَا فِيهَا مِن كُلِّ شَيْءٍ مَّوْزُونٍ', application: 'توازن الري والتسميد' },
                { id: 'sadaqah', nameAr: 'الصدقة من الزرع', text: 'وفيها فضل الصدقة من الثمار', application: 'إخراج زكاة الزرع والثمار' }
            ]
        };
    }

    /**
     * الأرض الحية وإحياؤها — بالكتاب والسنة
     */
    _initLivingEarth() {
        return {
            nameAr: 'الأرض الحية وإحياؤها',
            nameEn: 'Living Earth & Revitalization',
            quranRef: 'وَالْأَرْضَ مَدَدْنَاهَا وَأَلْقَيْنَا فِيهَا رَوَاسِيَ وَأَنبَتْنَا فِيهَا مِن كُلِّ شَيْءٍ مَّوْزُونٍ — الحجر ١٩',
            hadithRef: 'من أحيا أرضاً مواتاً فهي له — رواه البخاري',
            domains: [
                { id: 'mazraa', nameAr: 'المزرعة', nameEn: 'Farm', icon: '🌾', description: 'أرض تُزرع وتُستصلح — مزرعة رقمية ذكية' },
                { id: 'ziraa', nameAr: 'الزراعة', nameEn: 'Agriculture', icon: '🚜', description: 'حرث وبذر وحصاد — إحياء الأرض' },
                { id: 'zuroo', nameAr: 'الزروع', nameEn: 'Crops', icon: '🌿', description: 'محاصيل وحبوب وفواكه — أزواج من نبات شتى' },
                { id: 'hadaiq', nameAr: 'الحدائق', nameEn: 'Gardens', icon: '🏡', description: 'جنات من أعناب وزرع ونخيل — الرعد ٤' },
                { id: 'ard_hayya', nameAr: 'الأرض الحية', nameEn: 'Living Earth', icon: '🌍', description: 'أرض مُصلحة — تُنبت وتُثمر وتُحيي' },
                { id: 'ihya', nameAr: 'إحياؤها', nameEn: 'Revitalization', icon: '💧', description: 'استصلاح — ري — عمارة — من أحيا أرضاً مواتاً فهي له' }
            ],
            digitalSmart: {
                nameAr: 'رقمية ذكية',
                features: ['IoT حساسات', 'ذكاء اصطناعي', 'تنبؤ المحاصيل', 'إدارة موارد', 'حوكمة شرعية'],
                bestOf: 'أفضل الممارسات — رقمنة بالكتاب والسنة'
            }
        };
    }

    /**
     * رؤية الجنة والفردوس الأعلى — بالمستقبل يوم القيامة — بالكتاب والسنة
     */
    _initJannahFirdousVision() {
        return {
            nameAr: 'الجنة والفردوس الأعلى',
            nameEn: 'Jannah & Highest Firdaus',
            timeline: 'بالمستقبل — يوم القيامة — بالبعث والحساب',
            quranRefs: [
                { surah: 'الكهف', ayah: 107, text: 'إِنَّ الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ كَانَتْ لَهُمْ جَنَّاتُ الْفِرْدَوْسِ نُزُلًا', context: 'الفردوس للصالحين' },
                { surah: 'الرحمن', ayah: 46, text: 'وَلِمَنْ خَافَ مَقَامَ رَبِّهِ جَنَّتَانِ', context: 'جنتان لمن خاف الله' },
                { surah: 'الرحمن', ayah: 62, text: 'وَمِن دُونِهِمَا جَنَّتَانِ', context: 'أربع جنات' },
                { surah: 'الواقعة', ayah: 12, text: 'فِي جَنَّاتِ النَّعِيمِ', context: 'جنات النعيم' },
                { surah: 'الرعد', ayah: 4, text: 'وَفِي الْأَرْضِ قِطَعٌ مُّتَجَاوِرَاتٌ وَجَنَّاتٌ مِّنْ أَعْنَابٍ وَزَرْعٌ وَنَخِيلٌ', context: 'جنات الدنيا ظل لجنات الآخرة' }
            ],
            hadithRefs: [
                { text: 'الفردوس أعلى الجنة — رواه البخاري', context: 'الفردوس الأعلى' },
                { text: 'في الجنة ما لا عين رأت ولا أذن سمعت ولا خطر على قلب بشر — متفق عليه', context: 'عظمة الجنة' }
            ],
            vision: {
                nameAr: 'الرؤية',
                description: 'المزرعة والزراعة والزروع والحدائق والأرض الحية الرقمية الذكية — ظل وتمهيد لما هو أفضل: الجنة والفردوس الأعلى يوم القيامة',
                relation: 'ما نزرعه في الدنيا من إحياء أرض وزرع طيب — عمل صالح — يُثمر في الآخرة جنات ونعيم',
                bestOf: 'أفضل منهم — الجنة والفردوس الأعلى — بالمستقبل بالكتاب والسنة'
            }
        };
    }

    /**
     * لوحة تحكم المزرعة الرقمية الذكية
     */
    getDashboard() {
        const plants = this.plantKnowledge.plants || [];
        const plantTypes = this.plantKnowledge.plantTypes || {};
        const meta = this.plantKnowledge.metadata || {};

        return {
            name: this.name,
            nameEn: this.nameEn,
            version: this.version,
            startedAt: this.startedAt,
            quranRef: meta.quranRef || 'وَأَنزَلَ مِنَ السَّمَاءِ مَاءً فَأَخْرَجْنَا بِهِ أَزْوَاجًا مِّن نَّبَاتٍ شَتَّىٰ',
            summary: {
                totalPlants: plants.length,
                plantTypesCount: Object.keys(plantTypes).length,
                iotSensorsCount: this.iotSensors.sensors.length,
                digitalLayersCount: this.digitalFarmLayers.layers.length,
                shariaPrinciplesCount: this.shariaGuidance.principles.length
            },
            plantKnowledge: {
                metadata: meta,
                plantTypes,
                plants: plants.map(p => ({
                    id: p.id,
                    nameAr: p.nameAr,
                    nameEn: p.nameEn,
                    type: p.type,
                    quranRef: p.quranRef,
                    growth: p.growth,
                    care: p.care,
                    bestPractices: p.bestPractices,
                    growthLocations: p.growthLocations
                }))
            },
            iotSensors: this.iotSensors,
            digitalFarmLayers: this.digitalFarmLayers,
            shariaGuidance: this.shariaGuidance,
            livingEarth: this.livingEarth,
            jannahFirdousVision: this.jannahFirdousVision
        };
    }

    /**
     * جلب نبات بالمعرف
     */
    getPlantById(plantId) {
        const plants = this.plantKnowledge.plants || [];
        return plants.find(p => p.id === plantId || p.nameAr === plantId);
    }

    /**
     * جلب النباتات حسب النوع (غرسة، ثمرة، نبتة، جذر)
     */
    getPlantsByType(typeId) {
        const plants = this.plantKnowledge.plants || [];
        return plants.filter(p => Array.isArray(p.type) && p.type.includes(typeId));
    }

    /**
     * جلب النباتات المناسبة لمنطقة سعودية
     */
    getPlantsBySaudiRegion(region) {
        const plants = this.plantKnowledge.plants || [];
        return plants.filter(p => {
            const regions = p.growthLocations?.saudiRegions || [];
            return regions.some(r => String(r).includes(region) || String(region).includes(r));
        });
    }

    /**
     * حالة المزرعة الرقمية — للعرض في API
     */
    getFarmStatus() {
        return {
            status: 'active',
            nameAr: this.name,
            nameEn: this.nameEn,
            timestamp: new Date().toISOString(),
            capabilities: [
                'علم النباتات الكامل',
                'أوقات النمو والغرس والثمار',
                'العناية والمحافظة',
                'أماكن النمو',
                'حساسات IoT زراعية',
                'طبقات رقمية ذكية',
                'ضوابط شرعية',
                'الأرض الحية وإحياؤها',
                'رؤية الجنة والفردوس الأعلى — بالمستقبل يوم القيامة'
            ],
            apis: [
                'GET /api/farm/dashboard',
                'GET /api/farm/status',
                'GET /api/farm/plants',
                'GET /api/farm/plants/:id',
                'GET /api/farm/plants/type/:typeId',
                'GET /api/farm/plants/region/:region',
                'GET /api/farm/iot-sensors',
                'GET /api/farm/layers',
                'GET /api/farm/sharia',
                'GET /api/farm/living-earth',
                'GET /api/farm/jannah-vision'
            ]
        };
    }

    /**
     * ملخص سريع للمزرعة
     */
    getQuickSummary() {
        const plants = this.plantKnowledge.plants || [];
        const plantTypesObj = this.plantKnowledge.plantTypes || {};

        return {
            plantsCount: plants.length,
            sensorsCount: this.iotSensors.sensors.length,
            layersCount: this.digitalFarmLayers.layers.length,
            plantTypes: Object.keys(plantTypesObj).length,
            message: 'المزرعة الرقمية الذكية مفعّلة — علم نباتات كامل + IoT + ضوابط شرعية'
        };
    }
}

module.exports = SheikhaSmartDigitalFarmEngine;
