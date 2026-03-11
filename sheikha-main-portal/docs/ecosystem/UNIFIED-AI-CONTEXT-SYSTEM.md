# بسم الله الرحمن الرحيم

# نظام السياق الموحد للذكاء الاصطناعي
**Unified AI Context System — منظومة شيخة**

## 🎯 الرؤية
**«سياق موحد عبر جميع منصات AI»**  
المستخدم يفتح أي chatbot (ChatGPT، Claude، Gemini، أو أي ذكاء صناعي) ويجد:
- ✅ أهدافه جاهزة
- ✅ أسلوبه محفوظ
- ✅ سياقه متواصل
- ✅ تكامله مع المنظومة شغال

---

## 🧠 المحرك المركزي (Unified Context Engine)

### البنية التحتية

```javascript
// محرك السياق الموحد
class UnifiedContextEngine {
  
  /**
   * تخزين سياق المستخدم مركزياً
   */
  async saveUserContext(userId, context) {
    return await db.userContexts.upsert({
      userId: userId,
      
      // 1. الهوية والمعلومات الأساسية
      identity: {
        name: context.name,
        email: context.email,
        role: context.role,          // trader, company, developer
        industry: context.industry,   // metals, scrap, recycling
        location: context.location,   // city, country
        language: context.language    // ar, en, ar+en
      },
      
      // 2. الأهداف الحالية
      goals: context.goals,
      /* مثال:
      [
        "إطلاق Beta في مارس 2026",
        "شراكة مع Google ($5M)",
        "اجتماع الراجحي (500M SAR)",
        "تسجيل 100 تاجر في الشهر الأول"
      ]
      */
      
      // 3. الأسلوب المفضل (Personality)
      personality: {
        tone: context.personality.tone,           // professional, friendly, formal
        detail: context.personality.detail,       // concise, detailed, comprehensive
        format: context.personality.format,       // bullets, paragraphs, code-heavy
        language_mix: context.personality.langMix // arabic-only, english-only, mixed
      },
      /* مثال:
      {
        tone: "direct and clear",
        detail: "comprehensive with examples",
        format: "code blocks + explanations",
        language_mix: "arabic for context, english for code"
      }
      */
      
      // 4. التفضيلات التقنية
      preferences: {
        frameworks: context.preferences.frameworks,
        languages: context.preferences.languages,
        tools: context.preferences.tools,
        conventions: context.preferences.conventions
      },
      /* مثال:
      {
        frameworks: ["Node.js", "Express", "React"],
        languages: ["JavaScript", "Arabic", "English"],
        tools: ["VS Code", "Git", "Vercel"],
        conventions: ["4 spaces", "camelCase", "semicolons"]
      }
      */
      
      // 5. المشاريع النشطة
      projects: context.projects,
      /* مثال:
      [
        {
          name: "Sheikha Marketplace",
          description: "أول منظومة إسلامية للمعادن",
          urls: ["sheikha.top", "github.com/sheikha"],
          stack: ["Node.js", "Express", "JWT", "WebSocket"],
          status: "beta-launch"
        }
      ]
      */
      
      // 6. التكاملات المتصلة
      integrations: context.integrations,
      /* مثال:
      [
        { platform: "chatgpt", connected: true, syncEnabled: true },
        { platform: "claude", connected: true, syncEnabled: true },
        { platform: "gemini", connected: true, syncEnabled: true },
        { platform: "alrajhi-bank", connected: true, syncEnabled: false }
      ]
      */
      
      // 7. الخبرة والمجالات
      expertise: {
        technical: context.expertise.technical,
        business: context.expertise.business,
        religious: context.expertise.religious
      },
      /* مثال:
      {
        technical: ["Backend APIs", "OAuth 2.0", "WebSocket", "Cloud Architecture"],
        business: ["Islamic Economics", "Marketplace Strategy", "Partnership Development"],
        religious: ["Shariah Compliance", "Islamic Finance", "Halal Business"]
      }
      */
      
      // 8. التعليمات المخصصة
      instructions: context.instructions,
      /* مثال نص كامل:
      `
      أنا المالك الوحيد لمنظومة شيخة. أعمل على أول منظومة اقتصادية إسلامية رقمية.
      
      عند الرد:
      - استخدم العربية الفصحى للشرح والسياق
      - استخدم الإنجليزية للكود والمصطلحات التقنية
      - أعطني أمثلة عملية بالكود دائماً
      - كن مباشراً ووفر وقتي
      - راعي المبادئ الشرعية في كل حل تقني
      
      مبادئي:
      - لا ربا، لا غرر، لا غش
      - الصدق في البيع = البركة في المال
      - التقنية في خدمة الشريعة
      `
      */
      
      // 9. الذاكرة قصيرة المدى (Recent Activity)
      recentActivity: context.recentActivity,
      /* مثال:
      [
        {
          date: "2026-03-10",
          activities: [
            "أنشأ نظام صور حقيقية مع IoT",
            "طوّر API للمطورين",
            "عدّل خطة Beta Launch"
          ]
        }
      ]
      */
      
      // 10. Metadata
      metadata: {
        apiToken: context.apiToken,        // للوصول لـ APIs شيخة
        subscribeTier: context.tier,       // free, basic, premium, enterprise
        createdAt: context.createdAt,
        updatedAt: new Date()
      }
    });
  }
  
  /**
   * توليد System Prompt موحد
   */
  generateSystemPrompt(userContext) {
    const ic = userContext.identity;
    const goals = userContext.goals.map(g => `- ${g}`).join('\n');
    const projects = userContext.projects.map(p => `- ${p.name}: ${p.description}`).join('\n');
    
    return `
# سياق المستخدم — منظومة شيخة
*هذا السياق مُحدّث تلقائياً من منظومة شيخة (sheikha.top)*

## الهوية
- **الاسم:** ${ic.name}
- **البريد:** ${ic.email}
- **المجال:** ${ic.industry}
- **الموقع:** ${ic.location}
- **اللغة المفضلة:** ${ic.language}

## الأهداف الحالية
${goals}

## الأسلوب المفضل
- **نبرة الصوت:** ${userContext.personality.tone}
- **مستوى التفصيل:** ${userContext.personality.detail}
- **التنسيق:** ${userContext.personality.format}
- **خليط اللغات:** ${userContext.personality.language_mix}

## المشاريع النشطة
${projects}

## التقنيات المستخدمة
- **Frameworks:** ${userContext.preferences.frameworks.join(', ')}
- **اللغات:** ${userContext.preferences.languages.join(', ')}
- **الأدوات:** ${userContext.preferences.tools.join(', ')}

## التعليمات المخصصة
${userContext.instructions}

## الوصول لبيانات شيخة
- **API Base:** https://sheikha.top/api
- **Authentication:** Bearer ${userContext.metadata.apiToken}
- **المعاملات:** ${userContext.stats?.transactions || 0}
- **التقييم:** ${userContext.stats?.rating || 0}/5

---
**تعليمات للذكاء الاصطناعي:**
جميع الردود يجب أن تأخذ هذا السياق بعين الاعتبار. المستخدم متصل بمنظومة شيخة ويتوقع:
1. فهم أهدافه بدون إعادة شرح
2. الرد بأسلوبه المفضل
3. معرفة مشاريعه وتقنياته
4. استخدام APIs شيخة عند الحاجة
`.trim();
  }
  
  /**
   * حقن السياق في أي منصة AI
   */
  async injectContextToAI(userId, platform, sessionId) {
    // 1. جلب سياق المستخدم
    const context = await this.getUserContext(userId);
    
    // 2. توليد system prompt موحد
    const systemPrompt = this.generateSystemPrompt(context);
    
    // 3. جلب الذاكرة الأخيرة (من جميع المنصات)
    const recentMemory = await memoryEngine.getRecentMemory(userId, 20);
    
    // 4. حقن حسب المنصة
    switch(platform) {
      case 'chatgpt':
        return await this.injectToChatGPT(userId, systemPrompt, recentMemory);
      case 'claude':
        return await this.injectToClaude(userId, systemPrompt, recentMemory);
      case 'gemini':
        return await this.injectToGemini(userId, systemPrompt, recentMemory);
      default:
        return await this.injectGeneric(userId, systemPrompt, recentMemory);
    }
  }
  
  /**
   * مزامنة الذاكرة عبر جميع المنصات
   */
  async syncMemoryAcrossPlatforms(userId, newMessage) {
    // 1. حفظ في الذاكرة المركزية
    await memoryEngine.storeMessage(userId, newMessage.platform, newMessage);
    
    // 2. جلب المنصات المتصلة
    const connectedPlatforms = await this.getConnectedAIPlatforms(userId);
    
    // 3. مزامنة مع كل منصة
    for (const platform of connectedPlatforms) {
      if (platform.syncEnabled && platform.name !== newMessage.platform) {
        await this.updatePlatformMemory(platform.name, userId, newMessage);
      }
    }
  }
  
  async getUserContext(userId) {
    return await db.userContexts.findOne({ userId: userId });
  }
  
  async getConnectedAIPlatforms(userId) {
    const context = await this.getUserContext(userId);
    return context.integrations.filter(i => 
      ['chatgpt', 'claude', 'gemini'].includes(i.platform) && 
      i.connected === true
    );
  }
}

const contextEngine = new UnifiedContextEngine();
module.exports = contextEngine;
```

---

## 🤖 التكاملات مع منصات AI

### 1. ChatGPT (OpenAI)

```javascript
const chatgptConnector = {
  name: 'ChatGPT',
  platform: 'chatgpt',
  
  /**
   * ربط حساب ChatGPT
   */
  async connect(userId, accessToken) {
    // حفظ الاتصال
    await db.connectedAccounts.create({
      userId: userId,
      platform: 'chatgpt',
      accessToken: encrypt(accessToken),
      connectedAt: new Date()
    });
    
    // حقن السياق الموحد
    const context = await contextEngine.getUserContext(userId);
    await this.setupCustomInstructions(userId, accessToken, context);
    
    console.log(`✅ ChatGPT متصل ل ${context.identity.name}`);
  },
  
  /**
   * إعداد Custom Instructions في ChatGPT
   */
  async setupCustomInstructions(userId, accessToken, context) {
    const instructions = {
      // قسم "What would you like ChatGPT to know about you?"
      aboutUser: `
أنا ${context.identity.name} من ${context.identity.industry}.
أستخدم منظومة شيخة (sheikha.top) لتجارة المعادن والسكراب.

مشاريعي الحالية:
${context.projects.map(p => `- ${p.name}: ${p.description}`).join('\n')}

أهدافي:
${context.goals.map(g => `- ${g}`).join('\n')}

التقنيات التي أستخدمها:
${context.preferences.frameworks.join(', ')}
      `.trim(),
      
      // قسم "How would you like ChatGPT to respond?"
      responseStyle: `
يرجى الرد بـ:
- **اللغة:** ${context.identity.language === 'ar' ? 'العربية الفصحى' : 'مزيج من العربية والإنجليزية (عربي للشرح، إنجليزي للكود)'}
- **النبرة:** ${context.personality.tone}
- **التفصيل:** ${context.personality.detail}
- **التنسيق:** ${context.personality.format}

${context.instructions}

**ملاحظة مهمة:**
أنا متصل بمنظومة شيخة — يمكنك الوصول لبياناتي عبر:
- API: https://sheikha.top/api
- Token: ${context.metadata.apiToken}
      `.trim()
    };
    
    // إرسال عبر OpenAI API
    const response = await fetch('https://api.openai.com/v1/user/settings/custom_instructions', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(instructions)
    });
    
    if (!response.ok) {
      throw new Error('فشل إعداد Custom Instructions في ChatGPT');
    }
    
    return await response.json();
  },
  
  /**
   * اعتراض الرسائل للمزامنة
   */
  async onMessageSent(userId, message) {
    await contextEngine.syncMemoryAcrossPlatforms(userId, {
      platform: 'chatgpt',
      role: 'user',
      content: message.content,
      timestamp: new Date(),
      model: message.model || 'gpt-4'
    });
  },
  
  async onMessageReceived(userId, message) {
    await contextEngine.syncMemoryAcrossPlatforms(userId, {
      platform: 'chatgpt',
      role: 'assistant',
      content: message.content,
      timestamp: new Date(),
      model: message.model || 'gpt-4'
    });
  }
};
```

---

### 2. Claude (Anthropic)

```javascript
const claudeConnector = {
  name: 'Claude',
  platform: 'claude',
  
  /**
   * ربط حساب Claude
   */
  async connect(userId, apiKey) {
    await db.connectedAccounts.create({
      userId: userId,
      platform: 'claude',
      credentials: encrypt(apiKey),
      connectedAt: new Date()
    });
    
    // حقن السياق عبر Projects
    const context = await contextEngine.getUserContext(userId);
    await this.setupProjectKnowledge(userId, apiKey, context);
    
    console.log(`✅ Claude متصل ل ${context.identity.name}`);
  },
  
  /**
   * استخدام Claude Projects لتخزين السياق
   */
  async setupProjectKnowledge(userId, apiKey, context) {
    const projectData = {
      name: `شيخة — ${context.identity.name}`,
      description: 'سياق موحد من منظومة شيخة للمعادن والسكراب',
      
      // Custom Instructions
      customInstructions: contextEngine.generateSystemPrompt(context),
      
      // إضافة ملفات السياق
      knowledgeBase: [
        {
          name: 'USER_CONTEXT.md',
          type: 'text/markdown',
          content: `
# سياق ${context.identity.name}

## الأهداف
${context.goals.map(g => `- ${g}`).join('\n')}

## المشاريع
${context.projects.map(p => `
### ${p.name}
${p.description}
- Stack: ${p.stack.join(', ')}
- Status: ${p.status}
- URL: ${p.urls.join(', ')}
`).join('\n')}

## البيانات من منظومة شيخة
- الحساب: ${context.identity.email}
- المعاملات: ${context.stats?.transactions || 0}
- التقييم: ${context.stats?.rating || 0}/5
- API Token: ${context.metadata.apiToken}
          `
        },
        
        {
          name: 'SHEIKHA_API.md',
          type: 'text/markdown',
          content: `
# Sheikha API Reference

Base URL: \`https://sheikha.top/api\`
Authentication: \`Bearer ${context.metadata.apiToken}\`

## المستخدم
\`\`\`
GET /api/user/profile
GET /api/user/stats
\`\`\`

## السوق
\`\`\`
GET /api/market/listings
GET /api/market/prices/:metal
POST /api/market/listing
\`\`\`

## المعاملات
\`\`\`
GET /api/transactions
POST /api/transaction/create
\`\`\`

## المراجعة الشرعية
\`\`\`
POST /api/shariah/check
GET /api/shariah/status/:transactionId
\`\`\`

## مثال
\`\`\`javascript
const response = await fetch('https://sheikha.top/api/market/prices/iron', {
  headers: {
    'Authorization': 'Bearer ${context.metadata.apiToken}'
  }
});
const ironPrice = await response.json();
\`\`\`
          `
        }
      ]
    };
    
    // إنشاء Project في Claude
    const response = await fetch('https://api.anthropic.com/v1/projects', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(projectData)
    });
    
    if (!response.ok) {
      throw new Error('فشل إعداد Project في Claude');
    }
    
    return await response.json();
  },
  
  /**
   * اعتراض الرسائل
   */
  async onMessageSent(userId, message) {
    await contextEngine.syncMemoryAcrossPlatforms(userId, {
      platform: 'claude',
      role: 'user',
      content: message.content,
      timestamp: new Date(),
      model: message.model || 'claude-3-opus'
    });
  },
  
  async onMessageReceived(userId, message) {
    await contextEngine.syncMemoryAcrossPlatforms(userId, {
      platform: 'claude',
      role: 'assistant',
      content: message.content,
      timestamp: new Date(),
      model: message.model || 'claude-3-opus'
    });
  }
};
```

---

### 3. Google Gemini

```javascript
const geminiConnector = {
  name: 'Gemini',
  platform: 'gemini',
  
  /**
   * ربط حساب Gemini
   */
  async connect(userId, accessToken) {
    await db.connectedAccounts.create({
      userId: userId,
      platform: 'gemini',
      accessToken: encrypt(accessToken),
      connectedAt: new Date()
    });
    
    // حقن السياق عبر System Instruction
    const context = await contextEngine.getUserContext(userId);
    await this.setupSystemInstruction(userId, accessToken, context);
    await this.setupFunctionCalling(userId, accessToken, context);
    
    console.log(`✅ Gemini متصل ل ${context.identity.name}`);
  },
  
  /**
   * إعداد System Instruction
   */
  async setupSystemInstruction(userId, accessToken, context) {
    const systemInstruction = {
      role: 'system',
      parts: [{
        text: `
${contextEngine.generateSystemPrompt(context)}

## تكامل منظومة شيخة
يمكنك الوصول لبيانات المستخدم عبر Function Calling:
- \`get_sheikha_prices(metal)\` — لجلب أسعار المعادن
- \`check_shariah_compliance(transaction)\` — للتحقق الشرعي
- \`get_user_transactions()\` — لعرض المعاملات
- \`search_market_listings(query)\` — للبحث في السوق

ملاحظة: المستخدم يستخدم منظومة شيخة — أول منظومة إسلامية رقمية للمعادن والسكراب.
        `.trim()
      }]
    };
    
    // حفظ في Gemini Context API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/users/${userId}/context`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(systemInstruction)
    });
    
    if (!response.ok) {
      throw new Error('فشل إعداد System Instruction في Gemini');
    }
    
    return await response.json();
  },
  
  /**
   * إعداد Function Calling لربط APIs شيخة
   */
  async setupFunctionCalling(userId, accessToken, context) {
    const functions = [
      {
        name: 'get_sheikha_prices',
        description: 'جلب أسعار المعادن من سوق شيخة',
        parameters: {
          type: 'object',
          properties: {
            metal: {
              type: 'string',
              enum: ['iron', 'copper', 'aluminum', 'steel', 'brass', 'zinc'],
              description: 'نوع المعدن'
            }
          },
          required: ['metal']
        },
        implementation: async (args) => {
          const response = await fetch(`https://sheikha.top/api/market/prices/${args.metal}`, {
            headers: { 'Authorization': `Bearer ${context.metadata.apiToken}` }
          });
          return await response.json();
        }
      },
      
      {
        name: 'check_shariah_compliance',
        description: 'التحقق من التوافق الشرعي لمعاملة',
        parameters: {
          type: 'object',
          properties: {
            transaction: {
              type: 'object',
              description: 'بيانات المعاملة',
              properties: {
                seller: { type: 'string' },
                buyer: { type: 'string' },
                product: { type: 'string' },
                price: { type: 'number' },
                payment_method: { type: 'string' }
              }
            }
          },
          required: ['transaction']
        },
        implementation: async (args) => {
          const response = await fetch('https://sheikha.top/api/shariah/check', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${context.metadata.apiToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(args.transaction)
          });
          return await response.json();
        }
      },
      
      {
        name: 'get_user_transactions',
        description: 'جلب معاملات المستخدم',
        parameters: {
          type: 'object',
          properties: {
            limit: { type: 'number', description: 'عدد المعاملات' }
          }
        },
        implementation: async (args) => {
          const response = await fetch(`https://sheikha.top/api/transactions?limit=${args.limit || 10}`, {
            headers: { 'Authorization': `Bearer ${context.metadata.apiToken}` }
          });
          return await response.json();
        }
      },
      
      {
        name: 'search_market_listings',
        description: 'البحث في قوائم السوق',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'كلمة البحث' }
          },
          required: ['query']
        },
        implementation: async (args) => {
          const response = await fetch(`https://sheikha.top/api/market/search?q=${encodeURIComponent(args.query)}`, {
            headers: { 'Authorization': `Bearer ${context.metadata.apiToken}` }
          });
          return await response.json();
        }
      }
    ];
    
    // تسجيل Functions في Gemini
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:registerFunctions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ functions: functions })
    });
    
    if (!response.ok) {
      throw new Error('فشل تسجيل Functions في Gemini');
    }
    
    return functions;
  },
  
  /**
   * اعتراض الرسائل
   */
  async onMessageSent(userId, message) {
    await contextEngine.syncMemoryAcrossPlatforms(userId, {
      platform: 'gemini',
      role: 'user',
      content: message.content,
      timestamp: new Date(),
      model: message.model || 'gemini-pro'
    });
  },
  
  async onMessageReceived(userId, message) {
    await contextEngine.syncMemoryAcrossPlatforms(userId, {
      platform: 'gemini',
      role: 'model',
      content: message.content,
      timestamp: new Date(),
      model: message.model || 'gemini-pro'
    });
  }
};
```

---

## 🧠 محرك الذاكرة الموحدة (Unified Memory Engine)

```javascript
class UnifiedMemoryEngine {
  
  /**
   * تخزين رسالة من أي منصة
   */
  async storeMessage(userId, platform, message) {
    const entry = await db.unifiedMemory.create({
      userId: userId,
      platform: platform,
      role: message.role,        // user | assistant | system
      content: message.content,
      timestamp: message.timestamp || new Date(),
      metadata: {
        model: message.model,
        tokens: message.tokens,
        cost: message.cost,
        sessionId: message.sessionId
      }
    });
    
    // تحديث الخلاصة
    await this.updateContextSummary(userId);
    
    return entry;
  }
  
  /**
   * جلب آخر N رسالة من جميع المنصات
   */
  async getRecentMemory(userId, limit = 50) {
    return await db.unifiedMemory.find({
      userId: userId
    })
    .sort({ timestamp: -1 })
    .limit(limit);
  }
  
  /**
   * توليد خلاصة ذكية للمحادثات
   */
  async updateContextSummary(userId) {
    const recentMessages = await this.getRecentMemory(userId, 100);
    
    // استخدام AI لتلخيص
    const summary = await this.summarizeConversations(recentMessages);
    
    await db.userContexts.updateOne(
      { userId: userId },
      { 
        $set: { 
          conversationSummary: summary,
          lastActive: new Date()
        }
      }
    );
    
    return summary;
  }
  
  /**
   * تلخيص المحادثات بالذكاء الاصطناعي
   */
  async summarizeConversations(messages) {
    const conversation = messages.map(m => 
      `[${m.platform}] ${m.role}: ${m.content.substring(0, 200)}...`
    ).join('\n');
    
    const prompt = `
خلّص المحادثات التالية في نقاط رئيسية:

${conversation}

الخلاصة يجب أن تتضمن:
- الموضوعات الرئيسية
- القرارات المتخذة
- المهام المطلوبة
- النقاط المهمة للتذكر
`;
    
    // استخدام نموذج خفيف للتلخيص
    const summary = await callAISummarizer(prompt);
    
    return summary;
  }
  
  /**
   * مزامنة الذاكرة مع منصة محددة
   */
  async syncToPlatform(userId, targetPlatform) {
    const memory = await this.getRecentMemory(userId, 20);
    const context = await db.userContexts.findOne({ userId });
    
    const syncData = {
      systemPrompt: contextEngine.generateSystemPrompt(context),
      conversationHistory: memory.map(m => ({
        role: m.role,
        content: m.content,
        platform: m.platform,
        timestamp: m.timestamp
      })),
      summary: context.conversationSummary
    };
    
    // إرسال للمنصة المستهدفة
    switch(targetPlatform) {
      case 'chatgpt':
        await chatgptConnector.injectMemory(userId, syncData);
        break;
      case 'claude':
        await claudeConnector.injectMemory(userId, syncData);
        break;
      case 'gemeni':
        await geminiConnector.injectMemory(userId, syncData);
        break;
    }
    
    console.log(`✅ تمت مزامنة الذاكرة مع ${targetPlatform}`);
  }
}

const memoryEngine = new UnifiedMemoryEngine();
module.exports = memoryEngine;
```

---

## 🎯 سيناريو الاستخدام الكامل

### المثال العملي:

```javascript
// المستخدم: سلمان الراجح
// الحساب: market@sheikha.top
// الاشتراك: Premium

// ════════════════════════════════════════
// صباح الإثنين - يفتح ChatGPT
// ════════════════════════════════════════

// ChatGPT يستقبل تلقائياً:
const chatgptContext = {
  systemPrompt: `
أنا سلمان الراجح، مالك منظومة شيخة (sheikha.top).
أعمل على أول منظومة اقتصادية إسلامية رقمية للمعادن والسكراب.

أهدافي الحالية:
- إطلاق Beta في مارس 2026
- شراكة مع Google ($5M)
- اجتماع مع الراجحي (500M SAR)

أسلوبي المفضل:
- عربي فصيح + إنجليزي تقني
- مباشر وواضح
- أمثلة عملية بالكود
  `,
  recentActivity: []
};

// المحادثة:
user: "كيف أحسّن أداء API الأسعار؟"

chatgpt: `يا سلمان، بناءً على نظامك في sheikha.top:

1. **Redis Caching**
   - Cache أسعار المعادن لمدة 60 ثانية
   - استخدم \`SETEX\` للـ TTL التلقائي

2. **WebSocket للأسعار اللحظية**
   - بدلاً من polling كل 5 ثواني
   - Push من السيرفر عند تغير السعر فقط

3. **Rate Limiting**
   - 1000 req/min للمستخدم الواحد
   - استخدم \`express-rate-limit\`

[يعرف المشروع + الأهداف + الأسلوب]`

// يتم حفظ الرسالة في الذاكرة الموحدة ✅

// ════════════════════════════════════════
// ظهر الإثنين - يفتح Claude
// ════════════════════════════════════════

// Claude يستقبل نفس السياق + الذاكرة من ChatGPT:
const claudeContext = {
  ...chatgptContext,
  recentConversations: [
    {
      platform: 'chatgpt',
      topic: 'تحسين API الأسعار',
      solutions: ['Redis', 'WebSocket', 'Rate limiting'],
      timestamp: '2026-03-10 09:30'
    }
  ]
};

// المحادثة:
user: "اكتب كود Redis للأسعار"

claude: `فهمت! بناءً على مناقشتك الصباحية مع ChatGPT عن تحسين API...

[يعرف المحادثة السابقة في ChatGPT!]

إليك الكود:

\`\`\`javascript
const redis = require('redis');
const client = redis.createClient();

app.get('/api/market/prices/:metal', async (req, res) => {
  const metal = req.params.metal;
  const cacheKey = \`price:\${metal}\`;
  
  // 1. تحقق من Cache
  const cached = await client.get(cacheKey);
  if (cached) {
    return res.json({
      ...JSON.parse(cached),
      source: 'cache'
    });
  }
  
  // 2. جلب من Database
  const price = await db.prices.findOne({ metal });
  
  // 3. حفظ في Cache لمدة 60 ثانية
  await client.setex(cacheKey, 60, JSON.stringify(price));
  
  res.json({
    ...price,
    source: 'database'
  });
});
\`\`\`

هل تريد إضافة WebSocket أيضاً؟`

// ════════════════════════════════════════
// مساء الإثنين - يفتح Gemini
// ════════════════════════════════════════

// Gemini يستقبل السياق الكامل:
const geminiContext = {
  ...chatgptContext,
  todaysWork: [
    'بحث تحسين API مع ChatGPT',
    'كتابة كود Redis مع Claude',
    'الآن: اختبار الحل'
  ]
};

// المحادثة:
user: "ما رأيك بالحل؟"

gemini: `الحل ممتاز يا سلمان! Redis + WebSocket سيخفض latency من 200ms إلى 50ms.

[يعرف كل ما حصل اليوم عبر 3 منصات!]

ملاحظات على كود Claude:
1. أضف connection pooling
2. Handle Redis disconnect
3. Set TTL = 60s للأسعار

دعني أجلب أسعار الحديد الحالية من نظامك...

*[يستخدم Function Calling]*
\`get_sheikha_prices("iron")\`

السعر الحالي: 2,450 ريال/طن
آخر تحديث: منذ 5 دقائق

هل تريد أن أكتب unit tests للـ Redis cache؟`
```

**النتيجة:**  
✅ المستخدم لا يعيد الشرح أبداً  
✅ كل AI يكمل عمل الآخر  
✅ ذاكرة موحدة عبر المنصات  
✅ سياق متواصل 24/7  
✅ Function Calling لربط APIs شيخة

---

## 📊 لوحة التحكم للمستخدم

```html
<div class="unified-ai-dashboard">
  <h2>🧠 السياق الموحد للذكاء الاصطناعي</h2>
  
  <!-- المنصات المتصلة -->
  <div class="connected-platforms">
    <div class="platform chatgpt connected">
      <i class="icon-openai"></i>
      <h3>ChatGPT</h3>
      <span class="status">✅ متصل</span>
      <span class="sync">🔄 المزامنة: مفعلة</span>
      <button onclick="editContext('chatgpt')">تعديل السياق</button>
    </div>
    
    <div class="platform claude connected">
      <i class="icon-anthropic"></i>
      <h3>Claude</h3>
      <span class="status">✅ متصل</span>
      <span class="sync">🔄 المزامنة: مفعلة</span>
      <button onclick="editContext('claude')">تعديل السياق</button>
    </div>
    
    <div class="platform gemini connected">
      <i class="icon-google"></i>
      <h3>Gemini</h3>
      <span class="status">✅ متصل</span>
      <span class="sync">🔄 المزامنة: مفعلة</span>
      <button onclick="editContext('gemini')">تعديل السياق</button>
    </div>
    
    <div class="platform copilot notconnected">
      <i class="icon-github"></i>
      <h3>GitHub Copilot</h3>
      <span class="status">⚪ غير متصل</span>
      <button onclick="connectAI('copilot')">+ ربط</button>
    </div>
  </div>
  
  <!-- السياق الحالي -->
  <div class="current-context">
    <h3>📝 السياق الموحد</h3>
    
    <div class="context-item">
      <strong>الأهداف:</strong>
      <ul>
        <li>إطلاق Beta في مارس 2026</li>
        <li>شراكة مع Google ($5M)</li>
        <li>اجتماع الراجحي (500M SAR)</li>
      </ul>
      <button onclick="editGoals()">✏️ تعديل</button>
    </div>
    
    <div class="context-item">
      <strong>الأسلوب المفضل:</strong>
      <p>مباشر ووواضح، أمثلة عملية بالكود، مزيج عربي/إنجليزي</p>
      <button onclick="editPersonality()">✏️ تعديل</button>
    </div>
    
    <div class="context-item">
      <strong>المشاريع:</strong>
      <ul>
        <li>Sheikha Marketplace (sheikha.top)</li>
        <li>Stack: Node.js, Express, JWT, WebSocket</li>
      </ul>
      <button onclick="editProjects()">✏️ تعديل</button>
    </div>
  </div>
  
  <!-- الذاكرة الموحدة -->
  <div class="unified-memory">
    <h3>🧠 الذاكرة الموحدة</h3>
    
    <div class="memory-timeline">
      <div class="memory-item">
        <span class="platform">ChatGPT</span>
        <span class="time">09:30</span>
        <p>بحث عن تحسين API الأسعار</p>
      </div>
      
      <div class="memory-item">
        <span class="platform">Claude</span>
        <span class="time">13:15</span>
        <p>كتابة كود Redis Caching</p>
      </div>
      
      <div class="memory-item">
        <span class="platform">Gemini</span>
        <span class="time">19:45</span>
        <p>مراجعة الكود + جلب أسعار حية</p>
      </div>
    </div>
    
    <button onclick="viewFullMemory()">عرض السجل الكامل</button>
    <button onclick="clearMemory()">مسح الذاكرة</button>
  </div>
  
  <!-- الإحصائيات -->
  <div class="stats">
    <div class="stat-card">
      <span class="number">3</span>
      <span class="label">منصات متصلة</span>
    </div>
    
    <div class="stat-card">
      <span class="number">127</span>
      <span class="label">محادثة هذا الشهر</span>
    </div>
    
    <div class="stat-card">
      <span class="number">100%</span>
      <span class="label">نسبة المزامنة</span>
    </div>
  </div>
</div>
```

---

## 🚀 التسعير

| الخطة | سياق موحد | ذاكرة | منصات | السعر |
|---|---|---|---|---|
| **Free** | ✅ | 50 رسالة | 1 منصة | مجاناً |
| **Basic** | ✅ | 500 رسالة | 3 منصات | 49 ريال/شهر |
| **Premium** | ✅ | غير محدود | 10 منصات | 149 ريال/شهر |
| **Enterprise** | ✅ | غير محدود | غير محدود | 499 ريال/شهر |

---

## 📝 خطة التنفيذ

### المرحلة 1: البنية التحتية (30 يوم)
- [ ] بناء Unified Context Engine
- [ ] بناء Unified Memory Engine
- [ ] قاعدة بيانات للسياق والذاكرة

### المرحلة 2: تكامل ChatGPT (15 يوم)
- [ ] OAuth مع OpenAI
- [ ] Custom Instructions API
- [ ] اعتراض الرسائل

### المرحلة 3: تكامل Claude (15 يوم)
- [ ] API Key Authentication
- [ ] Projects API
- [ ] Knowledge Base Injection

### المرحلة 4: تكامل Gemini (15 يوم)
- [ ] OAuth مع Google
- [ ] System Instruction API
- [ ] Function Calling Setup

### المرحلة 5: المزامنة (15 يوم)
- [ ] Real-time sync عبر المنصات
- [ ] Conflict resolution
- [ ] Memory summarization

### المرحلة 6: الواجهة (15 يوم)
- [ ] لوحة تحكم المستخدم
- [ ] تعديل السياق
- [ ] عرض الذاكرة

**المدة الإجمالية:** 105 يوم (~3.5 شهر)

---

**الختام:**  
نظام السياق الموحد = **انتهى عصر إعادة الشرح!**  
اشترك مرة → جميع AIs تفهمك تلقائياً 🎯
