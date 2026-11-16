# 3. Architecture Diagrams
- Client -> TLS 1.3 / P0 Auth -> Cloudflare Edge (15 Workers + D1 + R2 + KV)
- Local Foundry: MSI RTX 4060 (Qwen2.5-1.5B + 36.9M LoRA)
- Global Bridges: Google Cloud (me-central2 Dammam) + OpenAI Partner Network
