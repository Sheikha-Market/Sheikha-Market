'use strict';
const production = require('../../core/foundation/sheikha-language-production-v1.cjs');
const result = production.build();
if (process.argv[2] === '--write') console.log(JSON.stringify(production.writeBuild(result)));
else console.log(JSON.stringify({ ...result.manifest, mode: 'IN_MEMORY_VERIFICATION_ONLY' }));
