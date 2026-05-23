'use strict';

const vscode = require('vscode');
let fetch = globalThis.fetch ? globalThis.fetch.bind(globalThis) : null;
if (!fetch) {
    try {
        fetch = require('node-fetch');
    } catch (_) {
        fetch = async () => {
            throw new Error('fetch غير متوفر في بيئة VS Code الحالية');
        };
    }
}

const DEFAULT_SERVER_URL = 'http://localhost:8080';
const SERVER_CANDIDATES = [
    'http://localhost:8080',
    'http://localhost:8081',
    'http://127.0.0.1:8080',
    'http://127.0.0.1:8081'
];

async function fetchWithTimeout(url, options = {}, timeoutMs = 1500) {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = setTimeout(() => {
        if (controller) {
            controller.abort();
        }
    }, timeoutMs);

    try {
        return await fetch(url, {
            ...options,
            signal: controller ? controller.signal : options.signal
        });
    } finally {
        clearTimeout(timer);
    }
}

class NeuralNetworkProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.registry = null;
    }

    async getServerUrl() {
        const config = vscode.workspace.getConfiguration('sheikha');
        const configured = config.get('serverUrl');
        const candidates = Array.from(new Set([configured, ...SERVER_CANDIDATES].filter(Boolean)));

        for (const candidate of candidates) {
            try {
                const response = await fetchWithTimeout(`${candidate}/api/sheikha/neural-runtime-registry/status`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });
                if (response.ok) {
                    return candidate;
                }
            } catch (_) {
                // Try the next local Sheikha port.
            }
        }

        return configured || DEFAULT_SERVER_URL;
    }

    async refresh() {
        this.registry = null;
        this._onDidChangeTreeData.fire();
    }

    async fetchRegistry() {
        if (this.registry) {
            return this.registry;
        }

        const serverUrl = await this.getServerUrl();
        try {
            const response = await fetch(`${serverUrl}/api/sheikha/neural-runtime-registry/status`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            if (response.ok && data && data.success) {
                this.registry = data;
                return this.registry;
            }
            this.registry = { success: false, status: 'unavailable', message: data.message || 'تعذر تحميل السجل' };
            return this.registry;
        } catch (error) {
            this.registry = { success: false, status: 'offline', message: `تعذر الاتصال بخادم Sheikha: ${error.message}` };
            return this.registry;
        }
    }

    async getChildren(element) {
        if (element) {
            return element.children || [];
        }

        const registry = await this.fetchRegistry();
        const cells = Array.isArray(registry.cells) ? registry.cells : [];
        const lifecycle = Array.isArray(registry.lifecycle) ? registry.lifecycle.join(' → ') : 'registered → governed';
        const items = [
            { label: 'الحالة', description: registry.success ? 'ACTIVE' : (registry.status || 'unknown') },
            { label: 'السجل', description: registry.name || 'Sheikha Neural Runtime Registry' },
            { label: 'الخلايا', description: String(registry.cellsCount || cells.length || 0) },
            { label: 'الطبقة الأعلى', description: 'Sheikha Supreme Root Neural Fabric' },
            { label: 'دورة الحياة', description: lifecycle },
            { label: 'التحميل الحار', description: String(registry.state && registry.state.hotLoadCount || 0) },
            { label: 'الحقن الآمن', description: String(registry.state && registry.state.injectionCount || 0) },
            {
                label: 'الخلايا الفعالة',
                description: 'runtime modules',
                children: cells.slice(0, 18).map(cell => ({
                    label: cell.name || cell.id,
                    description: cell.id,
                    children: [
                        { label: 'module', description: cell.module },
                        { label: 'hot-loadable', description: String(Boolean(cell.capabilities && cell.capabilities.hotLoadable)) },
                        { label: 'api-injectable', description: String(Boolean(cell.capabilities && cell.capabilities.apiInjectable)) },
                        { label: 'governed', description: String(Boolean(cell.capabilities && cell.capabilities.governed)) }
                    ]
                }))
            }
        ];
        return items;
    }

    getTreeItem(element) {
        const item = new vscode.TreeItem(`${element.label}: ${element.description}`);
        item.tooltip = `${element.label} — ${element.description}`;
        item.collapsibleState = element.children && element.children.length
            ? vscode.TreeItemCollapsibleState.Collapsed
            : vscode.TreeItemCollapsibleState.None;
        return item;
    }
}

module.exports = NeuralNetworkProvider;
