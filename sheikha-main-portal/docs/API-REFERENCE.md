# 📚 مرجع API — سوق شيخة
## Sheikha Market — API Reference

> **الإصدار:** 2.0 MVP | **البيئة:** `https://sheikha-market.com` | **التوثيق:** 2026

---

## 📋 الفهرس

1. [المصادقة والحسابات](#1-المصادقة-والحسابات)
2. [كتالوج المنتجات](#2-كتالوج-المنتجات)
3. [إدارة الطلبات](#3-إدارة-الطلبات)
4. [إدارة الموردين](#4-إدارة-الموردين)
5. [التحليلات والمؤشرات](#5-التحليلات-والمؤشرات)
6. [لوحة التحكم](#6-لوحة-التحكم)
7. [الأكواد والأخطاء](#7-الأكواد-والأخطاء)
8. [الأمان والحدود](#8-الأمان-والحدود)

---

## المصادقة

جميع المسارات المحمية تتطلب JWT في الترويسة:

```
Authorization: Bearer <token>
```

الأدوار المتاحة: `admin` | `supplier` | `user` | `trader`

---

## 1. المصادقة والحسابات

### `POST /api/auth/register` — تسجيل حساب جديد

```json
// الطلب
{
  "name": "سلمان الراجح",
  "email": "salman@company.com",
  "password": "SecurePass@2026",
  "phone": "+966501234567",   // اختياري
  "role": "supplier"           // user | supplier | trader
}

// الاستجابة 201
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": "usr_xyz",
    "name": "سلمان الراجح",
    "email": "salman@company.com",
    "role": "supplier"
  }
}
```

**أكواد الخطأ:** `400` بيانات ناقصة | `409` البريد مسجل مسبقاً

---

### `POST /api/auth/login` — تسجيل الدخول

```json
// الطلب
{ "email": "salman@company.com", "password": "SecurePass@2026" }

// الاستجابة 200
{ "success": true, "token": "eyJhbGc...", "user": { ... } }
```

**أكواد الخطأ:** `401` بيانات غير صحيحة

---

## 2. كتالوج المنتجات

**Base:** `/api/catalog`

### `GET /api/catalog` — قائمة المنتجات

**متاح للجميع (بدون توثيق)**

**Query Parameters:**
| المعامل | النوع | الوصف |
|---------|-------|-------|
| `category` | string | `iron\|copper\|aluminum\|gold\|silver\|scrap\|...` |
| `q` | string | بحث نصي في الاسم والوصف |
| `minPrice` | number | سعر أدنى |
| `maxPrice` | number | سعر أعلى |
| `region` | string | المنطقة/المدينة |
| `supplierId` | string | فلتر بمعرف المورد |
| `page` | number | رقم الصفحة (افتراضي: 1) |
| `limit` | number | نتائج بالصفحة (افتراضي: 20، أقصى: 100) |
| `sort` | string | `createdAt\|price\|views` |
| `order` | string | `asc\|desc` |

```json
// الاستجابة 200
{
  "success": true,
  "count": 20,
  "total": 142,
  "page": 1,
  "pages": 8,
  "products": [
    {
      "id": "prod_abc123",
      "name": "حديد مقاطع Grade A",
      "category": "iron",
      "price": 3.50,
      "currency": "SAR",
      "unit": "kg",
      "quantity": 5000,
      "minQuantity": 100,
      "grade": "Grade A",
      "supplierId": "usr_xyz",
      "supplierName": "شركة النور للمعادن",
      "region": "الرياض",
      "views": 47,
      "orders": 3,
      "status": "active",
      "sharia": { "compliant": true, "noRiba": true, "halal": true },
      "createdAt": "2026-05-01T10:00:00Z"
    }
  ]
}
```

---

### `GET /api/catalog/categories` — التصنيفات المتاحة

```json
// الاستجابة 200
{
  "success": true,
  "categories": [
    { "id": "iron",       "name": "حديد",        "nameEn": "Iron",       "icon": "🔩", "count": 24 },
    { "id": "copper",     "name": "نحاس",        "nameEn": "Copper",     "icon": "🟠", "count": 18 },
    { "id": "aluminum",   "name": "ألومنيوم",    "nameEn": "Aluminum",   "icon": "⚪", "count": 12 },
    { "id": "gold",       "name": "ذهب",         "nameEn": "Gold",       "icon": "🟡", "count": 6  },
    { "id": "silver",     "name": "فضة",         "nameEn": "Silver",     "icon": "⚫", "count": 4  },
    { "id": "scrap",      "name": "سكراب",       "nameEn": "Scrap",      "icon": "♻️", "count": 33 }
  ]
}
```

---

### `GET /api/catalog/search?q=<keyword>` — بحث نصي

```json
// الاستجابة 200
{ "success": true, "query": "حديد", "count": 15, "products": [...] }
```

---

### `GET /api/catalog/:id` — تفاصيل منتج

```json
// الاستجابة 200
{ "success": true, "product": { ... } }
```

**أكواد الخطأ:** `404` المنتج غير موجود

---

### `POST /api/catalog` — إضافة منتج 🔒

**الأدوار:** `supplier | admin | trader`

```json
// الطلب
{
  "name": "نحاس أصفر درجة أولى",      // مطلوب
  "category": "brass",                  // مطلوب
  "price": 25.50,                       // اختياري
  "currency": "SAR",                    // SAR | USD | AED | EUR
  "unit": "kg",                         // kg | ton | gram | piece | meter
  "quantity": 2000,
  "minQuantity": 50,
  "grade": "Grade 1",
  "description": "نحاس أصفر عالي الجودة",
  "region": "جدة",
  "specifications": { "purity": "99.5%", "form": "ingot" }
}

// الاستجابة 201
{ "success": true, "message": "تم إضافة المنتج بنجاح", "product": { ... } }
```

---

### `PUT /api/catalog/:id` — تعديل منتج 🔒

**الأدوار:** صاحب المنتج أو `admin`

```json
// الطلب (الحقول المراد تعديلها فقط)
{ "price": 26.00, "quantity": 1800 }

// الاستجابة 200
{ "success": true, "message": "تم تعديل المنتج بنجاح", "product": { ... } }
```

**أكواد الخطأ:** `403` ليس صاحب المنتج | `404` غير موجود

---

### `DELETE /api/catalog/:id` — حذف منتج 🔒

**الأدوار:** صاحب المنتج أو `admin`

```json
// الاستجابة 200
{ "success": true, "message": "تم حذف المنتج بنجاح" }
```

---

### `GET /api/catalog/supplier/my` — منتجاتي 🔒

```json
// الاستجابة 200
{
  "success": true,
  "stats": { "total": 12, "active": 10, "totalViews": 340, "totalOrders": 28 },
  "products": [...]
}
```

---

## 3. إدارة الطلبات

**Base:** `/api/market-orders`

**دورة حياة الطلب:**
```
pending → confirmed → processing → shipped → delivered → completed
   ↓           ↓           ↓
cancelled   cancelled   cancelled
```

### `GET /api/market-orders` — قائمة الطلبات 🔒

- **مشرف:** يرى الكل
- **مورد:** يرى طلباته فقط
- **مشتري:** يرى طلباته فقط

| المعامل | الوصف |
|---------|-------|
| `status` | فلتر الحالة |
| `page` | رقم الصفحة |
| `limit` | حجم الصفحة |

```json
// الاستجابة 200
{
  "success": true,
  "stats": {
    "total": 45, "pending": 8, "confirmed": 12,
    "processing": 5, "shipped": 3, "completed": 15, "cancelled": 2
  },
  "count": 20,
  "total": 45,
  "orders": [...]
}
```

---

### `POST /api/market-orders` — إنشاء طلب 🔒

```json
// الطلب — طريقة 1: منتج واحد
{
  "productId": "prod_abc123",
  "quantity": 500,
  "notes": "يُرجى التغليف الجيد",
  "shippingAddress": { "city": "الرياض", "district": "النزهة" },
  "paymentMethod": "bank_transfer"
}

// الطلب — طريقة 2: عدة منتجات
{
  "items": [
    { "productId": "prod_abc", "quantity": 500 },
    { "productId": "prod_xyz", "quantity": 200 }
  ],
  "notes": "طلب مجمّع"
}

// الاستجابة 201
{
  "success": true,
  "message": "تم إنشاء الطلب بنجاح",
  "order": {
    "id": "ord_xyz",
    "orderNumber": "ORD-M4X3K-P2QR",
    "status": "pending",
    "totalAmount": 1750.00,
    "currency": "SAR",
    "tracking": { "history": [{ "status": "pending", "timestamp": "..." }] }
  }
}
```

---

### `GET /api/market-orders/:id` — تفاصيل طلب 🔒

```json
// الاستجابة 200
{ "success": true, "order": { ... } }
```

**أكواد الخطأ:** `403` غير مصرح | `404` غير موجود

---

### `PUT /api/market-orders/:id/status` — تحديث الحالة 🔒

```json
// الطلب
{ "status": "confirmed", "note": "تم التأكيد ومتاح للشحن" }

// الاستجابة 200
{ "success": true, "message": "تم تحديث حالة الطلب إلى: confirmed", "order": { ... } }
```

**أكواد الخطأ:** `400` انتقال حالة غير مسموح، مع `allowedNext: [...]`

---

### `PUT /api/market-orders/:id/cancel` — إلغاء الطلب 🔒

**الأدوار:** المشتري (صاحب الطلب) أو `admin`

```json
// الطلب
{ "reason": "تغيير في الميزانية" }

// الاستجابة 200
{ "success": true, "message": "تم إلغاء الطلب بنجاح" }
```

---

### `GET /api/market-orders/buyer/my` — طلباتي كمشتري 🔒

```json
// الاستجابة 200
{
  "success": true,
  "stats": { "total": 8, "active": 3, "completed": 5, "totalSpent": 42500 },
  "orders": [...]
}
```

---

### `GET /api/market-orders/supplier/my` — طلباتي كمورد 🔒

```json
// الاستجابة 200
{
  "success": true,
  "stats": { "total": 23, "pending": 4, "active": 6, "completed": 13, "totalRevenue": 128000 },
  "orders": [...]
}
```

---

## 4. إدارة الموردين

**Base:** `/api/suppliers`

### `GET /api/suppliers` — قائمة الموردين العامة

**متاح للجميع**

| المعامل | الوصف |
|---------|-------|
| `category` | فلتر التصنيف |
| `region` | الفلتر الجغرافي |
| `verified` | `true` للموثقين فقط |
| `q` | بحث نصي |
| `limit / page` | ترقيم |

```json
// الاستجابة 200
{
  "success": true,
  "total": 24,
  "suppliers": [
    {
      "id": "sup_abc",
      "name": "شركة النور للمعادن",
      "businessType": "company",
      "city": "الرياض",
      "categories": ["iron", "copper"],
      "verified": true,
      "stats": { "totalProducts": 12, "rating": { "average": 4.5, "count": 18 } }
    }
  ]
}
```

---

### `POST /api/suppliers/register` — تسجيل كمورد 🔒

```json
// الطلب
{
  "name": "شركة النور للمعادن",          // مطلوب
  "businessType": "company",              // individual | company | factory
  "description": "متخصصون في المعادن",
  "city": "الرياض",
  "phone": "+966501234567",
  "categories": ["iron", "copper"],
  "commercialRegistration": "1234567890",
  "vatNumber": "300123456789003"
}

// الاستجابة 201
{
  "success": true,
  "message": "تم تسجيلك كمورد. سيتم مراجعة الملف والتحقق منه.",
  "profile": { ... }
}
```

**أكواد الخطأ:** `409` لديك ملف مورد مسبق

---

### `GET /api/suppliers/me` — ملفي كمورد 🔒

```json
// الاستجابة 200
{
  "success": true,
  "profile": {
    "id": "sup_abc",
    "stats": {
      "totalProducts": 12, "activeProducts": 10,
      "totalOrders": 45, "completedOrders": 38,
      "totalRevenue": 128000, "rating": { "average": 4.5, "count": 18 }
    }
  }
}
```

---

### `GET /api/suppliers/:id` — ملف مورد عام

```json
// الاستجابة 200
{ "success": true, "supplier": { ... }, "products": [...], "totalProducts": 12 }
```

---

### `PUT /api/suppliers/me` — تعديل ملفي 🔒

```json
// الطلب
{ "description": "وصف جديد", "city": "جدة", "categories": ["iron"] }
```

---

### `POST /api/suppliers/:id/rate` — تقييم مورد 🔒

```json
// الطلب
{ "rating": 5, "comment": "ممتاز وسريع التوصيل" }

// الاستجابة 200
{ "success": true, "rating": { "average": 4.6, "count": 19 } }
```

---

### `PUT /api/suppliers/:id/verify` — توثيق مورد 🔒

**الأدوار:** `admin` فقط

```json
// الاستجابة 200
{ "success": true, "message": "تم التحقق من المورد بنجاح" }
```

---

## 5. التحليلات والمؤشرات

**Base:** `/api/market-analytics`

### `GET /api/market-analytics/market` — مؤشرات السوق العامة

**متاح للجميع**

```json
// الاستجابة 200
{
  "success": true,
  "market": {
    "totalProducts": 142,
    "totalSuppliers": 24,
    "verifiedSuppliers": 18,
    "totalTransactions": 315,
    "categories": 8
  },
  "prices": {
    "gold":     { "price": 285.40, "change": "+1.2%", "unit": "g",  "currency": "SAR" },
    "copper":   { "price": 42.80,  "change": "-0.3%", "unit": "kg", "currency": "SAR" },
    "aluminum": { "price": 28.50,  "change": "+0.5%", "unit": "kg", "currency": "SAR" },
    "iron":     { "price": 3.20,   "change": "+0.1%", "unit": "kg", "currency": "SAR" }
  }
}
```

---

### `GET /api/market-analytics/overview` — النظرة الشاملة 🔒

**الأدوار:** `admin` فقط

```json
// الاستجابة 200
{
  "success": true,
  "kpis": {
    "users":    { "total": 245, "newThisMonth": 32, "growth": 15, "buyers": 210, "suppliers": 35 },
    "products": { "total": 142, "active": 128, "newThisMonth": 18 },
    "orders":   { "total": 315, "pending": 8, "completed": 280, "thisMonth": 42, "growth": 12, "cancellationRate": 3 },
    "revenue":  { "total": 842500, "thisMonth": 78000, "lastMonth": 65000, "growth": 20, "currency": "SAR" },
    "suppliers":{ "total": 35, "verified": 28, "active": 32 }
  },
  "trends": {
    "salesLast30Days": [
      { "date": "2026-04-12", "orders": 8, "revenue": 12400 },
      ...
    ]
  },
  "distributions": { "categories": { "iron": 48, "copper": 28, ... } },
  "topSuppliers": [
    { "supplierId": "...", "name": "شركة النور", "revenue": 45000 }
  ]
}
```

---

### `GET /api/market-analytics/supplier` — تحليلات المورد 🔒

```json
// الاستجابة 200
{
  "success": true,
  "kpis": {
    "products": { "total": 12, "active": 10, "totalViews": 340 },
    "orders":   { "total": 45, "pending": 4, "completed": 38, "thisMonth": 8, "growth": 14 },
    "revenue":  { "total": 128000, "thisMonth": 12500, "lastMonth": 10800, "growth": 16, "currency": "SAR" }
  },
  "topProducts": [{ "productId": "...", "name": "حديد...", "orders": 12, "views": 98 }],
  "trends": { "salesLast30Days": [...] }
}
```

---

### `GET /api/market-analytics/buyer` — تحليلات المشتري 🔒

```json
// الاستجابة 200
{
  "success": true,
  "kpis": {
    "orders":   { "total": 8, "active": 3, "completed": 5, "cancelled": 0 },
    "spending": { "total": 42500, "currency": "SAR", "averageOrder": 8500 }
  },
  "topPurchased": [...],
  "recentOrders": [...]
}
```

---

## 6. لوحة التحكم

**Base:** `/api/dashboard`

### `GET /api/dashboard` — نظرة عامة سريعة

```json
// الاستجابة 200
{
  "success": true,
  "overview": {
    "market":     { "status": "active", "active_offers": 128, "daily_volume_sar": 2840000 },
    "contracts":  { "total": 45, "active": 12 },
    "governance": { "compliance_rate": 1, "violations": 0 }
  },
  "recent_activity": [...]
}
```

---

## 7. الأكواد والأخطاء

| الكود | المعنى |
|-------|--------|
| `200` | نجح |
| `201` | تم الإنشاء |
| `400` | بيانات غير صحيحة أو ناقصة |
| `401` | غير مسجل الدخول |
| `403` | ليس لديك صلاحية |
| `404` | العنصر غير موجود |
| `409` | تعارض (مكرر) |
| `429` | تجاوز حد الطلبات |
| `500` | خطأ داخلي |

**شكل الخطأ:**
```json
{ "success": false, "message": "وصف الخطأ", "errors": ["قائمة أخطاء التحقق"] }
```

---

## 8. الأمان والحدود

### Rate Limiting
| المسار | الحد |
|--------|------|
| `/api/auth/login` | 10 طلبات / دقيقة |
| `/api/auth/register` | 5 طلبات / دقيقة |
| `/api/` عام | 100 طلب / دقيقة |

### المصادقة
- JWT صالح لـ 24 ساعة
- كلمة المرور: bcrypt hashing
- HTTPS إلزامي في الإنتاج
- CORS مضبوط على النطاقات المعتمدة

### قيم مسموح بها
| الحقل | القيم |
|-------|-------|
| `category` | `iron\|copper\|aluminum\|gold\|silver\|brass\|lead\|zinc\|scrap\|recycling\|industrial\|other` |
| `unit` | `kg\|ton\|gram\|piece\|meter\|liter` |
| `currency` | `SAR\|USD\|AED\|EUR` |
| `status` (طلب) | `pending\|confirmed\|processing\|shipped\|delivered\|completed\|cancelled\|refunded` |

---

## 📎 ملاحظات الإصدار MVP

### المسارات الجديدة (الإصدار 2.0)
- `/api/catalog/*` — كتالوج المنتجات المتكامل
- `/api/market-orders/*` — إدارة الطلبات الكاملة  
- `/api/suppliers/*` — إدارة الموردين
- `/api/market-analytics/*` — التحليلات الحقيقية

### المسارات القديمة (متوافقة مع الإصدار السابق)
- `/api/products` — قائمة المنتجات (listings القديم)
- `/api/orders` — الطلبات القديمة
- `/api/market` — سوق المعادن

---

*﴿ وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا ﴾ — البقرة: ٢٧٥*

*© 2026 سوق شيخة — جميع الحقوق محفوظة*
