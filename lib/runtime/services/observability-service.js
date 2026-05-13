class ObservabilityService {
  constructor() {
    this.startedAt = Date.now();
  }

  summary() {
    const memory = process.memoryUsage();

    return {
      uptimeSeconds: process.uptime(),
      rssMB: Math.round(memory.rss / 1024 / 1024),
      heapUsedMB: Math.round(memory.heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(memory.heapTotal / 1024 / 1024),
      pid: process.pid,
      node: process.version,
    };
  }
}

module.exports = ObservabilityService;
