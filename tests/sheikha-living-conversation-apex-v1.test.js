'use strict';

const living = require('../runtime/living-conversation-apex/v1/sheikha-living-conversation-apex-v1');

describe('Sheikha Living Conversation Apex V1', () => {
  test('keeps metaphorical vitality with governance boundaries', () => {
    const s = living.sense('اصلح الشات');
    expect(s.status).toBe('ACTIVE');
    expect(s.intent).toBe('ACTION_OR_REPAIR_REQUEST');
    expect(s.responsePolicy.repeatGreeting).toBe(false);
    expect(s.responsePolicy.hideInspectorByDefault).toBe(true);
    expect(s.responsePolicy.noHighImpactExecutionWithoutApproval).toBe(true);
  });

  test('inspector appears only when explicitly requested', () => {
    expect(living.sense('حلل حالة المنظومة من Enterprise Inspector').intent).toBe('INSPECTOR_REQUEST');
    expect(living.sense('اكتب تقرير وعرفني بنفسك').intent).toBe('REPORT_REQUEST');
  });
});
