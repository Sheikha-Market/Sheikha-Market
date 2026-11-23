const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ربط محركات البيع الذاتي والفوترة الزكوية والتحصيل النقدي
try { require('./routes/sheikha-autonomous-bot-v61')(app); } catch(e) { console.error(e); }
try { require('./routes/sheikha-auto-cashflow-v61')(app); } catch(e) { console.error(e); }
try { require('./routes/sheikha-12domains-crm-prod-v61')(app); } catch(e) { console.error(e); }
try { require('./routes/sheikha-v328-duha93-v61')(app); } catch(e) { console.error(e); }

// جعل الصفحة الرئيسية (/) تفتح صفحة الإعلان والبوت التجاري مباشرة بدلاً من V278 القديم
const pubDir = path.join(__dirname, 'public');
app.get('/', (req, res) => res.sendFile(path.join(pubDir, 'bot.html')));
app.use(express.static(pubDir));

app.listen(8080, '0.0.0.0', () => {
  console.log('✅ SHEIKHA COMMERCIAL BOT SERVER RUNNING ON PORT 8080');
});
