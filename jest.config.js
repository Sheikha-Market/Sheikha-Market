module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/core/**/*.test.js',
    '<rootDir>/sheikha-vscode-extension/tests/**/*.test.js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/backups/',
    '/dist/',
    '/archive/',
    '/infra/docker/compose/prod/',
    '/Sheikha-Market/',
    '/.venv/',
    '/exports/',
    '/reports/',
    '/core/integration/tests/',
    '/tests/pixel-system.test.js',
    '/tests/pixel-ecosystem-integration.test.js',
    // These suites use Node's built-in test runner and are executed by test:node.
    '/tests/sheikha-(?:commercial-revenue-closure|commercial-sales-service|commercial-server-mount|foundational-charter-and-activation-inventory|installer-distribution-governance|integrative-awareness-fabric|license-recognition|linux-x64-delegate-output-side-effect-gap-closure|linux-x64-product-build-gap-closure|native-installer-build-execution|production-change-admission-gate|production-change-admission-http-entrypoint|production-risk-to-safe-governance|production-risk-to-safe-http-entrypoint|reference-encyclopedia-policy-governance)-v1\.test\.js$'
  ],
  modulePathIgnorePatterns: [
    '<rootDir>/dist',
    '<rootDir>/backups',
    '<rootDir>/archive',
    '<rootDir>/infra/docker/compose/prod',
    '<rootDir>/Sheikha-Market',
    '<rootDir>/.venv',
    '<rootDir>/exports',
    '<rootDir>/reports'
  ],
  passWithNoTests: true
};
