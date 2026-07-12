'use strict';

/* global crypto, document, window */

const state = {
  auditSha256: null,
  healthReady: false,
  chatReady: false,
  inspectorReady: false,
  loading: false
};

function nativeInvoke(command, argumentsValue) {
  const invoke = window.__TAURI__?.core?.invoke;
  if (typeof invoke !== 'function') {
    return Promise.reject(new Error('TAURI_INVOKE_UNAVAILABLE'));
  }
  return invoke(command, argumentsValue);
}

function createRequestId() {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `native-v4-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function governedRequest(capability, payload = {}) {
  const response = await nativeInvoke('governed_request', {
    request: {
      requestId: createRequestId(),
      actorId: 'human-desktop-user',
      capability,
      payload,
      humanApproval: null
    }
  });
  if (response.auditRecorded && response.auditSha256) {
    state.auditSha256 = response.auditSha256;
    const auditState = document.getElementById('audit-state');
    auditState.textContent = `مسجل · ${response.auditSha256.slice(0, 12)}`;
  }
  return response;
}

function setStatusCard(id, value, detail, ready) {
  const card = document.getElementById(id);
  card.dataset.state = ready ? 'ready' : 'error';
  card.querySelector('strong').textContent = value || 'غير متاح';
  if (detail) card.querySelector('small').textContent = detail;
}

function statusText(value, fallback = 'UNKNOWN') {
  return String(value || fallback).replaceAll('_', ' ');
}

async function loadRuntimeHealth() {
  try {
    const response = await governedRequest('runtime.health.read');
    const status = response.data?.data?.status || response.data?.status;
    state.healthReady = response.ok && status === 'ok';
    setStatusCard(
      'status-health',
      state.healthReady ? 'HEALTHY' : statusText(status),
      response.data?.message || 'الخادم المحلي',
      state.healthReady
    );
    return response;
  } catch (error) {
    setStatusCard('status-health', 'OFFLINE', String(error), false);
    state.healthReady = false;
    return null;
  }
}

async function loadDistributionV2() {
  try {
    const response = await governedRequest('distribution.v2.read');
    setStatusCard(
      'status-v2',
      statusText(response.data?.status),
      `${response.data?.builtCount || 0} مبني · ${response.data?.nativeVerifiedCount || 0} Native`,
      response.ok
    );
    return response;
  } catch (error) {
    setStatusCard('status-v2', 'UNAVAILABLE', String(error), false);
    return null;
  }
}

async function loadDistributionV3() {
  try {
    const response = await governedRequest('distribution.v3.read');
    setStatusCard(
      'status-v3',
      statusText(response.data?.status),
      `${response.data?.eligibilityRecordCount || 0} أهلية · ${response.data?.nativeVerifiedCount || 0} Native`,
      response.ok
    );
    return response;
  } catch (error) {
    setStatusCard('status-v3', 'UNAVAILABLE', String(error), false);
    return null;
  }
}

async function loadBareMetal() {
  try {
    const response = await governedRequest('bare-metal.status.read');
    const limitations = Array.isArray(response.data?.limitations) ? response.data.limitations : [];
    const verified = limitations.some((value) => value.includes('Bare-Metal boot is verified'));
    setStatusCard(
      'status-bare-metal',
      verified ? 'VERIFIED QEMU UEFI' : 'EVIDENCE LIMITED',
      'x86_64 · لا يثبت العتاد الفعلي',
      response.ok && verified
    );
    return response;
  } catch (error) {
    setStatusCard('status-bare-metal', 'UNAVAILABLE', String(error), false);
    return null;
  }
}

async function loadL24() {
  try {
    const response = await governedRequest('l24.apex.read');
    const l24 = response.data?.data?.layerModel?.l24;
    setStatusCard(
      'status-l24',
      l24 ? 'ACTIVE' : statusText(response.data?.data?.status),
      l24 || 'القمة الإدراكية المحكومة',
      response.ok && Boolean(l24)
    );
    return response;
  } catch (error) {
    setStatusCard('status-l24', 'UNAVAILABLE', String(error), false);
    return null;
  }
}

async function loadRegistry() {
  try {
    const response = await governedRequest('distribution.v31.registry.read');
    const artifactCount = response.data?.artifactCount || response.data?.artifacts?.length || 0;
    setStatusCard(
      'status-registry',
      response.ok ? 'LOCAL VERIFIED' : 'UNAVAILABLE',
      `${artifactCount} artifacts · v3.1`,
      response.ok
    );
    return response;
  } catch (error) {
    setStatusCard('status-registry', 'UNAVAILABLE', String(error), false);
    return null;
  }
}

async function loadChatStatus() {
  try {
    const response = await governedRequest('chat.status.read');
    state.chatReady = response.ok;
    const element = document.getElementById('chat-backend-state');
    element.textContent = response.ok ? 'متصل ومحكوم' : 'غير متاح';
    return response;
  } catch (error) {
    document.getElementById('chat-backend-state').textContent = 'غير متاح';
    state.chatReady = false;
    return null;
  }
}

function renderInspector(data) {
  const health = data?.health || {};
  const runtime = data?.runtime || {};
  const diagnostics = health?.diagnostics || {};
  document.getElementById('inspector-overall').textContent = statusText(health.overall || data?.status);
  document.getElementById('inspector-runtime').textContent = statusText(health.runtime);
  document.getElementById('inspector-governance').textContent = statusText(health.governance);
  document.getElementById('inspector-native').textContent = statusText(health.nativeDesktopV31);
  document.getElementById('inspector-extension').textContent = statusText(health.extension);
  document.getElementById('inspector-diagnostics').textContent = `${diagnostics.errors || 0} errors · ${diagnostics.warnings || 0} warnings`;
  document.getElementById('inspector-resources').textContent = `${runtime.cpuLoad1m ?? '-'} / ${runtime.ramUsedPercent ?? '-'}%`;
  document.getElementById('inspector-updated').textContent = data?.generatedAt || new Date().toISOString();
}

async function loadInspector() {
  try {
    const response = await governedRequest('inspector.status.read');
    state.inspectorReady = response.ok && Boolean(response.data?.inspector);
    document.getElementById('inspector-state').textContent = state.inspectorReady ? 'HEALTHY' : 'DEGRADED';
    renderInspector(response.data);
    return response;
  } catch (error) {
    state.inspectorReady = false;
    document.getElementById('inspector-state').textContent = 'UNAVAILABLE';
    document.getElementById('inspector-overall').textContent = String(error);
    return null;
  }
}

function appendMessage(role, text) {
  const stream = document.getElementById('chat-stream');
  const message = document.createElement('div');
  message.className = `message ${role === 'user' ? 'user-message' : 'assistant-message'}`;
  const label = document.createElement('span');
  label.textContent = role === 'user' ? 'أنت' : 'شيخة';
  const body = document.createElement('p');
  body.textContent = text;
  message.append(label, body);
  stream.append(message);
  stream.scrollTop = stream.scrollHeight;
}

function chatResponseText(data) {
  const candidates = [
    data?.response,
    data?.reply,
    data?.answer,
    data?.message,
    data?.result?.response,
    data?.result?.reply,
    data?.result?.answer
  ];
  const response = candidates.find((value) => typeof value === 'string' && value.trim());
  if (response) return response;
  return 'تمت معالجة الطلب عبر مسار المحادثة المحكوم.';
}

async function submitChat(event) {
  event.preventDefault();
  if (state.loading) return;
  const input = document.getElementById('chat-input');
  const button = document.getElementById('chat-send');
  const message = input.value.trim();
  if (!message) return;
  appendMessage('user', message);
  input.value = '';
  state.loading = true;
  button.disabled = true;
  button.textContent = 'جاري الإرسال';
  try {
    const response = await governedRequest('chat.message.submit', { message, mode: 'smart' });
    appendMessage('assistant', chatResponseText(response.data));
  } catch (error) {
    appendMessage('assistant', `تعذر الاتصال بالمسار المحلي: ${String(error)}`);
  } finally {
    state.loading = false;
    button.disabled = false;
    button.textContent = 'إرسال';
  }
}

function activateView(viewName) {
  document.querySelectorAll('.tab-button').forEach((button) => {
    button.classList.toggle('active', button.dataset.view === viewName);
  });
  document.querySelectorAll('.view').forEach((view) => {
    view.classList.toggle('active', view.id === `view-${viewName}`);
  });
}

async function signalNativeSmoke() {
  const windowReady = Boolean(document.getElementById('chat-stream') && document.getElementById('inspector-overall'));
  const markers = {
    health: state.healthReady,
    chat: state.chatReady,
    inspector: state.inspectorReady,
    window: windowReady
  };
  try {
    const response = await nativeInvoke('native_smoke_ready', { markers });
    if (response.ok) {
      const marker = document.getElementById('native-smoke-marker');
      marker.dataset.ready = 'true';
      document.title = 'شيخة | سطح المكتب | NATIVE V4 READY';
      document.getElementById('native-state').textContent = 'NATIVE VERIFIED READY';
    }
  } catch (_) {
    document.title = 'شيخة | سطح المكتب | DEGRADED';
    document.getElementById('native-state').textContent = 'NATIVE DEGRADED';
  }
}

async function refreshAll() {
  const button = document.getElementById('refresh-all');
  button.disabled = true;
  await Promise.all([
    loadRuntimeHealth(),
    loadDistributionV2(),
    loadDistributionV3(),
    loadBareMetal(),
    loadL24(),
    loadRegistry(),
    loadChatStatus(),
    loadInspector()
  ]);
  document.getElementById('last-refresh').textContent = new Date().toLocaleTimeString('ar-SA');
  button.disabled = false;
  await signalNativeSmoke();
}

document.querySelectorAll('.tab-button').forEach((button) => {
  button.addEventListener('click', () => activateView(button.dataset.view));
});
document.getElementById('refresh-all').addEventListener('click', refreshAll);
document.getElementById('chat-form').addEventListener('submit', submitChat);
window.addEventListener('DOMContentLoaded', refreshAll, { once: true });
