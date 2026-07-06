import http from 'node:http';

const runs = 1000;

const agent = new http.Agent({
  keepAlive: true,
  maxSockets: 1
});

const times = [];
let spikes = 0;

for (let i = 0; i < runs; i++) {
  const start = process.hrtime.bigint();

  await new Promise((resolve, reject) => {
    const req = http.get(
      {
        host: '127.0.0.1',
        port: 8080,
        path: '/api/health',
        agent
      },
      (res) => {
        res.on('data', () => {});
        res.on('end', resolve);
      }
    );

    req.on('error', reject);
  });

  const end = process.hrtime.bigint();

  const ms = Number(end - start) / 1e6;

  times.push(ms);

  if (ms > 10) spikes++;
}

const avg = times.reduce((a,b)=>a+b,0)/times.length;

console.log(JSON.stringify({
  averageApiMs: Number(avg.toFixed(3)),
  minApiMs: Number(Math.min(...times).toFixed(3)),
  maxApiMs: Number(Math.max(...times).toFixed(3)),
  spikesAbove10ms: spikes
}, null, 2));
