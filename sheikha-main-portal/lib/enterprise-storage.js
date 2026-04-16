'use strict';

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const STORAGE_FILES = {
    audit: 'enterprise-audits.json',
    mirror: 'enterprise-mirror-log.json',
    retryQueue: 'enterprise-retry-queue.json'
};

function ensureDataDir() {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readList(fileName) {
    ensureDataDir();
    const filePath = path.join(DATA_DIR, fileName);

    if (!fs.existsSync(filePath)) {
        return [];
    }

    try {
        const raw = fs.readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.warn('[enterprise-storage] تعذر قراءة الملف:', fileName, error.message);
        return [];
    }
}

function writeList(fileName, list) {
    ensureDataDir();
    const filePath = path.join(DATA_DIR, fileName);
    fs.writeFileSync(filePath, JSON.stringify(list, null, 2), 'utf8');
}

async function mirrorRecord(entityType, record) {
    const entries = readList(STORAGE_FILES.mirror);
    entries.push({
        id: `${entityType}-${record?.id || Date.now()}`,
        entityType,
        record,
        mirroredAt: new Date().toISOString()
    });
    writeList(STORAGE_FILES.mirror, entries.slice(-5000));
    return true;
}

async function appendAudit(auditType, tenantId, payload, actor = 'system') {
    const entries = readList(STORAGE_FILES.audit);
    entries.push({
        id: `${auditType}-${Date.now()}`,
        auditType,
        tenantId: tenantId || null,
        actor,
        payload,
        createdAt: new Date().toISOString()
    });
    writeList(STORAGE_FILES.audit, entries.slice(-5000));
    return true;
}

async function getStorageStatus() {
    const retryQueue = readList(STORAGE_FILES.retryQueue);
    const auditEntries = readList(STORAGE_FILES.audit);
    const mirrorEntries = readList(STORAGE_FILES.mirror);

    return {
        mode: process.env.DATABASE_URL ? 'hybrid-json-postgres' : 'json-fallback',
        postgresConfigured: Boolean(process.env.DATABASE_URL),
        retryQueueSize: retryQueue.length,
        auditEntries: auditEntries.length,
        mirroredRecords: mirrorEntries.length,
        storageFiles: STORAGE_FILES,
        checkedAt: new Date().toISOString()
    };
}

async function listRetryQueue(limit = 200) {
    const queue = readList(STORAGE_FILES.retryQueue);
    return queue.slice(-Math.max(0, Number(limit) || 0)).reverse();
}

async function enqueueRetry(item) {
    const queue = readList(STORAGE_FILES.retryQueue);
    queue.push(item);
    writeList(STORAGE_FILES.retryQueue, queue.slice(-5000));
    return item;
}

async function updateRetryStatus(retryId, status, options = {}) {
    const queue = readList(STORAGE_FILES.retryQueue);
    const index = queue.findIndex(item => item.id === retryId);

    if (index === -1) {
        return null;
    }

    const current = queue[index];
    queue[index] = {
        ...current,
        status,
        attempts: options.incrementAttempts ? (Number(current.attempts) || 0) + 1 : current.attempts,
        nextRetryAt: Object.prototype.hasOwnProperty.call(options, 'nextRetryAt')
            ? options.nextRetryAt
            : current.nextRetryAt,
        updatedAt: new Date().toISOString()
    };

    writeList(STORAGE_FILES.retryQueue, queue);
    return queue[index];
}

module.exports = {
    mirrorRecord,
    appendAudit,
    getStorageStatus,
    listRetryQueue,
    enqueueRetry,
    updateRetryStatus
};