const express=require('express');const router=express.Router();
const Matrix=require('../runtime/minds/sheikha_multi_mind_matrix');const matrix=new Matrix();
router.get('/',(req,res)=>res.json({success:true, version:matrix.version, governance:matrix.governance, central:matrix.centralized, decentral:matrix.decentralized, minds:matrix.listMinds()}));
router.get('/:mind/command',(req,res)=>{const {mind}=req.params; const {cmd,system}=req.query; res.json({success:true, result:matrix.executeOrder(mind, cmd||"اعمار", system||"SHEIKHA_ALL")});});
router.post('/replicate',(req,res)=>res.json({success:true, ...matrix.replicateAll()}));
router.get('/:mind/status',(req,res)=>{const m=matrix.minds[req.params.mind]; if(!m) return res.status(404).json({error:"mind not found"}); res.json({success:true, mind:m.name, role:m.role, domain:m.domain, ayah:m.ayah, cells:m.cells.length, capabilities:["CONTROL","EDIT","MONITOR","GUARD","MANAGER","WATCH"], model:"CENTRALIZED_L0_GOVERNANCE_WITH_DECENTRALIZED_AGENTS"});});
module.exports=router;
