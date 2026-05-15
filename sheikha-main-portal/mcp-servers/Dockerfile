FROM node:20-bookworm-slim

ENV NODE_ENV=production
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8

WORKDIR /app

COPY mcp-servers/package*.json ./mcp-servers/

RUN cd /app/mcp-servers \
    && if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi \
    && npm cache clean --force

COPY lib/ ./lib/
COPY core/ ./core/
COPY data/ ./data/
COPY routes/ ./routes/
COPY public/ ./public/
COPY mcp-servers/ ./mcp-servers/

RUN useradd -m -u 1001 sheikha \
    && chown -R sheikha:sheikha /app

USER sheikha
WORKDIR /app/mcp-servers

EXPOSE 3001 3002

CMD ["node", "sheikha-sdk-server.js"]
