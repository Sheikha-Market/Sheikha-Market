'use strict';

const LABELS = {
  REGISTERED: 'مسجل',
  RIGHTS_REVIEWED: 'مراجعة الحقوق',
  SECURITY_REVIEWED: 'مراجعة الأمن',
  EVALUATED: 'مقيّم',
  CANARY: 'تجربة Canary',
  COMMERCIAL_APPROVED: 'اعتماد تجاري',
  SUSPENDED: 'معلق',
  RETIRED: 'متقاعد'
};

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

async function loadStatus() {
  try {
    const response = await fetch('/api/sheikha/model-hub/v1/status', {
      headers: { accept: 'application/json' }
    });
    if (!response.ok) throw new Error('status unavailable');
    const status = await response.json();

    setText('hubStatus', status.status === 'ACTIVE_WITH_GOVERNED_LIMITS' ? 'نشط بحدود محكومة' : status.status);
    setText('pilotStatus', status.release.governedPrivatePilotReady ? 'جاهزة بعقد' : 'غير جاهزة');
    setText('largeModelStatus', status.release.commercialLargeModelReady ? 'جاهز' : 'لم يكتمل');

    const lifecycle = document.getElementById('lifecycle');
    status.lifecycle.forEach((stage, index) => {
      const item = document.createElement('li');
      const number = document.createElement('b');
      const label = document.createElement('span');
      number.textContent = String(index + 1).padStart(2, '0');
      label.textContent = LABELS[stage] || stage;
      item.append(number, label);
      lifecycle.append(item);
    });

    const capabilities = document.getElementById('capabilities');
    status.components.forEach((component) => {
      const row = document.createElement('div');
      row.className = 'capability-row';
      const name = document.createElement('span');
      const state = document.createElement('span');
      name.textContent = component.id.replaceAll('_', ' ');
      state.textContent = component.status.replaceAll('_', ' ');
      row.append(name, state);
      capabilities.append(row);
    });
  } catch (_error) {
    setText('hubStatus', 'تعذر التحقق');
    setText('pilotStatus', 'تحقق من Runtime');
    setText('largeModelStatus', 'غير معلن');
  }
}

document.addEventListener('DOMContentLoaded', loadStatus);
