// SHEIKHA_RUNTIME_BUS_FABRIC — قماش الحافلة السيادية
'use strict';

const fs = require('fs');
const path = require('path');

class SheikhaRuntimeBusFabric {
    constructor() {
        this.channels = {};
        this.signals = [];
        this.reportDir = path.resolve(__dirname, '../../../runtime/bus/reports');
        this.initDefaultChannels();
    }

    initDefaultChannels() {
        const defaultChannels = [
            'telemetry', 'storage', 'intelligence', 'scheduler',
            'governance', 'memory', 'providers', 'signals', 'diagnostics'
        ];
        for (const ch of defaultChannels) {
            this.channels[ch] = [];
        }
    }

    publish(channel, message) {
        if (!this.channels[channel]) this.channels[channel] = [];
        this.channels[channel].push(message);
        this.signals.push({ channel, message, timestamp: new Date().toISOString() });
    }

    subscribe(channel, handler) {
        // Placeholder: in-memory only, for demo
        if (!this.channels[channel]) this.channels[channel] = [];
        // No-op: extend for real-time
    }

    routeSignal(channel, signal) {
        this.publish(channel, signal);
    }

    getStatus() {
        return {
            status: 'active',
            channels: Object.keys(this.channels),
            signalsCount: this.signals.length,
            lastSignal: this.signals[this.signals.length - 1] || null,
            timestamp: new Date().toISOString()
        };
    }

    getChannels() {
        return Object.keys(this.channels);
    }

    getChannelMessages(channel) {
        return this.channels[channel] || [];
    }

    diagnostics() {
        return {
            status: 'diagnostics',
            channels: this.getChannels(),
            signals: this.signals.slice(-10),
            timestamp: new Date().toISOString()
        };
    }

    writeReport() {
        const report = {
            ...this.getStatus(),
            diagnostics: this.diagnostics(),
            writtenAt: new Date().toISOString()
        };
        const file = path.join(this.reportDir, `${Date.now()}-bus-fabric-report.json`);
        fs.writeFileSync(file, JSON.stringify(report, null, 2), 'utf8');
        return file;
    }
}

module.exports = SheikhaRuntimeBusFabric;
