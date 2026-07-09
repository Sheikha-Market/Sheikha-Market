const js = require('@eslint/js');

const nodeGlobals = {
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
  setImmediate: 'readonly',
  clearImmediate: 'readonly',
  global: 'readonly',
  URL: 'readonly',
  URLSearchParams: 'readonly',
  AbortController: 'readonly',
  fetch: 'readonly',
  TextEncoder: 'readonly',
  TextDecoder: 'readonly'
};

const browserGlobals = {
  window: 'readonly',
  document: 'readonly',
  navigator: 'readonly',
  location: 'readonly',
  localStorage: 'readonly',
  sessionStorage: 'readonly',
  requestAnimationFrame: 'readonly',
  cancelAnimationFrame: 'readonly',
  performance: 'readonly',
  CustomEvent: 'readonly',
  XMLHttpRequest: 'readonly',
  WebSocket: 'readonly',
  SpeechSynthesisUtterance: 'readonly',
  alert: 'readonly',
  prompt: 'readonly',
  atob: 'readonly',
  btoa: 'readonly',
  Blob: 'readonly',
  FileReader: 'readonly',
  Response: 'readonly',
  Request: 'readonly',
  Headers: 'readonly',
  fetch: 'readonly',
  URL: 'readonly',
  URLSearchParams: 'readonly',
  AbortController: 'readonly',
  screen: 'readonly'
};

const serviceWorkerGlobals = {
  self: 'readonly',
  clients: 'readonly',
  caches: 'readonly',
  FetchEvent: 'readonly',
  ExtendableEvent: 'readonly',
  Response: 'readonly',
  Request: 'readonly',
  Headers: 'readonly',
  URL: 'readonly',
  URLSearchParams: 'readonly',
  fetch: 'readonly',
  AbortController: 'readonly'
};

const jestGlobals = {
  afterAll: 'readonly',
  afterEach: 'readonly',
  beforeAll: 'readonly',
  beforeEach: 'readonly',
  describe: 'readonly',
  expect: 'readonly',
  jest: 'readonly',
  test: 'readonly'
};

module.exports = [
  {
    ignores: [
      'node_modules/**',
      '.venv/**',
      'infra/**',
      'data/**',
      'public/**',
      'reports/**',
      'coverage/**',
      'dist/**',
      'build/**',
      'exports/**',
      'infra/docker/compose/prod/**',
      'Sheikha-Market/**',
      'sheikha-main-portal/**',
      'SHEIKHA-ETHICS-ACTIVATION-REPORT.js',
      'lib/sheikha-*.js',
      'lib/*engine*.js',
      'lib/*ecosystem*.js',
      'lib/*network*.js',
      'lib/*empire*.js',
      'lib/*islamic*.js',
      'lib/*cosmic*.js',
      'lib/*digital*.js',
      'lib/sheikha-dynamic-execution-planner.js',
      'lib/sheikha-ide-collaboration-system.js',
      'lib/sheikha-ihsan-itqan-quran-engine.js',
      'lib/sheikha-llm-neural-layer.js',
      'routes/ai.js',
      '**/*.backup*',
      '**/*.broken*',
      '**/*.clean',
      '**/*.save',
      '**/*.save.*'
    ]
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,cjs,mjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: nodeGlobals
    },
    rules: {
      'no-unused-vars': 'off',
      'no-empty': 'off',
      'no-useless-escape': 'off',
      'no-useless-assignment': 'off',
      'no-case-declarations': 'off',
      'no-undef': 'warn',
      'no-dupe-keys': 'warn',
      'no-dupe-class-members': 'warn',
      'no-prototype-builtins': 'warn',
      'no-control-regex': 'warn',
      'no-irregular-whitespace': 'warn',
      'no-constant-condition': 'warn',
      'no-constant-binary-expression': 'warn',
      'no-extra-boolean-cast': 'warn',
      'no-self-assign': 'warn',
      'no-misleading-character-class': 'warn'
    }
  },
  {
    files: ['**/*.mjs'],
    languageOptions: {
      sourceType: 'module'
    }
  },
  {
    files: ['server.js'],
    rules: {
      'no-undef': 'off',
      'no-dupe-keys': 'off'
    }
  },
  {
    files: ['public/**/*.js', 'public/**/*.mjs'],
    languageOptions: {
      globals: {
        ...nodeGlobals,
        ...browserGlobals
      }
    }
  },
  {
    files: ['public/sw.js', '**/public/sw.js'],
    languageOptions: {
      globals: {
        ...nodeGlobals,
        ...serviceWorkerGlobals
      }
    }
  },
  {
    files: ['**/*.test.js', 'tests/**/*.js'],
    languageOptions: {
      globals: {
        ...nodeGlobals,
        ...jestGlobals
      }
    }
  }
];