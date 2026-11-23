/**
 * واجهة توافقية بالاسم المطلوب: sheikha_universal_master.js
 */

const master = require('./sheikha-universal-master');

if (require.main === module) {
    master.launch().catch(error => {
        console.error('❌ فشل تشغيل السكربت الموحد:', error.message);
        process.exitCode = 1;
    });
}

module.exports = master;
