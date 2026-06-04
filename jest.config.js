module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/core/**/*.test.js',
    '<rootDir>/sheikha-vscode-extension/tests/**/*.test.js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/archive/',
    '/infra/docker/compose/prod/',
    '/Sheikha-Market/',
    '/.venv/',
    '/exports/',
    '/reports/'
  ],
  modulePathIgnorePatterns: [
    '<rootDir>/dist',
    '<rootDir>/archive',
    '<rootDir>/infra/docker/compose/prod',
    '<rootDir>/Sheikha-Market',
    '<rootDir>/.venv',
    '<rootDir>/exports',
    '<rootDir>/reports'
  ]
};
