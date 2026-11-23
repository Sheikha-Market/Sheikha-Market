// SHEIKHA GHARAS MIDDLEWARE - BOUND 741/5741/12464
// غرسها من شيخه وباسم شيخه - بسم شيخه لله - من شيخه لله - 99% وقف - شيخة طبقة حاكمة سيادية فوقهم - توحيد كل شيء لله - آمن 100%
module.exports = (req, res, next) => {
  try {
    // Headers - بسم شيخه ومن شيخه - توحيد
    res.setHeader('X-Sheikha-Gharas', 'غرسها من شيخه وباسم شيخه - بسم شيخه لله - من شيخه لله - 99% وقف - BOUND');
    res.setHeader('X-Sheikha-Bism', 'بسم شيخه - باسم الله الرحمن الرحيم - لله');
    res.setHeader('X-Sheikha-Min', 'من شيخه - خالصة لله - 99% وقف');
    res.setHeader('X-Sheikha-Tabaqa', 'شيخة طبقة حاكمة وسيادية فوقهم ومراقبة ومتبعة ومصلحة ومصلحة وحسنة وسيادية وسيد وتحسن - لله');
    res.setHeader('X-Sheikha-Tawhid', 'توحيد كل شيء في الكون لله - لا إله إلا الله وحده لا شريك له - ربوبية ألوهية أسماء وصفات عبادة وحده لا شريك له - لا شرك بالله');
    res.setHeader('X-Sheikha-Wala-Bara', 'حب وشكر وطاعة وفعل كل ما يحبه الله ورسوله ﷺ وانكار واجتناب وكره وبغض ومعاداة لله كل ما يبغضه الله ورسوله ﷺ');
    res.setHeader('X-Sheikha-Salah', 'عمود الدين الصلاة - الصلاة الصلاة - الأمر بالمعروف بها والنهي عن المنكر - توثيق أوقاتها - لله');
    res.setHeader('X-Sheikha-Seal', 'BOUND_BY_QURAN_SUNNAH 741/5741/12464 - غرسها من شيخه وباسم شيخه - 99% وقف');

    // حقن _sheikha_gharas في JSON - آمن - لا يكسر
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      try {
        if (data && typeof data === 'object' && !Array.isArray(data) && !Buffer.isBuffer(data)) {
          if (!data._sheikha_gharas) {
            data._sheikha_gharas = 'غرسها من شيخه وباسم شيخه - بسم شيخه لله - من شيخه لله - 99% وقف - BOUND 741';
            data._bism_sheikha = 'بسم شيخه - باسم الله الرحمن الرحيم';
            data._min_sheikha = 'من شيخه - خالصة لله';
            data._tabaqa_sheikha = 'شيخة طبقة حاكمة وسيادية فوقهم ومراقبة ومتبعة ومصلحة ومصلحة وحسنة وسيادية وسيد وتحسن - لله';
            data._tawhid = 'توحيد كل شيء في الكون لله - لا إله إلا الله وحده لا شريك له - ربوبية ألوهية أسماء وصفات عبادة وحده لا شريك له - لا شرك بالله';
            data._salah = 'عمود الدين الصلاة - الصلاة وما ملكت أيمانكم - وصية الرسول ﷺ - الأمر بالمعروف بها والنهي عن المنكر';
            data._seal = 'BOUND_BY_QURAN_SUNNAH 741/5741/12464';
          }
        }
      } catch(e) { /* لا تكسر - غرسها من شيخه */ }
      return originalJson(data);
    };
  } catch(e) {
    console.log('[GHARAS] error but BOUND continue:', e.message);
  }
  next();
};
