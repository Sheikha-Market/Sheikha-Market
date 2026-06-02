'use strict';

const path = require('node:path');
const { URL } = require('node:url');

const PROFILES = {
    local: {
        profile: 'local',
        strict: false,
        networkHosts: ['127.0.0.1', 'localhost'],
        pm2Targets: ['sheikha-api', 'sheikha-meta-background', 'sheikha-copilot'],
        dockerTargets: ['sheikha-api', 'sheikha-php-gateway', 'sheikha-neural-gateway'],
        dockerAllowNoTargetActions: ['ps', 'images'],
        pythonRoots: ['sheikha-language/examples', 'scripts'],
        pythonPermissions: ['score', 'analyze', 'summarize'],
        contractRoots: ['sheikha-language/examples'],
    },
    staging: {
        profile: 'staging',
        strict: true,
        networkHosts: ['127.0.0.1', 'localhost', 'staging.sheikha.top'],
        pm2Targets: ['sheikha-api', 'sheikha-meta-background'],
        dockerTargets: ['sheikha-api', 'sheikha-php-gateway'],
        dockerAllowNoTargetActions: ['ps', 'images'],
        pythonRoots: ['sheikha-language/examples'],
        pythonPermissions: ['score', 'analyze', 'summarize'],
        contractRoots: ['sheikha-language/examples'],
    },
    production: {
        profile: 'production',
        strict: true,
        networkHosts: ['api.sheikha.top', 'sheikha.top'],
        pm2Targets: ['sheikha-api'],
        dockerTargets: ['sheikha-api', 'sheikha-php-gateway'],
        dockerAllowNoTargetActions: ['ps'],
        pythonRoots: ['sheikha-language/examples'],
        pythonPermissions: ['score'],
        contractRoots: ['sheikha-language/examples'],
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

function checkPythonTarget(policy, scriptPath, contractPath, contract = {}, baseDir = process.cwd()) {
    const input = String(scriptPath || '');
    if (!input.endsWith('.py')) {
        return { allowed: false, reason: 'ملف Python يجب أن ينتهي بـ ‎.py' };
    }

    const resolved = path.resolve(baseDir, input);
    const insideAllowedRoot = (policy.pythonRoots || []).some((root) => {
        const rootPath = path.resolve(baseDir, root);
        return resolved === rootPath || resolved.startsWith(rootPath + path.sep);
    });

    if (!insideAllowedRoot) {
        return {
            allowed: false,
            reason: `ملف Python خارج المسارات المسموحة في سياسة ${policy.profile}`,
        };
    }

    const resolvedContractPath = path.resolve(baseDir, String(contractPath || ''));
    const insideAllowedContractRoot = (policy.contractRoots || []).some((root) => {
        const rootPath = path.resolve(baseDir, root);
        return resolvedContractPath === rootPath || resolvedContractPath.startsWith(rootPath + path.sep);
    });
    if (!insideAllowedContractRoot) {
        return {
            allowed: false,
            reason: `ملف العقد خارج المسارات المسموحة في سياسة ${policy.profile}`,
        };
    }

    if (!policy.strict) {
        return { allowed: true, resolvedPath: resolved, resolvedContractPath };
    }

    const requested = Array.isArray(contract.permissions) ? contract.permissions.map((v) => String(v)) : [];
    const unauthorized = requested.filter((permission) => !(policy.pythonPermissions || []).includes(permission));
    if (unauthorized.length > 0) {
        return {
            allowed: false,
            reason: `صلاحيات Python غير مسموحة: ${unauthorized.join('، ')}`,
        };
    }

    return { allowed: true, resolvedPath: resolved, resolvedContractPath };
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
    checkPythonTarget,
};
