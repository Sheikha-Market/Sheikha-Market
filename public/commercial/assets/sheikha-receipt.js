'use strict';

document.addEventListener('DOMContentLoaded', async () => {
  const match = /^#([a-f0-9]{64}):([a-f0-9]{64})$/.exec(location.hash);
  window.history.replaceState(null, '', location.pathname);
  const status = document.getElementById('receiptStatus');
  try {
    if (!match) throw new Error('INVALID_RECEIPT');
    const response = await fetch(`/api/commercial/v1/receipts/${match[1]}`, {
      headers: { Authorization: `Bearer ${match[2]}` }, cache: 'no-store'
    });
    const body = await response.json();
    if (!response.ok || !body.success) throw new Error('RECEIPT_UNAVAILABLE');
    status.textContent = 'طلبك محفوظ وبانتظار مراجعة البائع.';
    const values = [['مرجع الطلب', body.orderId], ['السعر الأساسي', `${body.subtotalSar} ريال`],
      ['الضريبة والإجمالي', 'بانتظار العرض المعتمد'], ['المحصّل', 'لم يتم تحصيل مبلغ'], ['بدء التنفيذ', 'لم يُعتمد بعد']];
    for (const [label, value] of values) {
      const dt = document.createElement('dt'); dt.textContent = label;
      const dd = document.createElement('dd'); dd.textContent = value;
      document.getElementById('receiptDetails').append(dt, dd);
    }
  } catch {
    status.textContent = 'تعذر عرض الإيصال. افتح رابط الإيصال الخاص من تأكيد طلبك، ولا تشاركه مع الآخرين.';
  }
});
