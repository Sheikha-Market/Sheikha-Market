# معايير تطوير مشروع شيخة (Sheikha Main Portal)
- المرجع المشترك مع GPT وCodex: `AGENTS.md` و`docs/canonical/environment/SHEIKHA-ASSISTANT-GOVERNANCE.md` و`docs/canonical/environment/SHEIKHA-PROVIDER-FEDERATION.md`.
- استخدم سجل `config/integrations/sheikha-provider-federation-v1.json` لهويات الموارد المتوقعة. لا تنقل أسرارًا أو موافقات بين الحسابات، ولا تعتبر الإعداد أو نتيجة محفوظة اتصالًا حيًا.
- احفظ تغييرات الجلسات الأخرى. لا نشر أو دفع أو تعديل DNS أو IAM أو مزامنة بيانات Workspace دون اعتماد محدد. المرجعية الشرعية ليست شهادة امتثال آلية.
- يرتبط هذا المشروع بمحرك الذكاء الاصطناعي المركزي المستضاف على سيرفر الـ VPS المخصص عبر الرابط `http://31.97.190`.
- التزم بمعايير الأمان الموثقة في السيرفر وتجنب استخدام دوال الديباج مثل `dd()` في الكود النهائي لمنع إطلاق إنذارات الحماية في Slack.
