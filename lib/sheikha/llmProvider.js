// lib/sheikha/llmProvider.js
// 📦 واجهة موحَّدة لجميع مزودات LLM (OpenAI, Anthropic, Ollama, Google, Azure...)
// الهدف: جعل استدعاء النماذج قابلاً للتوسعة، قوي، وغير مهدِر.

class LLMProvider {
    constructor({name, client, options}) {
        this.name = name;          // "openai", "anthropic", etc.
        this.client = client;      // مكتبة العميل (SDK) الخاص بالمزود
        this.options = options || {};
    }

    async generate(prompt, {temperature=0.7, maxTokens=512, lang="ar"}={}) {
        // استدعاء موحد ـ يمكن تعديل بناءً على اسم المزود
        switch(this.name) {
            case 'openai':
                return this.client.responses.create({
                    model: this.options.model || 'gpt-4o',
                    input: prompt,
                    temperature,
                    max_tokens: maxTokens
                });
            case 'anthropic':
                return this.client.complete({
                    model: this.options.model || 'claude-3',
                    prompt,
                    temperature,
                    max_tokens_to_sample: maxTokens
                });
            case 'ollama':
                return this.client.generate(this.options.model || 'sheikha-base', prompt);
            default:
                throw new Error(`LLM provider ${this.name} not implemented`);
        }
    }

    async embed(text) {
        if(this.name === 'openai') {
            return this.client.embeddings.create({
                model: this.options.embedModel || 'text-embedding-3-large',
                input: text
            });
        }
        // يمكن إضافة دعم آخر
        throw new Error('Embedding not supported for ' + this.name);
    }
}

module.exports = LLMProvider;
