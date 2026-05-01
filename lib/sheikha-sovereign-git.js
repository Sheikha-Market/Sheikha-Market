/**
 * إمبراطورية شيخة - محرك المزامنة السيادية (GitHub x Google Cloud)
 * القائد: الإمبراطور الملك الحكيم الدكتور سلمان الراجح
 * المنظمة: @Sheikha-top | الاعتماد: ciscc2250603061
 */

const sheikhaCloud = require('./google-cloud-connection');

/**
 * Fetch a GitHub API URL with automatic rate-limit–aware retry.
 * Retries up to maxRetries times using exponential backoff when the server
 * returns 403 (rate-limited) or 429 (too many requests).  On other non-OK
 * responses it throws immediately.
 */
async function githubFetchWithRetry(url, options = {}, maxRetries = 3) {
    let attempt = 0;
    while (true) {
        const response = await fetch(url, options);

        const remaining = Number(response.headers.get('x-ratelimit-remaining') || NaN);
        const resetAt = Number(response.headers.get('x-ratelimit-reset') || NaN);

        if (response.ok) {
            if (!Number.isNaN(remaining) && remaining < 10) {
                console.warn(
                    `⚠️ [SovereignGit] GitHub API rate limit low: ${remaining} remaining.`
                );
            }
            return response;
        }

        const isRateLimited = response.status === 403 || response.status === 429;

        if (!isRateLimited || attempt >= maxRetries) {
            const errorText = await response.text();
            throw new Error(`GitHub API error (${response.status}): ${errorText}`);
        }

        // Compute wait time: honour Retry-After / x-ratelimit-reset when present.
        let waitMs;
        const retryAfter = Number(response.headers.get('retry-after') || NaN);
        if (!Number.isNaN(retryAfter) && retryAfter > 0) {
            waitMs = retryAfter * 1000;
        } else if (!Number.isNaN(resetAt) && resetAt > 0) {
            waitMs = Math.max(0, (resetAt * 1000) - Date.now()) + 1000;
        } else {
            waitMs = Math.min(60000, 1000 * 2 ** attempt);
        }

        attempt += 1;
        console.warn(
            `⏳ [SovereignGit] Rate limited (${response.status}). Retrying in ${Math.round(waitMs / 1000)}s (attempt ${attempt}/${maxRetries}).`
        );
        await new Promise(resolve => setTimeout(resolve, waitMs));
    }
}

const SheikhaSovereignGit = {
    org: 'Sheikha-top',
    auth2fa: 'Enabled_Sovereign_Shield',
    hosting: 'Google_Cloud_Enterprise',
    license: 'ciscc2250603061',

    async syncRepositories() {
        console.log('🚀 بسم الله.. مزامنة أكواد شيخة مع الحصن الرقمي في GitHub.');

        const githubToken = process.env.GITHUB_TOKEN;
        const headers = {
            Accept: 'application/vnd.github+json',
            'User-Agent': 'sheikha-sovereign-git-engine'
        };

        if (githubToken) {
            headers.Authorization = `Bearer ${githubToken}`;
        }

        const orgResponse = await githubFetchWithRetry(
            `https://api.github.com/orgs/${this.org}`,
            { headers }
        );

        const orgInfo = await orgResponse.json();

        const reposResponse = await githubFetchWithRetry(
            `https://api.github.com/orgs/${this.org}/repos?per_page=100`,
            { headers }
        );

        const repos = await reposResponse.json();

        let cloudStatus = { connected: false, note: 'Google Cloud not initialized' };
        if (sheikhaCloud.init()) {
            const checks = await sheikhaCloud.checkAllConnections();
            const anyConnected = Object.values(checks.connections || {}).some(
                conn => conn?.success
            );
            cloudStatus = {
                connected: anyConnected,
                note: anyConnected
                    ? 'Google Cloud connectivity verified'
                    : 'Google Cloud connectivity failed',
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
            repositories: repos.map(repo => ({
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
