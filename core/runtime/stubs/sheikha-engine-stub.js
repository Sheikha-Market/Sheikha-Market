'use strict';

class SheikhaEngineStub {
  constructor(name = 'UnknownEngine') {
    this.name = name;
    this.active = false;
    this.mode = 'lazy-governed-placeholder';
    this.timestamp = new Date().toISOString();
  }

  status() {
    return {
      success: true,
      engine: this.name,
      active: false,
      lazy: true,
      governed: true,
      placeholder: true,
      timestamp: this.timestamp
    };
  }
}

module.exports = SheikhaEngineStub;
