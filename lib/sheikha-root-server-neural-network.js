const http = require('http');

class SheikhaRootServerNeuralNetwork {
  constructor() {
    this.name = 'Sheikha Root Server Neural Network';
    this.version = '1.0.0';
    this.required = [
      { host: '127.0.0.1', port: 8080 },
      { host: '0.0.0.0', port: 8080 },
      { host: '127.0.0.1', port: 8081 },
      { host: '0.0.0.0', port: 8081 }
    ];
  }

  checkOne(host, port) {
    return new Promise(resolve => {
      const req = http.get({ host, port, path: '/api/health', timeout: 2500 }, res => {
        resolve({ host, port, statusCode: res.statusCode, ok: res.statusCode === 200 });
        res.resume();
      });
      req.on('timeout', () => { req.destroy(); resolve({ host, port, ok: false, error: 'timeout' }); });
      req.on('error', e => resolve({ host, port, ok: false, error: e.message }));
    });
  }

  async status() {
    const checks = await Promise.all(this.required.map(x => this.checkOne(x.host, x.port)));
    return {
      success: checks.every(x => x.ok),
      service: this.name,
      version: this.version,
      bind: '0.0.0.0',
      ports: [8080, 8081],
      checks,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new SheikhaRootServerNeuralNetwork();
