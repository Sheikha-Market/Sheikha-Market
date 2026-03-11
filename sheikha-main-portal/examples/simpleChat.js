// examples/simpleChat.js
// تجربة سريعة للتواصل مع محرك ChatSheikha

const ChatSheikha = require('../lib/sheikha/chatSheikha');

(async () => {
    // تأكد من ضبط متغيرات البيئة API_KEYS
    const chat = new ChatSheikha({
        providers: [
            { name: 'openai', client: new (require('openai').OpenAI)({apiKey: process.env.OPENAI_API_KEY}), options: {model: 'gpt-4o'} }
            // تستطيع إضافة مزودين آخرين هنا
        ],
        defaultLang: 'ar'
    });

    const prompt = 'مرحبا شيخة، علمني عبارة قصيرة عن الصلاة.';
    const res = await chat.send(prompt);
    console.log('الاستجابة:', res);
})();
