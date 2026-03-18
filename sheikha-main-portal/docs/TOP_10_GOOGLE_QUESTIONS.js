/**
 * ✨ أفضل 10 أسئلة يجب طرحها على Google Cloud
 * ═════════════════════════════════════════════════════════════
 * الأسئلة الأساسية التي ستقوّي المشروع بشكل كبير
 */

const Top10Questions = {
    introduction: `
    أيها المستشار الحكيم،
    
    هذه أفضل 10 أسئلة استراتيجية نوصي بطرحها على فريق Google Cloud
    لضمان تطبيق أفضل الممارسات بكفاءة وأمان.
    `,

    questions: [
        {
            rank: '1️⃣',
            priority: 'CRITICAL',
            title: 'ما أفضل معمارية لتطبيق تجارة معادن عالمي مع أسعار حية؟',
            context: 'نحتاج نظام يتعامل مع آلاف المستخدمين المتزامنين',
            expectedAnswer: [
                '✓ استخدام Cloud Run للـ API (serverless)',
                '✓ Cloud Load Balancing لتوزيع الحمل عالمياً',
                '✓ Pub/Sub للأسعار الحية (latency < 100ms)',
                '✓ Firestore للبيانات الرئيسية + BigQuery للتحليلات'
            ],
            actionItems: [
                'Request architecture diagram من Google Cloud Architect',
                'طلب best practices document',
                'جدولة session مع solutions engineer'
            ]
        },

        {
            rank: '2️⃣',
            priority: 'CRITICAL',
            title: 'كيف نضمن أمن البيانات المالية والتجارية بشكل كامل؟',
            context: 'لدينا بيانات حساسة: أسعار، عقود، معلومات المستخدمين',
            expectedAnswer: [
                '✓ CMEK encryption مع Cloud KMS',
                '✓ VPC Service Controls للعزلة الكاملة',
                '✓ Cloud Audit Logs لكل العمليات',
                '✓ Auto-rotation للمفاتيح (بدون تدخل يدوي)',
                '✓ Penetration testing سنوي من Google'
            ],
            actionItems: [
                'طلب security checklist مفصل',
                'الحصول على risk assessment',
                'جدولة security audit'
            ]
        },

        {
            rank: '3️⃣',
            priority: 'HIGH',
            title: 'كيف نطبق AI chatbot ذكي لخدمة العملاء 24/7؟',
            context: 'نريد chatbot يفهم أسئلة التاجر والمستثمر',
            expectedAnswer: [
                '✓ استخدام Vertex AI Gemini Pro',
                '✓ Fine-tuning على بيانات تاريخ المعادن',
                '✓ Context caching للردود السريعة',
                '✓ Multi-language support (AR/EN)',
                '✓ Integration مع knowledge base'
            ],
            actionItems: [
                'طلب sample code لـ Gemini integration',
                'استشارة حول fine-tuning strategy',
                'معايير التطبيق (cost, latency, accuracy)'
            ]
        },

        {
            rank: '4️⃣',
            priority: 'HIGH',
            title: 'كيف نتنبأ بأسعار المعادن بدقة استخدام البيانات التاريخية؟',
            context: 'لدينا 5 سنوات من بيانات الأسعار',
            expectedAnswer: [
                '✓ BigQuery ML Time Series Forecasting',
                '✓ التدريب على 5 سنوات من البيانات',
                '✓ Accuracy > 80-85% للتنبؤات',
                '✓ Real-time predictions API',
                '✓ A/B testing للنماذج المختلفة'
            ],
            actionItems: [
                'استشارة بخصوص model selection',
                'طلب guidelines لـ data preparation',
                'تحديد KPIs للدقة والأداء'
            ]
        },

        {
            rank: '5️⃣',
            priority: 'HIGH',
            title: 'ما هي أفضل استراتيجية caching لتقليل latency؟',
            context: 'نريد latency أقل من 100ms للـ API calls',
            expectedAnswer: [
                '✓ Cloud CDN للـ static assets (< 50ms)',
                '✓ Firestore caching للبيانات المتكررة',
                '✓ Redis for session + frequently accessed data',
                '✓ Browser caching لـ 1 year للـ static',
                '✓ Cache invalidation strategy واضحة'
            ],
            actionItems: [
                'طلب caching architecture diagram',
                'معايير حجم الكاش (memory limits)',
                'استراتيجية invalidation'
            ]
        },

        {
            rank: '6️⃣',
            priority: 'MEDIUM',
            title: 'كيف ننشر globally مع ضمان uptime 99.95%؟',
            context: 'نحتاج إلى serve المستخدمين من كل أنحاء العالم',
            expectedAnswer: [
                '✓ Multi-region deployment في 3+ مناطق',
                '✓ Global Load Balancer مع health checks',
                '✓ Database replication across regions',
                '✓ Monitoring و alerting شامل',
                '✓ Disaster recovery plan',
                '✓ Auto-failover في case of outage'
            ],
            actionItems: [
                'تحديد المناطق الجغرافية الأولويات',
                'طلب deployment checklist',
                'جدولة disaster recovery drill'
            ]
        },

        {
            rank: '7️⃣',
            priority: 'MEDIUM',
            title: 'كيف نطبق compliance reporting تلقائياً؟',
            context: 'نحتاج تقارير audit وامتثال منتظمة',
            expectedAnswer: [
                '✓ Cloud Audit Logs لكل العمليات',
                '✓ Automated compliance report generation',
                '✓ Data Loss Prevention (DLP) scanning',
                '✓ Security Command Center monitoring',
                '✓ Monthly compliance dashboard',
                '✓ Support لـ GDPR/SOC2/PCI-DSS/PDPL'
            ],
            actionItems: [
                'طلب compliance framework document',
                'تحديد regulatory requirements',
                'إعداد automated reporting pipeline'
            ]
        },

        {
            rank: '8️⃣',
            priority: 'MEDIUM',
            title: 'كيف نحسّن تكاليف Google Cloud عند النمو؟',
            context: 'نريد أن نحافظ على تكاليف معقولة مع النمو',
            expectedAnswer: [
                '✓ استخدام Committed Use Discounts (25-30% savings)',
                '✓ BigQuery slots vs on-demand analysis',
                '✓ Resource optimization recommendations',
                '✓ Cost anomaly detection',
                '✓ Quarterly cost review meetings',
                '✓ Right-sizing recommendations'
            ],
            actionItems: [
                'طلب cost optimization assessment',
                'تقديم historical billing data',
                'تحديد cost targets'
            ]
        },

        {
            rank: '9️⃣',
            priority: 'MEDIUM',
            title: 'كيف نطبق advanced analytics و business intelligence؟',
            context: 'نريد insights عن سلوك المستخدمين والسوق',
            expectedAnswer: [
                '✓ Google Analytics 4 integration',
                '✓ BigQuery for data warehousing',
                '✓ Looker Studio for dashboards',
                '✓ Predictive analytics for trends',
                '✓ Custom reporting per business need',
                '✓ Real-time alerting on anomalies'
            ],
            actionItems: [
                'تحديد business metrics المهمة',
                'طلب analytics architecture',
                'بدء الـ GA4 integration'
            ]
        },

        {
            rank: '🔟',
            priority: 'LOW-MEDIUM',
            title: 'هل هناك credits أو special programs للشركات العربية؟',
            context: 'نحن شركة سعودية صغيرة لكن بطموح عالمي',
            expectedAnswer: [
                '✓ Startup program (credit + support + training)',
                '✓ MENA regional programs',
                '✓ Free tier for education/research',
                '✓ Partnership opportunities',
                '✓ Discount programs for local businesses',
                '✓ Potential technical sponsorship'
            ],
            actionItems: [
                'التقدم لـ Cloud Startup Program',
                'الاستفسار عن MENA specific offers',
                'طلب dedicated account manager'
            ]
        }
    ],

    // ═══ خطة التنفيذ بناءً على الإجابات
    implementationPlan: {
        phase1_foundation: {
            duration: 'Week 1-2',
            focus: 'Questions 1, 2, and 5',
            goal: 'بناء foundation آمن وسريع'
        },
        phase2_intelligence: {
            duration: 'Week 3-4',
            focus: 'Questions 3 and 4',
            goal: 'إضافة قدرات AI والتنبؤ'
        },
        phase3_scale: {
            duration: 'Week 5-6',
            focus: 'Questions 6, 7, and 8',
            goal: 'توسع عالمي وامتثال'
        },
        phase4_optimize: {
            duration: 'Week 7+',
            focus: 'Questions 9 and 10',
            goal: 'تحسين مستمر وذكي'
        }
    },

    // ═══ أفضل طريقة للتواصل
    howToContact: {
        method1: {
            name: 'Google Cloud Support',
            path: 'Console → Support → Create Issue',
            level: 'Premium Support (recommended)',
            cost: 'ضمن الـ subscription'
        },
        method2: {
            name: 'Schedule Free Consultation',
            url: 'cloudarchitects.google.com',
            duration: '1 hour',
            noPrep: true
        },
        method3: {
            name: 'Join Google Cloud MENA Community',
            platform: 'Google Cloud Communities',
            benefit: 'Access to regional experts'
        },
        method4: {
            name: 'Attend Google Cloud Events',
            frequency: 'Monthly webinars + annual summit',
            benefit: 'Networking + latest updates'
        }
    },

    // ═══ معايير النجاح
    successCriteria: {
        technical: [
            '✓ Architecture diagram approved by Google architect',
            '✓ Security checklist 100% complete',
            '✓ Performance targets met (< 1s load time)',
            '✓ Uptime > 99.95% maintained',
            '✓ AI features functional and accurate'
        ],
        business: [
            '✓ Cost optimized (< budget targets)',
            '✓ Compliance fully documented',
            '✓ Analytics dashboard live',
            '✓ User satisfaction > 4.8/5',
            '✓ Ready for global scale'
        ]
    }
};

module.exports = Top10Questions;
