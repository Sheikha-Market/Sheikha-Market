document.getElementById('calcBtn').addEventListener('click', () => {
  const t = Number(document.getElementById('tons').value) || 0;
  const p = Number(document.getElementById('price').value) || 0;
  const tot = +(t * p * 1.15).toFixed(2);
  const adv = +(tot * 0.5).toFixed(2);
  document.getElementById('res').innerText = 'الإجمالي: ' + tot.toLocaleString() + ' ر.س | الدفعة 50%: ' + adv.toLocaleString() + ' ر.س';
});