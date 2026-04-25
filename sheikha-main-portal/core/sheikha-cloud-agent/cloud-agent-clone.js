'use strict';

const fs = require('fs');
const path = require('path');

const REGISTRY_PATH = path.join(__dirname, 'agent-registry.json');
const MAX_AGENTS = 57;
const PRIMARY_AGENT_ID = '786';

class SheikhaCloudAgentClone {
    constructor() {
        this.registry = this.loadRegistry();
    }

    loadRegistry() {
        if (!fs.existsSync(REGISTRY_PATH)) {
            return this.getDefaultRegistry();
        }

        try {
            const raw = fs.readFileSync(REGISTRY_PATH, 'utf8');
            const parsed = JSON.parse(raw);
            if (!parsed.meta || !Array.isArray(parsed.agents)) {
                return this.getDefaultRegistry();
            }
            return parsed;
        } catch (_error) {
            return this.getDefaultRegistry();
        }
    }

    getDefaultRegistry() {
        return {
            meta: {
                project: 'SHEIKHA Cloud Agent Clone Mode',
                seed: Number(PRIMARY_AGENT_ID),
                maxAgents: MAX_AGENTS,
                updatedAt: new Date().toISOString()
            },
            agents: [
                {
                    id: PRIMARY_AGENT_ID,
                    name: 'Sheikha Primary Agent',
                    quranicNumber: 1,
                    status: 'active',
                    isPrimary: true,
                    createdAt: new Date().toISOString()
                }
            ]
        };
    }

    saveRegistry() {
        this.registry.meta.updatedAt = new Date().toISOString();
        fs.writeFileSync(REGISTRY_PATH, JSON.stringify(this.registry, null, 4), 'utf8');
    }

    listAgents() {
        return this.registry.agents;
    }

    getStats() {
        const active = this.registry.agents.filter(agent => agent.status === 'active').length;
        return {
            seedAgent: Number(PRIMARY_AGENT_ID),
            totalAgents: this.registry.agents.length,
            activeAgents: active,
            inactiveAgents: this.registry.agents.length - active,
            maxAgents: MAX_AGENTS
        };
    }

    getAgent(agentId) {
        return this.registry.agents.find(agent => agent.id === agentId) || null;
    }

    setAgentStatus(agentId, status) {
        const agent = this.getAgent(agentId);
        if (!agent) {
            return null;
        }
        agent.status = status;
        agent.updatedAt = new Date().toISOString();
        this.saveRegistry();
        return agent;
    }

    clone(targetCount = MAX_AGENTS) {
        const normalizedTarget = Math.max(1, Math.min(Number(targetCount) || MAX_AGENTS, MAX_AGENTS));
        const existing = this.registry.agents.length;

        if (existing >= normalizedTarget) {
            return {
                created: 0,
                total: existing,
                maxAgents: MAX_AGENTS,
                agents: this.registry.agents
            };
        }

        let created = 0;
        for (let i = existing + 1; i <= normalizedTarget; i += 1) {
            this.registry.agents.push({
                id: `786-${i}`,
                name: `Sheikha Clone Agent ${i}`,
                quranicNumber: i,
                status: 'active',
                isPrimary: false,
                createdAt: new Date().toISOString()
            });
            created += 1;
        }

        this.saveRegistry();

        return {
            created,
            total: this.registry.agents.length,
            maxAgents: MAX_AGENTS,
            agents: this.registry.agents
        };
    }

    broadcast(payload) {
        return {
            deliveredTo: this.registry.agents.filter(agent => agent.status === 'active').length,
            payload,
            at: new Date().toISOString()
        };
    }

    reset() {
        this.registry = this.getDefaultRegistry();
        this.saveRegistry();
        return {
            total: this.registry.agents.length,
            agents: this.registry.agents
        };
    }
}

const cloudAgentClone = new SheikhaCloudAgentClone();

module.exports = {
    cloudAgentClone,
    SheikhaCloudAgentClone,
    MAX_AGENTS,
    PRIMARY_AGENT_ID
};
