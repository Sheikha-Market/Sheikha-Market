FROM php:8.2-cli-alpine

# ── تثبيت التبعيات النظامية ──────────────────────────────────────────────────
RUN apk add --no-cache \
        curl \
        libcurl \
        curl-dev \
        oniguruma-dev \
        libzip-dev \
        zip \
        unzip \
    && docker-php-ext-install \
        curl \
        mbstring \
        zip \
        sockets

# ── تثبيت APCu لـ Rate Limiting (اختياري) ────────────────────────────────────
RUN apk add --no-cache pcre-dev $PHPIZE_DEPS \
    && pecl install apcu \
    && docker-php-ext-enable apcu \
    && apk del pcre-dev $PHPIZE_DEPS

# ── إعداد PHP ─────────────────────────────────────────────────────────────────
RUN echo "apc.enabled=1"            >> /usr/local/etc/php/conf.d/apcu.ini \
    && echo "apc.enable_cli=1"      >> /usr/local/etc/php/conf.d/apcu.ini \
    && echo "memory_limit=256M"     >> /usr/local/etc/php/conf.d/custom.ini \
    && echo "expose_php=Off"        >> /usr/local/etc/php/conf.d/custom.ini \
    && echo "display_errors=Off"    >> /usr/local/etc/php/conf.d/custom.ini \
    && echo "log_errors=On"         >> /usr/local/etc/php/conf.d/custom.ini

# ── تثبيت Composer ───────────────────────────────────────────────────────────
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

# ── نسخ الكود ────────────────────────────────────────────────────────────────
WORKDIR /app
COPY composer.json composer.lock* ./

RUN composer install \
        --no-dev \
        --no-scripts \
        --no-autoloader \
        --prefer-dist \
        --no-interaction \
    && composer dump-autoload --optimize --no-dev

COPY . .

# ── مستخدم غير root ───────────────────────────────────────────────────────────
RUN addgroup -g 1001 sheikha \
    && adduser -u 1001 -G sheikha -s /bin/sh -D sheikha \
    && chown -R sheikha:sheikha /app

USER sheikha

# ── المتغيرات الافتراضية ──────────────────────────────────────────────────────
ENV APP_ENV=production \
    PORT=8090 \
    NODE_API_URL=http://sheikha-main-portal:8080 \
    LOG_LEVEL=INFO \
    NODE_TIMEOUT=10

EXPOSE 8090

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -sf http://localhost:${PORT}/health || exit 1

# ── تشغيل الخادم ─────────────────────────────────────────────────────────────
CMD ["sh", "-c", "php -S 0.0.0.0:${PORT} public/index.php"]
