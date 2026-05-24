/**
 * 🛠️ محرك التطوير المتكامل - منظومة شيخة
 * Sheikha Integrated Development Engine
 * 
 * التكامل مع:
 * - Claude Opus 4.5 (Anthropic) - للبرمجة المتقدمة
 * - Cursor IDE - للتطوير التفاعلي
 * - GPT-5.2 (OpenAI) - للمساعدة العامة
 */

// ═══════════════════════════════════════════════════════════════════════════════
// 📋 قوالب التطوير الجاهزة
// ═══════════════════════════════════════════════════════════════════════════════

const DEVELOPMENT_TEMPLATES = {
    // قالب API جديد
    api: {
        name: 'API Endpoint',
        description: 'قالب لإنشاء نقطة نهاية API جديدة',
        template: `
// ─── API: {name} ───────────────────────────────────────────────────────────────
// الوصف: {description}
// التاريخ: {date}

app.{method}('{path}', express.json(), async (req, res) => {
    try {
        const { /* params */ } = req.body;
        
        // التحقق من البيانات
        if (!/* validation */) {
            return res.status(400).json({
                success: false,
                message: 'بيانات غير صالحة'
            });
        }
        
        // المنطق الرئيسي
        const result = {
            // النتيجة
        };
        
        res.json({
            success: true,
            data: result,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('[{name}] Error:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في الخادم: ' + error.message
        });
    }
});
`
    },
    
    // قالب صفحة HTML
    page: {
        name: 'HTML Page',
        description: 'قالب لإنشاء صفحة HTML جديدة',
        template: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} | شبكة شيخة الذكية</title>
    <style>
        :root {
            --gold: #D4AF37;
            --copper: #B87333;
            --dark-bg: #0a0f1a;
            --card-bg: #1f2937;
            --border: #374151;
            --text-primary: #f3f4f6;
            --text-secondary: #9ca3af;
            --success: #10b981;
            --warning: #f59e0b;
            --error: #ef4444;
            --info: #3b82f6;
        }
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        body {
            font-family: 'Segoe UI', Tahoma, sans-serif;
            background: var(--dark-bg);
            color: var(--text-primary);
            min-height: 100vh;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 40px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        
        .header h1 {
            font-size: 2.5rem;
            background: linear-gradient(135deg, var(--gold), var(--copper));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .card {
            background: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 15px;
            padding: 25px;
            margin-bottom: 20px;
        }
        
        .btn {
            padding: 12px 25px;
            border-radius: 10px;
            border: none;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, var(--gold), var(--copper));
            color: #000;
        }
        
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(212,175,55,0.3);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{title}</h1>
            <p style="color: var(--text-secondary); margin-top: 10px;">{description}</p>
        </div>
        
        <div class="card">
            <!-- المحتوى هنا -->
        </div>
    </div>
    
    <script>
        // الكود هنا
    </script>
</body>
</html>`
    },
    
    // قالب مكون React
    component: {
        name: 'React Component',
        description: 'قالب لإنشاء مكون React',
        template: `import React, { useState, useEffect } from 'react';

/**
 * {name} Component
 * {description}
 */
const {name} = ({ /* props */ }) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        // تحميل البيانات
        loadData();
    }, []);
    
    const loadData = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/{endpoint}');
            const result = await response.json();
            setData(result.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    if (loading) return <div className="loading">جاري التحميل...</div>;
    if (error) return <div className="error">خطأ: {error}</div>;
    
    return (
        <div className="{name.toLowerCase()}">
            {/* المحتوى هنا */}
        </div>
    );
};

export default {name};`
    },
    
    // قالب نموذج بيانات
    model: {
        name: 'Data Model',
        description: 'قالب لإنشاء نموذج بيانات',
        template: `/**
 * {name} Model
 * {description}
 */

const {name}Schema = {
    id: { type: 'string', required: true, unique: true },
    createdAt: { type: 'date', default: () => new Date() },
    updatedAt: { type: 'date', default: () => new Date() },
    
    // الحقول الأساسية
    nameAr: { type: 'string', required: true },
    nameEn: { type: 'string' },
    
    // الحقول الإضافية
    // ...
    
    // العلاقات
    // ...
};

const {name}Methods = {
    // إنشاء
    create: async (data) => {
        const id = '{prefix}-' + Date.now();
        return { id, ...data, createdAt: new Date() };
    },
    
    // قراءة
    findById: async (id) => {
        // البحث في قاعدة البيانات
    },
    
    // تحديث
    update: async (id, updates) => {
        return { id, ...updates, updatedAt: new Date() };
    },
    
    // حذف
    delete: async (id) => {
        return { success: true, id };
    }
};

module.exports = { {name}Schema, {name}Methods };`
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🔧 إعدادات Cursor IDE
// ═══════════════════════════════════════════════════════════════════════════════

const CURSOR_CONFIG = {
    // إعدادات موصى بها لـ Cursor
    settings: {
        "editor.fontSize": 14,
        "editor.fontFamily": "'Fira Code', Consolas, 'Courier New', monospace",
        "editor.fontLigatures": true,
        "editor.tabSize": 4,
        "editor.insertSpaces": true,
        "editor.wordWrap": "on",
        "editor.formatOnSave": true,
        "editor.defaultFormatter": "esbenp.prettier-vscode",
        
        // RTL Support
        "editor.unicodeBidi": "bidiOverride",
        
        // AI Settings
        "cursor.aiModel": "claude-opus-4-5",
        "cursor.enableAI": true,
        "cursor.autoComplete": true,
        
        // Arabic Support
        "files.encoding": "utf8",
        "files.autoSave": "onFocusChange"
    },
    
    // ملحقات موصى بها
    extensions: [
        "esbenp.prettier-vscode",
        "dbaeumer.vscode-eslint",
        "formulahendry.auto-rename-tag",
        "bradlc.vscode-tailwindcss",
        "ms-vscode.vscode-typescript-next",
        "GitHub.copilot",
        "anthropics.claude-dev"
    ],
    
    // اختصارات مفيدة
    keybindings: [
        { key: "ctrl+shift+a", command: "cursor.askAI" },
        { key: "ctrl+shift+g", command: "cursor.generateCode" },
        { key: "ctrl+shift+e", command: "cursor.explainCode" },
        { key: "ctrl+shift+r", command: "cursor.refactorCode" }
    ]
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🤖 برومبتات Claude للتطوير
// ═══════════════════════════════════════════════════════════════════════════════

const CLAUDE_DEVELOPMENT_PROMPTS = {
    // برومبت التطوير العام
    general: `أنت مطور خبير في منظومة شيخة للمعادن والسكراب.

التقنيات المستخدمة:
- Backend: Node.js + Express.js
- Frontend: HTML/CSS/JavaScript (Vanilla)
- Database: JSON files + In-memory
- AI: OpenAI GPT-5.2 + Anthropic Claude Opus 4.5
- Real-time: WebSocket

الأولويات:
1. الكود نظيف وموثق
2. دعم اللغة العربية (RTL)
3. التوافق مع الشريعة الإسلامية
4. الأداء والأمان
5. تجربة المستخدم

أجب بالعربية وقدم كود جاهز للاستخدام.`,

    // برومبت إنشاء API
    api: `أنت مطور API محترف لمنظومة شيخة.

المتطلبات:
- استخدام Express.js
- التحقق من البيانات
- معالجة الأخطاء
- التوثيق بالعربية
- إرجاع JSON موحد

الصيغة المطلوبة للاستجابة:
{
    success: boolean,
    data: object | array,
    message?: string,
    timestamp: ISO string
}`,

    // برومبت إنشاء واجهة
    ui: `أنت مصمم واجهات لمنظومة شيخة.

أسلوب التصميم:
- ألوان: ذهبي (#D4AF37)، نحاسي (#B87333)، خلفية داكنة (#0a0f1a)
- خطوط: Segoe UI للعربية
- تصميم حديث مع ظلال وتدرجات
- RTL كامل
- متجاوب مع جميع الشاشات

المكونات الأساسية:
- بطاقات (cards) مع حدود مستديرة
- أزرار بتدرج ذهبي
- جداول أنيقة
- نماذج واضحة`,

    // برومبت تحليل الكود
    analyze: `حلل الكود التالي من منظومة شيخة:

ابحث عن:
1. مشاكل الأمان
2. تحسينات الأداء
3. أخطاء محتملة
4. فرص إعادة الهيكلة
5. توثيق ناقص

قدم تقريراً بالعربية مع اقتراحات محددة.`,

    // برومبت إصلاح الأخطاء
    debug: `أنت خبير في تصحيح الأخطاء لمنظومة شيخة.

خطوات التصحيح:
1. فهم الخطأ
2. تحديد السبب الجذري
3. اقتراح الحل
4. تقديم الكود المصحح
5. شرح ما تم تغييره

قدم الحل بالعربية مع شرح واضح.`
};

// ═══════════════════════════════════════════════════════════════════════════════
// 🔌 دوال التكامل
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * إنشاء كود من قالب
 */
function generateFromTemplate(templateName, variables) {
    const template = DEVELOPMENT_TEMPLATES[templateName];
    if (!template) return null;
    
    let code = template.template;
    for (const [key, value] of Object.entries(variables)) {
        code = code.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }
    
    return {
        name: template.name,
        description: template.description,
        code: code
    };
}

/**
 * الحصول على برومبت Claude المناسب
 */
function getClaudePrompt(type) {
    return CLAUDE_DEVELOPMENT_PROMPTS[type] || CLAUDE_DEVELOPMENT_PROMPTS.general;
}

/**
 * إعدادات Cursor الموصى بها
 */
function getCursorSettings() {
    return CURSOR_CONFIG;
}

/**
 * قائمة القوالب المتاحة
 */
function listTemplates() {
    return Object.entries(DEVELOPMENT_TEMPLATES).map(([key, template]) => ({
        id: key,
        name: template.name,
        description: template.description
    }));
}

/**
 * إنشاء ملف .cursorrules للمشروع
 */
function generateCursorRules() {
    return `# Cursor Rules for Sheikha Project

## Language
- Primary: Arabic (RTL)
- Code comments: Arabic
- Variable names: English (camelCase)

## Tech Stack
- Backend: Node.js + Express.js
- Frontend: Vanilla HTML/CSS/JS
- AI: OpenAI GPT-5.2 + Claude Opus 4.5
- Real-time: WebSocket

## Code Style
- Use 4 spaces for indentation
- Always add Arabic comments
- Follow Express.js best practices
- Validate all inputs
- Handle all errors gracefully

## Design
- Colors: Gold (#D4AF37), Copper (#B87333), Dark (#0a0f1a)
- Font: Segoe UI
- RTL layout
- Responsive design

## AI Integration
- Use Claude for complex coding tasks
- Use GPT-5.2 for general assistance
- Always validate AI-generated code

## Sharia Compliance
- No interest (riba) calculations
- Transparent pricing
- Ethical business practices
`;
}

/**
 * إنشاء ملف إعدادات Claude Code
 */
function generateClaudeConfig() {
    return {
        "$schema": "https://raw.githubusercontent.com/anthropics/claude-code/main/schema.json",
        "model": "claude-opus-4-5-20251101",
        "maxTokens": 8000,
        "temperature": 0.3,
        "systemPrompt": CLAUDE_DEVELOPMENT_PROMPTS.general,
        "codeStyle": {
            "language": "javascript",
            "framework": "express",
            "comments": "arabic",
            "indentation": "spaces",
            "tabWidth": 4
        },
        "projectContext": {
            "name": "Sheikha Metal & Scrap Platform",
            "type": "full-stack",
            "mainFile": "server.js",
            "publicDir": "public"
        }
    };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📤 التصدير
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
    DEVELOPMENT_TEMPLATES,
    CURSOR_CONFIG,
    CLAUDE_DEVELOPMENT_PROMPTS,
    generateFromTemplate,
    getClaudePrompt,
    getCursorSettings,
    listTemplates,
    generateCursorRules,
    generateClaudeConfig
};
