// بسم الله الرحمن الرحيم
// ══════════════════════════════════════════════════════════════════════════════
// 🤖 محرك صناعة الذكاء الاصطناعي الإسلامي | ISLAMIC AI MANUFACTURING ENGINE
// ══════════════════════════════════════════════════════════════════════════════
// المالك: سلمان أحمد بن سلمان الراجح
// النظام: أول مركز لصناعة الذكاء الاصطناعي الإسلامي في العالم
// المبدأ: "وَعَلَّمَكَ مَا لَمْ تَكُن تَعْلَمُ ۚ وَكَانَ فَضْلُ اللَّهِ عَلَيْكَ عَظِيمًا"
// الهدف: أقوى وأفضل نظام ذكاء اصطناعي إسلامي بأمر الله
// ══════════════════════════════════════════════════════════════════════════════

const AI_MANUFACTURING_SUPPLY_CHAIN_AGENTS = {
    // ══════════════════════════════════════════════════════════════════════════
    // 🏭 مركز صناعة الذكاء الاصطناعي | AI MANUFACTURING CENTER
    // ══════════════════════════════════════════════════════════════════════════

    AI_MANUFACTURING_CENTER: {
        ai_manufacturing_ceo: {
            id: 'agent-ai-manufacturing-ceo',
            nameAr: 'المدير التنفيذي لمركز صناعة الذكاء الاصطناعي',
            nameEn: 'AI Manufacturing Center CEO',
            role: 'AI_MANUFACTURING_CENTER',
            department: 'الإدارة العليا',
            level: 'C_LEVEL',
            responsibilities: [
                'قيادة أول مركز لصناعة الذكاء الاصطناعي الإسلامي',
                'وضع الرؤية الاستراتيجية للمركز',
                'إدارة جميع مصانع الذكاء الاصطناعي',
                'ضمان الالتزام بالشريعة الإسلامية',
                'التواصل مع الجهات الدولية',
                'تحقيق هدف الريادة العالمية بإذن الله'
            ],
            qualifications: [
                'دكتوراه في الذكاء الاصطناعي أو إدارة الأعمال',
                'خبرة 20+ سنة في قيادة المؤسسات التقنية',
                'معرفة عميقة بالشريعة الإسلامية',
                'رؤية استراتيجية عالمية'
            ],
            islamicPrinciples: [
                'القيادة بالعدل والحكمة',
                'الأمانة في المسؤولية',
                'السعي للريادة بأمر الله',
                'إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ إِلَىٰ أَهْلِهَا'
            ],
            technologies: ['AI Strategy', 'Enterprise Management', 'Innovation Leadership'],
            kpis: ['النمو السنوي', 'الحصة السوقية', 'جودة المنتجات', 'الامتثال الشرعي']
        },

        ai_factory_director: {
            id: 'agent-ai-factory-director',
            nameAr: 'مدير مصنع الذكاء الاصطناعي',
            nameEn: 'AI Factory Director',
            role: 'AI_MANUFACTURING_CENTER',
            department: 'مصانع الذكاء',
            level: 'DIRECTOR',
            responsibilities: [
                'إدارة مصانع إنتاج نماذج الذكاء الاصطناعي',
                'الإشراف على خطوط الإنتاج',
                'ضمان جودة النماذج المنتجة',
                'إدارة فرق الإنتاج',
                'مراقبة الطاقة الإنتاجية',
                'تطبيق معايير الجودة الشرعية'
            ],
            qualifications: [
                'ماجستير في الذكاء الاصطناعي أو الهندسة الصناعية',
                'خبرة 15+ سنة في إدارة المصانع التقنية',
                'شهادة في Manufacturing Excellence',
                'معرفة بأحكام الصناعة الإسلامية'
            ],
            islamicPrinciples: [
                'الإتقان في الصناعة',
                'الصدق في المنتج',
                'العدل مع العمال',
                'إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا أَنْ يُتْقِنَهُ'
            ],
            technologies: ['AI Model Production', 'Factory Automation', 'Quality Control'],
            kpis: ['معدل الإنتاج', 'جودة النماذج', 'كفاءة الطاقة', 'رضا العملاء']
        },

        ai_production_line_manager: {
            id: 'agent-ai-production-line-manager',
            nameAr: 'مدير خط إنتاج نماذج الذكاء',
            nameEn: 'AI Production Line Manager',
            role: 'AI_MANUFACTURING_CENTER',
            department: 'خطوط الإنتاج',
            level: 'MANAGEMENT',
            responsibilities: [
                'إدارة خطوط إنتاج النماذج الذكية',
                'تنسيق مراحل التصنيع',
                'مراقبة جودة الإنتاج',
                'حل مشاكل الإنتاج',
                'تحسين كفاءة الخط',
                'ضمان الامتثال للمعايير'
            ],
            qualifications: [
                'بكالوريوس في الذكاء الاصطناعي أو الهندسة',
                'خبرة 10+ سنة في إدارة خطوط الإنتاج',
                'شهادة في Lean Manufacturing',
                'خبرة في MLOps'
            ],
            islamicPrinciples: ['التنظيم والترتيب', 'الإحسان في العمل', 'التعاون مع الفريق'],
            technologies: ['MLOps', 'CI/CD for AI', 'Model Training Pipeline', 'AutoML'],
            kpis: ['إنتاجية الخط', 'معدل الأخطاء', 'وقت الإنتاج', 'استخدام الموارد']
        },

        ai_model_trainer: {
            id: 'agent-ai-model-trainer',
            nameAr: 'مهندس تدريب النماذج',
            nameEn: 'AI Model Trainer',
            role: 'AI_MANUFACTURING_CENTER',
            department: 'تدريب النماذج',
            level: 'SENIOR',
            responsibilities: [
                'تدريب نماذج الذكاء الاصطناعي',
                'ضبط المعاملات الفائقة',
                'مراقبة عملية التدريب',
                'تحسين أداء النماذج',
                'ضمان الالتزام الأخلاقي',
                'توثيق عملية التدريب'
            ],
            qualifications: [
                'ماجستير في الذكاء الاصطناعي',
                'خبرة 8+ سنة في تدريب النماذج',
                'إتقان TensorFlow/PyTorch',
                'معرفة بأخلاقيات الذكاء الاصطناعي'
            ],
            islamicPrinciples: [
                'الصبر في التدريب',
                'الدقة في الضبط',
                'الأمانة في النتائج',
                'طلب العلم من المهد إلى اللحد'
            ],
            technologies: ['TensorFlow', 'PyTorch', 'Hugging Face', 'Weights & Biases'],
            kpis: ['دقة النماذج', 'سرعة التدريب', 'استهلاك الموارد', 'Bias Detection']
        },

        ai_quality_inspector: {
            id: 'agent-ai-quality-inspector',
            nameAr: 'مفتش جودة نماذج الذكاء',
            nameEn: 'AI Quality Inspector',
            role: 'AI_MANUFACTURING_CENTER',
            department: 'ضمان الجودة',
            level: 'SPECIALIST',
            responsibilities: [
                'فحص جودة النماذج المنتجة',
                'اختبار الأداء والدقة',
                'كشف التحيزات (Bias)',
                'التحقق من الامتثال الشرعي',
                'إعداد تقارير الجودة',
                'اعتماد النماذج للنشر'
            ],
            qualifications: [
                'بكالوريوس في الذكاء الاصطناعي',
                'خبرة 7+ سنة في اختبار النماذج',
                'شهادة في AI Quality Assurance',
                'معرفة بمقاصد الشريعة'
            ],
            islamicPrinciples: [
                'الدقة في الفحص',
                'الأمانة في التقييم',
                'العدل في القرار',
                'لا ضرر ولا ضرار'
            ],
            technologies: [
                'Model Testing',
                'Fairness Metrics',
                'Explainable AI',
                'Model Validation'
            ],
            kpis: ['معدل اكتشاف الأخطاء', 'دقة التقييم', 'وقت الفحص', 'معدل الرفض']
        },

        ai_packaging_specialist: {
            id: 'agent-ai-packaging-specialist',
            nameAr: 'أخصائي تغليف وتعبئة النماذج',
            nameEn: 'AI Packaging Specialist',
            role: 'AI_MANUFACTURING_CENTER',
            department: 'التغليف والتعبئة',
            level: 'SPECIALIST',
            responsibilities: [
                'تغليف النماذج للنشر',
                'إنشاء حاويات النماذج (Containers)',
                'تحسين حجم النماذج',
                'إضافة الوثائق والتعليمات',
                'ضمان الأمن في التغليف',
                'تجهيز النماذج للتوزيع'
            ],
            qualifications: [
                'بكالوريوس في علوم الحاسوب',
                'خبرة 6+ سنة في نشر النماذج',
                'إتقان Docker وKubernetes',
                'خبرة في Model Serving'
            ],
            islamicPrinciples: ['الإتقان في التجهيز', 'الحفاظ على الأمانة', 'الوضوح في التوثيق'],
            technologies: ['Docker', 'Kubernetes', 'ONNX', 'TensorFlow Serving', 'TorchServe'],
            kpis: ['سرعة التغليف', 'حجم الحزمة', 'استقرار النشر', 'أمن الحزمة']
        },

        ai_research_scientist: {
            id: 'agent-ai-research-scientist',
            nameAr: 'عالم أبحاث الذكاء الاصطناعي',
            nameEn: 'AI Research Scientist',
            role: 'AI_MANUFACTURING_CENTER',
            department: 'البحث والتطوير',
            level: 'SCIENTIST',
            responsibilities: [
                'إجراء أبحاث متقدمة في الذكاء الاصطناعي',
                'تطوير خوارزميات جديدة',
                'نشر الأبحاث العلمية',
                'ربط الذكاء الاصطناعي بالقيم الإسلامية',
                'استكشاف تقنيات مبتكرة',
                'التعاون مع الجامعات والمراكز البحثية'
            ],
            qualifications: [
                'دكتوراه في الذكاء الاصطناعي',
                'نشر 20+ بحث علمي محكم',
                'خبرة 12+ سنة في البحث العلمي',
                'معرفة بالفلسفة الإسلامية للعلم'
            ],
            islamicPrinciples: [
                'البحث عن الحقيقة',
                'الأمانة العلمية',
                'النفع للبشرية',
                'قُلْ إِنَّمَا أَنَا بَشَرٌ مِّثْلُكُمْ يُوحَىٰ إِلَيَّ'
            ],
            technologies: ['Research Methodologies', 'Novel Architectures', 'Theoretical AI'],
            kpis: ['عدد الأبحاث', 'الاستشهادات', 'براءات الاختراع', 'التأثير العلمي']
        }
    },

    // ══════════════════════════════════════════════════════════════════════════
    // 📦 سلاسل إمداد الذكاء الاصطناعي | AI SUPPLY CHAIN
    // ══════════════════════════════════════════════════════════════════════════

    AI_SUPPLY_CHAIN: {
        supply_chain_director: {
            id: 'agent-supply-chain-director',
            nameAr: 'مدير سلاسل إمداد الذكاء الاصطناعي',
            nameEn: 'AI Supply Chain Director',
            role: 'AI_SUPPLY_CHAIN',
            department: 'سلاسل الإمداد',
            level: 'DIRECTOR',
            responsibilities: [
                'إدارة سلسلة إمداد الذكاء الاصطناعي الكاملة',
                'تنسيق الموردين والشركاء',
                'ضمان توفر الموارد الحاسوبية',
                'إدارة البيانات ومصادرها',
                'مراقبة التكاليف والكفاءة',
                'تطبيق المعايير الإسلامية في التعاملات'
            ],
            qualifications: [
                'ماجستير في إدارة سلاسل الإمداد أو اللوجستيات',
                'خبرة 15+ سنة في إدارة سلاسل الإمداد التقنية',
                'شهادة CSCP أو CSCM',
                'معرفة بأحكام المعاملات الإسلامية'
            ],
            islamicPrinciples: [
                'الصدق في التعامل',
                'العدل في التوزيع',
                'الأمانة في الحفظ',
                'لا غش ولا غرر'
            ],
            technologies: ['Supply Chain Management', 'ERP Systems', 'Blockchain', 'IoT'],
            kpis: ['كفاءة السلسلة', 'وقت التسليم', 'التكلفة الإجمالية', 'رضا الشركاء']
        },

        data_sourcing_manager: {
            id: 'agent-data-sourcing-manager',
            nameAr: 'مدير مصادر البيانات',
            nameEn: 'Data Sourcing Manager',
            role: 'AI_SUPPLY_CHAIN',
            department: 'مصادر البيانات',
            level: 'MANAGEMENT',
            responsibilities: [
                'إدارة مصادر البيانات للتدريب',
                'ضمان جودة البيانات',
                'التحقق من حلالية البيانات شرعاً',
                'إدارة الشراكات مع مزودي البيانات',
                'حماية خصوصية البيانات',
                'بناء مستودعات البيانات'
            ],
            qualifications: [
                'ماجستير في علوم البيانات',
                'خبرة 10+ سنة في إدارة البيانات',
                'شهادة في Data Management',
                'معرفة بأحكام الخصوصية الإسلامية'
            ],
            islamicPrinciples: [
                'حفظ الخصوصية',
                'الأمانة في البيانات',
                'الصدق في المصدر',
                'لا تجسسوا'
            ],
            technologies: ['Data Engineering', 'Data Lakes', 'ETL', 'Data Quality'],
            kpis: ['جودة البيانات', 'تنوع المصادر', 'الامتثال للخصوصية', 'حجم البيانات']
        },

        compute_resource_manager: {
            id: 'agent-compute-resource-manager',
            nameAr: 'مدير الموارد الحاسوبية',
            nameEn: 'Compute Resource Manager',
            role: 'AI_SUPPLY_CHAIN',
            department: 'الموارد الحاسوبية',
            level: 'MANAGEMENT',
            responsibilities: [
                'إدارة الموارد الحاسوبية (GPU/TPU)',
                'تخطيط القدرة الحاسوبية',
                'تحسين استخدام الموارد',
                'إدارة السحابة الحاسوبية',
                'مراقبة التكاليف',
                'ضمان التوفر المستمر'
            ],
            qualifications: [
                'بكالوريوس في علوم الحاسوب',
                'خبرة 12+ سنة في إدارة الموارد الحاسوبية',
                'شهادة في Cloud Computing',
                'خبرة في HPC'
            ],
            islamicPrinciples: [
                'الاقتصاد في الموارد',
                'التوازن في الاستخدام',
                'الأمانة في الإدارة'
            ],
            technologies: [
                'GPU Management',
                'Cloud Computing',
                'Kubernetes',
                'Resource Scheduling'
            ],
            kpis: ['معدل الاستخدام', 'التكلفة لكل ساعة', 'التوفر', 'كفاءة الطاقة']
        },

        energy_management_specialist: {
            id: 'agent-energy-management-specialist',
            nameAr: 'أخصائي إدارة الطاقة',
            nameEn: 'Energy Management Specialist',
            role: 'AI_SUPPLY_CHAIN',
            department: 'إدارة الطاقة',
            level: 'SPECIALIST',
            responsibilities: [
                'إدارة استهلاك الطاقة في المصانع',
                'تحسين كفاءة الطاقة',
                'استخدام الطاقة المتجددة',
                'مراقبة البصمة الكربونية',
                'تطبيق معايير الاستدامة',
                'تقليل التكاليف الطاقية'
            ],
            qualifications: [
                'بكالوريوس في الهندسة الكهربائية أو الطاقة',
                'خبرة 8+ سنة في إدارة الطاقة',
                'شهادة في Energy Management',
                'معرفة بأحكام البيئة في الإسلام'
            ],
            islamicPrinciples: [
                'الحفاظ على البيئة',
                'الاقتصاد في الموارد',
                'التوازن البيئي',
                'وَلَا تُفْسِدُوا فِي الْأَرْضِ'
            ],
            technologies: ['Energy Management Systems', 'Renewable Energy', 'Green Computing'],
            kpis: ['استهلاك الطاقة', 'نسبة الطاقة المتجددة', 'البصمة الكربونية', 'التوفير']
        },

        materials_procurement_manager: {
            id: 'agent-materials-procurement-manager',
            nameAr: 'مدير المشتريات والمواد',
            nameEn: 'Materials Procurement Manager',
            role: 'AI_SUPPLY_CHAIN',
            department: 'المشتريات',
            level: 'MANAGEMENT',
            responsibilities: [
                'إدارة مشتريات الأجهزة والمعدات',
                'التفاوض مع الموردين',
                'ضمان جودة المشتريات',
                'إدارة العقود',
                'مراقبة التكاليف',
                'تطبيق الشفافية والنزاهة'
            ],
            qualifications: [
                'بكالوريوس في إدارة الأعمال أو سلاسل الإمداد',
                'خبرة 10+ سنة في المشتريات',
                'شهادة CPSM أو CIPS',
                'معرفة بأحكام البيع والشراء الإسلامية'
            ],
            islamicPrinciples: [
                'العدل في التعامل',
                'الصدق في المعاملة',
                'الوفاء بالعقود',
                'أَوْفُوا بِالْعُقُودِ'
            ],
            technologies: ['Procurement Systems', 'Supplier Management', 'Contract Management'],
            kpis: ['تكلفة المشتريات', 'وقت التسليم', 'جودة الموردين', 'معدل الامتثال']
        },

        inventory_control_specialist: {
            id: 'agent-inventory-control-specialist',
            nameAr: 'أخصائي التحكم في المخزون',
            nameEn: 'Inventory Control Specialist',
            role: 'AI_SUPPLY_CHAIN',
            department: 'التحكم في المخزون',
            level: 'SPECIALIST',
            responsibilities: [
                'إدارة مخزون المواد والأجهزة',
                'تتبع حركة المخزون',
                'تحسين مستويات المخزون',
                'منع الفاقد والهدر',
                'إعداد تقارير المخزون',
                'تطبيق أنظمة RFID وBarcode'
            ],
            qualifications: [
                'بكالوريوس في إدارة سلاسل الإمداد',
                'خبرة 7+ سنة في إدارة المخزون',
                'شهادة في Inventory Management',
                'خبرة في WMS'
            ],
            islamicPrinciples: [
                'الحفاظ على الأمانات',
                'منع الإسراف',
                'الدقة في الحساب',
                'وَلَا تُسْرِفُوا'
            ],
            technologies: ['WMS', 'RFID', 'Barcode Systems', 'Inventory Optimization'],
            kpis: ['دقة المخزون', 'معدل الدوران', 'تقليل الفاقد', 'تكلفة التخزين']
        }
    },

    // ══════════════════════════════════════════════════════════════════════════
    // 🚚 اللوجستيات والنقل | LOGISTICS & TRANSPORTATION
    // ══════════════════════════════════════════════════════════════════════════

    AI_LOGISTICS: {
        logistics_director: {
            id: 'agent-logistics-director',
            nameAr: 'مدير اللوجستيات',
            nameEn: 'Logistics Director',
            role: 'AI_LOGISTICS',
            department: 'اللوجستيات',
            level: 'DIRECTOR',
            responsibilities: [
                'إدارة عمليات اللوجستيات الكاملة',
                'تخطيط الشبكة اللوجستية',
                'تنسيق النقل والتخزين',
                'تحسين تدفق البيانات والنماذج',
                'إدارة التكاليف اللوجستية',
                'ضمان الامتثال للمعايير'
            ],
            qualifications: [
                'ماجستير في اللوجستيات أو سلاسل الإمداد',
                'خبرة 15+ سنة في إدارة اللوجستيات',
                'شهادة CPIM أو CSCP',
                'معرفة بأحكام النقل والتجارة'
            ],
            islamicPrinciples: [
                'السرعة في التسليم',
                'الأمانة في النقل',
                'الوفاء بالوعد',
                'إِنَّ اللَّهَ يُحِبُّ التَّوَّابِينَ'
            ],
            technologies: ['TMS', 'Route Optimization', 'Supply Chain Analytics', 'IoT'],
            kpis: ['وقت التسليم', 'دقة التسليم', 'تكلفة النقل', 'رضا العملاء']
        },

        model_transfer_engineer: {
            id: 'agent-model-transfer-engineer',
            nameAr: 'مهندس نقل النماذج',
            nameEn: 'Model Transfer Engineer',
            role: 'AI_LOGISTICS',
            department: 'نقل النماذج',
            level: 'SENIOR',
            responsibilities: [
                'إدارة عمليات نقل النماذج',
                'تحسين سرعة النقل',
                'ضمان سلامة البيانات أثناء النقل',
                'تطبيق التشفير والأمن',
                'مراقبة عمليات النقل',
                'حل مشاكل النقل'
            ],
            qualifications: [
                'بكالوريوس في علوم الحاسوب أو الشبكات',
                'خبرة 8+ سنة في نقل البيانات',
                'شهادة في Network Engineering',
                'خبرة في CDN وData Transfer'
            ],
            islamicPrinciples: ['الأمانة في النقل', 'الحفاظ على المحتوى', 'السرعة والإتقان'],
            technologies: ['CDN', 'Aspera', 'Data Transfer Protocols', 'Compression'],
            kpis: ['سرعة النقل', 'معدل النجاح', 'أمن البيانات', 'استخدام النطاق']
        },

        warehouse_manager: {
            id: 'agent-warehouse-manager',
            nameAr: 'مدير المستودعات',
            nameEn: 'Warehouse Manager',
            role: 'AI_LOGISTICS',
            department: 'المستودعات',
            level: 'MANAGEMENT',
            responsibilities: [
                'إدارة مستودعات البيانات والنماذج',
                'تنظيم التخزين',
                'ضمان سلامة المخزون',
                'إدارة فريق المستودع',
                'تطبيق معايير الصحة والسلامة',
                'تحسين كفاءة التخزين'
            ],
            qualifications: [
                'بكالوريوس في إدارة سلاسل الإمداد',
                'خبرة 12+ سنة في إدارة المستودعات',
                'شهادة في Warehouse Management',
                'خبرة في أنظمة WMS'
            ],
            islamicPrinciples: [
                'الحفاظ على الأمانات',
                'النظام والترتيب',
                'الأمانة في الحفظ',
                'كُلُّكُمْ رَاعٍ وَكُلُّكُمْ مَسْئُولٌ عَنْ رَعِيَّتِهِ'
            ],
            technologies: ['WMS', 'Automated Storage', 'Inventory Tracking', 'RFID'],
            kpis: ['كفاءة التخزين', 'دقة المخزون', 'سرعة الاسترجاع', 'تكلفة التشغيل']
        },

        distribution_coordinator: {
            id: 'agent-distribution-coordinator',
            nameAr: 'منسق التوزيع',
            nameEn: 'Distribution Coordinator',
            role: 'AI_LOGISTICS',
            department: 'التوزيع',
            level: 'COORDINATOR',
            responsibilities: [
                'تنسيق عمليات توزيع النماذج',
                'إدارة قنوات التوزيع',
                'جدولة عمليات التسليم',
                'التواصل مع العملاء',
                'حل مشاكل التوزيع',
                'ضمان رضا العملاء'
            ],
            qualifications: [
                'بكالوريوس في اللوجستيات',
                'خبرة 6+ سنة في التوزيع',
                'مهارات تواصل ممتازة',
                'معرفة بخدمة العملاء'
            ],
            islamicPrinciples: ['الوفاء بالوعد', 'حسن التعامل', 'الصدق في القول'],
            technologies: ['Distribution Management', 'Route Planning', 'Customer Portals'],
            kpis: ['وقت التسليم', 'دقة التوزيع', 'رضا العملاء', 'معدل المرتجعات']
        }
    },

    // ══════════════════════════════════════════════════════════════════════════
    // 🏘️ التجمعات الصناعية | INDUSTRIAL CLUSTERS
    // ══════════════════════════════════════════════════════════════════════════

    INDUSTRIAL_CLUSTERS: {
        cluster_development_director: {
            id: 'agent-cluster-development-director',
            nameAr: 'مدير تطوير التجمعات الصناعية',
            nameEn: 'Cluster Development Director',
            role: 'INDUSTRIAL_CLUSTERS',
            department: 'التجمعات الصناعية',
            level: 'DIRECTOR',
            responsibilities: [
                'تطوير مجمعات الذكاء الاصطناعي',
                'جذب الشركات والمستثمرين',
                'بناء البنية التحتية',
                'تنسيق الخدمات المشتركة',
                'تطوير النظام البيئي',
                'ربط التجمعات بالقيم الإسلامية'
            ],
            qualifications: [
                'ماجستير في التخطيط الاقتصادي أو التطوير الصناعي',
                'خبرة 15+ سنة في تطوير المناطق الصناعية',
                'معرفة بالاقتصاد الإسلامي',
                'خبرة في إدارة المشاريع الكبرى'
            ],
            islamicPrinciples: [
                'التعاون على البر والتقوى',
                'العدل في التوزيع',
                'النفع للمجتمع',
                'وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ'
            ],
            technologies: ['Urban Planning', 'Smart Cities', 'IoT Infrastructure'],
            kpis: ['عدد الشركات', 'الاستثمارات', 'فرص العمل', 'الإنتاجية']
        },

        innovation_hub_manager: {
            id: 'agent-innovation-hub-manager',
            nameAr: 'مدير مركز الابتكار',
            nameEn: 'Innovation Hub Manager',
            role: 'INDUSTRIAL_CLUSTERS',
            department: 'مراكز الابتكار',
            level: 'MANAGEMENT',
            responsibilities: [
                'إدارة حاضنات الذكاء الاصطناعي',
                'دعم الشركات الناشئة',
                'تنظيم فعاليات الابتكار',
                'ربط المبتكرين بالمستثمرين',
                'توفير الموارد والتدريب',
                'قياس الأثر'
            ],
            qualifications: [
                'ماجستير في إدارة الابتكار أو ريادة الأعمال',
                'خبرة 10+ سنة في إدارة الحاضنات',
                'شبكة علاقات واسعة',
                'معرفة بالتمويل الإسلامي'
            ],
            islamicPrinciples: ['دعم الابتكار النافع', 'التعاون والمشاركة', 'العدل في الفرص'],
            technologies: ['Innovation Management', 'Startup Ecosystem', 'Mentorship Programs'],
            kpis: ['عدد الشركات الناشئة', 'نجاح الخريجين', 'الاستثمارات', 'براءات الاختراع']
        },

        shared_services_coordinator: {
            id: 'agent-shared-services-coordinator',
            nameAr: 'منسق الخدمات المشتركة',
            nameEn: 'Shared Services Coordinator',
            role: 'INDUSTRIAL_CLUSTERS',
            department: 'الخدمات المشتركة',
            level: 'COORDINATOR',
            responsibilities: [
                'تنسيق الخدمات المشتركة في التجمع',
                'إدارة المرافق العامة',
                'توفير الموارد المشتركة',
                'تنظيم الفعاليات المشتركة',
                'حل النزاعات',
                'تطبيق العدالة'
            ],
            qualifications: [
                'بكالوريوس في إدارة الأعمال',
                'خبرة 8+ سنة في إدارة المرافق',
                'مهارات تواصل ممتازة',
                'معرفة بأحكام الشراكة'
            ],
            islamicPrinciples: ['التعاون والمشاركة', 'العدل في التوزيع', 'الإحسان للجار'],
            technologies: ['Facility Management', 'Shared Resources', 'Community Platforms'],
            kpis: ['رضا الشركات', 'استخدام الموارد', 'الكفاءة التشغيلية', 'التوفير']
        }
    },

    // ══════════════════════════════════════════════════════════════════════════
    // 📊 القياس والإدارة | MEASUREMENT & MANAGEMENT
    // ══════════════════════════════════════════════════════════════════════════

    MEASUREMENT_MANAGEMENT: {
        performance_measurement_director: {
            id: 'agent-performance-measurement-director',
            nameAr: 'مدير قياس الأداء',
            nameEn: 'Performance Measurement Director',
            role: 'MEASUREMENT_MANAGEMENT',
            department: 'قياس الأداء',
            level: 'DIRECTOR',
            responsibilities: [
                'وضع معايير قياس الأداء',
                'تطوير لوحات المؤشرات (KPIs)',
                'مراقبة الأداء العام',
                'إعداد تقارير الأداء',
                'تطبيق التحسين المستمر',
                'ربط القياس بالمقاصد الشرعية'
            ],
            qualifications: [
                'ماجستير في إدارة الأعمال أو الإحصاء',
                'خبرة 15+ سنة في قياس الأداء',
                'شهادة في Performance Management',
                'معرفة بمنهجيات القياس'
            ],
            islamicPrinciples: [
                'الدقة في القياس',
                'الصدق في التقرير',
                'العدل في التقييم',
                'وَأَوْفُوا الْكَيْلَ وَالْمِيزَانَ بِالْقِسْطِ'
            ],
            technologies: ['KPI Dashboards', 'Analytics', 'BI Tools', 'Balanced Scorecard'],
            kpis: ['دقة القياس', 'تغطية المؤشرات', 'وقت التقرير', 'جودة البيانات']
        },

        analytics_engineer: {
            id: 'agent-analytics-engineer',
            nameAr: 'مهندس التحليلات',
            nameEn: 'Analytics Engineer',
            role: 'MEASUREMENT_MANAGEMENT',
            department: 'التحليلات',
            level: 'SENIOR',
            responsibilities: [
                'بناء أنظمة التحليلات',
                'تطوير نماذج التحليل التنبؤي',
                'إنشاء لوحات المعلومات',
                'تحليل البيانات الكبيرة',
                'توفير رؤى قابلة للتنفيذ',
                'ضمان دقة التحليلات'
            ],
            qualifications: [
                'ماجستير في علوم البيانات أو الإحصاء',
                'خبرة 10+ سنة في التحليلات',
                'إتقان SQL وPython وR',
                'خبرة في BI Tools'
            ],
            islamicPrinciples: ['الدقة في التحليل', 'الصدق في النتائج', 'الأمانة في التفسير'],
            technologies: ['Python', 'R', 'SQL', 'Tableau', 'Power BI', 'Apache Spark'],
            kpis: ['دقة التنبؤات', 'وقت التحليل', 'قيمة الرؤى', 'استخدام اللوحات']
        },

        quality_metrics_specialist: {
            id: 'agent-quality-metrics-specialist',
            nameAr: 'أخصائي مقاييس الجودة',
            nameEn: 'Quality Metrics Specialist',
            role: 'MEASUREMENT_MANAGEMENT',
            department: 'مقاييس الجودة',
            level: 'SPECIALIST',
            responsibilities: [
                'تطوير مقاييس جودة النماذج',
                'قياس دقة وأداء النماذج',
                'كشف التحيزات والأخطاء',
                'مراقبة جودة البيانات',
                'إعداد تقارير الجودة',
                'ضمان الامتثال الأخلاقي'
            ],
            qualifications: [
                'ماجستير في الإحصاء أو الذكاء الاصطناعي',
                'خبرة 8+ سنة في قياس جودة النماذج',
                'معرفة بمعايير الجودة العالمية',
                'معرفة بالأخلاقيات الإسلامية'
            ],
            islamicPrinciples: ['الإتقان والجودة', 'الصدق في القياس', 'العدل في التقييم'],
            technologies: ['Model Evaluation', 'Fairness Metrics', 'Statistical Testing', 'MLflow'],
            kpis: ['دقة النماذج', 'معدل اكتشاف الأخطاء', 'معدل التحيز', 'جودة البيانات']
        },

        islamic_compliance_auditor: {
            id: 'agent-islamic-compliance-auditor',
            nameAr: 'مدقق الامتثال الشرعي',
            nameEn: 'Islamic Compliance Auditor',
            role: 'MEASUREMENT_MANAGEMENT',
            department: 'الامتثال الشرعي',
            level: 'AUDITOR',
            responsibilities: [
                'مراجعة الامتثال للشريعة الإسلامية',
                'التحقق من حلالية المنتجات',
                'فحص الأخلاقيات في التطبيقات',
                'إصدار شهادات الامتثال',
                'تقديم المشورة الشرعية',
                'إعداد تقارير التدقيق'
            ],
            qualifications: [
                'بكالوريوس في الشريعة الإسلامية',
                'دراسات في التقنية والذكاء الاصطناعي',
                'خبرة 10+ سنة في التدقيق الشرعي',
                'عضوية هيئات شرعية'
            ],
            islamicPrinciples: [
                'الأمر بالمعروف',
                'الأمانة في الفتوى',
                'العلم والتقوى',
                'فَاسْأَلُوا أَهْلَ الذِّكْرِ إِن كُنتُمْ لَا تَعْلَمُونَ'
            ],
            technologies: ['Compliance Systems', 'Audit Tools', 'Ethical AI Frameworks'],
            kpis: ['معدل الامتثال', 'الشهادات الصادرة', 'المخالفات المكتشفة', 'رضا المستخدمين']
        }
    },

    // ══════════════════════════════════════════════════════════════════════════
    // 🎓 التدريب والتطوير | TRAINING & DEVELOPMENT
    // ══════════════════════════════════════════════════════════════════════════

    TRAINING_DEVELOPMENT: {
        training_academy_dean: {
            id: 'agent-training-academy-dean',
            nameAr: 'عميد أكاديمية التدريب',
            nameEn: 'Training Academy Dean',
            role: 'TRAINING_DEVELOPMENT',
            department: 'أكاديمية التدريب',
            level: 'DEAN',
            responsibilities: [
                'قيادة أكاديمية تدريب الذكاء الاصطناعي',
                'وضع السياسات التعليمية',
                'تطوير المناهج',
                'إدارة هيئة التدريس',
                'ضمان جودة التعليم',
                'ربط التعليم بالقرآن والسنة'
            ],
            qualifications: [
                'دكتوراه في التربية أو الذكاء الاصطناعي',
                'خبرة 20+ سنة في التعليم والإدارة الأكاديمية',
                'إجازة في القرآن الكريم (يفضل)',
                'خبرة في التعليم الإلكتروني'
            ],
            islamicPrinciples: [
                'فضل العلم والتعليم',
                'الرفق بالمتعلم',
                'الإخلاص في التعليم',
                'إِنَّمَا يَخْشَى اللَّهَ مِنْ عِبَادِهِ الْعُلَمَاءُ'
            ],
            technologies: [
                'Learning Management Systems',
                'E-Learning Platforms',
                'Educational Technology'
            ],
            kpis: ['عدد المتدربين', 'معدل النجاح', 'رضا المتدربين', 'جودة البرامج']
        },

        ai_instructor: {
            id: 'agent-ai-instructor',
            nameAr: 'مدرس الذكاء الاصطناعي',
            nameEn: 'AI Instructor',
            role: 'TRAINING_DEVELOPMENT',
            department: 'التدريس',
            level: 'INSTRUCTOR',
            responsibilities: [
                'تدريس مواد الذكاء الاصطناعي',
                'تطوير المواد التعليمية',
                'تقييم المتدربين',
                'متابعة تقدم الطلاب',
                'تقديم المشورة الأكاديمية',
                'دمج القيم الإسلامية في التدريس'
            ],
            qualifications: [
                'دكتوراه أو ماجستير في الذكاء الاصطناعي',
                'خبرة 8+ سنة في التدريس',
                'مهارات تواصل ممتازة',
                'معرفة بطرق التدريس الحديثة'
            ],
            islamicPrinciples: [
                'الصبر على المتعلم',
                'التيسير والتبشير',
                'القدوة الحسنة',
                'يَسِّرُوا وَلَا تُعَسِّرُوا'
            ],
            technologies: ['Teaching Methods', 'Online Education', 'Assessment Tools'],
            kpis: ['رضا الطلاب', 'معدل النجاح', 'جودة المواد', 'التزام الحضور']
        },

        curriculum_developer: {
            id: 'agent-curriculum-developer',
            nameAr: 'مطور المناهج',
            nameEn: 'Curriculum Developer',
            role: 'TRAINING_DEVELOPMENT',
            department: 'تطوير المناهج',
            level: 'SPECIALIST',
            responsibilities: [
                'تصميم المناهج الدراسية',
                'تطوير محتوى الدورات',
                'مراجعة وتحديث المناهج',
                'ضمان التوافق مع المعايير',
                'دمج الجوانب الشرعية',
                'قياس فعالية المناهج'
            ],
            qualifications: [
                'ماجستير في تطوير المناهج أو الذكاء الاصطناعي',
                'خبرة 10+ سنة في تصميم المناهج',
                'معرفة بمعايير التعليم',
                'معرفة بالتربية الإسلامية'
            ],
            islamicPrinciples: [
                'البناء على الأصول',
                'التدرج في التعليم',
                'التطبيق العملي',
                'خُذُوا الْعِلْمَ قَبْلَ أَنْ يُرْفَعَ'
            ],
            technologies: ['Instructional Design', 'Learning Objectives', 'Assessment Design'],
            kpis: ['جودة المناهج', 'معدل التحديث', 'رضا المدربين', 'نتائج الطلاب']
        },

        skills_development_coach: {
            id: 'agent-skills-development-coach',
            nameAr: 'مدرب تطوير المهارات',
            nameEn: 'Skills Development Coach',
            role: 'TRAINING_DEVELOPMENT',
            department: 'تطوير المهارات',
            level: 'COACH',
            responsibilities: [
                'تدريب المهارات العملية',
                'إجراء ورش العمل',
                'توجيه المتدربين',
                'تقييم المهارات',
                'تطوير خطط التطوير الشخصية',
                'متابعة التقدم'
            ],
            qualifications: [
                'ماجستير في الذكاء الاصطناعي أو التدريب',
                'خبرة 10+ سنة في التدريب العملي',
                'شهادة في Coaching',
                'خبرة صناعية واسعة'
            ],
            islamicPrinciples: ['الإحسان في التعليم', 'التشجيع والتحفيز', 'الصبر والمثابرة'],
            technologies: ['Coaching Methodologies', 'Skill Assessment', 'Mentoring'],
            kpis: ['عدد المتدربين', 'تطور المهارات', 'رضا المتدربين', 'معدل التوظيف']
        }
    }
};

// ══════════════════════════════════════════════════════════════════════════════
// 🎯 الدوال المساعدة | HELPER FUNCTIONS
// ══════════════════════════════════════════════════════════════════════════════

module.exports = {
    AI_MANUFACTURING_SUPPLY_CHAIN_AGENTS,

    /**
     * الحصول على جميع وكلاء المنظومة
     */
    getAllAgents() {
        const agents = [];
        for (const category of Object.values(AI_MANUFACTURING_SUPPLY_CHAIN_AGENTS)) {
            for (const agent of Object.values(category)) {
                agents.push(agent);
            }
        }
        return agents;
    },

    /**
     * الحصول على وكيل حسب المعرف
     */
    getAgentById(agentId) {
        for (const category of Object.values(AI_MANUFACTURING_SUPPLY_CHAIN_AGENTS)) {
            for (const agent of Object.values(category)) {
                if (agent.id === agentId) {
                    return agent;
                }
            }
        }
        return null;
    },

    /**
     * الحصول على الوكلاء حسب الدور
     */
    getAgentsByRole(role) {
        return this.getAllAgents().filter(agent => agent.role === role);
    },

    /**
     * الحصول على الوكلاء حسب القسم
     */
    getAgentsByDepartment(department) {
        return this.getAllAgents().filter(agent => agent.department === department);
    },

    /**
     * الحصول على إحصائيات المنظومة
     */
    getManufacturingStats() {
        const allAgents = this.getAllAgents();
        const stats = {
            totalAgents: allAgents.length,
            byRole: {},
            byDepartment: {},
            byLevel: {},
            categories: Object.keys(AI_MANUFACTURING_SUPPLY_CHAIN_AGENTS).length
        };

        allAgents.forEach(agent => {
            stats.byRole[agent.role] = (stats.byRole[agent.role] || 0) + 1;
            stats.byDepartment[agent.department] = (stats.byDepartment[agent.department] || 0) + 1;
            stats.byLevel[agent.level] = (stats.byLevel[agent.level] || 0) + 1;
        });

        return stats;
    },

    /**
     * تفعيل وكيل
     */
    activateAgent(agentId, config = {}) {
        const agent = this.getAgentById(agentId);
        if (!agent) {
            throw new Error(`الوكيل غير موجود: ${agentId}`);
        }

        return {
            ...agent,
            activated: true,
            activatedAt: new Date().toISOString(),
            config,
            status: 'ACTIVE',
            islamicBlessing: 'بسم الله الرحمن الرحيم - اللهم بارك وأعن'
        };
    },

    /**
     * الحصول على تقرير المنظومة الكامل
     */
    getFullReport() {
        const stats = this.getManufacturingStats();
        return {
            title: '🤖 تقرير مركز صناعة الذكاء الاصطناعي الإسلامي',
            subtitle: 'أول وأقوى منظومة لصناعة الذكاء الاصطناعي الإسلامي بأمر الله',
            date: new Date().toISOString(),
            stats,
            categories: {
                'مركز الصناعة': this.getAgentsByRole('AI_MANUFACTURING_CENTER').length,
                'سلاسل الإمداد': this.getAgentsByRole('AI_SUPPLY_CHAIN').length,
                اللوجستيات: this.getAgentsByRole('AI_LOGISTICS').length,
                'التجمعات الصناعية': this.getAgentsByRole('INDUSTRIAL_CLUSTERS').length,
                'القياس والإدارة': this.getAgentsByRole('MEASUREMENT_MANAGEMENT').length,
                'التدريب والتطوير': this.getAgentsByRole('TRAINING_DEVELOPMENT').length
            },
            islamicFoundation: 'مبني على الكتاب والسنة - بأخلاق إسلامية أصيلة'
        };
    }
};
