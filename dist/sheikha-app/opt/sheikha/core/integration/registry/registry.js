class IntegrationRegistry {
  constructor() {
    this.adapters = new Map();
  }

  register(name, adapter) {
    if (!name || typeof name !== 'string') throw new Error('Adapter name is required');
    if (!adapter || typeof adapter.execute !== 'function') {
      throw new Error(`Adapter ${name} must implement execute(payload, context)`);
    }
    this.adapters.set(name, adapter);
    return this;
  }

  get(name) {
    return this.adapters.get(name);
  }

  list() {
    return Array.from(this.adapters.keys());
  }

  has(name) {
    return this.adapters.has(name);
  }
}

module.exports = { IntegrationRegistry };
