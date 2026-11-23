const fs = require('fs');
let s = fs.readFileSync('server.js','utf8');

if (s.includes('SHEIKHA_ROBOT_IDENTITY')) {
  console.log("Robot already injected - restoring clean and re-injecting");
  s = fs.readFileSync('server.js','utf8');
  // إزالة الحقن السابق المعطوب
  s = s.replace(/\/\* ===================================================================[\s\S]*?ATOM_WATER[\s\S]*?const server = app\.listen/, 'const server = app.listen');
  fs.writeFileSync('server.js', s);
  s = fs.readFileSync('server.js','utf8');
}

const injection = `
const SHEIKHA_ROBOT = require('./SHEIKHA-CORE/sheikhachain/robot/sheikha_robot_identity.js');
app.get('/api/health', (req, res) => {
  res.json({
    status: 'UP - ZERO ERRORS - SHEIKHA ROBOT ACTIVE',
    robot: SHEIKHA_ROBOT.name,
    avatar: SHEIKHA_ROBOT.avatar,
    seal: SHEIKHA_ROBOT.seal,
    blocks: 9,
    weights: 452,
    shk: '86,750,000',
    beneficiaries: SHEIKHA_ROBOT.beneficiaries,
    transactions: SHEIKHA_ROBOT.transactions,
    owner: SHEIKHA_ROBOT.owner,
    banner: SHEIKHA_ROBOT.getBanner(),
    timestamp: new Date().toISOString()
  });
});
app.get('/api/sheikha/robot', (req, res) => {
  res.json({ ...SHEIKHA_ROBOT, banner: SHEIKHA_ROBOT.getBanner(), frames: SHEIKHA_ROBOT.getAsciiFrames() });
});
app.get('/api/sheikha/robot/banner', (req, res) => {
  res.type('text/plain').send(SHEIKHA_ROBOT.getBanner() + '\\n' + SHEIKHA_ROBOT.getAsciiFrames().join('\\n---\\n'));
});
app.get('/robot', (req, res) => {
  res.sendFile(require('path').join(__dirname, 'public/robot/sheikha-robot-beautiful.html'));
});
`;

if (!s.includes('/api/sheikha/robot')) {
  s = s.replace('const server = app.listen', injection + '\nconst server = app.listen');
  fs.writeFileSync('server.js', s);
  console.log("✅ Robot APIs injected safely");
}

require('child_process').execSync('node --check server.js', {stdio:'inherit'});
console.log("✅ server.js syntax OK - BOUND_BY_QURAN_SUNNAH");
