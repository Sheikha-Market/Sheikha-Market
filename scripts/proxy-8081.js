#!/usr/bin/env node
/**
 * Sheikha Port Proxy — container:8082 → container:8080
 * يتيح الوصول من local:8082 إلى الخادم الرئيسي على 8080
 * ملاحظة: المنفذ 8081 محجوز لخلية MARKETPLACE في الشبكة العصبية
 */
const http = require('http');

const PROXY_PORT = 8082;
const TARGET_PORT = 8080;
const TARGET_HOST = 'localhost';

const proxy = http.createServer((req, res) => {
    const options = {
        hostname: TARGET_HOST,
        port: TARGET_PORT,
        path: req.url,
        method: req.method,
        headers: req.headers
    };

    const proxyReq = http.request(options, proxyRes => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', err => {
        res.writeHead(502);
        res.end(JSON.stringify({ error: 'proxy_error', message: err.message }));
    });

    req.pipe(proxyReq, { end: true });
});

proxy.listen(PROXY_PORT, () => {
    console.log(`✅ Sheikha Proxy: container:${PROXY_PORT} → container:${TARGET_PORT}`);
    console.log(`   من جهازك المحلي: http://localhost:${PROXY_PORT}/api/sovereign/status`);
});
