'use strict';

const http = require('node:http');
const crypto = require('node:crypto');

const HOST = process.env.SHEIKHA_COMMERCIAL_GATEWAY_HOST || '127.0.0.1';
const PORT = Number(process.env.SHEIKHA_COMMERCIAL_GATEWAY_PORT || 8083);
const BACKEND_HOST = '127.0.0.1';
const BACKEND_PORT = Number(process.env.SHEIKHA_CHAT_BACKEND_PORT || 8080);
const MAX_BODY_BYTES = Number(process.env.SHEIKHA_GATEWAY_MAX_BODY_BYTES || 64 * 1024);
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = Number(process.env.SHEIKHA_GATEWAY_RATE_MAX || 30);
const buckets = new Map();

function securityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
}

function json(res, statusCode, body) {
  securityHeaders(res);
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(`${JSON.stringify(body)}\n`);
}

function allowRequest(address) {
  const now = Date.now();
  const bucket = buckets.get(address) || { startedAt: now, count: 0 };
  if (now - bucket.startedAt >= RATE_WINDOW_MS) {
    bucket.startedAt = now;
    bucket.count = 0;
  }
  bucket.count += 1;
  buckets.set(address, bucket);
  return bucket.count <= RATE_MAX;
}

function proxyChat(req, res) {
  const declaredLength = Number(req.headers['content-length'] || 0);
  if (declaredLength > MAX_BODY_BYTES) {
    json(res, 413, { success: false, error: 'PAYLOAD_TOO_LARGE' });
    req.resume();
    return;
  }

  let received = 0;
  const chunks = [];
  req.on('data', (chunk) => {
    received += chunk.length;
    if (received > MAX_BODY_BYTES) {
      req.destroy(new Error('PAYLOAD_TOO_LARGE'));
      return;
    }
    chunks.push(chunk);
  });
  req.on('error', (error) => {
    if (!res.headersSent) {
      json(res, error.message === 'PAYLOAD_TOO_LARGE' ? 413 : 400, {
        success: false,
        error: error.message
      });
    }
  });
  req.on('end', () => {
    const body = Buffer.concat(chunks);
    try {
      const parsed = JSON.parse(body.toString('utf8'));
      if (typeof parsed.message !== 'string' || parsed.message.length > 16_000) {
        json(res, 422, { success: false, error: 'INVALID_MESSAGE' });
        return;
      }
    } catch {
      json(res, 400, { success: false, error: 'INVALID_JSON' });
      return;
    }

    const upstream = http.request({
      hostname: BACKEND_HOST,
      port: BACKEND_PORT,
      path: '/api/sheikha/live/chat/v1',
      method: 'POST',
      headers: {
        accept: 'text/event-stream',
        'content-type': 'application/json',
        'content-length': body.length,
        'x-sheikha-gateway-request-id': crypto.randomUUID()
      },
      timeout: 95_000
    }, (upstreamRes) => {
      securityHeaders(res);
      res.writeHead(upstreamRes.statusCode || 502, {
        'Content-Type': String(upstreamRes.headers['content-type'] || 'text/event-stream'),
        'X-Accel-Buffering': 'no'
      });
      upstreamRes.pipe(res);
    });
    upstream.on('timeout', () => upstream.destroy(new Error('UPSTREAM_TIMEOUT')));
    upstream.on('error', () => {
      if (!res.headersSent) json(res, 502, { success: false, error: 'UPSTREAM_UNAVAILABLE' });
      else res.end();
    });
    upstream.end(body);
  });
}

const server = http.createServer((req, res) => {
  const forwardedFor = String(req.headers['x-forwarded-for'] || '')
    .split(',')[0]
    .trim();
  const address = forwardedFor || req.socket.remoteAddress || 'unknown';
  if (!allowRequest(address)) {
    json(res, 429, { success: false, error: 'RATE_LIMITED' });
    return;
  }
  if (req.method === 'GET' && req.url === '/health') {
    json(res, 200, {
      success: true,
      status: 'ok',
      system: 'SHEIKHA_COMMERCIAL_CHAT_GATEWAY_V1'
    });
    return;
  }
  if (req.method === 'POST' && req.url === '/api/sheikha/live/chat/v1') {
    proxyChat(req, res);
    return;
  }
  json(res, 404, { success: false, error: 'ROUTE_NOT_ALLOWED' });
});

server.on('upgrade', (_req, socket) => socket.destroy());
server.requestTimeout = 100_000;
server.headersTimeout = 10_000;
server.listen(PORT, HOST, () => {
  process.stdout.write(`SHEIKHA_COMMERCIAL_CHAT_GATEWAY_READY=${HOST}:${PORT}\n`);
});
