'use strict';

const fs = require('fs');

describe('Sheikha Final Discovery V1', () => {
  test('activation script exists', () => {
    expect(fs.existsSync('tools/activation/activate-sheikha-final-discovery-v1.js')).toBe(true);
  });

  test('project root essentials exist', () => {
    expect(fs.existsSync('package.json')).toBe(true);
    expect(fs.existsSync('server.js')).toBe(true);
  });
});
