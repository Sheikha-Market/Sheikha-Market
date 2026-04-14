# ═══════════════════════════════════════════════════════════════════════════════
# 🏪 شيخة — Dockerfile للنشر الإنتاجي
# ═══════════════════════════════════════════════════════════════════════════════

FROM node:20-alpine AS production

# ─── معلومات ─────────────────────────────────────────────────────────────────
LABEL maintainer="Sheikha Market <info@sheikha.market>"
LABEL description="سوق شيخة للمعادن والسكراب — أول سوق إسلامي رقمي للمعادن"

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
COPY public/ ./public/
COPY data/ ./data/

# ─── إنشاء مستخدم غير جذري (أمان) ──────────────────────────────────────────
RUN addgroup -g 1001 -S sheikha && \
    adduser -S sheikha -u 1001 -G sheikha && \
    chown -R sheikha:sheikha /app

USER sheikha

# ─── متغيرات البيئة الافتراضية ────────────────────────────────────────────────
ENV NODE_ENV=production
ENV PORT=8080

# ─── الصحة ────────────────────────────────────────────────────────────────────
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/health || exit 1

# ─── فتح البورت ──────────────────────────────────────────────────────────────
EXPOSE ${PORT}

# ─── التشغيل ──────────────────────────────────────────────────────────────────
CMD ["node", "server.js"]
