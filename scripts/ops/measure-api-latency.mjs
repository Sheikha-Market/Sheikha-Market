const url = process.argv[2] || "http://127.0.0.1:8080/api/health";
const runs = Number(process.argv[3] || 300);

const times = [];
let spikes = 0;

for (let i = 0; i < runs; i++) {
  const start = process.hrtime.bigint();
  const res = await fetch(url);
  await res.arrayBuffer();
  const end = process.hrtime.bigint();

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const ms = Number(end - start) / 1e6;
  times.push(ms);
  if (ms > 10) spikes++;
}

const sum = times.reduce((a, b) => a + b, 0);
const avg = sum / times.length;
const min = Math.min(...times);
const max = Math.max(...times);

const decision =
  spikes > 0 ? "SPIKES_REQUIRE_OPTIMIZATION" :
  avg < 1.5 ? "PROMOTE_CANDIDATE_SINGLE_NODE_LAB" :
  avg < 2.5 ? "TARGET_MET_APPROACH_1_5MS" :
  "AVERAGE_REQUIRE_OPTIMIZATION";

console.log(JSON.stringify({
  url,
  runs,
  averageApiMs: Number(avg.toFixed(3)),
  minApiMs: Number(min.toFixed(3)),
  maxApiMs: Number(max.toFixed(3)),
  spikesAbove10ms: spikes,
  decision
}, null, 2));
