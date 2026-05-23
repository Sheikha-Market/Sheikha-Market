/**
 * بسم الله الرحمن الرحيم
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  منظومة شيخة — الجاهزية والامتثال المحلي والدولي                          ║
 * ║  SHEIKHA READINESS & COMPLIANCE ENGINE                                     ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║  جاهزية محلية سعودية + تكامل حكومي رقمي + جاهزية دولية                    ║
 * ║  قوانين وأنظمة كل دولة + رقمنة بالكتاب والسنة                             ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║  "أَطِيعُوا اللَّهَ وَأَطِيعُوا الرَّسُولَ وَأُولِي الْأَمْرِ مِنكُمْ"   ║
 * ║  — النساء ٥٩                                                              ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║  المالك: سلمان أحمد بن سلمان الراجح | 1031605270 | market@sheikha.top     ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */
'use strict';

class SheikhaReadinessComplianceEngine {
    constructor() {
        this.name = 'منظومة شيخة — الجاهزية والامتثال المحلي والدولي';
        this.version = '1.0.0';
        this.hijriYear = 1447;
    }

    getDashboard() {
        return {
            بسم_الله: 'بسم الله الرحمن الرحيم',
            name: this.name,
            owner: 'سلمان أحمد بن سلمان الراجح — 1031605270',
            verse: '"أَطِيعُوا اللَّهَ وَأَطِيعُوا الرَّسُولَ وَأُولِي الْأَمْرِ مِنكُمْ" — النساء ٥٩',
            stats: {
                saudiPlatforms: 24,
                saudiLaws: 18,
                internationalRegions: 7,
                countriesSupported: 45,
                internationalStandards: 22,
                tradeAgreements: 15,
                digitalIntegrationPoints: 38,
                shariaRules: 12
            }
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  1. الجاهزية المحلية السعودية — التكامل الرقمي الحكومي
    // ═══════════════════════════════════════════════════════════════════════════
    getSaudiReadiness() {
        return {
            بسم_الله: 'بسم الله الرحمن الرحيم',
            title: 'الجاهزية المحلية — التكامل الرقمي مع الحكومة السعودية',
            principle: 'طاعة ولي الأمر واجبة — الامتثال للأنظمة السعودية فريضة شرعية قبل أن يكون التزاماً قانونياً',

            digitalGovernment: {
                title: 'التحول الرقمي الحكومي السعودي — شيخة متكاملة 100%',
                platforms: [
                    {
                        name: 'فسح (Fasah)',
                        authority: 'ZATCA — هيئة الزكاة والضريبة والجمارك',
                        purpose: 'التخليص الجمركي الإلكتروني',
                        integration: 'API مباشر — رفع/استلام بيانات آلياً',
                        sheikhaSyncData: ['بيان جمركي', 'فاتورة تجارية', 'B/L', 'شهادة منشأ', 'كشف تعبئة'],
                        complianceLaw: 'نظام الجمارك الموحد — المرسوم الملكي م/41 لعام 1443هـ',
                        autoFeatures: ['رفع البيان آلياً من أمر الشراء', 'حساب الرسوم قبل الشحن', 'متابعة حالة التخليص', 'إشعار الإفراج']
                    },
                    {
                        name: 'منصة فاتورة (ZATCA E-Invoicing)',
                        authority: 'ZATCA',
                        purpose: 'الفوترة الإلكترونية — المرحلة 2 (الربط والتكامل)',
                        integration: 'API — إلزامي لكل فاتورة',
                        complianceLaw: 'قرار ZATCA بتاريخ 4/12/1442هـ — إلزام الفوترة الإلكترونية',
                        autoFeatures: ['إصدار فاتورة XML + QR + UUID آلياً', 'إرسال فوري لـ ZATCA', 'استلام حالة القبول/الرفض', 'أرشفة تلقائية'],
                        technicalSpecs: { format: 'UBL 2.1 XML', security: 'توقيع رقمي X.509', uuid: 'UUID v4 لكل فاتورة', qr: 'QR TLV مشفر', api: 'REST API — JSON/XML' }
                    },
                    {
                        name: 'منصة قوائم (Qawaem)',
                        authority: 'ZATCA',
                        purpose: 'إيداع القوائم المالية',
                        integration: 'XBRL / iXBRL',
                        complianceLaw: 'نظام جباية الزكاة + معايير SOCPA',
                        autoFeatures: ['استخراج القوائم من محرك المحاسبة', 'تحويل لصيغة XBRL آلياً', 'إيداع سنوي', 'تنبيه قبل الموعد بـ 30 يوم']
                    },
                    {
                        name: 'منصة مُدد (Mudad)',
                        authority: 'وزارة الموارد البشرية',
                        purpose: 'حماية الأجور + إدارة الرواتب',
                        complianceLaw: 'نظام حماية الأجور — قرار وزاري 1515 لعام 1442هـ',
                        autoFeatures: ['رفع ملف WPS شهرياً', 'تحويل الرواتب عبر البنك', 'مطابقة المبالغ آلياً']
                    },
                    {
                        name: 'منصة قوى (Qiwa)',
                        authority: 'وزارة الموارد البشرية',
                        purpose: 'عقود العمل + نطاقات + تأشيرات',
                        complianceLaw: 'نظام العمل — المرسوم الملكي م/51 لعام 1426هـ',
                        autoFeatures: ['توثيق عقود العمل إلكترونياً', 'متابعة نطاقات', 'تنبيه انتهاء عقود']
                    },
                    {
                        name: 'التأمينات الاجتماعية (GOSI)',
                        purpose: 'اشتراكات التأمينات (12% صاحب عمل + 10% موظف)',
                        complianceLaw: 'نظام التأمينات الاجتماعية — المرسوم الملكي م/22 لعام 1389هـ',
                        autoFeatures: ['تسجيل موظفين جدد', 'رفع كشف اشتراكات شهري', 'سداد آلي']
                    },
                    {
                        name: 'سابر (SABER)',
                        authority: 'SASO',
                        purpose: 'شهادات المطابقة للاستيراد',
                        complianceLaw: 'نظام المواصفات والمقاييس — المرسوم الملكي م/10 لعام 1432هـ',
                        autoFeatures: ['طلب CoC آلي لكل شحنة مستوردة', 'ربط بيانات المنتج بكود HS', 'تتبع حالة الشهادة']
                    },
                    {
                        name: 'نافذ (Nafith)',
                        authority: 'وزارة العدل',
                        purpose: 'العقود التجارية الإلكترونية',
                        complianceLaw: 'نظام المعاملات التجارية الإلكترونية',
                        autoFeatures: ['توثيق عقود البيع/الشراء إلكترونياً', 'إصدار سندات لأمر', 'متابعة الاستحقاق']
                    },
                    {
                        name: 'إيجار (Ejar)',
                        purpose: 'توثيق عقود الإيجار',
                        autoFeatures: ['رفع عقود إيجار المكاتب والمستودعات']
                    },
                    {
                        name: 'مُقيم (Muqeem)',
                        authority: 'الجوازات',
                        purpose: 'إدارة العمالة الوافدة',
                        autoFeatures: ['تجديد إقامات', 'تأشيرات خروج', 'نقل كفالة']
                    },
                    {
                        name: 'وزارة التجارة (mc.gov.sa)',
                        purpose: 'السجل التجاري + الأنشطة',
                        autoFeatures: ['تجديد السجل', 'تعديل الأنشطة', 'تنبيه انتهاء']
                    },
                    {
                        name: 'معروف (Maroof)',
                        purpose: 'توثيق التجارة الإلكترونية',
                        autoFeatures: ['ربط بختم الثقة', 'تقييمات العملاء']
                    },
                    {
                        name: 'هيئة النقل (TGA)',
                        purpose: 'تراخيص النقل',
                        complianceLaw: 'نظام النقل العام — المرسوم الملكي م/25 لعام 1397هـ',
                        autoFeatures: ['التحقق من ترخيص الناقلين', 'تسجيل شاحنات']
                    },
                    {
                        name: 'هيئة الموانئ (Mawani)',
                        purpose: 'نظام المجتمع الميناوي',
                        autoFeatures: ['جداول السفن', 'حالة الحاويات', 'حجز مواعيد']
                    }
                ]
            },

            saudiLaws: [
                { law: 'نظام الجمارك الموحد', number: 'م/41 — 1443هـ', relevance: 'استيراد/تصدير المعادن والسكراب' },
                { law: 'نظام ضريبة القيمة المضافة', rate: '15%', relevance: 'كل عمليات البيع والشراء' },
                { law: 'نظام جباية الزكاة', relevance: 'زكاة المنشأة — 2.5% على الوعاء الزكوي' },
                { law: 'نظام مكافحة غسل الأموال', number: 'م/31 — 1433هـ', relevance: 'KYC/AML لكل عميل ومورد — إلزامي' },
                { law: 'نظام المعاملات التجارية الإلكترونية', number: 'م/18 — 1428هـ', relevance: 'التوقيع الإلكتروني + العقود' },
                { law: 'نظام حماية البيانات الشخصية (PDPL)', number: 'م/19 — 1443هـ', relevance: 'حماية بيانات العملاء والموظفين' },
                { law: 'نظام المواصفات والمقاييس', relevance: 'جودة المنتجات — SASO/SABER' },
                { law: 'نظام العمل', number: 'م/51 — 1426هـ', relevance: 'حقوق العمال + سعودة' },
                { law: 'نظام الشركات', number: 'م/132 — 1443هـ', relevance: 'هيكل الشركة + حوكمة' },
                { law: 'نظام المعادن الثمينة والأحجار الكريمة', relevance: 'دمغة + عيار + تسجيل — إلزامي لتجار الذهب والفضة' },
                { law: 'نظام البيئة', relevance: 'التخلص الآمن من نفايات المعادن + انبعاثات المصاهر' },
                { law: 'نظام المنافسة', relevance: 'منع الاحتكار — "الجالب مرزوق والمحتكر ملعون"' },
                { law: 'نظام التجارة الإلكترونية', number: 'م/126 — 1440هـ', relevance: 'منصة شيخة الإلكترونية' },
                { law: 'نظام الإفلاس', number: 'م/50 — 1439هـ', relevance: 'حماية الحقوق عند التعثر' }
            ]
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  2. الجاهزية الدولية — قوانين وأنظمة كل دولة/منطقة
    // ═══════════════════════════════════════════════════════════════════════════
    getInternationalReadiness() {
        return {
            بسم_الله: 'بسم الله الرحمن الرحيم',
            title: 'الجاهزية الدولية — قوانين وأنظمة كل منطقة',
            verse: '"يَا أَيُّهَا النَّاسُ إِنَّا خَلَقْنَاكُم مِّن ذَكَرٍ وَأُنثَىٰ وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا" — الحجرات:13',

            regions: [
                {
                    region: 'دول الخليج (GCC)',
                    countries: ['الإمارات', 'البحرين', 'الكويت', 'عُمان', 'قطر'],
                    tradeAgreement: 'الاتحاد الجمركي الخليجي — تعرفة خارجية موحدة 5%',
                    laws: {
                        customs: 'قانون جمارك موحد — صفر جمارك للمنتجات الخليجية',
                        vat: 'الإمارات 5% | البحرين 10% | عُمان 5% | الكويت (مخطط) | قطر (لا VAT)',
                        certificates: 'شهادة منشأ خليجية — إعفاء جمركي',
                        metalTrade: 'حرية تجارة المعادن — لا قيود كمية'
                    },
                    digitalIntegration: {
                        UAE: { platform: 'Dubai Trade / Mirsal 2', customs: 'هيئة الجمارك الاتحادية', goldTrade: 'DMCC — مركز دبي للسلع المتعددة (أكبر سوق ذهب في المنطقة)', scrapLicense: 'بلدية + اقتصادية', integration: 'API متاح لـ Mirsal 2' },
                        Bahrain: { platform: 'Bahrain Customs (جمارك البحرين)', aluminumTrade: 'ALBA — أكبر مصهر ألمنيوم عربي', integration: 'EDI' },
                        Kuwait: { platform: 'الإدارة العامة للجمارك', scrapMarket: 'سوق سكراب نشط', integration: 'بوابة إلكترونية' },
                        Oman: { platform: 'Bayan Customs', copperMines: 'تاريخ 5,000 سنة — مناجم نحاس مَجَان', integration: 'EDI' },
                        Qatar: { platform: 'Al Nadeeb System', steelProduction: 'قطر ستيل', integration: 'بوابة' }
                    }
                },
                {
                    region: 'آسيا',
                    countries: {
                        China: {
                            name: 'الصين',
                            importance: 'أكبر شريك تجاري للسعودية في المعادن',
                            laws: {
                                customs: 'General Administration of Customs (GACC)',
                                importLicense: 'رخصة استيراد تلقائية لمعظم المعادن',
                                scrapImport: 'قيود صارمة منذ 2021 — يجب أن يكون السكراب "نظيفاً" (تلوث < 0.5%)',
                                standards: 'GB Standards (معايير وطنية صينية)',
                                vat: '13% على المعادن',
                                inspection: 'CCIC — فحص قبل الشحن مطلوب لبعض الأصناف'
                            },
                            digitalIntegration: { platform: 'China e-Port / Single Window', api: 'متاح عبر وسيط', documents: ['Commercial Invoice', 'Packing List', 'B/L', 'Contract', 'Certificate of Quality', 'Certificate of Origin'] },
                            shariaConsideration: 'لا قيود شرعية على التجارة مع الصين — البضائع حلال (معادن)'
                        },
                        India: {
                            name: 'الهند',
                            importance: 'ثاني أكبر سوق — أكبر مستهلك ذهب',
                            laws: {
                                customs: 'CBIC — Central Board of Indirect Taxes & Customs',
                                importDuty: 'ذهب 15% + GST | فضة 10% + GST | سكراب 2.5%',
                                gst: '18% على خدمات | 3% على ذهب',
                                scrapPolicy: 'مشجعة للاستيراد — Vehicle Scrappage Policy 2021',
                                bis: 'Bureau of Indian Standards — إلزامي لبعض منتجات الصلب'
                            },
                            digitalIntegration: { platform: 'ICEGATE (Indian Customs EDI)', api: 'متاح', documents: ['Invoice', 'B/L', 'CoO', 'BIS Certificate (إن لزم)'] }
                        },
                        Turkey: {
                            name: 'تركيا',
                            importance: 'أكبر مستورد سكراب حديد في العالم',
                            laws: {
                                customs: 'وزارة التجارة التركية',
                                importDuty: 'سكراب حديد 0% | ألمنيوم 0% | نحاس 0% (تشجيع استيراد المواد الخام)',
                                vat: '20% (تُسترد للمصانع)',
                                scrapStandards: 'TSE — معايير تركية + ISRI grades مقبولة',
                                inspectionPre: 'لا فحص قبل شحن للسكراب — فحص عند الوصول'
                            },
                            digitalIntegration: { platform: 'BILGE (Turkish Customs)', api: 'EDI', note: 'تركيا تستورد 20+ مليون طن سكراب حديد سنوياً' }
                        },
                        Japan: {
                            name: 'اليابان',
                            laws: { customs: 'NACCS (Nippon Automated Cargo Clearance System)', importDuty: 'معظم المعادن 0% (مستورد صاف)', standards: 'JIS — معايير يابانية' },
                            note: 'يابان تصدّر سكراب وتستورد خام — فرصة لشيخة'
                        },
                        SouthKorea: {
                            name: 'كوريا الجنوبية',
                            laws: { customs: 'KCS (Korea Customs Service)', platform: 'UNI-PASS', scrapPolicy: 'مشجعة للاستيراد' }
                        }
                    }
                },
                {
                    region: 'أوروبا (EU)',
                    importance: 'معايير صارمة — لكن سوق عالي القيمة',
                    laws: {
                        customs: 'EU Customs Code (UCC)',
                        cbam: {
                            name: 'CBAM — آلية تعديل حدود الكربون',
                            startDate: '2026 (مرحلة الإبلاغ بدأت 2023)',
                            affectedMetals: ['حديد وصلب', 'ألمنيوم', 'أسمدة', 'إسمنت', 'كهرباء', 'هيدروجين'],
                            requirement: 'يجب الإبلاغ عن البصمة الكربونية لكل شحنة — شيخة تحسبها آلياً',
                            action: 'شيخة مستعدة مسبقاً — نظام حساب الكربون مدمج'
                        },
                        reach: 'REACH — تسجيل المواد الكيميائية (بعض سبائك المعادن)',
                        rohs: 'RoHS — تقييد المواد الخطرة في الإلكترونيات',
                        conflictMinerals: 'EU Regulation 2017/821 — واجب العناية لمعادن مناطق النزاع (Sn, Ta, W, Au)',
                        waste: 'EU Waste Shipment Regulation — قواعد صارمة لنقل السكراب عبر الحدود',
                        vat: '19-27% حسب الدولة',
                        ceMarking: 'CE Mark — لبعض المنتجات المعدنية المصنعة'
                    },
                    digitalIntegration: {
                        platform: 'ICS2 (Import Control System 2) — إلزامي لكل الواردات',
                        safetyAndSecurity: 'ENS — إشعار دخول أمني قبل 24 ساعة من الشحن',
                        eori: 'رقم EORI — إلزامي للتعامل مع الجمارك الأوروبية',
                        autoFeature: 'شيخة ترسل ENS آلياً عند حجز الشحنة'
                    }
                },
                {
                    region: 'أفريقيا',
                    importance: 'مستقبل التعدين — 30% من المعادن العالمية',
                    laws: {
                        afcfta: {
                            name: 'AfCFTA — منطقة التجارة الحرة القارية الأفريقية',
                            members: '54 دولة',
                            benefit: 'تخفيض جمارك تدريجي — فرصة لشيخة للدخول المبكر'
                        },
                        miningLaws: 'كل دولة لها قانون تعدين مختلف — شيخة ترصد وتُحدّث لحظياً',
                        countries: {
                            SouthAfrica: { laws: 'MPRDA (Mineral & Petroleum Resources Development Act)', customs: 'SARS', exportTax: 'ضريبة تصدير على بعض المعادن الخام', digitalPlatform: 'SARS eFiling' },
                            Ghana: { laws: 'Minerals & Mining Act 2006', customs: 'GRA (Ghana Revenue Authority)', goldExport: 'مسموح عبر Bank of Ghana', digitalPlatform: 'GCNet / UNIPASS' },
                            Sudan: { laws: 'قانون الثروة المعدنية 2015', customs: 'الجمارك السودانية', goldExport: 'مسموح عبر بنك السودان المركزي', opportunity: 'ذهب + كروم + حديد — جار عربي مسلم' },
                            DRC: { laws: 'Mining Code 2018', conflictMinerals: 'OECD Due Diligence إلزامي — معادن 3TG', note: 'كوبالت + نحاس + كولتان — فحص دقيق مطلوب' },
                            Mauritania: { laws: 'Code Minier', ironOre: 'SNIM — 13 مليون طن حديد خام', opportunity: 'دولة عربية مسلمة — فرصة طبيعية' }
                        }
                    }
                },
                {
                    region: 'الأمريكتان',
                    laws: {
                        USA: {
                            customs: 'CBP (Customs & Border Protection)',
                            tariffs: 'Section 232 — ضريبة 25% على صلب + 10% على ألمنيوم (بعض الإعفاءات)',
                            doddFrank: 'Dodd-Frank Act Section 1502 — إفصاح معادن النزاع (Sn, Ta, W, Au)',
                            ofac: 'قائمة العقوبات — فحص إلزامي لكل عميل ومورد',
                            isri: 'ISRI Scrap Specifications — المعيار العالمي لتصنيف السكراب',
                            digitalPlatform: 'ACE (Automated Commercial Environment)',
                            autoFeature: 'شيخة تفحص OFAC آلياً + تُصدر شهادة امتثال'
                        },
                        Chile: { importance: 'أكبر منتج نحاس', customs: 'Aduana Chile', exportTax: 'ضريبة تعدين تصاعدية' },
                        Brazil: { importance: 'أكبر منتج حديد خام (Vale)', customs: 'Receita Federal', standards: 'ABNT' }
                    }
                }
            ]
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  3. الاتفاقيات التجارية والمنظمات الدولية
    // ═══════════════════════════════════════════════════════════════════════════
    getTradeAgreements() {
        return {
            بسم_الله: 'بسم الله الرحمن الرحيم',
            title: 'الاتفاقيات التجارية والمنظمات — شيخة ممتثلة لكل المعايير',

            agreements: [
                { name: 'WTO', nameAr: 'منظمة التجارة العالمية', saudiMember: 'نعم — منذ 2005', relevance: 'تحرير تجارة المعادن + تسوية نزاعات', autoCompliance: 'شيخة تطبق قواعد المنشأ + MFN + Anti-dumping آلياً' },
                { name: 'GCC Customs Union', nameAr: 'الاتحاد الجمركي الخليجي', relevance: 'صفر جمارك داخل الخليج — 5% خارجياً' },
                { name: 'GAFTA', nameAr: 'منطقة التجارة العربية الحرة الكبرى', members: '18 دولة عربية', relevance: 'صفر جمارك على المنتجات العربية بشهادة منشأ' },
                { name: 'OIC TPS-OIC', nameAr: 'نظام الأفضليات التجارية لمنظمة التعاون الإسلامي', relevance: 'تخفيض جمارك بين الدول الإسلامية' },
                { name: 'Saudi-China FTA (مفاوضات)', status: 'قيد التفاوض — GCC-China', potential: 'تخفيض كبير في جمارك المعادن' },
                { name: 'Saudi-UK FTA (مفاوضات)', status: 'مفاوضات نشطة', potential: 'وصول لسوق LME/LBMA بتسهيلات' },
                { name: 'Saudi-EU FTA (مفاوضات)', status: 'مبكر', potential: 'أكبر سوق قيمة' }
            ],

            internationalOrgs: [
                { name: 'OECD', relevance: 'إرشادات العناية الواجبة لسلاسل إمداد المعادن من مناطق النزاع', autoCompliance: 'شيخة تُطبق OECD 5-Step Framework آلياً' },
                { name: 'FATF', relevance: 'مكافحة غسل الأموال وتمويل الإرهاب', autoCompliance: 'KYC/AML مدمج — فحص كل عميل ومورد وناقل' },
                { name: 'Basel Convention', relevance: 'نقل النفايات الخطرة عبر الحدود — بعض السكراب مشمول', autoCompliance: 'تصنيف آلي للسكراب: خطر vs غير خطر' },
                { name: 'IMO', relevance: 'سلامة الشحن البحري — IMDG Code للبضائع الخطرة', autoCompliance: 'تصنيف DG آلي + وثائق مطلوبة' },
                { name: 'LME / LBMA', relevance: 'معايير الجودة + التسعير المرجعي + قائمة المصافي المعتمدة', autoCompliance: 'تسعير مربوط بـ LME/LBMA لحظياً' },
                { name: 'ISO', relevance: 'معايير الجودة + البيئة + السلامة', autoCompliance: 'كل عملية في شيخة مطابقة لـ ISO' }
            ]
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    //  4. الأساس الشرعي للامتثال
    // ═══════════════════════════════════════════════════════════════════════════
    getIslamicCompliance() {
        return {
            بسم_الله: 'بسم الله الرحمن الرحيم',
            title: 'الامتثال الشرعي — الأساس الذي يفتقده كل المنافسين',

            principles: [
                {
                    principle: 'طاعة ولي الأمر',
                    ref: 'النساء:59',
                    text: 'أَطِيعُوا اللَّهَ وَأَطِيعُوا الرَّسُولَ وَأُولِي الْأَمْرِ مِنكُمْ',
                    application: 'الامتثال لأنظمة المملكة واجب شرعي — شيخة تلتزم بكل الأنظمة السعودية',
                    autoCompliance: 'كل قانون سعودي مُبرمج في النظام — لا يمكن تجاوزه'
                },
                {
                    principle: 'الوفاء بالعهود والعقود',
                    ref: 'المائدة:1',
                    text: 'يَا أَيُّهَا الَّذِينَ آمَنُوا أَوْفُوا بِالْعُقُودِ',
                    application: 'كل اتفاقية تجارية دولية = عهد يجب الوفاء به',
                    autoCompliance: 'النظام يُنبّه عند مخالفة أي اتفاقية'
                },
                {
                    principle: 'الصدق والأمانة في التجارة',
                    ref: 'حديث: "التاجر الصدوق الأمين مع النبيين والصديقين والشهداء"',
                    application: 'الشفافية في كل عملية — لا غش ولا تدليس ولا إخفاء عيوب',
                    autoCompliance: 'كل وثيقة شيخة شفافة — العميل يرى كل التفاصيل'
                },
                {
                    principle: 'تحريم الربا',
                    ref: 'البقرة:275',
                    text: 'وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا',
                    application: 'كل التمويل في شيخة = تكافل + مرابحة + مشاركة — لا ربا',
                    autoCompliance: 'النظام يرفض أي معاملة فيها ربا'
                },
                {
                    principle: 'تحريم الاحتكار',
                    ref: 'حديث: "الجالب مرزوق والمحتكر ملعون"',
                    application: 'شيخة لا تحتكر — تيسر تدفق المعادن للجميع',
                    autoCompliance: 'النظام يُنبّه إذا تجاوزت الكمية المخزنة حداً معيناً بدون مبرر تجاري'
                },
                {
                    principle: 'احترام قوانين الدول الأخرى',
                    ref: 'حديث: "المسلمون عند شروطهم"',
                    application: 'عند التجارة مع أي دولة — نلتزم بقوانينها ما لم تخالف الشريعة',
                    autoCompliance: 'قوانين كل دولة مُبرمجة — النظام يُنبّه عن أي تعارض مع الشريعة'
                },
                {
                    principle: 'الزكاة',
                    ref: 'التوبة:34',
                    application: 'زكاة 2.5% على الذهب والفضة + عروض التجارة سنوياً',
                    autoCompliance: 'حساب الزكاة آلي — تنبيه عند الاستحقاق — تحويل لـ ZATCA'
                },
                {
                    principle: 'عدم التعامل مع المحرمات',
                    application: 'لا نقل خمر/خنزير/مخدرات | لا تعامل مع شركات مقاطَعة | فحص العقوبات OFAC',
                    autoCompliance: 'قوائم سوداء مُبرمجة — رفض آلي'
                }
            ]
        };
    }
}

module.exports = SheikhaReadinessComplianceEngine;
