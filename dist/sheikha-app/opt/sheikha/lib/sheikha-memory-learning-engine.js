/**
 * بسم الله الرحمن الرحيم
 * ══════════════════════════════════════════════════════════════════════
 * lib/sheikha-memory-learning-engine.js
 * محرك الذاكرة والتعلم الذاتي لمنظومة شيخة
 * ══════════════════════════════════════════════════════════════════════
 */

'use strict';

const fs   = require('fs');
const path = require('path');

class SheikhaMemoryLearningEngine {
    constructor(options = {}) {
        this.name    = 'sheikha-memory-learning-engine';
        this.version = '1.0.0';

        const defaultFile = path.join(process.cwd(), 'data', 'sheikha-learning-memory.json');
        this.defaultFilePath = options.filePath || defaultFile;
        this.filePath        = this.defaultFilePath;

        this.maxHistory      = options.maxHistory      || 20;
        this.maxRecentEvents = options.maxRecentEvents || 100;

        this._memory       = { history: [], events: [], facts: {} };
        this._initialized  = false;

        this._load();
    }

    // ── persistence ──────────────────────────────────────────────────────

    _load() {
        try {
            if (fs.existsSync(this.filePath)) {
                const raw = fs.readFileSync(this.filePath, 'utf8');
                this._memory = JSON.parse(raw);
            }
            this._initialized = true;
        } catch (err) {
            if (err instanceof SyntaxError) {
                console.warn(`[SheikhaMemory] Memory file corrupt, starting fresh: ${err.message}`);
            } else {
                console.warn(`[SheikhaMemory] Could not load memory file: ${err.message}`);
            }
            this._initialized = true;
        }
    }

    _save() {
        try {
            const dir = path.dirname(this.filePath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(this.filePath, JSON.stringify(this._memory, null, 2), 'utf8');
        } catch (err) {
            console.error(`[SheikhaMemory] Persistence failed: ${err.message}`);
        }
    }

    // ── public API ───────────────────────────────────────────────────────

    /**
     * تخزين حدث تعليمي جديد
     * @param {string} topic  - الموضوع
     * @param {*}      data   - البيانات
     * @returns {{ id: string, topic: string, timestamp: string }}
     */
    learn(topic, data) {
        const entry = {
            id:        Date.now().toString(36),
            topic,
            data,
            timestamp: new Date().toISOString(),
        };

        this._memory.history.unshift(entry);
        if (this._memory.history.length > this.maxHistory)
            this._memory.history.length = this.maxHistory;

        this._memory.events.unshift({ type: 'learn', topic, timestamp: entry.timestamp });
        if (this._memory.events.length > this.maxRecentEvents)
            this._memory.events.length = this.maxRecentEvents;

        this._save();
        return entry;
    }

    /**
     * استرجاع المعرفة المخزنة
     * @param {string} [topic] - اختياري: تصفية بالموضوع
     * @returns {Array}
     */
    recall(topic) {
        if (!topic) return [...this._memory.history];
        return this._memory.history.filter(e => e.topic === topic);
    }

    /**
     * تسجيل حقيقة ثابتة (key-value)
     */
    storeFact(key, value) {
        this._memory.facts[key] = { value, updatedAt: new Date().toISOString() };
        this._save();
    }

    getFact(key) {
        return this._memory.facts[key] || null;
    }

    /**
     * حالة صحة المحرك
     */
    health() {
        return {
            status:       'healthy',
            initialized:  this._initialized,
            historyCount: this._memory.history.length,
            eventCount:   this._memory.events.length,
            factCount:    Object.keys(this._memory.facts).length,
            filePath:     this.filePath,
            version:      this.version,
            timestamp:    new Date().toISOString(),
        };
    }

    /**
     * إحصاءات المحرك
     */
    stats() {
        const topicCounts = {};
        for (const e of this._memory.history) {
            topicCounts[e.topic] = (topicCounts[e.topic] || 0) + 1;
        }
        return {
            historyCount:  this._memory.history.length,
            eventCount:    this._memory.events.length,
            factCount:     Object.keys(this._memory.facts).length,
            topicCounts,
            maxHistory:    this.maxHistory,
            maxRecentEvents: this.maxRecentEvents,
        };
    }

    /**
     * آخر الأحداث
     * @param {number} [limit]
     */
    recentEvents(limit = 20) {
        return this._memory.events.slice(0, limit);
    }

    /**
     * مسح الذاكرة بالكامل
     */
    clear() {
        this._memory = { history: [], events: [], facts: {} };
        this._save();
    }
}

// Export a singleton instance.
// The class is also exposed as a property so callers can construct their own
// instance if needed:  const { SheikhaMemoryLearningEngine } = require('...')
const instance = new SheikhaMemoryLearningEngine();
module.exports = instance;
module.exports.SheikhaMemoryLearningEngine = SheikhaMemoryLearningEngine;
