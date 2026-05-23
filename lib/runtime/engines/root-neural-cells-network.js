'use strict';

const fs = require('fs');
const path = require('path');

function optionalRequire(modulePath) {
    try {
        return require(modulePath);
    } catch (error) {
        return null;
    }
}

const rootNeuralCellsRegistry = optionalRequire('../core/root-neural-cells-registry') || {};

class RootNeuralCellsNetwork {
    constructor(rootDir = path.resolve(__dirname, '..', '..')) {
        this.rootDir = rootDir;
        this.cellsDir = path.join(__dirname, '..', 'cells');
        this.cells = {};
        this.status = {
            status: 'initializing',
            activeCells: 0,
            modules: [],
            message: 'starting root neural cells network',
            lastLoadedAt: new Date().toISOString()
        };
        this.loadRootCells();
    }

    loadRootCells() {
        if (!fs.existsSync(this.cellsDir)) {
            this.status = {
                ...this.status,
                status: 'inactive',
                message: `Root neural cells directory not found: ${this.cellsDir}`
            };
            return;
        }

        const files = fs.readdirSync(this.cellsDir).filter(file => file.endsWith('.js'));
        files.forEach(file => {
            const modulePath = path.join(this.cellsDir, file);
            const cellModule = optionalRequire(modulePath);
            const cellId = (cellModule && cellModule.id) ? cellModule.id : path.basename(file, '.js');
            if (cellModule) {
                this.cells[cellId] = cellModule;
                if (typeof rootNeuralCellsRegistry.registerCellModule === 'function') {
                    rootNeuralCellsRegistry.registerCellModule(cellId, cellModule);
                }
            }
        });

        this.status.activeCells = Object.keys(this.cells).length;
        this.status.modules = Object.keys(this.cells);
        this.status.status = 'active';
        this.status.message = `Loaded ${this.status.activeCells} root neural cell modules`;
        this.status.lastLoadedAt = new Date().toISOString();
    }

    getStatus() {
        return {
            ...this.status,
            runtime: 'root-neural-cells-network',
            loaded: true
        };
    }

    async reply(message, options = {}) {
        const safeText = typeof message === 'string' ? message.trim() : '';
        return {
            success: true,
            status: 'active',
            reply: safeText ? `Sheikha Root Neural received: ${safeText}` : 'Root neural cells network is active.',
            options,
            timestamp: new Date().toISOString()
        };
    }

    async evaluate(input = {}) {
        const evaluations = typeof rootNeuralCellsRegistry.evaluateAll === 'function'
            ? rootNeuralCellsRegistry.evaluateAll(input)
            : [];

        return {
            success: true,
            status: 'active',
            network: 'sheikha-ai-neural-cell-network',
            cellsCount: this.status.activeCells,
            mode: 'deterministic-governed-analysis',
            runtime: 'root-neural-cells-network',
            input,
            evaluations,
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = RootNeuralCellsNetwork;
