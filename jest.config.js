module.exports = {
    testEnvironment: 'node',
    testPathIgnorePatterns: [
        '/node_modules/',
        '/sheikha-language/compiler/tests/',
        '/core/integration/tests/',
        '/tests/pixel-system.test.js',
        '/tests/pixel-ecosystem-integration.test.js'
    ],
    passWithNoTests: true
};