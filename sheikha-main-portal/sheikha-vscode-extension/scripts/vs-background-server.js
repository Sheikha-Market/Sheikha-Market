#!/usr/bin/env node

const http = require('node:http');

function readArg(name, fallback) {
    const prefix = `--${name}=`;
    const found = process.argv.find(item => item.startsWith(prefix));
    if (!found) {
        return fallback;
    }
    return found.slice(prefix.length);
}

const tier = String(readArg('tier', 'professional')).toLowerCase();
const port = Number(readArg('port', tier === 'enterprise' ? 48481 : 48480));
const host = readArg('host', '127.0.0.1');

if (!Number.isInteger(port) || port <= 0) {
    console.error(`[Sheikha VS Background] invalid port: ${port}`);
    process.exit(1);
}

const startedAt = new Date().toISOString();

const server = http.createServer((req, res) => {
    const payload = {
        success: true,
        data: {
            product: `Visual Studio ${tier === 'enterprise' ? 'Enterprise' : 'Professional'}`,
            tier,
            host,
            port,
            status: 'active',
            startedAt,
            pid: process.pid
        },
        message: 'Sheikha Visual Studio background server is active',
        timestamp: new Date().toISOString()
    };

    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(payload));
});

server.listen(port, host, () => {
    console.log(`[Sheikha VS Background] ${tier} server active on http://${host}:${port}`);
});

function shutdown(signal) {
    console.log(`[Sheikha VS Background] ${tier} server shutting down on ${signal}`);
    server.close(() => process.exit(0));
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
