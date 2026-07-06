'use strict';

const fastpath = require('../runtime/local-coding-fastpath/v1/sheikha-local-coding-fastpath-v1');

describe('Sheikha Local Coding FastPath V1', () => {
  test('detects coding requests before inspector templates', () => {
    expect(fastpath.isCodingRequest('برمج لي route جديد')).toBe(true);
    expect(fastpath.isCodingRequest('اكتب تقرير عام')).toBe(false);
  });

  test('builds action-first coding prompt', () => {
    const prompt = fastpath.buildPrompt('برمج route');
    expect(prompt).toContain('ابدأ بالبرمجة مباشرة');
    expect(prompt).toContain('بدون تقرير مفتش');
    expect(prompt).toContain('لا تحذف ملفات');
  });
});
