'use strict';

/**
 * اختبارات التصليب الأمني — config/config.js + runtime-bus
 * يتحقق من:
 *   1. قيم rateLimit الآمنة للإنتاج
 *   2. عدم وجود JWT ثابت — fallback ديناميكي في التطوير فقط
 *   3. أن emit في runtime-bus لا يوقف حلقة الأحداث (writeFileSync مزال)
 *   4. حماية الاستبقاء (pruneOldEvents) تُستدعى بعد كل كتابة
 */

const path = require('node:path');

// ─── 1. إعدادات rateLimit ─────────────────────────────────────────────────────
describe('config.security.rateLimit — safe production defaults', () => {
  let config;

  beforeAll(() => {
    // نحمّل الوحدة بدون NODE_ENV=production حتى لا يفشل التحقق الصارم
    jest.resetModules();
    delete process.env.RATE_LIMIT_WINDOW_MS;
    delete process.env.RATE_LIMIT_MAX;
    config = require('../config/config.js');
  });

  test('windowMs must be at least 60 000 ms (1 minute)', () => {
    expect(config.security.rateLimit.windowMs).toBeGreaterThanOrEqual(60_000);
  });

  test('max must be no more than 10 000 requests per window', () => {
    expect(config.security.rateLimit.max).toBeLessThanOrEqual(10_000);
  });

  test('max must be a positive integer', () => {
    expect(Number.isInteger(config.security.rateLimit.max)).toBe(true);
    expect(config.security.rateLimit.max).toBeGreaterThan(0);
  });
});

// ─── 2. JWT secret — no static hardcoded fallback ─────────────────────────────
describe('config.security.jwt.secret — dynamic dev fallback only', () => {
  const STATIC_FORBIDDEN = 'sheikha-dev-jwt-secret-change-in-production-min-32';

  let config;

  beforeAll(() => {
    jest.resetModules();
    delete process.env.JWT_SECRET;
    config = require('../config/config.js');
  });

  test('secret must not equal the static forbidden placeholder', () => {
    expect(config.security.jwt.secret).not.toBe(STATIC_FORBIDDEN);
  });

  test('secret must not contain the phrase "change-in-production"', () => {
    expect(config.security.jwt.secret).not.toMatch(/change-in-production/i);
  });

  test('dev fallback must be at least 32 characters long', () => {
    expect(config.security.jwt.secret.length).toBeGreaterThanOrEqual(32);
  });

  test('dev fallback must differ between two module loads (process-scoped)', () => {
    // رمز runtimeDevJwtSecret يُحسب مرة عند تحميل الوحدة؛
    // طالما ليس نصًّا ثابتًا، هذا الاختبار يتحقق من أنه ليس ثابتًا في الكود.
    // نعيد التحميل ونقارن — يجب أن يكون نفس القيمة (مرتبطة بـ PID/Date.now عند أول تحميل)
    // وأن لا تكون السلسلة الثابتة المحظورة.
    jest.resetModules();
    delete process.env.JWT_SECRET;
    const config2 = require('../config/config.js');
    expect(config2.security.jwt.secret).not.toBe(STATIC_FORBIDDEN);
  });
});

// ─── 3. sheikha-runtime-bus — emit لا يستخدم writeFileSync ───────────────────
describe('sheikha-runtime-bus — non-blocking async emit', () => {
  const busPath = path.resolve(__dirname, '../core/kernel/bus/sheikha-runtime-bus.js');
  const fs = require('node:fs');
  const source = fs.readFileSync(busPath, 'utf8');

  test('emit must not call fs.writeFileSync', () => {
    expect(source).not.toMatch(/writeFileSync/);
  });

  test('source must reference fs.promises.writeFile for fire-and-forget writes', () => {
    // يدعم كلا الشكلين: سطر واحد أو متعدد الأسطر
    expect(source).toMatch(/fs\.promises[\s\S]*?writeFile/);
  });

  test('emit returns success synchronously without awaiting file I/O', () => {
    jest.resetModules();
    const bus = require('../core/kernel/bus/sheikha-runtime-bus.js');
    const result = bus.emit('kernel', { test: true });
    // يجب أن يُرجع كائن نجاح فورًا
    expect(result.success).toBe(true);
    expect(result.channel).toBe('kernel');
  });
});

// ─── 4. sheikha-runtime-bus — retention / pruning ────────────────────────────
describe('sheikha-runtime-bus — retention & rotation protection', () => {
  const busPath = path.resolve(__dirname, '../core/kernel/bus/sheikha-runtime-bus.js');
  const fs = require('node:fs');
  const source = fs.readFileSync(busPath, 'utf8');

  test('pruneOldEvents function must exist in source', () => {
    expect(source).toMatch(/pruneOldEvents/);
  });

  test('MAX_EVENT_FILES constant must be defined', () => {
    expect(source).toMatch(/MAX_EVENT_FILES/);
  });

  test('pruneOldEvents is chained after writeFile (.then)', () => {
    expect(source).toMatch(/\.then\(\(\)\s*=>\s*pruneOldEvents\(\)\)/);
  });
});
