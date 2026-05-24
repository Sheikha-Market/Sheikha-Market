/**
 * محلل ومفسر الأكواد البرمجية — منظومة شيخة
 * Code Analyzer & Parser — Sheikha Platform
 *
 * مبادئ شرعية:
 * - وَالَّذِينَ يُحَافِظُونَ عَلَى حُدُودِ اللَّهِ (البقرة:187) — حماية النظام
 * - فَبِمَا رَحْمَةٍ مِّنَ اللَّهِ لِنتَ لَهُمْ (آل عمران:159) — الرفق في التعليم
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('acorn');

class CodeAnalyzerParser {
    constructor() {
        this.parsedCode = new Map();
        this.codeIndex = new Map();
        this.explanations = new Map();
        this.statistics = {
            totalFilesAnalyzed: 0,
            totalFunctionsFound: 0,
            totalClassesFound: 0
        };

        this.indexPath = path.join(__dirname, '../data/code-index.json');
        this.explanationPath = path.join(__dirname, '../data/code-explanations.ndjson');

        this.loadExistingData();
    }

    /**
     * تحليل ملف JavaScript كامل
     */
    analyzeFile(filePath) {
        try {
            const code = fs.readFileSync(filePath, 'utf-8');
            const filename = path.basename(filePath);

            // محاولة تحليل الكود
            let ast = null;
            try {
                ast = parse(code, { ecmaVersion: 2020, sourceType: 'module' });
            } catch (parseErr) {
                // إذا فشل التحليل، نستخدم تحليل نصي بسيط
                return this.analyzeCodeTextually(code, filename);
            }

            // تحليل AST
            const analysis = this.traverseAST(ast, filename);
            this.statistics.totalFilesAnalyzed++;

            return analysis;
        } catch (err) {
            console.error(`❌ فشل تحليل الملف ${filePath}:`, err.message);
            return null;
        }
    }

    /**
     * تحليل نصي للكود (عند فشل التحليل الصرف)
     */
    analyzeCodeTextually(code, filename) {
        const analysis = {
            filename,
            type: 'textual-analysis',
            functions: [],
            classes: [],
            comments: [],
            statistics: {
                lines: code.split('\n').length,
                characters: code.length
            }
        };

        const lines = code.split('\n');

        lines.forEach((line, idx) => {
            // البحث عن دوال
            const funcMatch = line.match(
                /(?:function|const|let|var)\s+(\w+)\s*=?\s*(?:function|\()/
            );
            if (funcMatch) {
                analysis.functions.push({
                    name: funcMatch[1],
                    lineNumber: idx + 1,
                    type: line.includes('async') ? 'async' : 'sync'
                });
            }

            // البحث عن فئات
            const classMatch = line.match(/class\s+(\w+)/);
            if (classMatch) {
                analysis.classes.push({
                    name: classMatch[1],
                    lineNumber: idx + 1
                });
            }

            // البحث عن تعليقات
            const commentMatch = line.match(/\/\/\s*(.*)/);
            if (commentMatch) {
                analysis.comments.push({
                    text: commentMatch[1],
                    lineNumber: idx + 1
                });
            }
        });

        return analysis;
    }

    /**
     * عبور شجرة AST
     */
    traverseAST(ast, filename) {
        const analysis = {
            filename,
            type: 'ast-analysis',
            functions: [],
            classes: [],
            variables: [],
            exports: [],
            statistics: {}
        };

        const processNode = node => {
            if (!node) return;

            // دوال
            if (node.type === 'FunctionDeclaration') {
                analysis.functions.push({
                    name: node.id?.name || 'anonymous',
                    type: 'declaration',
                    params: node.params?.length || 0
                });
                this.statistics.totalFunctionsFound++;
            }

            // دوال معرفة كمتغيرات
            if (node.type === 'VariableDeclarator' && node.init?.type === 'FunctionExpression') {
                analysis.functions.push({
                    name: node.id?.name || 'anonymous',
                    type: 'expression',
                    params: node.init.params?.length || 0
                });
                this.statistics.totalFunctionsFound++;
            }

            // فئات
            if (node.type === 'ClassDeclaration') {
                analysis.classes.push({
                    name: node.id?.name || 'anonymous',
                    methods:
                        node.body?.body
                            ?.filter(m => m.type === 'MethodDefinition')
                            ?.map(m => m.key?.name) || []
                });
                this.statistics.totalClassesFound++;
            }

            // متغيرات
            if (node.type === 'VariableDeclarator') {
                analysis.variables.push({
                    name: node.id?.name || 'unknown',
                    kind: node.parent?.kind || 'unknown'
                });
            }

            // exports
            if (
                node.type === 'ExportNamedDeclaration' ||
                node.type === 'ExportDefaultDeclaration'
            ) {
                analysis.exports.push({
                    type: node.type,
                    name: node.declaration?.id?.name || 'default'
                });
            }

            // معالجة الأطفال
            for (const key in node) {
                if (key === 'parent') continue;
                const child = node[key];
                if (Array.isArray(child)) {
                    child.forEach(c => {
                        if (c && typeof c === 'object' && c.type) {
                            c.parent = node;
                            processNode(c);
                        }
                    });
                } else if (child && typeof child === 'object' && child.type) {
                    child.parent = node;
                    processNode(child);
                }
            }
        };

        processNode(ast);
        return analysis;
    }

    /**
     * تفسير كود محدد
     */
    explainCode(code, codeType = 'javascript') {
        const explanation = {
            id: `explain-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            code,
            codeType,
            timestamp: new Date().toISOString(),
            breakdown: [],
            quranRef: 'النور:35 — نور على نور'
        };

        const lines = code.split('\n');

        lines.forEach((line, idx) => {
            if (line.trim().length === 0) return;

            const lineExplanation = {
                lineNumber: idx + 1,
                code: line,
                explanation: this.explainLine(line, codeType),
                quranRef: this.findRelevantQuranic(line)
            };

            explanation.breakdown.push(lineExplanation);
        });

        this.explanations.set(explanation.id, explanation);
        this.persistExplanation(explanation);

        return explanation;
    }

    /**
     * شرح سطر واحد من الكود
     */
    explainLine(line, type) {
        const trimmed = line.trim();

        const patterns = {
            'function-declaration': {
                pattern: /function\s+(\w+)\s*\(/,
                explanation: 'تعريف دالة جديدة'
            },
            'if-statement': {
                pattern: /if\s*\(/,
                explanation: 'شرط تنفيذي (إذا كان...)'
            },
            'loop-for': {
                pattern: /for\s*\(/,
                explanation: 'حلقة تكرار (for loop)'
            },
            'loop-while': {
                pattern: /while\s*\(/,
                explanation: 'حلقة تكرار مشروط (while loop)'
            },
            'constant-declaration': {
                pattern: /const\s+(\w+)\s*=/,
                explanation: 'تعريف متغير ثابت'
            },
            'variable-declaration': {
                pattern: /let\s+(\w+)\s*=/,
                explanation: 'تعريف متغير متغير'
            },
            assignment: {
                pattern: /(\w+)\s*=\s*(?!function)/,
                explanation: 'إسناد قيمة إلى متغير'
            },
            'return-statement': {
                pattern: /return\s+/,
                explanation: 'إرجاع قيمة من الدالة'
            },
            comment: {
                pattern: /^\/\//,
                explanation: 'تعليق توضيحي'
            }
        };

        for (const [key, { pattern, explanation }] of Object.entries(patterns)) {
            if (pattern.test(trimmed)) {
                return `✓ ${key}: ${explanation}`;
            }
        }

        if (trimmed.includes('.')) {
            return '✓ استدعاء دالة أو وصول إلى خاصية';
        }

        return '✓ تعليمة برمجية';
    }

    /**
     * إيجاد مرجع قرآني ذي صلة
     */
    findRelevantQuranic(line) {
        const references = {
            function: 'النور:35 — نور على نور',
            class: 'الشورى:38 — الشورى والنظام',
            if: 'البقرة:47 — فرّق بين الخير والشر',
            loop: 'العلق:1-5 — التكرار والممارسة',
            error: 'النساء:82 — التناسق والتطابق',
            async: 'الإسراء:36 — تدبير الأمور',
            validate: 'البقرة:282 — فاكتبوه والتحقق',
            security: 'البقرة:48 — الحماية',
            const: 'الفيل:1 — الثابت الأساسي',
            cache: 'يوسف:47 — تخزين المعرفة'
        };

        for (const [keyword, ref] of Object.entries(references)) {
            if (line.toLowerCase().includes(keyword)) {
                return ref;
            }
        }

        return 'الكهف:109 — العلم والحكمة';
    }

    /**
     * فهرسة الكود
     */
    indexCode(analysis, filePath) {
        const indexKey = filePath;
        const indexEntry = {
            file: filePath,
            functions: analysis.functions?.map(f => f.name) || [],
            classes: analysis.classes?.map(c => c.name) || [],
            variables: analysis.variables?.map(v => v.name) || [],
            indexed: new Date().toISOString()
        };

        this.codeIndex.set(indexKey, indexEntry);
        this.persistIndex();

        return indexEntry;
    }

    /**
     * البحث في فهرس الكود
     */
    searchCode(query) {
        const results = [];

        this.codeIndex.forEach((entry, key) => {
            const matches = {
                functions: entry.functions.filter(f => f.includes(query)),
                classes: entry.classes.filter(c => c.includes(query)),
                variables: entry.variables.filter(v => v.includes(query))
            };

            if (Object.values(matches).some(arr => arr.length > 0)) {
                results.push({
                    file: key,
                    ...matches
                });
            }
        });

        return results;
    }

    /**
     * الحصول على الإحصائيات
     */
    getStatistics() {
        return {
            ...this.statistics,
            filesIndexed: this.codeIndex.size,
            explanationsCreated: this.explanations.size
        };
    }

    /**
     * حفظ الفهرس
     */
    persistIndex() {
        try {
            const indexData = Object.fromEntries(this.codeIndex);
            fs.writeFileSync(this.indexPath, JSON.stringify(indexData, null, 2));
        } catch (err) {
            console.warn('⚠️ فشل حفظ الفهرس:', err.message);
        }
    }

    /**
     * حفظ التفسير
     */
    persistExplanation(explanation) {
        try {
            fs.appendFileSync(this.explanationPath, JSON.stringify(explanation) + '\n');
        } catch (err) {
            console.warn('⚠️ فشل حفظ التفسير:', err.message);
        }
    }

    /**
     * تحميل البيانات الموجودة
     */
    loadExistingData() {
        try {
            if (fs.existsSync(this.indexPath)) {
                const indexData = JSON.parse(fs.readFileSync(this.indexPath, 'utf-8'));
                this.codeIndex = new Map(Object.entries(indexData));
            }
        } catch (err) {
            console.warn('⚠️ فشل تحميل الفهرس:', err.message);
        }
    }
}

module.exports = new CodeAnalyzerParser();
