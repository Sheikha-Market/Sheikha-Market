'use strict';

const API = '/api/sheikha/technical-experience/v1';
const ROOT_API = '/api/sheikha/root-architecture/v3';
const LEVEL_LABELS = Object.freeze({
  HOST_BOOTSTRAPPED_LANGUAGE_FOUNDATION_VERIFIED:
    'أساس لغوي مستضاف متحقق',
  QEMU_RUNTIME_VERIFIED_SUBSET: 'تحقق تشغيل QEMU',
  FOUNDATION_SUBSETS_VERIFIED: 'مجموعات تأسيسية متحققة',
  TRIAL_KIT_READY_PHYSICAL_PENDING: 'عدة التجربة جاهزة',
  ARTIFACT_BUILT_NATIVE_LIFECYCLE_PENDING: 'أثر مبني، دورة أصلية معلقة',
  NATIVE_LIFECYCLE_VERIFIED: 'دورة حياة أصلية متحققة',
  DECLARED_ACTIVE_REPORT_LIVE_SMOKE_REQUIRED: 'معلن، فحص حي مطلوب',
  LOCAL_GENERATED_EVIDENCE_VERIFIED: 'دليل محلي متحقق',
  EVIDENCE_UNAVAILABLE: 'الدليل غير متاح'
});
const state = {
  status: null,
  architecture: null,
  rootTruth: null,
  products: [],
  telemetryTimer: null,
  animationFrame: null,
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
};

function node(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

async function fetchMeasured(url, options = {}) {
  const started = performance.now();
  const response = await fetch(url, { cache: 'no-store', ...options });
  const text = await response.text();
  const elapsedMs = Math.max(performance.now() - started, 0.01);
  const bytes = new TextEncoder().encode(text).byteLength;
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    throw new Error(`استجابة غير صالحة من ${url}`);
  }
  if (!response.ok || body.ok === false) {
    throw new Error(body.message || `${url}: ${response.status}`);
  }
  return { data: body.data, elapsedMs, bytes };
}

function formatDuration(seconds) {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  if (hours) return `${hours}س ${minutes}د`;
  return `${minutes}د ${total % 60}ث`;
}

function renderTelemetry(result) {
  const telemetry = result.data;
  const throughput = result.bytes / (result.elapsedMs / 1000) / 1024;
  document.getElementById('metric-rtt').textContent = `${result.elapsedMs.toFixed(1)} ms`;
  document.getElementById('metric-throughput').textContent = `${throughput.toFixed(1)} KiB/s`;
  document.getElementById('metric-payload').textContent = `${(result.bytes / 1024).toFixed(1)} KiB`;
  document.getElementById('metric-loop').textContent = `${telemetry.process.eventLoop.observedTurnDelayMs.toFixed(2)} ms`;
  document.getElementById('metric-heap').textContent = `${telemetry.process.memoryMiB.heapUsed.toFixed(1)} MiB`;
  document.getElementById('metric-uptime').textContent = formatDuration(telemetry.process.uptimeSeconds);
}

async function refreshTelemetry() {
  try {
    renderTelemetry(await fetchMeasured(`${API}/telemetry`));
  } catch (error) {
    document.getElementById('metric-rtt').textContent = 'غير متاح';
    document.getElementById('runtime-label').textContent = error.message;
  }
}

function renderArchitecture() {
  const groups = [
    ['central-nodes', state.architecture.central],
    ['edge-nodes', state.architecture.decentralized]
  ];
  for (const [targetId, entries] of groups) {
    const target = document.getElementById(targetId);
    target.replaceChildren();
    for (const entry of entries) {
      const item = node('li');
      item.append(node('strong', '', entry.nameAr));
      item.append(node('span', '', entry.status));
      target.append(item);
    }
  }
}

function renderProgress() {
  const grid = document.getElementById('progress-grid');
  grid.replaceChildren();
  for (const domain of state.rootTruth.domains) {
    const card = node('article', 'progress-item');
    const header = node('header');
    header.append(node('h3', '', domain.titleAr));
    header.append(node(
      'span',
      '',
      LEVEL_LABELS[domain.verificationLevel] || domain.verificationLevel
    ));
    card.append(header);
    card.append(node(
      'p',
      'evidence-declared-status',
      (domain.declaredStatus || 'NO_DECLARED_STATUS').replaceAll('_', ' ')
    ));

    const flags = node('ul', 'evidence-flags');
    const claims = [
      ['مسجّل', domain.claims.registered],
      ['أثر مبني', domain.claims.artifactBuilt],
      ['QEMU', domain.claims.qemuVerified],
      ['دورة أصلية', domain.claims.nativeLifecycleVerified],
      ['جهاز فعلي', domain.claims.physicalHardwareVerified]
    ];
    for (const [label, verified] of claims) {
      flags.append(node(
        'li',
        verified ? 'verified' : 'pending',
        `${verified ? '✓' : '—'} ${label}`
      ));
    }
    card.append(flags);

    const fingerprint = node(
      'code',
      'evidence-fingerprint',
      domain.evidence.sha256
        ? `SHA-256 ${domain.evidence.sha256.slice(0, 12)}…`
        : 'SHA-256 UNAVAILABLE'
    );
    fingerprint.title = domain.evidence.sha256 || 'الدليل غير متاح';
    card.append(fingerprint);
    grid.append(card);
  }
  const summary = state.rootTruth.evidenceSummary;
  document.getElementById('progress-summary').textContent =
    `${summary.domainCount} مجالات، ${summary.artifactBuiltCount} آثار مبنية، ` +
    `${summary.qemuVerifiedCount} عبر QEMU، ` +
    `${summary.nativeLifecycleVerifiedCount} بدورة أصلية، ` +
    `${summary.physicalHardwareVerifiedCount} على جهاز فعلي، ` +
    `${summary.externallyCertifiedCount} اعتماد خارجي.`;
}

function renderProducts() {
  const grid = document.getElementById('product-tech-grid');
  grid.replaceChildren();
  for (const preview of state.products) {
    const card = node('article', 'tech-product');
    card.append(node('span', '', preview.disciplineAr));
    card.append(node('h3', '', preview.product.nameAr));
    card.append(node('p', '', preview.mechanismAr));
    const link = node('a', '', 'افتح الشرح الهندسي');
    link.href = `/product-technical/?id=${encodeURIComponent(preview.product.id)}`;
    card.append(link);
    grid.append(card);
  }
}

function drawNetwork() {
  const canvas = document.getElementById('network-canvas');
  const context = canvas.getContext('2d');
  const rect = canvas.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  if (canvas.width !== Math.round(rect.width * ratio) ||
      canvas.height !== Math.round(rect.height * ratio)) {
    canvas.width = Math.round(rect.width * ratio);
    canvas.height = Math.round(rect.height * ratio);
  }
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, rect.width, rect.height);

  const compact = rect.width < 620;
  const center = {
    x: rect.width * (compact ? 0.64 : 0.7),
    y: rect.height * 0.48,
    w: compact ? 120 : 138,
    h: 54
  };
  const edgeWidth = compact ? 94 : 110;
  const firstEdgeX = rect.width * (compact ? 0.27 : 0.48);
  const secondEdgeX = rect.width * (compact ? 0.84 : 0.87);
  const edges = [
    { x: firstEdgeX, y: rect.height * 0.18, w: edgeWidth, h: 42, label: 'EDGE 01' },
    { x: secondEdgeX, y: rect.height * 0.18, w: edgeWidth, h: 42, label: 'EDGE 02' },
    { x: firstEdgeX, y: rect.height * 0.78, w: edgeWidth, h: 42, label: 'EDGE 03' },
    { x: secondEdgeX, y: rect.height * 0.78, w: edgeWidth, h: 42, label: 'EDGE 04' }
  ];
  const time = state.reducedMotion ? 0.5 : (performance.now() / 4200) % 1;

  context.lineWidth = 1;
  context.font = '11px sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  for (const edge of edges) {
    context.strokeStyle = 'rgba(75, 190, 182, 0.56)';
    context.beginPath();
    context.moveTo(center.x, center.y);
    context.lineTo(edge.x, edge.y);
    context.stroke();

    const packetX = center.x + (edge.x - center.x) * time;
    const packetY = center.y + (edge.y - center.y) * time;
    context.fillStyle = '#e3b94f';
    context.fillRect(packetX - 4, packetY - 4, 8, 8);

    context.fillStyle = 'rgba(5, 39, 32, 0.88)';
    context.strokeStyle = '#2ba4b6';
    context.fillRect(edge.x - edge.w / 2, edge.y - edge.h / 2, edge.w, edge.h);
    context.strokeRect(edge.x - edge.w / 2, edge.y - edge.h / 2, edge.w, edge.h);
    context.fillStyle = '#d8ebe5';
    context.fillText(edge.label, edge.x, edge.y);
  }

  context.fillStyle = '#e3b94f';
  if (compact) {
    context.beginPath();
    context.arc(center.x, center.y, 5, 0, Math.PI * 2);
    context.fill();
  } else {
    context.fillStyle = 'rgba(5, 39, 32, 0.96)';
    context.strokeStyle = '#e3b94f';
    context.lineWidth = 2;
    context.fillRect(
      center.x - center.w / 2,
      center.y - center.h / 2,
      center.w,
      center.h
    );
    context.strokeRect(
      center.x - center.w / 2,
      center.y - center.h / 2,
      center.w,
      center.h
    );
    context.fillStyle = '#ffffff';
    context.font = 'bold 12px sans-serif';
    context.fillText('GOVERNED CONTROL', center.x, center.y);
  }

  if (!state.reducedMotion) state.animationFrame = requestAnimationFrame(drawNetwork);
}

function addAiEvent(name) {
  const list = document.getElementById('ai-events');
  if (!Array.from(list.children).some((item) => item.textContent === name)) {
    list.append(node('li', '', name));
  }
}

function handleSseFrame(frame, timings, output) {
  const eventMatch = frame.match(/^event:\s*(.+)$/m);
  const dataMatch = frame.match(/^data:\s*(.+)$/m);
  if (!eventMatch || !dataMatch) return;
  const eventName = eventMatch[1].trim();
  let data = {};
  try { data = JSON.parse(dataMatch[1]); } catch { return; }
  const elapsed = performance.now() - timings.started;
  addAiEvent(eventName);
  if (eventName === 'ack' && timings.ack === null) {
    timings.ack = elapsed;
    document.getElementById('ai-ack-time').textContent = `${elapsed.toFixed(1)} ms`;
  }
  if (eventName === 'token' && data.text) {
    if (timings.token === null) {
      timings.token = elapsed;
      document.getElementById('ai-token-time').textContent = `${elapsed.toFixed(1)} ms`;
    }
    output.textContent += data.text;
  }
  if (eventName === 'done') {
    timings.done = elapsed;
    document.getElementById('ai-done-time').textContent = `${elapsed.toFixed(1)} ms`;
  }
}

async function runAiProbe() {
  const button = document.getElementById('run-ai-probe');
  const output = document.getElementById('ai-output');
  const status = document.getElementById('ai-state');
  const events = document.getElementById('ai-events');
  const timings = { started: performance.now(), ack: null, token: null, done: null };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  button.disabled = true;
  output.textContent = '';
  events.replaceChildren();
  status.textContent = 'البث قيد القياس';
  for (const id of ['ai-ack-time', 'ai-token-time', 'ai-done-time']) {
    document.getElementById(id).textContent = 'قيد القياس';
  }

  try {
    const response = await fetch('/api/sheikha/live/chat/v1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'قدّم حالة تقنية عربية موجزة للمسار الحي.',
        language: 'ar',
        mode: 'chat',
        fastArabic: true,
        channel: 'technology-observatory'
      }),
      signal: controller.signal
    });
    if (!response.ok || !response.body) throw new Error(`HTTP ${response.status}`);
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
      const frames = buffer.split('\n\n');
      buffer = frames.pop() || '';
      for (const frame of frames) handleSseFrame(frame, timings, output);
      if (done) break;
    }
    if (buffer.trim()) handleSseFrame(buffer, timings, output);
    status.textContent = timings.token === null ? 'اكتمل دون نص مرصود' : 'اكتمل القياس الحي';
  } catch (error) {
    status.textContent = error.name === 'AbortError' ? 'انتهت مهلة الاختبار' : 'تعذر الاختبار';
    output.textContent = `لم يكتمل المسار: ${error.message}`;
  } finally {
    clearTimeout(timeout);
    button.disabled = false;
  }
}

async function activate() {
  try {
    const [
      statusResult,
      architectureResult,
      productsResult,
      rootTruthResult
    ] = await Promise.all([
      fetchMeasured(`${API}/status`),
      fetchMeasured(`${API}/architecture`),
      fetchMeasured(`${API}/products?level=guided`),
      fetchMeasured(`${ROOT_API}/truth-matrix`)
    ]);
    state.status = statusResult.data;
    state.architecture = architectureResult.data;
    state.products = productsResult.data.products;
    state.rootTruth = rootTruthResult.data;
    document.getElementById('runtime-dot').classList.add('ready');
    document.getElementById('runtime-label').textContent = 'القياس المحلي نشط';
    renderArchitecture();
    renderProgress();
    renderProducts();
    await refreshTelemetry();
    state.telemetryTimer = window.setInterval(refreshTelemetry, 5000);
    drawNetwork();
    document.getElementById('run-ai-probe').addEventListener('click', runAiProbe);
  } catch (error) {
    document.getElementById('runtime-dot').classList.add('error');
    document.getElementById('runtime-label').textContent = 'تعذر تحميل المرصد';
    document.getElementById('progress-summary').textContent = error.message;
  }
}

window.addEventListener('resize', () => {
  if (state.reducedMotion) drawNetwork();
});

window.addEventListener('pagehide', () => {
  if (state.telemetryTimer) clearInterval(state.telemetryTimer);
  if (state.animationFrame) cancelAnimationFrame(state.animationFrame);
});

activate();
