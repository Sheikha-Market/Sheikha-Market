// Auto-discovery لأي منصة جديدة
const fs = require('fs');
const path = require('path');

function autoRegisterAdapters(globalEngine) {
    const adaptersDir = path.join(__dirname, 'adapters');
    fs.readdirSync(adaptersDir).forEach(file => {
        if (file.endsWith('-adapter.js')) {
            const adapter = require(path.join(adaptersDir, file));
            globalEngine.registerAdapter(adapter.name, adapter);
        }
    });
}

module.exports = autoRegisterAdapters;
