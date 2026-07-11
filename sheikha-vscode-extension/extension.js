'use strict';

// Keep one activation entrypoint. All commands, chat, and inspector providers
// are registered by the governed implementation under src/.
module.exports = require('./src/extension');
