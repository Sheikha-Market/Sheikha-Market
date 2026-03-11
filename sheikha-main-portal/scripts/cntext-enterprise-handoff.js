#!/usr/bin/env node
const fs = require('fs').promises;
const path = require('path');

async function main() {
    const payload = {
        timestamp: new Date().toISOString(),
        organizationId: '224557279528',
        projects: {
            production: 'sheikha-empire',
            development: 'sheikha-core',
            testing: 'sheikha-test'
        },
        operatorPrincipal: 'user:market@sheikha.top',
        requestedBy: {
            name: 'Salman Ahmed Al-Rajih',
            email: 'market@sheikha.top'
        },
        requestedActions: [
            'Link sheikha-empire to institutional billing account (no personal card)',
            'Enable required Google Cloud APIs for production and development',
            'Grant operator IAM roles to user:market@sheikha.top',
            'Confirm org-level policy alignment and regional constraints',
            'Provide activation confirmation and support case reference'
        ],
        requiredApis: [
            'aiplatform.googleapis.com',
            'run.googleapis.com',
            'bigquery.googleapis.com',
            'storage.googleapis.com',
            'cloudfunctions.googleapis.com',
            'monitoring.googleapis.com',
            'iam.googleapis.com',
            'serviceusage.googleapis.com'
        ],
        operatorRoles: [
            'roles/viewer',
            'roles/serviceusage.serviceUsageAdmin',
            'roles/run.admin',
            'roles/aiplatform.user',
            'roles/bigquery.jobUser',
            'roles/storage.objectAdmin',
            'roles/cloudfunctions.developer'
        ],
        compliance: {
            noHarm: true,
            leastPrivilege: true,
            transparency: true,
            auditability: true
        }
    };

    const jsonPath = path.join(process.cwd(), 'CNTXT-ENTERPRISE-ACTIVATION-REQUEST.json');
    const mdPath = path.join(process.cwd(), 'CNTXT-ENTERPRISE-ACTIVATION-REQUEST.md');

    const message = `# CNTXT Enterprise Activation Request\n\n- Date: ${payload.timestamp}\n- Requester: ${payload.requestedBy.name} (${payload.requestedBy.email})\n- Organization: ${payload.organizationId}\n\n## Request\nPlease activate institutional Google Cloud setup for Sheikha with no personal card requirement.\n\n## Projects\n- Production: ${payload.projects.production}\n- Development: ${payload.projects.development}\n- Testing: ${payload.projects.testing}\n\n## Required Actions\n${payload.requestedActions.map(item => `- ${item}`).join('\n')}\n\n## Required APIs\n${payload.requiredApis.map(api => `- ${api}`).join('\n')}\n\n## Operator Principal\n- ${payload.operatorPrincipal}\n\n## Operator IAM Roles\n${payload.operatorRoles.map(role => `- ${role}`).join('\n')}\n\n## Compliance Controls\n- No Harm: ${payload.compliance.noHarm ? 'Enabled' : 'Disabled'}\n- Least Privilege: ${payload.compliance.leastPrivilege ? 'Enabled' : 'Disabled'}\n- Transparency: ${payload.compliance.transparency ? 'Enabled' : 'Disabled'}\n- Auditability: ${payload.compliance.auditability ? 'Enabled' : 'Disabled'}\n\n## Acceptance Criteria\n- sheikha-empire linked to institutional billing account\n- APIs enabled on production and development projects\n- IAM roles applied to operator principal\n- Written confirmation with support case ID\n`;

    await fs.writeFile(jsonPath, JSON.stringify(payload, null, 2), 'utf8');
    await fs.writeFile(mdPath, message, 'utf8');

    console.log('✅ CNTXT handoff package generated');
    console.log(`📄 ${path.basename(jsonPath)}`);
    console.log(`📄 ${path.basename(mdPath)}`);
}

main().catch(error => {
    console.error('❌ Failed to generate CNTXT handoff package:', error.message);
    process.exit(1);
});
