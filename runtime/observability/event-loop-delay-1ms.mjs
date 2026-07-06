import { monitorEventLoopDelay } from 'node:perf_hooks';

const h = monitorEventLoopDelay({ resolution: 1 });
h.enable();

setInterval(() => {
  console.log(JSON.stringify({
    meanMs: Number((h.mean / 1e6).toFixed(3)),
    maxMs: Number((h.max / 1e6).toFixed(3)),
    p99Ms: Number((h.percentile(99) / 1e6).toFixed(3))
  }));
  h.reset();
}, 3000);
