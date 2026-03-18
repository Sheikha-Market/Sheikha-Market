'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const router = express.Router();
const ROOT = process.cwd();

const CATALOG_PATH = path.join(
    ROOT,
    'infrastructure',
    'sheikha-consent-communication-governance-core',
    'communication',
    'communication-catalog.json'
);
const PARTNERSHIP_OVERVIEW_PATH = path.join(
    ROOT,
    'infrastructure',
    'sheikha-consent-communication-governance-core',
    'partnerships',
    'public-partnership-pages.json'
);
const PARTNERSHIP_ENTITIES_PATH = path.join(
    ROOT,
    'infrastructure',
    'sheikha-consent-communication-governance-core',
    'partnerships',
    'public-entity-catalog.json'
);
const CONSENT_REGISTRY_PATH = path.join(ROOT, 'data', 'consent-registry.json');
const ENGAGEMENT_PATH = path.join(ROOT, 'data', 'public-engagement-signups.json');
const DEFENSIVE_EVENTS_PATH = path.join(ROOT, 'data', 'defensive-monitoring-events.json');

function nowIso() {
    return new Date().toISOString();
}

function ensureDataFile(filePath, payload) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(payload, null, 4) + '\n', 'utf8');
    }
}

function readJson(filePath, fallback) {
    try {
        if (!fs.existsSync(filePath)) {
            return fallback;
        }
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (_e) {
        return fallback;
    }
}

function writeJson(filePath, payload) {
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 4) + '\n', 'utf8');
}

function hashIp(ip) {
    return crypto.createHash('sha256').update(String(ip || 'unknown')).digest('hex').slice(0, 24);
}

function ok(res, data, message) {
    return res.json({
        success: true,
        data,
        message,
        timestamp: nowIso()
    });
}

function fail(res, statusCode, message) {
    return res.status(statusCode).json({
        success: false,
        data: null,
        message,
        timestamp: nowIso()
    });
}

router.get('/catalog', (_req, res) => {
    const catalog = readJson(CATALOG_PATH, {
        publicNewsletters: [],
        channels: [],
        officialContactForms: []
    });

    return ok(res, catalog, 'تم جلب كتالوج التواصل الطوعي');
});

router.get('/newsletters', (_req, res) => {
    const catalog = readJson(CATALOG_PATH, { publicNewsletters: [] });
    return ok(res, catalog.publicNewsletters || [], 'تم جلب النشرات العامة');
});

router.get('/channels', (_req, res) => {
    const catalog = readJson(CATALOG_PATH, { channels: [] });
    return ok(res, catalog.channels || [], 'تم جلب القنوات الرسمية');
});

router.post('/consents', (req, res) => {
    const {
        subjectType,
        subjectId,
        purpose,
        channel,
        consentGranted,
        consentTextVersion
    } = req.body || {};

    if (!subjectType || !subjectId || !purpose || !channel) {
        return fail(res, 400, 'الحقول المطلوبة: subjectType, subjectId, purpose, channel');
    }

    if (consentGranted !== true) {
        return fail(res, 400, 'لا يمكن الحفظ بدون موافقة صريحة consentGranted=true');
    }

    ensureDataFile(CONSENT_REGISTRY_PATH, { updatedAt: nowIso(), records: [] });
    const registry = readJson(CONSENT_REGISTRY_PATH, { updatedAt: nowIso(), records: [] });

    const record = {
        id: crypto.randomUUID(),
        subjectType,
        subjectId,
        purpose,
        channel,
        consentGranted: true,
        consentTextVersion: consentTextVersion || 'v1',
        ipHash: hashIp(req.ip),
        recordedAt: nowIso()
    };

    registry.records = Array.isArray(registry.records) ? registry.records : [];
    registry.records.push(record);
    registry.updatedAt = nowIso();
    writeJson(CONSENT_REGISTRY_PATH, registry);

    return ok(res, record, 'تم حفظ الموافقة الصريحة بنجاح');
});

router.get('/consents', (req, res) => {
    const { subjectId } = req.query;

    ensureDataFile(CONSENT_REGISTRY_PATH, { updatedAt: nowIso(), records: [] });
    const registry = readJson(CONSENT_REGISTRY_PATH, { records: [] });
    const rows = Array.isArray(registry.records) ? registry.records : [];

    const data = subjectId
        ? rows.filter((row) => String(row.subjectId) === String(subjectId))
        : rows.slice(-200);

    return ok(res, data, 'تم جلب سجلات الموافقات');
});

router.post('/newsletter/subscribe', (req, res) => {
    const { newsletterId, email, consentGranted } = req.body || {};

    if (!newsletterId || !email) {
        return fail(res, 400, 'الحقول المطلوبة: newsletterId, email');
    }

    if (consentGranted !== true) {
        return fail(res, 400, 'الاشتراك يتطلب موافقة صريحة consentGranted=true');
    }

    ensureDataFile(ENGAGEMENT_PATH, {
        updatedAt: nowIso(),
        newsletterSubscribers: [],
        channelSubscriptions: []
    });

    const signups = readJson(ENGAGEMENT_PATH, {
        updatedAt: nowIso(),
        newsletterSubscribers: [],
        channelSubscriptions: []
    });

    const entry = {
        id: crypto.randomUUID(),
        newsletterId,
        email,
        consentGranted: true,
        subscribedAt: nowIso()
    };

    signups.newsletterSubscribers = Array.isArray(signups.newsletterSubscribers)
        ? signups.newsletterSubscribers
        : [];
    signups.newsletterSubscribers.push(entry);
    signups.updatedAt = nowIso();

    writeJson(ENGAGEMENT_PATH, signups);

    return ok(res, entry, 'تم الاشتراك في النشرة العامة');
});

router.get('/defensive/health', (_req, res) => {
    const events = readJson(DEFENSIVE_EVENTS_PATH, { events: [] });
    const recentEvents = (Array.isArray(events.events) ? events.events : []).slice(-50);

    const snapshot = {
        uptimeSeconds: Math.floor(process.uptime()),
        memory: process.memoryUsage(),
        eventCount: recentEvents.length,
        scope: 'system-health-only'
    };

    return ok(res, snapshot, 'تم جلب حالة المتابعة الدفاعية');
});

router.post('/defensive/events', (req, res) => {
    const { eventType, severity, details } = req.body || {};

    if (!eventType || !severity) {
        return fail(res, 400, 'الحقول المطلوبة: eventType, severity');
    }

    ensureDataFile(DEFENSIVE_EVENTS_PATH, { updatedAt: nowIso(), events: [] });
    const storage = readJson(DEFENSIVE_EVENTS_PATH, { updatedAt: nowIso(), events: [] });

    const event = {
        id: crypto.randomUUID(),
        eventType,
        severity,
        details: details || {},
        recordedAt: nowIso()
    };

    storage.events = Array.isArray(storage.events) ? storage.events : [];
    storage.events.push(event);
    storage.updatedAt = nowIso();
    writeJson(DEFENSIVE_EVENTS_PATH, storage);

    return ok(res, event, 'تم تسجيل حدث دفاعي خاص بصحة الأنظمة');
});

router.get('/partnerships/overview', (_req, res) => {
    const overview = readJson(PARTNERSHIP_OVERVIEW_PATH, { pages: [] });
    return ok(res, overview, 'تم جلب صفحات الشراكات العامة');
});

router.get('/partnerships/entities', (_req, res) => {
    const entities = readJson(PARTNERSHIP_ENTITIES_PATH, { entities: [] });
    return ok(res, entities, 'تم جلب كتالوج الجهات الأولي للشراكات العامة');
});

module.exports = router;
