'use strict';

const fs = require('fs');

describe('Sheikha Full Activation CLI V1', () => {
  test('CLI exists', () => {
    expect(fs.existsSync('tools/cli/sheikha-full-activation-cli.js')).toBe(true);
  });

  test('core activation evidence scripts exist', () => {
    expect(fs.existsSync('tools/activation/activate-sheikha-islamic-ai-kernel-v1.js')).toBe(true);
    expect(fs.existsSync('tools/activation/activate-sheikha-language-integration-v1.js')).toBe(true);
  });
});
