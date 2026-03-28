#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const dataFile = path.join(rootDir, 'data', 'sheikha-universal-systems-index.json');
const mermaidFile = path.join(rootDir, 'docs', 'architecture', 'diagrams', 'sheikha-universal-integration-atlas.mmd');
const reportFile = path.join(rootDir, 'docs', 'reports', 'SHEIKHA-UNIVERSAL-INTEGRATION-ATLAS.md');

function ensureDirFor(filePath) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function nowIso() {
    return new Date().toISOString();
}

function getArgValue(name, fallback) {
    const prefix = `${name}=`;
    const found = process.argv.find(arg => arg.startsWith(prefix));
    if (!found) return fallback;
    return found.slice(prefix.length);
}

function buildSystemsCatalog() {
    const systems = [
        { id: 'sheikha-governance-core', name: 'Sheikha Governance Core', family: 'governance', owner: 'Sheikha', mode: 'direct', status: 'active' },
        { id: 'sheikha-intel-core', name: 'Sheikha Intel Core', family: 'compute', owner: 'Intel ecosystem', mode: 'partner', status: 'planned' },
        { id: 'sheikha-nvidia', name: 'Sheikha NVIDIA', family: 'compute', owner: 'NVIDIA ecosystem', mode: 'direct', status: 'active' },
        { id: 'sheikha-msi', name: 'Sheikha MSI', family: 'compute', owner: 'MSI ecosystem', mode: 'partner', status: 'planned' },
        { id: 'sheikha-apple', name: 'Sheikha Apple', family: 'os', owner: 'Apple ecosystem', mode: 'partner', status: 'planned' },
        { id: 'sheikha-android', name: 'Sheikha Android', family: 'os', owner: 'Google ecosystem', mode: 'partner', status: 'planned' },
        { id: 'sheikha-pop', name: 'Sheikha Pop', family: 'os', owner: 'System76 ecosystem', mode: 'direct', status: 'active' },
        { id: 'sheikha-linux', name: 'Sheikha Linux', family: 'os', owner: 'Linux ecosystem', mode: 'direct', status: 'active' },
        { id: 'sheikha-microsoft', name: 'Sheikha Microsoft', family: 'ecosystem', owner: 'Microsoft ecosystem', mode: 'partner', status: 'planned' },
        { id: 'sheikha-google', name: 'Sheikha Google', family: 'ecosystem', owner: 'Google ecosystem', mode: 'partner', status: 'planned' },
        { id: 'sheikha-windows', name: 'Sheikha Windows', family: 'os', owner: 'Microsoft ecosystem', mode: 'partner', status: 'planned' },
        { id: 'sheikha-copilot', name: 'Sheikha Copilot', family: 'ai', owner: 'Sheikha', mode: 'direct', status: 'active' },
        { id: 'sheikha-ollama', name: 'Sheikha Ollama', family: 'ai', owner: 'Sheikha local AI', mode: 'direct', status: 'active' },
        { id: 'sheikha-gpt', name: 'Sheikha GPT', family: 'ai', owner: 'OpenAI integration', mode: 'partner', status: 'conditional' }
    ];

    const globalDomains = [
        'Operating Systems',
        'Chipsets and GPUs',
        'Cloud and SaaS',
        'AI Platforms and LLMs',
        'Developer Platforms',
        'Enterprise Security',
        'Databases and Storage',
        'Mobile and Edge Devices',
        'Browsers and Communication'
    ];

    return { systems, globalDomains };
}

function buildConnectors(systems) {
    return systems
        .filter(system => system.id !== 'sheikha-governance-core')
        .map(system => ({
            id: `connector-${system.id}`,
            from: 'sheikha-governance-core',
            to: system.id,
            type: 'api-bridge',
            mode: system.mode,
            status: system.status,
            autoSync: true
        }));
}

function buildNetworkGraph(systems, connectors) {
    const nodes = systems.map(system => ({
        id: system.id,
        label: system.name,
        family: system.family
    }));

    const edges = connectors.map(connector => ({
        from: connector.from,
        to: connector.to,
        relation: connector.type,
        mode: connector.mode
    }));

    edges.push(
        { from: 'sheikha-google', to: 'sheikha-android', relation: 'ecosystem-link', mode: 'partner' },
        { from: 'sheikha-microsoft', to: 'sheikha-windows', relation: 'ecosystem-link', mode: 'partner' },
        { from: 'sheikha-linux', to: 'sheikha-pop', relation: 'distribution-link', mode: 'direct' },
        { from: 'sheikha-nvidia', to: 'sheikha-intel-core', relation: 'hardware-interoperability', mode: 'partner' }
    );

    return { nodes, edges };
}

function buildAtlas() {
    const generatedAt = nowIso();
    const { systems, globalDomains } = buildSystemsCatalog();
    const connectors = buildConnectors(systems);
    const networkGraph = buildNetworkGraph(systems, connectors);

    return {
        version: '1.0.0',
        generatedAt,
        governance: {
            layerName: 'Sheikha Governance Layer',
            policy: 'Good-first, secure-by-default, human-governed automation'
        },
        mission: 'Unified integration index across local, enterprise, and global ecosystems',
        systems,
        connectors,
        networkGraph,
        universeCoverage: {
            note: 'Catalog is extensible and continuously refreshable. Not every global proprietary system can be integrated without formal agreements.',
            globalDomains
        },
        updatePolicy: {
            mode: 'scheduled',
            recommendedIntervalSeconds: 900,
            refreshCommand: 'node scripts/refresh-sheikha-integration-atlas.js'
        }
    };
}

function buildMermaid(atlas) {
    const lines = ['graph LR'];
    lines.push('  SGC[Sheikha Governance Core]');

    atlas.systems.forEach(system => {
        if (system.id === 'sheikha-governance-core') return;
        const key = system.id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        lines.push(`  ${key}[${system.name}]`);
        lines.push(`  SGC --> ${key}`);
    });

    lines.push('  SHEIKHAGOOGLE --> SHEIKHAANDROID');
    lines.push('  SHEIKHAMICROSOFT --> SHEIKHAWINDOWS');
    lines.push('  SHEIKHALINUX --> SHEIKHAPOP');
    lines.push('  SHEIKHANVIDIA --> SHEIKHAINTELCORE');

    return `${lines.join('\n')}\n`;
}

function buildReport(atlas) {
    const totalSystems = atlas.systems.length;
    const totalConnectors = atlas.connectors.length;
    const activeConnectors = atlas.connectors.filter(c => c.status === 'active').length;

    return [
        '# Sheikha Universal Integration Atlas',
        '',
        `Generated at: ${atlas.generatedAt}`,
        '',
        '## Summary',
        `- Total systems indexed: ${totalSystems}`,
        `- Total connectors defined: ${totalConnectors}`,
        `- Active connectors: ${activeConnectors}`,
        `- Auto-refresh recommendation: every ${atlas.updatePolicy.recommendedIntervalSeconds} seconds`,
        '',
        '## Governance Layer',
        `- Layer: ${atlas.governance.layerName}`,
        `- Policy: ${atlas.governance.policy}`,
        '',
        '## Integration Modes',
        '- direct: official APIs or direct technical integration',
        '- partner: certified partner bridge until direct enterprise route is available',
        '',
        '## Continuous Refresh',
        '- Run once: npm run -s ops:sheikha:atlas:refresh',
        '- Continuous mode: npm run -s ops:sheikha:atlas:auto',
        '',
        '## API Endpoints',
        '- GET /api/sheikha/integration-atlas',
        '- GET /api/sheikha/integration-atlas/map',
        '- GET /api/sheikha/governance-layer',
        ''
    ].join('\n');
}

function writeAtlasOnce() {
    const atlas = buildAtlas();

    ensureDirFor(dataFile);
    fs.writeFileSync(dataFile, JSON.stringify(atlas, null, 2));

    const mermaid = buildMermaid(atlas);
    ensureDirFor(mermaidFile);
    fs.writeFileSync(mermaidFile, mermaid);

    const report = buildReport(atlas);
    ensureDirFor(reportFile);
    fs.writeFileSync(reportFile, report);

    console.log(`OK: atlas refreshed at ${atlas.generatedAt}`);
    console.log(`OK: systems=${atlas.systems.length} connectors=${atlas.connectors.length}`);
    console.log(`OK: data=${path.relative(rootDir, dataFile)}`);
    console.log(`OK: map=${path.relative(rootDir, mermaidFile)}`);
    console.log(`OK: report=${path.relative(rootDir, reportFile)}`);
}

function run() {
    const watchMode = process.argv.includes('--watch');
    const intervalSec = Number(getArgValue('--interval', '900'));

    writeAtlasOnce();

    if (!watchMode) {
        return;
    }

    const safeInterval = Number.isFinite(intervalSec) && intervalSec >= 30 ? intervalSec : 900;
    console.log(`INFO: watch mode enabled, refresh every ${safeInterval} seconds`);

    setInterval(() => {
        try {
            writeAtlasOnce();
        } catch (error) {
            console.error('ERROR: atlas refresh failed', error.message);
        }
    }, safeInterval * 1000);
}

run();
