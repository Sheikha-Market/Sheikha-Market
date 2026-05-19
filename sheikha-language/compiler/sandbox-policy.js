'use strict';

const { URL } = require('node:url');

const PROFILES = {
    local: {
        profile: 'local',
        strict: false,
        networkHosts: ['127.0.0.1', 'localhost'],
        pm2Targets: ['sheikha-api', 'sheikha-meta-background', 'sheikha-copilot'],
        dockerTargets: ['sheikha-api', 'sheikha-php-gateway', 'sheikha-neural-gateway'],
        dockerAllowNoTargetActions: ['ps', 'images'],
    },
    staging: {
        profile: 'staging',
        strict: true,
        networkHosts: ['127.0.0.1', 'localhost', 'staging.sheikha.top'],
        pm2Targets: ['sheikha-api', 'sheikha-meta-background'],
        dockerTargets: ['sheikha-api', 'sheikha-php-gateway'],
        dockerAllowNoTargetActions: ['ps', 'images'],
    },
    production: {
        profile: 'production',
        strict: true,
        networkHosts: ['api.sheikha.top', 'sheikha.top'],
        pm2Targets: ['sheikha-api'],
        dockerTargets: ['sheikha-api', 'sheikha-php-gateway'],
        dockerAllowNoTargetActions: ['ps'],
    },
};

function resolveSandboxPolicy(profile = 'local', strictOverride) {
    const base = PROFILES[profile] || PROFILES.local;
    return {
        ...base,
        strict: typeof strictOverride === 'boolean' ? strictOverride : base.strict,
    };
}

function checkApiTarget(policy, urlText) {
    const parsed = safeParseUrl(urlText);
    if (!parsed) {
        return { allowed: false, reason: 'رابط API غير صالح.' };
    }

    if (!policy.strict) {
        return { allowed: true };
    }

    const host = parsed.hostname.toLowerCase();
    if (!policy.networkHosts.includes(host)) {
        return {
            allowed: false,
            reason: `المضيف ${host} غير مسموح في سياسة ${policy.profile}`,
        };
    }

    return { allowed: true };
}

function checkPm2Target(policy, processName) {
    if (!policy.strict) {
        return { allowed: true };
    }

    if (!policy.pm2Targets.includes(processName)) {
        return {
            allowed: false,
            reason: `عملية PM2 غير مصرح بها: ${processName}`,
        };
    }

    return { allowed: true };
}

function checkDockerTarget(policy, action, target) {
    if (!policy.strict) {
        return { allowed: true };
    }

    if (policy.dockerAllowNoTargetActions.includes(action)) {
        return { allowed: true };
    }

    if (!target) {
        return {
            allowed: false,
            reason: `إجراء Docker ${action} يحتاج target مسموحًا`,
        };
    }

    if (!policy.dockerTargets.includes(target)) {
        return {
            allowed: false,
            reason: `حاوية Docker غير مصرح بها: ${target}`,
        };
    }

    return { allowed: true };
}

function safeParseUrl(urlText) {
    try {
        return new URL(String(urlText));
    } catch (_) {
        return null;
    }
}

module.exports = {
    resolveSandboxPolicy,
    checkApiTarget,
    checkPm2Target,
    checkDockerTarget,
};
