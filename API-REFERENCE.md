# 📡 API Reference — منظومة شيخة

## جدول المحتويات
1. [Health & Monitoring APIs](#health--monitoring-apis)
2. [Trade APIs](#trade-apis)
3. [Order APIs](#order-apis)
4. [Contract APIs](#contract-apis)
5. [Sharia APIs](#sharia-apis)
6. [System APIs](#system-apis)

---

## Health & Monitoring APIs

### 🔵 Health Check (بسيط)
```
GET /health
```

**الاستجابة الناجحة** (200):
```
OK
```

---

### 🟢 Health Check (شامل)
```
GET /api/health
```

**الاستجابة الناجحة** (200):
```json
{
  "status": "ok",
  "service": "sheikha-main-portal",
  "health": "healthy",
  "slo": true,
  "alerts": 0,
  "warnings": 0,
  "critical": 0,
  "uptime": "2d 5h 30m",
  "uptime_seconds": 185430,
  "timestamp": "2026-05-03T10:30:00Z",
  "version": "1.0.0",
  "environment": "production"
}
```

**الاستجابة الخاطئة** (503):
```json
{
  "status": "error",
  "service": "sheikha-main-portal",
  "error": "SRE Monitor unavailable",
  "timestamp": "2026-05-03T10:30:00Z"
}
```

---

### 🟡 System Status
```
GET /api/system/status
```

**الاستجابة الناجحة** (200):
```json
{
  "success": true,
  "service": "sheikha-main-portal",
  "status": "operational",
  "health": "healthy",
  "metrics": {
    "uptime_seconds": 185430,
    "uptime_formatted": "2d 5h 30m",
    "slo_compliant": true,
    "alerts_total": 0,
    "alerts_warnings": 0,
    "alerts_critical": 0
  },
  "timestamp": "2026-05-03T10:30:00Z"
}
```

---

### 📊 System Metrics
```
GET /api/system/metrics
```

**الاستجابة الناجحة** (200):
```json
{
  "success": true,
  "data": {
    "cpu": {
      "user": 1234567,
      "system": 987654
    },
    "memory": {
      "rss": 123456789,
      "heapTotal": 123456789,
      "heapUsed": 987654,
      "external": 123456
    },
    "uptime": {
      "total": 185430,
      "formatted": "2d 5h 30m"
    },
    "alerts": {
      "total": 0,
      "warnings": 0,
      "critical": 0
    },
    "timestamp": "2026-05-03T10:30:00Z"
  }
}
```

---

### 🟠 Services Status
```
GET /api/system/services
```

**الاستجابة الناجحة** (200):
```json
{
  "success": true,
  "services": {
    "sre_monitor": {
      "status": "active",
      "description": "Service Reliability Engineering"
    },
    "sharia_guard": {
      "status": "active",
      "description": "Islamic Law Enforcement"
    },
    "decision_enforcement": {
      "status": "active",
      "description": "Rule Enforcement"
    },
    "root_governance": {
      "status": "active",
      "description": "Central Governance"
    },
    "neural_network": {
      "status": "active",
      "description": "Root Neural Network"
    }
  },
  "timestamp": "2026-05-03T10:30:00Z"
}
```

---

## Trade APIs

### ➕ Create Trade Offer
```
POST /api/trade
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>

{
  "type": "selling|buying",
  "commodity": "gold|silver|copper|metal_type",
  "quantity": 100,
  "unit": "kg|g|oz",
  "price": 50000,
  "currency": "SAR|USD|AED",
  "description": "تفاصيل العرض",
  "min_quantity": 10
}
```

**الاستجابة الناجحة** (201):
```json
{
  "success": true,
  "data": {
    "trade_id": "trade_123456789",
    "status": "active",
    "seller_id": "user_123",
    "created_at": "2026-05-03T10:30:00Z",
    "expires_at": "2026-05-10T10:30:00Z"
  }
}
```

---

## Order APIs

### ➕ Create Order
```
POST /api/orders
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>

{
  "trade_id": "trade_123456789",
  "quantity": 50,
  "price": 50000,
  "notes": "ملاحظات العرض"
}
```

**الاستجابة الناجحة** (201):
```json
{
  "success": true,
  "data": {
    "order_id": "order_123456",
    "trade_id": "trade_123456789",
    "status": "pending",
    "quantity": 50,
    "total_price": 2500000,
    "created_at": "2026-05-03T10:30:00Z"
  }
}
```

---

### 🔍 Get Order Details
```
GET /api/orders/:order_id
Authorization: Bearer <JWT_TOKEN>
```

**الاستجابة الناجحة** (200):
```json
{
  "success": true,
  "data": {
    "order_id": "order_123456",
    "status": "confirmed",
    "quantity": 50,
    "price": 50000,
    "total_price": 2500000,
    "created_at": "2026-05-03T10:30:00Z",
    "updated_at": "2026-05-03T10:35:00Z"
  }
}
```

---

## Contract APIs

### ✍️ Create Contract
```
POST /api/contracts
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>

{
  "order_id": "order_123456",
  "terms": "شروط العقد الإسلامي",
  "duration_days": 30,
  "payment_terms": "immediate|delayed",
  "delivery_terms": "pickup|delivery"
}
```

**الاستجابة الناجحة** (201):
```json
{
  "success": true,
  "data": {
    "contract_id": "contract_123456",
    "order_id": "order_123456",
    "status": "active",
    "signing_date": "2026-05-03T10:30:00Z",
    "expiry_date": "2026-06-03T10:30:00Z"
  }
}
```

---

## Sharia APIs

### ✅ Verify Sharia Compliance
```
POST /api/sharia/verify
Content-Type: application/json

{
  "type": "trade|contract|payment",
  "details": {
    "commodity": "gold",
    "price": 50000,
    "quantity": 100,
    "terms": "شروط العقد"
  }
}
```

**الاستجابة الناجحة** (200):
```json
{
  "success": true,
  "compliant": true,
  "issues": [],
  "rating": "ممتاز",
  "details": {
    "riba_check": "passed",
    "gharar_check": "passed",
    "ghabn_check": "passed",
    "nujsh_check": "passed"
  }
}
```

---

## System APIs

### 🔧 Get System Configuration
```
GET /api/system/config
Authorization: Bearer <ADMIN_TOKEN>
```

**الاستجابة الناجحة** (200):
```json
{
  "success": true,
  "config": {
    "version": "1.0.0",
    "environment": "production",
    "sre_enabled": true,
    "sharia_guard_enabled": true,
    "neural_network_enabled": true,
    "rate_limit": {
      "enabled": true,
      "requests_per_minute": 100
    }
  }
}
```

---

## Error Responses

### Bad Request (400)
```json
{
  "success": false,
  "error": "Invalid request format",
  "details": {
    "field": "quantity",
    "message": "Must be a positive number"
  }
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "JWT token is missing or invalid"
}
```

### Forbidden (403)
```json
{
  "success": false,
  "error": "Forbidden",
  "message": "Operation violates Sharia principles",
  "reason": "Riba detected in contract terms"
}
```

### Not Found (404)
```json
{
  "success": false,
  "error": "Not Found",
  "message": "Resource with id trade_123 not found"
}
```

### Internal Server Error (500)
```json
{
  "success": false,
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "error_id": "err_123456789"
}
```

---

## استخدام cURL

### مثال 1: فحص الصحة
```bash
curl -s http://localhost:8080/api/health | jq .
```

### مثال 2: إنشاء عرض تجاري
```bash
curl -X POST http://localhost:8080/api/trade \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "type": "selling",
    "commodity": "gold",
    "quantity": 100,
    "unit": "kg",
    "price": 50000,
    "currency": "SAR"
  }' | jq .
```

### مثال 3: الحصول على تفاصيل الطلب
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:8080/api/orders/order_123456 | jq .
```

---

## Status Codes

| Code | المعنى | الحالة |
|------|--------|--------|
| 200 | OK | ✅ نجح |
| 201 | Created | ✅ تم الإنشاء |
| 400 | Bad Request | ❌ طلب خاطئ |
| 401 | Unauthorized | ❌ غير مصرح |
| 403 | Forbidden | ❌ مرفوع |
| 404 | Not Found | ❌ غير موجود |
| 429 | Too Many Requests | ⚠️ تم تجاوز الحد |
| 500 | Server Error | ❌ خطأ في الخادم |
| 503 | Service Unavailable | ⚠️ الخدمة غير متاحة |

---

## الرؤوس المطلوبة

### Content-Type
```
Content-Type: application/json
```

### Authorization
```
Authorization: Bearer <JWT_TOKEN>
```

### User-Agent (اختياري)
```
User-Agent: MyApp/1.0.0
```

---

## Rate Limiting

- **الحد الافتراضي**: 100 طلب/دقيقة
- **الحد الخاص بـ AI**: 20 طلب/15 دقيقة
- **الحد الخاص بـ Auth**: 5 محاولات/15 دقيقة

**الرد عند تجاوز الحد**:
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "retry_after": 60
}
```

---

## Authentication

### الحصول على JWT Token
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password"
}
```

### استخدام Token
```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

## WebSocket APIs (للأسعار الحية)

### الاتصال
```javascript
const ws = new WebSocket('ws://localhost:8080/ws/prices');

ws.onmessage = (event) => {
  const priceUpdate = JSON.parse(event.data);
  console.log('سعر جديد:', priceUpdate);
};
```

### الاشتراك في السعر
```json
{
  "action": "subscribe",
  "commodity": "gold"
}
```

### بيانات الاستجابة
```json
{
  "commodity": "gold",
  "price": 50000,
  "currency": "SAR",
  "timestamp": "2026-05-03T10:30:00Z",
  "change": 100,
  "change_percent": 0.2
}
```

---

**آخر تحديث**: 3 مايو 2026
**الإصدار**: 1.0.0

