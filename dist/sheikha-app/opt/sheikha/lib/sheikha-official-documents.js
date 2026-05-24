/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * منظومة شيخة — الأوراق الرسمية والختم والتوقيع والنماذج
 * رقمنة كاملة + تعبئة آلية + قوالب + أختام + توقيعات رقمية
 * ═══════════════════════════════════════════════════════════════════════════════
 * "يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا تَدَايَنتُم بِدَيْنٍ إِلَىٰ أَجَلٍ مُّسَمًّى فَاكْتُبُوهُ" — البقرة 282
 * المالك: سلمان أحمد بن سلمان الراجح | أحوال مدنية: 1031605270
 * ═══════════════════════════════════════════════════════════════════════════════
 */
'use strict';

class SheikhaOfficialDocuments {
    constructor() {
        this.name = 'منظومة شيخة — الأوراق الرسمية والختم والتوقيع والنماذج';
        this.version = '1.0.0';

        // ═══════ البيانات الثابتة للمنشأة ═══════
        this.establishment = {
            nameAr: 'مؤسسة سلمان أحمد بن سلمان الراجح التجارية',
            nameEn: 'Establishment SALMANE AHMAD BEN SALMANE AL-RAJH Commercial',
            brandAr: 'شيخة للمعادن والتجارة',
            brandEn: 'Sheikha Metals & Trading',
            crNumber: '2051263653',
            unifiedNumber: '7049031003',
            vatNumber: '', // يُضاف بعد التسجيل في ZATCA
            address: {
                buildingNumber: '8009',
                city: 'الخبر',
                cityEn: 'Al Khubar',
                region: 'المنطقة الشرقية',
                regionEn: 'Eastern Province',
                postalCode: '34218',
                additionalCode: '5193',
                country: 'المملكة العربية السعودية',
                countryEn: 'Kingdom of Saudi Arabia'
            },
            contact: {
                phone: '', // يُضاف
                mobile: '', // يُضاف
                email: 'market@sheikha.top',
                website: 'sheikha.top'
            }
        };

        this.owner = {
            fullNameAr: 'سلمان أحمد بن سلمان الراجح',
            fullNameEn: 'SALMAN AHMED S ALRAJEH',
            title: 'المؤسس والمدير العام',
            titleEn: 'Founder & General Manager',
            nationalId: '1031605270',
            nationality: 'سعودي',
            certification: 'CISCC — مستشار دولي معتمد في سلاسل الإمداد والتوريد',
            certificationEn: 'CISCC — Certified International Supply Chain Consultant',
            certifyingBody: 'IPSCMI — المعهد الدولي للمشتريات وإدارة سلاسل الإمداد',
            certifyingBodyEn: 'International Purchasing and Supply Chain Management Institute'
        };
    }

    getDashboard() {
        return {
            بسم_الله: 'بسم الله الرحمن الرحيم',
            name: this.name,
            owner: `${this.owner.fullNameAr} — ${this.owner.nationalId}`,
            stats: {
                officialDocTemplates: 22,
                stampDesigns: 4,
                signatureTypes: 3,
                autoFillForms: 18,
                governmentForms: 12,
                commercialForms: 10,
                internalForms: 8
            }
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // رقمنة شهادة CISCC
    // ═══════════════════════════════════════════════════════════════════════════
    getCISCCCertificate() {
        return {
            بسم_الله: 'بسم الله الرحمن الرحيم',
            title: 'رقمنة الشهادة المهنية الدولية — CISCC',

            certificate: {
                name: 'CISCC — Certified International Supply Chain Consultant',
                nameAr: 'مستشار دولي معتمد في سلاسل الإمداد والتوريد',
                issuingBody: 'IPSCMI — International Purchasing and Supply Chain Management Institute',
                issuingBodyAr: 'المعهد الدولي للمشتريات وإدارة سلاسل الإمداد',
                holder: {
                    nameEn: 'SALMAN AHMED S ALRAJEH',
                    nameAr: 'سلمان أحمد بن سلمان الراجح',
                    nationalId: '1031605270'
                },
                status: 'حاصل عليها ✅ — معتمد دولياً',
                recognition: 'معترف بها دولياً في 100+ دولة',
                scope: [
                    'إدارة سلاسل الإمداد الدولية',
                    'المشتريات الدولية والتوريد',
                    'إدارة اللوجستيك العالمي',
                    'تحسين سلاسل التوريد',
                    'إدارة المخاطر في سلاسل الإمداد',
                    'التفاوض على العقود الدولية',
                    'استراتيجيات المصادر العالمية (Global Sourcing)',
                    'إدارة المخزون والتوزيع'
                ],
                competencies: [
                    { area: 'Supply Chain Strategy', areaAr: 'استراتيجية سلسلة الإمداد', level: 'متقدم' },
                    { area: 'Procurement & Sourcing', areaAr: 'المشتريات والتوريد', level: 'متقدم' },
                    { area: 'Logistics Management', areaAr: 'إدارة اللوجستيك', level: 'متقدم' },
                    { area: 'Inventory Management', areaAr: 'إدارة المخزون', level: 'متقدم' },
                    { area: 'Risk Management', areaAr: 'إدارة المخاطر', level: 'متقدم' },
                    { area: 'Contract Negotiation', areaAr: 'التفاوض على العقود', level: 'متقدم' },
                    { area: 'International Trade', areaAr: 'التجارة الدولية', level: 'متقدم' },
                    { area: 'Quality Management', areaAr: 'إدارة الجودة', level: 'متقدم' },
                    { area: 'Supply Chain Analytics', areaAr: 'تحليلات سلسلة الإمداد', level: 'متقدم' },
                    { area: 'Sustainable Supply Chain', areaAr: 'سلسلة الإمداد المستدامة', level: 'متقدم' }
                ],
                valueForSheikha: [
                    'تأهيل كامل لإدارة سلاسل إمداد المعادن والسكراب دولياً',
                    'القدرة على التفاوض مع الشبكات العالمية من موقع خبرة',
                    'اعتماد دولي يفتح أبواب الشراكات مع كبرى الشركات',
                    'ميزة تنافسية حقيقية — قليل من يجمع بين الخبرة العملية والاعتماد الدولي',
                    'مصداقية عالية عند التقدم للمناقصات الحكومية (أرامكو + سابك + معادن)',
                    'يؤهل لعضوية مجالس استشارية في سلاسل الإمداد'
                ]
            },

            ipscmiInfo: {
                name: 'International Purchasing and Supply Chain Management Institute',
                abbreviation: 'IPSCMI',
                type: 'معهد دولي متخصص في المشتريات وسلاسل الإمداد',
                certifications: [
                    'CISCC — Certified International Supply Chain Consultant',
                    'CISCM — Certified International Supply Chain Manager',
                    'CIPM — Certified International Purchasing Manager',
                    'CIPS — Certified International Purchasing Specialist'
                ],
                recognition: 'معترف بها دولياً ومحلياً في المملكة العربية السعودية'
            }
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // الأختام الرسمية
    // ═══════════════════════════════════════════════════════════════════════════
    getOfficialStamps() {
        return {
            بسم_الله: 'بسم الله الرحمن الرحيم',
            title: 'الأختام الرسمية — التصاميم والمواصفات',

            stamps: [
                {
                    id: 'stamp-main',
                    name: 'الختم الرئيسي — ختم المؤسسة',
                    shape: 'دائري',
                    diameter: '40 مم',
                    color: 'أزرق داكن (Pantone 289C)',
                    content: {
                        outerRing: 'مؤسسة سلمان أحمد بن سلمان الراجح التجارية',
                        innerRing: 'Establishment SALMANE AHMAD BEN SALMANE AL-RAJH Commercial',
                        center: ['شيخة', 'Sheikha'],
                        bottomText: `سجل تجاري: 2051263653`
                    },
                    usage: 'جميع الوثائق والعقود والمراسلات الرسمية',
                    mandatory: true,
                    digitalFormat: {
                        type: 'PNG شفاف + SVG',
                        resolution: '300 DPI',
                        hasQRCode: true,
                        qrContent: 'رابط التحقق من صحة الوثيقة'
                    }
                },
                {
                    id: 'stamp-contracts',
                    name: 'ختم العقود والاتفاقيات',
                    shape: 'مستطيل مستدير الزوايا',
                    size: '60×25 مم',
                    color: 'أحمر داكن (Pantone 187C)',
                    content: {
                        line1: 'مؤسسة سلمان أحمد بن سلمان الراجح التجارية',
                        line2: 'سجل تجاري: 2051263653 | الخبر',
                        line3: 'تم الموافقة والتوقيع ✓'
                    },
                    usage: 'العقود التجارية وأوامر الشراء والبيع',
                    mandatory: true
                },
                {
                    id: 'stamp-received',
                    name: 'ختم الاستلام (وارد)',
                    shape: 'مستطيل',
                    size: '50×30 مم',
                    color: 'أخضر (Pantone 349C)',
                    content: {
                        title: 'وارد — RECEIVED',
                        fields: ['التاريخ: ___/___/___', 'الرقم: ___________', 'القسم: ___________']
                    },
                    usage: 'المراسلات والوثائق الواردة'
                },
                {
                    id: 'stamp-confidential',
                    name: 'ختم سري',
                    shape: 'مستطيل',
                    size: '40×15 مم',
                    color: 'أحمر (Pantone 185C)',
                    content: { text: '⚠ سري — CONFIDENTIAL' },
                    usage: 'الوثائق السرية والبيانات المالية'
                }
            ],

            stampOrderInfo: {
                vendors: ['مطابع محلية', 'ختم إلكتروني رقمي', 'طابعة ختم ذاتية الحبر'],
                costPhysical: '50-200 ر.س/ختم',
                costDigital: 'مجاني — يُنتج ضمن المنظومة',
                recommendation: 'إنتاج كلا النوعين: فيزيائي للمكتب + رقمي للمنصة'
            }
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // التوقيعات الرسمية
    // ═══════════════════════════════════════════════════════════════════════════
    getSignatures() {
        return {
            بسم_الله: 'بسم الله الرحمن الرحيم',
            title: 'التوقيعات الرسمية — أنواعها ومواصفاتها',

            signatureTypes: [
                {
                    type: 'handwritten',
                    name: 'التوقيع اليدوي (الحبر)',
                    nameEn: 'Handwritten Signature',
                    usage: 'العقود الورقية + الشيكات + المستندات الحكومية',
                    signer: 'سلمان أحمد بن سلمان الراجح',
                    digitization: {
                        method: 'مسح ضوئي بخلفية شفافة (PNG)',
                        resolution: '600 DPI',
                        format: 'PNG (transparent) + SVG',
                        security: 'يُحفظ مشفر — يُستخدم فقط بتفويض المالك'
                    },
                    legalNote: 'التوقيع اليدوي ملزم قانونياً في المملكة العربية السعودية'
                },
                {
                    type: 'digital',
                    name: 'التوقيع الرقمي (الإلكتروني)',
                    nameEn: 'Digital Signature',
                    usage: 'العقود الإلكترونية + الفواتير + المراسلات الرقمية',
                    standard: 'معتمد وفق نظام التعاملات الإلكترونية السعودي',
                    platforms: [
                        { name: 'نافذ', platform: 'nafith.sa', usage: 'عقود إلكترونية — وزارة العدل', mandatory: true },
                        { name: 'فاتورة', platform: 'zatca.gov.sa', usage: 'فوترة إلكترونية — ZATCA', mandatory: true },
                        { name: 'أبشر أعمال', platform: 'absher.sa', usage: 'خدمات حكومية' },
                        { name: 'النفاذ الوطني', platform: 'iam.gov.sa', usage: 'تسجيل دخول موحد — أساس كل شيء' }
                    ],
                    technology: {
                        standard: 'PKI — Public Key Infrastructure',
                        provider: 'المركز الوطني للتصديق الرقمي (NCDC)',
                        certificate: 'شهادة توقيع رقمي X.509',
                        cost: '500-2,000 ر.س/سنة',
                        note: 'التوقيع الرقمي له حجية قانونية كاملة بموجب نظام التعاملات الإلكترونية (2007)'
                    }
                },
                {
                    type: 'electronic',
                    name: 'التوقيع الإلكتروني البسيط',
                    nameEn: 'Simple Electronic Signature',
                    usage: 'مراسلات داخلية + طلبات شراء + إقرارات بسيطة',
                    method: 'اسم + تاريخ + IP + كلمة مرور',
                    legalWeight: 'مقبول للمعاملات غير الجوهرية',
                    note: 'كافٍ للاتصالات الداخلية وأوامر الشراء الصغيرة'
                }
            ],

            authorizedSignatories: [
                {
                    name: 'سلمان أحمد بن سلمان الراجح',
                    role: 'المؤسس والمدير العام',
                    authority: 'توقيع كامل — جميع الوثائق بلا حدود',
                    signatureLevel: 'A — أعلى صلاحية'
                }
            ]
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // الأوراق الرسمية — القوالب والنماذج
    // ═══════════════════════════════════════════════════════════════════════════
    getOfficialLetterheads() {
        return {
            بسم_الله: 'بسم الله الرحمن الرحيم',
            title: 'الأوراق الرسمية — ورق المراسلات (Letterhead)',

            letterheadDesign: {
                size: 'A4 (210×297 مم)',
                orientation: 'عمودي — RTL (يمين لليسار)',
                language: 'ثنائي اللغة (عربي + إنجليزي)',

                header: {
                    height: '35 مم',
                    content: {
                        right: {
                            logo: 'شعار شيخة',
                            name: 'شيخة للمعادن والتجارة',
                            subtext: 'Sheikha Metals & Trading'
                        },
                        left: {
                            line1: 'مؤسسة سلمان أحمد بن سلمان الراجح التجارية',
                            line2: 'سجل تجاري: 2051263653',
                            line3: 'الخبر — المنطقة الشرقية — المملكة العربية السعودية'
                        }
                    },
                    separator: 'خط ذهبي (#C5A028) بسمك 1px'
                },

                body: {
                    marginTop: '45 مم',
                    marginBottom: '30 مم',
                    marginRight: '25 مم',
                    marginLeft: '25 مم',
                    font: 'Cairo (عربي) / Inter (إنجليزي)',
                    fontSize: '12pt',
                    lineSpacing: '1.5',
                    referenceField: 'الرقم المرجعي: SHKH-YYYY-NNNNN',
                    dateField: 'التاريخ: ___/___/___ هـ الموافق ___/___/___ م',
                    bismillah: 'بسم الله الرحمن الرحيم — أعلى الصفحة (اختياري حسب نوع الوثيقة)'
                },

                footer: {
                    height: '20 مم',
                    separator: 'خط ذهبي (#C5A028)',
                    content: {
                        right: '8009، الخبر 34218-5193 | ☎ _________ | ✉ market@sheikha.top',
                        center: 'www.sheikha.top',
                        left: 'صفحة {n} من {total}'
                    }
                },

                watermark: {
                    text: 'شيخة',
                    opacity: '5%',
                    position: 'وسط الصفحة بزاوية 45°',
                    color: '#C5A028 (ذهبي)'
                }
            },

            variants: [
                { type: 'official', name: 'خطاب رسمي عام', usage: 'المراسلات الرسمية مع الجهات والشركات' },
                { type: 'commercial', name: 'خطاب تجاري', usage: 'عروض أسعار + طلبات شراء + فواتير' },
                { type: 'internal', name: 'مذكرة داخلية', usage: 'اتصالات داخلية بين الأقسام' },
                { type: 'confidential', name: 'خطاب سري', usage: 'وثائق سرية — يحمل ختم "سري"' },
                { type: 'bilingual', name: 'خطاب ثنائي اللغة', usage: 'مراسلات دولية — عربي + إنجليزي' }
            ]
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // النماذج الحكومية — تعبئة آلية
    // ═══════════════════════════════════════════════════════════════════════════
    getGovernmentForms() {
        return {
            بسم_الله: 'بسم الله الرحمن الرحيم',
            title: 'النماذج الحكومية — التعبئة الآلية',
            note: 'جميع البيانات مأخوذة من السجل التجاري المُرقمن — تُعبأ تلقائياً',

            forms: [
                {
                    id: 'form-mc-cr',
                    name: 'نموذج تعديل السجل التجاري',
                    authority: 'وزارة التجارة',
                    platform: 'mc.gov.sa',
                    autoFillFields: {
                        crNumber: '2051263653',
                        unifiedNumber: '7049031003',
                        entityName: 'مؤسسة سلمان أحمد بن سلمان الراجح التجارية',
                        ownerName: 'سلمان أحمد بن سلمان الراجح',
                        nationalId: '1031605270',
                        city: 'الخبر',
                        postalCode: '34218-5193'
                    },
                    status: 'جاهز للتعبئة الآلية ✅'
                },
                {
                    id: 'form-zatca-vat',
                    name: 'نموذج تسجيل ضريبة القيمة المضافة (VAT)',
                    authority: 'ZATCA — هيئة الزكاة والضريبة والجمارك',
                    platform: 'zatca.gov.sa',
                    autoFillFields: {
                        crNumber: '2051263653',
                        entityName: 'مؤسسة سلمان أحمد بن سلمان الراجح التجارية',
                        entityType: 'مؤسسة فردية',
                        ownerNationalId: '1031605270',
                        address: '8009، الخبر 34218-5193',
                        zakatNumber: '21033018589',
                        expectedRevenue: 'يُحدد' // يُعبأ يدوياً
                    },
                    goldException: 'الذهب الاستثماري 99%+ = معفى من VAT',
                    status: 'جاهز ✅'
                },
                {
                    id: 'form-zatca-invoice',
                    name: 'نموذج الفوترة الإلكترونية (فاتورة)',
                    authority: 'ZATCA',
                    autoFillFields: {
                        sellerName: 'مؤسسة سلمان أحمد بن سلمان الراجح التجارية',
                        sellerCR: '2051263653',
                        sellerVAT: '', // يُضاف بعد التسجيل
                        sellerAddress: '8009، الخبر 34218-5193',
                        invoiceType: 'فاتورة ضريبية',
                        qrFields: ['اسم البائع', 'الرقم الضريبي', 'التاريخ', 'الإجمالي', 'الضريبة']
                    },
                    format: 'XML + PDF + QR Code',
                    standard: 'ZATCA Phase 2 (Integration)',
                    status: 'جاهز — ينتظر رقم VAT ✅'
                },
                {
                    id: 'form-chamber',
                    name: 'نموذج عضوية الغرفة التجارية',
                    authority: 'غرفة الشرقية التجارية',
                    platform: 'chamber.sa',
                    autoFillFields: {
                        crNumber: '2051263653',
                        entityName: 'مؤسسة سلمان أحمد بن سلمان الراجح التجارية',
                        ownerName: 'سلمان أحمد بن سلمان الراجح',
                        city: 'الخبر',
                        membershipType: 'الفئة الثالثة (مؤسسة فردية)'
                    },
                    status: 'جاهز ✅'
                },
                {
                    id: 'form-maroof',
                    name: 'نموذج تسجيل معروف (تجارة إلكترونية)',
                    authority: 'وزارة التجارة',
                    platform: 'maroof.sa',
                    autoFillFields: {
                        crNumber: '2051263653',
                        entityName: 'مؤسسة سلمان أحمد بن سلمان الراجح التجارية',
                        websiteUrl: 'sheikha.sa',
                        businessDescription: 'منصة إلكترونية لتجارة المعادن والسكراب'
                    },
                    status: 'جاهز ✅'
                },
                {
                    id: 'form-fasah',
                    name: 'نموذج تسجيل في منصة فسح (جمارك)',
                    authority: 'ZATCA',
                    platform: 'fasah.sa',
                    autoFillFields: {
                        crNumber: '2051263653',
                        importerName: 'مؤسسة سلمان أحمد بن سلمان الراجح التجارية',
                        importType: 'معادن + سكراب + خامات معدنية',
                        hsCodeCategories: ['72xx — حديد وصلب', '74xx — نحاس', '76xx — ألمنيوم', '71xx — معادن ثمينة']
                    },
                    status: 'جاهز ✅'
                },
                {
                    id: 'form-balady',
                    name: 'نموذج ترخيص بلدي',
                    authority: 'أمانة المنطقة الشرقية / بلدية الخبر',
                    platform: 'balady.gov.sa',
                    autoFillFields: {
                        crNumber: '2051263653',
                        entityName: 'مؤسسة سلمان أحمد بن سلمان الراجح التجارية',
                        address: '8009، الخبر 34218-5193',
                        activityType: 'تجارة جملة معادن + سكراب',
                        locationRequirements: ['مكتب إداري', 'مستودع معادن', 'ساحة سكراب']
                    },
                    status: 'جاهز ✅'
                },
                {
                    id: 'form-civil-defense',
                    name: 'نموذج ترخيص الدفاع المدني',
                    authority: 'المديرية العامة للدفاع المدني',
                    autoFillFields: {
                        crNumber: '2051263653',
                        entityName: 'مؤسسة سلمان أحمد بن سلمان الراجح التجارية',
                        locationAddress: '8009، الخبر 34218-5193',
                        activityClassification: 'تجاري — تخزين معادن',
                        riskLevel: 'متوسط (مستودع سكراب)',
                        fireProtection: ['طفايات حريق', 'نظام إنذار', 'رشاشات (إن طلب)', 'مخارج طوارئ']
                    },
                    status: 'جاهز ✅'
                },
                {
                    id: 'form-ncec-env',
                    name: 'نموذج الترخيص البيئي',
                    authority: 'NCEC — المركز الوطني للرقابة على الالتزام البيئي',
                    autoFillFields: {
                        crNumber: '2051263653',
                        entityName: 'مؤسسة سلمان أحمد بن سلمان الراجح التجارية',
                        activity: 'تجارة وتخزين سكراب معادن + إعادة تدوير',
                        environmentalImpact: 'متوسط — نفايات صلبة + غبار معدني',
                        mitigationPlan: ['فرز وتصنيف السكراب', 'منع تسرب زيوت', 'نظام تهوية', 'جمع مخلفات']
                    },
                    status: 'جاهز ✅'
                },
                {
                    id: 'form-saip-trademark',
                    name: 'نموذج تسجيل علامة تجارية (شيخة)',
                    authority: 'SAIP — الهيئة السعودية للملكية الفكرية',
                    platform: 'saip.gov.sa',
                    autoFillFields: {
                        applicantName: 'سلمان أحمد بن سلمان الراجح',
                        applicantId: '1031605270',
                        crNumber: '2051263653',
                        trademarkName: 'شيخة — Sheikha',
                        trademarkType: 'اسم + شعار',
                        niceClasses: [
                            { class: 6, description: 'معادن أساسية ومنتجاتها' },
                            { class: 14, description: 'معادن ثمينة ومجوهرات' },
                            { class: 35, description: 'خدمات تجارية وإعلانية' },
                            { class: 36, description: 'خدمات مالية وتأمينية' },
                            { class: 42, description: 'خدمات تقنية وعلمية' }
                        ]
                    },
                    status: 'جاهز ✅'
                },
                {
                    id: 'form-gosi',
                    name: 'نموذج تسجيل التأمينات الاجتماعية',
                    authority: 'GOSI — المؤسسة العامة للتأمينات الاجتماعية',
                    platform: 'gosi.gov.sa',
                    autoFillFields: {
                        crNumber: '2051263653',
                        entityName: 'مؤسسة سلمان أحمد بن سلمان الراجح التجارية',
                        gosiNumber: '653831897',
                        ownerNationalId: '1031605270',
                        contribution: '22% (12% صاحب عمل + 10% موظف)',
                        note: 'يُفعّل عند توظيف أول موظف'
                    },
                    status: 'جاهز — ينتظر التوظيف ✅'
                },
                {
                    id: 'form-etimad',
                    name: 'نموذج تسجيل منصة اعتماد (مشتريات حكومية)',
                    authority: 'هيئة المحتوى المحلي والمشتريات الحكومية (LCGPA)',
                    platform: 'etimad.sa',
                    autoFillFields: {
                        crNumber: '2051263653',
                        entityName: 'مؤسسة سلمان أحمد بن سلمان الراجح التجارية',
                        activity: 'تجارة معادن + سكراب + استشارات سلاسل إمداد',
                        ownerName: 'سلمان أحمد بن سلمان الراجح',
                        category: 'صغيرة ومتوسطة (SME)',
                        supplierType: 'مورد + مقدم خدمات'
                    },
                    status: 'جاهز ✅'
                }
            ]
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // النماذج التجارية — تعبئة آلية
    // ═══════════════════════════════════════════════════════════════════════════
    getCommercialForms() {
        return {
            بسم_الله: 'بسم الله الرحمن الرحيم',
            title: 'النماذج التجارية — التعبئة الآلية',

            forms: [
                {
                    id: 'form-quotation',
                    name: 'عرض سعر',
                    nameEn: 'Quotation',
                    fields: {
                        header: this._getDocumentHeader(),
                        reference: 'SHKH-QT-{YYYY}-{NNNNN}',
                        date: '{التاريخ الهجري} الموافق {التاريخ الميلادي}',
                        to: '{ اسم العميل / الشركة }',
                        subject: 'عرض سعر — { وصف المنتج/الخدمة }',
                        table: ['#', 'الوصف', 'الكمية', 'الوحدة', 'سعر الوحدة', 'الإجمالي'],
                        subtotal: 'المجموع الفرعي',
                        vat: 'ضريبة القيمة المضافة (15%)',
                        total: 'الإجمالي شاملاً الضريبة',
                        validity: 'صلاحية العرض: 15 يوم',
                        paymentTerms: 'شروط الدفع: { تحدد حسب العميل }',
                        deliveryTerms: 'شروط التسليم: { EXW / FOB / CIF }',
                        footer: this._getDocumentFooter()
                    },
                    autoFill: true,
                    shariaNote: 'العرض ملزم خلال فترة الصلاحية — "المسلمون على شروطهم"'
                },
                {
                    id: 'form-purchase-order',
                    name: 'أمر شراء',
                    nameEn: 'Purchase Order',
                    fields: {
                        header: this._getDocumentHeader(),
                        reference: 'SHKH-PO-{YYYY}-{NNNNN}',
                        supplier: '{ اسم المورد }',
                        table: ['#', 'الوصف', 'الكود/HS', 'الكمية', 'الوحدة (كجم/طن)', 'السعر', 'الإجمالي'],
                        deliveryDate: 'تاريخ التسليم المطلوب',
                        deliveryLocation: 'مكان التسليم',
                        paymentTerms: 'شروط الدفع',
                        qualitySpecs: 'المواصفات المطلوبة',
                        footer: this._getDocumentFooter()
                    },
                    autoFill: true
                },
                {
                    id: 'form-sales-contract',
                    name: 'عقد بيع معادن / سكراب',
                    nameEn: 'Metals / Scrap Sales Contract',
                    fields: {
                        header: this._getDocumentHeader(),
                        reference: 'SHKH-SC-{YYYY}-{NNNNN}',
                        parties: {
                            firstParty: {
                                name: 'مؤسسة سلمان أحمد بن سلمان الراجح التجارية',
                                cr: '2051263653',
                                representative: 'سلمان أحمد بن سلمان الراجح',
                                role: 'البائع / الطرف الأول'
                            },
                            secondParty: '{ بيانات المشتري — تُعبأ }'
                        },
                        articles: [
                            'المادة الأولى: تعريفات',
                            'المادة الثانية: موضوع العقد (نوع المعدن/السكراب + الكمية + المواصفات)',
                            'المادة الثالثة: السعر وطريقة الدفع',
                            'المادة الرابعة: التسليم (المكان + الزمان + الشروط)',
                            'المادة الخامسة: الفحص والقبول',
                            'المادة السادسة: الضمان والمسؤولية',
                            'المادة السابعة: القوة القاهرة',
                            'المادة الثامنة: فسخ العقد',
                            'المادة التاسعة: حل النزاعات (التحكيم / القضاء السعودي)',
                            'المادة العاشرة: أحكام عامة'
                        ],
                        shariaClause: 'البند الشرعي: يلتزم الطرفان بأحكام الشريعة الإسلامية في كل ما يتعلق بهذا العقد — لا ربا + لا غرر + لا غش + لا احتكار',
                        signatures: ['توقيع الطرف الأول + الختم', 'توقيع الطرف الثاني + الختم'],
                        witnesses: 'الشهود (اختياري)'
                    },
                    autoFill: true
                },
                {
                    id: 'form-invoice',
                    name: 'فاتورة ضريبية',
                    nameEn: 'Tax Invoice',
                    standard: 'ZATCA e-Invoice Phase 2',
                    fields: {
                        header: this._getDocumentHeader(),
                        invoiceNumber: 'SHKH-INV-{YYYY}-{NNNNN}',
                        invoiceDate: '{التاريخ}',
                        supplyDate: '{تاريخ التوريد}',
                        seller: {
                            name: 'مؤسسة سلمان أحمد بن سلمان الراجح التجارية',
                            cr: '2051263653',
                            vat: '{ الرقم الضريبي — يُضاف }',
                            address: '8009، الخبر 34218-5193'
                        },
                        buyer: '{ بيانات المشتري }',
                        table: ['#', 'الوصف', 'الكمية', 'الوحدة', 'سعر الوحدة', 'الخصم', 'VAT%', 'الإجمالي'],
                        subtotal: true,
                        vatAmount: true,
                        grandTotal: true,
                        qrCode: 'مطلوب — يحتوي بيانات الفاتورة المشفرة (TLV)',
                        uuid: 'معرف فريد للفاتورة',
                        xmlFormat: 'UBL 2.1 — وفق معيار ZATCA'
                    },
                    autoFill: true
                },
                {
                    id: 'form-delivery-note',
                    name: 'سند تسليم / إذن صرف',
                    nameEn: 'Delivery Note',
                    fields: {
                        header: this._getDocumentHeader(),
                        reference: 'SHKH-DN-{YYYY}-{NNNNN}',
                        relatedPO: 'رقم أمر الشراء: _______',
                        relatedInvoice: 'رقم الفاتورة: _______',
                        deliveredTo: '{ اسم المستلم }',
                        table: ['#', 'الوصف', 'الكمية', 'الوحدة', 'الوزن', 'ملاحظات'],
                        driverInfo: '{ اسم السائق + رقم الشاحنة + رقم الجوال }',
                        receiverSignature: 'توقيع المستلم: __________',
                        senderSignature: 'توقيع المُسلِّم: __________'
                    },
                    autoFill: true
                },
                {
                    id: 'form-weighing-cert',
                    name: 'شهادة وزن (كشف ميزان)',
                    nameEn: 'Weighing Certificate',
                    fields: {
                        header: this._getDocumentHeader(),
                        reference: 'SHKH-WC-{YYYY}-{NNNNN}',
                        material: '{ نوع المعدن/السكراب }',
                        grade: '{ الدرجة / الجودة }',
                        grossWeight: '{ الوزن الإجمالي }',
                        tareWeight: '{ وزن الحاوية/الشاحنة }',
                        netWeight: '{ الوزن الصافي }',
                        unit: 'كجم / طن',
                        weighingMethod: 'ميزان إلكتروني معاير',
                        calibrationDate: '{ تاريخ آخر معايرة }',
                        operatorSignature: 'توقيع عامل الميزان'
                    },
                    shariaNote: '"وَأَقِيمُوا الْوَزْنَ بِالْقِسْطِ وَلَا تُخْسِرُوا الْمِيزَانَ" — الرحمن 9',
                    autoFill: true
                },
                {
                    id: 'form-receipt-voucher',
                    name: 'سند قبض',
                    nameEn: 'Receipt Voucher',
                    fields: {
                        header: this._getDocumentHeader(),
                        reference: 'SHKH-RV-{YYYY}-{NNNNN}',
                        receivedFrom: '{ اسم الدافع }',
                        amount: '{ المبلغ رقماً }',
                        amountWords: '{ المبلغ كتابةً }',
                        paymentMethod: '{ نقد / تحويل / شيك }',
                        forPaymentOf: '{ الغرض }',
                        relatedInvoice: 'رقم الفاتورة: _______',
                        signature: 'توقيع المستلم + الختم'
                    },
                    autoFill: true
                },
                {
                    id: 'form-payment-voucher',
                    name: 'سند صرف',
                    nameEn: 'Payment Voucher',
                    fields: {
                        header: this._getDocumentHeader(),
                        reference: 'SHKH-PV-{YYYY}-{NNNNN}',
                        paidTo: '{ اسم المستفيد }',
                        amount: '{ المبلغ رقماً }',
                        amountWords: '{ المبلغ كتابةً }',
                        paymentMethod: '{ نقد / تحويل / شيك رقم ___ }',
                        forPaymentOf: '{ الغرض }',
                        approvedBy: 'اعتمد: سلمان أحمد بن سلمان الراجح',
                        signature: 'التوقيع + الختم'
                    },
                    autoFill: true
                },
                {
                    id: 'form-nda',
                    name: 'اتفاقية سرية (NDA)',
                    nameEn: 'Non-Disclosure Agreement',
                    fields: {
                        header: this._getDocumentHeader(),
                        reference: 'SHKH-NDA-{YYYY}-{NNNNN}',
                        parties: {
                            discloser: 'مؤسسة سلمان أحمد بن سلمان الراجح التجارية',
                            recipient: '{ الطرف الثاني }'
                        },
                        scope: 'معلومات تجارية + أسعار + شبكات موردين + بيانات عملاء',
                        duration: '3 سنوات من تاريخ التوقيع',
                        penalty: '{ يُحدد }',
                        jurisdiction: 'المملكة العربية السعودية — ديوان المظالم / تحكيم'
                    },
                    autoFill: true
                },
                {
                    id: 'form-agency',
                    name: 'عقد وكالة تجارية',
                    nameEn: 'Commercial Agency Agreement',
                    shariaNote: 'وكالة بأجر — جائزة شرعاً بإجماع الفقهاء',
                    autoFill: true
                }
            ],

            referenceNumbering: {
                format: 'SHKH-{TYPE}-{YYYY}-{NNNNN}',
                types: {
                    'QT': 'عرض سعر (Quotation)',
                    'PO': 'أمر شراء (Purchase Order)',
                    'SC': 'عقد بيع (Sales Contract)',
                    'INV': 'فاتورة (Invoice)',
                    'DN': 'سند تسليم (Delivery Note)',
                    'WC': 'شهادة وزن (Weighing Certificate)',
                    'RV': 'سند قبض (Receipt Voucher)',
                    'PV': 'سند صرف (Payment Voucher)',
                    'NDA': 'اتفاقية سرية',
                    'LTR': 'خطاب رسمي (Letter)',
                    'MEM': 'مذكرة داخلية (Memo)'
                },
                example: 'SHKH-INV-1447-00001',
                sequencing: 'تسلسلي — يبدأ من 00001 كل سنة هجرية',
                calendarBasis: 'التاريخ الهجري هو الأساس — لأنه تاريخ المسلمين الأصيل',
                note: 'السنة الهجرية الحالية: 1447 | يتم التبديل عند بداية شهر محرم من كل عام'
            }
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // النماذج الداخلية
    // ═══════════════════════════════════════════════════════════════════════════
    getInternalForms() {
        return {
            بسم_الله: 'بسم الله الرحمن الرحيم',
            title: 'النماذج الداخلية',

            forms: [
                { id: 'internal-memo', name: 'مذكرة داخلية', usage: 'اتصالات بين الأقسام', autoFill: true },
                { id: 'meeting-minutes', name: 'محضر اجتماع', usage: 'توثيق القرارات والنقاشات', autoFill: true },
                { id: 'task-assignment', name: 'نموذج تكليف مهمة', usage: 'تكليف موظف بمهمة محددة', autoFill: true },
                { id: 'leave-request', name: 'نموذج طلب إجازة', usage: 'طلب إجازة موظف', autoFill: true },
                { id: 'expense-claim', name: 'مطالبة مصروفات', usage: 'استرداد مصروفات عمل', autoFill: true },
                { id: 'quality-report', name: 'تقرير فحص جودة معدن', usage: 'فحص مواصفات المعدن/السكراب عند الاستلام', autoFill: true },
                { id: 'inventory-count', name: 'نموذج جرد مخزون', usage: 'جرد مستودع معادن/سكراب', autoFill: true },
                { id: 'incident-report', name: 'تقرير حادثة', usage: 'توثيق حوادث عمل أو خسائر', autoFill: true }
            ]
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // دوال مساعدة
    // ═══════════════════════════════════════════════════════════════════════════
    _getDocumentHeader() {
        return {
            bismillah: 'بسم الله الرحمن الرحيم',
            logo: 'شعار شيخة',
            entityName: 'مؤسسة سلمان أحمد بن سلمان الراجح التجارية',
            brandName: 'شيخة للمعادن والتجارة — Sheikha Metals & Trading',
            crNumber: 'سجل تجاري: 2051263653',
            address: 'الخبر — المنطقة الشرقية — المملكة العربية السعودية'
        };
    }

    _getDocumentFooter() {
        return {
            address: '8009، الخبر 34218-5193',
            website: 'www.sheikha.sa',
            signatureLine: 'التوقيع: _________________ | الختم: ☐',
            signerName: 'سلمان أحمد بن سلمان الراجح',
            signerTitle: 'المؤسس والمدير العام'
        };
    }
}

module.exports = SheikhaOfficialDocuments;
