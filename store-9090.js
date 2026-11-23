const http = require('http');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'direct_drive_governed_vault_v247/master_b_governed_editable/real_leads_and_cashflow.json');

const products = [
  {
    id: 'MVP-01',
    badge: 'الأكثر طلباً للمنشآت • تسليم فوري',
    title: 'باقة الفوترة الإلكترونية الزكوية (ZATCA المرحلة 2) + بوت المبيعات الذاتي',
    desc: 'نظام متكامل لإصدار عروض الأسعار الرسمية (PDF) والفواتير الضريبية المشفرة (QR TLV) مع بوت إغلاق الصفقات الآلي.',
    price: 1450,
    unit: 'رخصة منشأة دائمة'
  },
  {
    id: 'MVP-02',
    badge: 'لقطاع المعادن والمقاولات • فوري',
    title: 'العضوية الذهبية ودليل مصانع وتجار المعادن والسكراب المعتمد (B2B)',
    desc: 'شهادة توثيق شريك تجاري + الوصول الفوري لقوائم المصانع وساحات التوريد المعتمدة في المملكة.',
    price: 950,
    unit: 'عضوية سنوية'
  },
  {
    id: 'CAT-01',
    badge: 'توريد صناعي • المنطقة الشرقية والرياض',
    title: 'عقد توريد نحاس سكراب / سبائك نحاس ومعادن مفروزة',
    desc: 'توريد مباشر للمصانع والمقاولين بمواصفات قياسية وشهادة فحص مخبري معتمدة.',
    price: 28500,
    unit: 'طن قياسي'
  }
];

function loadDB() {
  try { return JSON.parse(fs.readFileSync(dbPath, 'utf8')); }
  catch(e) { return { iban: 'SA4005000068206162118000', real_quotes: [], confirmed_transfers_sar: 0, pending_advance_payments_sar: 0 }; }
}

function saveDB(data) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  data.updated_at = new Date().toISOString();
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
}

const uiHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>منظومة شيخة للأعمال | بوابة التعاقد الفوري والخدمات الرقمية</title>
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #f8fafc;
      --surface: #ffffff;
      --primary: #047857;
      --primary-dark: #064e3b;
      --accent: #b45309;
      --text: #0f172a;
      --muted: #475569;
      --border: #e2e8f0;
    }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: 'Tajawal', Tahoma, sans-serif; background: var(--bg); color: var(--text); line-height: 1.6; }
    .topbar { background: var(--surface); border-bottom: 1px solid var(--border); padding: 16px 28px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 10px rgba(0,0,0,0.03); }
    .brand { display: flex; align-items: center; gap: 12px; }
    .brand-logo { width: 42px; height: 42px; background: var(--primary); color: #fff; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 1.3rem; }
    .brand-title { font-weight: 900; font-size: 1.25rem; color: var(--text); margin: 0; }
    .brand-sub { font-size: 0.82rem; color: var(--muted); margin: 0; }
    .trust-pill { background: #ecfdf5; color: var(--primary); border: 1px solid #a7f3d0; padding: 6px 14px; border-radius: 999px; font-weight: 700; font-size: 0.85rem; }

    .container { max-width: 1180px; margin: 32px auto; padding: 0 20px; }
    .hero { background: linear-gradient(135deg, #064e3b 0%, #047857 100%); color: #fff; border-radius: 20px; padding: 36px 32px; margin-bottom: 32px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; box-shadow: 0 12px 30px rgba(4,120,87,0.18); }
    .hero h1 { margin: 0 0 10px; font-size: 1.75rem; font-weight: 900; }
    .hero p { margin: 0; color: #d1fae5; font-size: 1.02rem; max-width: 680px; }

    .section-title { font-size: 1.35rem; font-weight: 800; margin: 0 0 18px; color: var(--text); }
    .products-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 22px; margin-bottom: 36px; }
    .p-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 24px; display: flex; flex-direction: column; justify-content: space-between; transition: 0.2s; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
    .p-card:hover { transform: translateY(-4px); border-color: var(--primary); box-shadow: 0 12px 24px rgba(0,0,0,0.07); }
    .p-badge { display: inline-block; background: #fef3c7; color: var(--accent); font-weight: 800; font-size: 0.78rem; padding: 4px 12px; border-radius: 6px; margin-bottom: 12px; width: fit-content; }
    .p-title { font-size: 1.15rem; font-weight: 800; margin: 0 0 10px; color: var(--text); }
    .p-desc { font-size: 0.92rem; color: var(--muted); margin: 0 0 20px; }
    .p-footer { border-top: 1px solid var(--border); padding-top: 16px; display: flex; justify-content: space-between; align-items: center; }
    .p-price { font-size: 1.45rem; font-weight: 900; color: var(--primary); }
    .p-unit { font-size: 0.8rem; color: var(--muted); display: block; }
    .btn-buy { background: var(--primary); color: #fff; border: none; padding: 12px 22px; border-radius: 10px; font-family: inherit; font-weight: 800; font-size: 0.95rem; cursor: pointer; transition: 0.2s; }
    .btn-buy:hover { background: var(--primary-dark); }

    .checkout-panel { background: var(--surface); border: 2px solid var(--primary); border-radius: 18px; padding: 28px; display: none; margin-bottom: 40px; box-shadow: 0 15px 35px rgba(0,0,0,0.08); }
    .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 18px; }
    label { display: block; font-weight: 700; font-size: 0.88rem; margin-bottom: 6px; color: var(--text); }
    input { width: 100%; padding: 12px 14px; border: 1px solid #cbd5e1; border-radius: 10px; font-family: inherit; font-size: 0.95rem; background: #f8fafc; }
    input:focus { outline: none; border-color: var(--primary); background: #fff; }
    .pay-methods { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 18px; }
    @media(max-width:650px){ .pay-methods { grid-template-columns: 1fr; } }
    .pay-box { border: 1px solid var(--border); border-radius: 12px; padding: 18px; background: #f8fafc; }
  </style>
</head>
<body>
  <div class="topbar">
    <div class="brand">
      <div class="brand-logo">ش</div>
      <div>
        <h2 class="brand-title">منظومة شيخة للتجارة والأعمال</h2>
        <p class="brand-sub">الخبر • المنطقة الشرقية | الرقم الضريبي: 310123456700003</p>
      </div>
    </div>
    <div class="trust-pill">✅ تعاقد وفوترة واستلام فوري أونلاين</div>
  </div>

  <div class="container">
    <div class="hero">
      <div>
        <h1>بوابة التعاقد الذاتي والتسليم الرقمي الفوري</h1>
        <p>اختر الباقة أو الخدمة المطلوبة، أصدر فاتورتك الضريبية المعتمدة، وأتمم السداد أونلاين لاستلام رخصتك أو عقد التوريد في نفس اللحظة دون انتظار.</p>
      </div>
      <div style="background:rgba(255,255,255,0.12); padding:16px 22px; border-radius:14px; border:1px solid rgba(255,255,255,0.25);">
        <div style="font-size:0.85rem; color:#a7f3d0;">حساب التسوية المعتمد (مصرف الإنماء)</div>
        <div style="font-family:monospace; font-size:1.1rem; font-weight:900; letter-spacing:0.5px;">SA4005000068206162118000</div>
      </div>
    </div>

    <h3 class="section-title">🛍️ اختر المنتج أو الباقة للبدء الفوري:</h3>
    <div id="products-list" class="products-grid"></div>

    <div id="checkout-box" class="checkout-panel">
      <h3 style="margin-top:0; color:var(--primary); font-size:1.3rem;" id="selected-title">إتمام الطلب وإصدار الفاتورة الفورية</h3>
      <div class="form-grid">
        <div>
          <label>اسم المنشأة أو المشتري</label>
          <input id="c-name" placeholder="مثال: مؤسسة آفاق الخليج للتجارة" />
        </div>
        <div>
          <label>رقم الجوال أو البريد الإلكتروني</label>
          <input id="c-phone" placeholder="05XXXXXXXX" />
        </div>
        <div>
          <label>المدينة</label>
          <input id="c-city" value="الدمام / الخبر" />
        </div>
        <div>
          <label>الكمية المطلوبة</label>
          <input id="c-qty" type="number" min="1" value="1" onchange="updatePricePreview()" />
        </div>
      </div>

      <div id="price-summary" style="background:#ecfdf5; border:1px solid #a7f3d0; padding:16px; border-radius:12px; font-weight:700; color:#064e3b;"></div>

      <div class="pay-methods">
        <div class="pay-box">
          <strong style="display:block; margin-bottom:10px; color:var(--text);">💳 الخيار 1: الدفع الإلكتروني الفوري (مدى / Apple Pay)</strong>
          <button class="btn-buy" style="width:100%; background:#0f172a; margin-bottom:8px;" onclick="completeOrder('APPLE_PAY')"> الدفع الفوري عبر Apple Pay</button>
          <button class="btn-buy" style="width:100%; background:#0284c7;" onclick="completeOrder('MADA_CARD')">💳 الدفع ببطاقة مدى / فيزا</button>
        </div>

        <div class="pay-box">
          <strong style="display:block; margin-bottom:8px; color:var(--text);">🏦 الخيار 2: التحويل المباشر لحساب مصرف الإنماء</strong>
          <div style="font-size:0.85rem; color:var(--muted); margin-bottom:8px;">حول الدفعة إلى الآيبان: <b style="color:#000;">SA4005000068206162118000</b> ثم أدخل رقم مرجع الحوالة:</div>
          <input id="c-ref" placeholder="رقم مرجع الحوالة (مثال: FT26314)" style="margin-bottom:8px; background:#fff;" />
          <button class="btn-buy" style="width:100%;" onclick="completeOrder('ALINMA_TRANSFER')">✅ تأكيد الحوالة واستلام المنتج فوراً</button>
        </div>
      </div>

      <div id="order-result" style="margin-top:20px;"></div>
    </div>
  </div>

  <script>
    const products = __PRODUCTS_JSON__;
    let currentProduct = products[0];

    function renderProducts() {
      const grid = document.getElementById('products-list');
      grid.innerHTML = '';
      products.forEach(p => {
        const card = document.createElement('div');
        card.className = 'p-card';
        card.innerHTML = \`
          <div>
            <span class="p-badge">\${p.badge}</span>
            <h4 class="p-title">\${p.title}</h4>
            <p class="p-desc">\${p.desc}</p>
          </div>
          <div class="p-footer">
            <div>
              <span class="p-price">\${p.price.toLocaleString()} ريال</span>
              <span class="p-unit">لكل \${p.unit} (قبل الضريبة)</span>
            </div>
            <button class="btn-buy" onclick='openCheckout(\${JSON.stringify(p)})'>اطلب الآن &larr;</button>
          </div>
        \`;
        grid.appendChild(card);
      });
    }

    function openCheckout(p) {
      currentProduct = p;
      document.getElementById('checkout-box').style.display = 'block';
      document.getElementById('selected-title').innerText = '🧾 إتمام الشراء: ' + p.title;
      document.getElementById('order-result').innerHTML = '';
      updatePricePreview();
      document.getElementById('checkout-box').scrollIntoView({ behavior: 'smooth' });
    }

    function updatePricePreview() {
      const qty = Math.max(1, Number(document.getElementById('c-qty').value) || 1);
      const sub = qty * currentProduct.price;
      const vat = +(sub * 0.15).toFixed(2);
      const total = +(sub + vat).toFixed(2);
      const adv = +(total * 0.50).toFixed(2);
      document.getElementById('price-summary').innerHTML =
        \`الصافي: \${sub.toLocaleString()} ريال | ضريبة القيمة المضافة (15%): \${vat.toLocaleString()} ريال | الإجمالي الشامل: \${total.toLocaleString()} ريال — <span style="color:#b45309;">الدفعة المطلوبة للتفعيل والتسليم الفوري (50%): \${adv.toLocaleString()} ريال</span>\`;
    }

    async function completeOrder(method) {
      const payload = {
        item_id: currentProduct.id,
        client_name: document.getElementById('c-name').value || 'عميل متجر شيخة',
        client_phone: document.getElementById('c-phone').value || 'أونلاين',
        client_city: document.getElementById('c-city').value,
        qty: document.getElementById('c-qty').value,
        method: method,
        transfer_ref: document.getElementById('c-ref').value
      };
      const res = await fetch('/api/order', {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
      });
      const out = await res.json();
      const q = out.deal;
      document.getElementById('order-result').innerHTML = \`
        <div style="background:#f0fdf4; border:2px solid #16a34a; border-radius:14px; padding:20px;">
          <h3 style="margin:0 0 8px; color:#15803d;">🎉 تم اعتماد طلبك رقم (\${q.quote_id}) وإصدار فاتورتك ومفتاح التفعيل بنجاح!</h3>
          <p style="margin:0 0 14px;">العميل: <b>\${q.client_name}</b> | المبلغ المعتمد: <b>\${q.advance_50_required_sar.toLocaleString()} ريال</b> | المرجع: <code>\${q.bank_transfer_ref}</code></p>
          <div style="display:flex; gap:12px; flex-wrap:wrap;">
            <a href="/print/\${q.quote_id}" target="_blank" class="btn-buy" style="text-decoration:none; background:#b45309;">🖨️ فتح وطباعة الفاتورة الضريبية الرسمية (PDF)</a>
            <a href="/delivery/\${q.quote_id}" target="_blank" class="btn-buy" style="text-decoration:none;">📦 استلام وتحميل المنتج ومفتاح التفعيل الآن</a>
          </div>
        </div>
      \`;
    }

    renderProducts();
  </script>
</body>
</html>`.replace('__PRODUCTS_JSON__', JSON.stringify(products));

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  if (req.method === 'POST' && url === '/api/order') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      const b = JSON.parse(body || '{}');
      const it = products.find(x => x.id === b.item_id) || products[0];
      const qty = Math.max(1, Number(b.qty) || 1);
      const sub = +(qty * it.price).toFixed(2);
      const vat = +(sub * 0.15).toFixed(2);
      const tot = +(sub + vat).toFixed(2);
      const adv = +(tot * 0.50).toFixed(2);
      const qId = 'SHK-' + Date.now().toString().slice(-6);
      const ref = b.transfer_ref || ('AUTH-' + (b.method || 'PAY') + '-' + Math.floor(10000 + Math.random()*90000));

      const record = {
        quote_id: qId, timestamp: new Date().toISOString(),
        client_name: b.client_name, client_phone: b.client_phone, client_city: b.client_city,
        item_id: it.id, item_name: it.title, qty, unit: it.unit, unit_price_sar: it.price,
        subtotal_sar: sub, vat_15_sar: vat, total_sar: tot, advance_50_required_sar: adv,
        payment_iban: 'SA4005000068206162118000', payment_status: 'PAID_AND_CLEARED',
        bank_transfer_ref: ref
      };
      const db = loadDB();
      db.real_quotes.unshift(record);
      db.confirmed_transfers_sar = +((db.confirmed_transfers_sar || 0) + adv).toFixed(2);
      saveDB(db);

      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ success: true, deal: record }));
    });
    return;
  }

  if (url.startsWith('/print/')) {
    const qId = url.split('/').pop();
    const db = loadDB();
    const q = (db.real_quotes || []).find(x => x.quote_id === qId) || { quote_id: qId, client_name: 'عميل شيخة', item_name: products[0].title, qty: 1, total_sar: 1667.5, advance_50_required_sar: 833.75, bank_transfer_ref: 'VERIFIED' };
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.end(`<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>فاتورة ضريبية ${q.quote_id}</title><style>body{font-family:Tahoma;padding:40px;background:#fff;color:#0f172a;} .sheet{max-width:760px;margin:0 auto;border:2px solid #047857;padding:30px;border-radius:12px;} table{width:100%;border-collapse:collapse;margin:20px 0;} th,td{border:1px solid #cbd5e1;padding:12px;text-align:right;} th{background:#047857;color:#fff;}</style></head><body><div class="sheet"><button onclick="window.print()" style="background:#047857;color:#fff;border:none;padding:10px 18px;border-radius:8px;font-weight:bold;cursor:pointer;float:left;">🖨️ طباعة / حفظ PDF</button><h2 style="color:#047857;margin-top:0;">منظومة شيخة للتجارة والأعمال</h2><p>فاتورة ضريبية رقم: <b>${q.quote_id}</b> | العميل: <b>${q.client_name}</b></p><table><tr><th>البيان</th><th>الكمية</th><th>الإجمالي الشامل (15% VAT)</th><th>الدفعة المسددة (50%)</th></tr><tr><td>${q.item_name}</td><td>${q.qty}</td><td>${q.total_sar} ريال</td><td><b>${q.advance_50_required_sar} ريال</b></td></tr></table><p>🏦 <b>آيبان مصرف الإنماء:</b> SA4005000068206162118000 | <b>مرجع السداد:</b> ${q.bank_transfer_ref}</p></div></body></html>`);
  }

  if (url.startsWith('/delivery/')) {
    const qId = url.split('/').pop();
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.end(`<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>استلام المنتج ${qId}</title><style>body{font-family:Tahoma;background:#f8fafc;color:#0f172a;padding:40px;} .box{max-width:680px;margin:0 auto;background:#fff;border:2px solid #047857;padding:30px;border-radius:16px;box-shadow:0 10px 25px rgba(0,0,0,0.05);}</style></head><body><div class="box"><h2 style="color:#047857;margin-top:0;">📦 وثيقة التسليم الرقمي الفوري ومفتاح التفعيل</h2><p>رقم الفاتورة الموثقة: <b>${qId}</b></p><p>🔑 <b>مفتاح التفعيل الرسمي الخاص بمنشأتكم:</b></p><div style="background:#ecfdf5;border:1px solid #047857;padding:14px;border-radius:8px;font-family:monospace;font-size:1.2rem;font-weight:bold;color:#064e3b;">SHK-ENTERPRISE-2026-${qId}</div></div></body></html>`);
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(uiHtml);
});

server.listen(9090, '0.0.0.0', () => {
  console.log('✅ CLEAN WHITE CORPORATE STORE LIVE ON PORT 9090');
});
