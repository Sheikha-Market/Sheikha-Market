'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById(
    'commercialLeadForm'
  );

  if (!form) {
    return;
  }

  const resultBox = document.getElementById(
    'formResult'
  );

  const offerSelect = document.getElementById(
    'offerId'
  );

  const requestedOffer = new URLSearchParams(
    window.location.search
  ).get('offer');

  if (
    requestedOffer &&
    Array.from(offerSelect.options).some(
      (option) => option.value === requestedOffer
    )
  ) {
    offerSelect.value = requestedOffer;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    resultBox.className = 'form-result';
    resultBox.textContent = 'يجري إرسال الطلب...';

    const data = new FormData(form);

    const payload = {
      name: data.get('name'),
      company: data.get('company'),
      email: data.get('email'),
      phone: data.get('phone'),
      offerId: data.get('offerId'),
      need: data.get('need'),
      consent: data.get('consent') === 'on',
      source: 'WEBSITE_COMMERCIAL_V1'
    };

    try {
      const response = await fetch(
        '/api/commercial/v1/leads',
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      );

      const body = await response.json();

      if (!response.ok || !body.success) {
        throw new Error(
          body.messageAr ||
          'تعذر تسجيل الطلب.'
        );
      }

      resultBox.className =
        'form-result success';

      resultBox.textContent =
        `تم استلام الطلب. رقم المتابعة: ${body.leadId}`;

      form.reset();
    } catch (error) {
      resultBox.className =
        'form-result error';

      resultBox.innerHTML = '';

      const message = document.createElement('p');

      message.textContent =
        'تعذر الإرسال الإلكتروني. أرسل الطلب إلى البريد التجاري.';

      const link = document.createElement('a');

      link.href = 'mailto:market@sheikha.top';
      link.textContent = 'market@sheikha.top';

      resultBox.append(message, link);
    }
  });
});
