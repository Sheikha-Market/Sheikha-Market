// Sheikha Fully Automated Real Cash-Flow & Quote-to-Cash Engine
const fs = require('fs');
const path = require('path');

module.exports = function(app) {
  const express = require('express');
  app.use(express.json());

  const dbPath = path.join(__dirname, '../direct_drive_governed_vault_v247/master_b_governed_editable/real_leads_and_cashflow.json');

  const catalog = [
    { id: 'CAT-01', name: 'توريد نحاس سكراب / سبائك نحاس نقية (بالطن)', price_sar: 28500, unit: 'طن', min_qty: 1, category: 'METALS' },
    { id: 'CAT-02', name: 'توريد ألمنيوم وحديد صناعي مفروز (بالطن)', price_sar: 7200, unit: 'طن', min_qty: 5, category: 'METALS' },
    { id: 'CAT-03', name: 'سيليكون حيوي ومواد خام صناعية قياسية', price_sar: 14500, unit: 'طن', min_qty: 1, category: 'BIO_SILICON' },
    { id: 'CAT-04', name: 'وساطة توريد وتعاقدات صناعية (B2B Brokerage)', price_sar: 5000, unit: 'عقد', min_qty: 1, category: 'BROKERAGE' },
    { id: 'CAT-05', name: 'ترخيص وربط نظام الفوترة الإلكترونية ZATCA Phase-2 والأتمتة', price_sar: 3500, unit: 'نظام', min_qty: 1, category: 'TECH_SERVICE' }
  ];

  function loadDB() {
    try { return JSON.parse(fs.readFileSync(dbPath, 'utf8')); }
    catch(e) { return { iban: 'SA4005000068206162118000', real_quotes: [], confirmed_transfers_sar: 0, pending_advance_payments_sar: 0 }; }
  }

  function saveDB(data) {
    data.updated_at = new Date().toISOString();
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
  }

  app.get('/api/v61/auto-cashflow/catalog', (req, res) => {
    res.json({ catalog, db: loadDB() });
  });

  // توليد عرض سعر فوري + مطالبة دفعة مقدمة 50% + رابط إغلاق واتساب
  app.post('/api/v61/auto-cashflow/instant-quote', (req, res) => {
    const b = req.body || {};
    const item = catalog.find(x => x.id === b.item_id) || catalog[0];
    const qty = Math.max(1, Number(b.qty) || 1);
    const customPrice = Number(b.custom_price) > 0 ? Number(b.custom_price) : item.price_sar;

    const subtotal = +(qty * customPrice).toFixed(2);
    const vat15 = +(subtotal * 0.15).toFixed(2);
    const totalSar = +(subtotal + vat15).toFixed(2);
    const advance50Sar = +(totalSar * 0.50).toFixed(2);

    const quoteId = 'SHK-Q-' + Date.now().toString().slice(-6);
    const clientName = b.client_name || 'عميل تجاري مباشر';
    const clientPhone = b.client_phone || '0500000000';
    const clientCity = b.client_city || 'الخبر / المنطقة الشرقية';

    const waText = encodeURIComponent(
      `السلام عليكم، تم إصدار عرض السعر الفوري رقم (${quoteId}) من منظومة شيخة:
` +
      `• العميل: ${clientName} (${clientCity})
` +
      `• الصنف: ${item.name}
` +
      `• الكمية: ${qty} ${item.unit}
` +
      `• الإجمالي شامل الضريبة: ${totalSar.toLocaleString()} ريال
` +
      `• الدفعة المقدمة المطلوبة للتنفيذ الفوري (50%): ${advance50Sar.toLocaleString()} ريال
` +
      `• آيبان مصرف الإنماء المعتمد: SA4005000068206162118000
` +
      `يرجى إرفاق إيصال التحويل البنكي لاعتماد التوريد الفوري.`
    );

    const record = {
      quote_id: quoteId,
      timestamp: new Date().toISOString(),
      client_name: clientName,
      client_phone: clientPhone,
      client_city: clientCity,
      item_id: item.id,
      item_name: item.name,
      qty: qty,
      unit: item.unit,
      unit_price_sar: customPrice,
      subtotal_sar: subtotal,
      vat_15_sar: vat15,
      total_sar: totalSar,
      advance_50_required_sar: advance50Sar,
      payment_iban: 'SA4005000068206162118000',
      payment_status: 'AWAITING_BANK_TRANSFER_RECEIPT',
      whatsapp_Trigger_url: `https://wa.me/${clientPhone.replace(/^0/, '966')}?text=${waText}`
    };

    const db = loadDB();
    db.real_quotes.unshift(record);
    db.pending_advance_payments_sar = +((db.pending_advance_payments_sar || 0) + advance50Sar).toFixed(2);
    saveDB(db);

    res.json({ success: true, quote: record, summary: db });
  });

  // تأكيد استلام التحويل البنكي الفعلي في الحساب وتحويله إلى تدفق نقدي محقق
  app.post('/api/v61/auto-cashflow/confirm-payment', (req, res) => {
    const { quote_id, bank_ref } = req.body || {};
    const db = loadDB();
    const q = db.real_quotes.find(x => x.quote_id === quote_id);
    if (!q) return res.status(404).json({ success: false, message: 'Quote not found' });

    if (q.payment_status !== 'PAID_AND_CLEARED') {
      q.payment_status = 'PAID_AND_CLEARED';
      q.bank_transfer_ref = bank_ref || ('ALINMA-REF-' + Date.now().toString().slice(-5));
      q.paid_at = new Date().toISOString();
      db.confirmed_transfers_sar = +((db.confirmed_transfers_sar || 0) + q.advance_50_required_sar).toFixed(2);
      db.pending_advance_payments_sar = Math.max(0, +((db.pending_advance_payments_sar || 0) - q.advance_50_required_sar).toFixed(2));
      saveDB(db);
    }
    res.json({ success: true, confirmed_quote: q, summary: db });
  });

  // توليد وثيقة عرض سعر / فاتورة مبدئية رسمية جاهزة للطباعة أو الحفظ كـ PDF للمحاسبة والبنوك
  app.get('/api/v61/auto-cashflow/print/:quote_id', (req, res) => {
    const db = loadDB();
    const q = (db.real_quotes || []).find(x => x.quote_id === req.params.quote_id) || (db.real_quotes || [])[0];
    if (!q) return res.status(404).send('Quote Not Found');

    const isPaid = q.payment_status === 'PAID_AND_CLEARED';
    const docHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>عرض سعر وفاتورة مبدئية - ${q.quote_id}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, sans-serif; color: #111; background: #fff; margin: 0; padding: 30px; }
    .sheet { max-width: 820px; margin: 0 auto; border: 2px solid #0f172a; padding: 28px; border-radius: 8px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #d4af37; padding-bottom: 16px; margin-bottom: 20px; }
    .title { font-size: 1.4rem; font-weight: 900; color: #0f172a; margin: 0; }
    .meta { font-size: 0.88rem; line-height: 1.7; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 0.9rem; }
    th, td { border: 1px solid #cbd5e1; padding: 10px 12px; text-align: right; }
    th { background: #0f172a; color: #fff; }
    .totals { width: 340px; margin-right: auto; }
    .bank-box { background: #f8fafc; border: 2px dashed #0f172a; padding: 16px; border-radius: 8px; margin-top: 20px; line-height: 1.8; font-size: 0.92rem; }
    .stamp { display: inline-block; border: 3px double ${isPaid ? '#059669' : '#d97706'}; color: ${isPaid ? '#059669' : '#d97706'}; padding: 8px 18px; font-weight: 900; border-radius: 6px; transform: rotate(-4deg); margin-top: 10px; }
    @media print { .no-print { display: none; } body { padding: 0; } .sheet { border: none; } }
  </style>
</head>
<body>
  <div class="no-print" style="max-width:820px; margin:0 auto 14px; text-align:left;">
    <button onclick="window.print()" style="background:#0f172a; color:#eab308; border:none; padding:10px 20px; border-radius:6px; font-weight:900; cursor:pointer;">🖨️ طباعة / حفظ كملف PDF رسمي للعميل</button>
  </div>
  <div class="sheet">
    <div class="header">
      <div>
        <h1 class="title">منظومة شيخة للتجارة والصناعة والمعادن</h1>
        <div class="meta">بوابة التعاقدات والتوريد الفوري (sheikha.market / sheikha.top)<br>المنطقة الشرقية - الخبر / الدمام | الرقم الضريبي: 310123456700003</div>
      </div>
      <div style="text-align:left;" class="meta">
        <strong>فاتورة مبدئية / عرض سعر رسمي</strong><br>
        الرقم المرجعي: <strong>${q.quote_id}</strong><br>
        التاريخ: ${q.timestamp.slice(0,10)}
      </div>
    </div>

    <div class="meta" style="background:#f1f5f9; padding:12px 16px; border-radius:6px;">
      <strong>السادة / العميل:</strong> ${q.client_name} &nbsp;|&nbsp; <strong>المدينة:</strong> ${q.client_city} &nbsp;|&nbsp; <strong>الجوال:</strong> ${q.client_phone}
    </div>

    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>البيان / الصنف المعتمد</th>
          <th>الكمية</th>
          <th>الوحدة</th>
          <th>سعر الوحدة (SAR)</th>
          <th>الإجمالي قبل الضريبة (SAR)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td><strong>${q.item_name}</strong></td>
          <td>${q.qty}</td>
          <td>${q.unit}</td>
          <td>${Number(q.unit_price_sar).toLocaleString()}</td>
          <td><strong>${Number(q.subtotal_sar).toLocaleString()}</strong></td>
        </tr>
      </tbody>
    </table>

    <table class="totals">
      <tr><th>الإجمالي الخاضع للضريبة</th><td>${Number(q.subtotal_sar).toLocaleString()} ريال</td></tr>
      <tr><th>ضريبة القيمة المضافة (15% VAT)</th><td>${Number(q.vat_15_sar).toLocaleString()} ريال</td></tr>
      <tr><th>الإجمالي الشامل</th><td><strong>${Number(q.total_sar).toLocaleString()} ريال</strong></td></tr>
      <tr style="background:#fef9c3;"><th>الدفعة المقدمة للتنفيذ الفوري (50%)</th><td><strong style="color:#047857; font-size:1.05rem;">${Number(q.advance_50_required_sar).toLocaleString()} ريال</strong></td></tr>
    </table>

    <div class="bank-box">
      <strong>🏦 تعليمات التحويل البنكي المباشر (اعتماد التوريد والتشغيل الفوري):</strong><br>
      • <strong>البنك:</strong> مصرف الإنماء (Alinma Bank)<br>
      • <strong>رقم الآيبان المعتمد (IBAN):</strong> <span style="font-family:monospace; font-size:1.05rem; font-weight:900;">${q.payment_iban}</span><br>
      • <strong>المبلغ المطلوب تحويله للبدء الفوري (50%):</strong> <strong>${Number(q.advance_50_required_sar).toLocaleString()} ريال سعودي</strong> (يرجى كتابة رقم العرض <code>${q.quote_id}</code> في ملاحظات الحوالة).
    </div>

    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:24px;">
      <div class="meta">تم الإصدار آلياً عبر محرك شيخة التجاري V328 / V61</div>
      <div class="stamp">${isPaid ? '✅ مدفوع ومعتمد للتوريد (' + q.bank_transfer_ref + ')' : '⏳ معتمد — بانتظار إيداع الدفعة المقدمة 50%'}</div>
    </div>
  </div>
</body>
</html>`;
    res.send(docHtml);
  });

};
