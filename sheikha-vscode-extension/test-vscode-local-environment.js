'use strict';

const { readLocalVsCodeEnvironment } = require('./src/sheikhaApiClient');

console.log(JSON.stringify(readLocalVsCodeEnvironment(), null, 2));
