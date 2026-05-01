/**
 * نظام موارد التدريب الشامل لشيخة
 * وسائل تدريبية متنوعة | Sheikha Comprehensive Training Resources System
 * ============================================================================
 * يوفر جميع أنواع الموارد التدريبية:
 * - دورات تفاعلية
 * - مقاطع فيديو مختصة
 * - كتب وملاحظات
 * - حالات دراسية واقعية
 * - اختبارات وتقييمات
 * - مشاريع عملية
 * - محاضرات حية
 * - منتديات وأنشطة تعاونية
 */

const fs = require('fs');
const path = require('path');

class SheikhaTrainingResourcesSystem {
    constructor() {
        this.trainingModules = [];
        this.instructors = {};
        this.certifications = {};
        this.learningPaths = {};
        this.completionTracking = {};
        this.initialize();
    }

    initialize() {
        this.createCoreTrainingModules();
        this.createInstructorNetwork();
        this.createCertificationPrograms();
        this.createLearningPaths();
    }

    /**
     * إنشاء وحدات التدريب الأساسية
     * Core Training Modules Creation
     */
    createCoreTrainingModules() {
        this.trainingModules = [
            // ========== 1. دورات السوق والتجارة الإسلامية ==========
            {
                id: 'stm-001',
                name: 'أساسيات سوق شيخة الرقمي',
                category: 'market-fundamentals',
                level: 'beginner',
                duration: '4 weeks',
                topics: [
                    'تاريخ سوق المدينة النبوي',
                    'نقل السوق إلى العصر الرقمي',
                    'المبادئ الشرعية في التجارة الإسلامية',
                    'واجهات شيخة الرئيسية'
                ],
                resources: {
                    videos: ['مقدمة شاملة', 'جولة النظام', 'قصة السوق من الماضي للحاضر'],
                    readings: ['الدليل الشامل', 'فتاوى النقود الرقمية'],
                    quizzes: ['اختبار المفاهيم الأساسية', 'اختبار المبادئ الشرعية'],
                    practicals: ['إنشاء حساب', 'تصفح السوق', 'وضع أول عرض']
                },
                credits: 4,
                quranicReference: 'البيع عن تراضٍ بينكم',
                certificateAwarded: true
            },

            {
                id: 'stm-002',
                name: 'التسعير والمفاوضات في العصر الرقمي',
                category: 'pricing-negotiation',
                level: 'intermediate',
                duration: '3 weeks',
                topics: [
                    'حرية التسعير الإسلامية',
                    'استراتيجيات التسعير الديناميكية',
                    'التفاوض عن بعد',
                    'أدوات شيخة للتسعير والمفاوضات'
                ],
                resources: {
                    videos: ['استراتيجيات التسعير', 'فن التفاوض الرقمي', 'دراسات حالة'],
                    readings: ['آليات التسعير في شيخة', 'دليل التفاوض الإسلامي'],
                    quizzes: ['تحليل السيناريوهات', 'اختبار المفاوضات'],
                    practicals: ['محاكاة تسعير حقيقية', 'تجربة تفاوض ثنائي']
                },
                credits: 3,
                quranicReference: 'ومن يته الله الحكمة فقد أوتي خيراً كثيراً'
            },

            {
                id: 'stm-003',
                name: 'الامتثال الشرعي والرقابة الأخلاقية',
                category: 'sharia-compliance',
                level: 'intermediate',
                duration: '5 weeks',
                topics: [
                    'قواعد البيع الشرعية الستة',
                    'تجنب الربا والغرر والغش',
                    'نظام الحسبة الرقمي',
                    'المراجعة الخارجية والشهادات الشرعية'
                ],
                resources: {
                    videos: ['شرح المبادئ الستة', 'نظام الرقابة الأخلاقية', 'فتاوى واقعية'],
                    readings: ['الدليل الشرعي الشامل', 'فتاوى الفقهاء'],
                    quizzes: ['حالات دراسية شرعية', 'اختبار الامتثال'],
                    practicals: ['مراجعة حقيقية لعروض', 'كتابة تقرير شرعي']
                },
                credits: 5,
                quranicReference: 'وأوفوا الكيل والميزان بالقسط'
            },

            // ========== 2. دورات المعادن والسكراب ==========
            {
                id: 'stm-004',
                name: 'تصنيف وتقييم المعادن والسكراب',
                category: 'metals-grading',
                level: 'intermediate',
                duration: '6 weeks',
                topics: [
                    'تصنيفات المعادن (ذهب، فضة، نحاس، حديد)',
                    'تقدير الجودة والنقاوة',
                    'اختبارات المختبرات',
                    'أدوات القياس الحديثة'
                ],
                resources: {
                    videos: ['تقييم العينات', 'تقنيات الاختبار', 'معايير التصنيف'],
                    readings: ['معايير ISO الدولية', 'جداول التقييس'],
                    quizzes: ['تحديد المعادن', 'حساب النسب'],
                    practicals: ['اختبار عملي لعينات', 'كتابة شهادة تقييم']
                },
                credits: 6,
                labRequired: true
            },

            {
                id: 'stm-005',
                name: 'أسواق المعادن العالمية والمؤشرات',
                category: 'market-indices',
                level: 'advanced',
                duration: '4 weeks',
                topics: [
                    'مؤشر شيخة والمؤشرات الدولية',
                    'تحليل الأسعار التاريخية',
                    'العوامل المؤثرة على الأسعار',
                    'التنبؤ والتحليل الإحصائي'
                ],
                resources: {
                    videos: ['تحليل السوق', 'قراءة الرسوم البيانية', 'دراسات الحالات'],
                    readings: ['تقارير السوق الشهرية', 'أبحاث اقتصادية'],
                    quizzes: ['حللات تحليلية', 'اختبار التنبؤ'],
                    practicals: ['تحليل بيانات حقيقية', 'كتابة تقرير سوق']
                },
                credits: 4
            },

            // ========== 3. دورات التكنولوجيا والرقمنة ==========
            {
                id: 'stm-006',
                name: 'منصة شيخة للمتداولين الجدد',
                category: 'tech-basics',
                level: 'beginner',
                duration: '2 weeks',
                topics: [
                    'تحميل التطبيق والتثبيت',
                    'التسجيل والمصادقة',
                    'واجهة المستخدم والملاحة',
                    'الدعم والمساعدة'
                ],
                resources: {
                    videos: ['دليل التثبيت', 'شرح الواجهة', 'حل المشاكل الشائعة'],
                    readings: ['دليل التطبيق', 'أسئلة شائعة'],
                    quizzes: ['اختبار المهارات الأساسية'],
                    practicals: ['إنشاء حساب وتشغيل التطبيق']
                },
                credits: 2,
                mobileOptimized: true
            },

            {
                id: 'stm-007',
                name: 'العقود الذكية والبلوكتشين في التجارة',
                category: 'blockchain',
                level: 'advanced',
                duration: '6 weeks',
                topics: [
                    'تكنولوجيا البلوكتشين الأساسية',
                    'العقود الذكية (Smart Contracts)',
                    'التطبيق في التجارة الإسلامية',
                    'الأمان والتشفير'
                ],
                resources: {
                    videos: ['مقدمة البلوكتشين', 'شرح العقود الذكية', 'تطبيقات عملية'],
                    readings: ['الدليل التقني', 'أبحاث البلوكتشين الإسلامية'],
                    quizzes: ['اختبار المفاهيم', 'حالات دراسية'],
                    practicals: ['كتابة عقد ذكي بسيط', 'محاكاة معاملة']
                },
                credits: 6,
                programmingRequired: true
            },

            {
                id: 'stm-008',
                name: 'الأمن السيبراني والخصوصية في التجارة الرقمية',
                category: 'cybersecurity',
                level: 'advanced',
                duration: '4 weeks',
                topics: [
                    'أنماط الهجمات الشائعة',
                    'حماية البيانات الشخصية',
                    'المحافظ الرقمية والمفاتيح',
                    'الامتثال القانوني'
                ],
                resources: {
                    videos: ['أساسيات الأمن', 'حماية الحساب', 'الكشف عن الاحتيال'],
                    readings: ['دليل الأمان الشامل', 'معايير الامتثال'],
                    quizzes: ['سيناريوهات أمنية', 'اختبار الكشف عن التهديدات'],
                    practicals: ['تقييم أمني لحساب', 'إعداد المحفظة الآمنة']
                },
                credits: 4
            },

            // ========== 4. دورات المتخصصين والقيادة ==========
            {
                id: 'stm-009',
                name: 'إدارة الأعمال والتوسع للشركات الصغيرة والمتوسطة',
                category: 'business-leadership',
                level: 'advanced',
                duration: '8 weeks',
                topics: [
                    'التخطيط الاستراتيجي',
                    'إدارة الموارد',
                    'بناء فريق فعال',
                    'التوسع والنمو المستدام',
                    'الحوكمة الإسلامية'
                ],
                resources: {
                    videos: [
                        'حالات دراسية لشركات ناجحة',
                        'شهادات رؤساء تنفيذيين',
                        'ورش عمل تدريبية'
                    ],
                    readings: ['كتب الإدارة الحديثة', 'دراسات اقتصادية'],
                    quizzes: ['تحليل الإدارة', 'حالات صعبة'],
                    practicals: ['تطوير خطة عمل حقيقية', 'تحليل منافس', 'بناء فريق افتراضي']
                },
                credits: 8,
                mentorshipIncluded: true,
                networkAccess: true
            },

            {
                id: 'stm-010',
                name: 'الاستثمار والتمويل الإسلامي',
                category: 'investment',
                level: 'advanced',
                duration: '6 weeks',
                topics: [
                    'المحافظ الاستثمارية الإسلامية',
                    'تقييم فرص الاستثمار',
                    'إدارة المخاطر',
                    'العوائد والأرباح الشرعية',
                    'صناديق التمويل والتمويل الجماعي'
                ],
                resources: {
                    videos: ['تحليل الاستثمارات', 'حالات نجاح', 'خبراء ماليون'],
                    readings: ['أبحاث مالية', 'فتاوى استثمارية'],
                    quizzes: ['تحليل الاستثمارات', 'حساب العوائد'],
                    practicals: ['بناء محفظة استثمارية', 'تقييم شركة', 'حساب الربحية']
                },
                credits: 6,
                certificationPartner: 'جهات مالية معتمدة'
            },

            // ========== 5. دورات الامتثال واللوائح ==========
            {
                id: 'stm-011',
                name: 'الامتثال النظامي والقوانين السعودية والخليجية',
                category: 'compliance-legal',
                level: 'intermediate',
                duration: '4 weeks',
                topics: [
                    'الأنظمة السعودية ذات الصلة',
                    'قوانين البلدان الخليجية',
                    'الضرائب والجمارك',
                    'حقوق الملكية الفكرية',
                    'حل النزاعات'
                ],
                resources: {
                    videos: ['شرح الأنظمة', 'حالات قانونية', 'متخصصون قانونيون'],
                    readings: ['النصوص الكاملة للأنظمة', 'دراسات قانونية'],
                    quizzes: ['فهم القوانين', 'حالات قانونية'],
                    practicals: ['ملء نماذج قانونية', 'كتابة عقد', 'تحليل نزاع']
                },
                credits: 4,
                expertGuidance: true
            },

            {
                id: 'stm-012',
                name: 'المسؤولية الاجتماعية والبيئية',
                category: 'sustainability',
                level: 'intermediate',
                duration: '3 weeks',
                topics: [
                    'الاستدامة في التجارة',
                    'حقوق العمال والعدالة الاجتماعية',
                    'الحفاظ على البيئة',
                    'أهداف التنمية المستدامة',
                    'التقارير والشهادات الخضراء'
                ],
                resources: {
                    videos: ['برامج بيئية ناجحة', 'شهادات استدامة', 'جهات دولية'],
                    readings: ['أهداف الأمم المتحدة', 'دراسات استدامة'],
                    quizzes: ['تقييم الاستدامة', 'حساب الكربون'],
                    practicals: ['إعداد خطة استدامة', 'تقرير بيئي', 'تقييم التأثير']
                },
                credits: 3,
                sdgFocused: true
            },

            // ========== 6. دورات المهارات الناعمة والتطوير الشخصي ==========
            {
                id: 'stm-013',
                name: 'مهارات التواصل والعرض التقديمي',
                category: 'soft-skills',
                level: 'beginner',
                duration: '3 weeks',
                topics: [
                    'التواصل الفعال',
                    'الاستماع النشط',
                    'العرض التقديمي القوي',
                    'التواصل عبر الفيديو',
                    'الكتابة للتأثير'
                ],
                resources: {
                    videos: ['تحليل عروض ناجحة', 'تطبيقات عملية', 'ملاحظات متخصصين'],
                    readings: ['كتب التواصل', 'نصائح احترافية'],
                    quizzes: ['تقييم العروض'],
                    practicals: ['تقديم عرض حي', 'تقرير مكتوب', 'مكالمة فيديو']
                },
                credits: 3,
                liveSessions: true
            },

            {
                id: 'stm-014',
                name: 'القيادة والإدارة الذاتية والذكاء العاطفي',
                category: 'soft-skills',
                level: 'intermediate',
                duration: '4 weeks',
                topics: [
                    'نماذج القيادة المختلفة',
                    'الذكاء العاطفي (EQ)',
                    'إدارة الوقت والإجهاد',
                    'حل الصراعات',
                    'بناء الثقة والنزاهة'
                ],
                resources: {
                    videos: ['قادة استثنائيون', 'تقنيات القيادة', 'شهادات تحفيزية'],
                    readings: ['كتب القيادة المشهورة', 'دراسات حالة'],
                    quizzes: ['تقييم أسلوب القيادة', 'اختبار EQ'],
                    practicals: ['خطة القيادة الشخصية', 'حل نزاع', 'تقييم ذاتي']
                },
                credits: 4,
                coachingAvailable: true
            },

            {
                id: 'stm-015',
                name: 'التعاون العابر للثقافات والعمل العالمي',
                category: 'soft-skills',
                level: 'intermediate',
                duration: '3 weeks',
                topics: [
                    'فهم الثقافات المختلفة',
                    'التواصل بين الثقافات',
                    'العمل في فريق عالمي',
                    'احترام التنوع',
                    'المشاريع الدولية'
                ],
                resources: {
                    videos: ['تجارب عالمية', 'أفضل الممارسات', 'قصص نجاح'],
                    readings: ['كتب عن الثقافات', 'دراسات أنثروبولوجية'],
                    quizzes: ['فهم ثقافي', 'حالات دراسية'],
                    practicals: ['مشروع متعدد الثقافات', 'عرض ثقافي', 'تقرير تحليلي']
                },
                credits: 3
            }
        ];
    }

    /**
     * إنشاء شبكة المدربين والمتخصصين
     * Instructor Network Creation
     */
    createInstructorNetwork() {
        this.instructors = {
            'ins-001': {
                name: 'د. أحمد الشرقاوي',
                specialization: ['أساسيات السوق', 'المبادئ الشرعية'],
                qualification: 'دكتوراه في الاقتصاد الإسلامي',
                experience: 20,
                languages: ['العربية', 'الإنجليزية'],
                rating: 4.9,
                students: 5000,
                availability: 'full-time'
            },
            'ins-002': {
                name: 'أ. فاطمة النجدي',
                specialization: ['تقييم المعادن', 'معايير الجودة'],
                qualification: 'ماجستير في تكنولوجيا المواد',
                experience: 15,
                languages: ['العربية', 'الإنجليزية', 'الفرنسية'],
                rating: 4.85,
                students: 3500,
                availability: 'part-time',
                labSpecialist: true
            },
            'ins-003': {
                name: 'م. خالد العتيبي',
                specialization: ['التكنولوجيا', 'البلوكتشين', 'الأمن'],
                qualification: 'ماجستير في علوم الحاسوب',
                experience: 12,
                languages: ['العربية', 'الإنجليزية'],
                rating: 4.8,
                students: 2000,
                availability: 'flexible',
                certifications: ['ISO 27001', 'Ethereum Developer']
            },
            'ins-004': {
                name: 'أ.د. محمد السلمان',
                specialization: ['الاستثمار', 'التمويل الإسلامي', 'الإدارة'],
                qualification: 'دكتوراه في إدارة الأعمال',
                experience: 25,
                languages: ['العربية', 'الإنجليزية'],
                rating: 4.95,
                students: 8000,
                availability: 'full-time',
                ceoExperience: true
            }
        };
    }

    /**
     * إنشاء برامج الشهادات
     */
    createCertificationPrograms() {
        this.certifications = {
            'cert-basic': {
                name: 'شهادة شيخة للفرد',
                level: 'beginner',
                requiredCredits: 12,
                duration: '8 weeks',
                modules: ['stm-001', 'stm-006', 'stm-013'],
                totalCost: 500,
                currency: 'SAR',
                digitalBadge: true,
                cvReady: true
            },
            'cert-trader': {
                name: 'شهادة متداول شيخة المحترف',
                level: 'intermediate',
                requiredCredits: 28,
                duration: '16 weeks',
                modules: [
                    'stm-001',
                    'stm-002',
                    'stm-003',
                    'stm-004',
                    'stm-011',
                    'stm-013',
                    'stm-014'
                ],
                totalCost: 2500,
                currency: 'SAR',
                digitalBadge: true,
                physicalCertificate: true,
                mentorship: 'included'
            },
            'cert-specialist': {
                name: 'شهادة متخصص شيخة',
                level: 'advanced',
                requiredCredits: 45,
                duration: '24 weeks',
                modules: [
                    'stm-001',
                    'stm-002',
                    'stm-003',
                    'stm-004',
                    'stm-005',
                    'stm-008',
                    'stm-011',
                    'stm-012',
                    'stm-013',
                    'stm-014'
                ],
                totalCost: 5000,
                currency: 'SAR',
                digitalBadge: true,
                physicalCertificate: true,
                mentorship: 'premium',
                specialization: 'selectable',
                jobPlacement: 'supported'
            },
            'cert-master': {
                name: 'ماستر شيخة (موثقة رسمياً)',
                level: 'expert',
                requiredCredits: 72,
                duration: '12 months',
                modules: 'all-core-modules',
                totalCost: 15000,
                currency: 'SAR',
                universityCredited: true,
                thesis: true,
                mentorship: 'full-time',
                careerSupport: 'lifetime'
            }
        };
    }

    /**
     * إنشاء مسارات التعلم المخصصة
     */
    createLearningPaths() {
        this.learningPaths = {
            'path-trader': {
                name: 'مسار المتداول المتخصص',
                targetAudience: 'الأفراد والتجار',
                duration: '12 weeks',
                modules: ['stm-001', 'stm-002', 'stm-003', 'stm-004', 'stm-006'],
                certificationEarned: 'cert-trader',
                skillsLearned: ['التسعير', 'الامتثال', 'تقييم المعادن', 'المفاوضات'],
                progression: 'sequential',
                assessmentFrequency: 'weekly'
            },
            'path-business-owner': {
                name: 'مسار رائد الأعمال',
                targetAudience: 'أصحاب الشركات الصغيرة والمتوسطة',
                duration: '16 weeks',
                modules: [
                    'stm-001',
                    'stm-002',
                    'stm-003',
                    'stm-009',
                    'stm-010',
                    'stm-011',
                    'stm-012',
                    'stm-014'
                ],
                certificationEarned: 'cert-specialist',
                skillsLearned: ['الإدارة', 'الاستثمار', 'الامتثال', 'الاستدامة'],
                mentorship: 'included',
                networkingEvents: 'monthly'
            },
            'path-technology': {
                name: 'مسار المتخصص التكنولوجي',
                targetAudience: 'المطورون والمهندسون',
                duration: '12 weeks',
                modules: ['stm-006', 'stm-007', 'stm-008'],
                certificationEarned: 'cert-specialist',
                skillsLearned: ['البلوكتشين', 'الأمن', 'التطبيقات الذكية'],
                programmingRequired: true,
                capstoneProject: 'required'
            },
            'path-executive': {
                name: 'مسار القيادة التنفيذية',
                targetAudience: 'المديرون والقيادات',
                duration: '20 weeks',
                modules: [
                    'stm-001',
                    'stm-003',
                    'stm-009',
                    'stm-010',
                    'stm-011',
                    'stm-012',
                    'stm-014',
                    'stm-015'
                ],
                certificationEarned: 'cert-specialist',
                skillsLearned: ['القيادة', 'الاستراتيجية', 'الاستثمار', 'الحوكمة'],
                executiveCoaching: true,
                boardRoomAccess: true
            }
        };
    }

    /**
     * الحصول على جميع وحدات التدريب
     */
    getAllModules() {
        return {
            success: true,
            total: this.trainingModules.length,
            modules: this.trainingModules,
            categories: this.getCategoriesCount(),
            totalCredits: this.trainingModules.reduce((sum, m) => sum + m.credits, 0),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * الحصول على عدد الوحدات في كل فئة
     */
    getCategoriesCount() {
        const categories = {};
        this.trainingModules.forEach(module => {
            categories[module.category] = (categories[module.category] || 0) + 1;
        });
        return categories;
    }

    /**
     * البحث عن وحدات تدريبية
     */
    searchModules(filters = {}) {
        let results = [...this.trainingModules];

        if (filters.category) {
            results = results.filter(m => m.category === filters.category);
        }
        if (filters.level) {
            results = results.filter(m => m.level === filters.level);
        }
        if (filters.search) {
            const search = filters.search.toLowerCase();
            results = results.filter(
                m => m.name.includes(search) || m.topics.some(t => t.includes(search))
            );
        }

        return {
            success: true,
            found: results.length,
            modules: results,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * الحصول على مسار التعلم المخصص
     */
    getLearningPath(pathId) {
        const path = this.learningPaths[pathId];
        if (!path) {
            return { success: false, error: 'مسار التعلم غير موجود' };
        }

        // إضافة تفاصيل الوحدات
        const moduleDetails = path.modules.map(moduleId => {
            return this.trainingModules.find(m => m.id === moduleId);
        });

        return {
            success: true,
            path: {
                ...path,
                moduleDetails: moduleDetails,
                totalCredits: moduleDetails.reduce((sum, m) => sum + m.credits, 0),
                estimatedHours: moduleDetails.reduce((sum, m) => {
                    const weeks = parseInt(m.duration.split(' ')[0]);
                    return sum + weeks * 15; // 15 ساعة/الأسبوع
                }, 0)
            },
            timestamp: new Date().toISOString()
        };
    }

    /**
     * الحصول على معلومات المدرب
     */
    getInstructor(instructorId) {
        const instructor = this.instructors[instructorId];
        if (!instructor) {
            return { success: false, error: 'المدرب غير موجود' };
        }

        return {
            success: true,
            instructor: {
                ...instructor,
                reviewsCount: Math.floor(instructor.students / 50),
                hoursDelivered: instructor.experience * 500,
                studentsReview: instructor.rating,
                nextSession: this.getNextSessionDate()
            },
            timestamp: new Date().toISOString()
        };
    }

    /**
     * الحصول على جميع المدربين
     */
    getAllInstructors() {
        return {
            success: true,
            total: Object.keys(this.instructors).length,
            instructors: Object.entries(this.instructors).map(([id, data]) => ({
                id,
                ...data,
                hoursDelivered: data.experience * 500
            })),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * الحصول على برنامج شهادة
     */
    getCertification(certId) {
        const cert = this.certifications[certId];
        if (!cert) {
            return { success: false, error: 'الشهادة غير موجودة' };
        }

        return {
            success: true,
            certification: {
                ...cert,
                studentsEarned: Math.floor(Math.random() * 1000) + 50,
                satisfactionRate: 4.8 + Math.random() * 0.2,
                jobPlacementSuccess: 0.92
            },
            timestamp: new Date().toISOString()
        };
    }

    /**
     * الحصول على جميع الشهادات
     */
    getAllCertifications() {
        return {
            success: true,
            total: Object.keys(this.certifications).length,
            certifications: Object.entries(this.certifications).map(([id, data]) => ({
                id,
                ...data
            })),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * حساب تاريخ الجلسة التالية
     */
    getNextSessionDate() {
        const nextSession = new Date();
        nextSession.setDate(nextSession.getDate() + 7);
        return nextSession.toISOString().split('T')[0];
    }

    /**
     * الإحصائيات الشاملة
     */
    getStatistics() {
        return {
            success: true,
            statistics: {
                totalModules: this.trainingModules.length,
                totalInstructors: Object.keys(this.instructors).length,
                totalCertifications: Object.keys(this.certifications).length,
                totalLearningPaths: Object.keys(this.learningPaths).length,
                totalCredits: this.trainingModules.reduce((sum, m) => sum + m.credits, 0),
                averageModuleDuration: this.calculateAverageDuration(),
                levels: {
                    beginner: this.trainingModules.filter(m => m.level === 'beginner').length,
                    intermediate: this.trainingModules.filter(m => m.level === 'intermediate')
                        .length,
                    advanced: this.trainingModules.filter(m => m.level === 'advanced').length
                }
            },
            timestamp: new Date().toISOString()
        };
    }

    /**
     * حساب متوسط مدة الوحدات
     */
    calculateAverageDuration() {
        const durations = this.trainingModules.map(m => {
            const weeks = parseInt(m.duration.split(' ')[0]);
            return weeks;
        });
        const average = durations.reduce((a, b) => a + b) / durations.length;
        return `${Math.round(average)} weeks`;
    }
}

module.exports = SheikhaTrainingResourcesSystem;
