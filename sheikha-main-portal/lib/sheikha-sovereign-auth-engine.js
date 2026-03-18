const fs = require('fs');
const path = require('path');

class SheikhaSovereignAuthEngine {
    constructor() {
        this.owner = {
            fullName: 'Salman Ahmed bin Salman AlRajih',
            registry: '2051263653',
            credential: 'ciscc2250603061'
        };
        this.root = process.cwd();
        this.envPath = path.join(this.root, '.env');
        this.dataDir = path.join(this.root, 'data');
        this.reportPath = path.join(this.dataDir, 'sovereign-auth-report.json');
    }

    ensureDataDir() {
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
        }
    }

    parseEnvFile() {
        if (!fs.existsSync(this.envPath)) {
            return {};
        }

        const text = fs.readFileSync(this.envPath, 'utf8');
        const env = {};

        for (const line of text.split(/\r?\n/)) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) {
                continue;
            }

            const index = trimmed.indexOf('=');
            if (index <= 0) {
                continue;
            }

            const key = trimmed.slice(0, index).trim();
            const value = trimmed.slice(index + 1).trim();
            env[key] = value;
        }

        return env;
    }

    getValue(env, key) {
        return process.env[key] || env[key] || '';
    }

    buildAuthReadiness(env) {
        const baseUrl = this.getValue(env, 'BASE_URL');
        const oauth = {
            google: {
                clientId: this.getValue(env, 'GOOGLE_CLIENT_ID'),
                clientSecret: this.getValue(env, 'GOOGLE_CLIENT_SECRET')
            },
            microsoft: {
                clientId: this.getValue(env, 'MICROSOFT_CLIENT_ID'),
                clientSecret: this.getValue(env, 'MICROSOFT_CLIENT_SECRET')
            },
            apple: {
                clientId: this.getValue(env, 'APPLE_CLIENT_ID'),
                clientSecret: this.getValue(env, 'APPLE_CLIENT_SECRET')
            },
            nafath: {
                clientId: this.getValue(env, 'NAFATH_CLIENT_ID'),
                clientSecret: this.getValue(env, 'NAFATH_CLIENT_SECRET')
            }
        };

        const providers = Object.entries(oauth).map(([name, cfg]) => {
            const enabled = !!cfg.clientId && !!cfg.clientSecret;
            return {
                provider: name,
                enabled,
                callbackUrl: baseUrl ? `${baseUrl}/api/auth/${name}/callback` : null
            };
        });

        const core = {
            jwtSecretReady: (this.getValue(env, 'JWT_SECRET') || '').length >= 32,
            passwordSaltReady: (this.getValue(env, 'PASSWORD_SALT') || '').length >= 10,
            baseUrlReady: /^https?:\/\//.test(baseUrl)
        };

        const allCoreReady = core.jwtSecretReady && core.passwordSaltReady && core.baseUrlReady;

        return {
            core,
            providers,
            overall: {
                coreReady: allCoreReady,
                enabledProviders: providers.filter(p => p.enabled).length,
                totalProviders: providers.length,
                status: allCoreReady ? 'ready' : 'needs-configuration'
            }
        };
    }

    buildBrandingProfile(env) {
        const appName = this.getValue(env, 'APP_BRAND_NAME') || 'Sheikha Sovereign Portal';
        const supportEmail = this.getValue(env, 'AUTH_SUPPORT_EMAIL') || 'market@sheikha.top';
        const privacyPolicy =
            this.getValue(env, 'PRIVACY_POLICY_URL') || 'https://sheikha.top/privacy-policy';
        const termsUrl = this.getValue(env, 'TERMS_URL') || 'https://sheikha.top/terms';

        return {
            googleConsentScreen: {
                appName,
                developerName: this.owner.fullName,
                supportEmail,
                privacyPolicy,
                termsUrl
            },
            appleSignIn: {
                appName,
                contactEmail: supportEmail,
                associatedDomain: this.getValue(env, 'APPLE_ASSOCIATED_DOMAIN') || 'sheikha.top'
            }
        };
    }

    buildMobileSuiteReadiness(env) {
        const mobile = {
            flutter: {
                androidPackage: this.getValue(env, 'FLUTTER_ANDROID_PACKAGE') || 'top.sheikha.app',
                iosBundleId: this.getValue(env, 'FLUTTER_IOS_BUNDLE_ID') || 'top.sheikha.app'
            },
            payments: {
                googlePayMerchantId: this.getValue(env, 'GOOGLE_PAY_MERCHANT_ID'),
                applePayMerchantId: this.getValue(env, 'APPLE_PAY_MERCHANT_ID')
            },
            authApp: {
                biometricEnabled: this.getValue(env, 'AUTH_BIOMETRIC_ENABLED') || 'true',
                totpIssuer: this.getValue(env, 'AUTH_TOTP_ISSUER') || 'SHEIKHA'
            }
        };

        return {
            config: mobile,
            status: {
                paymentsReady:
                    !!mobile.payments.googlePayMerchantId || !!mobile.payments.applePayMerchantId,
                mobileIdsReady: !!mobile.flutter.androidPackage && !!mobile.flutter.iosBundleId
            }
        };
    }

    buildCompliance() {
        return {
            standards: ['GDPR', 'SOC2', 'PCI-DSS', 'PDPL'],
            controls: [
                'OAuth provider callback whitelisting',
                'JWT secret rotation policy',
                'Audit logging for auth events',
                'Rate limiting on auth endpoints',
                'MFA enforcement for admin roles'
            ]
        };
    }

    activate() {
        this.ensureDataDir();
        const env = this.parseEnvFile();

        const auth = this.buildAuthReadiness(env);
        const branding = this.buildBrandingProfile(env);
        const mobileSuite = this.buildMobileSuiteReadiness(env);
        const compliance = this.buildCompliance();

        const report = {
            timestamp: new Date().toISOString(),
            owner: this.owner,
            protocol: 'Sovereign Identity Protocol',
            auth,
            branding,
            mobileSuite,
            compliance,
            actions: [
                'تأكيد OAuth consent screen في Google Cloud Console',
                'ضبط callback URLs لكل مزود حسب BASE_URL',
                'تفعيل MFA إلزامي لحسابات الإدارة',
                'اعتماد معرفات Android/iOS النهائية للتطبيقات',
                'مراجعة readiness عبر npm run ops:auth:readiness'
            ]
        };

        fs.writeFileSync(this.reportPath, JSON.stringify(report, null, 2));
        return report;
    }
}

module.exports = SheikhaSovereignAuthEngine;
