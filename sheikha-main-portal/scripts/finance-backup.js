const SheikhaFinanceEngine = require('../lib/sheikha-finance-engine');

const financeEngine = new SheikhaFinanceEngine();
const labelArg = process.argv.find(arg => arg.startsWith('--label='));
const label = labelArg ? labelArg.split('=')[1] : 'manual';
const backup = financeEngine.createBackup(label);

console.log(
    JSON.stringify(
        {
            success: true,
            data: backup,
            message: 'تم إنشاء نسخة احتياطية مالية محلية',
            timestamp: new Date().toISOString()
        },
        null,
        4
    )
);
