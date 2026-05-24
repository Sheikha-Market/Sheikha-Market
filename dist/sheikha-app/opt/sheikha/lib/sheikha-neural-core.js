/**
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * SHEIKHA NEURAL CORE — شبكة عصبية حقيقية بجافاسكربت نقي
 * ═══════════════════════════════════════════════════════════════════════════════
 * "وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا" — البقرة ٣١
 * 
 * هذا ليس بيانات تعريفية — هذا كود رياضيات حقيقي:
 * ✅ عمليات مصفوفات (ضرب، جمع، نقل)
 * ✅ طبقات Dense + Embedding + Attention
 * ✅ دوال تفعيل (Sigmoid, Tanh, ReLU, Softmax, GELU)
 * ✅ Backpropagation + Gradient Descent
 * ✅ Word Embeddings تُدرّب محلياً (Word2Vec Skip-gram)
 * ✅ بحث تشابه دلالي بالمتجهات (Cosine Similarity)
 * ✅ لا يعتمد على أي API خارجي
 * 
 * المالك: سلمان أحمد بن سلمان الراجح
 * ═══════════════════════════════════════════════════════════════════════════════
 */
'use strict';

// ═══════════════════════════════════════════════════════════════════════════════
// 1. MATRIX — عمليات المصفوفات (أساس كل شبكة عصبية)
// ═══════════════════════════════════════════════════════════════════════════════

class Matrix {
    constructor(rows, cols, data = null) {
        this.rows = rows;
        this.cols = cols;
        this.data = data || new Float32Array(rows * cols);
    }

    static zeros(rows, cols) { return new Matrix(rows, cols); }

    static ones(rows, cols) {
        const m = new Matrix(rows, cols);
        m.data.fill(1);
        return m;
    }

    static random(rows, cols, scale = 0.1) {
        const m = new Matrix(rows, cols);
        for (let i = 0; i < m.data.length; i++) {
            m.data[i] = (Math.random() * 2 - 1) * scale;
        }
        return m;
    }

    // Xavier/Glorot initialization — أفضل لتدريب الشبكات
    static xavier(rows, cols) {
        const scale = Math.sqrt(2.0 / (rows + cols));
        return Matrix.random(rows, cols, scale);
    }

    // He initialization — أفضل مع ReLU
    static he(rows, cols) {
        const scale = Math.sqrt(2.0 / rows);
        return Matrix.random(rows, cols, scale);
    }

    get(r, c) { return this.data[r * this.cols + c]; }
    set(r, c, v) { this.data[r * this.cols + c] = v; }

    // ضرب مصفوفات — O(n³)
    static multiply(a, b) {
        if (a.cols !== b.rows) throw new Error(`أبعاد غير متوافقة: ${a.rows}x${a.cols} * ${b.rows}x${b.cols}`);
        const result = new Matrix(a.rows, b.cols);
        for (let i = 0; i < a.rows; i++) {
            for (let k = 0; k < a.cols; k++) {
                const aik = a.data[i * a.cols + k];
                if (aik === 0) continue;
                for (let j = 0; j < b.cols; j++) {
                    result.data[i * b.cols + j] += aik * b.data[k * b.cols + j];
                }
            }
        }
        return result;
    }

    // ضرب عنصر بعنصر (Hadamard)
    static hadamard(a, b) {
        if (a.rows !== b.rows || a.cols !== b.cols) throw new Error('أبعاد غير متطابقة');
        const result = new Matrix(a.rows, a.cols);
        for (let i = 0; i < a.data.length; i++) result.data[i] = a.data[i] * b.data[i];
        return result;
    }

    // جمع مصفوفات
    static add(a, b) {
        if (a.rows !== b.rows || a.cols !== b.cols) throw new Error('أبعاد غير متطابقة للجمع');
        const result = new Matrix(a.rows, a.cols);
        for (let i = 0; i < a.data.length; i++) result.data[i] = a.data[i] + b.data[i];
        return result;
    }

    // طرح
    static subtract(a, b) {
        const result = new Matrix(a.rows, a.cols);
        for (let i = 0; i < a.data.length; i++) result.data[i] = a.data[i] - b.data[i];
        return result;
    }

    // ضرب بعدد
    scale(s) {
        const result = new Matrix(this.rows, this.cols);
        for (let i = 0; i < this.data.length; i++) result.data[i] = this.data[i] * s;
        return result;
    }

    // النقل Transpose
    transpose() {
        const result = new Matrix(this.cols, this.rows);
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                result.data[j * this.rows + i] = this.data[i * this.cols + j];
            }
        }
        return result;
    }

    // تطبيق دالة على كل عنصر
    map(fn) {
        const result = new Matrix(this.rows, this.cols);
        for (let i = 0; i < this.data.length; i++) result.data[i] = fn(this.data[i], i);
        return result;
    }

    // مجموع كل العناصر
    sum() {
        let s = 0;
        for (let i = 0; i < this.data.length; i++) s += this.data[i];
        return s;
    }

    // مجموع الصفوف (لحساب bias gradient)
    sumRows() {
        const result = new Matrix(1, this.cols);
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                result.data[j] += this.data[i * this.cols + j];
            }
        }
        return result;
    }

    // L2 Norm
    norm() {
        let s = 0;
        for (let i = 0; i < this.data.length; i++) s += this.data[i] * this.data[i];
        return Math.sqrt(s);
    }

    // نسخ
    clone() {
        const m = new Matrix(this.rows, this.cols);
        m.data.set(this.data);
        return m;
    }

    // تحويل لمصفوفة JS عادية
    toArray() {
        const arr = [];
        for (let i = 0; i < this.rows; i++) {
            arr.push(Array.from(this.data.slice(i * this.cols, (i + 1) * this.cols)));
        }
        return arr;
    }

    // من مصفوفة عادية
    static fromArray(arr) {
        if (!Array.isArray(arr[0])) {
            const m = new Matrix(1, arr.length);
            for (let i = 0; i < arr.length; i++) m.data[i] = arr[i];
            return m;
        }
        const rows = arr.length, cols = arr[0].length;
        const m = new Matrix(rows, cols);
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                m.data[i * cols + j] = arr[i][j];
            }
        }
        return m;
    }

    // من متجه 1D إلى مصفوفة صف
    static fromVector(vec) {
        const m = new Matrix(1, vec.length);
        for (let i = 0; i < vec.length; i++) m.data[i] = vec[i];
        return m;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. ACTIVATIONS — دوال التفعيل (قلب التعلم العميق)
// ═══════════════════════════════════════════════════════════════════════════════

const Activations = {
    sigmoid: {
        forward: x => 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x)))),
        backward: y => y * (1 - y) // y = sigmoid(x)
    },
    tanh: {
        forward: x => Math.tanh(x),
        backward: y => 1 - y * y
    },
    relu: {
        forward: x => Math.max(0, x),
        backward: y => y > 0 ? 1 : 0
    },
    leakyRelu: {
        forward: x => x > 0 ? x : 0.01 * x,
        backward: y => y > 0 ? 1 : 0.01
    },
    gelu: {
        forward: x => 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * x * x * x))),
        backward: (x) => {
            const cdf = 0.5 * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * x * x * x)));
            const pdf = Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
            return cdf + x * pdf;
        }
    },
    softmax: {
        forward: (arr) => {
            const max = Math.max(...arr);
            const exps = arr.map(x => Math.exp(x - max));
            const sum = exps.reduce((a, b) => a + b, 0);
            return exps.map(e => e / sum);
        }
    },
    identity: {
        forward: x => x,
        backward: () => 1
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// 3. LAYERS — طبقات الشبكة العصبية
// ═══════════════════════════════════════════════════════════════════════════════

class DenseLayer {
    constructor(inputSize, outputSize, activation = 'relu') {
        this.inputSize = inputSize;
        this.outputSize = outputSize;
        this.activationName = activation;
        this.activation = Activations[activation];

        // Xavier initialization
        this.weights = Matrix.xavier(inputSize, outputSize);
        this.bias = Matrix.zeros(1, outputSize);

        // للتدريب — تخزين القيم
        this.input = null;
        this.output = null;
        this.preActivation = null;

        // Adam optimizer state
        this.mW = Matrix.zeros(inputSize, outputSize);
        this.vW = Matrix.zeros(inputSize, outputSize);
        this.mB = Matrix.zeros(1, outputSize);
        this.vB = Matrix.zeros(1, outputSize);
        this.t = 0;
    }

    forward(input) {
        this.input = input;
        // z = x * W + b
        this.preActivation = Matrix.add(Matrix.multiply(input, this.weights), this._broadcastBias(input.rows));

        // a = activation(z)
        if (this.activationName === 'softmax') {
            this.output = new Matrix(this.preActivation.rows, this.preActivation.cols);
            for (let i = 0; i < this.preActivation.rows; i++) {
                const row = Array.from(this.preActivation.data.slice(i * this.preActivation.cols, (i + 1) * this.preActivation.cols));
                const softmaxed = Activations.softmax.forward(row);
                for (let j = 0; j < softmaxed.length; j++) {
                    this.output.data[i * this.preActivation.cols + j] = softmaxed[j];
                }
            }
        } else {
            this.output = this.preActivation.map(x => this.activation.forward(x));
        }
        return this.output;
    }

    backward(gradOutput, learningRate = 0.001) {
        // حساب gradient بالنسبة للمدخلات
        let gradPreAct;
        if (this.activationName === 'softmax') {
            gradPreAct = gradOutput; // Cross-entropy + softmax = simplified gradient
        } else {
            gradPreAct = new Matrix(gradOutput.rows, gradOutput.cols);
            for (let i = 0; i < gradOutput.data.length; i++) {
                const deriv = this.activation.backward(this.output.data[i]);
                gradPreAct.data[i] = gradOutput.data[i] * deriv;
            }
        }

        // gradient بالنسبة للأوزان: dW = input^T * gradPreAct
        const gradWeights = Matrix.multiply(this.input.transpose(), gradPreAct);
        const gradBias = gradPreAct.sumRows();

        // gradient بالنسبة للمدخلات: dx = gradPreAct * W^T
        const gradInput = Matrix.multiply(gradPreAct, this.weights.transpose());

        // تحديث الأوزان — Adam optimizer
        this._adamUpdate(gradWeights, gradBias, learningRate);

        return gradInput;
    }

    _adamUpdate(gradW, gradB, lr, beta1 = 0.9, beta2 = 0.999, eps = 1e-8) {
        this.t++;

        // Weights
        for (let i = 0; i < this.mW.data.length; i++) {
            this.mW.data[i] = beta1 * this.mW.data[i] + (1 - beta1) * gradW.data[i];
            this.vW.data[i] = beta2 * this.vW.data[i] + (1 - beta2) * gradW.data[i] * gradW.data[i];
            const mHat = this.mW.data[i] / (1 - Math.pow(beta1, this.t));
            const vHat = this.vW.data[i] / (1 - Math.pow(beta2, this.t));
            this.weights.data[i] -= lr * mHat / (Math.sqrt(vHat) + eps);
        }

        // Bias
        for (let i = 0; i < this.mB.data.length; i++) {
            this.mB.data[i] = beta1 * this.mB.data[i] + (1 - beta1) * gradB.data[i];
            this.vB.data[i] = beta2 * this.vB.data[i] + (1 - beta2) * gradB.data[i] * gradB.data[i];
            const mHat = this.mB.data[i] / (1 - Math.pow(beta1, this.t));
            const vHat = this.vB.data[i] / (1 - Math.pow(beta2, this.t));
            this.bias.data[i] -= lr * mHat / (Math.sqrt(vHat) + eps);
        }
    }

    _broadcastBias(batchSize) {
        const result = new Matrix(batchSize, this.outputSize);
        for (let i = 0; i < batchSize; i++) {
            for (let j = 0; j < this.outputSize; j++) {
                result.data[i * this.outputSize + j] = this.bias.data[j];
            }
        }
        return result;
    }
}

// Embedding Layer — طبقة التضمين
class EmbeddingLayer {
    constructor(vocabSize, embeddingDim) {
        this.vocabSize = vocabSize;
        this.embeddingDim = embeddingDim;
        this.weights = Matrix.random(vocabSize, embeddingDim, 0.1);
    }

    // lookup — استرجاع المتجه بالفهرس
    lookup(indices) {
        if (typeof indices === 'number') indices = [indices];
        const result = new Matrix(indices.length, this.embeddingDim);
        for (let i = 0; i < indices.length; i++) {
            const idx = Math.min(indices[i], this.vocabSize - 1);
            for (let j = 0; j < this.embeddingDim; j++) {
                result.data[i * this.embeddingDim + j] = this.weights.data[idx * this.embeddingDim + j];
            }
        }
        return result;
    }

    // تحديث متجه معين
    update(index, gradient, lr = 0.01) {
        const idx = Math.min(index, this.vocabSize - 1);
        for (let j = 0; j < this.embeddingDim; j++) {
            this.weights.data[idx * this.embeddingDim + j] -= lr * gradient.data[j];
        }
    }

    // التشابه بين كلمتين (Cosine Similarity)
    similarity(idx1, idx2) {
        let dot = 0, n1 = 0, n2 = 0;
        for (let j = 0; j < this.embeddingDim; j++) {
            const a = this.weights.data[idx1 * this.embeddingDim + j];
            const b = this.weights.data[idx2 * this.embeddingDim + j];
            dot += a * b;
            n1 += a * a;
            n2 += b * b;
        }
        const denom = Math.sqrt(n1) * Math.sqrt(n2);
        return denom === 0 ? 0 : dot / denom;
    }

    // البحث عن أقرب K متجهات
    findNearest(targetVector, topK = 5, excludeIndices = []) {
        const excludeSet = new Set(excludeIndices);
        const scores = [];
        for (let i = 0; i < this.vocabSize; i++) {
            if (excludeSet.has(i)) continue;
            let dot = 0, n1 = 0, n2 = 0;
            for (let j = 0; j < this.embeddingDim; j++) {
                const a = targetVector[j] || 0;
                const b = this.weights.data[i * this.embeddingDim + j];
                dot += a * b;
                n1 += a * a;
                n2 += b * b;
            }
            const sim = (Math.sqrt(n1) * Math.sqrt(n2)) === 0 ? 0 : dot / (Math.sqrt(n1) * Math.sqrt(n2));
            scores.push({ index: i, similarity: sim });
        }
        scores.sort((a, b) => b.similarity - a.similarity);
        return scores.slice(0, topK);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. NEURAL NETWORK — الشبكة العصبية الكاملة
// ═══════════════════════════════════════════════════════════════════════════════

class NeuralNetwork {
    constructor(config = {}) {
        this.layers = [];
        this.config = {
            learningRate: config.learningRate || 0.001,
            batchSize: config.batchSize || 32,
            epochs: config.epochs || 100,
            dropout: config.dropout || 0,
            l2Lambda: config.l2Lambda || 0.0001,
            ...config
        };
        this.trainingHistory = [];
    }

    addLayer(inputSize, outputSize, activation = 'relu') {
        this.layers.push(new DenseLayer(inputSize, outputSize, activation));
        return this;
    }

    // Forward pass
    forward(input) {
        let current = input instanceof Matrix ? input : Matrix.fromArray(Array.isArray(input[0]) ? input : [input]);
        for (const layer of this.layers) {
            current = layer.forward(current);
        }
        return current;
    }

    // تنبؤ (بدون تدريب)
    predict(input) {
        return this.forward(input);
    }

    // حساب الخسارة — Cross Entropy
    crossEntropyLoss(predicted, target) {
        let loss = 0;
        const n = predicted.rows;
        for (let i = 0; i < predicted.data.length; i++) {
            const p = Math.max(1e-7, Math.min(1 - 1e-7, predicted.data[i]));
            loss -= target.data[i] * Math.log(p);
        }
        return loss / n;
    }

    // حساب الخسارة — Mean Squared Error
    mseLoss(predicted, target) {
        let loss = 0;
        for (let i = 0; i < predicted.data.length; i++) {
            const diff = predicted.data[i] - target.data[i];
            loss += diff * diff;
        }
        return loss / predicted.data.length;
    }

    // تدريب على batch واحد
    trainBatch(inputs, targets, lossType = 'crossEntropy') {
        const inputMatrix = inputs instanceof Matrix ? inputs : Matrix.fromArray(inputs);
        const targetMatrix = targets instanceof Matrix ? targets : Matrix.fromArray(targets);

        // Forward
        const output = this.forward(inputMatrix);

        // حساب الخسارة
        let loss;
        let gradOutput;

        if (lossType === 'crossEntropy') {
            loss = this.crossEntropyLoss(output, targetMatrix);
            // Gradient for softmax + cross-entropy
            gradOutput = Matrix.subtract(output, targetMatrix);
        } else {
            loss = this.mseLoss(output, targetMatrix);
            gradOutput = Matrix.subtract(output, targetMatrix).scale(2 / output.data.length);
        }

        // L2 regularization
        if (this.config.l2Lambda > 0) {
            for (const layer of this.layers) {
                let l2 = 0;
                for (let i = 0; i < layer.weights.data.length; i++) l2 += layer.weights.data[i] * layer.weights.data[i];
                loss += 0.5 * this.config.l2Lambda * l2;
            }
        }

        // Backward pass
        let grad = gradOutput;
        for (let i = this.layers.length - 1; i >= 0; i--) {
            grad = this.layers[i].backward(grad, this.config.learningRate);
        }

        return loss;
    }

    // تدريب كامل
    train(dataX, dataY, options = {}) {
        const epochs = options.epochs || this.config.epochs;
        const batchSize = options.batchSize || this.config.batchSize;
        const lossType = options.lossType || 'crossEntropy';
        const verbose = options.verbose !== false;
        const history = [];

        for (let epoch = 0; epoch < epochs; epoch++) {
            let totalLoss = 0;
            let batches = 0;

            // خلط البيانات
            const indices = Array.from({ length: dataX.length }, (_, i) => i);
            for (let i = indices.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [indices[i], indices[j]] = [indices[j], indices[i]];
            }

            // تدريب على batches
            for (let b = 0; b < dataX.length; b += batchSize) {
                const end = Math.min(b + batchSize, dataX.length);
                const batchIndices = indices.slice(b, end);
                const batchX = batchIndices.map(i => dataX[i]);
                const batchY = batchIndices.map(i => dataY[i]);

                const loss = this.trainBatch(batchX, batchY, lossType);
                totalLoss += loss;
                batches++;
            }

            const avgLoss = totalLoss / batches;
            history.push({ epoch: epoch + 1, loss: avgLoss });

            if (verbose && (epoch % 10 === 0 || epoch === epochs - 1)) {
                console.log(`   [Epoch ${epoch + 1}/${epochs}] Loss: ${avgLoss.toFixed(6)}`);
            }
        }

        this.trainingHistory = history;
        return history;
    }

    // دقة التصنيف
    accuracy(dataX, dataY) {
        let correct = 0;
        for (let i = 0; i < dataX.length; i++) {
            const pred = this.predict(dataX[i]);
            const predClass = this._argmax(pred.data);
            const trueClass = typeof dataY[i] === 'number' ? dataY[i] : this._argmax(dataY[i]);
            if (predClass === trueClass) correct++;
        }
        return correct / dataX.length;
    }

    _argmax(arr) {
        let maxIdx = 0, maxVal = arr[0] || 0;
        for (let i = 1; i < arr.length; i++) {
            if (arr[i] > maxVal) { maxVal = arr[i]; maxIdx = i; }
        }
        return maxIdx;
    }

    // حفظ/تحميل الأوزان
    serialize() {
        return {
            config: this.config,
            layers: this.layers.map(l => ({
                inputSize: l.inputSize,
                outputSize: l.outputSize,
                activation: l.activationName,
                weights: Array.from(l.weights.data),
                bias: Array.from(l.bias.data)
            })),
            history: this.trainingHistory
        };
    }

    static deserialize(data) {
        const nn = new NeuralNetwork(data.config);
        for (const ld of data.layers) {
            const layer = new DenseLayer(ld.inputSize, ld.outputSize, ld.activation);
            layer.weights.data = new Float32Array(ld.weights);
            layer.bias.data = new Float32Array(ld.bias);
            nn.layers.push(layer);
        }
        nn.trainingHistory = data.history || [];
        return nn;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. WORD2VEC — تضمين الكلمات (Skip-gram)
// ═══════════════════════════════════════════════════════════════════════════════

class Word2Vec {
    constructor(options = {}) {
        this.embeddingDim = options.embeddingDim || 128;
        this.windowSize = options.windowSize || 3;
        this.minCount = options.minCount || 1;
        this.learningRate = options.learningRate || 0.025;
        this.negativeSamples = options.negativeSamples || 5;
        this.epochs = options.epochs || 30;
        this.subsampleThreshold = options.subsampleThreshold || 1e-3;

        this.vocab = new Map();       // word → {index, count}
        this.indexToWord = [];
        this.embeddings = null;       // EmbeddingLayer
        this.contextWeights = null;   // Matrix for context
        this.totalWords = 0;
        this.trained = false;
    }

    // ═══ TOKENIZER — مقسّم نصوص عربي محسّن ═══
    tokenize(text) {
        return text
            .replace(/[^\u0600-\u06FF\u0750-\u077Fa-zA-Z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter(t => t.length > 1)
            .map(t => t.trim());
    }

    // بناء المفردات
    buildVocab(texts) {
        const counts = new Map();
        let total = 0;

        for (const text of texts) {
            const tokens = typeof text === 'string' ? this.tokenize(text) : text;
            for (const token of tokens) {
                counts.set(token, (counts.get(token) || 0) + 1);
                total++;
            }
        }

        this.totalWords = total;
        this.vocab.clear();
        this.indexToWord = [];

        // ترتيب بالتكرار
        const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
        for (const [word, count] of sorted) {
            if (count >= this.minCount) {
                const index = this.vocab.size;
                this.vocab.set(word, { index, count });
                this.indexToWord.push(word);
            }
        }

        // تهيئة الأوزان
        this.embeddings = new EmbeddingLayer(this.vocab.size, this.embeddingDim);
        this.contextWeights = Matrix.random(this.vocab.size, this.embeddingDim, 0.01);

        return this.vocab.size;
    }

    // تدريب Skip-gram مع Negative Sampling
    train(texts, options = {}) {
        const epochs = options.epochs || this.epochs;
        const verbose = options.verbose !== false;
        let lr = this.learningRate;

        if (this.vocab.size === 0) this.buildVocab(texts);

        const allTokens = [];
        for (const text of texts) {
            const tokens = typeof text === 'string' ? this.tokenize(text) : text;
            allTokens.push(tokens.filter(t => this.vocab.has(t)));
        }

        // Unigram distribution for negative sampling (^0.75)
        const unigramPower = new Float32Array(this.vocab.size);
        let totalPower = 0;
        for (const [, info] of this.vocab) {
            unigramPower[info.index] = Math.pow(info.count, 0.75);
            totalPower += unigramPower[info.index];
        }
        for (let i = 0; i < unigramPower.length; i++) unigramPower[i] /= totalPower;

        // Alias table for O(1) negative sampling
        const negativeTable = this._buildNegativeTable(unigramPower, 1e5);

        if (verbose) console.log(`   🧠 [Word2Vec] بدء التدريب: ${this.vocab.size} كلمة | ${this.embeddingDim} بعد | ${epochs} دورة`);

        for (let epoch = 0; epoch < epochs; epoch++) {
            let totalLoss = 0;
            let pairsProcessed = 0;

            for (const tokens of allTokens) {
                for (let i = 0; i < tokens.length; i++) {
                    const centerIdx = this.vocab.get(tokens[i]).index;

                    // Subsampling
                    const freq = this.vocab.get(tokens[i]).count / this.totalWords;
                    if (freq > this.subsampleThreshold) {
                        const keepProb = (Math.sqrt(freq / this.subsampleThreshold) + 1) * (this.subsampleThreshold / freq);
                        if (Math.random() > keepProb) continue;
                    }

                    // Dynamic window
                    const actualWindow = Math.ceil(Math.random() * this.windowSize);

                    for (let j = Math.max(0, i - actualWindow); j <= Math.min(tokens.length - 1, i + actualWindow); j++) {
                        if (i === j) continue;
                        const contextIdx = this.vocab.get(tokens[j]).index;

                        // Positive sample
                        const loss = this._trainPair(centerIdx, contextIdx, 1, lr);
                        totalLoss += loss;

                        // Negative samples
                        for (let n = 0; n < this.negativeSamples; n++) {
                            let negIdx = negativeTable[Math.floor(Math.random() * negativeTable.length)];
                            if (negIdx === contextIdx) continue;
                            this._trainPair(centerIdx, negIdx, 0, lr);
                        }

                        pairsProcessed++;
                    }
                }
            }

            // Learning rate decay
            lr = this.learningRate * (1 - epoch / epochs);
            lr = Math.max(lr, this.learningRate * 0.001);

            if (verbose && (epoch % 5 === 0 || epoch === epochs - 1)) {
                const avgLoss = pairsProcessed > 0 ? totalLoss / pairsProcessed : 0;
                console.log(`   [Word2Vec Epoch ${epoch + 1}/${epochs}] Loss: ${avgLoss.toFixed(6)} | أزواج: ${pairsProcessed}`);
            }
        }

        this.trained = true;
        if (verbose) console.log(`   ✅ [Word2Vec] اكتمل التدريب — ${this.vocab.size} كلمة × ${this.embeddingDim} بعد`);
        return this;
    }

    _trainPair(centerIdx, contextIdx, label, lr) {
        // Get vectors
        const centerVec = new Float32Array(this.embeddingDim);
        const contextVec = new Float32Array(this.embeddingDim);

        for (let d = 0; d < this.embeddingDim; d++) {
            centerVec[d] = this.embeddings.weights.data[centerIdx * this.embeddingDim + d];
            contextVec[d] = this.contextWeights.data[contextIdx * this.embeddingDim + d];
        }

        // Dot product → sigmoid
        let dot = 0;
        for (let d = 0; d < this.embeddingDim; d++) dot += centerVec[d] * contextVec[d];
        const score = 1 / (1 + Math.exp(-Math.max(-6, Math.min(6, dot))));

        // Loss
        const loss = label === 1 ? -Math.log(score + 1e-7) : -Math.log(1 - score + 1e-7);

        // Gradient
        const grad = (score - label) * lr;

        // Update
        for (let d = 0; d < this.embeddingDim; d++) {
            const gCenter = grad * contextVec[d];
            const gContext = grad * centerVec[d];
            this.embeddings.weights.data[centerIdx * this.embeddingDim + d] -= gCenter;
            this.contextWeights.data[contextIdx * this.embeddingDim + d] -= gContext;
        }

        return loss;
    }

    _buildNegativeTable(probs, tableSize) {
        const table = new Int32Array(tableSize);
        let idx = 0;
        let cumProb = probs[0];
        for (let i = 0; i < tableSize; i++) {
            const target = i / tableSize;
            while (target > cumProb && idx < probs.length - 1) {
                idx++;
                cumProb += probs[idx];
            }
            table[i] = idx;
        }
        return table;
    }

    // الحصول على متجه كلمة
    getVector(word) {
        const info = this.vocab.get(word);
        if (!info) return null;
        const vec = new Float32Array(this.embeddingDim);
        for (let d = 0; d < this.embeddingDim; d++) {
            vec[d] = this.embeddings.weights.data[info.index * this.embeddingDim + d];
        }
        return vec;
    }

    // متجه جملة (متوسط متجهات الكلمات)
    getSentenceVector(text) {
        const tokens = typeof text === 'string' ? this.tokenize(text) : text;
        const vec = new Float32Array(this.embeddingDim);
        let count = 0;

        for (const token of tokens) {
            const wordVec = this.getVector(token);
            if (wordVec) {
                for (let d = 0; d < this.embeddingDim; d++) vec[d] += wordVec[d];
                count++;
            }
        }

        if (count > 0) {
            for (let d = 0; d < this.embeddingDim; d++) vec[d] /= count;
        }
        return vec;
    }

    // تشابه بين نصين
    textSimilarity(text1, text2) {
        const v1 = this.getSentenceVector(text1);
        const v2 = this.getSentenceVector(text2);
        return this._cosineSim(v1, v2);
    }

    // أقرب الكلمات
    mostSimilar(word, topK = 10) {
        const vec = this.getVector(word);
        if (!vec) return [];
        const info = this.vocab.get(word);
        const results = this.embeddings.findNearest(vec, topK + 1, [info.index]);
        return results.slice(0, topK).map(r => ({
            word: this.indexToWord[r.index],
            similarity: r.similarity
        }));
    }

    // عمليات المتجهات: king - man + woman = queen
    analogy(wordA, wordB, wordC, topK = 5) {
        const vA = this.getVector(wordA);
        const vB = this.getVector(wordB);
        const vC = this.getVector(wordC);
        if (!vA || !vB || !vC) return [];

        const result = new Float32Array(this.embeddingDim);
        for (let d = 0; d < this.embeddingDim; d++) {
            result[d] = vB[d] - vA[d] + vC[d];
        }

        const excludeIndices = [
            this.vocab.get(wordA)?.index,
            this.vocab.get(wordB)?.index,
            this.vocab.get(wordC)?.index
        ].filter(x => x !== undefined);

        return this.embeddings.findNearest(result, topK, excludeIndices)
            .map(r => ({ word: this.indexToWord[r.index], similarity: r.similarity }));
    }

    _cosineSim(a, b) {
        let dot = 0, n1 = 0, n2 = 0;
        for (let i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            n1 += a[i] * a[i];
            n2 += b[i] * b[i];
        }
        return (Math.sqrt(n1) * Math.sqrt(n2)) === 0 ? 0 : dot / (Math.sqrt(n1) * Math.sqrt(n2));
    }

    getStats() {
        return {
            vocabSize: this.vocab.size,
            embeddingDim: this.embeddingDim,
            totalWords: this.totalWords,
            trained: this.trained,
            windowSize: this.windowSize,
            negativeSamples: this.negativeSamples
        };
    }

    // حفظ / تحميل
    serialize() {
        return {
            config: {
                embeddingDim: this.embeddingDim,
                windowSize: this.windowSize,
                vocab: [...this.vocab.entries()],
                indexToWord: this.indexToWord,
                totalWords: this.totalWords,
                trained: this.trained
            },
            embeddings: Array.from(this.embeddings.weights.data),
            contextWeights: Array.from(this.contextWeights.data)
        };
    }

    static deserialize(data) {
        const w2v = new Word2Vec({ embeddingDim: data.config.embeddingDim, windowSize: data.config.windowSize });
        w2v.vocab = new Map(data.config.vocab);
        w2v.indexToWord = data.config.indexToWord;
        w2v.totalWords = data.config.totalWords;
        w2v.trained = data.config.trained;
        w2v.embeddings = new EmbeddingLayer(w2v.vocab.size, w2v.embeddingDim);
        w2v.embeddings.weights.data = new Float32Array(data.embeddings);
        w2v.contextWeights = new Matrix(w2v.vocab.size, w2v.embeddingDim);
        w2v.contextWeights.data = new Float32Array(data.contextWeights);
        return w2v;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. SELF-ATTENTION — آلية الانتباه الذاتي (أساس Transformer)
// ═══════════════════════════════════════════════════════════════════════════════

class SelfAttention {
    constructor(dim, headDim = null) {
        this.dim = dim;
        this.headDim = headDim || dim;
        this.scale = 1 / Math.sqrt(this.headDim);

        this.Wq = Matrix.xavier(dim, this.headDim);
        this.Wk = Matrix.xavier(dim, this.headDim);
        this.Wv = Matrix.xavier(dim, this.headDim);
        this.Wo = Matrix.xavier(this.headDim, dim);
    }

    forward(input) {
        const Q = Matrix.multiply(input, this.Wq);
        const K = Matrix.multiply(input, this.Wk);
        const V = Matrix.multiply(input, this.Wv);

        // Attention scores: softmax(Q * K^T / sqrt(d))
        const scores = Matrix.multiply(Q, K.transpose()).scale(this.scale);

        // Softmax per row
        const attention = new Matrix(scores.rows, scores.cols);
        for (let i = 0; i < scores.rows; i++) {
            const row = [];
            for (let j = 0; j < scores.cols; j++) row.push(scores.data[i * scores.cols + j]);
            const softmaxed = Activations.softmax.forward(row);
            for (let j = 0; j < scores.cols; j++) attention.data[i * scores.cols + j] = softmaxed[j];
        }

        // Weighted values
        const contextVectors = Matrix.multiply(attention, V);

        // Output projection
        return Matrix.multiply(contextVectors, this.Wo);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. SHEIKHA NEURAL ENGINE — المحرك الرئيسي
// ═══════════════════════════════════════════════════════════════════════════════

class SheikhaNeural {
    constructor() {
        this.بسم_الله = 'بسم الله الرحمن الرحيم';
        this.word2vec = new Word2Vec({ embeddingDim: 128, windowSize: 3, epochs: 30 });
        this.intentClassifier = null;
        this.attention = null;
        this.trained = false;
        this.stats = { queriesProcessed: 0, trainingSessions: 0 };
    }

    // تدريب على كل المعرفة المتاحة
    trainOnKnowledge(knowledgeTexts) {
        console.log('🧠 [SheikhaNeural] بدء تدريب الشبكة العصبية...');

        // 1. تدريب Word2Vec
        this.word2vec.train(knowledgeTexts, { verbose: true });

        // 2. إنشاء مصنف النوايا
        this.attention = new SelfAttention(128);

        this.trained = true;
        this.stats.trainingSessions++;
        console.log(`✅ [SheikhaNeural] الشبكة العصبية جاهزة — ${this.word2vec.vocab.size} كلمة`);
        return this;
    }

    // تحليل نص — فهم عميق
    analyze(text) {
        if (!this.trained) return { error: 'الشبكة لم تُدرّب بعد' };
        this.stats.queriesProcessed++;

        const tokens = this.word2vec.tokenize(text);
        const sentenceVec = this.word2vec.getSentenceVector(text);
        const knownTokens = tokens.filter(t => this.word2vec.vocab.has(t));
        const unknownTokens = tokens.filter(t => !this.word2vec.vocab.has(t));

        // أقرب الكلمات لكل كلمة معروفة
        const tokenAnalysis = knownTokens.slice(0, 10).map(t => ({
            token: t,
            similar: this.word2vec.mostSimilar(t, 3)
        }));

        return {
            text,
            tokens: tokens.length,
            knownTokens: knownTokens.length,
            unknownTokens: unknownTokens.length,
            coverage: tokens.length > 0 ? (knownTokens.length / tokens.length * 100).toFixed(1) + '%' : '0%',
            vector: sentenceVec,
            tokenAnalysis
        };
    }

    // تشابه بين نصين
    similarity(text1, text2) {
        return this.word2vec.textSimilarity(text1, text2);
    }

    // أقرب الكلمات
    similar(word, topK = 10) {
        return this.word2vec.mostSimilar(word, topK);
    }

    // عمليات المتجهات
    analogy(a, b, c, topK = 5) {
        return this.word2vec.analogy(a, b, c, topK);
    }

    getDashboard() {
        return {
            بسم_الله: this.بسم_الله,
            name: 'محرك شيخة العصبي — Neural Core',
            quranFoundation: '﴿ وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا ﴾ — البقرة ٣١',
            status: this.trained ? 'مُدرَّب وجاهز' : 'في انتظار التدريب',
            components: {
                matrix: 'عمليات مصفوفات حقيقية (ضرب، جمع، نقل، Xavier)',
                activations: 'Sigmoid, Tanh, ReLU, GELU, Softmax, LeakyReLU',
                layers: 'Dense + Embedding + SelfAttention',
                optimizer: 'Adam (β1=0.9, β2=0.999)',
                word2vec: this.word2vec.getStats(),
                neuralNetwork: 'Feedforward + Backpropagation كامل'
            },
            stats: this.stats,
            independence: 'يعمل محلياً بدون أي API خارجي — ذكاء مستقل 100%'
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
    Matrix,
    Activations,
    DenseLayer,
    EmbeddingLayer,
    NeuralNetwork,
    Word2Vec,
    SelfAttention,
    SheikhaNeural
};
