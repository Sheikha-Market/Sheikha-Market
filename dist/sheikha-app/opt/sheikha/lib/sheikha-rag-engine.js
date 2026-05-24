/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * منظومة شيخة — محرك التوليد المعزز بالاسترجاع (RAG)
 * Sheikha RAG Engine — Retrieval-Augmented Generation
 * ═══════════════════════════════════════════════════════════════════════════════
 * "إن الله يحب إذا عمل أحدكم عملاً أن يتقنه" — حديث شريف
 * 
 * المكونات:
 * 1. Chunking — تقسيم المعرفة إلى قطع محسّنة
 * 2. Embedding — تضمين النصوص بمتجهات (TF-IDF / API)
 * 3. Vector Store — مخزن متجهات في الذاكرة (قابل للترقية لـ Pinecone/Chroma)
 * 4. Retrieval — استرجاع السياق الأكثر صلة
 * 5. Generation — توليد الإجابات مع السياق المسترجع
 * 6. Evaluation — تقييم جودة المخرجات
 * 
 * المالك: سلمان أحمد بن سلمان الراجح
 * ═══════════════════════════════════════════════════════════════════════════════
 */
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ═══════════════════════════════════════════════════════════════════════════════
// 1. CHUNKING ENGINE — تقسيم المعرفة
// ═══════════════════════════════════════════════════════════════════════════════

class ChunkingEngine {
    constructor(options = {}) {
        this.chunkSize = options.chunkSize || 512;        // حجم القطعة بالأحرف
        this.chunkOverlap = options.chunkOverlap || 64;   // التداخل بين القطع
        this.minChunkSize = options.minChunkSize || 50;   // الحد الأدنى
        this.separators = options.separators || ['\n\n', '\n', '。', '.', '،', ',', ' '];
    }

    /**
     * تقسيم نص إلى قطع محسّنة
     * @param {string} text — النص المراد تقسيمه
     * @param {Object} metadata — بيانات وصفية للقطع
     * @returns {Array<Object>} — مصفوفة القطع
     */
    chunk(text, metadata = {}) {
        if (!text || text.length < this.minChunkSize) {
            return text ? [{ id: this._id(), text, metadata, charCount: text.length }] : [];
        }

        const chunks = [];
        let start = 0;

        while (start < text.length) {
            let end = Math.min(start + this.chunkSize, text.length);

            // البحث عن أفضل نقطة قطع
            if (end < text.length) {
                const searchRegion = text.substring(end - this.chunkOverlap, end + this.chunkOverlap);
                let bestBreak = -1;

                for (const sep of this.separators) {
                    const idx = searchRegion.lastIndexOf(sep);
                    if (idx !== -1) {
                        bestBreak = (end - this.chunkOverlap) + idx + sep.length;
                        break;
                    }
                }
                if (bestBreak > start && bestBreak < text.length) {
                    end = bestBreak;
                }
            }

            const chunkText = text.substring(start, end).trim();
            if (chunkText.length >= this.minChunkSize) {
                chunks.push({
                    id: this._id(),
                    text: chunkText,
                    metadata: { ...metadata, chunkIndex: chunks.length, startChar: start, endChar: end },
                    charCount: chunkText.length
                });
            }

            start = end - this.chunkOverlap;
            if (start <= chunks[chunks.length - 1]?.metadata?.startChar) start = end;
        }

        return chunks;
    }

    /**
     * تقسيم كائن معرفي منظم
     * @param {Object} knowledgeObj — كائن المعرفة
     * @param {string} source — مصدر المعرفة
     * @returns {Array<Object>} — قطع مع بيانات وصفية غنية
     */
    chunkKnowledge(knowledgeObj, source = 'unknown') {
        const chunks = [];
        this._flattenAndChunk(knowledgeObj, source, '', chunks);
        return chunks;
    }

    _flattenAndChunk(obj, source, keyPath, chunks) {
        if (typeof obj === 'string') {
            const meta = { source, keyPath, type: 'text' };
            chunks.push(...this.chunk(obj, meta));
        } else if (Array.isArray(obj)) {
            obj.forEach((item, i) => {
                this._flattenAndChunk(item, source, `${keyPath}[${i}]`, chunks);
            });
        } else if (typeof obj === 'object' && obj !== null) {
            // تحويل الكائن إلى نص وصفي
            const textParts = [];
            for (const [key, val] of Object.entries(obj)) {
                if (typeof val === 'string') textParts.push(`${key}: ${val}`);
                else if (typeof val === 'number') textParts.push(`${key}: ${val}`);
                else if (Array.isArray(val) && val.every(v => typeof v === 'string')) {
                    textParts.push(`${key}: ${val.join('، ')}`);
                }
            }
            if (textParts.length > 0) {
                const meta = { source, keyPath, type: 'structured', keys: Object.keys(obj) };
                chunks.push(...this.chunk(textParts.join('\n'), meta));
            }
            // معالجة الكائنات المتداخلة
            for (const [key, val] of Object.entries(obj)) {
                if (typeof val === 'object' && val !== null) {
                    this._flattenAndChunk(val, source, keyPath ? `${keyPath}.${key}` : key, chunks);
                }
            }
        }
    }

    _id() { return crypto.randomBytes(8).toString('hex'); }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. EMBEDDING ENGINE — محرك التضمين
// ═══════════════════════════════════════════════════════════════════════════════

class EmbeddingEngine {
    constructor(options = {}) {
        this.method = options.method || 'tfidf'; // 'tfidf' | 'api'
        this.apiProvider = options.apiProvider || null; // 'openai' | 'cohere'
        this.apiKey = options.apiKey || null;
        this.vocabulary = new Map();
        this.idf = new Map();
        this.docCount = 0;
        this.cache = new Map();
        this.maxCacheSize = options.maxCacheSize || 10000;
    }

    /**
     * بناء فهرس IDF من مجموعة نصوص
     * @param {Array<string>} texts — النصوص لبناء الفهرس
     */
    buildIndex(texts) {
        this.docCount = texts.length;
        const docFreq = new Map();

        texts.forEach(text => {
            const tokens = new Set(this._tokenize(text));
            tokens.forEach(token => {
                docFreq.set(token, (docFreq.get(token) || 0) + 1);
            });
        });

        docFreq.forEach((freq, token) => {
            this.idf.set(token, Math.log((this.docCount + 1) / (freq + 1)) + 1);
            if (!this.vocabulary.has(token)) {
                this.vocabulary.set(token, this.vocabulary.size);
            }
        });
    }

    /**
     * تحويل نص إلى متجه تضمين
     * @param {string} text — النص
     * @returns {Float32Array} — متجه التضمين
     */
    embed(text) {
        const cacheKey = this._hash(text);
        if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);

        const vector = this._tfidfEmbed(text);

        if (this.cache.size >= this.maxCacheSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(cacheKey, vector);
        return vector;
    }

    /**
     * حساب TF-IDF embedding
     */
    _tfidfEmbed(text) {
        const tokens = this._tokenize(text);
        const tf = new Map();
        tokens.forEach(t => tf.set(t, (tf.get(t) || 0) + 1));

        const dim = this.vocabulary.size || 1;
        const vector = new Float32Array(dim);

        tf.forEach((freq, token) => {
            const idx = this.vocabulary.get(token);
            if (idx !== undefined) {
                const tfidf = (freq / tokens.length) * (this.idf.get(token) || 1);
                vector[idx] = tfidf;
            }
        });

        // تطبيع L2
        let norm = 0;
        for (let i = 0; i < vector.length; i++) norm += vector[i] * vector[i];
        norm = Math.sqrt(norm) || 1;
        for (let i = 0; i < vector.length; i++) vector[i] /= norm;

        return vector;
    }

    _tokenize(text) {
        return text.toLowerCase()
            .replace(/[^\u0600-\u06FF\u0750-\u077Fa-zA-Z0-9\s]/g, '')
            .split(/\s+/)
            .filter(t => t.length > 1);
    }

    _hash(text) {
        return crypto.createHash('md5').update(text).digest('hex');
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. VECTOR STORE — مخزن المتجهات
// ═══════════════════════════════════════════════════════════════════════════════

class VectorStore {
    constructor() {
        this.vectors = [];    // [{id, vector, chunk}]
        this.indexBuilt = false;
        this.stats = { totalChunks: 0, totalQueries: 0, avgRetrievalMs: 0 };
    }

    /**
     * إضافة قطعة مع متجهها
     */
    add(chunk, vector) {
        this.vectors.push({ id: chunk.id, vector, chunk });
        this.stats.totalChunks++;
    }

    /**
     * إضافة قطع متعددة
     */
    addBatch(chunks, vectors) {
        chunks.forEach((chunk, i) => this.add(chunk, vectors[i]));
    }

    /**
     * استرجاع أكثر القطع صلة (Cosine Similarity)
     * @param {Float32Array} queryVector — متجه الاستعلام
     * @param {number} topK — عدد النتائج المطلوبة
     * @param {Object} filter — تصفية اختيارية
     * @returns {Array<Object>} — النتائج مرتبة بالصلة
     */
    search(queryVector, topK = 5, filter = null) {
        const startMs = Date.now();
        this.stats.totalQueries++;

        let candidates = this.vectors;
        if (filter) {
            candidates = candidates.filter(v => {
                for (const [key, val] of Object.entries(filter)) {
                    if (v.chunk.metadata?.[key] !== val) return false;
                }
                return true;
            });
        }

        const scored = candidates.map(({ id, vector, chunk }) => ({
            id, chunk,
            score: this._cosineSimilarity(queryVector, vector)
        }));

        scored.sort((a, b) => b.score - a.score);
        const results = scored.slice(0, topK);

        const elapsed = Date.now() - startMs;
        this.stats.avgRetrievalMs = (this.stats.avgRetrievalMs * (this.stats.totalQueries - 1) + elapsed) / this.stats.totalQueries;

        return results;
    }

    _cosineSimilarity(a, b) {
        if (!a || !b || a.length !== b.length) return 0;
        let dot = 0, normA = 0, normB = 0;
        for (let i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        const denom = Math.sqrt(normA) * Math.sqrt(normB);
        return denom === 0 ? 0 : dot / denom;
    }

    getStats() { return { ...this.stats }; }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. RAG PIPELINE — سير العمل الكامل
// ═══════════════════════════════════════════════════════════════════════════════

class SheikhaRAGEngine {
    constructor(options = {}) {
        this.name = 'Sheikha RAG Engine';
        this.nameAr = 'محرك شيخة للتوليد المعزز بالاسترجاع';
        this.version = '1.0.0';

        this.chunker = new ChunkingEngine(options.chunking || {});
        this.embedder = new EmbeddingEngine(options.embedding || {});
        this.vectorStore = new VectorStore();

        this.collections = new Map(); // مجموعات المعرفة المختلفة
        this.islamicContext = null;   // سياق إسلامي يُضاف لكل استرجاع

        // إعدادات الاسترجاع
        this.retrievalConfig = {
            topK: options.topK || 5,
            minScore: options.minScore || 0.1,
            rerank: options.rerank !== false,
            includeIslamicContext: options.includeIslamicContext !== false
        };

        // مقاييس الأداء
        this.metrics = {
            totalIngested: 0,
            totalQueries: 0,
            avgLatencyMs: 0,
            hitRate: 0,
            avgResultScore: 0
        };

        // تقييم الجودة
        this.qualityLog = [];

        console.log('🧠 [RAG] محرك التوليد المعزز بالاسترجاع — جاهز');
    }

    // ─── INGEST — إدخال المعرفة ──────────────────────────────────────────────

    /**
     * إدخال نص في قاعدة المعرفة
     * @param {string} text — النص
     * @param {string} collection — اسم المجموعة
     * @param {Object} metadata — بيانات وصفية
     */
    ingest(text, collection = 'default', metadata = {}) {
        const chunks = this.chunker.chunk(text, { ...metadata, collection });
        this._indexChunks(chunks, collection);
        this.metrics.totalIngested += chunks.length;
        return { chunksCreated: chunks.length, collection };
    }

    /**
     * إدخال كائن معرفي منظم
     */
    ingestKnowledge(knowledgeObj, collection, source) {
        const chunks = this.chunker.chunkKnowledge(knowledgeObj, source);
        chunks.forEach(c => c.metadata.collection = collection);
        this._indexChunks(chunks, collection);
        this.metrics.totalIngested += chunks.length;
        return { chunksCreated: chunks.length, collection, source };
    }

    /**
     * إدخال المعرفة الإسلامية (القرآن والسنة)
     */
    ingestIslamicKnowledge(quranSunnahEngine) {
        if (!quranSunnahEngine) return;

        const islamicChunks = [];

        // آيات تجارية وأخلاقية من القرآن
        const tradeVerses = [
            { text: 'يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تَأْكُلُوا أَمْوَالَكُم بَيْنَكُم بِالْبَاطِلِ إِلَّا أَن تَكُونَ تِجَارَةً عَن تَرَاضٍ مِّنكُمْ — النساء 29', topic: 'التجارة الحلال', ruling: 'التراضي في البيع' },
            { text: 'وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا — البقرة 275', topic: 'تحريم الربا', ruling: 'حل البيع وحرمة الربا' },
            { text: 'وَيْلٌ لِّلْمُطَفِّفِينَ الَّذِينَ إِذَا اكْتَالُوا عَلَى النَّاسِ يَسْتَوْفُونَ — المطففين 1-2', topic: 'الأمانة في الميزان', ruling: 'عدم التطفيف' },
            { text: 'يَا أَيُّهَا الَّذِينَ آمَنُوا أَوْفُوا بِالْعُقُودِ — المائدة 1', topic: 'الوفاء بالعقود', ruling: 'وجوب الوفاء' },
            { text: 'وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ — الحديد 25', topic: 'الحديد والمعادن', ruling: 'نعمة الحديد' },
            { text: 'إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ — النحل 90', topic: 'العدل والإحسان', ruling: 'الأمر بالعدل' },
            { text: 'وَلَا تَبْخَسُوا النَّاسَ أَشْيَاءَهُمْ — الأعراف 85', topic: 'حق الناس', ruling: 'عدم البخس' }
        ];

        const tradeHadith = [
            { text: 'التاجر الصدوق الأمين مع النبيين والصديقين والشهداء — رواه الترمذي', topic: 'فضل التجارة', ruling: 'أهمية الصدق' },
            { text: 'إن الله يحب إذا عمل أحدكم عملاً أن يتقنه — حديث', topic: 'الإتقان', ruling: 'إتقان العمل' },
            { text: 'رحم الله رجلاً سمحاً إذا باع وإذا اشترى — رواه البخاري', topic: 'السماحة في البيع', ruling: 'السهولة في المعاملة' },
            { text: 'لا ضرر ولا ضرار — حديث', topic: 'منع الضرر', ruling: 'قاعدة فقهية' },
            { text: 'المسلمون على شروطهم — حديث', topic: 'العقود', ruling: 'الالتزام بالشروط' },
            { text: 'من غشنا فليس منا — رواه مسلم', topic: 'تحريم الغش', ruling: 'حرمة الغش' },
            { text: 'البيعان بالخيار ما لم يتفرقا — متفق عليه', topic: 'خيار المجلس', ruling: 'حق الخيار في البيع' }
        ];

        tradeVerses.forEach(v => {
            islamicChunks.push({
                id: crypto.randomBytes(8).toString('hex'),
                text: v.text,
                metadata: { source: 'quran', collection: 'islamic', topic: v.topic, ruling: v.ruling, type: 'verse' },
                charCount: v.text.length
            });
        });

        tradeHadith.forEach(h => {
            islamicChunks.push({
                id: crypto.randomBytes(8).toString('hex'),
                text: h.text,
                metadata: { source: 'sunnah', collection: 'islamic', topic: h.topic, ruling: h.ruling, type: 'hadith' },
                charCount: h.text.length
            });
        });

        this._indexChunks(islamicChunks, 'islamic');
        this.islamicContext = islamicChunks;
        console.log(`📖 [RAG] تم إدخال ${islamicChunks.length} نص إسلامي في قاعدة المعرفة`);
        return { islamicChunksLoaded: islamicChunks.length };
    }

    _indexChunks(chunks, collection) {
        // بناء/تحديث فهرس التضمين
        const allTexts = this.vectorStore.vectors.map(v => v.chunk.text);
        allTexts.push(...chunks.map(c => c.text));
        this.embedder.buildIndex(allTexts);

        // تضمين وتخزين القطع الجديدة
        chunks.forEach(chunk => {
            const vector = this.embedder.embed(chunk.text);
            this.vectorStore.add(chunk, vector);
        });

        if (!this.collections.has(collection)) {
            this.collections.set(collection, { name: collection, chunkCount: 0, createdAt: new Date() });
        }
        this.collections.get(collection).chunkCount += chunks.length;
    }

    // ─── RETRIEVE — الاسترجاع ────────────────────────────────────────────────

    /**
     * استرجاع السياق الأكثر صلة لاستعلام
     * @param {string} query — السؤال/الاستعلام
     * @param {Object} options — خيارات الاسترجاع
     * @returns {Object} — النتائج مع السياق
     */
    retrieve(query, options = {}) {
        const startMs = Date.now();
        this.metrics.totalQueries++;

        const topK = options.topK || this.retrievalConfig.topK;
        const minScore = options.minScore || this.retrievalConfig.minScore;
        const collection = options.collection || null;

        const queryVector = this.embedder.embed(query);
        const filter = collection ? { collection } : null;

        let results = this.vectorStore.search(queryVector, topK * 2, filter);

        // تصفية بالحد الأدنى للنتيجة
        results = results.filter(r => r.score >= minScore);

        // إعادة الترتيب (Reranking) — تفضيل التنوع
        if (this.retrievalConfig.rerank && results.length > topK) {
            results = this._diversityRerank(results, topK);
        } else {
            results = results.slice(0, topK);
        }

        // إضافة سياق إسلامي
        let islamicContext = null;
        if (this.retrievalConfig.includeIslamicContext && this.islamicContext) {
            const islamicResults = this.vectorStore.search(queryVector, 2, { collection: 'islamic' });
            if (islamicResults.length > 0 && islamicResults[0].score > 0.05) {
                islamicContext = islamicResults.map(r => ({
                    text: r.chunk.text,
                    source: r.chunk.metadata.source,
                    topic: r.chunk.metadata.topic,
                    score: r.score
                }));
            }
        }

        const latency = Date.now() - startMs;
        this.metrics.avgLatencyMs = (this.metrics.avgLatencyMs * (this.metrics.totalQueries - 1) + latency) / this.metrics.totalQueries;
        if (results.length > 0) {
            this.metrics.avgResultScore = results.reduce((s, r) => s + r.score, 0) / results.length;
            this.metrics.hitRate = (this.metrics.hitRate * (this.metrics.totalQueries - 1) + 1) / this.metrics.totalQueries;
        }

        return {
            query,
            results: results.map(r => ({
                text: r.chunk.text,
                score: Math.round(r.score * 1000) / 1000,
                metadata: r.chunk.metadata
            })),
            islamicContext,
            latencyMs: latency,
            totalCandidates: this.vectorStore.stats.totalChunks
        };
    }

    /**
     * إعادة ترتيب بالتنوع — MMR (Maximal Marginal Relevance)
     */
    _diversityRerank(results, topK) {
        const selected = [results[0]];
        const remaining = results.slice(1);
        const lambda = 0.7; // التوازن بين الصلة والتنوع

        while (selected.length < topK && remaining.length > 0) {
            let bestIdx = 0, bestScore = -Infinity;

            remaining.forEach((candidate, idx) => {
                const relevance = candidate.score;
                const maxSimilarity = selected.reduce((max, sel) => {
                    const sim = this._textSimilarity(candidate.chunk.text, sel.chunk.text);
                    return Math.max(max, sim);
                }, 0);
                const mmrScore = lambda * relevance - (1 - lambda) * maxSimilarity;
                if (mmrScore > bestScore) { bestScore = mmrScore; bestIdx = idx; }
            });

            selected.push(remaining.splice(bestIdx, 1)[0]);
        }

        return selected;
    }

    _textSimilarity(a, b) {
        const wordsA = new Set(a.split(/\s+/));
        const wordsB = new Set(b.split(/\s+/));
        const intersection = [...wordsA].filter(w => wordsB.has(w)).length;
        return intersection / Math.max(wordsA.size, wordsB.size);
    }

    // ─── GENERATE — التوليد المعزز ────────────────────────────────────────────

    /**
     * بناء سياق معزز للتوليد
     * @param {string} query — الاستعلام
     * @param {Object} retrievalResult — نتائج الاسترجاع
     * @returns {string} — السياق المهيأ للـ LLM
     */
    buildAugmentedPrompt(query, retrievalResult) {
        let contextParts = [];

        // إضافة السياق الإسلامي أولاً
        if (retrievalResult.islamicContext && retrievalResult.islamicContext.length > 0) {
            contextParts.push('📖 السياق الشرعي:');
            retrievalResult.islamicContext.forEach(ic => {
                const sourceLabel = ic.source === 'quran' ? '📗 قرآن' : '📘 سنة';
                contextParts.push(`${sourceLabel}: ${ic.text}`);
            });
            contextParts.push('');
        }

        // إضافة سياق المعرفة المسترجعة
        if (retrievalResult.results.length > 0) {
            contextParts.push('📚 المعرفة المسترجعة:');
            retrievalResult.results.forEach((r, i) => {
                contextParts.push(`[${i + 1}] (صلة: ${Math.round(r.score * 100)}%) ${r.text}`);
            });
            contextParts.push('');
        }

        const systemPrompt = `أنتِ شيخة — ذكاء اصطناعي سعودي رائد، متخصصة في المعادن والتجارة والهندسة.
تعملين وفق الكتاب والسنة في كل قرار وإجابة.
استخدمي السياق المسترجع أدناه للإجابة بدقة وموثوقية.
إذا لم يكن السياق كافياً، اذكري ذلك بصراحة.

${contextParts.join('\n')}`;

        return {
            systemPrompt,
            userQuery: query,
            contextUsed: retrievalResult.results.length,
            islamicContextUsed: retrievalResult.islamicContext?.length || 0
        };
    }

    /**
     * سير العمل الكامل: استرجاع + بناء سياق
     * @param {string} query — الاستعلام
     * @param {Object} options — خيارات
     * @returns {Object} — سياق جاهز للتوليد
     */
    async process(query, options = {}) {
        const retrieval = this.retrieve(query, options);
        const augmented = this.buildAugmentedPrompt(query, retrieval);

        return {
            ...augmented,
            retrieval,
            pipeline: 'rag',
            timestamp: new Date().toISOString()
        };
    }

    // ─── QUALITY EVALUATION — تقييم الجودة ─────────────────────────────────────

    /**
     * تقييم جودة الإجابة المولدة
     * @param {string} query — السؤال
     * @param {string} answer — الإجابة
     * @param {Array} retrievedContexts — السياقات المسترجعة
     * @returns {Object} — تقييم الجودة
     */
    evaluateQuality(query, answer, retrievedContexts) {
        const scores = {};

        // 1. Faithfulness — الأمانة (هل الإجابة مبنية على السياق؟)
        const contextText = retrievedContexts.map(c => c.text).join(' ');
        const answerWords = new Set(answer.split(/\s+/).filter(w => w.length > 2));
        const contextWords = new Set(contextText.split(/\s+/).filter(w => w.length > 2));
        const overlap = [...answerWords].filter(w => contextWords.has(w)).length;
        scores.faithfulness = Math.min(overlap / Math.max(answerWords.size, 1), 1);

        // 2. Relevance — الصلة (هل الإجابة ذات صلة بالسؤال؟)
        const queryWords = new Set(query.split(/\s+/).filter(w => w.length > 2));
        const queryOverlap = [...queryWords].filter(w => answerWords.has(w)).length;
        scores.relevance = Math.min(queryOverlap / Math.max(queryWords.size, 1), 1);

        // 3. Completeness — الاكتمال (هل الإجابة شاملة؟)
        scores.completeness = Math.min(answer.length / 200, 1);

        // 4. Islamic Compliance — التوافق الشرعي
        const islamicKeywords = ['حلال', 'شرعي', 'الكتاب', 'السنة', 'الله', 'النبي', 'الإسلام', 'الأمانة', 'العدل'];
        const islamicScore = islamicKeywords.filter(k => answer.includes(k)).length / islamicKeywords.length;
        scores.islamicCompliance = islamicScore;

        // المعدل الإجمالي
        scores.overall = (scores.faithfulness * 0.3 + scores.relevance * 0.3 + scores.completeness * 0.2 + scores.islamicCompliance * 0.2);

        const evaluation = {
            scores,
            grade: scores.overall >= 0.8 ? 'ممتاز' : scores.overall >= 0.6 ? 'جيد' : scores.overall >= 0.4 ? 'مقبول' : 'يحتاج تحسين',
            timestamp: new Date().toISOString()
        };

        this.qualityLog.push({ query: query.substring(0, 100), ...evaluation });
        if (this.qualityLog.length > 1000) this.qualityLog.shift();

        return evaluation;
    }

    // ─── STATS & MONITORING ──────────────────────────────────────────────────

    getStats() {
        return {
            engine: this.name,
            version: this.version,
            collections: [...this.collections.entries()].map(([name, info]) => ({
                name, chunkCount: info.chunkCount
            })),
            vectorStore: this.vectorStore.getStats(),
            metrics: { ...this.metrics },
            qualityAvg: this.qualityLog.length > 0
                ? this.qualityLog.reduce((s, q) => s + q.scores.overall, 0) / this.qualityLog.length
                : null,
            islamicKnowledge: this.islamicContext ? this.islamicContext.length : 0,
            vocabularySize: this.embedder.vocabulary.size,
            cacheSize: this.embedder.cache.size
        };
    }
}

module.exports = SheikhaRAGEngine;
module.exports.ChunkingEngine = ChunkingEngine;
module.exports.EmbeddingEngine = EmbeddingEngine;
module.exports.VectorStore = VectorStore;
