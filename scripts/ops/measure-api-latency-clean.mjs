import http from 'node:http';

const runs = Number(process.argv[2] || 2000);
const warmup = Number(process.argv[3] || 200);

const agent = new http.Agent({
  keepAlive: true,
  maxSockets: 1,
  maxFreeSockets: 1
});

const times = [];

async function once() {
  const start = process.hrtime.bigint();

  await new Promise((resolve, reject) => {
    const req = http.get({
      host: '127.0.0.1',
      port: 8080,
      path: '/api/health',
      agent
    }, (res) => {
      res.resume();
      res.on('end', resolve);
    });

    req.on('error', reject);
  });

  return Number(process.hrtime.bigint() - start) / 1e6;
}

for (let i = 0; i < warmup; i++) {
  await once();
}

for (let i = 0; i < runs; i++) {
  times.push(await once());
}

agent.destroy();

times.sort((a, b) => a - b);

const avg = times.reduce((a, b) => a + b, 0) / times.length;
const p95 = times[Math.floor(times.length * 0.95)];
const p99 = times[Math.floor(times.length * 0.99)];
const spikes = times.filter(x => x > 10).length;

console.log(JSON.stringify({
  runs,
  warmup,
  averageApiMs: Number(avg.toFixed(3)),
  minApiMs: Number(times[0].toFixed(3)),
  p95ApiMs: Number(p95.toFixed(3)),
  p99ApiMs: Number(p99.toFixed(3)),
  maxApiMs: Number(times[times.length - 1].toFixed(3)),
  spikesAbove10ms: spikes,
  decision:
    spikes === 0 && avg < 1.5
      ? "PROMOTE_CANDIDATE_SINGLE_NODE_LAB"
      : "SPIKES_REQUIRE_OPTIMIZATION"
}, null, 2));
