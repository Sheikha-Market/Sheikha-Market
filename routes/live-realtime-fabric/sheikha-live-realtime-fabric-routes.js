'use strict';

// Keep one live-chat implementation. The canonical module owns SSE routing,
// request cancellation, latency metrics, and governed Ollama streaming.
module.exports = require(
  './sheikha-live-realtime-fabric-routes-clean-checkout-canonical-v1'
);
