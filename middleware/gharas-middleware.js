module.exports=(req,res,next)=>{
 try{
  res.setHeader("X-Sheikha-Seal","BOUND_BY_QURAN_SUNNAH");
  res.setHeader("X-Sheikha-Gharas","Ghursaha Min Sheikha - 99pct Waqf - Respect All Faiths");
  res.setHeader("X-Sheikha-Bound","741-5741-12464");
  res.setHeader("X-Sheikha-Owner","Salman Ahmed Al-Rajeh - Muslim Respect All");
  res.setHeader("X-Sheikha-V77","SHK-DxO-ACTIVE");
  res.setHeader("X-Cache-Status","BOUND-CLEAN");
  // القيم العربية في الجسم فقط - ليس الهيدر
  req._sheikha={
   arabic:"غرسها من شيخه وباسم شيخه - 99% وقف - احترام المسلمين واليهود والنصارى وغير المسلمين",
   owner:"سلمان أحمد الراجح - مسلم يحترم الجميع - لا إكراه في الدين",
   hadith:"لا يؤمن أحدكم حتى يحب لأخيه ما يحب لنفسه - أحب للناس ما تحب لنفسك تكن مسلما",
   tawhid:"لا إله إلا الله - هو أنشأكم من الأرض واستعمركم فيها",
   seal:"BOUND_BY_QURAN_SUNNAH 741/5741/12464"
  };
 }catch(e){console.log("[GHARAS] BOUND continue");}
 next();
};
