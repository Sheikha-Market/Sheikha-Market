'use strict';

const JDK_GOVERNANCE = {
    tawheed: true,
    basis: 'quran-and-sunnah',
    humanAuthority: true,
    privacyByDefault: true,
    noUntrustedBinaries: true,
    checksumRequired: true,
    signatureVerificationRequired: true,
    noDestructiveInstallWithoutApproval: true,
    auditRequiredForRelease: true,
    safeguards: [
        'verify-vendor-source',
        'verify-checksum-and-signature',
        'prefer-lts-for-enterprise',
        'separate-build-runtime-debug-scopes',
        'human-review-before-install-or-upgrade',
        'no-secrets-in-build-logs'
    ]
};

const JDK_COMPONENTS = [
    {
        id: 'javac',
        name: 'Java Compiler',
        nameAr: 'المترجم javac',
        function: 'تحويل ملفات .java إلى bytecode بصيغة .class.',
        runtimeRole: 'build'
    },
    {
        id: 'jre',
        name: 'Java Runtime Environment',
        nameAr: 'بيئة التشغيل JRE',
        function: 'توفير مكتبات التشغيل الأساسية لتطبيقات Java بعد البناء.',
        runtimeRole: 'run'
    },
    {
        id: 'jvm',
        name: 'Java Virtual Machine',
        nameAr: 'الآلة الافتراضية JVM',
        function: 'تنفيذ bytecode على Linux وWindows وmacOS دون إعادة كتابة التطبيق.',
        runtimeRole: 'execute'
    },
    {
        id: 'jdb',
        name: 'Java Debugger',
        nameAr: 'المصحح jdb',
        function: 'تحليل الأخطاء البرمجية وإصلاحها ضمن بيئة مراجعة آمنة.',
        runtimeRole: 'debug'
    },
    {
        id: 'javadoc',
        name: 'Javadoc',
        nameAr: 'توثيق Javadoc',
        function: 'إنتاج توثيق قابل للمراجعة من التعليقات البرمجية.',
        runtimeRole: 'document'
    },
    {
        id: 'keytool-jarsigner',
        name: 'Keytool and Jarsigner',
        nameAr: 'أدوات التوقيع والثقة',
        function: 'إدارة المفاتيح وتوقيع حزم JAR مع منع نشر أسرار أو مفاتيح.',
        runtimeRole: 'security'
    }
];

const ENTERPRISE_USE_CASES = [
    'enterprise-applications',
    'banking-and-financial-systems',
    'erp-platforms',
    'cloud-and-containers',
    'openshift-microservices',
    'big-data-hadoop-spark',
    'web-servers-tomcat-jboss',
    'multi-platform-development'
];

const SUPPORTED_PLATFORMS = [
    {
        id: 'linux',
        systems: ['RHEL', 'Fedora', 'SUSE', 'Ubuntu', 'Debian', 'Pop!_OS'],
        packages: ['rpm', 'deb', 'tar.gz', 'container-image', 'cli']
    },
    {
        id: 'windows',
        systems: ['Windows 10', 'Windows 11', 'Windows 12-compatible policy'],
        packages: ['msi', 'zip', 'user-installer', 'system-installer', 'cli']
    },
    {
        id: 'macos',
        systems: ['macOS 12+'],
        packages: ['dmg', 'pkg', 'tar.gz', 'cli']
    },
    {
        id: 'containers',
        systems: ['OpenShift', 'Kubernetes', 'Docker', 'Hybrid Cloud'],
        packages: ['ubi', 'distroless-compatible-runtime', 'container-image']
    }
];

const DISTRIBUTION_CHANNELS = [
    'rpm-and-archive-files',
    'deb-and-archive-files',
    'windows-msi-installers',
    'macos-dmg-or-pkg',
    'container-images-ubi',
    'cli-managed-installation'
];

const UPDATE_POLICY = {
    cadence: 'quarterly-security-and-bugfix-review',
    windows: ['January', 'April', 'July', 'October'],
    lts: 'prefer-long-term-support-releases-for-enterprise',
    action: 'no-production-upgrade-without-backup-tests-and-human-approval'
};

function detectPlatform(input = {}) {
    const platform = input.platform || process.platform;
    if (/win/i.test(platform)) return 'windows';
    if (/darwin|mac/i.test(platform)) return 'macos';
    return 'linux';
}

function getJdkRootNeuralStatus(input = {}) {
    const platform = detectPlatform(input);
    const platformProfile = SUPPORTED_PLATFORMS.find(item => item.id === platform) || SUPPORTED_PLATFORMS[0];

    return {
        success: true,
        status: 'active',
        name: 'Sheikha JDK Root Neural Cell',
        nameAr: 'خلية JDK الجذرية المحكومة',
        mode: 'governed-enterprise-java-runtime',
        language: 'java',
        components: JDK_COMPONENTS,
        enterpriseUseCases: ENTERPRISE_USE_CASES,
        distributionChannels: DISTRIBUTION_CHANNELS,
        platform: platformProfile,
        updatePolicy: UPDATE_POLICY,
        governance: JDK_GOVERNANCE,
        rootNeuralCells: [
            'creed',
            'programming',
            'jdkRuntime',
            'security',
            'readWritePublish',
            'gitRuntime',
            'continuousLearning'
        ],
        decision: 'approved_for_governed_planning',
        message: 'JDK مفعلة كخلية جذرية للتخطيط والبناء والتشغيل والتصحيح والنشر الآمن.',
        timestamp: new Date().toISOString()
    };
}

function buildJdkEnterprisePlan(input = {}) {
    const status = getJdkRootNeuralStatus(input);
    const target = input.target || input.platform || status.platform.id;
    const applicationType = input.applicationType || 'enterprise-java-application';

    return {
        success: true,
        status: 'requires_review',
        name: 'Sheikha JDK Enterprise Plan',
        target,
        applicationType,
        runtime: status,
        plan: [
            'تحديد إصدار JDK المطلوب ويفضل LTS للمؤسسات.',
            'اختيار قناة التوزيع المناسبة: rpm/deb/msi/dmg/tar.gz/container/cli.',
            'التحقق من المصدر الرسمي والتوقيع وchecksum قبل التثبيت.',
            'فصل بيئة البناء javac عن بيئة التشغيل JRE/JVM عند النشر.',
            'تفعيل jdb وlogs في بيئة التطوير فقط.',
            'تشغيل اختبارات البناء والأمان قبل أي نشر.',
            'حفظ سجل audit لكل ترقية أو نشر.',
            'اعتماد بشري صريح قبل تغيير إنتاجي أو ترقية حساسة.'
        ],
        enterpriseScopes: {
            banking: 'security-first-lts-only',
            erp: 'stable-runtime-with-change-window',
            cloud: 'container-image-with-minimal-runtime',
            bigData: 'hadoop-spark-compatible-runtime',
            webServers: 'tomcat-jboss-runtime-profile',
            crossPlatform: 'single-codebase-multi-os-validation'
        },
        gates: [
            { id: 'source', label: 'مصدر JDK موثوق', ok: Boolean(input.sourceVerified) },
            { id: 'checksum', label: 'تم فحص checksum أو التوقيع', ok: Boolean(input.checksumVerified || input.signatureVerified) },
            { id: 'lts', label: 'إصدار LTS أو مبرر مؤسسي', ok: input.lts !== false },
            { id: 'tests', label: 'اختبارات البناء والتشغيل مطلوبة', ok: Boolean(input.testsPassed) },
            { id: 'approval', label: 'موافقة بشرية قبل النشر', ok: Boolean(input.humanApproved) }
        ],
        decision: input.humanApproved && input.testsPassed && (input.checksumVerified || input.signatureVerified)
            ? 'approved_for_controlled_execution'
            : 'hold_for_human_review',
        timestamp: new Date().toISOString()
    };
}

function evaluateJdkEnvironment(input = {}) {
    const status = getJdkRootNeuralStatus(input);
    const javaHome = input.javaHome || process.env.JAVA_HOME || null;
    const version = input.version || input.javaVersion || null;
    const hasJavaHome = Boolean(javaHome);
    const hasVersion = Boolean(version);

    return {
        success: true,
        status: hasJavaHome || hasVersion ? 'detected' : 'planning-only',
        runtime: status,
        environment: {
            javaHome,
            version,
            platform: status.platform,
            note: 'هذا التقييم لا يثبت JDK ولا يحمل ملفات؛ هو فحص حوكمي وخطة تشغيل.'
        },
        checks: [
            { id: 'java-home', label: 'JAVA_HOME محدد أو معروف', ok: hasJavaHome },
            { id: 'java-version', label: 'إصدار Java معروف', ok: hasVersion },
            { id: 'governance', label: 'حوكمة الكتاب والسنة مفعلة', ok: true },
            { id: 'human-authority', label: 'قرار التثبيت أو الترقية بشري', ok: true }
        ],
        recommendation: hasJavaHome || hasVersion
            ? 'ابدأ بخطة بناء واختبار محددة قبل النشر.'
            : 'حدد إصدار JDK ومصدره الرسمي ثم نفذ فحص checksum والتوقيع قبل التثبيت.',
        timestamp: new Date().toISOString()
    };
}

module.exports = {
    JDK_GOVERNANCE,
    JDK_COMPONENTS,
    ENTERPRISE_USE_CASES,
    SUPPORTED_PLATFORMS,
    DISTRIBUTION_CHANNELS,
    UPDATE_POLICY,
    getJdkRootNeuralStatus,
    buildJdkEnterprisePlan,
    evaluateJdkEnvironment
};
