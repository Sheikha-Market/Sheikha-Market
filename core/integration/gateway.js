class IntegrationGateway {
  constructor({ governance, policy, telemetry, registry }) {
    this.governance = governance;
    this.policy = policy;
    this.telemetry = telemetry;
    this.registry = registry;
  }

  async execute(provider, payload = {}, context = {}) {
    const startedAt = Date.now();

    await this.governance.validate({
      provider,
      payload,
      context
    });

    await this.policy.validate({
      provider,
      payload,
      context
    });

    const adapter = this.registry.get(provider);

    if (!adapter) {
      throw new Error(`Unknown integration provider: ${provider}`);
    }

    const snapshot = context.snapshot
      ? await context.snapshot()
      : null;

    try {
      const result = await adapter.execute(payload, context);

      await this.telemetry.capture({
        provider,
        status: 'success',
        latency_ms: Date.now() - startedAt,
        timestamp: new Date().toISOString()
      });

      return result;
    } catch (error) {
      if (snapshot && context.rollback) {
        await context.rollback(snapshot);
      }

      await this.telemetry.capture({
        provider,
        status: 'failed',
        latency_ms: Date.now() - startedAt,
        timestamp: new Date().toISOString(),
        error: error.message
      });

      throw error;
    }
  }
}

module.exports = {
  IntegrationGateway
};
