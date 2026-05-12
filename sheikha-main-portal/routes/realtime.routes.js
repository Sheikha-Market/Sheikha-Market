'use strict';

const express = require('express');
const router = express.Router();
const hub = require('../lib/sheikha-realtime-hub');

const ok = (res, data, message = 'نجح', code = 200) =>
    res.status(code).json({ success: true, data, message, timestamp: new Date().toISOString() });

const err = (res, message, code = 400) =>
    res.status(code).json({ success: false, message, timestamp: new Date().toISOString() });

router.get('/health', (_req, res) => {
    return ok(res, hub.status(), 'حالة البث الحي');
});

router.get('/channels', (_req, res) => {
    return ok(res, {
        channels: hub.getChannels(),
        clients: hub.getClientCount()
    }, 'قنوات البث الحي');
});

router.get('/events', (req, res) => {
    const channels = String(req.query.channels || '')
        .split(',')
        .map((channel) => channel.trim())
        .filter(Boolean);

    const clientId = hub.subscribeSse(res, channels);

    req.on('close', () => {
        hub.unsubscribe(clientId);
    });
});

router.get('/stream', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no'
    });

    const writeEvent = (payload) => {
        res.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    writeEvent({
        type: 'system.ready',
        channel: 'system.ready',
        payload: {
            message: 'Realtime stream connected'
        },
        timestamp: new Date().toISOString()
    });

    const heartbeat = setInterval(() => {
        writeEvent({
            type: 'heartbeat',
            channel: 'system.ping',
            payload: {
                t: Date.now()
            },
            timestamp: new Date().toISOString()
        });
    }, 5000);

    const unsubscribe = hub.subscribeBroadcast((event) => {
        writeEvent({
            type: event.channel,
            channel: event.channel,
            payload: event.payload || {},
            timestamp: event.timestamp || new Date().toISOString(),
            id: event.id
        });
    });

    req.on('close', () => {
        clearInterval(heartbeat);
        unsubscribe();
        res.end();
    });
});

router.get('/recent', (req, res) => {
    const limit = Number(req.query.limit || 20);
    return ok(res, hub.recent(limit), 'آخر الأحداث');
});

router.get('/archive', (req, res) => {
    const limit = Number(req.query.limit || 100);
    return ok(res, hub.archive(limit), 'أرشيف الأحداث');
});

router.post('/emit', (req, res) => {
    const { channel, payload = {} } = req.body || {};
    if (!channel) {
        return err(res, 'اسم القناة مطلوب');
    }

    const event = hub.publish(channel, payload);
    return ok(res, event, 'تم نشر الحدث', 202);
});

router.post('/seed', (_req, res) => {
    return ok(res, hub.seedDemoEvents(), 'تمت زراعة أحداث تجريبية');
});

router.post('/benchmark/fio', (_req, res) => {
    return ok(res, hub.benchmarkFio(), 'تم تنفيذ benchmark');
});

module.exports = router;
