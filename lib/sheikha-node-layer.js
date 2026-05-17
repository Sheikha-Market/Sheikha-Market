const rootControlPlane = require('./sheikha-root-control-plane');
const runtimeRootNetwork = require('./sheikha-runtime-root-neural-network');
const rootNeuralNetwork = require('./sheikha-root-neural-network');

class SheikhaNodeLayer {
    constructor() {
        this.name = 'Sheikha Node Layer';
        this.version = '1.0.0';
        this.principle = 'لا ضرر ولا ضرار';
    }

    async status() {
        await rootNeuralNetwork.ensureBooted();

        return {
            success: true,
            data: {
                layer: this.name,
                version: this.version,
                principle: this.principle,
                backgroundServer: {
                    manager: process.env.pm_id ? 'pm2' : 'node',
                    pid: process.pid,
                    environment: process.env.NODE_ENV || 'development'
                },
                rootControlPlane: rootControlPlane.status(),
                runtimeRoot: runtimeRootNetwork.status(),
                rootNeural: rootNeuralNetwork.getStatus()
            },
            message: 'طبقة شيخة نود مفعّلة فوق نود وتشغّل الخلفية والجذر العصبي.',
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = new SheikhaNodeLayer();