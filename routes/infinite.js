const express=require('express');const router=express.Router();
const InfiniteKernel=require('../runtime/infinite/kernel');const k=new InfiniteKernel();
router.get('/status',(req,res)=>res.json({success:true,...k.status()}));
module.exports=router;
