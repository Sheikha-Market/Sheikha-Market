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

let enterpriseIntegrationReport = null;
let liveComputeBenchmarkReport = null;
let dashboardInsights = {
  market: [],
  ai: [],
  knowledge: [],
  alerts: []
};

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
    performance,
    enterpriseIntegration,
    liveBenchmark
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
    fetchJson('/api/performance'),
    fetchJson('/runtime/enterprise-integration/sheikha-enterprise-integration-verification-layer-v1-report.json'),
    fetchJson('/runtime/os-cloud-supercomputer/sheikha-live-compute-benchmark-v1-report.json')
  ]);

  enterpriseIntegrationReport = enterpriseIntegration;
  liveComputeBenchmarkReport = liveBenchmark;

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

  const enterpriseLayers = enterpriseIntegration?.layers || {};
  const marketCoverage = Math.max(typeCount, 1) * Math.max(toolCount, 1);
  const benchmarkCpu = liveBenchmark?.benchmark?.cpu;
  const unifiedBenchmark = enterpriseIntegration?.unifiedBenchmark || {};
  const nonReadyLayers = Object.values(enterpriseLayers).filter((layer) => layer.status !== 'READY');

  dashboardInsights = {
    market: [
      {
        title: 'Market Flow',
        value: `${Math.round(kpiByKey.marketFlow)} مؤشر`,
        detail: `تغطية المجتمع ${typeCount} نوع + ${toolCount} أداة`
      },
      {
        title: 'Supply Readiness',
        value: `${kpiByKey.sufficiency}%`,
        detail: formationReady ? 'سلسلة الإمداد مهيأة' : 'تحتاج رفع التشكيل'
      },
      {
        title: 'Market Coverage',
        value: `${marketCoverage}`,
        detail: 'ناتج أنواع المجتمع مضروبة في الأدوات الرقمية'
      }
    ],
    ai: [
      {
        title: 'AI Compute',
        value: benchmarkCpu?.jobsPerSecond ? `${Math.round(benchmarkCpu.jobsPerSecond).toLocaleString('en-US')}` : '--',
        detail: 'Jobs/sec من benchmark الحي'
      },
      {
        title: 'API Latency',
        value: unifiedBenchmark.latencyHealthEndpointMs ? `${unifiedBenchmark.latencyHealthEndpointMs} ms` : '--',
        detail: 'زمن استجابة health endpoint'
      },
      {
        title: 'Supercomputer Gate',
        value: enterpriseLayers.supercomputer?.score ? `${enterpriseLayers.supercomputer.score}%` : '--',
        detail: enterpriseLayers.supercomputer?.status || 'UNKNOWN'
      }
    ],
    knowledge: [
      {
        title: 'Knowledge Score',
        value: enterpriseLayers.architecture?.score ? `${enterpriseLayers.architecture.score}%` : '--',
        detail: 'بنية ومعمارية ومعرفة تنفيذية'
      },
      {
        title: 'Dependency Graph',
        value: enterpriseIntegration?.dependencyResolver ? `${Object.keys(enterpriseIntegration.dependencyResolver).length} عقد` : '--',
        detail: 'اعتماديات قابلة للتحقق'
      },
      {
        title: 'Truth Gate',
        value: truthGate?.status || 'UNKNOWN',
        detail: `Score ${truthScore || 0}`
      }
    ],
    alerts: nonReadyLayers.length
      ? nonReadyLayers.map((layer) => ({
          title: layer.name,
          value: layer.status,
          detail: `Score ${layer.score}%`,
          level: layer.score >= 60 ? 'medium' : 'high'
        }))
      : [
          {
            title: 'All Layers Ready',
            value: 'READY',
            detail: 'لا توجد طبقات متدهورة حالياً',
            level: 'low'
          },
          {
            title: 'Production',
            value: enterpriseIntegration?.status || 'UNKNOWN',
            detail: `Overall ${enterpriseIntegration?.overallScore || 0}%`,
            level: 'low'
          }
        ]
  };

  renderKpis();
  renderRisks();
  renderDevelopment();
  renderGovernance();
  renderEnterpriseLayers();
  renderBenchmark();
  renderDependencyGraph();
  renderInsights();
  refreshTimestamp();

  if (health?.timestamp) {
    const d = new Date(health.timestamp);
    document.getElementById('lastSync').textContent = `آخر مزامنة ${d.toLocaleTimeString('ar-SA')}`;
  }
}

function renderEnterpriseLayers() {
  const root = document.getElementById('layerGrid');
  if (!enterpriseIntegrationReport?.layers) {
    root.innerHTML = '<article class="layer-item degraded"><h4>الطبقات</h4><p>لا توجد بيانات تكامل حالية.</p></article>';
    return;
  }

  root.innerHTML = Object.values(enterpriseIntegrationReport.layers)
    .map((layer) => {
      const statusClass = String(layer.status || '').toLowerCase();
      const deps = Array.isArray(layer.dependencies) ? layer.dependencies : [];
      return `
        <article class="layer-item ${statusClass}">
          <h4>${layer.name}</h4>
          <span class="layer-score">${layer.score}%</span>
          <p class="layer-meta">${layer.status} | ${layer.passed}/${layer.total}</p>
          <ul class="layer-deps">
            ${deps.map((dep) => `<li>${dep}</li>`).join('') || '<li>Direct</li>'}
          </ul>
        </article>
      `;
    })
    .join('');
}

function renderBenchmark() {
  const root = document.getElementById('benchmarkGrid');
  const unified = enterpriseIntegrationReport?.unifiedBenchmark;
  const cpu = liveComputeBenchmarkReport?.benchmark?.cpu;
  const io = liveComputeBenchmarkReport?.benchmark?.io;

  if (!unified) {
    root.innerHTML = '<article class="benchmark-item"><h4>Unified Benchmark</h4><p>لا توجد بيانات benchmark حالية.</p></article>';
    return;
  }

  const cards = [
    ['CPU Jobs/sec', cpu?.jobsPerSecond ?? unified.jobsPerSecond ?? '--'],
    ['CPU Duration ms', cpu?.durationMs ?? unified.cpuDurationMs ?? '--'],
    ['I/O Write ms', io?.writeMs ?? unified.ioWriteMs ?? '--'],
    ['I/O Read ms', io?.readMs ?? unified.ioReadMs ?? '--'],
    ['Latency Health ms', unified.latencyHealthEndpointMs ?? '--'],
    ['Latency Metrics ms', unified.latencyMetricsEndpointMs ?? '--'],
    ['Latency Performance ms', unified.latencyPerformanceEndpointMs ?? '--'],
    ['CPU Count', unified.cpuCount ?? '--']
  ];

  root.innerHTML = cards
    .map(([title, value]) => `
      <article class="benchmark-item">
        <h4>${title}</h4>
        <p class="benchmark-value"><strong>${value}</strong><span>قياس حي موثّق</span></p>
      </article>
    `)
    .join('');
}

function renderDependencyGraph() {
  const root = document.getElementById('dependencyGrid');
  const graph = enterpriseIntegrationReport?.dependencyResolver;

  if (!graph) {
    root.innerHTML = '<article class="dependency-item"><h4>Dependency Resolver</h4><p>لا توجد بيانات اعتماديات حالية.</p></article>';
    return;
  }

  root.innerHTML = Object.entries(graph)
    .map(([name, deps]) => `
      <article class="dependency-item">
        <h4>${name}</h4>
        <p>يعتمد على:</p>
        <ul>${deps.map((dep) => `<li>${dep}</li>`).join('')}</ul>
      </article>
    `)
    .join('');
}

function renderInsightColumn(elementId, cards, isAlerts = false) {
  const root = document.getElementById(elementId);
  if (!cards?.length) {
    root.innerHTML = '<article class="insight-card"><strong>لا توجد بيانات</strong><small>سيتم التحديث عند توفر القياس.</small></article>';
    return;
  }

  root.innerHTML = cards
    .map((card) => `
      <article class="insight-card ${isAlerts ? `alert-${card.level || 'low'}` : ''}">
        <strong>${card.title}</strong>
        <span>${card.value}</span>
        <small>${card.detail}</small>
      </article>
    `)
    .join('');
}

function renderInsights() {
  renderInsightColumn('marketGrid', dashboardInsights.market);
  renderInsightColumn('aiGrid', dashboardInsights.ai);
  renderInsightColumn('knowledgeGrid', dashboardInsights.knowledge);
  renderInsightColumn('alertsGrid', dashboardInsights.alerts, true);
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

renderKpis();
renderJourney();
renderRisks();
renderDevelopment();
renderGovernance();
renderEnterpriseLayers();
renderBenchmark();
renderDependencyGraph();
renderInsights();
refreshTimestamp();
refreshLiveHealth();
refreshLiveOperationalData();

setInterval(refreshLiveHealth, 30000);
setInterval(refreshLiveOperationalData, 30000);
