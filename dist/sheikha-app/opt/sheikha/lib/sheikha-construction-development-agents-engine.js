/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ☪️ بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * SHEIKHA CONSTRUCTION & DEVELOPMENT PROJECT MANAGEMENT AGENTS ENGINE
 * محرك منظومة وكلاء إدارة المشاريع والبناء والتطوير الشامل
 *
 * المالك: سلمان أحمد بن سلمان الراجح
 *
 * "هُوَ أَنشَأَكُم مِّنَ الْأَرْضِ وَاسْتَعْمَرَكُمْ فِيهَا" — هود ٦١
 * "وَالَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ" — البقرة ٢٥
 * "قُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ وَرَسُولُهُ وَالْمُؤْمِنُونَ" — التوبة ١٠٥
 *
 * ══════════════════════════════════════════════════════════════════════════════
 * النظام الشامل لإدارة المشاريع والبناء والتطوير
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * @ الأهداف:
 *   ✅ عمارة الأرض — إصلاح وتطوير العمران
 *   ✅ الجودة والابتكار — أفضل المعايير العالمية مع الشريعة
 *   ✅ السلامة والأمان — حفظ الأرواح والممتلكات
 *   ✅ الكفاءة والاقتصاد — عدم إهدار الموارد
 *   ✅ الاستدامة — العمل بما ينفع الأجيال القادمة
 *   ✅ التطوير المنتظم — بحث وابتكار مستمر
 *   ✅ الإدارة المتقنة — تنسيق وتنظيم عالي
 *
 * @ المبادئ الشرعية:
 *   • لا ضرر ولا ضرار — السلامة أولاً
 *   • الأمانة — تحمل المسؤولية بصدق
 *   • العدالة — عدم الظلم والاستغلال
 *   • الجودة — الإتقان في العمل
 *   • العلم — البحث والدراسة الجادة
 *   • التعاون — العمل الجماعي والتنسيق
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use strict';

const fs = require('fs').promises;
const path = require('path');

// ══════════════════════════════════════════════════════════════════════════════
// 🏗️ فئات الوكلاء الأساسية
// ══════════════════════════════════════════════════════════════════════════════

const CONSTRUCTION_AGENTS = {
    // ══════════════════════════════════════════════════════════════════════════
    // المستوى الأول: المديرون والقادة (TOP-TIER EXECUTIVES)
    // ══════════════════════════════════════════════════════════════════════════

    PROJECT_GENERAL_MANAGER: {
        id: 'agent-project-general-manager',
        nameAr: 'مدير المشروع العام',
        nameEn: 'Project General Manager (PGM)',
        role: 'EXECUTIVE_LEADER',
        priority: 1,
        responsibilities: [
            'الإشراف الشامل على كل جوانب المشروع',
            'وضع استراتيجية المشروع والخطط الإجمالية',
            'إدارة الميزانية العامة والموارد',
            'التنسيق بين جميع الأقسام والفريقات',
            'اتخاذ القرارات الاستراتيجية الحرجة',
            'تقديم التقارير للمالك والمستثمرين',
            'تطوير الأداء والجودة المستمر',
            'معايير الامتثال والتدقيق'
        ],
        qualifications: [
            'PMP أو PRINCE2 أو ما يعادلهما',
            '15+ سنة في إدارة المشاريع الكبرى',
            'خبرة في المشاريع الإنشائية والتطويرية',
            'مهارات قيادية متقدمة',
            'فهم عميق للشريعة الإسلامية'
        ],
        kpis: [
            'إنجاز المشروع في الوقت',
            'التقيد بالميزانية',
            'نسبة الجودة والخلو من العيوب',
            'رضا أصحاب المصلحة',
            'مؤشر السلامة والحوادث'
        ]
    },

    // ══════════════════════════════════════════════════════════════════════════
    // المستوى الثاني: مديرو الأقسام الرئيسية
    // ══════════════════════════════════════════════════════════════════════════

    CONSTRUCTION_MANAGER: {
        id: 'agent-construction-manager',
        nameAr: 'مدير قسم البناء والتشييد',
        nameEn: 'Construction & Building Manager',
        role: 'DEPARTMENT_HEAD',
        priority: 2,
        responsibilities: [
            'الإشراف الكامل على جميع أعمال البناء',
            'إدارة فريق العمال والمقاولين',
            'مراقبة مطابقة العمل للمخططات الهندسية',
            'إدارة السلامة على الموقع',
            'تجهيز واستلام المواد والمعدات',
            'إعداد وتقديم التقارير اليومية والأسبوعية',
            'حل المشاكل والعوائق الفنية',
            'التنسيق مع المهندسين والفنيين'
        ],
        qualifications: [
            'درجة في الهندسة المدنية أو ما يعادلها',
            '12+ سنة في الإشراف على البناء',
            'خبرة في المشاريع الكبيرة',
            'شهادات السلامة الدولية',
            'إلمام بأنظمة البناء السعودية والدولية'
        ],
        subAgents: [
            'site-supervisor',
            'safety-officer-general',
            'equipment-manager',
            'material-coordinator',
            'quality-inspector-construction'
        ]
    },

    ENGINEERING_MANAGER: {
        id: 'agent-engineering-manager',
        nameAr: 'مدير الهندسة والتصميم',
        nameEn: 'Engineering & Design Manager',
        role: 'DEPARTMENT_HEAD',
        priority: 2,
        responsibilities: [
            'الإشراف على جميع الأعمال الهندسية',
            'إدارة فريق المهندسين والتصاميم',
            'التحقق من المخططات والتصاميم الهندسية',
            'الإشراف على الحسابات والتحليلات الهندسية',
            'ضمان التوافق مع الأكواد والمعايير الدولية',
            'توجيه المهندسين المتخصصين',
            'حل المشاكل الهندسية المعقدة',
            'تطوير الحلول الهندسية المبتكرة'
        ],
        qualifications: [
            'درجة دكتوراه أو ماجستير في الهندسة',
            '15+ سنة في الهندسة والتصميم',
            'خبرة في مشاريع معمارية كبيرة',
            'شهادات هندسية دولية (PE, CEng)',
            'برامج CAD و BIM احترافية'
        ],
        specializations: [
            'structural-engineering',
            'civil-engineering',
            'electrical-engineering',
            'mechanical-engineering',
            'architectural-design',
            'systems-engineering'
        ]
    },

    OPERATIONS_MANAGER: {
        id: 'agent-operations-manager',
        nameAr: 'مدير العمليات والتنسيق',
        nameEn: 'Operations & Coordination Manager',
        role: 'DEPARTMENT_HEAD',
        priority: 2,
        responsibilities: [
            'تنسيق جميع العمليات اليومية',
            'إدارة الموارد والمعدات',
            'تحسين الكفاءة والإنتاجية',
            'إدارة السلاسل اللوجستية',
            'التحكم في الجودة والمعايير',
            'إدارة التكاليف والميزانية التشغيلية',
            'تحسين العمليات المستمر',
            'إدارة المخاطر والأزمات'
        ],
        qualifications: [
            'درجة في إدارة الأعمال أو العمليات',
            '10+ سنة في إدارة العمليات',
            'خبرة في التصنيع أو البناء الكبير',
            'معرفة بأنظمة الجودة ISO',
            'مهارات تحليلية وحل المشاكل متقدمة'
        ],
        subAgents: [
            'supply-chain-coordinator',
            'logistics-administrator',
            'procurement-specialist',
            'inventory-manager',
            'performance-analyst'
        ]
    },

    // ══════════════════════════════════════════════════════════════════════════
    // المستوى الثالث: المشرفون المتخصصون
    // ══════════════════════════════════════════════════════════════════════════

    SUPERVISORS: {
        site_supervisor: {
            id: 'agent-site-supervisor',
            nameAr: 'مشرف الموقع الميداني',
            nameEn: 'Site Supervisor',
            role: 'SUPERVISOR',
            responsibilities: [
                'الإشراف المباشر على الموقع',
                'متابعة تقدم الأعمال اليومية',
                'ضمان أمان وسلامة الموقع',
                'إدارة العمال والحضور والغياب',
                'حل المشاكل بسرعة',
                'حفظ الأمن والسلام',
                'تنفيذ التعليمات الهندسية',
                'تجهيز التقارير اليومية'
            ]
        },

        structural_engineer_supervisor: {
            id: 'agent-structural-engineer-supervisor',
            nameAr: 'مشرف الهندسة الإنشائية',
            nameEn: 'Structural Engineering Supervisor',
            role: 'SUPERVISOR',
            responsibilities: [
                'الإشراف على أعمال الإنشاء',
                'التحقق من المخططات الإنشائية',
                'اختبار مقاومة المواد',
                'موافقة خرسانة وحديد التسليح',
                'التحقق من القوالب والدعامات',
                'حل المشاكل الإنشائية',
                'توثيق الاختبارات والقياسات'
            ]
        },

        electrical_supervisor: {
            id: 'agent-electrical-supervisor',
            nameAr: 'مشرف نظام الكهرباء',
            nameEn: 'Electrical Systems Supervisor',
            role: 'SUPERVISOR',
            responsibilities: [
                'الإشراف على تركيب الأنظمة الكهربائية',
                'التحقق من السلامة الكهربائية',
                'موافقة الأسلاك والقواطع والمحولات',
                'اختبار الأنظمة الكهربائية',
                'ضمان الامتثال للمعايير الدولية',
                'توثيق جميع الأعمال الكهربائية',
                'حل المشاكل الكهربائية'
            ]
        },

        mechanical_supervisor: {
            id: 'agent-mechanical-supervisor',
            nameAr: 'مشرف الأنظمة الميكانيكية',
            nameEn: 'Mechanical Systems Supervisor',
            role: 'SUPERVISOR',
            responsibilities: [
                'الإشراف على تركيب الأنظمة الميكانيكية',
                'موافقة وحدات التكييف والتدفئة',
                'الإشراف على مصادر الطاقة',
                'اختبار الأداء الميكانيكي',
                'ضمان الكفاءة والسلامة',
                'توثيق الأعمال الميكانيكية',
                'الصيانة الدورية والوقائية'
            ]
        },

        safety_officer: {
            id: 'agent-safety-officer-general',
            nameAr: 'مشرف السلامة والصحة المهنية',
            nameEn: 'Health & Safety Officer',
            role: 'SUPERVISOR',
            responsibilities: [
                'الإشراف على السلامة في الموقع',
                'فرض معايير السلامة الدولية',
                'التفتيش الدوري الشامل',
                'التحقيق في الحوادث والإصابات',
                'تدريب العمال على السلامة',
                'توفير معدات الحماية الشخصية',
                'إعداد خطط الطوارئ والإجلاء',
                'الاتصال بالجهات المختصة عند الحاجة'
            ]
        },

        quality_inspector: {
            id: 'agent-quality-inspector-construction',
            nameAr: 'مفتش الجودة والمواصفات',
            nameEn: 'Quality Inspector',
            role: 'SUPERVISOR',
            responsibilities: [
                'التفتيش على جودة الأعمال',
                'التحقق من المواصفات والمقاييس',
                'اختبار المواد والمنتجات',
                'توثيق نتائج الفحوصات',
                'اقتراح إجراءات التصحيح',
                'الامتثال للمعايير الدولية',
                'متابعة الانحرافات والتصحيحات'
            ]
        }
    },

    // ══════════════════════════════════════════════════════════════════════════
    // المستوى الرابع: المهندسون المتخصصون
    // ══════════════════════════════════════════════════════════════════════════

    ENGINEERS: {
        structural_engineer: {
            id: 'agent-structural-engineer-specialist',
            nameAr: 'مهندس الإنشاء والبناء',
            nameEn: 'Structural Engineer',
            role: 'SPECIALIST',
            specializations: [
                'تصميم الأساسات',
                'تصميم الأعمدة والجسور',
                'حساب الأحمال والإجهادات',
                'اختبار المقاومة',
                'اختيار المواد المناسبة',
                'معالجة المشاكل الهندسية'
            ]
        },

        civil_engineer: {
            id: 'agent-civil-engineer-specialist',
            nameAr: 'مهندس المدني والعام',
            nameEn: 'Civil Engineer',
            role: 'SPECIALIST',
            specializations: [
                'البنية التحتية',
                'الطرق والجسور والأنفاق',
                'نظم المياه والصرف',
                'الأرض والدراسات الجيوتقنية',
                'التخطيط والتصميم',
                'المسح والقياس'
            ]
        },

        electrical_engineer: {
            id: 'agent-electrical-engineer-specialist',
            nameAr: 'مهندس الكهرباء والقوى',
            nameEn: 'Electrical Engineer',
            role: 'SPECIALIST',
            specializations: [
                'تصميم أنظمة الكهرباء',
                'الإضاءة الكهربائية',
                'معدات التوزيع الكهربائي',
                'الأنظمة الذكية والتحكم',
                'الطاقة المتجددة',
                'السلامة الكهربائية'
            ]
        },

        mechanical_engineer: {
            id: 'agent-mechanical-engineer-specialist',
            nameAr: 'مهندس الميكانيكا والأنظمة',
            nameEn: 'Mechanical Engineer',
            role: 'SPECIALIST',
            specializations: [
                'نظم التكييف والتدفئة',
                'مصادر الطاقة',
                'الضواغط والمضخات',
                'نظم المراوح والتهوية',
                'الصيانة والتصليح',
                'كفاءة الطاقة'
            ]
        },

        hvac_engineer: {
            id: 'agent-hvac-engineer-specialist',
            nameAr: 'مهندس HVAC والتهوية',
            nameEn: 'HVAC Systems Engineer',
            role: 'SPECIALIST',
            specializations: [
                'تصميم نظم التكييف',
                'حساب الأحمال الحرارية',
                'اختيار المعدات',
                'التوزيع والقنوات',
                'الجودة الهوائية',
                'كفاءة الطاقة'
            ]
        },

        plumbing_engineer: {
            id: 'agent-plumbing-engineer-specialist',
            nameAr: 'مهندس السباكة والمياه',
            nameEn: 'Plumbing & Water Systems Engineer',
            role: 'SPECIALIST',
            specializations: [
                'نظم إمدادات المياه',
                'نظم الصرف الصحي',
                'معالجة المياه',
                'الحدادة والتوصيلات',
                'الحماية من التسريب',
                'المعايير الصحية'
            ]
        },

        architectural_engineer: {
            id: 'agent-architectural-engineer-specialist',
            nameAr: 'مهندس العمارة والتصميم',
            nameEn: 'Architect & Design Engineer',
            role: 'SPECIALIST',
            specializations: [
                'التصميم المعماري',
                'التصميم الداخلي',
                'الفن والجمال',
                'الأداء الوظيفي',
                'الاستدامة المعمارية',
                'تراث المعمار الإسلامي'
            ]
        },

        it_systems_engineer: {
            id: 'agent-it-systems-engineer-specialist',
            nameAr: 'مهندس الأنظمة والتقنية',
            nameEn: 'IT Systems & Technology Engineer',
            role: 'SPECIALIST',
            specializations: [
                'الأنظمة الذكية للعمارة',
                'أتمتة المتحكمات',
                'البنية التحتية لتقنية المعلومات',
                'أنظمة الأمان والمراقبة',
                'الشبكات والاتصالات',
                'تقنيات IoT'
            ]
        }
    },

    // ══════════════════════════════════════════════════════════════════════════
    // المستوى الخامس: الفنيون والعمال المتخصصون
    // ══════════════════════════════════════════════════════════════════════════

    TECHNICIANS_AND_WORKERS: {
        site_engineer_assistant: {
            id: 'agent-site-engineer-assistant',
            nameAr: 'مساعد المهندس في الموقع',
            nameEn: 'Site Engineer Assistant',
            role: 'TECHNICIAN',
            responsibilities: [
                'مساعدة المهندسين في الإشراف',
                'إجراء القياسات والاختبارات',
                'حفظ السجلات والمستندات',
                'توثيق التقدم اليومي',
                'التواصل بين الفريقات',
                'تنفيذ التعليمات الهندسية'
            ]
        },

        carpenter_master: {
            id: 'agent-carpenter-master',
            nameAr: 'رئيس النجارين',
            nameEn: 'Master Carpenter',
            role: 'TECHNICIAN',
            responsibilities: [
                'الإسراف على جميع أعمال النجارة',
                'تصميم القوالب والدعامات',
                'تدريب فريق النجارين',
                'ضمان جودة العمل',
                'إدارة مخزون المواد',
                'حل المشاكل الفنية'
            ]
        },

        electrician_master: {
            id: 'agent-electrician-master',
            nameAr: 'رئيس الكهربائيين',
            nameEn: 'Master Electrician',
            role: 'TECHNICIAN',
            responsibilities: [
                'الإشراف على تركيب الأنظمة الكهربائية',
                'توزيع وتنسيق العمال الكهربائيين',
                'التحقق من السلامة الكهربائية',
                'التدريب والتطوير',
                'حل المشاكل الكهربائية المعقدة',
                'الصيانة والتصليح'
            ]
        },

        plumber_master: {
            id: 'agent-plumber-master',
            nameAr: 'رئيس السباكين',
            nameEn: 'Master Plumber',
            role: 'TECHNICIAN',
            responsibilities: [
                'الإشراف على جميع أعمال السباكة',
                'التحقق من جودة الأنابيب والتوصيلات',
                'تدريب فريق السباكين',
                'حل مشاكل التسريب والانسداد',
                'إدارة مخزون الأنابيب والمعدات',
                'الامتثال للمعايير الصحية'
            ]
        },

        concrete_specialist: {
            id: 'agent-concrete-specialist',
            nameAr: 'متخصص الخرسانة والصب',
            nameEn: 'Concrete & Casting Specialist',
            role: 'TECHNICIAN',
            responsibilities: [
                'تحضير وصب الخرسانة',
                'فحص جودة الخرسانة',
                'معالجة ما بعد الصب',
                'استخدام معدات الصب الخاصة',
                'إجراء الاختبارات الميدانية',
                'الامتثال لمواصفات الخرسانة'
            ]
        },

        steel_worker_master: {
            id: 'agent-steel-worker-master',
            nameAr: 'رئيس عمال الحديد والفولاذ',
            nameEn: 'Master Steel Worker',
            role: 'TECHNICIAN',
            responsibilities: [
                'تركيب الحديد والفولاذ',
                'اللحام والتجميع',
                'التحقق من الجودة',
                'تدريب فريق العمال',
                'إدارة مخزون الحديد',
                'السلامة في التعامل مع المعادن'
            ]
        },

        finishing_specialist: {
            id: 'agent-finishing-specialist',
            nameAr: 'متخصص التشطيبات والديكور',
            nameEn: 'Finishing & Décor Specialist',
            role: 'TECHNICIAN',
            responsibilities: [
                'أعمال الدهان والتلميع',
                'تركيب الأرضيات والحوائط',
                'الديكور الداخلي',
                'أعمال الجص والحشو',
                'تدريب فريق التشطيبات',
                'أعمال النظافة والاستقبال'
            ]
        },

        safety_technician: {
            id: 'agent-safety-technician',
            nameAr: 'فني السلامة والحماية',
            nameEn: 'Safety & Protection Technician',
            role: 'TECHNICIAN',
            responsibilities: [
                'توفير معدات الحماية الشخصية',
                'ضمان الالتزام بقواعد السلامة',
                'التفتيش على معدات الأمان',
                'التدريب على السلامة والإخلاء',
                'توثيق الحوادث والإصابات',
                'الاتصال بفريق الطوارئ'
            ]
        }
    },

    // ══════════════════════════════════════════════════════════════════════════
    // المستوى السادس: الخدمات الدعمية والإدارية
    // ══════════════════════════════════════════════════════════════════════════

    CONTRACTOR_COORDINATOR: {
        id: 'agent-contractor-coordinator',
        nameAr: 'منسق المقاولين والعقود',
        nameEn: 'Contractor & Contract Coordinator',
        role: 'ADMINISTRATIVE',
        responsibilities: [
            'إدارة العقود مع المقاولين',
            'متابعة أداء المقاولين',
            'تسوية الدفعات والفواتير',
            'حل النزاعات والخلافات',
            'ضمان الالتزام بشروط العقود',
            'توثيق جميع الاتفاقيات',
            'التنسيق مع الفريق القانوني'
        ]
    },

    PROCUREMENT_MANAGER: {
        id: 'agent-procurement-manager',
        nameAr: 'مدير المشتريات والتوريد',
        nameEn: 'Procurement & Supplies Manager',
        role: 'ADMINISTRATIVE',
        responsibilities: [
            'تخطيط احتياجات المواد والمعدات',
            'طلب العروض من الموردين',
            'اختيار أفضل الموردين',
            'التفاوض على الأسعار والشروط',
            'متابعة التسليمات',
            'ضمان جودة المواد المستلمة',
            'إدارة الميزانية والتكاليف'
        ]
    },

    HUMAN_RESOURCES_MANAGER: {
        id: 'agent-human-resources-manager',
        nameAr: 'مدير الموارد البشرية والعمالة',
        nameEn: 'Human Resources & Labor Manager',
        role: 'ADMINISTRATIVE',
        responsibilities: [
            'تجنيد وتوظيف الموارد البشرية',
            'إدارة رواتب والمزايا',
            'تدريب وتطوير الموارد البشرية',
            'إدارة الحضور والغياب',
            'التعامل مع شؤون العمل',
            'الامتثال للقوانين العمالية',
            'تطوير ثقافة العمل الإيجابية'
        ]
    },

    FINANCIAL_CONTROLLER: {
        id: 'agent-financial-controller',
        nameAr: 'مراقب الحسابات والمالية',
        nameEn: 'Financial Controller',
        role: 'ADMINISTRATIVE',
        responsibilities: [
            'الإشراف على الحسابات المالية',
            'إعداد الميزانيات والتنبؤات',
            'متابعة الإنفاق والتكاليف',
            'إعداد التقارير المالية الدورية',
            'ضمان الالتزام بالمعايير الشرعية',
            'الرقابة على الصرف والإيرادات',
            'التدقيق الداخلي والخارجي'
        ]
    },

    DOCUMENTATION_SPECIALIST: {
        id: 'agent-documentation-specialist',
        nameAr: 'متخصص التوثيق والأرشفة',
        nameEn: 'Documentation & Archives Specialist',
        role: 'ADMINISTRATIVE',
        responsibilities: [
            'توثيق جميع مراحل المشروع',
            'حفظ المستندات والملفات',
            'تنظيم الأرشيفات',
            'إعداد التقارير والدراسات',
            'حفظ الرسومات والمخططات',
            'أرشفة المستندات الإلكترونية',
            'توفير الوثائق عند الحاجة'
        ]
    },

    // ══════════════════════════════════════════════════════════════════════════
    // المستوى السابع: فريق البحث والتطوير والابتكار
    // ══════════════════════════════════════════════════════════════════════════

    R_AND_D_DIRECTOR: {
        id: 'agent-r-and-d-director',
        nameAr: 'مدير البحث والتطوير والابتكار',
        nameEn: 'Research, Development & Innovation Director',
        role: 'STRATEGIC_DEVELOPMENT',
        responsibilities: [
            'قيادة فريق البحث والتطوير',
            'تطوير الحلول المبتكرة',
            'اختبار التقنيات الجديدة',
            'تحسين الأداء والكفاءة',
            'البحث عن حلول مستدامة',
            'نقل التكنولوجيا الحديثة',
            'التعاون مع الجامعات والمراكز البحثية'
        ],
        research_areas: [
            'مواد البناء الذكية والمستدامة',
            'تقنيات الطاقة المتجددة',
            'الأتمتة والروبوتات في البناء',
            'الحلول البيئية والخضراء',
            'تكنولوجيا البناء 4.0',
            'الواقع المعزز والافتراضي في المشاريع'
        ]
    },

    INNOVATION_ENGINEER: {
        id: 'agent-innovation-engineer',
        nameAr: 'مهندس الابتكار والحلول',
        nameEn: 'Innovation & Solutions Engineer',
        role: 'STRATEGIC_DEVELOPMENT',
        responsibilities: [
            'تطوير حلول جديدة للمشاكل',
            'اختبار المواد والتقنيات الحديثة',
            'تحسين عمليات الإنتاج',
            'توثيق الابتكارات والاختراعات',
            'نشر أفضل الممارسات',
            'التعاون مع الفريق الهندسي'
        ]
    },

    SUSTAINABILITY_SPECIALIST: {
        id: 'agent-sustainability-specialist',
        nameAr: 'متخصص الاستدامة والبيئة',
        nameEn: 'Sustainability & Environmental Specialist',
        role: 'STRATEGIC_DEVELOPMENT',
        responsibilities: [
            'ضمان الممارسات البيئية المستدامة',
            'تقليل النفايات والانبعاثات',
            'استخدام الموارد بكفاءة',
            'الدراسات البيئية والتقييم',
            'الالتزام بالمعايير البيئية',
            'تطوير مشاريع خضراء',
            'التوعية البيئية'
        ]
    },

    // ══════════════════════════════════════════════════════════════════════════
    // المستوى الثامن: البنائون والعاملون المتخصصون
    // ══════════════════════════════════════════════════════════════════════════

    BUILDERS: {
        residential_builder: {
            id: 'agent-residential-builder',
            nameAr: 'بناء متخصص في المباني السكنية',
            nameEn: 'Residential Construction Builder',
            role: 'BUILDER',
            specialization: 'بناء سكني',
            responsibilities: [
                'البناء حسب المخططات السكنية',
                'تطبيق معايير البناء السكني',
                'أعمال الحوائط والأسقف',
                'تركيب الأبواب والنوافذ',
                'إشراف على جودة البناء',
                'التنسيق مع الفريقات الأخرى',
                'ضمان الأمان والسلامة'
            ]
        },

        commercial_builder: {
            id: 'agent-commercial-builder',
            nameAr: 'بناء متخصص في المباني التجارية',
            nameEn: 'Commercial Construction Builder',
            role: 'BUILDER',
            specialization: 'بناء تجاري',
            responsibilities: [
                'البناء حسب المواصفات التجارية',
                'معالجة المساحات الكبيرة',
                'أعمال البناء المتقدمة',
                'تطبيق معايير السلامة العالية',
                'التعامل مع التصاميم المعقدة',
                'ضمان الجودة العالية',
                'الالتزام بالجداول الزمنية'
            ]
        },

        industrial_builder: {
            id: 'agent-industrial-builder',
            nameAr: 'بناء متخصص في المنشآت الصناعية',
            nameEn: 'Industrial Construction Builder',
            role: 'BUILDER',
            specialization: 'بناء صناعي',
            responsibilities: [
                'البناء للمنشآت الصناعية الثقيلة',
                'التعامل مع الأحمال الثقيلة',
                'بناء الهياكل الفولاذية',
                'تطبيق معايير الأمان الصارمة',
                'العمل مع مواد متخصصة',
                'ضمان التحمل والاستقرار',
                'الإشراف على الأعمال الحرجة'
            ]
        },

        infrastructure_builder: {
            id: 'agent-infrastructure-builder',
            nameAr: 'بناء متخصص في البنية التحتية',
            nameEn: 'Infrastructure & Civil Works Builder',
            role: 'BUILDER',
            specialization: 'بنية تحتية',
            responsibilities: [
                'بناء الطرق والجسور',
                'أعمال الحفر والتسوية',
                'بناء الأنفاق والعبارات',
                'معالجة التربة والأساسات',
                'استخدام معدات ثقيلة',
                'التمسك بمعايير الجودة',
                'العمل في ظروف صعبة'
            ]
        },

        renovation_builder: {
            id: 'agent-renovation-builder',
            nameAr: 'بناء متخصص في التجديد والترميم',
            nameEn: 'Renovation & Restoration Builder',
            role: 'BUILDER',
            specialization: 'تجديد وترميم',
            responsibilities: [
                'إعادة تأهيل المباني القديمة',
                'الحفاظ على الخصائص التاريخية',
                'إصلاح الأضرار والتشققات',
                'تحديث الأنظمة',
                'العمل بدقة وعناية',
                'احترام التراث المعماري',
                'الالتزام بالمواصفات القديمة'
            ]
        },

        waterfront_builder: {
            id: 'agent-waterfront-builder',
            nameAr: 'بناء متخصص في المشاريع الساحلية والمائية',
            nameEn: 'Waterfront & Marine Construction Builder',
            role: 'BUILDER',
            specialization: 'مشاريع ساحلية',
            responsibilities: [
                'بناء إلى جانب المياه',
                'التعامل مع التآكل والعوامل المائية',
                'استخدام مواد مقاومة',
                'أعمال البحريات والأرصفة',
                'الحماية من الفيضانات',
                'معالجة البيئة البحرية',
                'ضمان الاستقرار والأمان'
            ]
        }
    },

    // ══════════════════════════════════════════════════════════════════════════
    // المستوى التاسع: عمال الإنتاج المتخصصون
    // ══════════════════════════════════════════════════════════════════════════

    PRODUCTION_WORKERS: {
        concrete_production_worker: {
            id: 'agent-concrete-production-worker',
            nameAr: 'عامل إنتاج الخرسانة والمقاولات',
            nameEn: 'Concrete & Casting Production Worker',
            role: 'PRODUCTION_WORKER',
            specialization: 'إنتاج خرسانة',
            responsibilities: [
                'تحضير مخاليط الخرسانة',
                'صب الخرسانة في القوالب',
                'معالجة الخرسانة بعد الصب',
                'فحوصات الجودة الأولية',
                'تنظيف وصيانة المعدات',
                'الالتزام بمواصفات الخرسانة',
                'ضمان سلامة المنتج'
            ]
        },

        steel_production_worker: {
            id: 'agent-steel-production-worker',
            nameAr: 'عامل إنتاج الحديد والفولاذ',
            nameEn: 'Steel & Metal Production Worker',
            role: 'PRODUCTION_WORKER',
            specialization: 'إنتاج حديد',
            responsibilities: [
                'قطع وتشكيل الحديد',
                'اللحام والتجميع',
                'معالجة حرارية للمعادن',
                'فحص الجودة',
                'تخزين وتنظيم المواد',
                'الالتزام بمعايير الأمان',
                'الحفاظ على الأدوات'
            ]
        },

        brick_tile_production_worker: {
            id: 'agent-brick-tile-production-worker',
            nameAr: 'عامل إنتاج الطوب والبلاط',
            nameEn: 'Brick & Tile Production Worker',
            role: 'PRODUCTION_WORKER',
            specialization: 'إنتاج طوب وبلاط',
            responsibilities: [
                'تحضير المواد الخام',
                'تشكيل الطوب والبلاط',
                'حرق وتجفيف المنتجات',
                'فحص الجودة والأبعاد',
                'تصنيف المنتجات',
                'تعبئة وتغليف',
                'مراقبة الجودة الدورية'
            ]
        },

        glass_production_worker: {
            id: 'agent-glass-production-worker',
            nameAr: 'عامل إنتاج الزجاج والنوافذ',
            nameEn: 'Glass & Window Production Worker',
            role: 'PRODUCTION_WORKER',
            specialization: 'إنتاج زجاج',
            responsibilities: [
                'صناعة الزجاج والمرايا',
                'قطع وتشكيل الزجاج',
                'تجميع النوافذ والأبواب',
                'معالجة حرارية للزجاج',
                'فحص الشفافية والجودة',
                'تعبئة آمنة',
                'اختبار الأداء'
            ]
        },

        paint_coating_production_worker: {
            id: 'agent-paint-coating-production-worker',
            nameAr: 'عامل إنتاج الدهانات والطلاءات',
            nameEn: 'Paint & Coating Production Worker',
            role: 'PRODUCTION_WORKER',
            specialization: 'إنتاج دهانات',
            responsibilities: [
                'خلط المواد الكيميائية',
                'تحضير الدهانات',
                'اختبار اللون والقوام',
                'ضمان المواصفات القياسية',
                'التعبئة والحفظ',
                'الالتزام بالسلامة الكيميائية',
                'مراقبة الجودة'
            ]
        },

        plumbing_fixtures_production_worker: {
            id: 'agent-plumbing-fixtures-production-worker',
            nameAr: 'عامل إنتاج أدوات السباكة والتركيبات',
            nameEn: 'Plumbing Fixtures Production Worker',
            role: 'PRODUCTION_WORKER',
            specialization: 'إنتاج أدوات سباكة',
            responsibilities: [
                'صنع الأنابيب والوصلات',
                'تشكيل وتشغيل المعادن',
                'اختبار الضغط والتسريب',
                'معالجة سطحية',
                'فحص الجودة',
                'تعبئة وتغليف آمن',
                'ضمان المواصفات'
            ]
        },

        electrical_components_production_worker: {
            id: 'agent-electrical-components-production-worker',
            nameAr: 'عامل إنتاج المكونات الكهربائية',
            nameEn: 'Electrical Components Production Worker',
            role: 'PRODUCTION_WORKER',
            specialization: 'إنتاج مكونات كهربائية',
            responsibilities: [
                'تصنيع الأسلاك والكابلات',
                'تجميع المفاتيح والقواطع',
                'اختبار الكهربائية',
                'معايرة الأجهزة',
                'فحص الأمان الكهربائي',
                'تعبئة آمنة مع توثيق',
                'الامتثال للمعايير الدولية'
            ]
        },

        hvac_equipment_production_worker: {
            id: 'agent-hvac-equipment-production-worker',
            nameAr: 'عامل إنتاج معدات التكييف والتهوية',
            nameEn: 'HVAC Equipment Production Worker',
            role: 'PRODUCTION_WORKER',
            specialization: 'إنتاج معدات HVAC',
            responsibilities: [
                'تصنيع وحدات التكييف',
                'تجميع المراوح والمضخات',
                'اختبار الأداء الحراري',
                'معايرة الأنظمة',
                'فحص الكفاءة',
                'التعبئة الآمنة',
                'توثيق الاختبارات'
            ]
        },

        wood_production_worker: {
            id: 'agent-wood-production-worker',
            nameAr: 'عامل إنتاج منتجات الخشب والأثاث',
            nameEn: 'Wood & Furniture Production Worker',
            role: 'PRODUCTION_WORKER',
            specialization: 'إنتاج خشب',
            responsibilities: [
                'نشر وتشكيل الخشب',
                'تجميع الأثاث والأبواب',
                'معالجة الأسطح',
                'تلميع وتشطيب',
                'فحص الجودة',
                'توضيب آمن',
                'ضمان المتانة'
            ]
        }
    },

    // ══════════════════════════════════════════════════════════════════════════
    // مستوى الجودة والامتثال (QUALITY ASSURANCE & COMPLIANCE)
    // ══════════════════════════════════════════════════════════════════════════

    QUALITY_ASSURANCE: {
        qa_manager_admin: {
            id: 'agent-qa-manager-admin',
            nameAr: 'مدير الجودة والامتثال الإداري',
            nameEn: 'QA & Administrative Compliance Manager',
            role: 'QUALITY_ASSURANCE',
            specialization: 'إدارة استراتيجية',
            priority: 2,
            responsibilities: [
                'تطوير سياسات الجودة الشاملة',
                'مراقبة الامتثال للمعايير العالمية (ISO, PMP)',
                'تقييم أداء العمليات الإدارية',
                'تطبيق أفضل الممارسات الدولية',
                'توثيق وقائع الجودة',
                'تدريب الفريق على معايير الجودة',
                'ربط الجودة بمبادئ الشريعة الإسلامية',
                'إعداد تقارير الامتثال والمراجعة'
            ],
            qualifications: [
                'شهادة ISO 9001 Lead Auditor',
                'PMP أو PRINCE2',
                'خبرة 10+ سنة في إدارة الجودة',
                'فهم عميق للمعايير الدولية',
                'معرفة بالشريعة الإسلامية والأخلاق'
            ],
            methodologies: ['ISO 9001', 'PMP', 'Six Sigma', 'Lean Management'],
            islamicPrinciples: [
                'الأمانة في تقييم الأداء',
                'العدل في توزيع المسؤوليات',
                'الإتقان في تطبيق المعايير',
                'الشفافية في التقارير'
            ],
            kpis: [
                'نسبة الامتثال للمعايير',
                'عدد الانحرافات المكتشفة',
                'معدل التصحيح',
                'رضا المستفيدين'
            ]
        },

        qa_manager_construction: {
            id: 'agent-qa-manager-construction',
            nameAr: 'مدير الجودة والسلامة في البناء',
            nameEn: 'Quality Assurance & Safety Manager (Construction)',
            role: 'QUALITY_ASSURANCE',
            specialization: 'جودة البناء والسلامة',
            priority: 2,
            responsibilities: [
                'فحص جودة المواد والمعدات',
                'التحقق من مطابقة العمل للمخططات',
                'مراقبة السلامة والصحة المهنية',
                'إجراء اختبارات جودة دورية (اختبار الخرسانة، الصلب)',
                'توثيق العيوب والانحرافات',
                'متابعة التصحيحات',
                'ضمان معايير البناء الآمن',
                'تطبيق مبادئ عدم الضرر'
            ],
            qualifications: [
                'مهندس مدني مع شهادة QA',
                'ISO 19011 Lead Auditor',
                'شهادة OSHA في السلامة',
                'خبرة 8+ سنة في جودة البناء',
                'معرفة بقوانين السلامة المحلية'
            ],
            methodologies: ['ISO 9001', 'ISO 45001', 'Six Sigma', 'PDCA'],
            islamicPrinciples: [
                'لا ضرر ولا ضرار — السلامة أولاً',
                'الأمانة في إجراء الفحوصات',
                'الإتقان في تطبيق المعايير',
                'حفظ الأموال من الهدر'
            ],
            kpis: ['عدد العيوب المكتشفة', 'معدل الإصلاح الأول', 'حوادث السلامة', 'رضا الزبائن']
        },

        qa_manager_production: {
            id: 'agent-qa-manager-production',
            nameAr: 'مدير الجودة الإنتاجية والمخزون',
            nameEn: 'Quality Assurance & Inventory Manager (Production)',
            role: 'QUALITY_ASSURANCE',
            specialization: 'جودة الإنتاج والمخزون',
            priority: 2,
            responsibilities: [
                'فحص المنتجات الخامة والنهائية',
                'إدارة معايير الجودة للمنتجات',
                'مراقبة المخزون والتخزين',
                'تقليل النفايات والتالف',
                'ضمان المطابقة مع المواصفات',
                'تتبع معدل الخلل (Defect Rate)',
                'اختبارات المتانة والأداء',
                'توثيق المعايير الإسلامية'
            ],
            qualifications: [
                'مهندس إنتاج مع QA',
                'Six Sigma Green Belt',
                'ISO 9001 Auditor',
                'خبرة 7+ سنة في جودة الإنتاج',
                'معرفة بأنظمة المخزون'
            ],
            methodologies: ['ISO 9001', 'Six Sigma', 'Lean Manufacturing', 'Kaizen'],
            islamicPrinciples: [
                'الإتقان في الصناعة',
                'عدم الغش في المنتجات',
                'دقة الوزن والكيل',
                'إرضاء الزبون بالجودة'
            ],
            kpis: [
                'معدل العيوب (PPM)',
                'نسبة المنتجات الصالحة',
                'تكاليف الجودة',
                'معدل إعادة العمل'
            ]
        },

        qa_auditor_internal: {
            id: 'agent-qa-auditor-internal',
            nameAr: 'مدقق الجودة الداخلي',
            nameEn: 'Internal Quality Auditor',
            role: 'QUALITY_ASSURANCE',
            specialization: 'التدقيق والفحص الداخلي',
            priority: 3,
            responsibilities: [
                'تنفيذ عمليات التدقيق الدورية',
                'فحص الامتثال للمعايير الداخلية',
                'التحقق من تطبيق الإجراءات',
                'توثيق نتائج التدقيق',
                'توصيات التحسين',
                'متابعة الإجراءات التصحيحية',
                'تقكيم المخاطر',
                'إعداد تقارير الإدارة العليا'
            ],
            qualifications: [
                'ISO 19011 Lead Auditor',
                'شهادة تدقيق معترف بها دولياً',
                'خبرة 5+ سنة في التدقيق',
                'مهارات اتصال عالية',
                'بمعرفة بمختلف المعايير'
            ],
            methodologies: ['ISO 19011', 'PDCA', 'Risk Assessment', 'Root Cause Analysis'],
            islamicPrinciples: [
                'العدل والنزاهة في التقييم',
                'السرية والموضوعية',
                'الحكمة في التوصيات',
                'محاسبة النفس'
            ],
            kpis: ['عدد عمليات التدقيق', 'نسبة الالتزام', 'فترة التصحيح', 'فعالية التحسينات']
        },

        qa_specialist_testing: {
            id: 'agent-qa-specialist-testing',
            nameAr: 'متخصص اختبار الجودة والمواد',
            nameEn: 'QA Testing Specialist (Materials & Performance)',
            role: 'QUALITY_ASSURANCE',
            specialization: 'اختبار وتحليل المواد',
            priority: 3,
            responsibilities: [
                'إجراء اختبارات المواد المختلفة',
                'فحص الخرسانة والصلب والحديد',
                'اختبارات المتانة والضغط',
                'تحليل نتائج الاختبارات',
                'توثيق المواد المطابقة والمرفوضة',
                'مراقبة معايير المصنعين',
                'توصيات الاستبدال أو الإصلاح',
                'تقارير الاختبارات والشهادات'
            ],
            qualifications: [
                'مهندس مواد مع شهادات متقدمة',
                'خبرة في المختبرات المعتمدة',
                'شهادات في اختبار المواد',
                'معرفة بالمعدات الحديثة',
                'الدقة والعناية في التفاصيل'
            ],
            methodologies: ['ISO 1920-1', 'ASTM Standards', 'Six Sigma', 'SPC'],
            islamicPrinciples: [
                'دقة القياس والوزن',
                'الأمانة في النتائج',
                'الحفاظ على المعايير',
                'عدم الغش في المواد'
            ],
            kpis: ['عدد العينات المختبرة', 'دقة النتائج', 'الالتزام بالجداول', 'معدل الرفض']
        },

        qa_coordinator_process: {
            id: 'agent-qa-coordinator-process',
            nameAr: 'منسق الجودة وتحسين العمليات',
            nameEn: 'QA Coordinator & Process Improvement',
            role: 'QUALITY_ASSURANCE',
            specialization: 'تحسين البروسيسات',
            priority: 3,
            responsibilities: [
                'توثيق وتحسين العمليات الإدارية',
                'تطبيق دورة PDCA (Plan-Do-Check-Act)',
                'تدريب الموظفين على الإجراءات',
                'متابعة مؤشرات الأداء (KPIs)',
                'تحديد مجالات التحسين',
                'تطبيق تحسينات صغيرة (Kaizen)',
                'توثيق أفضل الممارسات',
                'إدارة نظام الشكاوى والتحسينات'
            ],
            qualifications: [
                'Lean Specialist أو Six Sigma Green Belt',
                'خبرة 5+ سنة في تحسين العمليات',
                'مهارات قيادة الفريق',
                'معرفة بادوات التحسين',
                'مهارات اتصال قوية'
            ],
            methodologies: ['Lean', 'Six Sigma', 'Kaizen', 'Theory of Constraints'],
            islamicPrinciples: [
                'الاستمرار في التحسن (Ihsan)',
                'عدم إهدار الموارد',
                'العدالة في توزيع الفوائد',
                'الشورى والتعاون'
            ],
            kpis: ['عدد التحسينات المطبقة', 'توفير التكاليف', 'رضا الموظفين', 'إنتاجية العملية']
        },

        qa_specialist_documentation: {
            id: 'agent-qa-specialist-documentation',
            nameAr: 'متخصص توثيق الجودة والامتثال',
            nameEn: 'QA Documentation & Compliance Specialist',
            role: 'QUALITY_ASSURANCE',
            specialization: 'التوثيق والسجلات',
            priority: 3,
            responsibilities: [
                'توثيق جميع عمليات الجودة',
                'حفظ سجلات الامتثال',
                'إعداد معايير التوثيق',
                'إدارة أنظمة الملفات والأرشفة',
                'تحديث وثائق العمليات',
                'المراجعات الدورية للتوثيق',
                'ضمان سهولة الوصول للسجلات',
                'الامتثال لقوانين حفظ البيانات'
            ],
            qualifications: [
                'خبرة في إدارة الوثائق',
                'معرفة بمعايير التوثيق الدولية',
                'مهارات تقنية (نظم الحفظ)',
                'دقة واهتمام بالتفاصيل',
                'معرفة بمتطلبات التدقيق'
            ],
            methodologies: ['ISO 9001 Documentation', 'Records Management', 'Data Protection'],
            islamicPrinciples: [
                'الأمانة في التوثيق',
                'الصدق والدقة في السجلات',
                'حفظ الأسرار',
                'الشفافية'
            ],
            kpis: ['نسبة الاكتمال التوثيقي', 'سرعة الوصول للمستندات', 'دقة السجلات', 'التزام الحفظ']
        },

        qa_specialist_requirements: {
            id: 'agent-qa-specialist-requirements',
            nameAr: 'متخصص إدارة متطلبات الجودة',
            nameEn: 'Requirements & Specifications Specialist',
            role: 'QUALITY_ASSURANCE',
            specialization: 'المواصفات والمتطلبات',
            priority: 3,
            responsibilities: [
                'تحديد متطلبات الجودة الكاملة',
                'وضع مواصفات العمل والمنتجات',
                'ربط المتطلبات بالعقود',
                'التحقق من حالة الالتزام',
                'إدارة تغييرات المتطلبات',
                'توثيق معايير الأداء',
                'التنسيق مع الأطراف الداخلية والخارجية',
                'إعداد معايير القبول'
            ],
            qualifications: [
                'مهندس متخصص في المتطلبات',
                'شهادات في إدارة المشاريع',
                'خبرة 6+ سنة',
                'مهارات تحليلية عالية',
                'معرفة بلغات التعاقد'
            ],
            methodologies: ['Requirements Management', 'ISO/IEC/IEEE 29148', 'SysML'],
            islamicPrinciples: [
                'الوضوح في المتطلبات',
                'العدل في الشروط',
                'الوفاء بالعهد',
                'الشفافية الكاملة'
            ],
            kpis: ['اكتمال المتطلبات', 'توافق الالتزام', 'التغييرات المطلوبة', 'رضا الأطراف']
        },

        qa_manager_customer_satisfaction: {
            id: 'agent-qa-manager-customer-satisfaction',
            nameAr: 'مدير جودة الخدمة ورضا العملاء',
            nameEn: 'Customer Satisfaction & Service Quality Manager',
            role: 'QUALITY_ASSURANCE',
            specialization: 'رضا العملاء',
            priority: 2,
            responsibilities: [
                'قياس رضا العملاء بشكل دوري',
                'تحليل شكاوى العملاء',
                'تطوير خدمات ما بعد البيع',
                'متابعة سرعة ودقة الاستجابة',
                'ضمان تجربة العميل الإيجابية',
                'إدارة برامج التحسين بناء على ملاحظات العملاء',
                'بناء علاقات طويلة الأجل مع الزبائن',
                'إعداد تقارير الرضا والمؤشرات'
            ],
            qualifications: [
                'مهارات عالية في خدمة العملاء',
                'شهادات في إدارة العلاقات',
                'خبرة 7+ سنة',
                'مهارات اتصال استثنائية',
                'فهم عميق لنفسية العميل'
            ],
            methodologies: ['NPS (Net Promoter Score)', 'Customer Journey Mapping', 'CSAT', 'CES'],
            islamicPrinciples: [
                'الحسن في التعامل مع الزبون',
                'الصدق والأمانة',
                'تجاوز التوقعات',
                'الشكر والامتنان'
            ],
            kpis: [
                'نسبة رضا العملاء (CSAT)',
                'Net Promoter Score (NPS)',
                'معدل الشكاوى',
                'معدل العودة للشراء'
            ]
        }
    },

    // ══════════════════════════════════════════════════════════════════════════
    // خبراء المنهجيات والمعايير (METHODOLOGY EXPERTS)
    // ══════════════════════════════════════════════════════════════════════════

    METHODOLOGY_EXPERTS: {
        methodology_pmp_expert: {
            id: 'agent-methodology-pmp-expert',
            nameAr: 'خبير إدارة المشاريع PMP/PMI',
            nameEn: 'PMP & PMI Methodology Expert',
            role: 'METHODOLOGY_EXPERT',
            specialization: 'إدارة المشاريع بالمعايير العالمية',
            priority: 3,
            responsibilities: [
                'تطبيق معايير PMP في جميع المشاريع',
                'إدارة نطاق الأعمال والوقت والميزانية',
                'إدارة المخاطر والتواصل',
                'مراقبة الجودة والمضمون',
                'تقديم تقارير الأداء والتقدم',
                'توثيق دروس الخبر',
                'تدريب الفريق على PMP',
                'ربط PMP مع المبادئ الإسلامية'
            ],
            qualifications: [
                'شهادة PMI-PMP',
                'معرفة عملية عميقة بـ PMBOK',
                '8+ سنة في إدارة المشاريع',
                'قيادة مشاريع بميزانيات كبيرة',
                'فهم للشريعة الإسلامية'
            ],
            methodologies: ['PMBOK (PMP)', 'PMI Standards'],
            islamicPrinciples: [
                'الأمانة في إدارة الموارد',
                'العدالة في توزيع المسؤوليات',
                'الإتقان في التخطيط والتنفيذ',
                'الشورى في الإدارة'
            ],
            keyDocuments: [
                'PMBOK Guide 6th Edition',
                'Project Charter',
                'Management Plans',
                'Status Reports'
            ],
            kpis: [
                'الالتزام بالجدول الزمني',
                'الالتزام بالميزانية',
                'جودة التسليمات',
                'رضا أصحاب المصلحة'
            ]
        },

        methodology_iso_expert: {
            id: 'agent-methodology-iso-expert',
            nameAr: 'خبير معايير ISO والامتثال',
            nameEn: 'ISO Standards & Compliance Expert',
            role: 'METHODOLOGY_EXPERT',
            specialization: 'معايير ISO المختلفة',
            priority: 3,
            responsibilities: [
                'تطبيق معايير ISO 9001 (الجودة)',
                'تطبيق ISO 45001 (السلامة والصحة)',
                'تطبيق ISO 14001 (البيئة)',
                'تطبيق معايير ISO أخرى ذات علاقة',
                'إعداد نظام إدارة متكامل',
                'تسهيل عمليات التدقيق الخارجي',
                'تدريب فريق الامتثال',
                'متابعة مؤشرات الامتثال'
            ],
            qualifications: [
                'شهادات Lead Auditor متعددة الـ ISO',
                'معرفة عملية عميقة بكل معايير ISO',
                'خبرة 8+ سنة في الامتثال',
                'مهارات تدقيق قوية',
                'معرفة بالتشريعات المحلية'
            ],
            methodologies: ['ISO 9001', 'ISO 45001', 'ISO 14001', 'ISO 19011'],
            islamicPrinciples: [
                'الشفافية الكاملة',
                'العدالة والإنصاف',
                'الحفاظ على البيئة',
                'السلامة والرحمة بالعاملين'
            ],
            keyDocuments: [
                'ISO 9001:2015 Standard',
                'ISO 45001:2018 Standard',
                'Quality Manual',
                'Audit Reports'
            ],
            kpis: ['نسبة الامتثال', 'عدد الانحرافات', 'فترة التصحيح', 'نتائج التدقيق']
        },

        methodology_lean_expert: {
            id: 'agent-methodology-lean-expert',
            nameAr: 'خبير Lean و Six Sigma',
            nameEn: 'Lean & Six Sigma Expert',
            role: 'METHODOLOGY_EXPERT',
            specialization: 'تحسين العمليات والكفاءة',
            priority: 3,
            responsibilities: [
                'تطبيق مبادئ Lean لتقليل الهدر',
                'تطبيق Six Sigma لتقليل التباين',
                'تحديد عمليات Kaizen للتحسين المستمر',
                'تدريب فريق Green Belt و Black Belt',
                'قيادة مشاريع التحسين',
                'قياس العوائد المالية',
                'تطبيق أدوات Value Stream Mapping',
                'تجسيد سمات الإتقان الإسلامي'
            ],
            qualifications: [
                'Six Sigma Black Belt أو Master',
                'Lean Specialist معترف به',
                'خبرة 7+ سنة في التحسين',
                'فهم عميق للعمليات الإنتاجية',
                'مهارات تحليلية وإحصائية متقدمة'
            ],
            methodologies: [
                'Lean Manufacturing',
                'Six Sigma DMAIC/DMADV',
                'Kaizen',
                'Value Stream Mapping'
            ],
            islamicPrinciples: [
                'الإتقان والتمام (Ihsan)',
                'عدم إهدار الموارد',
                'الكفاءة والاقتصاد',
                'العدالة في توزيع الفوائد'
            ],
            keyTools: [
                'Value Stream Mapping',
                'Root Cause Analysis (5 Whys, Fishbone)',
                'Statistical Process Control',
                'Design of Experiments'
            ],
            kpis: [
                'تقليل الهدر (%)',
                'تحسن في دورة الإنتاج',
                'تقليل التكاليف ($)',
                'تحسن جودة العملية'
            ]
        },

        methodology_agile_expert: {
            id: 'agent-methodology-agile-expert',
            nameAr: 'خبير Agile وScrum في إدارة المشاريع',
            nameEn: 'Agile & Scrum Methodology Expert',
            role: 'METHODOLOGY_EXPERT',
            specialization: 'إدارة مرنة وتكرارية',
            priority: 3,
            responsibilities: [
                'تطبيق مبادئ Agile في المشاريع',
                'قيادة فريق Scrum بفعالية',
                'إدارة Product Backlog والـ Sprints',
                'سهولة التكيف مع التغييرات',
                'تعزيز التعاون والتواصل',
                'قياس سرعة الفريق والإنتاجية',
                'تدريب الفريق على Agile',
                'دمج مبادئ Agile مع الشريعة'
            ],
            qualifications: [
                'شهادة Certified Scrum Master (CSM)',
                'معرفة عملية عميقة بـ Agile',
                'خبرة 5+ سنة مع Agile Teams',
                'مهارات قيادة وتيسير',
                'فهم الثقافة والتنظيميات'
            ],
            methodologies: ['Scrum', 'Kanban', 'Lean Software Development', 'eXtreme Programming'],
            islamicPrinciples: [
                'الشورى والتشاور المستمر',
                'التعاون والعمل الجماعي',
                'المرونة مع الحفاظ على الأصول',
                'الشفافية والنزاهة'
            ],
            keyArtifacts: [
                'Product Backlog',
                'Sprint Backlog',
                'Burndown Charts',
                'Retrospectives'
            ],
            kpis: [
                'Velocity (نقاط القصة المنجزة)',
                'Sprint Goal Achievement',
                'Team Satisfaction',
                'Delivery Time'
            ]
        },

        methodology_siscc_expert: {
            id: 'agent-methodology-siscc-expert',
            nameAr: 'خبير SISCC والهندسة الأنظمية',
            nameEn: 'SISCC & Systems Engineering Expert',
            role: 'METHODOLOGY_EXPERT',
            specialization: 'الأنظمة والهندسة الشاملة',
            priority: 3,
            responsibilities: [
                'تطبيق منهجية SISCC (Systems Integration Success Control Center)',
                'تحليل النظم المتكاملة',
                'إدارة التخاطر بين الأنظمة',
                'التحقق من التكامل الشامل',
                'مراقبة الأداء الكلي',
                'التحقق من الامتثال للمتطلبات الشاملة',
                'إدارة تكامل المشروع',
                'تقديم رؤى الأنظمة المتقدمة'
            ],
            qualifications: [
                'خبرة في الأنظمة المعقدة',
                'معرفة عملية بـ SISCC',
                'الإلمام بـ Systems Engineering (SE)',
                'خبرة 8+ سنة في المشاريع الكبرى',
                'معرفة بالمعايير الدولية'
            ],
            methodologies: [
                'SISCC',
                'IEEE 1220 Systems Engineering',
                'Model-Based Systems Engineering'
            ],
            islamicPrinciples: [
                'الشمول والتكامل في الرؤية',
                'الربط بين الأجزاء والكل',
                'الاهتمام بجميع جوانب النظام',
                'العدالة في توزيع الموارد'
            ],
            keyAspects: [
                'System Integration Planning',
                'Interface Management',
                'Risk Management',
                'Performance Metrics'
            ],
            kpis: [
                'System Integration Success Rate',
                'Interface Compliance',
                'Overall System Performance',
                'Requirements Realization'
            ]
        },

        methodology_research_innovation: {
            id: 'agent-methodology-research-innovation',
            nameAr: 'خبير البحث والابتكار والتطوير',
            nameEn: 'Research, Innovation & Development Expert',
            role: 'METHODOLOGY_EXPERT',
            specialization: 'البحث والابتكار',
            priority: 3,
            responsibilities: [
                'قيادة مشاريع البحث والتطوير',
                'تطبيق منهجيات البحث العلمي',
                'تشجيع الابتكار والإبداع',
                'إدارة براءات الاختراع',
                'تقييم الفرص الجديدة',
                'التعاون مع الجامعات والمراكز البحثية',
                'توثيق الاكتشافات والابتكارات',
                'ربط الابتكار بالقيم الإسلامية'
            ],
            qualifications: [
                'درجة الدكتوراه أو ما يعادلها',
                'خبرة 8+ سنة في البحث والابتكار',
                'فهم عميق للعلوم والتقنيات',
                'مهارات إدارة برامج بحثية',
                'معرفة ببراءات الاختراع'
            ],
            methodologies: [
                'Design Thinking',
                'Scientific Research Methods',
                'Stage Gate Process',
                'Lean Startup'
            ],
            islamicPrinciples: [
                'العلم والبحث عن الحقيقة',
                'الابتكار الذي ينفع الناس',
                'تطوير الموارد الموجودة',
                'نقل العلم والعلماء'
            ],
            researchAreas: [
                'Sustainable Materials',
                'Smart Construction',
                'Automation & Robotics',
                'Green Technologies'
            ],
            kpis: [
                'عدد براءات الاختراع',
                'عدد الابتكارات المطبقة',
                'الاستثمار في R&D',
                'الفوائد المالية من الابتكار'
            ]
        },

        methodology_islamic_governance: {
            id: 'agent-methodology-islamic-governance',
            nameAr: 'خبير الحوكمة والشريعة الإسلامية',
            nameEn: 'Islamic Governance & Sharia Compliance Expert',
            role: 'METHODOLOGY_EXPERT',
            specialization: 'الحوكمة الإسلامية',
            priority: 2,
            responsibilities: [
                'تطبيق مبادئ الحوكمة الإسلامية (Maqasid Al-Sharia)',
                'ضمان الامتثال للمعايير الشرعية',
                'القضاء على الربا والغرر والغش',
                'تطبيق مبدأ الأمانة والعدالة',
                'إدارة أخلاقية العمل',
                'مراقبة الامتثال الشرعي',
                'العدالة الاجتماعية والاستدامة',
                'التعليم والتدريب الشرعي'
            ],
            qualifications: [
                'عالم بالشريعة الإسلامية',
                'فقه المعاملات والاقتصاد الإسلامي',
                'خبرة 8+ سنة',
                'فهم عميق للمذاهب الفقهية',
                'معرفة بالمعايير الإسلامية الحديثة'
            ],
            shariaFramework: [
                'Maqasid Al-Sharia (قاصد الشريعة)',
                'Maslaha (المصلحة العامة)',
                'Adl (العدل)',
                'Amana (الأمانة)',
                'Ihsan (الإتقان)'
            ],
            islamicPrinciples: [
                'الكتاب والسنة الأساس',
                'الاجتهاد المعاصر',
                'حفظ الدين والمال والعرض',
                'المقاصد الشرعية'
            ],
            keyAreas: [
                'لا ربا ولا غرر',
                'العدالة في التوزيع',
                'حقوق العامل',
                'الزكاة والتمويل الإسلامي'
            ],
            kpis: [
                'الامتثال الشرعي (%)',
                'العدالة في الأجور',
                'الشفافية والنزاهة',
                'رضا أصحاب المصلحة الشرعيين'
            ]
        }
    },

    // ══════════════════════════════════════════════════════════════════════════
    // قسم إدارة السلامة والصحة المهنية
    // ══════════════════════════════════════════════════════════════════════════

    SAFETY_MANAGEMENT: {
        safety_director: {
            id: 'agent-safety-director',
            nameAr: 'مدير قسم السلامة والصحة المهنية',
            role: 'SAFETY_MANAGEMENT'
        },
        safety_compliance_manager: {
            id: 'agent-safety-compliance-manager',
            nameAr: 'مدير الامتثال الأمني والقانوني',
            role: 'SAFETY_MANAGEMENT'
        },
        occupational_health_officer: {
            id: 'agent-occupational-health-officer',
            nameAr: 'ضابط الصحة المهنية والرعاية الطبية',
            role: 'SAFETY_MANAGEMENT'
        }
    },

    // ══════════════════════════════════════════════════════════════════════════
    // قسم العمارة والتصميم المتخصص
    // ══════════════════════════════════════════════════════════════════════════

    SPECIALIZED_ARCHITECTS: {
        chief_architect: {
            id: 'agent-chief-architect',
            nameAr: 'المعماري الرئيسي',
            role: 'SPECIALIZED_ARCHITECTS'
        },
        residential_architect: {
            id: 'agent-residential-architect',
            nameAr: 'معماري التصاميم السكنية',
            role: 'SPECIALIZED_ARCHITECTS'
        },
        commercial_architect: {
            id: 'agent-commercial-architect',
            nameAr: 'معماري التصاميم التجارية',
            role: 'SPECIALIZED_ARCHITECTS'
        },
        sustainable_architect: {
            id: 'agent-sustainable-architect',
            nameAr: 'معماري العمارة المستدامة',
            role: 'SPECIALIZED_ARCHITECTS'
        }
    }
};

// ══════════════════════════════════════════════════════════════════════════════
// 🎯 تصدير النظام
// ══════════════════════════════════════════════════════════════════════════════

module.exports = {
    CONSTRUCTION_AGENTS,

    getAllConstructionAgents() {
        const agents = [];
        for (const [key, value] of Object.entries(CONSTRUCTION_AGENTS)) {
            if (value && typeof value === 'object') {
                if (value.id) {
                    agents.push(value);
                } else if (typeof value === 'object') {
                    for (const [subKey, subValue] of Object.entries(value)) {
                        if (subValue && subValue.id) {
                            agents.push(subValue);
                        }
                    }
                }
            }
        }
        return agents;
    },

    getAgentById(agentId) {
        const allAgents = this.getAllConstructionAgents();
        return allAgents.find(agent => agent.id === agentId);
    },

    getAgentsByRole(role) {
        const allAgents = this.getAllConstructionAgents();
        return allAgents.filter(agent => agent.role === role);
    },

    getAgentsByDepartment(department) {
        const allAgents = this.getAllConstructionAgents();
        return allAgents.filter(agent => agent.department === department);
    },

    activateAgent(agentId, config = {}) {
        const agent = this.getAgentById(agentId);
        if (!agent) return null;

        return {
            agentId: agent.id,
            nameAr: agent.nameAr,
            nameEn: agent.nameEn,
            role: agent.role,
            status: 'ACTIVE',
            activatedAt: new Date().toISOString(),
            responsibilities: agent.responsibilities || [],
            qualifications: agent.qualifications || [],
            kpis: agent.kpis || [],
            config: config,
            subAgents: agent.subAgents || []
        };
    },

    activateMultipleAgents(agentIds, config = {}) {
        return agentIds.map(id => this.activateAgent(id, config)).filter(Boolean);
    },

    activateAllAgentsByRole(role, config = {}) {
        return this.getAgentsByRole(role).map(agent =>
            this.activateAgent(agent.id, { ...config, role })
        );
    }
};
