const js = require('@eslint/js');

module.exports = [
    js.configs.recommended,
    {
        ignores: [
            'node_modules/**',
            'coverage/**',
            'dist/**'
        ]
    },
    {
        files: ['**/*.{js,cjs,mjs}'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'commonjs',
            globals: {
                require: 'readonly',
                module: 'readonly',
                exports: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                process: 'readonly',
                console: 'readonly',
                Buffer: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
                global: 'readonly'
            }
        }
    }
];