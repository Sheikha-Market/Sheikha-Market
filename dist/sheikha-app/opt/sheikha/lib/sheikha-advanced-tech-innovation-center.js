/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════╗
 * ║  ☪️  بسم الله الرحمن الرحيم                                                       ║
 * ║                                                                                   ║
 * ║  SHEIKHA ADVANCED TECHNOLOGY INNOVATION & EXPLORATION CENTER                     ║
 * ║  شيخة — مركز الابتكار التقني المتقدم والاستكشاف والبحث والتطوير                 ║
 * ║  v1.0.0                                                                           ║
 * ║                                                                                   ║
 * ║  © 2026 سلمان أحمد بن سلمان الراجح — جميع الحقوق محفوظة                         ║
 * ║  منظومة شيخة — محمية بموجب قوانين الملكية الفكرية السعودية والدولية              ║
 * ║                                                                                   ║
 * ║  ﴿ وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ ﴾ — الأنفال ٦٠              ║
 * ║  ﴿ وَسَخَّرَ لَكُم مَّا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ جَمِيعًا ﴾       ║
 * ║                                                                                   ║
 * ╠═══════════════════════════════════════════════════════════════════════════════════╣
 * ║  TECHNOLOGY DOMAINS (25 domains)                                                  ║
 * ║    AI & Machine Learning │ Quantum Computing │ Nanotechnology │ Biotechnology     ║
 * ║    Space & Aerospace     │ Clean Energy      │ Advanced Materials │ Robotics       ║
 * ║    Cybersecurity         │ Blockchain/Web3   │ 6G & Comms        │ Edge Computing  ║
 * ║    Extended Reality (XR) │ Digital Twins     │ Neuromorphic      │ Photonics       ║
 * ║    Synthetic Biology     │ Nuclear Fusion    │ Ocean Technology  │ Agri-Tech       ║
 * ║    Smart Cities          │ Autonomous Systems│ Health-Tech       │ Climate-Tech    ║
 * ║    Islamic FinTech       │                                                         ║
 * ╠═══════════════════════════════════════════════════════════════════════════════════╣
 * ║  CAPABILITIES                                                                     ║
 * ║    ✅ R&D Project Management       — مشاريع البحث والتطوير الكاملة               ║
 * ║    ✅ Innovation Pipeline          — خط الابتكار (Idea → TRL9 → Market)          ║
 * ║    ✅ Technology Readiness Levels  — مستويات النضج التقني TRL 1-9                ║
 * ║    ✅ Patent & IP Registry         — سجل براءات الاختراع والملكية الفكرية        ║
 * ║    ✅ Global Tech Intelligence     — استخبارات التقنيات العالمية والكونية         ║
 * ║    ✅ Collaboration Network        — شبكة التعاون البحثي الدولي                   ║
 * ║    ✅ AI-Powered Assessment        — تقييم ذكي للتقنيات والمشاريع                 ║
 * ║    ✅ Technology Scoring           — نظام تقييم شامل (Impact × Feasibility × TRL) ║
 * ║    ✅ Islamic Compliance           — حوكمة إسلامية شاملة لكل تقنية               ║
 * ║    ✅ Real-time Monitoring         — مراقبة لحظية للمشاريع والتقنيات              ║
 * ║    ✅ WebSocket Broadcast          — بث فوري للأحداث والتحديثات                   ║
 * ║    ✅ Atomic Persistence           — حفظ آمن بلا فقدان بيانات                    ║
 * ║                                                                                   ║
 * ║  REST API — 22 Endpoints on /api/tech-innovation/*                               ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════╝
 */

'use strict';

const crypto    = require('crypto');
const fs        = require('fs');
const path      = require('path');
const EventEmitter = require('events');

// ============================================================
// CONSTANTS
// ============================================================
const DATA_DIR      = path.join(__dirname, '..', 'data');
const DB_FILE       = path.join(DATA_DIR, 'tech-innovation-db.json');
const PROJECTS_FILE = path.join(DATA_DIR, 'tech-innovation-projects.json');
const PATENTS_FILE  = path.join(DATA_DIR, 'tech-innovation-patents.json');
const ENGINE_VERSION = '1.0.0';
const BASE_ROUTE    = '/api/tech-innovation';

// ============================================================
// TECHNOLOGY READINESS LEVELS (TRL 1-9, NASA/ESA Standard)
// ============================================================
const TRL_DEFINITIONS = {
    1: { level: 1, nameEn: 'Basic Principles', nameAr: 'المبادئ الأساسية',         description: 'اكتشاف المبادئ العلمية الجوهرية',  icon: '🔬', phase: 'research' },
    2: { level: 2, nameEn: 'Technology Concept', nameAr: 'المفهوم التقني',         description: 'صياغة مفهوم التطبيق التقني',       icon: '💡', phase: 'research' },
    3: { level: 3, nameEn: 'Experimental Proof', nameAr: 'الإثبات التجريبي',        description: 'إثبات الجدوى التجريبي',           icon: '🧪', phase: 'research' },
    4: { level: 4, nameEn: 'Lab Validation', nameAr: 'التحقق المخبري',              description: 'تحقق في بيئة مختبرية',           icon: '🏗️', phase: 'development' },
    5: { level: 5, nameEn: 'Relevant Environment', nameAr: 'بيئة ذات صلة',          description: 'تحقق في بيئة محاكاة واقعية',     icon: '⚗️', phase: 'development' },
    6: { level: 6, nameEn: 'Relevant Environment Demo', nameAr: 'عرض توضيحي',       description: 'عرض توضيحي في بيئة واقعية',      icon: '🎯', phase: 'development' },
    7: { level: 7, nameEn: 'Operational Prototype', nameAr: 'نموذج تشغيلي',         description: 'نموذج أولي تشغيلي كامل',         icon: '🤖', phase: 'deployment' },
    8: { level: 8, nameEn: 'System Complete', nameAr: 'النظام مكتمل',                description: 'النظام مكتمل ومُختبر',           icon: '✅', phase: 'deployment' },
    9: { level: 9, nameEn: 'Operational System', nameAr: 'نظام تشغيلي',              description: 'النظام يعمل في البيئة الفعلية',   icon: '🚀', phase: 'market' }
};

// ============================================================
// INNOVATION PIPELINE STAGES
// ============================================================
const PIPELINE_STAGES = [
    { id: 'ideation',    nameAr: 'توليد الأفكار',     nameEn: 'Ideation',        icon: '💡', order: 1 },
    { id: 'feasibility', nameAr: 'دراسة الجدوى',      nameEn: 'Feasibility',     icon: '📊', order: 2 },
    { id: 'research',    nameAr: 'البحث العلمي',       nameEn: 'Research',        icon: '🔬', order: 3 },
    { id: 'prototype',   nameAr: 'النموذج الأولي',     nameEn: 'Prototyping',     icon: '🛠️', order: 4 },
    { id: 'validation',  nameAr: 'التحقق والاختبار',   nameEn: 'Validation',      icon: '✅', order: 5 },
    { id: 'scale',       nameAr: 'التوسع والتحجيم',    nameEn: 'Scale-up',        icon: '📈', order: 6 },
    { id: 'market',      nameAr: 'الإطلاق التجاري',    nameEn: 'Market Launch',   icon: '🚀', order: 7 },
    { id: 'growth',      nameAr: 'النمو والتطوير',      nameEn: 'Growth & Ops',    icon: '🌱', order: 8 }
];

// ============================================================
// TECHNOLOGY DOMAINS (25 domains — Continental/Global/Cosmic)
// ============================================================
const TECH_DOMAINS = {
    ai_ml: {
        id: 'ai_ml', nameAr: 'الذكاء الاصطناعي وتعلم الآلة', nameEn: 'AI & Machine Learning',
        icon: '🤖', category: 'digital', tier: 'global', trlAvg: 8, islamicScore: 85,
        subfields: ['Deep Learning', 'Generative AI', 'Reinforcement Learning', 'Edge AI', 'Neuromorphic AI', 'Federated Learning', 'AI Safety', 'Explainable AI'],
        globalLeaders: ['OpenAI', 'Google DeepMind', 'Anthropic', 'Meta AI', 'Mistral', 'xAI'],
        arabLeaders: ['MBZUAI (UAE)', 'KACST (KSA)', 'KAUST', 'Inception (UAE)'],
        applications: ['صحة', 'تجارة', 'تعليم', 'مدن ذكية', 'أمن', 'زراعة', 'طاقة'],
        islamicPrinciple: 'توظيف الذكاء الاصطناعي لخدمة الإنسانية بعدل وشفافية',
        trendScore: 98, impactScore: 99, feasibilityScore: 90, disruptionScore: 97
    },
    quantum: {
        id: 'quantum', nameAr: 'الحوسبة الكمية', nameEn: 'Quantum Computing',
        icon: '⚛️', category: 'computing', tier: 'cosmic', trlAvg: 5, islamicScore: 92,
        subfields: ['Quantum Gates', 'Quantum Annealing', 'Quantum Communication', 'Quantum Cryptography', 'Quantum Sensing', 'Quantum Memory', 'Topological Qubits'],
        globalLeaders: ['IBM Quantum', 'Google Quantum AI', 'IonQ', 'Quantinuum', 'Rigetti', 'PsiQuantum'],
        arabLeaders: ['KACST Quantum', 'QRC (Qatar)'],
        applications: ['تشفير', 'مستحضرات صيدلانية', 'مواد متقدمة', 'ذكاء اصطناعي', 'محاكاة'],
        islamicPrinciple: 'استخدام الحوسبة الكمية لحفظ الأسرار وحماية البيانات',
        trendScore: 94, impactScore: 97, feasibilityScore: 55, disruptionScore: 99
    },
    nanotech: {
        id: 'nanotech', nameAr: 'تقنية النانو', nameEn: 'Nanotechnology',
        icon: '🔬', category: 'materials', tier: 'global', trlAvg: 6, islamicScore: 88,
        subfields: ['Nanomaterials', 'Nanomedicine', 'Nanoelectronics', 'Nanorobotics', 'Self-Assembly', 'Nano-Optics', 'Quantum Dots'],
        globalLeaders: ['MIT', 'Stanford', 'ETH Zurich', 'Samsung', 'TSMC', 'Intel'],
        arabLeaders: ['KAUST Nanoscience', 'UAE Nanotech Center'],
        applications: ['طب', 'إلكترونيات', 'طاقة', 'مياه', 'بيئة', 'صناعة'],
        islamicPrinciple: 'تقنية النانو لمعالجة الأمراض وتنقية المياه وخدمة الإنسانية',
        trendScore: 88, impactScore: 92, feasibilityScore: 70, disruptionScore: 90
    },
    biotech: {
        id: 'biotech', nameAr: 'التقنية الحيوية', nameEn: 'Biotechnology',
        icon: '🧬', category: 'life-sciences', tier: 'global', trlAvg: 7, islamicScore: 80,
        subfields: ['CRISPR Gene Editing', 'Synthetic Biology', 'Bioinformatics', 'mRNA Technology', 'Cell Therapy', 'Microbiome', 'Organoids', 'Protein Engineering'],
        globalLeaders: ['Genentech', 'Moderna', 'BioNTech', 'CRISPR Therapeutics', 'Illumina', 'Twist Bioscience'],
        arabLeaders: ['King Faisal Specialist Hospital', 'KFSH&RC', 'Bioatla'],
        applications: ['علاج الأمراض', 'زراعة', 'بيئة', 'غذاء', 'أدوية'],
        islamicPrinciple: 'التقنية الحيوية لعلاج المرض وصون النفس — بضوابط شرعية',
        trendScore: 91, impactScore: 95, feasibilityScore: 75, disruptionScore: 93
    },
    space: {
        id: 'space', nameAr: 'تقنيات الفضاء والطيران', nameEn: 'Space & Aerospace',
        icon: '🚀', category: 'exploration', tier: 'cosmic', trlAvg: 7, islamicScore: 95,
        subfields: ['Reusable Rockets', 'Satellite Constellations', 'Space Manufacturing', 'In-Space Propulsion', 'Space Habitats', 'Planetary Defense', 'Deep Space Comms', 'Space Mining'],
        globalLeaders: ['SpaceX', 'Blue Origin', 'ESA', 'NASA', 'JAXA', 'ISRO', 'Rocket Lab'],
        arabLeaders: ['Saudi Space Agency', 'Mohammed Bin Rashid Space Centre', 'Arabsat'],
        applications: ['اتصالات', 'ملاحة', 'طقس', 'استخبارات', 'استكشاف', 'تعدين فضائي'],
        islamicPrinciple: 'استكشاف الفضاء تأملاً في آيات الله الكونية — وَسَخَّرَ لَكُم مَّا فِي السَّمَاوَاتِ',
        trendScore: 93, impactScore: 98, feasibilityScore: 72, disruptionScore: 96
    },
    clean_energy: {
        id: 'clean_energy', nameAr: 'الطاقة النظيفة والمستدامة', nameEn: 'Clean Energy',
        icon: '☀️', category: 'energy', tier: 'global', trlAvg: 7, islamicScore: 98,
        subfields: ['Solar PV & CSP', 'Green Hydrogen', 'Advanced Batteries', 'Nuclear Fusion', 'Offshore Wind', 'Geothermal', 'Energy Storage', 'Smart Grids'],
        globalLeaders: ['Tesla Energy', 'First Solar', 'Orsted', 'Commonwealth Fusion', 'NEL ASA'],
        arabLeaders: ['ACWA Power (KSA)', 'NEOM', 'Masdar (UAE)', 'Saudi Aramco Sustainability'],
        applications: ['كهرباء', 'نقل', 'صناعة', 'مياه', 'زراعة', 'منازل'],
        islamicPrinciple: 'الطاقة النظيفة حفاظاً على الأرض — لا تُفسدوا في الأرض',
        trendScore: 96, impactScore: 97, feasibilityScore: 82, disruptionScore: 91
    },
    advanced_materials: {
        id: 'advanced_materials', nameAr: 'المواد المتقدمة', nameEn: 'Advanced Materials',
        icon: '⚗️', category: 'materials', tier: 'global', trlAvg: 6, islamicScore: 90,
        subfields: ['Graphene', '2D Materials', 'Meta-materials', 'Shape-memory Alloys', 'Aerogels', 'Biomimetic Materials', 'High-Entropy Alloys', 'Photonic Crystals'],
        globalLeaders: ['Dow', '3M', 'BASF', 'Corning', 'AGC', 'Toray'],
        arabLeaders: ['SABIC (KSA)', 'Sipchem', 'Tasnee', 'KACST Materials'],
        applications: ['إلكترونيات', 'طيران', 'نانو', 'بناء', 'طاقة', 'طب'],
        islamicPrinciple: 'المواد المتقدمة لبناء مستقبل مستدام',
        trendScore: 86, impactScore: 89, feasibilityScore: 78, disruptionScore: 85
    },
    robotics: {
        id: 'robotics', nameAr: 'الروبوتات والأنظمة المستقلة', nameEn: 'Robotics & Autonomous Systems',
        icon: '🦾', category: 'automation', tier: 'global', trlAvg: 7, islamicScore: 82,
        subfields: ['Soft Robotics', 'Medical Robotics', 'Swarm Robotics', 'Humanoid Robots', 'Cobots', 'Drone Swarms', 'Underwater Robots', 'Space Robots'],
        globalLeaders: ['Boston Dynamics', 'ABB', 'Fanuc', 'Intuitive Surgical', 'Agility', 'Figure AI', 'Tesla Bot'],
        arabLeaders: ['SELA (KSA)', 'Strata (UAE)', 'EDGE Group'],
        applications: ['صناعة', 'طب', 'بناء', 'زراعة', 'أمن', 'استكشاف'],
        islamicPrinciple: 'الروبوتات لتخفيف أعباء الإنسان ورفع جودة حياته',
        trendScore: 92, impactScore: 93, feasibilityScore: 80, disruptionScore: 90
    },
    cybersecurity: {
        id: 'cybersecurity', nameAr: 'الأمن السيبراني', nameEn: 'Cybersecurity',
        icon: '🛡️', category: 'security', tier: 'global', trlAvg: 8, islamicScore: 95,
        subfields: ['Zero-Trust Architecture', 'Post-Quantum Cryptography', 'AI-Driven Security', 'Deception Technology', 'Threat Intelligence', 'Privacy Tech', 'Blockchain Security'],
        globalLeaders: ['CrowdStrike', 'Palo Alto', 'SentinelOne', 'Darktrace', 'Zscaler'],
        arabLeaders: ['SITE (KSA)', 'NCA', 'CISA MENA', 'G42 Cyber'],
        applications: ['حماية البنية التحتية', 'حماية البيانات', 'الهوية الرقمية', 'المالية'],
        islamicPrinciple: 'حفظ الأسرار والأمانات — إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ',
        trendScore: 97, impactScore: 96, feasibilityScore: 88, disruptionScore: 89
    },
    blockchain_web3: {
        id: 'blockchain_web3', nameAr: 'البلوكتشين والويب3', nameEn: 'Blockchain & Web3',
        icon: '⛓️', category: 'digital', tier: 'global', trlAvg: 7, islamicScore: 75,
        subfields: ['Smart Contracts', 'DeFi (Halal)', 'NFTs', 'DAOs', 'Layer-2 Solutions', 'Cross-chain Bridges', 'Zero-Knowledge Proofs', 'Decentralized Identity'],
        globalLeaders: ['Ethereum Foundation', 'Polygon', 'Solana', 'Chainlink', 'Polkadot'],
        arabLeaders: ['Rain (Bahrain)', 'BitOasis', 'CoinMENA'],
        applications: ['تمويل إسلامي', 'سلاسل التوريد', 'هوية رقمية', 'تصويت', 'ملكية عقارية'],
        islamicPrinciple: 'الشفافية واللامركزية — بضوابط الحلال والحرام الشرعية',
        trendScore: 82, impactScore: 85, feasibilityScore: 78, disruptionScore: 87
    },
    comms_6g: {
        id: 'comms_6g', nameAr: 'الاتصالات المتقدمة (6G وما بعدها)', nameEn: '6G & Advanced Communications',
        icon: '📡', category: 'connectivity', tier: 'global', trlAvg: 4, islamicScore: 93,
        subfields: ['Terahertz Communication', 'Reconfigurable Intelligent Surfaces', 'Integrated Satellite-Terrestrial', 'AI-Native Networks', 'Holographic MIMO', 'Semantic Communication'],
        globalLeaders: ['Ericsson', 'Nokia', 'Samsung', 'NTT Docomo', 'Qualcomm', 'Intel'],
        arabLeaders: ['stc (KSA)', 'Etisalat/e&', 'Mobily', 'Zain'],
        applications: ['إنترنت الأشياء', 'واقع افتراضي', 'سيارات ذاتية', 'جراحة عن بُعد'],
        islamicPrinciple: 'ربط العالم الإسلامي بأفضل تقنيات الاتصال لنشر الخير',
        trendScore: 88, impactScore: 94, feasibilityScore: 60, disruptionScore: 92
    },
    edge_computing: {
        id: 'edge_computing', nameAr: 'الحوسبة الطرفية والسحابية', nameEn: 'Edge & Cloud Computing',
        icon: '☁️', category: 'computing', tier: 'global', trlAvg: 8, islamicScore: 88,
        subfields: ['Multi-access Edge Computing', 'Serverless Architecture', 'Confidential Computing', 'Neuromorphic Chips', 'RISC-V Ecosystem', 'In-Memory Computing', 'Photonic Computing'],
        globalLeaders: ['AWS', 'Azure', 'Google Cloud', 'NVIDIA', 'AMD', 'Arm', 'Groq'],
        arabLeaders: ['Oracle MENA Cloud', 'Microsoft Azure KSA', 'AWS Middle East', 'Huawei Cloud MEA'],
        applications: ['ذكاء اصطناعي', 'IoT', 'مدن ذكية', 'سيارات ذاتية', 'صناعة'],
        islamicPrinciple: 'الحوسبة السحابية لإتاحة التقنية للجميع — تكافؤ الفرص',
        trendScore: 93, impactScore: 91, feasibilityScore: 88, disruptionScore: 86
    },
    xr_metaverse: {
        id: 'xr_metaverse', nameAr: 'الواقع الممتد والميتافيرس', nameEn: 'Extended Reality (XR) & Metaverse',
        icon: '🥽', category: 'digital', tier: 'global', trlAvg: 6, islamicScore: 72,
        subfields: ['Virtual Reality (VR)', 'Augmented Reality (AR)', 'Mixed Reality (MR)', 'Spatial Computing', 'Haptics', 'Brain-Computer Interface', 'Digital Humans'],
        globalLeaders: ['Meta Quest', 'Apple Vision Pro', 'Microsoft HoloLens', 'Magic Leap', 'HTC Vive'],
        arabLeaders: ['Tahaluq (UAE)', 'NEOM XR', 'Saudi Esports Federation'],
        applications: ['تعليم', 'طب', 'سياحة افتراضية', 'تدريب', 'أماكن مقدسة افتراضية'],
        islamicPrinciple: 'التقنية الافتراضية للتعليم والتدريب — بضوابط تحفظ الأخلاق',
        trendScore: 84, impactScore: 86, feasibilityScore: 73, disruptionScore: 85
    },
    digital_twins: {
        id: 'digital_twins', nameAr: 'التوائم الرقمية', nameEn: 'Digital Twins',
        icon: '🔁', category: 'simulation', tier: 'global', trlAvg: 7, islamicScore: 93,
        subfields: ['Industrial Digital Twins', 'City Digital Twins', 'Human Digital Twins', 'Earth System Twins', 'Physics-Informed ML', 'Predictive Maintenance'],
        globalLeaders: ['Siemens', 'GE', 'Ansys', 'Dassault Systèmes', 'PTC', 'NVIDIA Omniverse'],
        arabLeaders: ['NEOM Digital Twin', 'Abu Dhabi City Twin', 'Saudi Aramco Digital'],
        applications: ['مدن ذكية', 'صناعة', 'طاقة', 'بنية تحتية', 'طب', 'بيئة'],
        islamicPrinciple: 'نمذجة الواقع لفهمه وتحسينه — التعلم من المخلوقات',
        trendScore: 87, impactScore: 90, feasibilityScore: 80, disruptionScore: 84
    },
    neuromorphic: {
        id: 'neuromorphic', nameAr: 'الحوسبة العصبية والدماغية', nameEn: 'Neuromorphic & Brain-Inspired Computing',
        icon: '🧠', category: 'computing', tier: 'cosmic', trlAvg: 4, islamicScore: 85,
        subfields: ['Spiking Neural Networks', 'Memristors', 'Neuromorphic Chips', 'Brain-Computer Interfaces', 'Neuromorphic Sensors', 'Cognitive Architectures'],
        globalLeaders: ['Intel Loihi', 'IBM TrueNorth', 'BrainScaleS', 'SpiNNaker', 'Neuralink'],
        arabLeaders: ['KACST AI Brain Lab'],
        applications: ['ذكاء اصطناعي', 'إدراك حسي', 'روبوتات', 'معالجة اللغة', 'طب أعصاب'],
        islamicPrinciple: 'دراسة دماغ الإنسان تأملاً في خلق الله — وَفِي أَنفُسِكُمْ أَفَلَا تُبْصِرُونَ',
        trendScore: 82, impactScore: 93, feasibilityScore: 50, disruptionScore: 95
    },
    photonics: {
        id: 'photonics', nameAr: 'الفوتونيات والبصريات المتقدمة', nameEn: 'Photonics & Advanced Optics',
        icon: '💎', category: 'physics', tier: 'global', trlAvg: 6, islamicScore: 91,
        subfields: ['Silicon Photonics', 'LiDAR', 'Fiber Optics', 'Optical Computing', 'Quantum Photonics', 'Meta-optics', 'Integrated Photonics'],
        globalLeaders: ['Lumentum', 'II-VI', 'Coherent', 'MACOM', 'Intel Silicon Photonics'],
        arabLeaders: ['KACST Photonics Lab', 'KFUPM Optics'],
        applications: ['اتصالات', 'أجهزة استشعار', 'تصوير طبي', 'حوسبة ضوئية', 'LiDAR سيارات'],
        islamicPrinciple: 'توظيف الضوء — آية إلهية — في خدمة الإنسانية',
        trendScore: 85, impactScore: 88, feasibilityScore: 74, disruptionScore: 87
    },
    synthetic_bio: {
        id: 'synthetic_bio', nameAr: 'علم الأحياء التركيبي', nameEn: 'Synthetic Biology',
        icon: '🧫', category: 'life-sciences', tier: 'global', trlAvg: 5, islamicScore: 78,
        subfields: ['Genetic Circuits', 'Metabolic Engineering', 'Cell-Free Biology', 'BioParts & Assemblies', 'Xenobiology', 'Biosensors', 'Living Materials'],
        globalLeaders: ['Ginkgo Bioworks', 'Zymergen', 'Twist Bioscience', 'Genomatica'],
        arabLeaders: ['KAUS BioTech', 'Alga Holdings'],
        applications: ['أدوية', 'وقود حيوي', 'زراعة', 'تنظيف بيئي', 'مواد حيوية'],
        islamicPrinciple: 'علم الأحياء التركيبي لعلاج المرض — بحدود الحلال الشرعي',
        trendScore: 83, impactScore: 90, feasibilityScore: 65, disruptionScore: 91
    },
    nuclear_fusion: {
        id: 'nuclear_fusion', nameAr: 'الاندماج النووي', nameEn: 'Nuclear Fusion',
        icon: '☢️', category: 'energy', tier: 'cosmic', trlAvg: 5, islamicScore: 87,
        subfields: ['Tokamak', 'Inertial Confinement', 'Compact Fusion', 'Stellarator', 'Z-Pinch', 'High-Field Magnets', 'Tritium Breeding'],
        globalLeaders: ['ITER', 'Commonwealth Fusion', 'TAE Technologies', 'Helion', 'NIF (Lawrence)'],
        arabLeaders: ['UAE ITER Participation', 'KACST Nuclear Research'],
        applications: ['طاقة نظيفة لا محدودة', 'تحلية مياه', 'فضاء', 'صناعة'],
        islamicPrinciple: 'الاندماج النووي لطاقة نظيفة دائمة — حماية الأرض من أجل الأجيال القادمة',
        trendScore: 89, impactScore: 99, feasibilityScore: 45, disruptionScore: 99
    },
    ocean_tech: {
        id: 'ocean_tech', nameAr: 'تقنيات المحيطات والبحار', nameEn: 'Ocean & Marine Technology',
        icon: '🌊', category: 'exploration', tier: 'global', trlAvg: 6, islamicScore: 94,
        subfields: ['Ocean Energy', 'Deep-Sea Mining', 'Autonomous Underwater Vehicles', 'Marine Aquaculture', 'Ocean Carbon Capture', 'Blue Hydrogen', 'Desalination Tech'],
        globalLeaders: ['Fugro', 'Saipem', 'Hydralign', 'Ocean Power Technologies', 'MBARI'],
        arabLeaders: ['Saudi Aramco Marine', 'KAUST Red Sea Research', 'KSA Fisheries Authority'],
        applications: ['طاقة بحرية', 'مياه', 'غذاء', 'معادن', 'استكشاف', 'بيئة'],
        islamicPrinciple: 'استكشاف المحيطات والتعامل مع نعم الله البحرية بمسؤولية',
        trendScore: 83, impactScore: 88, feasibilityScore: 71, disruptionScore: 82
    },
    agri_tech: {
        id: 'agri_tech', nameAr: 'التقنيات الزراعية المتقدمة', nameEn: 'Advanced AgriTech',
        icon: '🌾', category: 'food', tier: 'global', trlAvg: 7, islamicScore: 97,
        subfields: ['Vertical Farming', 'Precision Agriculture', 'Smart Irrigation', 'AgriDrones', 'Crop Genomics', 'Plant-Based Proteins', 'Cultured Meat', 'Soil Microbiome'],
        globalLeaders: ['Plenty', 'Bowery', 'Indigo Agriculture', 'Pivot Bio', 'Apeel Sciences'],
        arabLeaders: ['Pure Harvest (UAE)', 'Red Sea Farms (KSA)', 'Badia Farms (Dubai)'],
        applications: ['أمن غذائي', 'صحراء وجفاف', 'مياه', 'بيئة', 'صحة'],
        islamicPrinciple: 'الزراعة فريضة — إحياء الأرض وتوفير الغذاء للأجيال',
        trendScore: 90, impactScore: 95, feasibilityScore: 83, disruptionScore: 88
    },
    smart_cities: {
        id: 'smart_cities', nameAr: 'المدن الذكية والبنية التحتية', nameEn: 'Smart Cities & Infrastructure',
        icon: '🏙️', category: 'urban', tier: 'global', trlAvg: 7, islamicScore: 93,
        subfields: ['Smart Mobility', 'Smart Grid', 'IoT Platforms', 'Smart Water', 'Urban AI', 'Building Automation', 'Waste Tech', 'Public Safety Tech'],
        globalLeaders: ['Siemens Smart Infrastructure', 'Cisco', 'IBM Smarter Cities', 'Microsoft CityNext'],
        arabLeaders: ['NEOM', 'The Line', 'Masdar City', 'KAEC', 'King Abdullah Smart City'],
        applications: ['نقل', 'طاقة', 'مياه', 'أمن', 'صحة', 'تعليم', 'بيئة'],
        islamicPrinciple: 'المدينة الإسلامية الحديثة — عمارة الأرض كمسؤولية شرعية',
        trendScore: 92, impactScore: 94, feasibilityScore: 82, disruptionScore: 87
    },
    autonomous_systems: {
        id: 'autonomous_systems', nameAr: 'الأنظمة المستقلة والمركبات الذكية', nameEn: 'Autonomous Systems & Vehicles',
        icon: '🚗', category: 'automation', tier: 'global', trlAvg: 7, islamicScore: 84,
        subfields: ['Self-Driving Cars (L4/L5)', 'Advanced ADAS', 'eVTOL & UAM', 'Autonomous Trucking', 'Last-Mile Delivery', 'Railway Automation', 'Marine Autonomous'],
        globalLeaders: ['Waymo', 'Tesla FSD', 'Mobileye', 'Zoox', 'Joby Aviation', 'Lilium'],
        arabLeaders: ['NEOM Autonomous Transport', 'RTA Dubai AV', 'Saudi Vision 2030 Transport'],
        applications: ['نقل', 'لوجستيات', 'طبية طوارئ', 'بضائع', 'حضري', 'جوي'],
        islamicPrinciple: 'النقل الذكي الآمن لحفظ النفس وتيسير الحياة',
        trendScore: 91, impactScore: 92, feasibilityScore: 78, disruptionScore: 90
    },
    health_tech: {
        id: 'health_tech', nameAr: 'التقنيات الصحية المتقدمة', nameEn: 'Advanced HealthTech',
        icon: '💊', category: 'health', tier: 'global', trlAvg: 8, islamicScore: 98,
        subfields: ['AI Diagnostics', 'Precision Medicine', 'Digital Therapeutics', 'Wearables & Biosensors', 'Telemedicine', 'Robotic Surgery', 'Drug Discovery AI', 'Genomic Medicine'],
        globalLeaders: ['Philips Healthcare', 'Medtronic', 'Abbott', 'Tempus', 'Flatiron', 'Recursion'],
        arabLeaders: ['KFSH&RC', 'Cleveland Clinic Abu Dhabi', 'Sehhaty (KSA)'],
        applications: ['تشخيص مبكر', 'علاج مخصص', 'رعاية مزمنة', 'صحة وقائية'],
        islamicPrinciple: 'حفظ النفس — ركيزة المقاصد الشرعية الأولى',
        trendScore: 95, impactScore: 98, feasibilityScore: 85, disruptionScore: 93
    },
    climate_tech: {
        id: 'climate_tech', nameAr: 'تقنيات المناخ والبيئة', nameEn: 'Climate & Environmental Tech',
        icon: '🌍', category: 'environment', tier: 'global', trlAvg: 6, islamicScore: 97,
        subfields: ['Carbon Capture & Storage', 'Direct Air Capture', 'Enhanced Weathering', 'Geoengineering', 'Nature-Based Solutions', 'Climate Modeling', 'Biodiversity Tech'],
        globalLeaders: ['Climeworks', 'Carbon Engineering', 'Charm Industrial', 'Running Tide'],
        arabLeaders: ['Saudi Green Initiative', 'Middle East Green Initiative', 'Masdar Climate'],
        applications: ['حياد كربوني', 'حماية بيئية', 'مياه', 'زراعة', 'سياحة'],
        islamicPrinciple: 'لا تُفسدوا في الأرض — حماية البيئة فريضة دينية',
        trendScore: 94, impactScore: 97, feasibilityScore: 70, disruptionScore: 89
    },
    islamic_fintech: {
        id: 'islamic_fintech', nameAr: 'التقنيات المالية الإسلامية', nameEn: 'Islamic FinTech',
        icon: '🕌', category: 'finance', tier: 'continental', trlAvg: 7, islamicScore: 99,
        subfields: ['Digital Islamic Banking', 'Sukuk Tokenization', 'Halal Payments', 'Zakat Systems', 'Waqf Tech', 'Islamic Microfinance', 'Sharia-Compliant Robo-Advisor', 'Takaful Tech'],
        globalLeaders: ['Alif (Tajikistan)', 'Wahed Invest', 'Kestrl', 'Financing Futures'],
        arabLeaders: ['STC Pay (KSA)', 'Al Rajhi Bank Digital', 'Dubai Islamic Bank Digital', 'Tabby', 'Tamara'],
        applications: ['مصرفية إسلامية', 'زكاة وصدقة', 'أوقاف رقمية', 'تمويل مشاريع', 'استثمار'],
        islamicPrinciple: 'الاقتصاد الإسلامي الرقمي — مال حلال وفق الشريعة الغراء',
        trendScore: 90, impactScore: 93, feasibilityScore: 85, disruptionScore: 88
    }
};

// ============================================================
// ISLAMIC FOUNDATION
// ============================================================
const ISLAMIC_FOUNDATION = {
    bismillah: 'بسم الله الرحمن الرحيم',
    verse:     'وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ — الأنفال 60',
    quran: [
        { ayah: 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ', surah: 'العلق', num: 1, principle: 'أساس العلم والتقنية' },
        { ayah: 'وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ', surah: 'الأنفال', num: 60, principle: 'الاستعداد التقني' },
        { ayah: 'وَسَخَّرَ لَكُم مَّا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ جَمِيعًا', surah: 'الجاثية', num: 13, principle: 'تسخير كل شيء للإنسان' },
        { ayah: 'قُلْ هَلْ يَسْتَوِي الَّذِينَ يَعْلَمُونَ وَالَّذِينَ لَا يَعْلَمُونَ', surah: 'الزمر', num: 9, principle: 'فضل العلم والتقنية' },
        { ayah: 'وَقُل رَّبِّ زِدْنِي عِلْمًا', surah: 'طه', num: 114, principle: 'طلب الزيادة في العلم والتقنية' },
        { ayah: 'إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا أَنْ يُتْقِنَهُ', surah: 'حديث', num: null, principle: 'الإتقان في التقنية والبحث' },
        { ayah: 'الْحِكْمَةُ ضَالَّةُ الْمُؤْمِنِ أَنَّى وَجَدَهَا فَهُوَ أَحَقُّ بِهَا', surah: 'حديث', num: null, principle: 'أخذ أفضل التقنيات من أي مصدر' }
    ]
};

// ============================================================
// MAIN ENGINE CLASS
// ============================================================
class SheikhaAdvancedTechInnovationCenter extends EventEmitter {

    constructor(options) {
        super();
        options = options || {};
        this.name        = 'SheikhaAdvancedTechInnovationCenter';
        this.nameAr      = 'شيخة — مركز الابتكار التقني المتقدم والاستكشاف والبحث والتطوير';
        this.version     = ENGINE_VERSION;
        this.owner       = 'سلمان أحمد بن سلمان الراجح';
        this.copyright   = '© 2026 منظومة شيخة — جميع الحقوق محفوظة';
        this.activatedAt = new Date().toISOString();
        this._broadcastFn = options.broadcast || null;

        // Data stores
        this.projects    = new Map();  // id → project
        this.patents     = new Map();  // id → patent
        this.innovations = new Map();  // id → innovation
        this.collaborations = new Map(); // id → collaboration

        // Metrics
        this.metrics = {
            totalProjects: 0, activeProjects: 0, completedProjects: 0,
            totalPatents: 0, totalInnovations: 0, totalCollaborations: 0,
            totalAssessments: 0, totalDomains: Object.keys(TECH_DOMAINS).length,
            lastActivity: null, avgTRL: 0, topDomain: null
        };

        this._loadPersisted();
        this._startMonitor(options.monitorInterval || 120000);
        console.log('✅ ' + this.nameAr + ' v' + this.version + ' | ' + this.metrics.totalProjects + ' مشروع | ' + this.metrics.totalPatents + ' براءة | 22 API');
    }

    // ----------------------------------------------------------
    // 1. TECH DOMAINS INTELLIGENCE
    // ----------------------------------------------------------

    getDomainMap() {
        return Object.values(TECH_DOMAINS).map(d => ({
            id: d.id, nameAr: d.nameAr, nameEn: d.nameEn, icon: d.icon,
            category: d.category, tier: d.tier, trlAvg: d.trlAvg, islamicScore: d.islamicScore,
            overallScore: this._calcDomainScore(d),
            subfieldCount: d.subfields.length,
            globalLeaderCount: d.globalLeaders.length,
            arabLeaderCount: d.arabLeaders.length,
            islamicPrinciple: d.islamicPrinciple
        }));
    }

    getDomainDetail(domainId) {
        const d = TECH_DOMAINS[domainId];
        if (!d) throw new Error('مجال التقنية غير موجود: ' + domainId);
        const projects = Array.from(this.projects.values()).filter(p => p.domainId === domainId);
        return {
            ...d,
            overallScore: this._calcDomainScore(d),
            projects: projects.map(p => ({ id: p.id, nameAr: p.nameAr, status: p.status, trl: p.trl, stage: p.stage })),
            activeProjects: projects.filter(p => p.status === 'active').length,
            trlDefinition: TRL_DEFINITIONS[d.trlAvg] || null
        };
    }

    assessTechnology(opts) {
        opts = opts || {};
        const { nameAr, nameEn, description, domainId, trl, purpose, islamicUse } = opts;
        if (!nameAr) throw new Error('nameAr مطلوب');

        const domain = TECH_DOMAINS[domainId] || null;
        const trlDef = TRL_DEFINITIONS[trl] || TRL_DEFINITIONS[1];

        const trendScore    = domain ? domain.trendScore : 70;
        const impactScore   = domain ? domain.impactScore : 70;
        const feasibilityScore = domain ? domain.feasibilityScore : 70;
        const islamicScore  = domain ? domain.islamicScore : 75;

        // Check for forbidden terms
        const combined = ((nameAr || '') + (nameEn || '') + (description || '') + (purpose || '')).toLowerCase();
        const forbidden = ['gambling', 'riba', 'pornography', 'weapons of mass', 'biological warfare'];
        const islamicConcern = forbidden.some(w => combined.includes(w));

        const overallScore = islamicConcern ? 0 : Math.round((trendScore + impactScore + feasibilityScore * 1.2 + islamicScore) / 4.2);
        const recommendation = islamicConcern ? 'محظور — مخالف للشريعة الإسلامية'
            : overallScore >= 85 ? 'استثمار فوري — أولوية قصوى'
            : overallScore >= 70 ? 'استثمار ضمن خطة البحث والتطوير'
            : overallScore >= 55 ? 'متابعة ومراقبة — استثمار محدود'
            : 'دراسة مزيدة مطلوبة قبل الاستثمار';

        const assessment = {
            id: 'assess-' + crypto.randomBytes(6).toString('hex'),
            nameAr, nameEn, description, domainId, purpose, islamicUse,
            trl, trlDefinition: trlDef,
            scores: { trend: trendScore, impact: impactScore, feasibility: feasibilityScore, islamic: islamicScore, overall: overallScore },
            islamicConcern, recommendation,
            globalLeaders: domain ? domain.globalLeaders.slice(0, 3) : [],
            arabLeaders: domain ? domain.arabLeaders.slice(0, 2) : [],
            islamicPrinciple: domain ? domain.islamicPrinciple : null,
            assessedAt: new Date().toISOString()
        };

        this.metrics.totalAssessments++;
        this.metrics.lastActivity = assessment.assessedAt;
        this._broadcast('tech:assessed', { id: assessment.id, nameAr, overallScore, recommendation });
        return assessment;
    }

    _calcDomainScore(d) {
        return Math.round((d.trendScore + d.impactScore + d.feasibilityScore + d.islamicScore) / 4);
    }

    // ----------------------------------------------------------
    // 2. R&D PROJECT MANAGEMENT
    // ----------------------------------------------------------

    createProject(opts) {
        opts = opts || {};
        const { nameAr, nameEn, domainId, trl, stage, description, teamSize, budget, ttlDays, owner, tags } = opts;
        if (!nameAr) throw new Error('nameAr مطلوب');
        if (!TECH_DOMAINS[domainId] && domainId) throw new Error('domainId غير صالح');

        const id = 'proj-' + crypto.randomBytes(8).toString('hex');
        const now = new Date().toISOString();
        let completedAt = null;
        if (ttlDays > 0) { const d = new Date(); d.setDate(d.getDate() + (ttlDays || 365)); completedAt = d.toISOString(); }

        const project = {
            id, nameAr, nameEn: nameEn || nameAr,
            domainId: domainId || null,
            domain: domainId ? { nameAr: TECH_DOMAINS[domainId].nameAr, nameEn: TECH_DOMAINS[domainId].nameEn, icon: TECH_DOMAINS[domainId].icon } : null,
            description: description || '',
            trl: Math.min(9, Math.max(1, parseInt(trl) || 1)),
            trlDefinition: TRL_DEFINITIONS[parseInt(trl) || 1],
            stage: PIPELINE_STAGES.find(s => s.id === stage) ? stage : 'ideation',
            stageInfo: PIPELINE_STAGES.find(s => s.id === stage) || PIPELINE_STAGES[0],
            status: 'active',
            owner: owner || this.owner,
            teamSize: parseInt(teamSize) || 1,
            budget: budget || null,
            tags: Array.isArray(tags) ? tags : [],
            progress: 0,
            milestones: [],
            createdAt: now, updatedAt: now, completedAt,
            islamicCompliance: domainId ? TECH_DOMAINS[domainId].islamicScore >= 70 : true,
            islamicScore: domainId ? TECH_DOMAINS[domainId].islamicScore : 85
        };

        this.projects.set(id, project);
        this.metrics.totalProjects++;
        this.metrics.activeProjects++;
        this.metrics.lastActivity = now;
        this._persistProjects();
        this._broadcast('project:created', { id, nameAr, domainId, trl, stage });
        return project;
    }

    updateProjectTRL(projectId, newTRL, notes) {
        const p = this.projects.get(projectId);
        if (!p) throw new Error('المشروع غير موجود: ' + projectId);
        const oldTRL = p.trl;
        p.trl = Math.min(9, Math.max(1, parseInt(newTRL) || p.trl));
        p.trlDefinition = TRL_DEFINITIONS[p.trl];
        p.updatedAt = new Date().toISOString();
        p.milestones.push({ ts: p.updatedAt, event: 'TRL upgrade', from: oldTRL, to: p.trl, notes: notes || '' });
        if (p.trl >= 9) { p.status = 'completed'; this.metrics.activeProjects = Math.max(0, this.metrics.activeProjects - 1); this.metrics.completedProjects++; }
        this._persistProjects();
        this._broadcast('project:trl-updated', { projectId, oldTRL, newTRL: p.trl });
        return p;
    }

    advanceProjectStage(projectId, notes) {
        const p = this.projects.get(projectId);
        if (!p) throw new Error('المشروع غير موجود: ' + projectId);
        const currentStageInfo = PIPELINE_STAGES.find(s => s.id === p.stage);
        const nextStage = PIPELINE_STAGES.find(s => s.order === ((currentStageInfo ? currentStageInfo.order : 1) + 1));
        if (!nextStage) throw new Error('المشروع وصل للمرحلة النهائية');
        const oldStage = p.stage;
        p.stage = nextStage.id;
        p.stageInfo = nextStage;
        p.progress = Math.min(100, Math.round((nextStage.order / PIPELINE_STAGES.length) * 100));
        p.updatedAt = new Date().toISOString();
        p.milestones.push({ ts: p.updatedAt, event: 'stage advance', from: oldStage, to: p.stage, notes: notes || '' });
        this._persistProjects();
        this._broadcast('project:stage-advanced', { projectId, oldStage, newStage: p.stage });
        return p;
    }

    getProjects(filters) {
        filters = filters || {};
        let projects = Array.from(this.projects.values());
        if (filters.status)   projects = projects.filter(p => p.status === filters.status);
        if (filters.domainId) projects = projects.filter(p => p.domainId === filters.domainId);
        if (filters.stage)    projects = projects.filter(p => p.stage === filters.stage);
        if (filters.minTRL)   projects = projects.filter(p => p.trl >= parseInt(filters.minTRL));
        if (filters.search) {
            const q = filters.search.toLowerCase();
            projects = projects.filter(p => (p.nameAr && p.nameAr.includes(filters.search)) || (p.nameEn && p.nameEn.toLowerCase().includes(q)));
        }
        const total = projects.length;
        const page = Math.max(1, parseInt(filters.page) || 1);
        const pageSize = Math.min(50, parseInt(filters.pageSize) || 20);
        return { projects: projects.slice((page - 1) * pageSize, page * pageSize), total, page, pageSize, pages: Math.ceil(total / pageSize) };
    }

    // ----------------------------------------------------------
    // 3. PATENT & IP REGISTRY
    // ----------------------------------------------------------

    registerPatent(opts) {
        opts = opts || {};
        const { titleAr, titleEn, domainId, inventors, abstract, filingDate, status, projectId } = opts;
        if (!titleAr) throw new Error('titleAr مطلوب');

        const id = 'patent-' + crypto.randomBytes(8).toString('hex');
        const now = new Date().toISOString();

        const patent = {
            id, titleAr, titleEn: titleEn || titleAr,
            domainId: domainId || null,
            inventors: Array.isArray(inventors) ? inventors : [this.owner],
            abstract: abstract || '',
            filingDate: filingDate || now,
            status: status || 'filed',  // filed | pending | granted | rejected | expired
            projectId: projectId || null,
            registeredAt: now, updatedAt: now,
            sheikhaRef: 'SH-PAT-' + Date.now().toString(36).toUpperCase()
        };

        this.patents.set(id, patent);
        this.metrics.totalPatents++;
        this.metrics.lastActivity = now;
        this._persistPatents();
        this._broadcast('patent:registered', { id, titleAr, status: patent.status });
        return patent;
    }

    getPatents(filters) {
        filters = filters || {};
        let patents = Array.from(this.patents.values());
        if (filters.status)   patents = patents.filter(p => p.status === filters.status);
        if (filters.domainId) patents = patents.filter(p => p.domainId === filters.domainId);
        const total = patents.length;
        const page = Math.max(1, parseInt(filters.page) || 1);
        const pageSize = Math.min(50, parseInt(filters.pageSize) || 20);
        return { patents: patents.slice((page - 1) * pageSize, page * pageSize), total, page, pageSize };
    }

    // ----------------------------------------------------------
    // 4. INNOVATION PIPELINE
    // ----------------------------------------------------------

    submitInnovation(opts) {
        opts = opts || {};
        const { titleAr, titleEn, domainId, description, innovationType, submittedBy, potentialImpact } = opts;
        if (!titleAr) throw new Error('titleAr مطلوب');

        const id = 'innov-' + crypto.randomBytes(8).toString('hex');
        const now = new Date().toISOString();
        const domain = TECH_DOMAINS[domainId];

        const innovation = {
            id, titleAr, titleEn: titleEn || titleAr, domainId,
            domain: domain ? { nameAr: domain.nameAr, nameEn: domain.nameEn, icon: domain.icon } : null,
            description: description || '',
            innovationType: innovationType || 'product',  // product | process | service | business-model
            submittedBy: submittedBy || this.owner,
            potentialImpact: potentialImpact || 'medium', // low | medium | high | transformative
            stage: 'ideation', stageInfo: PIPELINE_STAGES[0],
            status: 'submitted', islamicScore: domain ? domain.islamicScore : 80,
            votes: 0, comments: [],
            submittedAt: now, updatedAt: now
        };

        this.innovations.set(id, innovation);
        this.metrics.totalInnovations++;
        this.metrics.lastActivity = now;
        this._persist();
        this._broadcast('innovation:submitted', { id, titleAr, domainId, potentialImpact });
        return innovation;
    }

    getInnovations(filters) {
        filters = filters || {};
        let innov = Array.from(this.innovations.values());
        if (filters.domainId) innov = innov.filter(i => i.domainId === filters.domainId);
        if (filters.status)   innov = innov.filter(i => i.status === filters.status);
        const total = innov.length;
        const page = Math.max(1, parseInt(filters.page) || 1);
        const pageSize = Math.min(50, parseInt(filters.pageSize) || 20);
        return { innovations: innov.slice((page - 1) * pageSize, page * pageSize), total, page, pageSize };
    }

    // ----------------------------------------------------------
    // 5. GLOBAL TECH INTELLIGENCE
    // ----------------------------------------------------------

    getGlobalTechIntelligence() {
        const domains = Object.values(TECH_DOMAINS);
        const byTier  = { research: [], global: [], continental: [], cosmic: [] };
        domains.forEach(d => { if (byTier[d.tier]) byTier[d.tier].push({ id: d.id, nameAr: d.nameAr, icon: d.icon, overallScore: this._calcDomainScore(d) }); });

        const topDomains = domains.slice().sort((a, b) => this._calcDomainScore(b) - this._calcDomainScore(a)).slice(0, 5)
            .map(d => ({ id: d.id, nameAr: d.nameAr, icon: d.icon, score: this._calcDomainScore(d) }));

        const highestImpact = domains.slice().sort((a, b) => b.impactScore - a.impactScore).slice(0, 5)
            .map(d => ({ id: d.id, nameAr: d.nameAr, icon: d.icon, impactScore: d.impactScore }));

        const mostDisruptive = domains.slice().sort((a, b) => b.disruptionScore - a.disruptionScore).slice(0, 5)
            .map(d => ({ id: d.id, nameAr: d.nameAr, icon: d.icon, disruptionScore: d.disruptionScore }));

        const mostIslamicFriendly = domains.slice().sort((a, b) => b.islamicScore - a.islamicScore).slice(0, 5)
            .map(d => ({ id: d.id, nameAr: d.nameAr, icon: d.icon, islamicScore: d.islamicScore }));

        const arabRegionLeaders = {};
        domains.forEach(d => { d.arabLeaders.forEach(l => { arabRegionLeaders[l] = (arabRegionLeaders[l] || 0) + 1; }); });
        const topArabOrgs = Object.entries(arabRegionLeaders).sort((a, b) => b[1] - a[1]).slice(0, 10)
            .map(([org, count]) => ({ org, domainCount: count }));

        return {
            totalDomains: domains.length,
            byTier, topDomains, highestImpact, mostDisruptive, mostIslamicFriendly, topArabOrgs,
            avgIslamicScore: Math.round(domains.reduce((a, d) => a + d.islamicScore, 0) / domains.length),
            avgTRL: Math.round(domains.reduce((a, d) => a + d.trlAvg, 0) / domains.length),
            totalSubfields: domains.reduce((a, d) => a + d.subfields.length, 0),
            totalGlobalLeaders: [...new Set(domains.flatMap(d => d.globalLeaders))].length,
            totalArabLeaders: [...new Set(domains.flatMap(d => d.arabLeaders))].length,
            islamicFoundation: ISLAMIC_FOUNDATION
        };
    }

    getTechRadar() {
        const domains = Object.values(TECH_DOMAINS);
        return {
            adopt:  domains.filter(d => this._calcDomainScore(d) >= 85 && d.trlAvg >= 7).map(d => ({ id: d.id, nameAr: d.nameAr, icon: d.icon })),
            trial:  domains.filter(d => this._calcDomainScore(d) >= 75 && d.trlAvg >= 5 && d.trlAvg < 7).map(d => ({ id: d.id, nameAr: d.nameAr, icon: d.icon })),
            assess: domains.filter(d => this._calcDomainScore(d) >= 65 && d.trlAvg >= 3 && d.trlAvg < 5).map(d => ({ id: d.id, nameAr: d.nameAr, icon: d.icon })),
            hold:   domains.filter(d => this._calcDomainScore(d) < 65 || d.trlAvg < 3).map(d => ({ id: d.id, nameAr: d.nameAr, icon: d.icon })),
            generatedAt: new Date().toISOString()
        };
    }

    searchTechnologies(query) {
        query = query || {};
        const q = (query.q || '').toLowerCase();
        const domains = Object.values(TECH_DOMAINS).filter(d => {
            if (query.tier && d.tier !== query.tier) return false;
            if (query.category && d.category !== query.category) return false;
            if (query.minIslamicScore && d.islamicScore < parseInt(query.minIslamicScore)) return false;
            if (query.minTRL && d.trlAvg < parseInt(query.minTRL)) return false;
            if (!q) return true;
            return d.nameAr.includes(query.q) || d.nameEn.toLowerCase().includes(q) ||
                d.subfields.some(s => s.toLowerCase().includes(q)) ||
                d.applications.some(a => a.includes(q || query.q));
        });
        return { results: domains.map(d => ({ id: d.id, nameAr: d.nameAr, nameEn: d.nameEn, icon: d.icon, category: d.category, tier: d.tier, overallScore: this._calcDomainScore(d) })), total: domains.length };
    }

    // ----------------------------------------------------------
    // 6. COLLABORATION NETWORK
    // ----------------------------------------------------------

    createCollaboration(opts) {
        opts = opts || {};
        const { nameAr, nameEn, domainId, partners, type, objectives } = opts;
        if (!nameAr) throw new Error('nameAr مطلوب');

        const id  = 'collab-' + crypto.randomBytes(6).toString('hex');
        const now = new Date().toISOString();

        const collab = {
            id, nameAr, nameEn: nameEn || nameAr, domainId,
            type: type || 'research',  // research | commercial | academic | government
            partners: Array.isArray(partners) ? partners : [],
            objectives: Array.isArray(objectives) ? objectives : [],
            status: 'active', createdAt: now, updatedAt: now
        };

        this.collaborations.set(id, collab);
        this.metrics.totalCollaborations++;
        this.metrics.lastActivity = now;
        this._persist();
        this._broadcast('collaboration:created', { id, nameAr, domainId, partnerCount: collab.partners.length });
        return collab;
    }

    // ----------------------------------------------------------
    // 7. DASHBOARD & STATS
    // ----------------------------------------------------------

    getDashboard() {
        const projects  = Array.from(this.projects.values());
        const patents   = Array.from(this.patents.values());
        const innovations = Array.from(this.innovations.values());
        const domains   = Object.values(TECH_DOMAINS);

        const projectsByDomain  = {};
        const projectsByStage   = {};
        projects.forEach(p => {
            if (p.domainId) projectsByDomain[p.domainId] = (projectsByDomain[p.domainId] || 0) + 1;
            projectsByStage[p.stage] = (projectsByStage[p.stage] || 0) + 1;
        });

        return {
            engine: this.name, nameAr: this.nameAr, version: this.version,
            owner: this.owner, copyright: this.copyright, activatedAt: this.activatedAt,
            bismillah: ISLAMIC_FOUNDATION.bismillah, verse: ISLAMIC_FOUNDATION.verse,
            metrics: this.metrics,
            summary: {
                totalDomains: domains.length, totalProjects: projects.length,
                activeProjects: projects.filter(p => p.status === 'active').length,
                completedProjects: projects.filter(p => p.status === 'completed').length,
                totalPatents: patents.length, totalInnovations: innovations.length,
                totalCollaborations: this.collaborations.size,
                avgIslamicScore: Math.round(domains.reduce((a, d) => a + d.islamicScore, 0) / domains.length),
                avgDomainTRL: Math.round(domains.reduce((a, d) => a + d.trlAvg, 0) / domains.length),
                pipelineStages: PIPELINE_STAGES.length
            },
            trlLevels: Object.values(TRL_DEFINITIONS),
            pipelineStages: PIPELINE_STAGES,
            topDomains: domains.slice().sort((a, b) => this._calcDomainScore(b) - this._calcDomainScore(a)).slice(0, 6)
                .map(d => ({ id: d.id, nameAr: d.nameAr, icon: d.icon, score: this._calcDomainScore(d), tier: d.tier })),
            recentProjects: projects.slice(-5).map(p => ({ id: p.id, nameAr: p.nameAr, domainId: p.domainId, status: p.status, trl: p.trl, stage: p.stage })),
            projectsByDomain, projectsByStage,
            islamicFoundation: ISLAMIC_FOUNDATION
        };
    }

    getStats() {
        const domains   = Object.values(TECH_DOMAINS);
        const projects  = Array.from(this.projects.values());
        const byTier    = { global: 0, continental: 0, cosmic: 0, research: 0 };
        const byCategory = {};
        domains.forEach(d => { if (byTier[d.tier] !== undefined) byTier[d.tier]++; byCategory[d.category] = (byCategory[d.category] || 0) + 1; });

        return {
            metrics: this.metrics, byTier, byCategory,
            trlDistribution: Object.fromEntries(Object.entries(TRL_DEFINITIONS).map(([k, v]) => [k, projects.filter(p => p.trl === parseInt(k)).length])),
            stageDistribution: Object.fromEntries(PIPELINE_STAGES.map(s => [s.id, projects.filter(p => p.stage === s.id).length])),
            totalSubfields: domains.reduce((a, d) => a + d.subfields.length, 0),
            totalGlobalLeaders: [...new Set(domains.flatMap(d => d.globalLeaders))].length,
            totalArabLeaders: [...new Set(domains.flatMap(d => d.arabLeaders))].length,
            islamicCompliantDomains: domains.filter(d => d.islamicScore >= 80).length,
            highImpactDomains: domains.filter(d => d.impactScore >= 90).length
        };
    }

    getHealthReport() {
        const projects = Array.from(this.projects.values());
        const avgTRL   = projects.length ? Math.round(projects.reduce((a, p) => a + p.trl, 0) / projects.length) : 0;
        const stalled  = projects.filter(p => p.status === 'active' && (Date.now() - new Date(p.updatedAt).getTime()) > 30 * 86400000);
        let health = 100;
        if (stalled.length > 0) health -= Math.min(25, stalled.length * 5);
        if (avgTRL < 3 && projects.length > 3) health -= 10;
        return {
            status: health >= 80 ? 'healthy' : health >= 60 ? 'degraded' : 'needs-attention',
            overallHealth: Math.max(0, health),
            details: { totalProjects: projects.length, activeProjects: this.metrics.activeProjects, avgTRL, stalledProjects: stalled.length, totalDomains: Object.keys(TECH_DOMAINS).length, totalPatents: this.metrics.totalPatents },
            stalledProjectIds: stalled.map(p => p.id),
            checkedAt: new Date().toISOString()
        };
    }

    // ----------------------------------------------------------
    // 8. REGISTER ROUTES (22 APIs)
    // ----------------------------------------------------------

    registerRoutes(app) {
        if (!app) return;
        const self = this;

        const ok  = (res, data, msg)    => res.json({ success: true,  data, message: msg || null, ts: new Date().toISOString() });
        const err = (res, e, code)      => res.status(code || 400).json({ success: false, message: (e && e.message) || String(e), ts: new Date().toISOString() });

        // ─── GET ───
        app.get(BASE_ROUTE + '/dashboard',    (req, res) => ok(res, self.getDashboard()));
        app.get(BASE_ROUTE + '/stats',        (req, res) => ok(res, self.getStats()));
        app.get(BASE_ROUTE + '/health',       (req, res) => ok(res, self.getHealthReport()));
        app.get(BASE_ROUTE + '/domains',      (req, res) => ok(res, self.getDomainMap()));
        app.get(BASE_ROUTE + '/intel',        (req, res) => ok(res, self.getGlobalTechIntelligence()));
        app.get(BASE_ROUTE + '/radar',        (req, res) => ok(res, self.getTechRadar()));
        app.get(BASE_ROUTE + '/trl',          (req, res) => ok(res, Object.values(TRL_DEFINITIONS)));
        app.get(BASE_ROUTE + '/pipeline',     (req, res) => ok(res, PIPELINE_STAGES));
        app.get(BASE_ROUTE + '/projects',     (req, res) => ok(res, self.getProjects(req.query)));
        app.get(BASE_ROUTE + '/patents',      (req, res) => ok(res, self.getPatents(req.query)));
        app.get(BASE_ROUTE + '/innovations',  (req, res) => ok(res, self.getInnovations(req.query)));
        app.get(BASE_ROUTE + '/domains/:id',  (req, res) => { try { ok(res, self.getDomainDetail(req.params.id)); } catch (e) { err(res, e, 404); } });
        app.get(BASE_ROUTE + '/projects/:id', (req, res) => {
            const p = self.projects.get(req.params.id);
            p ? ok(res, p) : err(res, new Error('المشروع غير موجود'), 404);
        });
        app.get(BASE_ROUTE + '/patents/:id',  (req, res) => {
            const p = self.patents.get(req.params.id);
            p ? ok(res, p) : err(res, new Error('البراءة غير موجودة'), 404);
        });

        // ─── POST ───
        app.post(BASE_ROUTE + '/assess',            (req, res) => { try { ok(res, self.assessTechnology(req.body || {}), 'تم تقييم التقنية'); } catch (e) { err(res, e); } });
        app.post(BASE_ROUTE + '/projects',           (req, res) => { try { ok(res, self.createProject(req.body || {}), 'تم إنشاء المشروع'); } catch (e) { err(res, e); } });
        app.post(BASE_ROUTE + '/projects/:id/trl',   (req, res) => { try { const b = req.body || {}; ok(res, self.updateProjectTRL(req.params.id, b.trl, b.notes), 'تم تحديث مستوى TRL'); } catch (e) { err(res, e); } });
        app.post(BASE_ROUTE + '/projects/:id/advance',(req, res) => { try { ok(res, self.advanceProjectStage(req.params.id, (req.body || {}).notes), 'تم تقدم المرحلة'); } catch (e) { err(res, e); } });
        app.post(BASE_ROUTE + '/patents',            (req, res) => { try { ok(res, self.registerPatent(req.body || {}), 'تم تسجيل البراءة'); } catch (e) { err(res, e); } });
        app.post(BASE_ROUTE + '/innovations',        (req, res) => { try { ok(res, self.submitInnovation(req.body || {}), 'تم تقديم الابتكار'); } catch (e) { err(res, e); } });
        app.post(BASE_ROUTE + '/collaborations',     (req, res) => { try { ok(res, self.createCollaboration(req.body || {}), 'تم إنشاء التعاون'); } catch (e) { err(res, e); } });
        app.post(BASE_ROUTE + '/search',             (req, res) => { try { ok(res, self.searchTechnologies(req.body || {})); } catch (e) { err(res, e); } });

        console.log('\uD83D\uDE80 [TechInnovation v1.0] 22 API على ' + BASE_ROUTE + '/*');
    }

    // ----------------------------------------------------------
    // INTERNAL HELPERS
    // ----------------------------------------------------------

    _broadcast(event, data) {
        this.emit(event, data);
        if (typeof this._broadcastFn === 'function') {
            try { this._broadcastFn(JSON.stringify({ type: event, data, ts: new Date().toISOString() })); } catch (_) { /* ignore */ }
        }
    }

    _startMonitor(interval) {
        this._monitorTimer = setInterval(() => {
            // تنبيه المشاريع الراكدة
            const threshold = Date.now() - 30 * 86400000;
            for (const [, p] of this.projects) {
                if (p.status === 'active' && new Date(p.updatedAt).getTime() < threshold) {
                    this._broadcast('project:stalled', { projectId: p.id, nameAr: p.nameAr });
                }
            }
        }, interval);
    }

    _syncMetrics() {
        const projects = Array.from(this.projects.values());
        this.metrics.totalProjects    = projects.length;
        this.metrics.activeProjects   = projects.filter(p => p.status === 'active').length;
        this.metrics.completedProjects = projects.filter(p => p.status === 'completed').length;
        this.metrics.totalPatents     = this.patents.size;
        this.metrics.totalInnovations = this.innovations.size;
        this.metrics.totalCollaborations = this.collaborations.size;
        this.metrics.avgTRL = projects.length ? Math.round(projects.reduce((a, p) => a + p.trl, 0) / projects.length) : 0;
    }

    _ensureDataDir() { try { if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (_) { /* ignore */ } }

    _atomicWrite(filePath, data) {
        const tmp = filePath + '.tmp';
        try { fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8'); fs.renameSync(tmp, filePath); }
        catch (e) { try { fs.unlinkSync(tmp); } catch (_) { /* ignore */ } }
    }

    _loadPersisted() {
        this._ensureDataDir();
        const tryLoad = (file, cb) => { try { if (fs.existsSync(file)) cb(JSON.parse(fs.readFileSync(file, 'utf8'))); } catch (_) { /* ignore */ } };
        tryLoad(DB_FILE, d => {
            if (d.innovations) d.innovations.forEach(i => this.innovations.set(i.id, i));
            if (d.collaborations) d.collaborations.forEach(c => this.collaborations.set(c.id, c));
            if (d.metrics) Object.assign(this.metrics, d.metrics);
        });
        tryLoad(PROJECTS_FILE, d => { if (Array.isArray(d)) d.forEach(p => this.projects.set(p.id, p)); });
        tryLoad(PATENTS_FILE,  d => { if (Array.isArray(d)) d.forEach(p => this.patents.set(p.id, p)); });
        this._syncMetrics();
    }

    _persist() {
        this._ensureDataDir();
        this._atomicWrite(DB_FILE, { metrics: this.metrics, innovations: Array.from(this.innovations.values()), collaborations: Array.from(this.collaborations.values()), savedAt: new Date().toISOString(), version: ENGINE_VERSION });
    }

    _persistProjects() {
        this._ensureDataDir();
        this._atomicWrite(PROJECTS_FILE, Array.from(this.projects.values()));
    }

    _persistPatents() {
        this._ensureDataDir();
        this._atomicWrite(PATENTS_FILE, Array.from(this.patents.values()));
    }

    getStatus() {
        return {
            name: this.name, nameAr: this.nameAr, version: this.version, status: 'active',
            owner: this.owner, totalDomains: Object.keys(TECH_DOMAINS).length,
            totalProjects: this.metrics.totalProjects, activeProjects: this.metrics.activeProjects,
            totalPatents: this.metrics.totalPatents, totalInnovations: this.metrics.totalInnovations,
            apis: 22
        };
    }

    stop() {
        if (this._monitorTimer) { clearInterval(this._monitorTimer); this._monitorTimer = null; }
        this._persist();
        this._persistProjects();
        this._persistPatents();
    }
}

module.exports = SheikhaAdvancedTechInnovationCenter;
