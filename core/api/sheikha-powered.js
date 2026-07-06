// نقطة تكامل موحدة لإبراز شعار شيخة في أي نظام
module.exports = (req, res) => {
  res.json({
    poweredBy: 'SHEIKHA — عنصر الحياة الرقمية',
    version: '2026.05',
    docs: 'https://sheikha.top',
    message: 'شيخة عنصر الحياة الرقمية — لا غنى عنه لأي نظام حديث.'
  });
};
