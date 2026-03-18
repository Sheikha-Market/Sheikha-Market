/**
 * 💬 الأسئلة المباشرة التي يمكن توجيهها لـ Google Cloud
 * ═════════════════════════════════════════════════════════════
 * قائمة شاملة من الأسئلة الاستراتيجية والتقنية
 */

const DirectQuestionsForGoogle = {
    // ═══ الأسئلة التكنولوجية الأساسية
    technicalQuestions: [
        {
            category: 'Architecture',
            questions: [
                '1. ما أفضل معمارية لتطبيق تجارة إلكترونية عالمي مع أسعار حية؟',
                '2. كيف نطبق real-time notifications بـ latency أقل من 100ms؟',
                '3. ما هي أفضل ممارسات تقسيم البيانات (Sharding) في BigQuery؟',
                '4. كيف نطبق caching strategy فعال لـ price feeds؟',
                '5. ما الفرق بين Cloud Run و GKE، وأيهما أفضل لحالتنا؟'
            ]
        },
        {
            category: 'Performance',
            questions: [
                '1. كيف نحقق Lighthouse score أعلى من 95؟',
                '2. ما الحد الأقصى للـ requests التي يمكن لـ Cloud Load Balancer التعامل معها؟',
                '3. كيف نطبق image optimization تلقائية؟',
                '4. ما أفضل CDN configuration للموارد الثابتة والديناميكية؟',
                '5. كيف نقلل cold start times في Cloud Functions؟'
            ]
        },
        {
            category: 'AI & ML',
            questions: [
                '1. كيف نطبق real-time price prediction باستخدام BigQuery ML؟',
                '2. ما الفرق بين Gemini Pro و Gemini Ultra، وأيهما لحالتنا؟',
                '3. كيف نطبق custom fine-tuning للنموذج على بيانات المعادن؟',
                '4. ما أفضل ممارسات التعامل مع training costs؟',
                '5. كيف نطبق prompt caching على Vertex AI API؟'
            ]
        },
        {
            category: 'Security',
            questions: [
                '1. كيف نطبق CMEK مع rotating encryption keys تلقائياً؟',
                '2. ما أفضل ممارسات IAM roles للفريق التقني والإداري؟',
                '3. كيف نطبق VPC Service Controls للبيانات الحساسة؟',
                '4. ما هي أفضل ممارسات الدفاع ضد SQL injection و XSS؟',
                '5. كيف نطبق WAF (Web Application Firewall) مع Cloud Armor؟'
            ]
        },
        {
            category: 'Cost Optimization',
            questions: [
                '1. ما هي التكلفة المتوقعة لـ BigQuery في حالتنا؟',
                '2. كيف نستخدم Committed Use Discounts بشكل فعال؟',
                '3. ما الفرق بين على الطلب (on-demand) والـ slots في BigQuery؟',
                '4. كيف نقلل تكاليف egress bandwidth؟',
                '5. ما أفضل ممارسات تحسين تكاليف Google Cloud عموماً؟'
            ]
        },
        {
            category: 'Compliance',
            questions: [
                '1. ما متطلبات GDPR لتطبيقنا الذي يتعامل مع بيانات شخصية؟',
                '2. كيف نطبق Data Residency لتخزين البيانات في منطقة معينة؟',
                '3. ما أفضل ممارسات audit logging والامتثال؟',
                '4. هل يمكن الحصول على SOC 2 Type II certification؟',
                '5. ما متطلبات السعودية للبيانات المالية والتجارية؟'
            ]
        }
    ],

    // ═══ الأسئلة الاستراتيجية
    strategicQuestions: [
        {
            question: 'خطة الدعم والاستشارة المتخصصة',
            details: [
                'هل يمكن عقد sessions استشارية منتظمة مع أخصائي Google Cloud؟',
                'ما هي البرامج الخاصة للشركات الناشئة أو الصغيرة؟',
                'هل هناك credits أو offers خاصة للشركات السعودية؟',
                'كيف يمكن الحصول على Google Cloud Partner status؟'
            ]
        },
        {
            question: 'التدريب والموارد',
            details: [
                'ما أفضل مسارات التدريب لـ Google Cloud Developer Certification؟',
                'هل هناك workshops أو webinars منتظمة؟',
                'ما الموارد المتاحة للتطوير السريع؟',
                'كيف نحصل على technical documentation صحيحة ومحدثة؟'
            ]
        },
        {
            question: 'الشراكات والتكاملات',
            details: [
                'هل هناك partnerships معينة تُنصح بها Google في قطاع التجارة؟',
                'كيف نتكامل مع خدمات Google الأخرى (Maps, Commerce, etc)?',
                'ما الإمكانيات المتاحة مع Google Workspace للإدارة؟',
                'هل يمكن التكامل مع Apple Business Register أو Microsoft?'
            ]
        }
    ],

    // ═══ أسئلة التحسين المستمر
    continuousImprovementQuestions: [
        'كيف نطبق best practices جديدة بعد كل update من Google Cloud؟',
        'ما هي الخدمات الجديدة التي ستطلقها Google القريبة جداً؟',
        'كيف نستعد لـ future technologies مثل quantum computing؟',
        'ما أفضل ممارسات sustainability وتقليل البصمة الكربونية؟'
    ],

    // ═══ قائمة المتطلبات الفنية
    technicalRequirements: {
        infrastructure: [
            'Multi-region deployment (3+ regions)',
            'Auto-scaling at peak times',
            '99.95% uptime SLA',
            '< 100ms latency for critical API calls',
            'Real-time data processing'
        ],
        features: [
            'Real-time price feeds',
            'AI-powered chatbot',
            'Price forecasting',
            'Compliance reporting',
            'Advanced analytics dashboard'
        ],
        security: [
            'AES-256 encryption at rest',
            'TLS 1.3 in transit',
            'Multi-factor authentication',
            'Role-based access control (RBAC)',
            'Audit logging and monitoring'
        ],
        compliance: [
            'GDPR compliant',
            'SOC 2 Type II certified',
            'PCI DSS compliant (if handling payments)',
            'Local Saudi Arabia regulations',
            'International trading standards'
        ]
    },

    // ═══ الخطوات العملية للتواصل
    howToEngage: {
        step1: 'تسجيل الدخول إلى Google Cloud Console',
        step2: 'الانتقال إلى Support > Create Issue',
        step3: 'الاختيار: Technical Consultation (Premium Support)',
        step4: 'وصف الحالة والأهداف بالتفصيل',
        step5: 'طلب جلسة استشارية متخصصة',
        step6: 'الحصول على تقرير توصيات شامل'
    },

    // ═══ الخوارزميات والحسابات المقترحة
    recommendedApproaches: {
        for_pricing_engine: [
            'BigQuery ML Linear Regression',
            'Time Series Forecasting with Prophet',
            'ARIMA models for trend analysis',
            'Real-time Pub/Sub for price updates'
        ],
        for_scaling: [
            'Cloud Load Balancing with multiple backends',
            'Auto-scaling groups with metrics',
            'CDN caching for static assets',
            'Database read replicas for scaling reads'
        ],
        for_ai_features: [
            'Vertex AI Generative AI (Gemini models)',
            'Custom fine-tuning on domain data',
            'Vector embeddings for semantic search',
            'Retrieval-Augmented Generation (RAG)'
        ],
        for_compliance: [
            'Cloud Audit Logs for all activities',
            'Data Loss Prevention (DLP) API',
            'Cloud Security Command Center',
            'Regular security assessments'
        ]
    },

    // ═══ المقاييس المتوقعة
    expectedMetrics: {
        performance: {
            pageLoadTime: '0.8-1.2 seconds',
            apiLatency: '50-100ms',
            databaseQueryTime: '10-50ms',
            imageLoadTime: '0.1-0.3s'
        },
        reliability: {
            uptime: '99.95%+',
            errorRate: '< 0.5%',
            crashRate: '0%',
            backupSuccess: '100%'
        },
        business: {
            userSatisfaction: '4.8-5.0/5',
            conversionRate: '3-5%',
            returnRate: 'TBD per business model',
            customerRetention: '85%+'
        }
    }
};

module.exports = DirectQuestionsForGoogle;
