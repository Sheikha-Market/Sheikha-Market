class TelemetryCapture {
  constructor({ sink } = {}) {
    this.sink = sink || [];
  }

  async capture(event = {}) {
    const record = {
      ...event,
      capturedAt: new Date().toISOString()
    };

    if (Array.isArray(this.sink)) {
      this.sink.push(record);
      return record;
    }

    if (typeof this.sink.write === 'function') {
      await this.sink.write(record);
      return record;
    }

    return record;
  }
}

module.exports = { TelemetryCapture };
