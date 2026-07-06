// Kernel Providers
// نقطة ربط النواة مع طبقة المزودات

const { resolveProvider } = require('../../../providers');

function getActiveProvider(preferred) {
    return resolveProvider(preferred);
}

module.exports = { getActiveProvider };
