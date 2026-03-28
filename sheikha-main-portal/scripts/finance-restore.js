const SheikhaFinanceEngine = require('../lib/sheikha-finance-engine');

const financeEngine = new SheikhaFinanceEngine();
const fileArg = process.argv.find(arg => arg.startsWith('--file='));
const latestArg = process.argv.includes('--latest');

let fileName = fileArg ? fileArg.split('=')[1] : null;

if (!fileName && latestArg) {
    const backups = financeEngine.listBackups();
    fileName = backups[0] ? backups[0].fileName : null;
}

if (!fileName) {
    console.error(
        JSON.stringify(
            {
                success: false,
                data: null,
                message: 'يرجى تمرير --file=<name> أو --latest',
                timestamp: new Date().toISOString()
            },
            null,
            4
        )
    );
    process.exit(1);
}

const result = financeEngine.restoreBackup(fileName);

console.log(
    JSON.stringify(
        {
            success: true,
            data: result,
            message: 'تمت استعادة السجل المالي',
            timestamp: new Date().toISOString()
        },
        null,
        4
    )
);
