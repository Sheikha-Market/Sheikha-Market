FROM node:20-slim
WORKDIR /app
RUN npm init -y >/dev/null && npm install express@4 --omit=dev --no-audit --no-fund
COPY server.js ./
COPY Sheikha-*.html index.html ./
ENV NODE_ENV=production HOST=0.0.0.0 PORT=8080
EXPOSE 8080 18080 18082
CMD ["node", "server.js"]
