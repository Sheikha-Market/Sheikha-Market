const profiles = {
  owner: {
    title: 'لوحة المالك',
    model: 'نموذج العمل: القيادة العليا، الإيرادات، العقود، التوسع',
    kpis: [['الإيراد المؤكد','0 ر.س'],['العقود','0'],['الفرص','0'],['NO_DRIFT','TRUE']],
    panels: ['ملخص السوق', 'الإيرادات والربحية', 'المخاطر والحوكمة']
  },
  admin: {
    title: 'لوحة الإدارة',
    model: 'نموذج العمل: تشغيل العمليات والتحقق والموافقات',
    kpis: [['المهام','0'],['الموافقات','0'],['العملاء','0'],['الاستقرار','100%']],
    panels: ['إدارة المستخدمين', 'إدارة العمليات', 'مركز التنبيهات']
  },
  supplier: {
    title: 'لوحة المورد',
    model: 'نموذج العمل: عرض البضاعة، الأسعار، الصور، شروط النقل',
    kpis: [['العروض','0'],['البضاعة','0'],['العقود','0'],['المدفوعات','0']],
    panels: ['تسجيل بضاعة', 'العروض السعرية', 'التفويض والعقود']
  },
  buyer: {
    title: 'لوحة المشتري',
    model: 'نموذج العمل: طلب شراء، مقارنة عروض، عقد، دفع',
    kpis: [['طلبات الشراء','0'],['العروض','0'],['العقود','0'],['الفواتير','0']],
    panels: ['طلب عرض سعر', 'مقارنة الموردين', 'العقود والفواتير']
  },
  customer: {
    title: 'لوحة العميل',
    model: 'نموذج العمل: خدمة مرخصة، SLA، فواتير، دعم',
    kpis: [['التراخيص','0'],['SLA','نشط عند العقد'],['الفواتير','0'],['الدعم','جاهز']],
    panels: ['الخدمات المرخصة', 'اتفاقيات SLA', 'الفواتير والدعم']
  },
  finance: {
    title: 'لوحة المالية',
    model: 'نموذج العمل: فاتورة، دفع مؤكد، إيراد، ربح',
    kpis: [['الفواتير','0'],['المدفوع','0 ر.س'],['الربح','0 ر.س'],['المستحق','0 ر.س']],
    panels: ['الفواتير', 'المدفوعات', 'الأرباح والتدفقات']
  },
  governance: {
    title: 'لوحة الحوكمة',
    model: 'نموذج العمل: قرار، قدرة، سياسة، موافقة',
    kpis: [['Governance','ACTIVE'],['Decision','ACTIVE'],['Capability','ACTIVE'],['Drift','NO']],
    panels: ['سجل القرارات', 'سجل القدرات', 'سياسات التشغيل']
  }
};

function render(role='owner'){
  const p = profiles[role];
  document.getElementById('title').textContent = p.title;
  document.getElementById('model').textContent = p.model;
  document.getElementById('kpis').innerHTML = p.kpis.map(x=>`<div class="kpi"><span>${x[0]}</span><b>${x[1]}</b></div>`).join('');
  document.getElementById('workspace').innerHTML = p.panels.map(x=>`<article class="panel"><h2>${x}</h2><p>واجهة تشغيل مخصصة حسب صلاحية المستخدم ونموذج عمل العميل.</p></article>`).join('');
}
document.querySelectorAll('button[data-role]').forEach(b=>b.onclick=()=>render(b.dataset.role));
render('owner');
