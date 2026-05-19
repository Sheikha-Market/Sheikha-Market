class BaseAdapter {
  constructor({ name, mode = 'dry-run' }) {
    this.name = name;
    this.mode = mode;
  }

  async execute() {
    throw new Error(`${this.name} adapter must implement execute()`);
  }

  result(status, data = {}) {
    return {
      adapter: this.name,
      mode: this.mode,
      status,
      data,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = { BaseAdapter };
