ARG NODE_IMAGE=node:22-bookworm-slim
FROM ${NODE_IMAGE}
RUN apt-get update && apt-get install -y --no-install-recommends git \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /opt/sheikha
COPY runtime/repository-integration/v1/sheikha-repository-integration-v1.js runtime/repository-integration/v1/
COPY tools/integrations/sheikha-repositories-v1.cjs tools/integrations/
COPY config/sheikha-repository-integrations-v1.json config/
USER 1000:1000
ENTRYPOINT ["node", "tools/integrations/sheikha-repositories-v1.cjs"]
CMD ["--root", "/workspace"]
