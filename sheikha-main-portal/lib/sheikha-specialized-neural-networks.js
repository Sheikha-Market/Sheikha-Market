/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * SHEIKHA SPECIALIZED NEURAL NETWORKS — شبكات شيخة العصبية المتخصصة
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * "وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا" — البقرة ٣١
 * "اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ" — النور ٣٥
 * "وَفَوْقَ كُلِّ ذِي عِلْمٍ عَلِيمٌ" — يوسف ٧٦
 *
 * هذا الملف يُعرِّف كل الشبكات العصبية المتخصصة لمنظومة شيخة:
 *
 *  1. شبكة عصبية شيخه حاسب         — الحوسبة العامة
 *  2. شبكه شيخة عصبية حاسوبية      — علوم الحاسوب
 *  3. شبكة شيخة خوادم عصبية         — الخوادم والبنية التحتية
 *  4. شبكة شيخة للخوادم السحابية    — السحابة والحوسبة السحابية
 *  5. شبكة شيخه العصبيه التقنيه     — التقنية والهندسة
 *  6. شبكة شيخة العصبية للتكنولوجيا  — التكنولوجيا المتقدمة
 *  7. شبكة شيخه العصبيه للعلوم      — العلوم والبحث
 *  8. شبكة شيخه العصبية للذكاء الصناعي — الذكاء الاصطناعي
 *  9. شبكة شيخة العصبية للتجارة والاقتصاد والمال والذهب والفضة
 * 10. شبكة شيخة العصبيه للسكراب     — مواد السكراب وإعادة التدوير
 * 11. شبكة شيخة العصبيه للتشليح     — تشليح السيارات والمعدات
 *
 * المالك: سلمان أحمد بن سلمان الراجح — منظومة شيخة
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

// ─── استيراد النواة العصبية إن وُجدت ────────────────────────────────────────
let SheikhaNeural = null;
try {
    const neuralCore = require('./sheikha-neural-core');
    SheikhaNeural = neuralCore.SheikhaNeural || neuralCore.NeuralNetwork || null;
} catch (_) { /* تعمل بدون النواة */ }

// ═══════════════════════════════════════════════════════════════════════════════
// 1. شبكة عصبية شيخه حاسب — SHEIKHA COMPUTING NEURAL NETWORK
// ═══════════════════════════════════════════════════════════════════════════════

class SheikhaComputingNeuralNetwork {
    constructor() {
        this.id       = 'sheikha_computing_neural';
        this.nameAr   = 'شبكة عصبية شيخه حاسب';
        this.nameEn   = 'Sheikha Computing Neural Network';
        this.version  = '1.0.0';
        this.maqsad   = 'ARD';
        this.quranRef = '﴿ وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا ﴾ — البقرة ٣١';
        this.domains  = [
            { id: 'cpu',         nameAr: 'المعالجات المركزية',           nameEn: 'CPU Architecture'             },
            { id: 'gpu',         nameAr: 'معالجات الرسومات والتوازي',     nameEn: 'GPU & Parallel Computing'    },
            { id: 'hpc',         nameAr: 'الحوسبة الفائقة',               nameEn: 'High-Performance Computing'  },
            { id: 'quantum',     nameAr: 'الحوسبة الكمية',                nameEn: 'Quantum Computing'           },
            { id: 'embedded',    nameAr: 'الأنظمة المضمنة',               nameEn: 'Embedded Systems'            },
            { id: 'distributed', nameAr: 'الحوسبة الموزعة',               nameEn: 'Distributed Computing'      },
            { id: 'edge',        nameAr: 'الحوسبة الطرفية',               nameEn: 'Edge Computing'              },
            { id: 'neuromorphic',nameAr: 'الحوسبة العصبية',               nameEn: 'Neuromorphic Computing'     },
        ];
        this.capabilities = {
            processTask:    true,
            analyzeLoad:    true,
            optimizeResources: true,
            selfHeal:       true,
        };
    }

    /** معالجة طلب حوسبة */
    async handle(req = {}) {
        const { data = {}, traceId } = req;
        const domain = data.domain || 'cpu';
        const matched = this.domains.find(d => d.id === domain) || this.domains[0];
        return {
            network: this.id,
            nameAr:  this.nameAr,
            domain:  matched,
            result: {
                status:   'processed',
                traceId,
                message:  `شبكة الحوسبة شيخه تعالج طلب: ${matched.nameAr}`,
                maqsad:   this.maqsad,
                quranRef: this.quranRef,
            },
        };
    }

    status() {
        return { id: this.id, nameAr: this.nameAr, version: this.version, domains: this.domains.length };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. شبكه شيخة عصبية حاسوبية — SHEIKHA COMPUTER-SCIENCE NEURAL NETWORK
// ═══════════════════════════════════════════════════════════════════════════════

class SheikhaComputerScienceNeuralNetwork {
    constructor() {
        this.id       = 'sheikha_cs_neural';
        this.nameAr   = 'شبكه شيخة عصبية حاسوبية';
        this.nameEn   = 'Sheikha Computer-Science Neural Network';
        this.version  = '1.0.0';
        this.maqsad   = 'AQL';
        this.quranRef = '﴿ وَقُل رَّبِّ زِدْنِي عِلْمًا ﴾ — طه ١١٤';
        this.domains  = [
            { id: 'algorithms',  nameAr: 'الخوارزميات وهياكل البيانات', nameEn: 'Algorithms & Data Structures' },
            { id: 'os',          nameAr: 'أنظمة التشغيل',               nameEn: 'Operating Systems'            },
            { id: 'compilers',   nameAr: 'المترجمات واللغات',           nameEn: 'Compilers & Languages'        },
            { id: 'databases',   nameAr: 'قواعد البيانات',               nameEn: 'Databases'                   },
            { id: 'networking',  nameAr: 'الشبكات الحاسوبية',            nameEn: 'Computer Networking'         },
            { id: 'security',    nameAr: 'أمن المعلومات',                nameEn: 'Information Security'        },
            { id: 'software_eng',nameAr: 'هندسة البرمجيات',             nameEn: 'Software Engineering'        },
            { id: 'theory',      nameAr: 'نظرية الحوسبة',               nameEn: 'Theory of Computation'       },
        ];
    }

    async handle(req = {}) {
        const { data = {}, traceId } = req;
        const domain  = data.domain || 'algorithms';
        const matched = this.domains.find(d => d.id === domain) || this.domains[0];
        return {
            network: this.id,
            nameAr:  this.nameAr,
            domain:  matched,
            result: {
                status:   'processed',
                traceId,
                message:  `شبكة علوم الحاسوب شيخة تعالج: ${matched.nameAr}`,
                maqsad:   this.maqsad,
                quranRef: this.quranRef,
            },
        };
    }

    status() {
        return { id: this.id, nameAr: this.nameAr, version: this.version, domains: this.domains.length };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. شبكة شيخة خوادم عصبية — SHEIKHA SERVER NEURAL NETWORK
// ═══════════════════════════════════════════════════════════════════════════════

class SheikhaServerNeuralNetwork {
    constructor() {
        this.id       = 'sheikha_server_neural';
        this.nameAr   = 'شبكة شيخة خوادم عصبية';
        this.nameEn   = 'Sheikha Server Neural Network';
        this.version  = '1.0.0';
        this.maqsad   = 'ARD';
        this.quranRef = '﴿ وَسَخَّرَ لَكُم مَّا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ﴾ — الجاثية ١٣';
        this.serverTypes = [
            { id: 'web',        nameAr: 'خوادم الويب',         nameEn: 'Web Servers',         examples: ['nginx', 'Apache', 'Caddy']          },
            { id: 'app',        nameAr: 'خوادم التطبيقات',     nameEn: 'Application Servers', examples: ['Node.js', 'Spring Boot', 'Django']   },
            { id: 'db',         nameAr: 'خوادم قواعد البيانات', nameEn: 'Database Servers',    examples: ['PostgreSQL', 'MongoDB', 'Redis']     },
            { id: 'file',       nameAr: 'خوادم الملفات',        nameEn: 'File Servers',        examples: ['NFS', 'Samba', 'MinIO']             },
            { id: 'mail',       nameAr: 'خوادم البريد',         nameEn: 'Mail Servers',        examples: ['Postfix', 'Dovecot', 'Exchange']     },
            { id: 'dns',        nameAr: 'خوادم DNS',            nameEn: 'DNS Servers',         examples: ['BIND', 'CoreDNS', 'Unbound']         },
            { id: 'proxy',      nameAr: 'خوادم البروكسي',       nameEn: 'Proxy Servers',       examples: ['HAProxy', 'Traefik', 'Envoy']        },
            { id: 'game',       nameAr: 'خوادم الألعاب',        nameEn: 'Game Servers',        examples: ['Dedicated', 'P2P Relay', 'Matchmaking'] },
            { id: 'streaming',  nameAr: 'خوادم البث',           nameEn: 'Streaming Servers',   examples: ['Wowza', 'Nginx-RTMP', 'SRS']         },
            { id: 'ai_inference', nameAr: 'خوادم استنتاج الذكاء', nameEn: 'AI Inference Servers', examples: ['TensorRT', 'Triton', 'Ollama']    },
        ];
        this.metrics = { uptime: 0, requests: 0, errors: 0, latency_ms: 0 };
    }

    async handle(req = {}) {
        const { data = {}, traceId } = req;
        const type    = data.serverType || 'web';
        const matched = this.serverTypes.find(s => s.id === type) || this.serverTypes[0];
        this.metrics.requests++;
        return {
            network: this.id,
            nameAr:  this.nameAr,
            serverType: matched,
            result: {
                status:   'online',
                traceId,
                message:  `شبكة خوادم شيخة — النوع: ${matched.nameAr}`,
                maqsad:   this.maqsad,
                quranRef: this.quranRef,
                metrics:  { ...this.metrics },
            },
        };
    }

    status() {
        return { id: this.id, nameAr: this.nameAr, version: this.version, serverTypes: this.serverTypes.length, metrics: this.metrics };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. شبكة شيخة للخوادم السحابية — SHEIKHA CLOUD SERVERS NEURAL NETWORK
// ═══════════════════════════════════════════════════════════════════════════════

class SheikhaCloudServerNeuralNetwork {
    constructor() {
        this.id       = 'sheikha_cloud_server_neural';
        this.nameAr   = 'شبكة شيخة للخوادم السحابية';
        this.nameEn   = 'Sheikha Cloud Servers Neural Network';
        this.version  = '1.0.0';
        this.maqsad   = 'ARD';
        this.quranRef = '﴿ أَلَمْ تَرَ أَنَّ اللَّهَ يُزْجِي سَحَابًا ﴾ — النور ٤٣';
        this.cloudLayers = [
            { id: 'iaas',      nameAr: 'البنية التحتية كخدمة',       nameEn: 'IaaS',       providers: ['AWS EC2', 'Azure VM', 'Google Compute'] },
            { id: 'paas',      nameAr: 'المنصة كخدمة',                nameEn: 'PaaS',       providers: ['Heroku', 'Railway', 'Google App Engine'] },
            { id: 'saas',      nameAr: 'البرمجيات كخدمة',            nameEn: 'SaaS',       providers: ['Sheikha SaaS', 'Salesforce', 'Office 365'] },
            { id: 'faas',      nameAr: 'الدوال كخدمة (Serverless)', nameEn: 'FaaS',       providers: ['AWS Lambda', 'Cloudflare Workers', 'Vercel'] },
            { id: 'baas',      nameAr: 'الواجهة الخلفية كخدمة',      nameEn: 'BaaS',       providers: ['Firebase', 'Supabase', 'Appwrite'] },
            { id: 'caas',      nameAr: 'الحاويات كخدمة',             nameEn: 'CaaS',       providers: ['Kubernetes', 'Docker Swarm', 'ECS'] },
            { id: 'daas',      nameAr: 'سطح المكتب كخدمة',           nameEn: 'DaaS',       providers: ['Amazon WorkSpaces', 'Azure VDI'] },
            { id: 'aiml_cloud', nameAr: 'الذكاء الاصطناعي السحابي', nameEn: 'AI/ML Cloud', providers: ['SageMaker', 'Vertex AI', 'Azure ML'] },
        ];
        this.regions = [
            { id: 'me-east-1',  nameAr: 'الشرق الأوسط',    city: 'الرياض / دبي'    },
            { id: 'eu-west-1',  nameAr: 'أوروبا الغربية',  city: 'أيرلندا / فرانكفورت' },
            { id: 'us-east-1',  nameAr: 'شرق أمريكا',      city: 'فيرجينيا'        },
            { id: 'ap-south-1', nameAr: 'جنوب آسيا',       city: 'مومباي'          },
        ];
    }

    async handle(req = {}) {
        const { data = {}, traceId } = req;
        const layer   = data.layer || 'iaas';
        const region  = data.region || 'me-east-1';
        const matched = this.cloudLayers.find(c => c.id === layer) || this.cloudLayers[0];
        const reg     = this.regions.find(r => r.id === region) || this.regions[0];
        return {
            network:   this.id,
            nameAr:    this.nameAr,
            cloudLayer: matched,
            region:    reg,
            result: {
                status:   'active',
                traceId,
                message:  `شبكة السحابة شيخة — طبقة: ${matched.nameAr} — منطقة: ${reg.nameAr}`,
                maqsad:   this.maqsad,
                quranRef: this.quranRef,
            },
        };
    }

    status() {
        return { id: this.id, nameAr: this.nameAr, version: this.version, cloudLayers: this.cloudLayers.length, regions: this.regions.length };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. شبكة شيخه العصبيه التقنيه — SHEIKHA TECHNICAL NEURAL NETWORK
// ═══════════════════════════════════════════════════════════════════════════════

class SheikhaTechnicalNeuralNetwork {
    constructor() {
        this.id       = 'sheikha_technical_neural';
        this.nameAr   = 'شبكة شيخه العصبيه التقنيه';
        this.nameEn   = 'Sheikha Technical Neural Network';
        this.version  = '1.0.0';
        this.maqsad   = 'ARD';
        this.quranRef = '﴿ وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ ﴾ — الحديد ٢٥';
        this.technicalDomains = [
            { id: 'civil',       nameAr: 'الهندسة المدنية والإنشائية', nameEn: 'Civil & Structural Engineering'   },
            { id: 'mechanical',  nameAr: 'الهندسة الميكانيكية',        nameEn: 'Mechanical Engineering'          },
            { id: 'electrical',  nameAr: 'الهندسة الكهربائية',         nameEn: 'Electrical Engineering'          },
            { id: 'chemical',    nameAr: 'الهندسة الكيميائية',         nameEn: 'Chemical Engineering'            },
            { id: 'industrial',  nameAr: 'الهندسة الصناعية',           nameEn: 'Industrial Engineering'          },
            { id: 'materials',   nameAr: 'هندسة المواد',               nameEn: 'Materials Engineering'          },
            { id: 'automotive',  nameAr: 'هندسة السيارات',             nameEn: 'Automotive Engineering'          },
            { id: 'aerospace',   nameAr: 'هندسة الفضاء والطيران',      nameEn: 'Aerospace Engineering'          },
            { id: 'petroleum',   nameAr: 'هندسة البترول والطاقة',      nameEn: 'Petroleum & Energy Engineering'  },
            { id: 'robotics',    nameAr: 'الروبوتات والأتمتة',         nameEn: 'Robotics & Automation'          },
        ];
        this.standards = ['ISO 9001', 'ISO 14001', 'ASME', 'IEEE', 'SASO', 'ASTM'];
    }

    async handle(req = {}) {
        const { data = {}, traceId } = req;
        const domain  = data.domain || 'electrical';
        const matched = this.technicalDomains.find(d => d.id === domain) || this.technicalDomains[0];
        return {
            network: this.id,
            nameAr:  this.nameAr,
            domain:  matched,
            result: {
                status:    'processed',
                traceId,
                message:   `الشبكة التقنية شيخة — مجال: ${matched.nameAr}`,
                standards: this.standards,
                maqsad:    this.maqsad,
                quranRef:  this.quranRef,
            },
        };
    }

    status() {
        return { id: this.id, nameAr: this.nameAr, version: this.version, domains: this.technicalDomains.length };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. شبكة شيخة العصبية للتكنولوجيا — SHEIKHA TECHNOLOGY NEURAL NETWORK
// ═══════════════════════════════════════════════════════════════════════════════

class SheikhaTechnologyNeuralNetwork {
    constructor() {
        this.id       = 'sheikha_technology_neural';
        this.nameAr   = 'شبكة شيخة العصبية للتكنولوجيا';
        this.nameEn   = 'Sheikha Technology Neural Network';
        this.version  = '1.0.0';
        this.maqsad   = 'ARD';
        this.quranRef = '﴿ وَسَخَّرَ لَكُمُ الْأَنْهَارَ وَسَخَّرَ لَكُمُ الشَّمْسَ وَالْقَمَرَ ﴾ — إبراهيم ٣٢-٣٣';
        this.techSectors = [
            { id: 'blockchain',  nameAr: 'البلوكشين وWeb3',             nameEn: 'Blockchain & Web3'               },
            { id: 'iot',         nameAr: 'إنترنت الأشياء',              nameEn: 'Internet of Things'              },
            { id: 'ar_vr',       nameAr: 'الواقع المعزز والافتراضي',    nameEn: 'AR / VR / XR'                   },
            { id: 'biotech',     nameAr: 'التكنولوجيا الحيوية',         nameEn: 'Biotechnology'                  },
            { id: 'nanotech',    nameAr: 'تكنولوجيا النانو',            nameEn: 'Nanotechnology'                 },
            { id: 'fintech',     nameAr: 'التكنولوجيا المالية',         nameEn: 'FinTech'                        },
            { id: 'cleantech',   nameAr: 'تكنولوجيا الطاقة النظيفة',   nameEn: 'CleanTech'                      },
            { id: 'agritech',    nameAr: 'تكنولوجيا الزراعة',           nameEn: 'AgriTech'                       },
            { id: 'healthtech',  nameAr: 'تكنولوجيا الصحة',            nameEn: 'HealthTech'                     },
            { id: 'edtech',      nameAr: 'تكنولوجيا التعليم',          nameEn: 'EdTech'                         },
            { id: 'spacetech',   nameAr: 'تكنولوجيا الفضاء',           nameEn: 'SpaceTech'                      },
            { id: 'cyber',       nameAr: 'الأمن السيبراني',             nameEn: 'Cybersecurity'                  },
        ];
    }

    async handle(req = {}) {
        const { data = {}, traceId } = req;
        const sector  = data.sector || 'iot';
        const matched = this.techSectors.find(s => s.id === sector) || this.techSectors[0];
        return {
            network: this.id,
            nameAr:  this.nameAr,
            sector:  matched,
            result: {
                status:   'processed',
                traceId,
                message:  `شبكة التكنولوجيا شيخة — قطاع: ${matched.nameAr}`,
                maqsad:   this.maqsad,
                quranRef: this.quranRef,
            },
        };
    }

    status() {
        return { id: this.id, nameAr: this.nameAr, version: this.version, sectors: this.techSectors.length };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. شبكة شيخه العصبيه للعلوم — SHEIKHA SCIENCE NEURAL NETWORK
// ═══════════════════════════════════════════════════════════════════════════════

class SheikhaScienceNeuralNetwork {
    constructor() {
        this.id       = 'sheikha_science_neural';
        this.nameAr   = 'شبكة شيخه العصبيه للعلوم';
        this.nameEn   = 'Sheikha Science Neural Network';
        this.version  = '1.0.0';
        this.maqsad   = 'AQL';
        this.quranRef = '﴿ اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ ﴾ — العلق ١';
        this.scienceBranches = [
            { id: 'physics',     nameAr: 'الفيزياء',                nameEn: 'Physics'                   },
            { id: 'chemistry',   nameAr: 'الكيمياء',                nameEn: 'Chemistry'                 },
            { id: 'biology',     nameAr: 'علم الأحياء',             nameEn: 'Biology'                   },
            { id: 'mathematics', nameAr: 'الرياضيات',               nameEn: 'Mathematics'               },
            { id: 'astronomy',   nameAr: 'علم الفلك',               nameEn: 'Astronomy'                 },
            { id: 'geology',     nameAr: 'علم الأرض والجيولوجيا',  nameEn: 'Geology & Earth Sciences'  },
            { id: 'oceanography',nameAr: 'علم المحيطات',            nameEn: 'Oceanography'              },
            { id: 'meteorology', nameAr: 'الأرصاد الجوية',          nameEn: 'Meteorology'               },
            { id: 'neuroscience',nameAr: 'علم الأعصاب',             nameEn: 'Neuroscience'              },
            { id: 'genetics',    nameAr: 'علم الوراثة',             nameEn: 'Genetics'                  },
            { id: 'ecology',     nameAr: 'علم البيئة',              nameEn: 'Ecology'                   },
            { id: 'materials_sci',nameAr: 'علم المواد',             nameEn: 'Materials Science'         },
        ];
        this.researchMethods = ['تجريبي', 'نظري', 'حسابي', 'مراقبة وميداني', 'استعراض منهجي'];
    }

    async handle(req = {}) {
        const { data = {}, traceId } = req;
        const branch  = data.branch || 'physics';
        const matched = this.scienceBranches.find(b => b.id === branch) || this.scienceBranches[0];
        return {
            network: this.id,
            nameAr:  this.nameAr,
            branch:  matched,
            result: {
                status:          'processed',
                traceId,
                message:         `شبكة العلوم شيخة — فرع: ${matched.nameAr}`,
                researchMethods: this.researchMethods,
                maqsad:          this.maqsad,
                quranRef:        this.quranRef,
            },
        };
    }

    status() {
        return { id: this.id, nameAr: this.nameAr, version: this.version, branches: this.scienceBranches.length };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. شبكة شيخه العصبية للذكاء الصناعي — SHEIKHA AI NEURAL NETWORK
// ═══════════════════════════════════════════════════════════════════════════════

class SheikhaAINeuralNetwork {
    constructor() {
        this.id       = 'sheikha_ai_neural';
        this.nameAr   = 'شبكة شيخه العصبية للذكاء الصناعي';
        this.nameEn   = 'Sheikha AI Neural Network';
        this.version  = '1.0.0';
        this.maqsad   = 'AQL';
        this.quranRef = '﴿ وَفَوْقَ كُلِّ ذِي عِلْمٍ عَلِيمٌ ﴾ — يوسف ٧٦';
        this.aiSubfields = [
            { id: 'ml',          nameAr: 'تعلم الآلة',                    nameEn: 'Machine Learning'              },
            { id: 'dl',          nameAr: 'التعلم العميق',                  nameEn: 'Deep Learning'                 },
            { id: 'nlp',         nameAr: 'معالجة اللغات الطبيعية',         nameEn: 'Natural Language Processing'  },
            { id: 'cv',          nameAr: 'الرؤية الحاسوبية',               nameEn: 'Computer Vision'              },
            { id: 'rl',          nameAr: 'التعلم المعزز',                  nameEn: 'Reinforcement Learning'       },
            { id: 'generative',  nameAr: 'الذكاء التوليدي',               nameEn: 'Generative AI'                },
            { id: 'robotics_ai', nameAr: 'الذكاء في الروبوتات',            nameEn: 'AI Robotics'                  },
            { id: 'explainable', nameAr: 'الذكاء الاصطناعي القابل للتفسير', nameEn: 'Explainable AI (XAI)'       },
            { id: 'edge_ai',     nameAr: 'الذكاء الطرفي',                  nameEn: 'Edge AI'                      },
            { id: 'multimodal',  nameAr: 'الذكاء متعدد الأنماط',           nameEn: 'Multimodal AI'               },
            { id: 'agi',         nameAr: 'الذكاء الاصطناعي العام',         nameEn: 'Artificial General Intelligence' },
        ];
        this.ethicsFramework = {
            principles: ['لا ضرر ولا ضرار', 'الشفافية', 'العدالة', 'الخصوصية', 'المساءلة'],
            sharia:     'كل ذكاء اصطناعي يخضع للكتاب والسنة',
        };
    }

    async handle(req = {}) {
        const { data = {}, traceId } = req;
        const subfield = data.subfield || 'ml';
        const matched  = this.aiSubfields.find(s => s.id === subfield) || this.aiSubfields[0];
        return {
            network:  this.id,
            nameAr:   this.nameAr,
            subfield: matched,
            result: {
                status:         'processed',
                traceId,
                message:        `شبكة الذكاء الاصطناعي شيخة — مجال: ${matched.nameAr}`,
                ethicsFramework: this.ethicsFramework,
                maqsad:         this.maqsad,
                quranRef:       this.quranRef,
            },
        };
    }

    status() {
        return { id: this.id, nameAr: this.nameAr, version: this.version, subfields: this.aiSubfields.length };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 9. شبكة شيخة العصبية للتجارة والاقتصاد والمال والذهب والفضة
//    SHEIKHA COMMERCE, ECONOMY & PRECIOUS METALS NEURAL NETWORK
// ═══════════════════════════════════════════════════════════════════════════════

class SheikhaCommerceEconomyNeuralNetwork {
    constructor() {
        this.id       = 'sheikha_commerce_economy_neural';
        this.nameAr   = 'شبكة شيخة العصبية للتجارة والاقتصاد والمال والذهب والفضة';
        this.nameEn   = 'Sheikha Commerce, Economy & Precious Metals Neural Network';
        this.version  = '1.0.0';
        this.maqsad   = 'MAL';
        this.quranRef = '﴿ وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا ﴾ — البقرة ٢٧٥';

        this.commerceSectors = [
            { id: 'wholesale',   nameAr: 'تجارة الجملة',               nameEn: 'Wholesale Trade'              },
            { id: 'retail',      nameAr: 'تجارة التجزئة',              nameEn: 'Retail Trade'                 },
            { id: 'ecommerce',   nameAr: 'التجارة الإلكترونية',        nameEn: 'E-Commerce'                   },
            { id: 'export',      nameAr: 'التصدير والاستيراد',          nameEn: 'Import / Export'              },
            { id: 'commodity',   nameAr: 'تجارة السلع',                nameEn: 'Commodity Trading'           },
            { id: 'b2b',         nameAr: 'التجارة بين الشركات (B2B)', nameEn: 'B2B Commerce'                 },
        ];

        this.economicIndicators = [
            { id: 'gdp',         nameAr: 'الناتج المحلي الإجمالي', nameEn: 'GDP'               },
            { id: 'inflation',   nameAr: 'التضخم',                  nameEn: 'Inflation'         },
            { id: 'employment',  nameAr: 'التوظيف والبطالة',        nameEn: 'Employment'        },
            { id: 'trade_balance', nameAr: 'الميزان التجاري',       nameEn: 'Trade Balance'     },
            { id: 'pmi',         nameAr: 'مؤشر مديري المشتريات',    nameEn: 'PMI'               },
        ];

        this.preciousMetals = [
            {
                id:         'gold',
                nameAr:     'الذهب',
                nameEn:     'Gold',
                symbol:     'XAU',
                purity:     ['24K', '22K', '21K', '18K', '14K'],
                units:      ['جرام', 'أوقية تروي', 'كيلوجرام', 'طن'],
                shariaNote: 'الذهب أصل المال في الشريعة — يخضع لأحكام الزكاة والصرف',
                quranRef:   '﴿ زُيِّنَ لِلنَّاسِ حُبُّ الشَّهَوَاتِ مِنَ النِّسَاءِ وَالْبَنِينَ وَالْقَنَاطِيرِ الْمُقَنطَرَةِ مِنَ الذَّهَبِ وَالْفِضَّةِ ﴾ — آل عمران ١٤',
            },
            {
                id:         'silver',
                nameAr:     'الفضة',
                nameEn:     'Silver',
                symbol:     'XAG',
                purity:     ['999', '925 Sterling', '900', '800'],
                units:      ['جرام', 'أوقية تروي', 'كيلوجرام', 'طن'],
                shariaNote: 'الفضة أصل نقدي شرعي — تخضع لأحكام الزكاة والصرف والربا',
                quranRef:   '﴿ وَالْقَنَاطِيرِ الْمُقَنطَرَةِ مِنَ الذَّهَبِ وَالْفِضَّةِ ﴾ — آل عمران ١٤',
            },
            {
                id:         'platinum',
                nameAr:     'البلاتين',
                nameEn:     'Platinum',
                symbol:     'XPT',
                purity:     ['950', '900', '850'],
                units:      ['جرام', 'أوقية تروي'],
                shariaNote: 'معدن ثمين — يخضع لأحكام التجارة الحلال',
                quranRef:   '',
            },
            {
                id:         'palladium',
                nameAr:     'البالاديوم',
                nameEn:     'Palladium',
                symbol:     'XPD',
                purity:     ['999.5'],
                units:      ['جرام', 'أوقية تروي'],
                shariaNote: 'معدن صناعي ثمين',
                quranRef:   '',
            },
        ];

        this.financialInstruments = [
            { id: 'murabaha',  nameAr: 'المرابحة الإسلامية',     halal: true  },
            { id: 'musharaka', nameAr: 'المشاركة',               halal: true  },
            { id: 'mudaraba',  nameAr: 'المضاربة',               halal: true  },
            { id: 'ijara',     nameAr: 'الإجارة',                halal: true  },
            { id: 'sukuk',     nameAr: 'الصكوك الإسلامية',       halal: true  },
            { id: 'zakat_fund',nameAr: 'صناديق الزكاة والوقف',  halal: true  },
            { id: 'takaful',   nameAr: 'التكافل الإسلامي',      halal: true  },
        ];
    }

    async handle(req = {}) {
        const { data = {}, traceId } = req;
        const category = data.category || 'commerce';

        let result;
        if (category === 'gold' || category === 'silver' || category === 'precious_metals') {
            const metalId = data.metal || 'gold';
            const metal   = this.preciousMetals.find(m => m.id === metalId) || this.preciousMetals[0];
            result = { category: 'precious_metals', metal, message: `شبكة المعادن الثمينة شيخة — ${metal.nameAr} (${metal.symbol})` };
        } else if (category === 'economy') {
            result = { category: 'economy', indicators: this.economicIndicators, message: 'شبكة الاقتصاد شيخة — المؤشرات الاقتصادية' };
        } else if (category === 'finance') {
            result = { category: 'finance', instruments: this.financialInstruments, message: 'شبكة المال شيخة — الأدوات المالية الإسلامية' };
        } else {
            const sector  = data.sector || 'wholesale';
            const matched = this.commerceSectors.find(s => s.id === sector) || this.commerceSectors[0];
            result = { category: 'commerce', sector: matched, message: `شبكة التجارة شيخة — قطاع: ${matched.nameAr}` };
        }

        return {
            network:  this.id,
            nameAr:   this.nameAr,
            ...result,
            meta: {
                status:   'processed',
                traceId,
                maqsad:   this.maqsad,
                quranRef: this.quranRef,
            },
        };
    }

    /** حساب زكاة الذهب والفضة */
    calculateZakat(metalId, weightGrams, currentPricePerGram) {
        const NISAB_GOLD_GRAMS   = 85;    // نصاب الذهب: ٨٥ جرام
        const NISAB_SILVER_GRAMS = 595;   // نصاب الفضة: ٥٩٥ جرام
        const ZAKAT_RATE         = 0.025; // ٢.٥٪

        if (metalId !== 'gold' && metalId !== 'silver') {
            return { applicable: false, reason: 'الزكاة تسري على الذهب والفضة فقط' };
        }

        const nisabGrams = metalId === 'gold' ? NISAB_GOLD_GRAMS : NISAB_SILVER_GRAMS;
        if (weightGrams < nisabGrams) {
            return { applicable: false, reason: `لم يبلغ النصاب (${nisabGrams}جم)`, weightGrams, nisabGrams };
        }

        const totalValue = weightGrams * currentPricePerGram;
        const zakatDue   = totalValue * ZAKAT_RATE;
        return {
            applicable:         true,
            metalId,
            weightGrams,
            currentPricePerGram,
            totalValue,
            zakatRate:          ZAKAT_RATE,
            zakatDue:           Math.round(zakatDue * 100) / 100,
            currency:           'SAR',
            shariaRef:          'حديث: في الرقة ربع العشر — أبو داود',
        };
    }

    status() {
        return {
            id:               this.id,
            nameAr:           this.nameAr,
            version:          this.version,
            commerceSectors:  this.commerceSectors.length,
            preciousMetals:   this.preciousMetals.length,
            financialInstruments: this.financialInstruments.length,
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 10. شبكة شيخة العصبيه للسكراب — SHEIKHA SCRAP NEURAL NETWORK
// ═══════════════════════════════════════════════════════════════════════════════

class SheikhaScrapNeuralNetwork {
    constructor() {
        this.id       = 'sheikha_scrap_neural';
        this.nameAr   = 'شبكة شيخة العصبيه للسكراب';
        this.nameEn   = 'Sheikha Scrap Neural Network';
        this.version  = '1.0.0';
        this.maqsad   = 'ARD';
        this.quranRef = '﴿ وَلَا تُفْسِدُوا فِي الْأَرْضِ بَعْدَ إِصْلَاحِهَا ﴾ — الأعراف ٥٦';

        this.scrapCategories = [
            {
                id: 'ferrous',
                nameAr: 'معادن حديدية (حديد وفولاذ)',
                nameEn: 'Ferrous Scrap (Iron & Steel)',
                types: [
                    { id: 'hms1',    nameAr: 'خردة الحديد الثقيل HMS1',     density_kg_m3: 7850 },
                    { id: 'hms2',    nameAr: 'خردة الحديد HMS2',             density_kg_m3: 7850 },
                    { id: 'shredded',nameAr: 'الخردة المفرمة (Shredded)',    density_kg_m3: 1200 },
                    { id: 'pig_iron',nameAr: 'الحديد الزهر',                 density_kg_m3: 7200 },
                    { id: 'rebar',   nameAr: 'حديد التسليح',                density_kg_m3: 7850 },
                ],
            },
            {
                id: 'non_ferrous',
                nameAr: 'معادن غير حديدية',
                nameEn: 'Non-Ferrous Scrap',
                types: [
                    { id: 'copper',    nameAr: 'نحاس',         purity_range: '99–99.9%' },
                    { id: 'aluminum',  nameAr: 'ألمنيوم',      purity_range: '95–99%'   },
                    { id: 'brass',     nameAr: 'نحاس أصفر',    purity_range: '60–85%'   },
                    { id: 'stainless', nameAr: 'فولاذ مقاوم للصدأ', purity_range: '304/316' },
                    { id: 'lead',      nameAr: 'رصاص',         purity_range: '95–99.9%' },
                    { id: 'zinc',      nameAr: 'زنك',           purity_range: '98–99.99%'},
                    { id: 'tin',       nameAr: 'قصدير',        purity_range: '99%+'     },
                    { id: 'nickel',    nameAr: 'نيكل',          purity_range: '99%+'     },
                ],
            },
            {
                id: 'electronic',
                nameAr: 'نفايات إلكترونية (E-Waste)',
                nameEn: 'Electronic Scrap / E-Waste',
                types: [
                    { id: 'pcb',      nameAr: 'لوحات دوائر مطبوعة (PCB)' },
                    { id: 'hdd',      nameAr: 'أقراص صلبة (HDD)'           },
                    { id: 'batteries',nameAr: 'بطاريات ليثيوم وحمضية'      },
                    { id: 'cables',   nameAr: 'كابلات وأسلاك'              },
                    { id: 'motors',   nameAr: 'محركات كهربائية'            },
                ],
            },
            {
                id: 'plastic',
                nameAr: 'بلاستيك للتدوير',
                nameEn: 'Plastic Recycling',
                types: [
                    { id: 'pet',  nameAr: 'PET (زجاجات)',  recycleCode: 1 },
                    { id: 'hdpe', nameAr: 'HDPE (أكياس)',  recycleCode: 2 },
                    { id: 'pp',   nameAr: 'PP (بولي بروبيلين)', recycleCode: 5 },
                    { id: 'abs',  nameAr: 'ABS (هياكل)',   recycleCode: 7 },
                ],
            },
            {
                id: 'paper_cardboard',
                nameAr: 'ورق وكرتون',
                nameEn: 'Paper & Cardboard',
                types: [
                    { id: 'occ',   nameAr: 'كرتون مموج (OCC)' },
                    { id: 'mixed', nameAr: 'ورق مختلط'          },
                    { id: 'news',  nameAr: 'جرائد'              },
                ],
            },
        ];

        this.recyclingMetrics = {
            co2SavedPerTon_steel_kg:    1800,
            co2SavedPerTon_aluminum_kg: 9000,
            co2SavedPerTon_copper_kg:   3500,
            co2SavedPerTon_paper_kg:    820,
        };
    }

    async handle(req = {}) {
        const { data = {}, traceId } = req;
        const categoryId = data.category || 'ferrous';
        const category   = this.scrapCategories.find(c => c.id === categoryId) || this.scrapCategories[0];

        // حساب توفير ثاني أكسيد الكربون إن وُجد الوزن
        let co2Analysis = null;
        if (data.weightTons && data.metalType) {
            const key = `co2SavedPerTon_${data.metalType}_kg`;
            if (this.recyclingMetrics[key]) {
                co2Analysis = {
                    weightTons:       data.weightTons,
                    co2SavedKg:       data.weightTons * this.recyclingMetrics[key],
                    co2SavedTons:     (data.weightTons * this.recyclingMetrics[key]) / 1000,
                    environmentalImpact: 'إيجابي — يقلل من التلوث ويحافظ على الموارد الطبيعية',
                };
            }
        }

        return {
            network:  this.id,
            nameAr:   this.nameAr,
            category,
            co2Analysis,
            result: {
                status:   'processed',
                traceId,
                message:  `شبكة السكراب شيخة — فئة: ${category.nameAr}`,
                maqsad:   this.maqsad,
                quranRef: this.quranRef,
            },
        };
    }

    /** تقدير قيمة الخردة بالوزن والسعر الحالي */
    estimateScrapValue(categoryId, typeId, weightKg, pricePerKg) {
        const category = this.scrapCategories.find(c => c.id === categoryId);
        if (!category) return { error: 'فئة غير معروفة' };
        const type = category.types.find(t => t.id === typeId);
        if (!type) return { error: 'نوع غير معروف' };

        const totalValue = weightKg * pricePerKg;
        return {
            category:   category.nameAr,
            type:       type.nameAr,
            weightKg,
            pricePerKg,
            totalValue: Math.round(totalValue * 100) / 100,
            currency:   'SAR',
        };
    }

    status() {
        return {
            id:                this.id,
            nameAr:            this.nameAr,
            version:           this.version,
            scrapCategories:   this.scrapCategories.length,
            recyclingMetrics:  this.recyclingMetrics,
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 11. شبكة شيخة العصبيه للتشليح — SHEIKHA VEHICLE DISMANTLING NEURAL NETWORK
// ═══════════════════════════════════════════════════════════════════════════════

class SheikhaVehicleDismantlingNeuralNetwork {
    constructor() {
        this.id       = 'sheikha_dismantling_neural';
        this.nameAr   = 'شبكة شيخة العصبيه للتشليح';
        this.nameEn   = 'Sheikha Vehicle Dismantling Neural Network';
        this.version  = '1.0.0';
        this.maqsad   = 'ARD';
        this.quranRef = '﴿ وَلَا تُبَذِّرْ تَبْذِيرًا ﴾ — الإسراء ٢٦';

        this.vehicleTypes = [
            { id: 'passenger',   nameAr: 'سيارات ركاب',         nameEn: 'Passenger Cars'       },
            { id: 'suv',         nameAr: 'سيارات رباعية (SUV)', nameEn: 'SUVs & 4x4'           },
            { id: 'truck',       nameAr: 'شاحنات',              nameEn: 'Trucks'               },
            { id: 'bus',         nameAr: 'حافلات',              nameEn: 'Buses'                },
            { id: 'motorcycle',  nameAr: 'دراجات نارية',        nameEn: 'Motorcycles'          },
            { id: 'heavy_equip', nameAr: 'معدات ثقيلة',         nameEn: 'Heavy Equipment'      },
            { id: 'marine',      nameAr: 'قوارب وزوارق',        nameEn: 'Marine Vessels'       },
            { id: 'aircraft',    nameAr: 'طائرات (قطع الغيار)', nameEn: 'Aircraft Parts'       },
        ];

        this.partCategories = [
            {
                id: 'engine',
                nameAr: 'المحرك وملحقاته',
                nameEn: 'Engine & Components',
                parts: ['المحرك الكامل', 'رأس الأسطوانات', 'الكارتر', 'العمود المرفقي', 'الكامة', 'الإكزوز', 'التوربو'],
            },
            {
                id: 'transmission',
                nameAr: 'ناقل الحركة',
                nameEn: 'Transmission',
                parts: ['ناقل الحركة الأوتوماتيك', 'ناقل الحركة اليدوي', 'مجموعة المحاور', 'الديفرانس'],
            },
            {
                id: 'electrical',
                nameAr: 'النظام الكهربائي',
                nameEn: 'Electrical System',
                parts: ['وحدة التحكم (ECU)', 'البطارية', 'المولد (ألترنيتر)', 'البادئ (سلف)', 'الكابلات الكاملة'],
            },
            {
                id: 'body',
                nameAr: 'الهيكل والجسم',
                nameEn: 'Body & Frame',
                parts: ['الأبواب', 'الغطاء الأمامي', 'الصندوق الخلفي', 'الأجنحة', 'المصدات', 'الزجاج'],
            },
            {
                id: 'suspension',
                nameAr: 'نظام التعليق والفرامل',
                nameEn: 'Suspension & Brakes',
                parts: ['الممتصات', 'الزنبركات', 'أقراص الفرامل', 'طاسات الفرامل', 'حامل العجل'],
            },
            {
                id: 'interior',
                nameAr: 'التجهيزات الداخلية',
                nameEn: 'Interior',
                parts: ['لوحة العدادات', 'المقاعد', 'السجادة', 'الأبواب الداخلية', 'نظام التكييف'],
            },
            {
                id: 'ac_system',
                nameAr: 'منظومة التكييف',
                nameEn: 'AC System',
                parts: ['الكمبروسر', 'المبخر', 'الكوندنسر', 'الإكسبانشن فالف'],
            },
            {
                id: 'tires_wheels',
                nameAr: 'الإطارات والعجلات',
                nameEn: 'Tires & Wheels',
                parts: ['الإطارات (بأنواعها)', 'جنوط الألمنيوم', 'جنوط الحديد'],
            },
        ];

        this.processSteps = [
            { step: 1, nameAr: 'استقبال المركبة وتسجيلها',       nameEn: 'Vehicle Reception & Registration'  },
            { step: 2, nameAr: 'تقييم الحالة وتحديد القيمة',      nameEn: 'Condition Assessment & Valuation'  },
            { step: 3, nameAr: 'استنزاف السوائل (زيت، وقود، كولانت)', nameEn: 'Fluid Draining'             },
            { step: 4, nameAr: 'فك البطارية والنظام الكهربائي',   nameEn: 'Battery & Electrical Removal'      },
            { step: 5, nameAr: 'فك القطع القابلة لإعادة الاستخدام', nameEn: 'Reusable Parts Removal'         },
            { step: 6, nameAr: 'تصنيف القطع وجردها وتسعيرها',    nameEn: 'Parts Classification & Pricing'    },
            { step: 7, nameAr: 'تحضير الهيكل للتكسير',            nameEn: 'Hull Preparation for Crushing'     },
            { step: 8, nameAr: 'تسليم الهيكل لمحطة السكراب',       nameEn: 'Hull Transfer to Scrap Station'    },
        ];

        this.complianceRequirements = [
            'شهادة إلغاء تسجيل المركبة',
            'الالتزام بلوائح البيئة في التخلص من السوائل',
            'شهادة فني مرخص لفك نظام الوسائد الهوائية',
            'الامتثال لنظام هيئة المرور في المملكة',
            'توثيق أرقام الهيكل والمحرك',
        ];
    }

    async handle(req = {}) {
        const { data = {}, traceId } = req;
        const vehicleType = data.vehicleType || 'passenger';
        const partCategory = data.partCategory || 'engine';

        const vehicle = this.vehicleTypes.find(v => v.id === vehicleType) || this.vehicleTypes[0];
        const parts   = this.partCategories.find(p => p.id === partCategory) || this.partCategories[0];

        return {
            network:     this.id,
            nameAr:      this.nameAr,
            vehicleType: vehicle,
            partCategory: parts,
            processSteps: this.processSteps,
            result: {
                status:               'processed',
                traceId,
                message:              `شبكة التشليح شيخة — نوع: ${vehicle.nameAr} — قسم: ${parts.nameAr}`,
                complianceRequired:   this.complianceRequirements,
                maqsad:               this.maqsad,
                quranRef:             this.quranRef,
            },
        };
    }

    /** تقدير قيمة قطع التشليح للمركبة */
    estimatePartValue(partCategoryId, partId, condition, marketPriceNew) {
        const CONDITION_FACTORS = {
            'ممتاز':    0.70,
            'جيد جداً': 0.55,
            'جيد':      0.40,
            'مقبول':    0.25,
            'قطع':      0.10,
        };

        const category = this.partCategories.find(c => c.id === partCategoryId);
        if (!category) return { error: 'قسم غير معروف' };
        if (!category.parts.includes(partId)) return { error: 'قطعة غير موجودة في هذا القسم' };

        const factor = CONDITION_FACTORS[condition] || 0.30;
        const estimatedValue = marketPriceNew * factor;

        return {
            category:       category.nameAr,
            partId,
            condition,
            marketPriceNew,
            conditionFactor: factor,
            estimatedValue: Math.round(estimatedValue * 100) / 100,
            currency:       'SAR',
        };
    }

    status() {
        return {
            id:                      this.id,
            nameAr:                  this.nameAr,
            version:                 this.version,
            vehicleTypes:            this.vehicleTypes.length,
            partCategories:          this.partCategories.length,
            processSteps:            this.processSteps.length,
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED ENGINE — المحرك الموحد لكل الشبكات العصبية المتخصصة
// ═══════════════════════════════════════════════════════════════════════════════

class SheikhaSpecializedNeuralEngine {

    constructor() {
        this.nameAr    = 'محرك شيخة للشبكات العصبية المتخصصة';
        this.nameEn    = 'Sheikha Specialized Neural Networks Engine';
        this.version   = '1.0.0';
        this.activatedAt = new Date().toISOString();
        this.tawheed   = 'لا إله إلا الله محمد رسول الله';

        // تهيئة كل الشبكات
        this._networks = {
            computing:          new SheikhaComputingNeuralNetwork(),
            computer_science:   new SheikhaComputerScienceNeuralNetwork(),
            servers:            new SheikhaServerNeuralNetwork(),
            cloud_servers:      new SheikhaCloudServerNeuralNetwork(),
            technical:          new SheikhaTechnicalNeuralNetwork(),
            technology:         new SheikhaTechnologyNeuralNetwork(),
            science:            new SheikhaScienceNeuralNetwork(),
            ai:                 new SheikhaAINeuralNetwork(),
            commerce_economy:   new SheikhaCommerceEconomyNeuralNetwork(),
            scrap:              new SheikhaScrapNeuralNetwork(),
            dismantling:        new SheikhaVehicleDismantlingNeuralNetwork(),
        };

        // جدول توجيه سريع
        this._intentMap = {
            // الحوسبة
            'computing':         'computing',
            'compute':           'computing',
            'hpc':               'computing',
            'quantum':           'computing',
            'حاسب':              'computing',
            'حوسبة':             'computing',
            // علوم الحاسوب
            'cs':                'computer_science',
            'computer_science':  'computer_science',
            'algorithms':        'computer_science',
            'علوم_الحاسوب':      'computer_science',
            // الخوادم
            'server':            'servers',
            'servers':           'servers',
            'خوادم':             'servers',
            'خادم':              'servers',
            // السحابة
            'cloud':             'cloud_servers',
            'cloud_server':      'cloud_servers',
            'سحابة':             'cloud_servers',
            'خوادم_سحابية':      'cloud_servers',
            // التقنية
            'technical':         'technical',
            'engineering':       'technical',
            'تقنية':             'technical',
            'هندسة':             'technical',
            // التكنولوجيا
            'technology':        'technology',
            'tech':              'technology',
            'تكنولوجيا':         'technology',
            // العلوم
            'science':           'science',
            'sciences':          'science',
            'علوم':              'science',
            'بحث_علمي':          'science',
            // الذكاء الاصطناعي
            'ai_neural':         'ai',
            'ml':                'ai',
            'deep_learning':     'ai',
            'ذكاء_اصطناعي':      'ai',
            // التجارة والاقتصاد
            'commerce':          'commerce_economy',
            'economy':           'commerce_economy',
            'gold':              'commerce_economy',
            'silver':            'commerce_economy',
            'precious_metals':   'commerce_economy',
            'تجارة':             'commerce_economy',
            'اقتصاد':            'commerce_economy',
            'ذهب':               'commerce_economy',
            'فضة':               'commerce_economy',
            // السكراب
            'scrap':             'scrap',
            'recycling':         'scrap',
            'سكراب':             'scrap',
            'تدوير':             'scrap',
            // التشليح
            'dismantling':       'dismantling',
            'auto_salvage':      'dismantling',
            'تشليح':             'dismantling',
            'قطع_غيار':          'dismantling',
        };
    }

    /**
     * المدخل الرئيسي — يوجّه الطلب للشبكة المناسبة
     * @param {object} req - { intent, data, traceId, entity }
     * @returns {Promise<object>}
     */
    async handle(req = {}) {
        const { intent = '', data = {}, traceId, entity = {} } = req;

        // تحديد الشبكة المناسبة
        const normalizedIntent = String(intent).toLowerCase().trim();
        const networkKey = this._intentMap[normalizedIntent]
            || this._intentMap[data.network]
            || normalizedIntent;

        const network = this._networks[networkKey];

        if (network && typeof network.handle === 'function') {
            return network.handle({ intent, data, traceId, entity });
        }

        // إعادة قائمة الشبكات المتاحة إن لم يُعثر على شبكة
        return {
            engine:  this.nameAr,
            message: `الشبكة "${intent}" غير موجودة — الشبكات المتاحة أدناه`,
            networks: this.listNetworks(),
            traceId,
        };
    }

    /** قائمة الشبكات المتاحة */
    listNetworks() {
        return Object.entries(this._networks).map(([key, net]) => ({
            key,
            id:     net.id,
            nameAr: net.nameAr,
            nameEn: net.nameEn,
        }));
    }

    /** حالة المحرك */
    status() {
        const networks = {};
        for (const [key, net] of Object.entries(this._networks)) {
            networks[key] = net.status();
        }
        return {
            engine:      this.nameAr,
            version:     this.version,
            activatedAt: this.activatedAt,
            tawheed:     this.tawheed,
            totalNetworks: Object.keys(this._networks).length,
            networks,
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Singleton
// ═══════════════════════════════════════════════════════════════════════════════

const engine = new SheikhaSpecializedNeuralEngine();

// ═══════════════════════════════════════════════════════════════════════════════
// Export
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
    engine,
    SheikhaSpecializedNeuralEngine,
    // الشبكات الفردية (للاستخدام المستقل)
    SheikhaComputingNeuralNetwork,
    SheikhaComputerScienceNeuralNetwork,
    SheikhaServerNeuralNetwork,
    SheikhaCloudServerNeuralNetwork,
    SheikhaTechnicalNeuralNetwork,
    SheikhaTechnologyNeuralNetwork,
    SheikhaScienceNeuralNetwork,
    SheikhaAINeuralNetwork,
    SheikhaCommerceEconomyNeuralNetwork,
    SheikhaScrapNeuralNetwork,
    SheikhaVehicleDismantlingNeuralNetwork,
};
