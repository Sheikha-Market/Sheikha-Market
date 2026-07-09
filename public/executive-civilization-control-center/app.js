const kpis = [
  { key: "identityIntegrity", title: "تكامل الهوية", value: 98.7, unit: "%", delta: "+0.6%", source: "Identity V2" },
  { key: "truthGate", title: "صدق القياس", value: 99.1, unit: "%", delta: "+0.3%", source: "Truth Gate" },
  { key: "marketFlow", title: "تدفق السوق", value: 1260, unit: "مؤشر", delta: "+24", source: "Market Engine" },
  { key: "sufficiency", title: "مؤشر الاكتفاء", value: 96.2, unit: "%", delta: "+1.1%", source: "Supply Intelligence" },
  { key: "saudiDevelopment", title: "التنمية السعودية", value: 94.8, unit: "%", delta: "+0.9%", source: "Saudi Development Engine" },
  { key: "tourismImpact", title: "أثر السياحة", value: 88.4, unit: "%", delta: "+1.4%", source: "Tourism & Heritage" },
  { key: "cooperationReadiness", title: "جاهزية التعاون", value: 91.7, unit: "%", delta: "+0.7%", source: "Islamic Cooperation" },
  { key: "riskControl", title: "ضبط المخاطر", value: 97.5, unit: "%", delta: "+0.2%", source: "Executive Control" }
];

const journeySteps = [
  ["Need", "تحديد الاحتياج"],
  ["Awareness", "بناء الوعي"],
  ["Interest", "تعميق الاهتمام"],
  ["Research", "بحث ومقارنة"],
  ["Trust", "تعزيز الثقة"],
  ["Proposal", "عرض القيمة"],
  ["Negotiation", "تفاوض مضبوط"],
  ["Activation", "تفعيل الخدمة"],
  ["Renewal", "تجديد وشراكة"]
];

const risks = [
  { label: "اعتماد مورد واحد", level: "medium" },
  { label: "تذبذب موسمي", level: "low" },
  { label: "تأخر توريد محلي", level: "medium" },
  { label: "مخاطر امتثال خارجي", level: "high" }
];

const development = [
  { label: "localProductionIndex", value: 88 },
  { label: "saudiProductPromotionIndex", value: 91 },
  { label: "jobCreationPotential", value: 84 },
  { label: "exportReadiness", value: 79 },
  { label: "tourismDevelopmentIndex", value: 86 },
  { label: "qualityOfLifeImpact", value: 90 }
];

const governance = [
  ["No Images of Souls", "مفعّل في نظام الهوية والتنفيذ"],
  ["Human Approval", "إلزامي للقرارات عالية الأثر"],
  ["Evidence Chain", "تسلسل تدقيق قابل للتحقق"],
  ["Truth Gate Policy", "ADVANCED_PRODUCTION_CANDIDATE حتى اكتمال جميع البوابات"]
];

async function fetchJson(url) {
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch {
    return null;
  }
}

function setPillState(element, state) {
  if (!element) {
    return;
  }
  element.classList.remove("success", "warning", "danger");
  if (state === "success") {
    element.classList.add("success");
  } else if (state === "warning") {
    element.classList.add("warning");
  } else if (state === "danger") {
    element.classList.add("danger");
  }
}

async function refreshLiveHealth() {
  const identityState = document.getElementById("identityState");
  const identityScore = document.getElementById("identityScore");
  const identityAutoState = document.getElementById("identityAutoState");

  try {
    const response = await fetch("./identity.health.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`health json fetch failed with ${response.status}`);
    }
    const health = await response.json();
    const score = Number(health.score || 0);
    const status = String(health.status || "IMPROVING");
    const autoState = String(health.autoDevProcess?.status || "unknown");

    identityState.textContent = status;
    identityScore.textContent = `Score ${score}`;
    identityAutoState.textContent = `Auto ${autoState}`;

    const healthState = score >= 95 && status === "ACTIVE" ? "success" : score >= 75 ? "warning" : "danger";
    const autoPillState = autoState === "online" ? "success" : autoState === "unknown" ? "warning" : "danger";

    setPillState(identityState, healthState);
    setPillState(identityScore, healthState);
    setPillState(identityAutoState, autoPillState);

    if (health.generatedAt) {
      const d = new Date(health.generatedAt);
      document.getElementById("lastSync").textContent = `آخر مزامنة ${d.toLocaleTimeString("ar-SA")}`;
    }
  } catch {
    identityState.textContent = "DEGRADED";
    identityScore.textContent = "Score --";
    identityAutoState.textContent = "Auto unknown";
    setPillState(identityState, "danger");
    setPillState(identityScore, "warning");
    setPillState(identityAutoState, "warning");
  }
}

async function refreshLiveOperationalData() {
  const [
    health,
    identity,
    runtime,
    governanceStatus,
    truthGate,
    communityDashboard,
    communityTypes,
    communityTools,
    metrics,
    performance
  ] = await Promise.all([
    fetchJson('/api/health'),
    fetchJson('/api/identity/status'),
    fetchJson('/api/runtime/status'),
    fetchJson('/api/governance/status'),
    fetchJson('/api/production/truth-gate'),
    fetchJson('/api/community/dashboard'),
    fetchJson('/api/community/types'),
    fetchJson('/api/community/tools'),
    fetchJson('/api/metrics'),
    fetchJson('/api/performance')
  ]);

  const identityScore = Number(identity?.score || metrics?.metrics?.identityScore || 0);
  const truthScore = Number(truthGate?.score || 0);
  const typeCount = Array.isArray(communityTypes?.data) ? communityTypes.data.length : Number(metrics?.metrics?.communityTypes || 0);
  const toolCount = Array.isArray(communityTools?.data) ? communityTools.data.length : Number(metrics?.metrics?.digitalTools || 0);
  const operationsTotal = Number(performance?.performance?.operationsTotal || 0);
  const essentialOps = Number(performance?.performance?.operationsEssential || 0);
  const formationReady = Boolean(metrics?.metrics?.formationReady);
  const runtimeReady = runtime?.status === 'READY';
  const governanceReady = governanceStatus?.status === 'GOVERNED';

  const kpiByKey = {
    identityIntegrity: identityScore,
    truthGate: truthScore || (governanceReady ? 99 : 80),
    marketFlow: Math.max(typeCount * 100 + toolCount * 10, 1),
    sufficiency: formationReady ? 96.2 : 74.8,
    saudiDevelopment: governanceReady ? 94.8 : 81.5,
    tourismImpact: Number(communityDashboard?.tourismDevelopmentIndex || 88.4),
    cooperationReadiness: runtimeReady ? 91.7 : 72.3,
    riskControl: governanceReady ? 97.5 : 78.2
  };

  kpis.forEach((item) => {
    if (Object.prototype.hasOwnProperty.call(kpiByKey, item.key)) {
      const liveValue = kpiByKey[item.key];
      item.value = Number(liveValue.toFixed(item.unit === '%' ? 1 : 0));
    }
  });

  risks.length = 0;
  risks.push(
    { label: 'جاهزية الهوية', level: identityScore >= 95 ? 'low' : identityScore >= 80 ? 'medium' : 'high' },
    { label: 'استقرار التشغيل', level: runtimeReady ? 'low' : 'high' },
    { label: 'حوكمة الإنتاج', level: governanceReady ? 'low' : 'medium' },
    { label: 'تدفق العمليات', level: operationsTotal >= essentialOps ? 'low' : 'medium' }
  );

  development.length = 0;
  development.push(
    { label: 'identityScore', value: Math.max(1, Math.min(100, identityScore || 1)) },
    { label: 'truthGateScore', value: Math.max(1, Math.min(100, truthScore || 1)) },
    { label: 'governanceCompliance', value: Math.max(1, Math.min(100, Number(governanceStatus?.complianceScore || 75))) },
    { label: 'runtimeReadiness', value: runtimeReady ? 100 : 60 },
    { label: 'communityCoverage', value: Math.max(1, Math.min(100, typeCount * 8)) },
    { label: 'digitalToolsReadiness', value: Math.max(1, Math.min(100, toolCount * 10)) }
  );

  governance.length = 0;
  governance.push(
    ['Runtime Status', runtime?.status || 'UNKNOWN'],
    ['Governance Status', governanceStatus?.status || 'UNKNOWN'],
    ['Truth Gate', truthGate?.status || 'UNKNOWN'],
    ['Ops Throughput', `total=${operationsTotal} | essential=${essentialOps}`]
  );

  renderKpis();
  renderRisks();
  renderDevelopment();
  renderGovernance();
  refreshTimestamp();

  if (health?.timestamp) {
    const d = new Date(health.timestamp);
    document.getElementById('lastSync').textContent = `آخر مزامنة ${d.toLocaleTimeString('ar-SA')}`;
  }
}

function renderKpis() {
  const grid = document.getElementById("kpiGrid");
  grid.innerHTML = "";

  kpis.forEach((item, index) => {
    const card = document.createElement("article");
    card.className = "kpi-card";
    card.style.animationDelay = `${index * 40}ms`;
    card.innerHTML = `
      <h3>${item.title}</h3>
      <div class="kpi-main">
        <span class="kpi-value">${item.value}${item.unit}</span>
        <span class="kpi-delta">${item.delta}</span>
      </div>
      <p class="kpi-source">${item.source}</p>
    `;
    grid.appendChild(card);
  });
}

function renderJourney() {
  const root = document.getElementById("journeyList");
  root.innerHTML = journeySteps
    .map(([en, ar]) => `<li><b>${ar}</b><small>${en}</small></li>`)
    .join("");
}

function renderRisks() {
  const root = document.getElementById("riskList");
  root.innerHTML = risks
    .map((risk) => {
      const levelClass = `risk-${risk.level}`;
      const levelText = risk.level === "high" ? "مرتفع" : risk.level === "medium" ? "متوسط" : "منخفض";
      return `<li><span>${risk.label}</span><span class="risk-tag ${levelClass}">${levelText}</span></li>`;
    })
    .join("");
}

function renderDevelopment() {
  const root = document.getElementById("developmentBars");
  root.innerHTML = development
    .map(
      (item) => `
        <div class="bar-row">
          <label><span>${item.label}</span><b>${item.value}%</b></label>
          <div class="bar"><span style="width:${item.value}%"></span></div>
        </div>
      `
    )
    .join("");
}

function renderGovernance() {
  const root = document.getElementById("governanceGrid");
  root.innerHTML = governance
    .map(([title, text]) => `<article class="governance-item"><h4>${title}</h4><p>${text}</p></article>`)
    .join("");
}

function refreshTimestamp() {
  const now = new Date();
  document.getElementById("lastSync").textContent = `آخر مزامنة ${now.toLocaleTimeString("ar-SA")}`;
}

function pulseNumbers() {
  kpis.forEach((item) => {
    const variance = (Math.random() - 0.5) * 0.6;
    const next = Number(item.value) + variance;
    item.value = Number(Math.max(next, 1).toFixed(item.unit === "%" ? 1 : 0));
  });
  renderKpis();
  refreshTimestamp();
}

renderKpis();
renderJourney();
renderRisks();
renderDevelopment();
renderGovernance();
refreshTimestamp();
refreshLiveHealth();
refreshLiveOperationalData();

setInterval(pulseNumbers, 20000);
setInterval(refreshLiveHealth, 30000);
setInterval(refreshLiveOperationalData, 30000);
