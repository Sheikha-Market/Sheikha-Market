'use strict';

const { scanEnvironment } = require('./src/sheikhaApiClient');

(async () => {
  const env = await scanEnvironment();
  console.log(JSON.stringify(env, null, 2));
})();
