'use strict';

const shellModules = Object.freeze([
  { id: 'dashboard', labelAr: 'الرئيسية', role: 'executive-overview' },
  { id: 'commerce', labelAr: 'التجارة', role: 'markets-orders-opportunities' },
  { id: 'knowledge', labelAr: 'المعرفة', role: 'products-policies-standards' },
  { id: 'governance', labelAr: 'الحوكمة', role: 'approval-risk-audit' },
  { id: 'ai', labelAr: 'شيخة AI', role: 'contextual-assistant' },
  { id: 'ide', labelAr: 'IDE', role: 'developer-workspace' },
  { id: 'analytics', labelAr: 'التحليلات', role: 'metrics-insights' },
  { id: 'integrations', labelAr: 'التكاملات', role: 'apis-sdks-connectors' },
  { id: 'settings', labelAr: 'الإعدادات', role: 'identity-permissions' }
]);

const designTokens = Object.freeze({
  colors: {
    primary: '#063d2e',
    primaryDeep: '#05291f',
    gold: '#d9aa24',
    background: '#f5f1e7',
    surface: '#ffffff',
    surfaceSoft: '#f8f6ee',
    border: '#e5ddc9',
    success: '#1f8a4c',
    warning: '#d9aa24',
    danger: '#b42318',
    info: '#2563eb'
  },
  radius: {
    card: 24,
    pill: 999,
    button: 14
  },
  spacing: [8, 16, 24, 32, 48, 64],
  typography: {
    display: 64,
    hero: 48,
    section: 36,
    card: 24,
    body: 18,
    caption: 14,
    small: 12
  }
});

function transformTechnicalResultToHuman(result = {}) {
  const data = result.payload?.data || result.data || result;

  return {
    system: 'SHEIKHA_ENTERPRISE_UI_SHELL_V1',
    status: 'READY',
    mode: 'HUMAN_FIRST_TECHNICAL_ON_DEMAND',
    summary: {
      title: data.name || data.product?.name || 'عنصر تجاري',
      status: data.status || data.governance?.status || 'قيد المراجعة',
      category: data.category || data.product?.category || 'غير مصنف',
      quality: data.quality?.score ?? data.quality?.grade ?? 'غير محدد',
      risk: data.risk?.level || 'غير محدد',
      price: data.price?.amount ? `${data.price.amount} ${data.price.currency || 'SAR'}` : 'غير محدد'
    },
    actions: [
      'فتح التفاصيل',
      'عرض التقرير الفني',
      'طلب مراجعة',
      'اعتماد',
      'أرشفة'
    ],
    technical: result,
    safety: {
      hideJsonByDefault: true,
      advancedModeAvailable: true,
      noHarm: true
    }
  };
}

function buildEnterpriseShellState() {
  return {
    system: 'SHEIKHA_ENTERPRISE_UI_SHELL_V1',
    status: 'ACTIVE',
    direction: 'rtl',
    modules: shellModules,
    designTokens,
    layout: {
      shell: true,
      unifiedNavigation: true,
      contextualAssistant: true,
      humanReadableCards: true,
      developerAdvancedMode: true,
      breadcrumbs: true,
      timeline: true,
      actionBar: true
    }
  };
}

module.exports = {
  shellModules,
  designTokens,
  transformTechnicalResultToHuman,
  buildEnterpriseShellState
};
