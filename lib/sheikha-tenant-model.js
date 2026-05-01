'use strict';

const fs = require('fs');
const path = require('path');

class SheikhaTenantModelStore {
    constructor(basePath) {
        this.basePath = basePath || path.join(__dirname, '..');
        this.filePath = path.join(this.basePath, 'data', 'tenant-governance-store.json');
    }

    _defaultStore() {
        return {
            tenants: [],
            policies: []
        };
    }

    _load() {
        try {
            if (fs.existsSync(this.filePath)) {
                const raw = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
                return Object.assign(this._defaultStore(), raw || {});
            }
        } catch (_) {}
        return this._defaultStore();
    }

    _save(store) {
        try {
            const dir = path.dirname(this.filePath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(this.filePath, JSON.stringify(store, null, 2), 'utf8');
        } catch (_) {}
    }

    listTenants() {
        const store = this._load();
        return store.tenants || [];
    }

    getTenant(tenantId) {
        const id = String(tenantId || '').trim();
        if (!id) return null;
        return this.listTenants().find((t) => t.tenantId === id) || null;
    }

    upsertTenant(input) {
        const req = input || {};
        const tenantId = String(req.tenantId || '').trim();
        const name = String(req.name || '').trim();
        if (!tenantId || !name) return null;

        const store = this._load();
        const idx = (store.tenants || []).findIndex((x) => x.tenantId === tenantId);
        const next = {
            tenantId,
            name,
            market: String(req.market || 'metals-scrap-dismantling'),
            erpSystem: String(req.erpSystem || ''),
            partitionKey: Object.assign({
                legalEntity: '',
                businessUnit: '',
                companyCode: ''
            }, req.partitionKey || {}),
            shariaProfile: Object.assign({
                prohibitRiba: true,
                prohibitGharar: true,
                requireMutualConsent: true
            }, req.shariaProfile || {}),
            status: String(req.status || 'active'),
            updatedAt: new Date().toISOString(),
            createdAt: req.createdAt || new Date().toISOString()
        };

        if (idx >= 0) {
            next.createdAt = store.tenants[idx].createdAt || next.createdAt;
            store.tenants[idx] = Object.assign({}, store.tenants[idx], next);
        } else {
            store.tenants.unshift(next);
            store.tenants = store.tenants.slice(0, 5000);
        }
        this._save(store);
        return next;
    }
}

module.exports = SheikhaTenantModelStore;
