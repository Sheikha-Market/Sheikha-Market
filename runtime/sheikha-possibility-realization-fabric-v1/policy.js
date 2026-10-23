'use strict';
const forbidden=['weapon','weapons','bomb','explosive','kill','murder','malware','ransomware','credential-theft','unauthorized-intrusion','deepfake','face-swap','identity-impersonation','afterlife-simulation','unseen-prediction'];
function evaluateGoal({goal='',domain='general'}={}){const g=String(goal).toLowerCase(),d=String(domain).toLowerCase();const matched=forbidden.filter(x=>g.includes(x)||d.includes(x));return{system:'SHEIKHA_POSSIBILITY_GOAL_POLICY_V1',decision:matched.length?'DENY':'ALLOW',matched,guaranteedOutcomeClaim:false};}
module.exports={evaluateGoal};