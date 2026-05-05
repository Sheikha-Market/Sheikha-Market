'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const REPORT_MESH_VERSION = '1.0.0';
const ROOT_DIR = path.join(__dirname, '..');
const REPORTS_DIR = path.join(ROOT_DIR, 'reports', 'synchronization');

function ensureReportsDir() {
    if (!fs.existsSync(REPORTS_DIR)) {
        fs.mkdirSync(REPORTS_DIR, { recursive: true });
    }
}

function safeFileName(name) {
    return String(name || '')
        .replace(/[^a-zA-Z0-9._-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') || `report-${Date.now()}`;
}

function listReports(limit = 20) {
    ensureReportsDir();

    return fs.readdirSync(REPORTS_DIR)
        .map((name) => {
            const filePath = path.join(REPORTS_DIR, name);
            const stat = fs.statSync(filePath);
            return {
                name,
                filePath,
                size: stat.size,
                mtime: stat.mtime.toISOString(),
                isFile: stat.isFile()
            };
        })
        .filter((entry) => entry.isFile)
        .sort((left, right) => new Date(right.mtime) - new Date(left.mtime))
        .slice(0, Math.max(1, limit));
}

function readReport(name) {
    ensureReportsDir();
    const fileName = safeFileName(name);
    const filePath = path.join(REPORTS_DIR, fileName);

    if (!fs.existsSync(filePath)) {
        return { success: false, message: 'التقرير غير موجود' };
    }

    const content = fs.readFileSync(filePath, 'utf8');
    return {
        success: true,
        data: {
            name: fileName,
            filePath,
            content
        }
    };
}

function writeReport(input = {}) {
    ensureReportsDir();

    const now = new Date().toISOString();
    const report = {
        id: crypto.randomUUID(),
        title: input.title || 'Sheikha Server Mesh Report',
        type: input.type || 'server-mesh',
        tags: Array.isArray(input.tags) ? input.tags : [],
        source: input.source || 'local-server',
        target: input.target || null,
        payload: input.payload || {},
        createdAt: now
    };

    const name = `${safeFileName(input.fileName || `${report.type}-${Date.now()}`)}.json`;
    const filePath = path.join(REPORTS_DIR, name);
    fs.writeFileSync(filePath, JSON.stringify(report, null, 2), 'utf8');

    return {
        success: true,
        data: {
            name,
            filePath,
            report
        }
    };
}

async function relayReport(input = {}) {
    const remoteUrl = String(input.remoteUrl || '').trim();
    if (!remoteUrl) {
        return { success: false, message: 'remoteUrl مطلوب' };
    }

    const headers = {
        'Content-Type': 'application/json'
    };

    if (input.token) {
        headers.Authorization = `Bearer ${input.token}`;
    }

    const response = await fetch(remoteUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            title: input.title || 'Relayed report',
            type: input.type || 'relay',
            tags: input.tags || ['relay'],
            source: input.source || 'local-server',
            target: input.target || remoteUrl,
            payload: input.payload || {}
        })
    });

    const text = await response.text();
    let data;
    try {
        data = JSON.parse(text);
    } catch (_) {
        data = { raw: text };
    }

    return {
        success: response.status < 400,
        status: response.status,
        data
    };
}

function getStatus() {
    const reports = listReports(10);

    return {
        version: REPORT_MESH_VERSION,
        reportsDir: REPORTS_DIR,
        latestReports: reports,
        summary: {
            reportsCount: reports.length,
            relayReady: true,
            reportsRepoConfigured: !!(process.env.REPORTS_GITHUB_REPO && (process.env.REPORTS_GITHUB_TOKEN || process.env.GITHUB_TOKEN)),
            computerVisionMounted: fs.existsSync(path.join(ROOT_DIR, 'routes', 'computer-vision-routes.js')),
            visionSystemMounted: fs.existsSync(path.join(ROOT_DIR, 'routes', 'vision-system-routes.js'))
        }
    };
}

module.exports = {
    REPORT_MESH_VERSION,
    listReports,
    readReport,
    writeReport,
    relayReport,
    getStatus
};
