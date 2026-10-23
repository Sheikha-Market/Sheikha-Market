'use strict';

const {
  buildInventory,
  classifyLicense,
  parseOllamaList
} = require('../runtime/sheikha-ai-governor/v1/sheikha-model-inventory-v1');

describe('Sheikha model inventory V1', () => {
  test('parses installed model metadata', () => {
    const models = parseOllamaList([
      'NAME             ID              SIZE      MODIFIED',
      'qwen:7b          abc123          4.7 GB    2 months ago',
      ''
    ].join('\n'));
    expect(models).toEqual([{ name: 'qwen:7b', digest: 'abc123', size: '4.7 GB', modified: '2 months ago' }]);
  });

  test('uses captured license text rather than model-name assumptions', () => {
    expect(classifyLicense('Apache License Version 2.0', 'qwen:7b').id).toBe('Apache-2.0');
    expect(classifyLicense('', 'qwen:7b').state).toBe('UNKNOWN');
  });

  test('never establishes ownership from the Sheikha brand name', () => {
    expect(classifyLicense('', 'Sheikha-Core:latest')).toEqual({id: 'UNKNOWN', state: 'UNKNOWN', commercialUse: false});
  });

  test('does not discard restrictive terms in mixed license text', () => {
    const license = classifyLicense('MIT License\nLlama 3.1 Community License', 'Sheikha-Core:latest');
    expect(license.state).toBe('MULTIPLE_LICENSES_REVIEW_REQUIRED');
    expect(license.commercialUse).toBe(false);
  });

  test('quarantines a branded model whose license cannot be read', () => {
    const run = args => {
      if (args[0] === 'list') return 'NAME  ID  SIZE  MODIFIED\nSheikha-Core:latest  abc  1 GB  today\n';
      throw new Error('TEST_LICENSE_READ_FAILED');
    };
    expect(buildInventory({run}).models[0].governorState).toBe('QUARANTINED_PENDING_REVIEW');
  });

  test('keeps automatic updates in plan-only mode', () => {
    const run = jest.fn((args) => {
      if (args[0] === 'list') {
        return 'NAME  ID  SIZE  MODIFIED\nmodel:1  abc  1 GB  today\n';
      }
      return 'MIT License';
    });
    const inventory = buildInventory({ run });
    expect(inventory.summary.discovered).toBe(1);
    expect(inventory.models[0].license.id).toBe('MIT');
    expect(inventory.renewal.automaticPullAllowed).toBe(false);
    expect(inventory.renewal.silentProductionReplacementAllowed).toBe(false);
  });
});
