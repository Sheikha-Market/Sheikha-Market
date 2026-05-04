# ═══════════════════════════════════════════════════════════════════════════════
# 🏪 شيخة — Dockerfile للنشر الإنتاجي
# الطبقة: Ubuntu (Linux Kernel) → Sheikha Platform
# الترميز: UTF-8 كامل — عربي + إنجليزي
# ═══════════════════════════════════════════════════════════════════════════════

FROM node:20-bookworm-slim AS production

# ─── معلومات ─────────────────────────────────────────────────────────────────
LABEL maintainer="Sheikha Market <info@sheikha.market>"
LABEL description="سوق شيخة للمعادن والسكراب — أول سوق إسلامي رقمي للمعادن"
LABEL os.base="Ubuntu/Debian (Linux Kernel)"
LABEL encoding="UTF-8"

# ─── UTF-8 locale — دعم كامل للغة العربية وجميع لغات العالم ─────────────────
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8
ENV LANGUAGE=ar_SA:ar:en_US:en

# ─── تثبيت الحزم الأساسية فوق Linux مباشرةً ──────────────────────────────────
# locales: دعم ترميز UTF-8 الكامل — عربي وإنجليزي
# ca-certificates: شهادات TLS للاتصالات الآمنة
# wget: فحص صحة الخادم (healthcheck)
# tzdata: ضبط المنطقة الزمنية (الرياض/السعودية)
RUN apt-get update && apt-get install -y --no-install-recommends \
        locales \
        ca-certificates \
        wget \
        tzdata \
    && printf 'C.UTF-8 UTF-8\nar_SA.UTF-8 UTF-8\nen_US.UTF-8 UTF-8\n' >> /etc/locale.gen \
    && locale-gen \
    && update-locale LANG=C.UTF-8 LC_ALL=C.UTF-8 \
    && ln -sf /usr/share/zoneinfo/Asia/Riyadh /etc/localtime \
    && echo "Asia/Riyadh" > /etc/timezone \
    && rm -rf /var/lib/apt/lists/*

# ─── إعداد مجلد العمل ────────────────────────────────────────────────────────
WORKDIR /app

# ─── نسخ ملفات التبعيات أولاً (للاستفادة من الكاش) ────────────────────────────
COPY package*.json ./

# ─── تثبيت التبعيات (إنتاجي فقط) ─────────────────────────────────────────────
RUN if [ -f package-lock.json ]; then \
      npm ci --omit=dev && npm cache clean --force; \
    else \
      npm install --omit=dev && npm cache clean --force; \
    fi

# ─── نسخ كود المشروع ─────────────────────────────────────────────────────────
COPY server.js ./
COPY lib/ ./lib/
COPY core/ ./core/
COPY public/ ./public/
COPY data/ ./data/

# ─── إنشاء مستخدم غير جذري (أمان) ──────────────────────────────────────────
RUN groupadd -g 1001 sheikha && \
    useradd -M -u 1001 -g sheikha sheikha && \
    chown -R sheikha:sheikha /app

USER sheikha

# ─── متغيرات البيئة الافتراضية ────────────────────────────────────────────────
ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0
ENV SHEIKHA_ENCODING=utf-8
ENV SHEIKHA_OS_LAYER=ubuntu-linux

# ─── الصحة ────────────────────────────────────────────────────────────────────
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/health || exit 1

# ─── فتح البورت ──────────────────────────────────────────────────────────────
EXPOSE ${PORT}

# ─── التشغيل ──────────────────────────────────────────────────────────────────
CMD ["node", "server.js"]
