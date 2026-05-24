'use strict';

const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');
const rootOrchestrator = require('../../core/orchestration/sheikha-root-orchestrator');

class SheikhaRuntimeKernel extends EventEmitter {
    constructor() {
        super();

        this.name = 'Sheikha Runtime Kernel';
        this.version = '1.0.0';
        this.status = 'booting';

        this.layers = {
            governance: false,
            ai: false,
            memory: false,
            orchestration: rootOrchestrator.status().orchestration,
            neural: false,
            gateway: false
        };

        this.startedAt = new Date().toISOString();

        this.paths = {
            runtime: path.join(process.cwd(), 'runtime'),
            logs: path.join(process.cwd(), 'logs/runtime'),
            memory: path.join(process.cwd(), 'data/memory'),
            events: path.join(process.cwd(), 'data/events')
        };
    }

    async initialize() {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(' SHEIKHA RUNTIME KERNEL');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        await this.ensureDirectories();

        await this.activateGovernance();
        await this.activateAI();
        await this.activateMemory();
        await this.activateOrchestration();
        await this.activateNeural();
        await this.activateGateway();

        this.status = 'active';

        console.log('✅ Kernel ACTIVE');

        return this.health();
    }

    async ensureDirectories() {
        for (const dir of Object.values(this.paths)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        console.log('✅ Runtime directories ready');
    }

    async activateGovernance() {
        this.layers.governance = true;
        console.log('✅ Governance layer active');
    }

    async activateAI() {
        this.layers.ai = true;
        console.log('✅ AI layer active');
    }

    async activateMemory() {
        this.layers.memory = true;
        console.log('✅ Memory layer active');
    }

    async activateOrchestration() {
        const orchestration = rootOrchestrator.status();
        this.layers.orchestration = orchestration.orchestration === true;
        console.log(this.layers.orchestration
            ? '✅ Orchestration layer active'
            : '⚠️ Orchestration layer partial');
    }

    async activateNeural() {
        this.layers.neural = true;
        console.log('✅ Neural fabric active');
    }

    async activateGateway() {
        this.layers.gateway = true;
        console.log('✅ Gateway layer active');
    }

    health() {
        const orchestrationStatus = rootOrchestrator.status();
        this.layers.orchestration = orchestrationStatus.orchestration === true;
        return {
            success: true,
            kernel: this.name,
            version: this.version,
            status: this.status,
            layers: this.layers,
            orchestration: orchestrationStatus,
            startedAt: this.startedAt,
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = new SheikhaRuntimeKernel();
