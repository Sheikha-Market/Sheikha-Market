'use strict';

const {
  buildEnterpriseShellState,
  transformTechnicalResultToHuman
} = require('../core/ui-shell/sheikha-enterprise-ui-shell-v1');

describe('Sheikha Enterprise UI Shell V1', () => {
  test('builds unified RTL enterprise shell', () => {
    const shell = buildEnterpriseShellState();

    expect(shell.system).toBe('SHEIKHA_ENTERPRISE_UI_SHELL_V1');
    expect(shell.status).toBe('ACTIVE');
    expect(shell.direction).toBe('rtl');
    expect(shell.layout.unifiedNavigation).toBe(true);
    expect(shell.layout.contextualAssistant).toBe(true);
  });

  test('converts technical JSON into human-first summary', () => {
    const view = transformTechnicalResultToHuman({
      payload: {
        data: {
          name: 'Copper Cable',
          category: 'metals',
          status: 'APPROVED',
          quality: { score: 88 },
          risk: { level: 'LOW' },
          price: { amount: 25, currency: 'SAR' }
        }
      }
    });

    expect(view.summary.title).toBe('Copper Cable');
    expect(view.summary.price).toBe('25 SAR');
    expect(view.safety.hideJsonByDefault).toBe(true);
  });
});
