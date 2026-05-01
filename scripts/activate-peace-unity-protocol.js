const path = require('path');
const PeaceUnityProtocol = require('../lib/peace-unity-protocol');

function runActivation() {
    const protocol = new PeaceUnityProtocol({
        owner: 'Salman Ahmed Al-Rajih',
        commandEmail: 'market@sheikha.top'
    });

    const projectRoot = path.resolve(__dirname, '..');
    const result = protocol.persistPackage(projectRoot);
    const covenant = protocol.persistAllianceSafetyCovenant(projectRoot);

    console.log('✅ تم تفعيل بروتوكول الأمان والوحدة داخليًا بنجاح.');
    console.log(`📄 ملف التفعيل: ${result.filePath}`);
    console.log(`🆔 معرف البروتوكول: ${result.protocolId}`);
    console.log('✅ تم تفعيل ميثاق الأمان والتحالف (بدون تعصب قبلي).');
    console.log(`📄 ملف الميثاق: ${covenant.filePath}`);
    console.log(`🆔 معرف الميثاق: ${covenant.covenantId}`);
}

runActivation();
