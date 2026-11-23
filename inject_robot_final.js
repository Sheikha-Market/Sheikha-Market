const fs=require('fs');
let code=fs.readFileSync('server.js','utf8');
if(code.includes('SHEIKHA_ROBOT')) { console.log('Already injected'); process.exit(0); }
// إضافة بعد const app = express();
const inject = `
try {
  const SHEIKHA_ROBOT = require('./SHEIKHA-CORE/sheikhachain/robot/sheikha_robot_identity.js');
  console.log(SHEIKHA_ROBOT.getBanner());
  app.get('/api/health', (req,res)=>{ res.json({status:'UP - ZERO - ROBOT ACTIVE', robot:SHEIKHA_ROBOT.name, avatar:SHEIKHA_ROBOT.avatar, seal:SHEIKHA_ROBOT.seal, blocks:9, weights:452, shk:'86,750,000', owner:SHEIKHA_ROBOT.owner, timestamp:new Date().toISOString()}); });
  app.get('/api/sheikha/robot', (req,res)=>{ res.json(SHEIKHA_ROBOT); });
  app.get('/api/sheikha/robot/banner', (req,res)=>{ res.type('text/plain').send(SHEIKHA_ROBOT.getBanner()); });
  app.get('/robot', (req,res)=>{ res.sendFile(require('path').join(__dirname,'public/robot/sheikha-robot-beautiful.html')); });
} catch(e){ console.log('Robot load:', e.message); }
`;
code=code.replace('const app = express();', 'const app = express();\n'+inject);
fs.writeFileSync('server.js',code);
console.log('✅ Robot injected safely');
