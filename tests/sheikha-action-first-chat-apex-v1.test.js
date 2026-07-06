'use strict';

const apex = require('../runtime/action-first-chat-apex/v1/sheikha-action-first-chat-apex-v1');

describe('Sheikha Action First Chat Apex V1', () => {
  test('routes commands to real work modes instead of generic replies', () => {
    expect(apex.classify('برمج API جديد')).toBe('CODING_MODE');
    expect(apex.classify('اكتب تقرير')).toBe('WRITING_MODE');
    expect(apex.classify('حلل حالة المشروع')).toBe('ANALYSIS_MODE');
    expect(apex.classify('فكر في أفضل حل')).toBe('THINKING_MODE');
  });

  test('blocks generic template first response', () => {
    const p = apex.actionPolicy('اصلح الشات');
    expect(p.rules.noGenericTemplateFirst).toBe(true);
    expect(p.rules.startWithWorkImmediately).toBe(true);
    expect(p.rules.noRepeatedGreeting).toBe(true);
  });
});
