<!-- GOVERNED BY SHEIKHA SOVEREIGN CORE v22.0.0 | BOUND_BY_QURAN_SUNNAH | CR: 2051263653 -->
# ⚡ Quick Start - Sheikha Platform Integration

## 🚀 ابدأ في 5 دقائق

### 1️⃣ Clone & Setup (دقيقة 1)

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/sheikha-core.git
cd sheikha-core

# Install dependencies
npm install

# Setup environment
cp .env.example .env
```

### 2️⃣ Configure Google (دقيقة 2)

```bash
# 1. Go to: https://console.cloud.google.com
# 2. Create OAuth 2.0 credentials
# 3. Add to .env:

GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_SECRET
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

### 3️⃣ Configure Sheikha (دقيقة 3)

```bash
# 1. Login to: https://dashboard.sheikha.cloud
# 2. Generate API key
# 3. Add to .env:

SHEIKHA_API_KEY=sk_live_xxxxx
SHEIKHA_API_URL=https://api.sheikha.cloud
SHEIKHA_WORKSPACE_ID=ws_xxxxx
```

### 4️⃣ Database Setup (دقيقة 4)

```bash
# 1. Update DATABASE_URL in .env:
DATABASE_URL=postgresql://user:password@localhost:5432/sheikha

# 2. Run migrations:
npm run db:migrate
```

### 5️⃣ Run Development Server (دقيقة 5)

```bash
npm run dev
# Server running at http://localhost:3000
```

---

## 🧪 Test Integrations

```bash
# Test Google OAuth
curl http://localhost:3000/api/auth/google

# Test Sheikha API
curl -H "Authorization: Bearer ${SHEIKHA_API_KEY}" \
  http://localhost:3000/api/workspaces

# Test Database
npm run db:test

# Run all tests
npm test
```

---

## 📊 Monitor Status

```bash
# Check integration health
curl http://localhost:3000/api/health

# View sync queue
curl http://localhost:3000/api/queue/status

# Check conflicts
curl http://localhost:3000/api/conflicts
```

---

## 🔗 Key Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/auth/google` | Google login |
| POST | `/api/integrations/sync` | Manual sync |
| GET | `/api/deployments/{id}` | Deployment status |
| POST | `/api/webhooks/google/drive` | Google Drive events |
| POST | `/api/webhooks/sheikha/deployment` | Deployment events |

---

## 📚 Next Steps

1. **Read Documentation:**
   - [Architecture Guide](./ADVANCED-INTEGRATION.md)
   - [Google Setup](./GOOGLE-WORKSPACE-INTEGRATION.md)
   - [Sheikha Setup](./SHEIKHA-PLATFORM-INTEGRATION.md)

2. **Configure GitHub:**
   - Create repository
   - Add secrets
   - Enable workflows

3. **Deploy:**
   - `npm run build`
   - Deploy to Cloudflare Pages
   - Monitor health

4. **Test Production:**
   - Run full test suite
   - Security scanning
   - Load testing

---

## 🆘 Troubleshooting

### Google Auth Failing?
```bash
# Check credentials
echo $GOOGLE_CLIENT_ID
echo $GOOGLE_CLIENT_SECRET

# Verify redirect URI matches Google Console
# Default: http://localhost:3000/api/auth/google/callback
```

### Sheikha API Error?
```bash
# Test API key
curl -H "Authorization: Bearer ${SHEIKHA_API_KEY}" \
  https://api.sheikha.cloud/v1/health

# Check workspace ID
echo $SHEIKHA_WORKSPACE_ID
```

### Database Connection?
```bash
# Test connection
npm run db:test

# View migrations status
npm run db:status

# Reset database (dev only)
npm run db:reset
```

---

## 📞 Support

- 📧 dev@sheikha.cloud
- 🐛 GitHub Issues
- 💬 Slack Community

---

**Happy coding! 🎉**
