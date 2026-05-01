# Include-dependent response values في Stripe API v2

## بسم الله الرحمن الرحيم

توثيق استخدام **include-dependent response values** عند استدعاء Stripe API v2 (مثل Event Destinations).

---

## ما هي القيم المعتمدة على include؟

في Stripe API v2، بعض الاستجابات تُرجع `null` لخصائص معيّنة **افتراضياً** — حتى لو كانت لها قيم فعلية — لتقليل حجم الـ payload مع الحفاظ على هيكل الاستجابة.

لجلب القيم الفعلية لهذه الخصائص، يجب تمريرها في معامل الطلب `include` كمصفوفة.

---

## آلية العمل

| العنصر | الوصف |
|--------|--------|
| **السلوك الافتراضي** | خصائص include-dependent تُرجع `null` |
| **معامل الطلب** | `include` — مصفوفة من أسماء الخصائص المطلوبة |
| **الاعتماد على endpoint** | السلوك يعتمد على endpoint الطلب، وليس على نوع الكائن — نفس الخاصية قد تكون include-dependent في endpoint وتُرجع القيمة افتراضياً في endpoint آخر |

---

## مثال على الطلب

```bash
curl -X POST https://api.stripe.com/v2/core/accounts \
  -H "Authorization: Bearer sk_test_..." \
  -H "Stripe-Version: 2025-03-31.basil" \
  --json '{
    "include": [
      "identity",
      "configuration.customer"
    ]
  }'
```

---

## مثال Node.js (عند استخدام stripe SDK)

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-03-31.basil'
});

// استدعاء v2 مع include — عبر raw request
const response = await fetch('https://api.stripe.com/v2/core/accounts', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
    'Stripe-Version': '2025-03-31.basil',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    include: ['identity', 'configuration.customer']
  })
});
```

---

## إعدادات شيخة في config

في `config/config.js`:

```javascript
stripe: {
  apiVersion: process.env.STRIPE_API_VERSION || '2025-03-31.basil',
  v2IncludeDefaults: ['identity', 'configuration.customer']
}
```

---

## مراجع

- [Include-dependent response values (API v2)](https://docs.stripe.com/api/include_dependent_response_values)
- [Event Destinations v2](https://docs.stripe.com/api/v2/core/event_destinations)
- [Stripe API Versioning](https://docs.stripe.com/versioning)

---

*المالك: سلمان أحمد بن سلمان الراجح | market@sheikha.top*
