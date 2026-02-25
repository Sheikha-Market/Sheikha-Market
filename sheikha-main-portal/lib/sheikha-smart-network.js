'use strict';
/**
 * sheikha-smart-network.js
 * العمود الثاني: الشبكات الذكية — توجيه + جدار ذكي + قياس لحظي + توازن
 * بسم الله الرحمن الرحيم
 */
const EventEmitter = require('events');

class SheikhaSmartNetwork extends EventEmitter {
    constructor() {
        super();
        this.name = 'sheikha-smart-network';
        this.version = '1.0.0';

        // Event Bus — ناقل الأحداث
        this.eventBus = new EventEmitter();
        this.eventBus.setMaxListeners(100);
        this.eventLog = [];

        // Telemetry
        this.telemetry = new Map();
        this.telemetryHistory = [];

        // Firewall
        this.firewallLog = [];
        this.blockedIPs = new Map();
        this.requestPatterns = new Map();

        // Load Balancer
        this.engineWeights = new Map();

        this._timers = [];
    }

    // ═══ 1. Event Bus — ناقل الأحداث بين المحركات ═══
    publish(channel, data, source) {
        const event = { ts: Date.now(), channel, source: source || 'unknown', data };
        this.eventLog.unshift(event);
        if (this.eventLog.length > 500) this.eventLog.length = 500;
        this.eventBus.emit(channel, data);
        this.emit('event', event);
    }

    subscribe(channel, handler) {
        this.eventBus.on(channel, handler);
    }

    // ═══ 2. AI Firewall — الجدار الذكي ═══
    analyzeRequest(req) {
        const ip = req.ip || req.connection?.remoteAddress || 'unknown';
        const now = Date.now();
        const ua = req.headers?.['user-agent'] || '';
        const path = req.path || req.url || '/';

        if (!this.requestPatterns.has(ip)) {
            this.requestPatterns.set(ip, { count: 0, firstSeen: now, lastSeen: now, paths: new Set(), blocked: false });
        }
        const pattern = this.requestPatterns.get(ip);
        pattern.count++;
        pattern.lastSeen = now;
        pattern.paths.add(path);

        let threatScore = 0;
        const window = now - pattern.firstSeen;
        const rps = window > 0 ? (pattern.count / (window / 1000)) : pattern.count;

        if (rps > 50) threatScore += 0.4;
        else if (rps > 20) threatScore += 0.2;

        if (!ua || ua.length < 10) threatScore += 0.15;
        if (/sqlmap|nikto|nmap|dirbust|gobust/i.test(ua)) threatScore += 0.5;

        if (pattern.paths.size > 30 && window < 60000) threatScore += 0.3;

        if (/['";<>]|union\s+select|drop\s+table|script>/i.test(path)) threatScore += 0.6;

        if (this.blockedIPs.has(ip)) threatScore = 1;

        const blocked = threatScore >= 0.8;
        if (blocked && !this.blockedIPs.has(ip)) {
            this.blockedIPs.set(ip, { since: now, reason: `threat=${threatScore.toFixed(2)}` });
            this._logFirewall(ip, 'block', threatScore);
        }

        return { ip, threatScore: Math.min(threatScore, 1), blocked, rps: Math.round(rps * 10) / 10 };
    }

    _logFirewall(ip, action, score) {
        this.firewallLog.unshift({ ts: new Date().toISOString(), ip, action, score });
        if (this.firewallLog.length > 300) this.firewallLog.length = 300;
    }

    unblockIP(ip) {
        this.blockedIPs.delete(ip);
        this.requestPatterns.delete(ip);
        this._logFirewall(ip, 'unblock', 0);
    }

    // ═══ 3. Telemetry — القياس اللحظي ═══
    reportTelemetry(engineName, data) {
        const entry = {
            ts: Date.now(),
            engine: engineName,
            status: data.status || 'active',
            latency: data.latency || 0,
            load: data.load || 0,
            errors: data.errors || 0,
            requests: data.requests || 0
        };
        this.telemetry.set(engineName, entry);
        this.telemetryHistory.unshift(entry);
        if (this.telemetryHistory.length > 2000) this.telemetryHistory.length = 2000;

        if (entry.latency > 1000) {
            this.emit('alert', { type: 'high-latency', engine: engineName, value: entry.latency });
        }
        if (entry.errors > 5) {
            this.emit('alert', { type: 'high-errors', engine: engineName, value: entry.errors });
        }
    }

    getLiveTelemetry() {
        const live = {};
        for (const [name, data] of this.telemetry) {
            live[name] = { ...data, ts: new Date(data.ts).toISOString() };
        }
        return live;
    }

    getTopology() {
        const nodes = [];
        for (const [name, data] of this.telemetry) {
            nodes.push({
                id: name,
                status: data.status,
                latency: data.latency,
                load: data.load
            });
        }
        return { nodes, totalEngines: nodes.length, activeEngines: nodes.filter(n => n.status === 'active').length };
    }

    // ═══ 4. Smart Load Balancer — التوازن الذكي ═══
    selectEngine(candidates) {
        if (!candidates || candidates.length === 0) return null;
        if (candidates.length === 1) return candidates[0];

        let best = null;
        let bestScore = -Infinity;

        for (const name of candidates) {
            const tel = this.telemetry.get(name);
            if (!tel || tel.status !== 'active') continue;

            const latencyScore = Math.max(0, 100 - tel.latency);
            const loadScore = Math.max(0, 100 - tel.load);
            const errorPenalty = tel.errors * 10;
            const score = latencyScore + loadScore - errorPenalty;

            if (score > bestScore) {
                bestScore = score;
                best = name;
            }
        }
        return best || candidates[0];
    }

    // ═══ تنظيف دوري ═══
    start() {
        const t = setInterval(() => {
            const now = Date.now();
            for (const [ip, pattern] of this.requestPatterns) {
                if (now - pattern.lastSeen > 300000) {
                    this.requestPatterns.delete(ip);
                }
            }
            for (const [ip, block] of this.blockedIPs) {
                if (now - block.since > 3600000) {
                    this.blockedIPs.delete(ip);
                }
            }
        }, 60000);
        this._timers.push(t);
    }

    stop() {
        this._timers.forEach(t => clearInterval(t));
        this._timers = [];
    }

    // ═══ APIs ═══
    registerAPIs(app) {
        if (!app) return;

        app.get('/api/network/telemetry', (req, res) => {
            res.json({ success: true, data: this.getLiveTelemetry(), timestamp: new Date().toISOString() });
        });

        app.get('/api/network/topology', (req, res) => {
            res.json({ success: true, data: this.getTopology(), timestamp: new Date().toISOString() });
        });

        app.get('/api/network/firewall', (req, res) => {
            res.json({
                success: true,
                data: {
                    blockedCount: this.blockedIPs.size,
                    recentLog: this.firewallLog.slice(0, 50),
                    trackedIPs: this.requestPatterns.size
                },
                timestamp: new Date().toISOString()
            });
        });

        app.get('/api/network/events', (req, res) => {
            res.json({ success: true, data: this.eventLog.slice(0, 50), timestamp: new Date().toISOString() });
        });

        app.get('/api/network/dashboard', (req, res) => {
            res.json({
                success: true,
                data: {
                    topology: this.getTopology(),
                    firewall: { blocked: this.blockedIPs.size, tracked: this.requestPatterns.size },
                    recentEvents: this.eventLog.slice(0, 10),
                    telemetry: this.getLiveTelemetry()
                },
                timestamp: new Date().toISOString()
            });
        });

        app.post('/api/network/firewall/unblock', (req, res) => {
            const ip = req.body && req.body.ip;
            if (!ip) return res.status(400).json({ success: false, message: 'مطلوب: ip' });
            this.unblockIP(ip);
            res.json({ success: true, message: `تم فك الحظر عن ${ip}`, timestamp: new Date().toISOString() });
        });

        app.get('/api/network/firewall/blocked', (req, res) => {
            const list = [];
            for (const [ip, info] of this.blockedIPs) {
                list.push({ ip, since: new Date(info.since).toISOString(), reason: info.reason });
            }
            res.json({ success: true, data: list, timestamp: new Date().toISOString() });
        });
    }

    getStatus() {
        return {
            name: this.name,
            version: this.version,
            status: 'active',
            trackedEngines: this.telemetry.size,
            blockedIPs: this.blockedIPs.size,
            events: this.eventLog.length
        };
    }
}

module.exports = SheikhaSmartNetwork;
