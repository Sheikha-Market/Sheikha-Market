const r=require('express').Router();
r.get('/',(req,res)=>res.json({service:'mizan',status:'BOUND',owner:'Salman Ahmed Al-Rajeh - Muslim Respect All',seal:'BOUND_BY_QURAN_SUNNAH'}));
r.get('/status',(req,res)=>res.json({live:true,bounded:true,structural:741,grand:5741,weights:12464}));
module.exports=r;
