'use strict';

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { EventEmitter } = require('node:events');
const { RealtimePersistence } = require('./sheikha-realtime-persistence');

class SheikhaRealtimeHub extends EventEmitter {
    constructor() {
        super();
        this.version = '2.0.0';
        this.name = 'Sheikha Real-Time Hub';
        this.clients = new Map();
        this.channels = new Map();
        this.recentEvents = [];
        this.maxRecentEvents = 500;
        this.nextClientId = 1;
        this.startedAt = new Date().toISOString();
        this.archiveFile = path.join(process.cwd(), 'data', 'realtime-events.json');
        this.persistence = new RealtimePersistence();

        this.bootstrapChannels(this.getChannels());
        this.loadArchive();
    }

    now() {
        return new Date().toISOString();
    }

    getChannels() {
        return [
            'visual.job.created',
            'visual.job.started',
            'visual.job.completed',
            'visual.job.failed',
            'job.queued',
            'job.started',
            'job.completed',
            'job.failed',
            'orchestrator.mode.changed',
            'git.file.created',
            'git.file.updated',
            'fio.benchmark.completed',
            'sheikha.command.executed',
            'sheikha.pipeline.completed',
            'encoding.job.submitted',
            'encoding.completed'
        ];
    }

    bootstrapChannels(names = []) {
        names.forEach((name) => this.ensureChannel(name));
    }

    ensureChannel(name) {
        const normalizedName = String(name || '').trim();
        if (!normalizedName) {
            return null;
        }

        if (!this.channels.has(normalizedName)) {
            this.channels.set(normalizedName, {
                name: normalizedName,
                subscribers: 0,
                lastEvent: null
            });
        }

        return this.channels.get(normalizedName);
    }

    createPersistedEvent(channel, payload = {}) {
        return {
            id: `EVT-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
            channel,
            severity: payload.severity || this.persistence.determineSeverity(channel),
            payload,
            timestamp: this.now(),
            createdAt: Date.now()
        };
    }

    loadArchive() {
        try {
            if (!fs.existsSync(this.archiveFile)) {
                this.recentEvents = [];
                this.persistArchive();
                return;
            }

            const raw = fs.readFileSync(this.archiveFile, 'utf8');
            const parsed = JSON.parse(raw || '[]');
            this.recentEvents = Array.isArray(parsed)
                ? parsed.slice(-this.maxRecentEvents)
                : [];

            this.recentEvents.forEach((event) => {
                if (event?.channel) {
                    const meta = this.ensureChannel(event.channel);
                    if (meta) {
                        meta.lastEvent = event;
                    }
                }
            });
        } catch (error) {
            console.error('Realtime archive load failed:', error.message);
            this.recentEvents = [];
        }
    }

    persistArchive() {
        try {
            fs.mkdirSync(path.dirname(this.archiveFile), { recursive: true });
            fs.writeFileSync(
                this.archiveFile,
                JSON.stringify(this.recentEvents.slice(-this.maxRecentEvents), null, 2),
                'utf8'
            );
        } catch (error) {
            console.error('Realtime archive persist failed:', error.message);
        }
    }

    status() {
        return {
            status: 'operational',
            version: this.version,
            startedAt: this.startedAt,
            clients: this.getClientCount(),
            channels: this.getChannels(),
            historyCount: this.recentEvents.length,
            archiveFile: this.archiveFile,
            persistence: this.getPersistenceStats()
        };
    }

    recent(limit = 20) {
        const safeLimit = Math.max(1, Number(limit) || 20);
        return {
            events: this.recentEvents.slice(-safeLimit).reverse(),
            total: this.recentEvents.length,
            limit: safeLimit
        };
    }

    archive(limit = 100) {
        const safeLimit = Math.max(1, Number(limit) || 100);
        return {
            events: this.recentEvents.slice(-safeLimit).reverse(),
            total: this.recentEvents.length,
            limit: safeLimit,
            archiveFile: this.archiveFile
        };
    }

    getRecent(limit = 50) {
        return this.recent(limit).events;
    }

    getClientCount() {
        return this.clients.size;
    }

    subscribe(channel, listener) {
        const meta = this.ensureChannel(channel);
        this.on(channel, listener);

        if (meta) {
            meta.subscribers += 1;
        }

        return () => {
            this.off(channel, listener);
            if (meta) {
                meta.subscribers = Math.max(0, meta.subscribers - 1);
            }
        };
    }

    subscribeBroadcast(listener) {
        this.on('broadcast', listener);
        return () => this.off('broadcast', listener);
    }

    subscribeSse(res, channels = []) {
        const clientId = this.nextClientId++;
        const normalizedChannels = Array.isArray(channels)
            ? channels.map((channel) => String(channel || '').trim()).filter(Boolean)
            : [];

        res.writeHead(200, {
            'Content-Type': 'text/event-stream; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
            Connection: 'keep-alive',
            'X-Accel-Buffering': 'no'
        });

        res.write('event: system.ready\n');
        res.write(`data: ${JSON.stringify({
            ok: true,
            message: 'Realtime stream connected',
            clientId,
            channels: normalizedChannels,
            timestamp: this.now()
        })}\n\n`);

        const heartbeat = setInterval(() => {
            try {
                res.write('event: system.ping\n');
                res.write(`data: ${JSON.stringify({ t: Date.now() })}\n\n`);
            } catch (error) {
                this.emit('hub.error', { stage: 'heartbeat', error: error.message, clientId });
                this.unsubscribe(clientId);
            }
        }, 20000);

        this.clients.set(clientId, {
            res,
            channels: normalizedChannels,
            heartbeat
        });

        return clientId;
    }

    unsubscribe(clientId) {
        const client = this.clients.get(clientId);
        if (!client) {
            return;
        }

        clearInterval(client.heartbeat);
        this.clients.delete(clientId);

        try {
            client.res.end();
        } catch (error) {
            this.emit('hub.error', { stage: 'unsubscribe', error: error.message, clientId });
        }
    }

    shouldDeliver(clientChannels, eventChannel) {
        if (!clientChannels || clientChannels.length === 0) {
            return true;
        }

        return clientChannels.includes(eventChannel);
    }

    emitEvent(channel, payload = {}) {
        return this.publish(channel, payload);
    }

    publish(channel, payload = {}) {
        const normalizedChannel = String(channel || '').trim();
        if (!normalizedChannel) {
            throw new Error('Channel is required');
        }

        const meta = this.ensureChannel(normalizedChannel);
        const event = this.createPersistedEvent(normalizedChannel, payload);

        if (meta) {
            meta.lastEvent = event;
        }

        this.recentEvents.push(event);
        if (this.recentEvents.length > this.maxRecentEvents) {
            this.recentEvents = this.recentEvents.slice(-this.maxRecentEvents);
        }

        this.persistArchive();

        try {
            this.persistence.append(event);
        } catch (error) {
            console.warn('Failed to persist event:', error.message);
        }

        for (const [clientId, client] of this.clients.entries()) {
            if (!this.shouldDeliver(client.channels, normalizedChannel)) {
                continue;
            }

            try {
                client.res.write(`event: ${normalizedChannel}\n`);
                client.res.write(`data: ${JSON.stringify(event)}\n\n`);
            } catch (error) {
                this.emit('hub.error', {
                    stage: 'publish',
                    error: error.message,
                    clientId,
                    channel: normalizedChannel
                });
                this.unsubscribe(clientId);
            }
        }

        this.emit('event', event);
        this.emit(normalizedChannel, event);
        this.emit('broadcast', event);
        return event;
    }

    seedDemoEvents() {
        this.publish('sheikha.command.executed', {
            action: 'SHOW_SYSTEM_STATUS',
            source: 'sheikha-code',
            result: 'success'
        });

        this.publish('orchestrator.mode.changed', {
            mode: 'NORMAL_PRODUCTION',
            activeActions: []
        });

        this.publish('visual.job.completed', {
            jobId: `VIS-${Date.now()}`,
            type: 'image',
            quality: 98
        });

        return this.recent(10);
    }

    benchmarkFio() {
        const mem = process.memoryUsage();
        const benchmark = {
            status: 'completed',
            uptimeSeconds: Number(process.uptime().toFixed(2)),
            memory: {
                rss: mem.rss,
                heapUsed: mem.heapUsed,
                heapTotal: mem.heapTotal
            },
            loadAverage: os.loadavg(),
            cpuCount: os.cpus().length,
            platform: process.platform,
            nodeVersion: process.version
        };

        this.publish('fio.benchmark.completed', benchmark);
        return benchmark;
    }

    getPersistenceStats() {
        return this.persistence.getStats();
    }

    queryPersistence(filters) {
        return this.persistence.query(filters);
    }
}

const sheikhaRealtimeHub = new SheikhaRealtimeHub();

module.exports = sheikhaRealtimeHub;
module.exports.SheikhaRealtimeHub = SheikhaRealtimeHub;
module.exports.sheikhaRealtimeHub = sheikhaRealtimeHub;
