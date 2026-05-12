const fs = require('fs');
const path = require('path');

const projectRoot = __dirname;

const SheikhaSupremeMaster = {
    identity: {
        founder: 'Salman Ahmed Salman Abdulaziz Alrajeh',
        title: 'Sheikha Main Portal Control Audit',
        location: 'Al-Bahr, Khobar, Saudi Arabia',
        contact: {
            website: 'https://sheikha.top',
            email: 'market@sheikha.top',
            phone: '+966554942904'
        }
    },

    governance: {
        standard: 'Al-Qawi Al-Amin',
        encoding: 'UTF-8 Strict (Arabic-First)',
        security: 'No Harm, No Malice'
    },

    runtimeFiles: {
        vercelConfig: 'vercel.json',
        server: 'server.js',
        fusionApp: 'sheikha-v4.js'
    },

    criticalRoutes: [
        '/api/health',
        '/api/sheikha/system/intelligent-fusion',
        '/api/sheikha/system/intelligent-fusion/kpi',
        '/api/sheikha/system/mhs-erp',
        '/api/mhs/core',
        '/intelligent-fusion-system',
        '/intelligent-fusion-cockpit',
        '/mhs-vision'
    ],

    readText(relativePath) {
        return fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
    },

    fileExists(relativePath) {
        return fs.existsSync(path.join(projectRoot, relativePath));
    },

    detectVercelMode() {
        if (!this.fileExists(this.runtimeFiles.vercelConfig)) {
            return {
                status: 'missing',
                detail: 'ملف vercel.json غير موجود.'
            };
        }

        try {
            const config = JSON.parse(this.readText(this.runtimeFiles.vercelConfig));
            const usesCatchAllServerRoute = Array.isArray(config.routes)
                && config.routes.some((route) => route.src === '/(.*)' && route.dest === '/server.js');
            const usesRewriteOnlyRoot = Array.isArray(config.rewrites)
                && config.rewrites.some((route) => route.source === '/(.*)' && route.destination === '/');

            if (usesCatchAllServerRoute) {
                return {
                    status: 'safe',
                    detail: 'التوجيه يمر بالكامل عبر server.js، وهذا يحافظ على API والصفحات الديناميكية.'
                };
            }

            if (usesRewriteOnlyRoot) {
                return {
                    status: 'unsafe',
                    detail: 'يوجد rewrite شامل إلى الجذر فقط، وهذا يعطّل مسارات API والصفحات الديناميكية.'
                };
            }

            return {
                status: 'custom',
                detail: 'يوجد إعداد مخصص يحتاج مراجعة يدوية.'
            };
        } catch (error) {
            return {
                status: 'invalid',
                detail: `تعذر تحليل vercel.json: ${error.message}`
            };
        }
    },

    inspectRoutes(relativePath) {
        if (!this.fileExists(relativePath)) {
            return this.criticalRoutes.map((route) => ({
                route,
                exists: false
            }));
        }

        const content = this.readText(relativePath);
        return this.criticalRoutes.map((route) => ({
            route,
            exists: content.includes(`'${route}'`) || content.includes(`\"${route}\"`)
        }));
    },

    buildAudit() {
        const vercel = this.detectVercelMode();
        const serverRoutes = this.inspectRoutes(this.runtimeFiles.server);
        const fusionRoutes = this.inspectRoutes(this.runtimeFiles.fusionApp);

        return {
            identity: this.identity,
            governance: this.governance,
            vercel,
            routes: this.criticalRoutes.map((route) => ({
                route,
                server: serverRoutes.find((item) => item.route === route)?.exists || false,
                fusion: fusionRoutes.find((item) => item.route === route)?.exists || false
            })),
            apiDirectoryPresent: this.fileExists('api')
        };
    },

    printAudit(audit) {
        console.log('====================================================');
        console.log('بسم الله الرحمن الرحيم');
        console.log('تقرير التدقيق التشغيلي لمنظومة شيخة');
        console.log('====================================================');
        console.log(`المؤسس: ${audit.identity.founder}`);
        console.log(`التواصل: ${audit.identity.contact.email} | ${audit.identity.contact.website}`);
        console.log(`Vercel: ${audit.vercel.status} — ${audit.vercel.detail}`);
        console.log(`دليل API مستقل: ${audit.apiDirectoryPresent ? 'موجود' : 'غير موجود'}`);
        console.log('----------------------------------------------------');
        audit.routes.forEach((item) => {
            const status = item.server || item.fusion ? 'جاهز' : 'مفقود';
            console.log(`${status}: ${item.route} | server.js=${item.server ? 'نعم' : 'لا'} | sheikha-v4.js=${item.fusion ? 'نعم' : 'لا'}`);
        });
        console.log('----------------------------------------------------');
        console.log('النتيجة: التفعيل الأفضل هو إبقاء المسارات داخل الخادم الحالي مع فحص الإعدادات بدل إنشاء طبقة مكررة.');
        console.log('====================================================');
    },

    ignite() {
        const audit = this.buildAudit();
        this.printAudit(audit);
        return audit;
    }
};

module.exports = SheikhaSupremeMaster;

if (require.main === module) {
    SheikhaSupremeMaster.ignite();
}
