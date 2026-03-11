/**
 * إمبراطورية شيخة - محرك المزامنة السيادية (GitHub x Google Cloud)
 * القائد: الإمبراطور الملك الحكيم الدكتور سلمان الراجح
 * المنظمة: @Sheikha-top | الاعتماد: ciscc2250603061
 */

const sheikhaCloud = require('./google-cloud-connection');

const SheikhaSovereignGit = {
    org: 'Sheikha-top',
    auth2fa: 'Enabled_Sovereign_Shield',
    hosting: 'Google_Cloud_Enterprise',
    license: 'ciscc2250603061',

    async syncRepositories() {
        console.log('🚀 بسم الله.. مزامنة أكواد شيخة مع الحصن الرقمي في GitHub.');

        const githubToken = process.env.GITHUB_TOKEN;
        const headers = {
            'Accept': 'application/vnd.github+json',
            'User-Agent': 'sheikha-sovereign-git-engine'
        };

        if (githubToken) {
            headers.Authorization = `Bearer ${githubToken}`;
        }

        const orgResponse = await fetch(`https://api.github.com/orgs/${this.org}`, { headers });

        if (!orgResponse.ok) {
            const errorText = await orgResponse.text();
            throw new Error(`فشل الاتصال بـ GitHub Org (${orgResponse.status}): ${errorText}`);
        }

        const orgInfo = await orgResponse.json();

        const reposResponse = await fetch(`https://api.github.com/orgs/${this.org}/repos?per_page=100`, { headers });
        if (!reposResponse.ok) {
            const errorText = await reposResponse.text();
            throw new Error(`فشل جلب المستودعات (${reposResponse.status}): ${errorText}`);
        }

        const repos = await reposResponse.json();

        let cloudStatus = { connected: false, note: 'Google Cloud not initialized' };
        if (sheikhaCloud.init()) {
            const checks = await sheikhaCloud.checkAllConnections();
            const anyConnected = Object.values(checks.connections || {}).some((conn) => conn?.success);
            cloudStatus = {
                connected: anyConnected,
                note: anyConnected ? 'Google Cloud connectivity verified' : 'Google Cloud connectivity failed',
                connections: checks.connections
            };
        }

        const summary = {
            success: true,
            timestamp: new Date().toISOString(),
            organization: {
                login: orgInfo.login,
                name: orgInfo.name,
                reposCount: repos.length,
                twoFactorRequirement: this.auth2fa
            },
            repositories: repos.map((repo) => ({
                name: repo.name,
                private: repo.private,
                defaultBranch: repo.default_branch,
                pushedAt: repo.pushed_at
            })),
            hosting: this.hosting,
            cloud: cloudStatus
        };

        console.log(`✅ تمت المزامنة السيادية: ${summary.organization.reposCount} مستودع.`);
        return summary;
    },

    commitWithSeal(message) {
        console.log('🛡️ الملك يوجه: تعميد التغييرات بختم جودة شيخة والصدق والأمانة.');
        return {
            commitMessage: message,
            seal: `Signed_By_Salman_AlRajih_${this.license}`,
            timestamp: new Date().toISOString()
        };
    }
};

module.exports = SheikhaSovereignGit;

if (require.main === module) {
    (async () => {
        try {
            const syncResult = await SheikhaSovereignGit.syncRepositories();
            const sealResult = SheikhaSovereignGit.commitWithSeal('إطلاق نواة Sheikha OS');
            console.log(JSON.stringify({ syncResult, sealResult }, null, 2));
        } catch (error) {
            console.error('❌ خطأ في محرك المزامنة السيادية:', error.message);
            process.exit(1);
        }
    })();
}
