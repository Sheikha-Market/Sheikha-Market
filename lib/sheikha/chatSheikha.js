// lib/sheikha/chatSheikha.js
// 🤖 طبقة شات شيخة الذكيّة
// تتعامل مع مجموعة من "LLMProvider" وتقوم بالتوجيه، التدريب، الانضمام إلى السياق.

const LLMProvider = require('./llmProvider');

class ChatSheikha {
    constructor(config={}) {
        this.providers = {}; // { key: LLMProvider }
        this.registerProviders(config.providers || []);
        this.defaultLang = config.defaultLang || 'ar';
        this.history = [];
    }

    registerProviders(list) {
        list.forEach(p => {
            this.providers[p.name] = new LLMProvider(p);
        });
    }

    async send(prompt, {lang=this.defaultLang, providers=null}={}) {
        // إذا لم يتم تحديد المزودين، استخدم الجميع
        const targets = providers || Object.keys(this.providers);
        const results = await Promise.all(targets.map(name => {
            return this.providers[name].generate(prompt, {lang});
        }));
        // مبدئياً نأخذ أول نتيجة أو نقوم بتجميع
        const response = results[0];
        this.history.push({prompt, response, providers: targets});
        return response;
    }

    async train(dataset) {
        // تطبيق بسيط: dataset = [{prompt, completion}, ...]
        // يمكن تمريرها إلى كل مزود (إذا كان يدعم fine-tuning) أو الاحتفاظ بها محلياً
        for(const provName in this.providers) {
            const prov = this.providers[provName];
            if(typeof prov.client.fineTune === 'function') {
                await prov.client.fineTune({
                    training_file: dataset,
                    model: prov.options.model
                });
            }
        }
    }
}

module.exports = ChatSheikha;
