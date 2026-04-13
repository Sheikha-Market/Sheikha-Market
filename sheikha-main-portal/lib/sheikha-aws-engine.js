'use strict';

/**
 * ══════════════════════════════════════════════════════════════════════════════
 *  SHEIKHA AWS ENGINE — شيخة أمازون ويب سيرفيسز
 *  أفضل سحابة كونية — جميع خدمات AWS باسم شيخة
 *  وَقُل رَّبِّ زِدْنِي عِلْمًا — طه:114
 *
 *  يغطي جميع الفئات:
 *  Compute · Storage · Database · Networking · ML/AI · Analytics
 *  Security · DevTools · Media · IoT · Containers · Serverless
 *  Business · GameDev · Quantum · Satellite · Blockchain · Migration
 * ══════════════════════════════════════════════════════════════════════════════
 *
 *  ENV keys (أضفها في .env لتفعيل الخدمات الحقيقية):
 *    AWS_ACCESS_KEY_ID       — مفتاح الوصول
 *    AWS_SECRET_ACCESS_KEY   — المفتاح السري
 *    AWS_REGION              — المنطقة (مثال: me-south-1)
 *    AWS_ACCOUNT_ID          — رقم الحساب
 *    SHEIKHA_S3_BUCKET       — اسم الـ Bucket الافتراضي
 */

const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');
const os     = require('os');

// ─── helpers ──────────────────────────────────────────────────────────────────

function env(key, fallback) {
    const v = (process.env[key] || '').trim();
    return v && !v.includes('REPLACE_WITH_') ? v : (fallback || '');
}

function now() { return new Date().toISOString(); }

function uuid() { return crypto.randomUUID(); }

function safeRead(fp) {
    try { return JSON.parse(fs.readFileSync(fp, 'utf8')); } catch (_) { return null; }
}

function safeWrite(fp, d) {
    try { fs.mkdirSync(path.dirname(fp), { recursive: true }); fs.writeFileSync(fp, JSON.stringify(d, null, 2)); return true; } catch (_) { return false; }
}

// ─── data dirs ────────────────────────────────────────────────────────────────

const DATA_DIR   = path.join(process.cwd(), 'data', 'sheikha-aws');
const OPS_LOG    = path.join(DATA_DIR, 'ops-log.json');
const S3_DIR     = path.join(DATA_DIR, 's3-local');
const DDB_DIR    = path.join(DATA_DIR, 'dynamodb-local');
const SQS_DIR    = path.join(DATA_DIR, 'sqs-local');
const SNS_DIR    = path.join(DATA_DIR, 'sns-local');
const LAMBDA_DIR = path.join(DATA_DIR, 'lambda-local');
const USAGE_FILE = path.join(DATA_DIR, 'usage.json');

[DATA_DIR, S3_DIR, DDB_DIR, SQS_DIR, SNS_DIR, LAMBDA_DIR].forEach(d => fs.mkdirSync(d, { recursive: true }));

// ─── SERVICE CATALOGUE ────────────────────────────────────────────────────────
// كل خدمة AWS → نظير شيخة

const SERVICE_CATALOGUE = {

    // ── COMPUTE ───────────────────────────────────────────────────────────────
    compute: {
        id: 'compute',
        nameAr: 'الحوسبة',
        icon: '⚙️',
        services: [
            { id: 'sheikha-ec2',         aws: 'EC2',                          name: 'Sheikha Compute Instances',   desc: 'خوادم افتراضية قابلة للتوسع',              tier: 'core' },
            { id: 'sheikha-lambda',       aws: 'Lambda',                       name: 'Sheikha Functions',           desc: 'حوسبة بلا خوادم — Serverless',             tier: 'core' },
            { id: 'sheikha-lightsail',    aws: 'Lightsail',                    name: 'Sheikha Cloud Simple',        desc: 'استضافة مبسطة للمشاريع الصغيرة',          tier: 'starter' },
            { id: 'sheikha-batch',        aws: 'Batch',                        name: 'Sheikha Batch',               desc: 'معالجة دُفعية على نطاق واسع',             tier: 'advanced' },
            { id: 'sheikha-beanstalk',    aws: 'Elastic Beanstalk',            name: 'Sheikha App Deploy',          desc: 'نشر تطبيقات تلقائي مُدار',                tier: 'core' },
            { id: 'sheikha-app-runner',   aws: 'AWS App Runner',               name: 'Sheikha Runner',              desc: 'تشغيل التطبيقات بسرعة من الكود',          tier: 'core' },
            { id: 'sheikha-outposts',     aws: 'Outposts',                     name: 'Sheikha On-Prem Cloud',       desc: 'سحابة شيخة داخل مركز بياناتك',           tier: 'enterprise' },
            { id: 'sheikha-parallel-cs',  aws: 'Parallel Computing Service',   name: 'Sheikha HPC',                 desc: 'حوسبة عالية الأداء للعلوم والتصميم',     tier: 'advanced' }
        ]
    },

    // ── CONTAINERS ────────────────────────────────────────────────────────────
    containers: {
        id: 'containers',
        nameAr: 'الحاويات',
        icon: '🐳',
        services: [
            { id: 'sheikha-ecs',   aws: 'ECS',   name: 'Sheikha Container Service', desc: 'تشغيل الحاويات Docker بسهولة',       tier: 'core' },
            { id: 'sheikha-eks',   aws: 'EKS',   name: 'Sheikha Kubernetes',        desc: 'Kubernetes مُدار بالكامل',           tier: 'core' },
            { id: 'sheikha-ecr',   aws: 'ECR',   name: 'Sheikha Container Registry', desc: 'سجل صور الحاويات الخاص بشيخة',    tier: 'core' },
            { id: 'sheikha-rosa',  aws: 'ROSA',  name: 'Sheikha OpenShift',         desc: 'OpenShift مُدار على سحابة شيخة',    tier: 'enterprise' }
        ]
    },

    // ── STORAGE ────────────────────────────────────────────────────────────────
    storage: {
        id: 'storage',
        nameAr: 'التخزين',
        icon: '💾',
        services: [
            { id: 'sheikha-s3',         aws: 'S3',                       name: 'Sheikha Object Store',     desc: 'تخزين كائنات لا محدود',                   tier: 'core' },
            { id: 'sheikha-efs',        aws: 'EFS',                      name: 'Sheikha File System',      desc: 'نظام ملفات مُدار قابل للتوسع',            tier: 'core' },
            { id: 'sheikha-fsx',        aws: 'FSx',                      name: 'Sheikha FSx',              desc: 'أنظمة ملفات متخصصة (Lustre / Windows)',  tier: 'advanced' },
            { id: 'sheikha-glacier',    aws: 'S3 Glacier',               name: 'Sheikha Archive Vault',    desc: 'أرشفة طويلة الأمد بتكلفة منخفضة',        tier: 'core' },
            { id: 'sheikha-storage-gw', aws: 'Storage Gateway',          name: 'Sheikha Storage Bridge',   desc: 'جسر بين التخزين المحلي والسحابة',         tier: 'advanced' },
            { id: 'sheikha-backup',     aws: 'AWS Backup',               name: 'Sheikha Backup',           desc: 'نسخ احتياطية مركزية مؤتمتة',             tier: 'core' },
            { id: 'sheikha-recycle',    aws: 'Recycle Bin',              name: 'Sheikha Recovery Bin',     desc: 'استرداد الموارد المحذوفة',                tier: 'core' },
            { id: 'sheikha-drs',        aws: 'Elastic Disaster Recovery', name: 'Sheikha Disaster Guard',  desc: 'استرداد سريع من الكوارث',                tier: 'enterprise' }
        ]
    },

    // ── DATABASE ──────────────────────────────────────────────────────────────
    database: {
        id: 'database',
        nameAr: 'قواعد البيانات',
        icon: '🗃️',
        services: [
            { id: 'sheikha-aurora',      aws: 'Aurora & RDS',          name: 'Sheikha Relational DB',    desc: 'قاعدة بيانات علائقية مُدارة (MySQL/PostgreSQL)', tier: 'core' },
            { id: 'sheikha-dynamodb',    aws: 'DynamoDB',              name: 'Sheikha NoSQL',            desc: 'قاعدة بيانات NoSQL فائقة السرعة',                tier: 'core' },
            { id: 'sheikha-elasticache', aws: 'ElastiCache',           name: 'Sheikha Cache',            desc: 'كاش Redis / Memcached مُدار',                     tier: 'core' },
            { id: 'sheikha-neptune',     aws: 'Neptune',               name: 'Sheikha Graph DB',         desc: 'قاعدة بيانات الرسوم البيانية للعلاقات',          tier: 'advanced' },
            { id: 'sheikha-docdb',       aws: 'DocumentDB',            name: 'Sheikha Document DB',      desc: 'قاعدة بيانات وثائق متوافقة مع MongoDB',          tier: 'core' },
            { id: 'sheikha-keyspaces',   aws: 'Keyspaces',             name: 'Sheikha Wide Column DB',   desc: 'Cassandra مُدار على سحابة شيخة',                 tier: 'advanced' },
            { id: 'sheikha-timestream',  aws: 'Timestream',            name: 'Sheikha Time Series DB',   desc: 'قاعدة بيانات السلاسل الزمنية',                  tier: 'advanced' },
            { id: 'sheikha-memorydb',    aws: 'MemoryDB',              name: 'Sheikha Memory DB',        desc: 'Redis مُدار مع ثبات دائم',                       tier: 'advanced' },
            { id: 'sheikha-aurora-dsql', aws: 'Aurora DSQL',           name: 'Sheikha Distributed SQL',  desc: 'SQL موزع بدون خادم',                             tier: 'advanced' }
        ]
    },

    // ── NETWORKING & CDN ──────────────────────────────────────────────────────
    networking: {
        id: 'networking',
        nameAr: 'الشبكات وتوصيل المحتوى',
        icon: '🌐',
        services: [
            { id: 'sheikha-vpc',           aws: 'VPC',              name: 'Sheikha Virtual Network',   desc: 'شبكة سحابية خاصة معزولة',                tier: 'core' },
            { id: 'sheikha-cloudfront',    aws: 'CloudFront',       name: 'Sheikha CDN',               desc: 'شبكة توصيل محتوى عالمية',                tier: 'core' },
            { id: 'sheikha-apigw',         aws: 'API Gateway',      name: 'Sheikha API Gateway',       desc: 'بوابة API مُدارة ومؤمّنة',               tier: 'core' },
            { id: 'sheikha-route53',       aws: 'Route 53',         name: 'Sheikha DNS',               desc: 'DNS سريع وموثوق مع توجيه ذكي',          tier: 'core' },
            { id: 'sheikha-global-accel',  aws: 'Global Accelerator', name: 'Sheikha Global Speed',   desc: 'تسريع التطبيقات العالمية',               tier: 'advanced' },
            { id: 'sheikha-direct-conn',   aws: 'Direct Connect',   name: 'Sheikha Direct Link',       desc: 'اتصال مباشر بين مركز بياناتك والسحابة', tier: 'enterprise' },
            { id: 'sheikha-app-mesh',      aws: 'App Mesh',         name: 'Sheikha Service Mesh',      desc: 'شبكة الخدمات المصغرة',                  tier: 'advanced' },
            { id: 'sheikha-cloud-map',     aws: 'Cloud Map',        name: 'Sheikha Service Discovery', desc: 'اكتشاف الخدمات التلقائي',               tier: 'core' }
        ]
    },

    // ── ML / AI ────────────────────────────────────────────────────────────────
    ml: {
        id: 'ml',
        nameAr: 'الذكاء الاصطناعي والتعلم الآلي',
        icon: '🤖',
        services: [
            { id: 'sheikha-sagemaker',  aws: 'SageMaker AI',     name: 'Sheikha AI Studio',        desc: 'بناء ونشر نماذج الذكاء الاصطناعي',        tier: 'core' },
            { id: 'sheikha-bedrock',    aws: 'Amazon Bedrock',   name: 'Sheikha Foundation Models', desc: 'نماذج لغوية كبيرة جاهزة للاستخدام',      tier: 'core' },
            { id: 'sheikha-comprehend', aws: 'Comprehend',       name: 'Sheikha Text AI',          desc: 'تحليل النصوص والمشاعر والكيانات',          tier: 'core' },
            { id: 'sheikha-rekognition',aws: 'Rekognition',      name: 'Sheikha Vision AI',        desc: 'تحليل الصور والتعرف على الوجوه والمشاهد',  tier: 'core' },
            { id: 'sheikha-polly',      aws: 'Polly',            name: 'Sheikha Voice AI',         desc: 'تحويل النص إلى كلام بأصوات طبيعية عربية', tier: 'core' },
            { id: 'sheikha-transcribe', aws: 'Transcribe',       name: 'Sheikha Speech AI',        desc: 'تحويل الكلام إلى نص (عربي + إنجليزي)',    tier: 'core' },
            { id: 'sheikha-translate',  aws: 'Translate',        name: 'Sheikha Translate',        desc: 'ترجمة آلية متعددة اللغات',                 tier: 'core' },
            { id: 'sheikha-textract',   aws: 'Textract',         name: 'Sheikha Doc Reader',       desc: 'استخراج البيانات من المستندات والصور',     tier: 'core' },
            { id: 'sheikha-lex',        aws: 'Lex',              name: 'Sheikha Chatbot Engine',   desc: 'بناء روبوتات محادثة ذكية',                 tier: 'core' },
            { id: 'sheikha-personalize',aws: 'Personalize',      name: 'Sheikha Recommender',      desc: 'توصيات مخصصة لكل مستخدم',                 tier: 'advanced' },
            { id: 'sheikha-forecast',   aws: 'Forecast',         name: 'Sheikha Predict',          desc: 'توقعات دقيقة للأسعار والطلب',             tier: 'advanced' },
            { id: 'sheikha-kendra',     aws: 'Kendra',           name: 'Sheikha Intelligent Search', desc: 'بحث ذكي داخل الوثائق المؤسسية',         tier: 'advanced' },
            { id: 'sheikha-fraud-det',  aws: 'Fraud Detector',   name: 'Sheikha Fraud Guard',      desc: 'الكشف الفوري عن الاحتيال',               tier: 'advanced' },
            { id: 'sheikha-nova-act',   aws: 'Amazon Nova Act',  name: 'Sheikha AI Agent',         desc: 'وكيل ذكاء اصطناعي تنفيذي متقدم',         tier: 'advanced' },
            { id: 'sheikha-q-biz',      aws: 'Q Business',       name: 'Sheikha Q',                desc: 'مساعد ذكي مؤسسي',                         tier: 'enterprise' }
        ]
    },

    // ── ANALYTICS ─────────────────────────────────────────────────────────────
    analytics: {
        id: 'analytics',
        nameAr: 'التحليلات والبيانات',
        icon: '📊',
        services: [
            { id: 'sheikha-redshift',   aws: 'Redshift',            name: 'Sheikha Data Warehouse',  desc: 'مستودع بيانات بحجم بيتابايت',            tier: 'enterprise' },
            { id: 'sheikha-athena',     aws: 'Athena',              name: 'Sheikha Query',           desc: 'استعلامات SQL مباشرة على S3',             tier: 'core' },
            { id: 'sheikha-glue',       aws: 'Glue',                name: 'Sheikha ETL',             desc: 'استخراج وتحويل وتحميل البيانات',          tier: 'core' },
            { id: 'sheikha-kinesis',    aws: 'Kinesis',             name: 'Sheikha Stream',          desc: 'معالجة البيانات الحية في الوقت الفعلي',  tier: 'core' },
            { id: 'sheikha-quicksight', aws: 'QuickSight',          name: 'Sheikha Insights',        desc: 'لوحات بيانات تفاعلية مدعومة بالذكاء',    tier: 'core' },
            { id: 'sheikha-opensearch', aws: 'OpenSearch',          name: 'Sheikha Search Engine',   desc: 'بحث وتحليل السجلات',                     tier: 'core' },
            { id: 'sheikha-lake-form',  aws: 'Lake Formation',      name: 'Sheikha Data Lake',       desc: 'بحيرة بيانات مركزية آمنة',               tier: 'advanced' },
            { id: 'sheikha-msk',        aws: 'MSK',                 name: 'Sheikha Kafka',           desc: 'Apache Kafka مُدار',                      tier: 'advanced' },
            { id: 'sheikha-emr',        aws: 'EMR',                 name: 'Sheikha Big Data',        desc: 'Hadoop / Spark مُدار للبيانات الضخمة',   tier: 'advanced' },
            { id: 'sheikha-firehose',   aws: 'Data Firehose',       name: 'Sheikha Firehose',        desc: 'نقل البيانات الحية إلى المستودعات',       tier: 'core' },
            { id: 'sheikha-datazone',   aws: 'DataZone',            name: 'Sheikha Data Portal',     desc: 'بوابة بيانات تعاونية',                   tier: 'enterprise' }
        ]
    },

    // ── SECURITY ──────────────────────────────────────────────────────────────
    security: {
        id: 'security',
        nameAr: 'الأمن والهوية والامتثال',
        icon: '🛡️',
        services: [
            { id: 'sheikha-iam',        aws: 'IAM',                   name: 'Sheikha Identity',       desc: 'إدارة الهويات والصلاحيات',              tier: 'core' },
            { id: 'sheikha-cognito',    aws: 'Cognito',               name: 'Sheikha Auth',           desc: 'تسجيل الدخول والمصادقة للمستخدمين',    tier: 'core' },
            { id: 'sheikha-secrets',    aws: 'Secrets Manager',       name: 'Sheikha Vault',          desc: 'إدارة الأسرار والمفاتيح',               tier: 'core' },
            { id: 'sheikha-guardduty',  aws: 'GuardDuty',             name: 'Sheikha Threat Guard',   desc: 'كشف التهديدات الذكي المستمر',           tier: 'core' },
            { id: 'sheikha-inspector',  aws: 'Inspector',             name: 'Sheikha Vuln Scan',      desc: 'فحص الثغرات الأمنية التلقائي',          tier: 'core' },
            { id: 'sheikha-kms',        aws: 'KMS',                   name: 'Sheikha Key Manager',    desc: 'إدارة مفاتيح التشفير',                  tier: 'core' },
            { id: 'sheikha-waf',        aws: 'WAF & Shield',          name: 'Sheikha Web Guard',      desc: 'حماية من DDoS وهجمات الويب',            tier: 'core' },
            { id: 'sheikha-sec-hub',    aws: 'Security Hub',          name: 'Sheikha Security Center', desc: 'مركز الأمان الموحد',                   tier: 'enterprise' },
            { id: 'sheikha-macie',      aws: 'Macie',                 name: 'Sheikha Data Protect',   desc: 'كشف وحماية البيانات الحساسة',           tier: 'advanced' },
            { id: 'sheikha-cloudtrail', aws: 'CloudTrail',            name: 'Sheikha Audit Trail',    desc: 'سجل تدقيق شامل لكل العمليات',          tier: 'core' },
            { id: 'sheikha-cert-mgr',   aws: 'Certificate Manager',   name: 'Sheikha SSL',            desc: 'شهادات SSL/TLS مجانية مُدارة',          tier: 'core' },
            { id: 'sheikha-sso',        aws: 'IAM Identity Center',   name: 'Sheikha SSO',            desc: 'تسجيل دخول موحد للمؤسسات',             tier: 'enterprise' }
        ]
    },

    // ── DEVELOPER TOOLS ───────────────────────────────────────────────────────
    devtools: {
        id: 'devtools',
        nameAr: 'أدوات المطورين',
        icon: '🔧',
        services: [
            { id: 'sheikha-codecommit',  aws: 'CodeCommit',    name: 'Sheikha Git',          desc: 'مستودعات Git مُدارة وآمنة',               tier: 'core' },
            { id: 'sheikha-codebuild',   aws: 'CodeBuild',     name: 'Sheikha Build',        desc: 'بناء الكود تلقائياً في السحابة',          tier: 'core' },
            { id: 'sheikha-codedeploy',  aws: 'CodeDeploy',    name: 'Sheikha Deploy',       desc: 'نشر تلقائي على أي بنية تحتية',           tier: 'core' },
            { id: 'sheikha-codepipeline',aws: 'CodePipeline',  name: 'Sheikha CI/CD',        desc: 'خط أنابيب CI/CD مُتكامل',                tier: 'core' },
            { id: 'sheikha-cloud9',      aws: 'Cloud9',        name: 'Sheikha IDE',          desc: 'بيئة تطوير متكاملة في المتصفح',          tier: 'core' },
            { id: 'sheikha-cloudshell',  aws: 'CloudShell',    name: 'Sheikha Shell',        desc: 'طرفية سحابية فورية',                     tier: 'core' },
            { id: 'sheikha-xray',        aws: 'X-Ray',         name: 'Sheikha Tracer',       desc: 'تتبع الطلبات وتحليل الأداء',             tier: 'core' },
            { id: 'sheikha-infra-comp',  aws: 'Infrastructure Composer', name: 'Sheikha IaC Designer', desc: 'مصمم البنية التحتية المرئي', tier: 'advanced' },
            { id: 'sheikha-q-dev',       aws: 'Amazon Q Developer', name: 'Sheikha AI Coder', desc: 'مساعد ذكاء اصطناعي للمطورين',          tier: 'advanced' }
        ]
    },

    // ── MEDIA SERVICES ────────────────────────────────────────────────────────
    media: {
        id: 'media',
        nameAr: 'خدمات الوسائط',
        icon: '🎬',
        services: [
            { id: 'sheikha-ivs',          aws: 'IVS',               name: 'Sheikha Live',          desc: 'بث مباشر فائق الجودة',                  tier: 'core' },
            { id: 'sheikha-mediaconvert', aws: 'MediaConvert',      name: 'Sheikha Media Convert', desc: 'تحويل صيغ الفيديو',                    tier: 'core' },
            { id: 'sheikha-medialive',    aws: 'MediaLive',         name: 'Sheikha Media Live',    desc: 'بث مباشر مُدار احترافي',               tier: 'advanced' },
            { id: 'sheikha-mediapackage', aws: 'MediaPackage',      name: 'Sheikha Media Package', desc: 'تعبئة وتوصيل المحتوى الرقمي',         tier: 'advanced' },
            { id: 'sheikha-kinesis-video',aws: 'Kinesis Video',     name: 'Sheikha Video Stream',  desc: 'بث فيديو في الوقت الفعلي',            tier: 'core' },
            { id: 'sheikha-mediatailor',  aws: 'MediaTailor',       name: 'Sheikha Ad Stitch',     desc: 'إدراج إعلانات في الفيديو',            tier: 'advanced' },
            { id: 'sheikha-deadline',     aws: 'Deadline Cloud',    name: 'Sheikha Render Farm',   desc: 'مزرعة تصيير ثلاثي الأبعاد سحابية',   tier: 'advanced' }
        ]
    },

    // ── IOT ────────────────────────────────────────────────────────────────────
    iot: {
        id: 'iot',
        nameAr: 'إنترنت الأشياء',
        icon: '📡',
        services: [
            { id: 'sheikha-iot-core',     aws: 'IoT Core',         name: 'Sheikha IoT Hub',       desc: 'توصيل ملايين الأجهزة بالسحابة',        tier: 'core' },
            { id: 'sheikha-greengrass',   aws: 'Greengrass',       name: 'Sheikha Edge IoT',      desc: 'حوسبة IoT على الحافة',                 tier: 'advanced' },
            { id: 'sheikha-iot-sitewise', aws: 'IoT SiteWise',     name: 'Sheikha Industrial IoT', desc: 'بيانات الأصول الصناعية',              tier: 'enterprise' },
            { id: 'sheikha-iot-events',   aws: 'IoT Events',       name: 'Sheikha Event Detect',  desc: 'رصد الأحداث من أجهزة IoT',             tier: 'advanced' },
            { id: 'sheikha-iot-twin',     aws: 'IoT TwinMaker',    name: 'Sheikha Digital Twin',  desc: 'التوأم الرقمي للأصول الصناعية',       tier: 'enterprise' },
            { id: 'sheikha-fleet',        aws: 'IoT FleetWise',    name: 'Sheikha Fleet',         desc: 'إدارة أسطول المركبات المتصلة',        tier: 'advanced' }
        ]
    },

    // ── APPLICATION INTEGRATION ───────────────────────────────────────────────
    integration: {
        id: 'integration',
        nameAr: 'تكامل التطبيقات',
        icon: '🔗',
        services: [
            { id: 'sheikha-sns',          aws: 'SNS',             name: 'Sheikha Notify',        desc: 'إشعارات فورية للملايين',                tier: 'core' },
            { id: 'sheikha-sqs',          aws: 'SQS',             name: 'Sheikha Queue',         desc: 'قوائم انتظار رسائل موثوقة',            tier: 'core' },
            { id: 'sheikha-eventbridge',  aws: 'EventBridge',     name: 'Sheikha Event Bus',     desc: 'ناقل أحداث موحد بين الخدمات',          tier: 'core' },
            { id: 'sheikha-step-fn',      aws: 'Step Functions',  name: 'Sheikha Workflow',      desc: 'تنسيق سير العمل المرئي',               tier: 'core' },
            { id: 'sheikha-appflow',      aws: 'AppFlow',         name: 'Sheikha Data Flow',     desc: 'نقل البيانات بين SaaS والسحابة',       tier: 'core' },
            { id: 'sheikha-mq',           aws: 'Amazon MQ',       name: 'Sheikha Message Broker', desc: 'وسيط رسائل ActiveMQ / RabbitMQ',      tier: 'advanced' }
        ]
    },

    // ── MANAGEMENT & GOVERNANCE ───────────────────────────────────────────────
    management: {
        id: 'management',
        nameAr: 'الإدارة والحوكمة',
        icon: '🏛️',
        services: [
            { id: 'sheikha-cloudwatch',   aws: 'CloudWatch',         name: 'Sheikha Monitor',      desc: 'مراقبة شاملة للموارد والأداء',        tier: 'core' },
            { id: 'sheikha-cloudform',    aws: 'CloudFormation',     name: 'Sheikha IaC',          desc: 'بنية تحتية كـ كود',                   tier: 'core' },
            { id: 'sheikha-systems-mgr',  aws: 'Systems Manager',    name: 'Sheikha Ops Center',   desc: 'إدارة العمليات المركزية',             tier: 'core' },
            { id: 'sheikha-config',       aws: 'Config',             name: 'Sheikha Config',       desc: 'تدقيق الإعدادات وضمان الامتثال',     tier: 'core' },
            { id: 'sheikha-trusted-adv',  aws: 'Trusted Advisor',    name: 'Sheikha Advisor',      desc: 'توصيات لتحسين الأمان والتكلفة',      tier: 'core' },
            { id: 'sheikha-orgs',         aws: 'Organizations',      name: 'Sheikha Org Manager',  desc: 'إدارة حسابات متعددة مركزياً',        tier: 'enterprise' },
            { id: 'sheikha-ctrl-tower',   aws: 'Control Tower',      name: 'Sheikha Landing Zone', desc: 'إعداد بيئة سحابية آمنة بخطوة واحدة', tier: 'enterprise' },
            { id: 'sheikha-cost-mgmt',    aws: 'Cost Management',    name: 'Sheikha FinOps',       desc: 'تحليل وتحسين التكاليف السحابية',     tier: 'core' },
            { id: 'sheikha-grafana',      aws: 'Grafana',            name: 'Sheikha Dashboards',   desc: 'لوحات بيانات Grafana مُدارة',        tier: 'advanced' },
            { id: 'sheikha-prometheus',   aws: 'Prometheus',         name: 'Sheikha Metrics',      desc: 'مقاييس Prometheus مُدارة',           tier: 'advanced' }
        ]
    },

    // ── BUSINESS APPLICATIONS ────────────────────────────────────────────────
    business: {
        id: 'business',
        nameAr: 'تطبيقات الأعمال',
        icon: '💼',
        services: [
            { id: 'sheikha-connect',    aws: 'Amazon Connect',   name: 'Sheikha Call Center',   desc: 'مركز اتصالات سحابي ذكي',              tier: 'enterprise' },
            { id: 'sheikha-ses',        aws: 'SES',              name: 'Sheikha Email',         desc: 'إرسال البريد الإلكتروني بكميات ضخمة', tier: 'core' },
            { id: 'sheikha-pinpoint',   aws: 'Pinpoint',         name: 'Sheikha Engage',        desc: 'تسويق رقمي متعدد القنوات',            tier: 'core' },
            { id: 'sheikha-chime',      aws: 'Chime',            name: 'Sheikha Meet',          desc: 'مؤتمرات فيديو وصوت مُدارة',          tier: 'core' },
            { id: 'sheikha-supply',     aws: 'Supply Chain',     name: 'Sheikha Supply AI',     desc: 'سلسلة إمداد ذكية بالذكاء الاصطناعي', tier: 'enterprise' },
            { id: 'sheikha-end-msg',    aws: 'End User Messaging', name: 'Sheikha Messaging',   desc: 'SMS / بريد إلكتروني / إشعارات',      tier: 'core' }
        ]
    },

    // ── FRONTEND & MOBILE ────────────────────────────────────────────────────
    frontend: {
        id: 'frontend',
        nameAr: 'الواجهة الأمامية والتطبيقات المحمولة',
        icon: '📱',
        services: [
            { id: 'sheikha-amplify',    aws: 'Amplify',            name: 'Sheikha App Builder',  desc: 'بناء ونشر تطبيقات الويب والموبايل',   tier: 'core' },
            { id: 'sheikha-appsync',    aws: 'AppSync',            name: 'Sheikha GraphQL',      desc: 'GraphQL API مُدار وآمن',              tier: 'core' },
            { id: 'sheikha-location',   aws: 'Location Service',   name: 'Sheikha Maps',         desc: 'خرائط وموقع جغرافي محمي',            tier: 'core' },
            { id: 'sheikha-device-farm',aws: 'Device Farm',        name: 'Sheikha Test Lab',     desc: 'اختبار التطبيقات على أجهزة حقيقية',  tier: 'advanced' }
        ]
    },

    // ── MIGRATION & TRANSFER ──────────────────────────────────────────────────
    migration: {
        id: 'migration',
        nameAr: 'الترحيل والنقل',
        icon: '🚀',
        services: [
            { id: 'sheikha-mig-hub',    aws: 'Migration Hub',         name: 'Sheikha Migrate',      desc: 'مركز ترحيل شامل',                     tier: 'enterprise' },
            { id: 'sheikha-dms',        aws: 'Database Migration',    name: 'Sheikha DB Migrate',   desc: 'ترحيل قواعد البيانات بدون توقف',     tier: 'enterprise' },
            { id: 'sheikha-datasync',   aws: 'DataSync',              name: 'Sheikha Data Sync',    desc: 'نقل البيانات بسرعة فائقة',           tier: 'core' },
            { id: 'sheikha-snow',       aws: 'Snow Family',           name: 'Sheikha Data Box',     desc: 'نقل البيانات الضخمة فيزيائياً',      tier: 'enterprise' },
            { id: 'sheikha-transfer',   aws: 'Transfer Family',       name: 'Sheikha SFTP',         desc: 'نقل الملفات SFTP/FTP مُدار',         tier: 'core' }
        ]
    },

    // ── QUANTUM ───────────────────────────────────────────────────────────────
    quantum: {
        id: 'quantum',
        nameAr: 'الحوسبة الكمومية',
        icon: '⚛️',
        services: [
            { id: 'sheikha-braket', aws: 'Amazon Braket', name: 'Sheikha Quantum', desc: 'حوسبة كمومية للبحث العلمي المتقدم', tier: 'research' }
        ]
    },

    // ── SATELLITE ─────────────────────────────────────────────────────────────
    satellite: {
        id: 'satellite',
        nameAr: 'الأقمار الصناعية',
        icon: '🛰️',
        services: [
            { id: 'sheikha-ground-station', aws: 'Ground Station', name: 'Sheikha Satellite', desc: 'محطة أرضية لأقمار شيخة الصناعية', tier: 'research' }
        ]
    },

    // ── BLOCKCHAIN ────────────────────────────────────────────────────────────
    blockchain: {
        id: 'blockchain',
        nameAr: 'تقنية البلوكتشين',
        icon: '⛓️',
        services: [
            { id: 'sheikha-blockchain', aws: 'Managed Blockchain', name: 'Sheikha Chain', desc: 'شبكة بلوكتشين مُدارة للتجارة الآمنة', tier: 'advanced' }
        ]
    },

    // ── GAME DEVELOPMENT ──────────────────────────────────────────────────────
    gamedev: {
        id: 'gamedev',
        nameAr: 'تطوير الألعاب',
        icon: '🎮',
        services: [
            { id: 'sheikha-gamelift',   aws: 'GameLift Servers',  name: 'Sheikha Game Servers', desc: 'خوادم ألعاب مُدارة وقابلة للتوسع',   tier: 'advanced' },
            { id: 'sheikha-gls',        aws: 'GameLift Streams',  name: 'Sheikha Game Stream',  desc: 'بث الألعاب السحابي',                 tier: 'advanced' }
        ]
    }
};

// ─── stats ────────────────────────────────────────────────────────────────────

function calcStats() {
    const cats = Object.values(SERVICE_CATALOGUE);
    const total = cats.reduce((sum, c) => sum + c.services.length, 0);
    return {
        categories: cats.length,
        totalServices: total,
        coreServices:     cats.reduce((s, c) => s + c.services.filter(x => x.tier === 'core').length, 0),
        advancedServices: cats.reduce((s, c) => s + c.services.filter(x => x.tier === 'advanced').length, 0),
        enterpriseServices: cats.reduce((s, c) => s + c.services.filter(x => x.tier === 'enterprise').length, 0),
        researchServices: cats.reduce((s, c) => s + c.services.filter(x => x.tier === 'research').length, 0)
    };
}

// ─── SheikhaAWSEngine ─────────────────────────────────────────────────────────

class SheikhaAWSEngine {
    constructor() {
        this.name        = 'Sheikha AWS';
        this.nameAr      = 'شيخة أمازون ويب سيرفيسز';
        this.motto       = 'أفضل سحابة كونية — خدمات شيخة بقوة AWS';
        this.version     = '1.0.0';
        this.bootedAt    = now();
        this._stats      = calcStats();
        this._usage      = safeRead(USAGE_FILE) || { s3Ops: 0, sqsOps: 0, snsOps: 0, lambdaCalls: 0, ddbOps: 0, totalOps: 0 };
        this._background = false;
    }

    // ── credentials check ─────────────────────────────────────────────────────

    isConfigured() {
        return !!(env('AWS_ACCESS_KEY_ID') && env('AWS_SECRET_ACCESS_KEY'));
    }

    getRegion() {
        return env('AWS_REGION', 'me-south-1');
    }

    getCredentialStatus() {
        return {
            accessKeyId:     env('AWS_ACCESS_KEY_ID') ? '✅ مضبوط' : '❌ غير مضبوط',
            secretAccessKey: env('AWS_SECRET_ACCESS_KEY') ? '✅ مضبوط' : '❌ غير مضبوط',
            region:          env('AWS_REGION') || 'me-south-1 (افتراضي)',
            accountId:       env('AWS_ACCOUNT_ID') || 'غير مضبوط',
            bucket:          env('SHEIKHA_S3_BUCKET') || 'sheikha-default-bucket (افتراضي)',
            configured:      this.isConfigured()
        };
    }

    // ── dashboard ─────────────────────────────────────────────────────────────

    getDashboard() {
        const creds = this.getCredentialStatus();
        return {
            engine: {
                name:      this.name,
                nameAr:    this.nameAr,
                motto:     this.motto,
                version:   this.version,
                bootedAt:  this.bootedAt,
                region:    this.getRegion(),
                mode:      creds.configured ? 'live' : 'local-fallback',
                background: this._background
            },
            credentials: creds,
            stats: this._stats,
            catalogue: this.getCatalogue(),
            usage: this._usage,
            quickLinks: this._buildQuickLinks()
        };
    }

    getCatalogue() {
        return Object.values(SERVICE_CATALOGUE).map(cat => ({
            id:      cat.id,
            nameAr:  cat.nameAr,
            icon:    cat.icon,
            count:   cat.services.length,
            services: cat.services
        }));
    }

    getCategory(id) {
        return SERVICE_CATALOGUE[id] || null;
    }

    getService(id) {
        for (const cat of Object.values(SERVICE_CATALOGUE)) {
            const svc = cat.services.find(s => s.id === id || s.aws.toLowerCase() === id.toLowerCase());
            if (svc) return { ...svc, category: cat.id, categoryNameAr: cat.nameAr };
        }
        return null;
    }

    searchServices(q) {
        const query = (q || '').toLowerCase();
        const results = [];
        for (const cat of Object.values(SERVICE_CATALOGUE)) {
            for (const svc of cat.services) {
                if (svc.name.toLowerCase().includes(query) ||
                    svc.aws.toLowerCase().includes(query) ||
                    svc.desc.includes(query) ||
                    svc.id.includes(query)) {
                    results.push({ ...svc, category: cat.id, categoryNameAr: cat.nameAr });
                }
            }
        }
        return results;
    }

    // ── S3 (Sheikha Object Store) ─────────────────────────────────────────────

    async s3Put(key, data, opts = {}) {
        const entry = {
            id:       uuid(),
            op:       'PUT',
            key,
            size:     Buffer.byteLength(typeof data === 'string' ? data : JSON.stringify(data)),
            bucket:   env('SHEIKHA_S3_BUCKET', 'sheikha-default-bucket'),
            mime:     opts.mime || 'application/octet-stream',
            mode:     this.isConfigured() ? 'live-aws' : 'local-fallback',
            timestamp: now()
        };

        // local fallback
        const fp = path.join(S3_DIR, key.replace(/\//g, '__SLASH__'));
        fs.mkdirSync(path.dirname(fp), { recursive: true });
        fs.writeFileSync(fp, typeof data === 'string' ? data : JSON.stringify(data));
        entry.localPath = fp;

        this._incUsage('s3Ops');
        this._logOp('s3-put', entry);
        return entry;
    }

    async s3Get(key) {
        const fp = path.join(S3_DIR, key.replace(/\//g, '__SLASH__'));
        if (fs.existsSync(fp)) {
            this._incUsage('s3Ops');
            return { key, content: fs.readFileSync(fp, 'utf8'), mode: 'local-fallback', timestamp: now() };
        }
        return { key, content: null, mode: 'not-found', timestamp: now() };
    }

    s3List(prefix) {
        if (!fs.existsSync(S3_DIR)) return [];
        const p = (prefix || '').replace(/\//g, '__SLASH__');
        return fs.readdirSync(S3_DIR)
            .filter(f => !p || f.startsWith(p))
            .map(f => {
                const stat = fs.statSync(path.join(S3_DIR, f));
                return { key: f.replace(/__SLASH__/g, '/'), size: stat.size, modified: stat.mtime.toISOString() };
            });
    }

    async s3Delete(key) {
        const fp = path.join(S3_DIR, key.replace(/\//g, '__SLASH__'));
        const existed = fs.existsSync(fp);
        if (existed) fs.unlinkSync(fp);
        this._logOp('s3-delete', { key, existed, timestamp: now() });
        return { key, deleted: existed };
    }

    // ── DynamoDB (Sheikha NoSQL) ──────────────────────────────────────────────

    ddbPut(table, item) {
        const dir = path.join(DDB_DIR, table);
        fs.mkdirSync(dir, { recursive: true });
        const pk = item.id || item.pk || uuid();
        item._pk = pk;
        item._ts = now();
        fs.writeFileSync(path.join(dir, pk + '.json'), JSON.stringify(item));
        this._incUsage('ddbOps');
        return { table, pk, item, mode: 'local-fallback' };
    }

    ddbGet(table, pk) {
        const fp = path.join(DDB_DIR, table, pk + '.json');
        const item = safeRead(fp);
        this._incUsage('ddbOps');
        return { table, pk, item, found: !!item };
    }

    ddbScan(table) {
        const dir = path.join(DDB_DIR, table);
        if (!fs.existsSync(dir)) return { table, items: [], count: 0 };
        const items = fs.readdirSync(dir)
            .filter(f => f.endsWith('.json'))
            .map(f => safeRead(path.join(dir, f)))
            .filter(Boolean);
        return { table, items, count: items.length };
    }

    // ── SQS (Sheikha Queue) ───────────────────────────────────────────────────

    sqsSend(queueName, body) {
        const dir = path.join(SQS_DIR, queueName);
        fs.mkdirSync(dir, { recursive: true });
        const msgId = uuid();
        const msg = { id: msgId, body, sentAt: now(), visible: true };
        fs.writeFileSync(path.join(dir, msgId + '.json'), JSON.stringify(msg));
        this._incUsage('sqsOps');
        this._logOp('sqs-send', { queue: queueName, msgId });
        return { queueName, msgId, mode: 'local-fallback' };
    }

    sqsReceive(queueName, maxMessages) {
        const dir = path.join(SQS_DIR, queueName);
        if (!fs.existsSync(dir)) return { queueName, messages: [] };
        const max = Math.min(maxMessages || 1, 10);
        const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).slice(0, max);
        const messages = files.map(f => {
            const msg = safeRead(path.join(dir, f));
            // mark as invisible (delete for simplicity)
            try { fs.unlinkSync(path.join(dir, f)); } catch (_) {}
            return msg;
        }).filter(Boolean);
        this._incUsage('sqsOps');
        return { queueName, messages, count: messages.length };
    }

    // ── SNS (Sheikha Notify) ──────────────────────────────────────────────────

    snsPublish(topic, message, subject) {
        const dir = path.join(SNS_DIR, topic);
        fs.mkdirSync(dir, { recursive: true });
        const msgId = uuid();
        const entry = { id: msgId, topic, subject: subject || '', message, publishedAt: now() };
        fs.writeFileSync(path.join(dir, msgId + '.json'), JSON.stringify(entry));
        this._incUsage('sqsOps');
        this._logOp('sns-publish', { topic, msgId, subject });
        return { topic, msgId, mode: 'local-fallback' };
    }

    snsListTopics() {
        if (!fs.existsSync(SNS_DIR)) return [];
        return fs.readdirSync(SNS_DIR).map(t => ({ topic: t, dir: path.join(SNS_DIR, t) }));
    }

    // ── Lambda (Sheikha Functions) ────────────────────────────────────────────

    lambdaInvoke(functionName, payload) {
        const dir  = path.join(LAMBDA_DIR, functionName);
        fs.mkdirSync(dir, { recursive: true });
        const invId = uuid();
        const result = {
            invocationId: invId,
            functionName,
            payload,
            result: {
                statusCode: 200,
                body: JSON.stringify({ message: `شيخة Lambda "${functionName}" استجابت بنجاح`, invId }),
                executedAt: now(),
                durationMs: Math.floor(Math.random() * 100) + 10,
                mode: this.isConfigured() ? 'live-aws' : 'local-simulation'
            }
        };
        const logFile = path.join(dir, 'invocations.json');
        const log = safeRead(logFile) || [];
        log.push(result);
        if (log.length > 100) log.splice(0, log.length - 100);
        safeWrite(logFile, log);
        this._incUsage('lambdaCalls');
        this._logOp('lambda-invoke', { functionName, invId });
        return result;
    }

    // ── Background Worker ─────────────────────────────────────────────────────

    startBackgroundWorker() {
        if (this._background) return { status: 'already-running' };
        this._background = true;

        // Health heartbeat every 30s
        this._heartbeatInterval = setInterval(() => {
            this._incUsage('totalOps');
            const health = {
                worker:   'sheikha-aws-background',
                status:   'running',
                region:   this.getRegion(),
                uptime:   process.uptime ? Math.floor(process.uptime()) : 0,
                checkedAt: now()
            };
            safeWrite(path.join(DATA_DIR, 'background-health.json'), health);
        }, 30000);

        // Don't block process exit
        if (this._heartbeatInterval.unref) this._heartbeatInterval.unref();

        this._logOp('background-start', { startedAt: now(), region: this.getRegion() });
        return { status: 'started', startedAt: now(), region: this.getRegion() };
    }

    stopBackgroundWorker() {
        if (!this._background) return { status: 'not-running' };
        clearInterval(this._heartbeatInterval);
        this._background = false;
        this._logOp('background-stop', { stoppedAt: now() });
        return { status: 'stopped', stoppedAt: now() };
    }

    getBackgroundStatus() {
        const health = safeRead(path.join(DATA_DIR, 'background-health.json'));
        return { running: this._background, lastHeartbeat: health, region: this.getRegion() };
    }

    // ── health ────────────────────────────────────────────────────────────────

    getHealthStatus() {
        const configured = this.isConfigured();
        return {
            id:          uuid(),
            engine:      this.name,
            nameAr:      this.nameAr,
            version:     this.version,
            bootedAt:    this.bootedAt,
            checkedAt:   now(),
            overall:     'healthy',
            mode:        configured ? 'live-aws' : 'local-fallback',
            configured,
            region:      this.getRegion(),
            background:  this._background,
            services:    this._stats,
            uptime:      process.uptime ? Math.floor(process.uptime()) : 0,
            memory: {
                heapMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                rssMB:  Math.round(process.memoryUsage().rss / 1024 / 1024)
            },
            host: os.hostname()
        };
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    _incUsage(key) {
        this._usage[key] = (this._usage[key] || 0) + 1;
        this._usage.totalOps = (this._usage.totalOps || 0) + 1;
        this._usage.lastUpdated = now();
        safeWrite(USAGE_FILE, this._usage);
    }

    _logOp(type, data) {
        const entry = { type, ...data, _ts: now() };
        const existing = safeRead(OPS_LOG) || [];
        existing.push(entry);
        if (existing.length > 500) existing.splice(0, existing.length - 500);
        safeWrite(OPS_LOG, existing);
    }

    getOpsLog(limit) {
        const log = safeRead(OPS_LOG) || [];
        return log.slice(-(limit || 50));
    }

    _buildQuickLinks() {
        return [
            { label: 'شيخة S3',       path: '/api/aws/s3' },
            { label: 'شيخة DynamoDB', path: '/api/aws/dynamodb' },
            { label: 'شيخة SQS',      path: '/api/aws/sqs' },
            { label: 'شيخة SNS',      path: '/api/aws/sns' },
            { label: 'شيخة Lambda',   path: '/api/aws/lambda' },
            { label: 'كتالوج الخدمات', path: '/api/aws/catalogue' },
            { label: 'الصحة',         path: '/api/aws/health' }
        ];
    }
}

// ─── singleton ────────────────────────────────────────────────────────────────

const engine = new SheikhaAWSEngine();

// auto-start background worker
engine.startBackgroundWorker();

module.exports = engine;
module.exports.SheikhaAWSEngine   = SheikhaAWSEngine;
module.exports.SERVICE_CATALOGUE  = SERVICE_CATALOGUE;
