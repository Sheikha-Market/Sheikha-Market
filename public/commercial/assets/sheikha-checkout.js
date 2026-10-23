'use strict';

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('selfServiceCheckoutForm');
  const result = document.getElementById('checkoutResult');
  if (!form || !result) return;

  const select = document.getElementById('offerId');
  const button = form.querySelector('button[type="submit"]');
  let offers = [];
  let pending = null;
  let submitting = false;
  let finished = false;
  const money = value => new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(value);
  function displayOffer() {
    const offer = offers.find(item => item.offerId === select.value);
    if (!offer) return;
    document.getElementById('summaryTitle').textContent = offer.nameAr;
    document.getElementById('summaryPrice').textContent = money(offer.subtotalSar);
    document.getElementById('summaryDelivery').textContent = `${offer.deliveryDays} أيام بعد بدء الخدمة`;
    document.getElementById('summaryPayment').textContent = offer.paymentTerms.startsWith('50_PERCENT')
      ? '٥٠٪ عند الطلب و٥٠٪ قبل التسليم النهائي، بعد اعتماد الاتفاق'
      : '١٠٠٪ قبل التسليم، بعد اعتماد الاتفاق';
    document.getElementById('summaryDeliverables').replaceChildren(...offer.deliverables.map(text => {
      const li = document.createElement('li'); li.textContent = text; return li;
    }));
    form.elements.scopeAccepted.checked = false;
  }
  try {
    const response = await fetch('/api/commercial/v1/self-service-offers', { cache: 'no-store' });
    const body = await response.json();
    if (!response.ok || !body.offers?.length) throw new Error('OFFERS_UNAVAILABLE');
    offers = body.offers;
    document.getElementById('previewNotice').hidden = body.previewOnly !== true;
    select.replaceChildren(...offers.map(item => new window.Option(item.nameAr, item.offerId)));
    const requested = new URLSearchParams(location.search).get('offer');
    if (offers.some(item => item.offerId === requested)) select.value = requested;
    select.disabled = false; button.disabled = false;
    displayOffer(); select.addEventListener('change', displayOffer);
  } catch {
    result.textContent = 'تعذر تحميل العروض. أعد تحميل الصفحة للمحاولة.';
    result.className = 'form-result error';
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submitting || finished) return;
    submitting = true; button.disabled = true;
    if (!pending) {
      const data = new window.FormData(form);
      const offer = offers.find(item => item.offerId === select.value);
      if (!offer) { submitting = false; return; }
      pending = {
        key: Array.from(window.crypto.getRandomValues(new Uint8Array(32)), byte => byte.toString(16).padStart(2, '0')).join(''),
        payload: {
          name: data.get('name'), company: data.get('company'), email: data.get('email'),
          offerId: offer.offerId, offerDigest: offer.offerDigest, need: data.get('need'),
          scopeAccepted: data.get('scopeAccepted') === 'on',
          termsAccepted: data.get('termsAccepted') === 'on',
          privacyConsent: data.get('privacyConsent') === 'on',
          paymentObligationAccepted: data.get('paymentObligationAccepted') === 'on'
        }
      };
    }
    for (const control of form.elements) control.disabled = true;
    result.className = 'form-result'; result.textContent = 'جارٍ حفظ الطلب...';

    try {
      const response = await fetch('/api/commercial/v1/self-service-checkouts', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'Idempotency-Key': pending.key },
        body: JSON.stringify(pending.payload), signal: window.AbortSignal.timeout(20000)
      });
      const body = await response.json();
      if (!response.ok || !body.success) {
        if (response.status === 400) {
          pending = null;
          for (const control of form.elements) control.disabled = false;
        }
        throw new Error(response.status === 400 ? 'REVIEW_OFFER' : 'RETRY_SAME_REQUEST');
      }
      finished = true;
      result.className = 'form-result success';
      result.textContent = `حُفظ طلبك ${body.orderId}. السعر الأساسي ${money(body.subtotalSar)}. لم يُحصّل أي مبلغ. بانتظار مراجعة البائع.`;
      const link = document.getElementById('receiptLink');
      link.href = `/commercial/receipt.html#${body.receiptId}:${body.receiptToken}`;
      link.hidden = false; button.textContent = 'تم حفظ الطلب';
    } catch (error) {
      result.className = 'form-result error';
      result.textContent = error.message === 'REVIEW_OFFER'
        ? 'تحتاج البيانات أو نسخة العرض إلى تحديث. راجعها، وأعد تحميل الصفحة إذا تغيرت الشروط.'
        : 'لم يصل تأكيد الحفظ. أعد المحاولة لإكمال الطلب نفسه دون تكراره.';
      button.textContent = 'إعادة المحاولة';
    } finally {
      submitting = false; button.disabled = finished;
    }
  });
});
