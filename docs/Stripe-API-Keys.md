# مفاتيح Stripe API — Standard vs Restricted

## بسم الله الرحمن الرحيم

توثيق خيارات مفاتيح Stripe وكيفية استخدامها في شيخة.

---

## نوعا المفاتيح

| النوع | الوصف | متى تُستخدم |
|-------|--------|-------------|
| **Standard keys** | وصول كامل للـ API | التطوير، الاختبار، أو بيئة بسيطة |
| **Restricted keys** | مفاتيح بصلاحيات محددة | الإنتاج — أمان أعلى |

---

## Standard keys (المفاتيح القياسية)

### الميزات
- وصول كامل لجميع endpoints
- إنشاء من: **Developers → API keys → Standard keys**
- نوعان:
  - **Publishable key** (`pk_...`) — للواجهة الأمامية (Stripe.js) — آمن للنشر
  - **Secret key** (`sk_...`) — للخادم فقط — **لا تُكشف أبداً**

### استخدامها في شيخة
```
STRIPE_PUBLISHABLE_KEY=pk_test_...   # أو pk_live_...
STRIPE_SECRET_KEY=sk_test_...       # أو sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## Restricted keys (المفاتيح المقيدة)

### الميزات
- صلاحيات محددة (مثلاً: قراءة فقط، أو Payments فقط)
- قيود على IP اختيارية
- مناسب للإنتاج — مبدأ أقل صلاحية (least privilege)

### صلاحيات مقترحة لشيخة

| الصلاحية | الغرض |
|----------|--------|
| **Payments** (read + write) | إنشاء PaymentIntents، استلام مدفوعات |
| **Customers** (read + write) | إدارة العملاء |
| **Webhooks** (read) | قراءة إعدادات Webhooks |
| **Balance** (read) | عرض الرصيد |

### إنشاء Restricted key
1. Developers → API keys → **Create restricted key**
2. اختر الصلاحيات المطلوبة فقط (انظر `data/stripe-restricted-key-permissions.json`)
3. (اختياري) أضف قيود IP
4. انسخ المفتاح — يُعرض مرة واحدة فقط

### صلاحيات موصى بها لشيخة (read / write)
| الفئة | الصلاحية | read | write |
|-------|----------|------|-------|
| **Core** | Balance | ✓ | — |
| | Balance Transaction Source | ✓ | — |
| | Charges and Refunds | ✓ | ✓ |
| | Customers | ✓ | ✓ |
| | Events | ✓ | — |
| | Payment Intents | ✓ | ✓ |
| | Payment Methods | ✓ | ✓ |
| | Payouts | ✓ | — |
| | Products | ✓ | ✓ |
| | Setup Intents | ✓ | ✓ |
| | Tokens | ✓ | — |
| **Billing** | Invoices | ✓ | ✓ |
| | Prices | ✓ | ✓ |
| | Subscriptions | ✓ | ✓ |
| | Tax Rates | ✓ | — |
| **Checkout** | Checkout Sessions | ✓ | ✓ |
| **Webhook** | Webhook Endpoints | ✓ | ✓ |
| **Connect** | Accounts | ✓ | — |
| | Transfers | ✓ | ✓ |
| **Radar** | Reviews | ✓ | — |

**read** = قراءة البيانات | **write** = إنشاء أو تعديل

---

## التوصية لشيخة

| المرحلة | النوع | السبب |
|--------|-------|-------|
| **تطوير / اختبار** | Standard keys | أسرع، وصول كامل للتجربة |
| **إنتاج** | Restricted keys | أمان أعلى، صلاحيات محددة |

---

## ملاحظات أمنية

- **Secret key** و **Webhook secret** — في `.env` فقط، لا تُرفع إلى Git
- **Publishable key** — يمكن تضمينها في الواجهة الأمامية
- استخدم **Test keys** (`sk_test_`, `pk_test_`) أثناء التطوير
- استخدم **Live keys** (`sk_live_`, `pk_live_`) في الإنتاج فقط

---

## مراجع

- [Stripe API Keys](https://docs.stripe.com/keys)
- [Restricted API Keys](https://docs.stripe.com/keys#limit-access)
- [Webhook signing](https://docs.stripe.com/webhooks/signatures)

---

*المالك: سلمان أحمد بن سلمان الراجح | market@sheikha.top*
