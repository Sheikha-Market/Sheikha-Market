'use strict';

const fabric = require('../runtime/chat-fabric-v2/sheikha-chat-fabric-v2');

describe('Sheikha Chat Fabric V2', () => {
  test('activates governed advanced chat stack', () => {
    const status = fabric.status();
    expect(status.status).toBe('ACTIVE');
    expect(status.decision).toBe('CHAT_FABRIC_V2_ACTIVE_100');
    expect(status.apexStack).toContain('SHEIKHA_TECHNICAL_CAPABILITY_APEX_V1');
    expect(status.apexStack).toContain('SHEIKHA_IDE_APEX_V1');
    expect(status.apexStack).toContain('SHEIKHA_DEBUGGING_APEX_V1');
    expect(status.governance.noVisibleRawJson).toBe(true);
    expect(status.governance.debuggingExplicitOnly).toBe(true);
  });

  test('classifies typo report and code requests safely', () => {
    expect(fabric.classifyMessage('اكتبي تثرير')).toBe('PROFESSIONAL_REPORT');
    expect(fabric.classifyMessage('اصلح Todo Tree ripgrep')).toBe('IDE_CODE_ASSIST');
    expect(fabric.classifyMessage('شخص الخطأ')).toBe('DEBUGGING_ON_DEMAND');
  });

  test('renders clean response without raw streaming markers', () => {
    const out = fabric.renderCleanResponse({ text: 'data: ## تقرير\n\nproxy_non_json_response' });
    expect(out.visibleRawJson).toBe(false);
    expect(out.text).toContain('## تقرير');
    expect(out.text).not.toContain('data:');
  });
});
