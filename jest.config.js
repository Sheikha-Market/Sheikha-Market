module.exports = {
    testEnvironment: 'node',
    testPathIgnorePatterns: [
        '/node_modules/',
        '/dist/',
        '/archive/',
        '/infra/docker/compose/prod/',
        '/Sheikha-Market/',
        '/.venv/',
        '/sheikha-language/compiler/tests/',
        '/core/integration/tests/',
        '/tests/pixel-system.test.js',
        '/tests/pixel-ecosystem-integration.test.js'
    ],
    modulePathIgnorePatterns: [
        '<rootDir>/dist',
        '<rootDir>/archive',
        '<rootDir>/infra/docker/compose/prod',
        '<rootDir>/Sheikha-Market',
        '<rootDir>/.venv'
    ],
    passWithNoTests: true
};
