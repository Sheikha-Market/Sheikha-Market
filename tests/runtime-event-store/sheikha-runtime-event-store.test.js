"use strict";

jest.mock("../../core/runtime/metrics-engine/sheikha-runtime-metrics-engine", () => ({
  buildUnifiedRuntimeMetrics: () => ({
    system: "SHEIKHA_UNIFIED_RUNTIME_METRICS_ENGINE",
    status: "ACTIVE",
    mode: "UNIFIED_READ_ONLY_RUNTIME_METRICS",
    metrics: {
      cpu: { cores: 8, load1m: 0.1, load5m: 0.1, load15m: 0.1 },
      memory: { usedPercent: 25 },
      gpu: { available: false },
      network: { listeningPortsDetected: 2 },
      services: { pm2Available: true, dockerAvailable: true },
      process: { pid: 1, uptimeSeconds: 1 }
    },
    health: { score: 100, status: "HEALTHY" },
    readiness: { overall: "UNIFIED_METRICS_READY" },
    governance: {
      readOnly: true,
      noHarm: true,
      tawhid: "الله وحده لا شريك له"
    },
    timestamp: "2026-06-29T00:00:00.000Z"
  })
}));

const {
  buildRuntimeEventStore,
  buildEventStoreProbe,
  normalizeEventRecord
} = require("../../core/runtime/event-store/sheikha-runtime-event-store");

describe("Sheikha Runtime Event Store", () => {
  test("builds a read-only event store plan from routed events and audit readiness", () => {
    const store = buildRuntimeEventStore();

    expect(store.system).toBe("SHEIKHA_RUNTIME_EVENT_STORE");
    expect(store.status).toBe("ACTIVE");
    expect(store.mode).toBe("READ_ONLY_EVENT_STORE_PLAN");
    expect(store.blocked).toBe(false);
    expect(store.reason).toBeNull();
    expect(store.records.length).toBeGreaterThan(0);
    expect(store.summary.totalRecords).toBe(store.records.length);
    expect(store.summary.stored).toBe(store.records.length);
    expect(store.summary.evidenceReady).toBe(true);
    expect(store.readiness.eventRouterIntegrationReady).toBe(true);
    expect(store.readiness.auditIntegrationReady).toBe(true);
    expect(store.readiness.replayFoundationReady).toBe(true);
    expect(store.readiness.streamFoundationReady).toBe(true);
    expect(store.readiness.overall).toBe("RUNTIME_EVENT_STORE_READY");
    expect(store.governance.readOnly).toBe(true);
    expect(store.governance.noDatabaseWrite).toBe(true);
    expect(store.governance.noShellExecution).toBe(true);
    expect(store.governance.tawhid).toBe("الله وحده لا شريك له");
  });

  test("normalizes routed event records for future replay and stream foundations", () => {
    const probe = buildEventStoreProbe();

    expect(probe.system).toBe("SHEIKHA_RUNTIME_EVENT_STORE_PROBE");
    expect(probe.status).toBe("ACTIVE");
    expect(probe.readiness.overall).toBe("RUNTIME_EVENT_STORE_PROBE_READY");
    expect(probe.record.sequence).toBe(1);
    expect(probe.record.eventType).toBe("COMMAND_ROUTED");
    expect(probe.record.status).toBe("STORED_PLAN_ONLY");
    expect(probe.record.evidenceHash).toBeTruthy();
  });

  test("marks blocked routed records as store blocked without mutation", () => {
    const record = normalizeEventRecord({
      status: "BLOCKED",
      event: {
        id: "evt-test",
        type: "POLICY_BLOCKED",
        evidenceHash: "hash-test",
        createdAt: "2026-06-29T00:00:00.000Z"
      },
      subscribers: ["audit"],
      deliveries: []
    }, 4);

    expect(record.sequence).toBe(5);
    expect(record.eventId).toBe("evt-test");
    expect(record.status).toBe("STORE_BLOCKED");
    expect(record.subscriberCount).toBe(1);
    expect(record.deliveryCount).toBe(0);
  });
});
