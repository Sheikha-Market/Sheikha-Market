#!/usr/bin/env node
const fs = require('fs').promises;
const path = require('path');

const ORG_ID = process.env.ORG_ID || '224557279528';
const BILLING_ACCOUNT = process.env.BILLING_ACCOUNT || 'REQUIRED-BILLING-ACCOUNT';
const BASE_DOMAIN = process.env.BASE_DOMAIN || 'sheikha.top';

const INPUT_FILE =
    process.env.ENTREPRENEURS_FILE ||
    path.join(process.cwd(), 'data', 'operations', 'entrepreneurs-seed.json');

const OUTPUT_PLAN = path.join(process.cwd(), 'ENTREPRENEURS-ENABLEMENT-PLAN.json');
const OUTPUT_DIR = path.join(process.cwd(), 'data', 'entrepreneurs');

function slugify(text) {
    return (
        String(text || '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') || `entrepreneur-${Date.now()}`
    );
}

function buildProjectId(entrepreneur) {
    const base = slugify(entrepreneur.projectName || entrepreneur.name || 'project');
    return `sheikha-${base}`.slice(0, 28);
}

function buildIdeProfiles(entrepreneur, projectId) {
    return {
        cursor: {
            workspaceName: `${entrepreneur.name}-cursor-workspace`,
            recommendedExtensions: [
                'ms-vscode.vscode-json',
                'dbaeumer.vscode-eslint',
                'esbenp.prettier-vscode'
            ],
            env: {
                SHEIKHA_ORG_ID: ORG_ID,
                SHEIKHA_PROJECT_ID: projectId,
                SHEIKHA_ENTREPRENEUR_ID: entrepreneur.id
            }
        },
        vscode: {
            workspaceName: `${entrepreneur.name}-vscode-workspace`,
            tasks: ['npm run dev', 'npm run ops:readiness', 'npm run ops:auth:readiness'],
            env: {
                SHEIKHA_ORG_ID: ORG_ID,
                SHEIKHA_PROJECT_ID: projectId,
                SHEIKHA_ENTREPRENEUR_ID: entrepreneur.id
            }
        },
        generic: {
            gitRepo: `https://git.${BASE_DOMAIN}/entrepreneurs/${entrepreneur.id}/${projectId}`,
            branchModel: ['main', 'develop', 'release'],
            ciCd: 'pipeline-required-before-production'
        }
    };
}

function buildProvisioningCommands(entrepreneur, projectId) {
    return [
        `gcloud projects create ${projectId} --organization=${ORG_ID}`,
        `gcloud beta billing projects link ${projectId} --billing-account=${BILLING_ACCOUNT}`,
        `gcloud services enable run.googleapis.com aiplatform.googleapis.com bigquery.googleapis.com storage.googleapis.com cloudfunctions.googleapis.com monitoring.googleapis.com --project=${projectId}`,
        `gcloud projects add-iam-policy-binding ${projectId} --member=user:${entrepreneur.email} --role=roles/viewer`,
        `gcloud projects add-iam-policy-binding ${projectId} --member=user:${entrepreneur.email} --role=roles/run.developer`,
        `gcloud projects add-iam-policy-binding ${projectId} --member=user:${entrepreneur.email} --role=roles/serviceusage.serviceUsageConsumer`,
        `gcloud projects add-iam-policy-binding ${projectId} --member=user:${entrepreneur.email} --role=roles/storage.objectUser`
    ];
}

async function loadEntrepreneurs() {
    const raw = await fs.readFile(INPUT_FILE, 'utf8');
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed.entrepreneurs) || parsed.entrepreneurs.length === 0) {
        throw new Error('entrepreneurs-seed.json must contain a non-empty entrepreneurs array');
    }

    return parsed.entrepreneurs.map((entry, index) => ({
        id: entry.id || `ent-${index + 1}`,
        name: entry.name,
        email: entry.email,
        sector: entry.sector || 'general',
        projectName: entry.projectName || entry.name,
        targetRegion: entry.targetRegion || 'saudi-arabia',
        needs: Array.isArray(entry.needs) ? entry.needs : []
    }));
}

async function main() {
    const entrepreneurs = await loadEntrepreneurs();
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    const plan = {
        timestamp: new Date().toISOString(),
        organizationId: ORG_ID,
        billingAccount: BILLING_ACCOUNT,
        strategy: {
            objective:
                'Enable entrepreneurs with isolated project accounts and fast technical development environments',
            principles: ['no-harm', 'least-privilege', 'secure-by-default', 'rapid-delivery']
        },
        entrepreneurs: []
    };

    for (const entrepreneur of entrepreneurs) {
        const projectId = buildProjectId(entrepreneur);
        const ideProfiles = buildIdeProfiles(entrepreneur, projectId);
        const commands = buildProvisioningCommands(entrepreneur, projectId);

        const profile = {
            ...entrepreneur,
            projectId,
            orgId: ORG_ID,
            ideProfiles,
            provisioning: {
                mode: 'institutional-automation',
                commands
            },
            supportCatalog: {
                managedServices: [
                    'cloud-run',
                    'cloud-functions',
                    'monitoring',
                    'security-baseline'
                ],
                dataAi: ['bigquery', 'vertex-ai', 'dashboards'],
                enablement: ['starter-template', 'mentoring', 'weekly-tech-review']
            }
        };

        const entrepreneurDir = path.join(OUTPUT_DIR, entrepreneur.id);
        await fs.mkdir(entrepreneurDir, { recursive: true });
        await fs.writeFile(
            path.join(entrepreneurDir, 'workspace-profile.json'),
            JSON.stringify(profile, null, 2),
            'utf8'
        );

        plan.entrepreneurs.push({
            id: entrepreneur.id,
            name: entrepreneur.name,
            email: entrepreneur.email,
            projectId,
            workspaceProfile: `data/entrepreneurs/${entrepreneur.id}/workspace-profile.json`
        });
    }

    await fs.writeFile(OUTPUT_PLAN, JSON.stringify(plan, null, 2), 'utf8');

    console.log('✅ Entrepreneur organization enablement plan generated');
    console.log(`📄 ${path.basename(OUTPUT_PLAN)}`);
    console.log(`📁 profiles: data/entrepreneurs/*/workspace-profile.json`);
}

main().catch(error => {
    console.error('❌ Failed to generate entrepreneur enablement plan:', error.message);
    process.exit(1);
});
