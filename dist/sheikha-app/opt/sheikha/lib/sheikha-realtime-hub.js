const EventEmitter = require('events');

class SheikhaRealTimeHub extends EventEmitter {
  constructor() {
    super();
    this.version = '1.0.0';
    this.name = 'Sheikha Real-Time Hub';
    this.channels = new Map();
    this.history = [];
    this.maxHistory = 200;
    this.startedAt = new Date().toISOString();

    this.bootstrapChannels([
      'visual.job.created',
      'visual.job.completed',
      'orchestrator.mode.changed',
      'git.file.created',
      'git.file.updated',
      'fio.benchmark.completed',
      'sheikha.command.executed'
    ]);
  }

  bootstrapChannels(names = []) {
    for (const name of names) {
      if (!this.channels.has(name)) {
        this.channels.set(name, { name, subscribers: 0, lastEvent: null });
      }
    }
  }

  now() {
    return new Date().toISOString();
  }

  ensureChannel(name) {
    if (!this.channels.has(name)) {
      this.channels.set(name, { name, subscribers: 0, lastEvent: null });
    }
    return this.channels.get(name);
  }

  publish(channel, payload = {}) {
    const meta = this.ensureChannel(channel);
    const event = {
      id: `EVT-${Date.now()}-${Math.random().toString(36).slice(2,8).toUpperCase()}`,
      channel,
      timestamp: this.now(),
      payload
    };

    meta.lastEvent = event;
    this.history.push(event);
    this.history = this.history.slice(-this.maxHistory);

    this.emit(channel, event);
    this.emit('broadcast', event);
    return event;
  }

  subscribe(channel, listener) {
    const meta = this.ensureChannel(channel);
    meta.subscribers += 1;
    this.on(channel, listener);
    return () => {
      this.off(channel, listener);
      meta.subscribers = Math.max(0, meta.subscribers - 1);
    };
  }

  subscribeBroadcast(listener) {
    this.on('broadcast', listener);
    return () => this.off('broadcast', listener);
  }

  status() {
    return {
      success: true,
      engine: this.name,
      version: this.version,
      startedAt: this.startedAt,
      channels: Array.from(this.channels.values()),
      historyCount: this.history.length
    };
  }

  recent(limit = 20) {
    return {
      success: true,
      events: this.history.slice(-limit).reverse()
    };
  }

  seedDemoEvents() {
    this.publish('sheikha.command.executed', {
      action: 'SHOW_SYSTEM_STATUS',
      source: 'sheikha-code',
      result: 'success'
    });
    this.publish('orchestrator.mode.changed', {
      mode: 'NORMAL_PRODUCTION',
      activeActions: []
    });
    this.publish('visual.job.completed', {
      jobId: `VIS-${Date.now()}`,
      type: 'image',
      quality: 98
    });
    return this.recent(10);
  }
}

module.exports = new SheikhaRealTimeHub();
