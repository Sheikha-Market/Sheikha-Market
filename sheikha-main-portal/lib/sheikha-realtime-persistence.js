'use strict';
/**
 * 🕋 Sheikha Realtime Persistence Layer
 * حفظ الأحداث الحرجة والسجلات التاريخية
 * 
 * يحفظ:
 * - قرارات Orchestrator (CRITICAL)
 * - أوامر لغة شيخة (IMPORTANT)
 * - Visual jobs lifecycle (IMPORTANT)
 * - Git events (AUDIT)
 * - FIO benchmarks (STATS)
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const EVENTS_FILE = path.join(DATA_DIR, 'realtime-events.json');
const MAX_EVENTS = 5000;

class RealtimePersistence {
    constructor() {
        this.events = [];
        this.loadFromDisk();
    }

    loadFromDisk() {
        try {
            if (fs.existsSync(EVENTS_FILE)) {
                const data = fs.readFileSync(EVENTS_FILE, 'utf8');
                this.events = JSON.parse(data) || [];
            } else {
                this.events = [];
            }
        } catch (error) {
            console.error('Failed to load realtime events from disk:', error.message);
            this.events = [];
        }
    }

    saveToDisk() {
        try {
            if (!fs.existsSync(DATA_DIR)) {
                fs.mkdirSync(DATA_DIR, { recursive: true });
            }

            // حفظ آخر MAX_EVENTS فقط
            const toSave = this.events.slice(-MAX_EVENTS);
            fs.writeFileSync(EVENTS_FILE, JSON.stringify(toSave, null, 2), 'utf8');
        } catch (error) {
            console.error('Failed to save realtime events to disk:', error.message);
        }
    }

    append(event) {
        const record = {
            id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            channel: event.channel || 'unknown',
            payload: event.payload || {},
            severity: this.determineSeverity(event.channel),
            createdAt: Date.now()
        };

        this.events.push(record);

        // حفظ مباشر للأحداث الحرجة
        if (record.severity === 'CRITICAL' || record.severity === 'IMPORTANT') {
            this.saveToDisk();
        }

        // حفظ دوري (كل 100 حدث)
        if (this.events.length % 100 === 0) {
            this.saveToDisk();
        }

        return record;
    }

    determineSeverity(channel) {
        if (!channel) return 'INFO';

        if (channel.startsWith('orchestrator.mode')) return 'CRITICAL';
        if (channel.startsWith('sheikha.command')) return 'IMPORTANT';
        if (channel.startsWith('visual.job')) return 'IMPORTANT';
        if (channel.startsWith('git.')) return 'AUDIT';
        if (channel.startsWith('fio.')) return 'STATS';

        return 'INFO';
    }

    query(filters = {}) {
        let result = [...this.events];

        if (filters.channel) {
            result = result.filter(e => e.channel === filters.channel);
        }

        if (filters.severity) {
            result = result.filter(e => e.severity === filters.severity);
        }

        if (filters.since) {
            const sinceTime = new Date(filters.since).getTime();
            result = result.filter(e => e.createdAt >= sinceTime);
        }

        if (filters.until) {
            const untilTime = new Date(filters.until).getTime();
            result = result.filter(e => e.createdAt <= untilTime);
        }

        // الأحدث أولاً
        if (filters.orderBy !== 'asc') {
            result.reverse();
        }

        const limit = filters.limit || 100;
        return result.slice(0, limit);
    }

    getStats() {
        const stats = {
            total: this.events.length,
            byChannel: {},
            bySeverity: {
                CRITICAL: 0,
                IMPORTANT: 0,
                AUDIT: 0,
                STATS: 0,
                INFO: 0
            },
            lastEventAt: this.events.length > 0 ? this.events[this.events.length - 1].timestamp : null
        };

        this.events.forEach(evt => {
            if (!stats.byChannel[evt.channel]) {
                stats.byChannel[evt.channel] = 0;
            }
            stats.byChannel[evt.channel]++;
            stats.bySeverity[evt.severity]++;
        });

        return stats;
    }

    clear(beforeDays = 30) {
        const cutoffTime = Date.now() - (beforeDays * 24 * 60 * 60 * 1000);
        const before = this.events.length;
        this.events = this.events.filter(e => e.createdAt > cutoffTime);
        const after = this.events.length;
        this.saveToDisk();

        return {
            removed: before - after,
            remaining: after,
            cutoffDate: new Date(cutoffTime).toISOString()
        };
    }
}

module.exports = { RealtimePersistence };
