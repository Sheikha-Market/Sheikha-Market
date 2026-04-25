const fs = require('fs');
const path = require('path');

class SheikhaNeuralOrchestrator {
    constructor(basePath = path.join(__dirname, '..')) {
        this.basePath = basePath;
        this.blueprintPath = path.join(this.basePath, 'data', 'sheikha-unified-executive-blueprint.json');

        this.requiredFiles = [
            path.join(this.basePath, 'data', 'users.json'),
            path.join(this.basePath, 'data', 'traders.json'),
            path.join(this.basePath, 'data', 'orders.json'),
            path.join(this.basePath, 'data', 'supply.json'),
            path.join(this.basePath, 'routes', 'git.js'),
            path.join(this.basePath, 'routes', 'execution-orchestrator.routes.js'),
            path.join(this.basePath, 'public', 'sheikha-logo-tech-experience.html'),
            path.join(this.basePath, 'public', 'sheikha-visual-future-home.html'),
            path.join(this.basePath, 'public', 'sdk.html'),
            path.join(this.basePath, 'public', 'mcp.html'),
            path.join(this.basePath, 'public', 'cli.html')
        ];
    }

    readJsonFile(filePath, fallback = {}) {
        try {
            const raw = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(raw);
        } catch (_) {
            return fallback;
        }
    }

    getBlueprint() {
        return this.readJsonFile(this.blueprintPath, {
            meta: {
                name: 'Sheikha Unified Executive Activation Blueprint',
                version: 'fallback'
            },
            layers: [],
            cells: [],
            flows: []
        });
    }

    getCellsHealth() {
        const checks = this.requiredFiles.map((filePath) => ({
            file: path.relative(this.basePath, filePath),
            exists: fs.existsSync(filePath)
        }));

        const readyCount = checks.filter((check) => check.exists).length;
        const totalCount = checks.length;

        return {
            ready: readyCount === totalCount,
            readyCount,
            totalCount,
            coverage: Number(((readyCount / totalCount) * 100).toFixed(2)),
            checks
        };
    }

    getUnifiedStatus() {
        const blueprint = this.getBlueprint();
        const health = this.getCellsHealth();

        return {
            blueprint: {
                name: blueprint.meta ? blueprint.meta.name : 'Unknown',
                version: blueprint.meta ? blueprint.meta.version : 'unknown',
                reference: blueprint.meta ? blueprint.meta.reference : 'unknown'
            },
            structure: {
                layers: Array.isArray(blueprint.layers) ? blueprint.layers.length : 0,
                cells: Array.isArray(blueprint.cells) ? blueprint.cells.length : 0,
                flows: Array.isArray(blueprint.flows) ? blueprint.flows.length : 0
            },
            health
        };
    }
}

module.exports = {
    SheikhaNeuralOrchestrator
};
