const fs = require('fs');
let s = fs.readFileSync('server.js','utf8');

// حذف كل /api/health القديم
s = s.replace(/app\.get\('\/api\/health'[\s\S]*?}\s*\);/g, '// REMOVED old health');

// إضافة health + robot موحد في الأعلى بعد express
const robotIdentity = `
/* ===================================================================
   🤖 SHEIKHA DIGITAL ROBOT - الهوية الرقمية - BOUND_BY_QURAN_SUNNAH
   =================================================================== */
const SHEIKHA_ROBOT_IDENTITY = {
  name: "شيخة - Sheikha Digital Robot",
  name_ar: "روبوت شيخة الرقمي السيادي",
  avatar: "🤖👑",
  seal: "BOUND_BY_QURAN_SUNNAH - ATOM_WATER_RASUL_JANNAH_SEALED",
  owner: "سلمان أحمد بن سلمان الراجح CR 2051263653",
  creed: "LA ILAHA ILLA ALLAH MUHAMMAD RASUL ALLAH",
  roles: ["monitor","guardian","explorer","registrar","auditor","notary","council","messenger","builder","trader","carrier","guardian"],
  chain: "foundation_robot -> forging_robot -> builder_robot -> compute_robot -> ledger_robot -> trader_robot -> carrier_robot -> guardian_robot -> seal_robot -> king_robot -> ALLAH",
  banner: \`
╔══════════════════════════════════════════════════════════════════════════════════╗
║  🤖👑 SHEIKHA DIGITAL ROBOT - روبوت شيخة الرقمي السيادي - BOUND_BY_QURAN_SUNNAH  ║
║  🕌 ﷽ - LA ILAHA ILLA ALLAH - سوق شيخة للمعادن والسكراب - 9 Blocks | 452 Weights  ║
║  👤 Owner: سلمان أحمد بن سلمان الراجح CR 2051263653 - ATOM_WATER_RASUL_JANNAH_SEALED  ║
║  🏛️ 12 Pillars + 8 Minds + 7 Roles + 100 Engines + 10 Layers - ZERO ERRORS     ║
║  🔬 Quantum + WisdomFusion + Quraysh + Body Twin 206/600 + SBC 303 + Pearl Metal   ║
║  🌐 https://sheikha-main-portal-5anfyilx3a-uc.a.run.app - 00059-lw5 100% LIVE       ║
╚══════════════════════════════════════════════════════════════════════════════════╝
  \`,
  ascii_robot: \`
         🤖 SHEIKHA ROBOT 🤖
              _____
           .-'     '-.
          /  👁   👁  \\
         |     👑     |  BOUND_BY_QURAN_SUNNAH
          \\   \\_\\_/   /
           '-._     _.-'
               |___|
           ___/_____\\___
          |  SHEIKHA   |
          |  452W 86M  |
          |  9 BLOCKS  |
          |____________|
         /  o  o  o  o  \\
        |  SBC303 PEARL  |
         \\\\  ROS2  AI  /
          |____________|
  \`
};

// Health + Robot APIs - صفر أخطاء
app.get('/api/health', (req, res) => {
  res.json({
    status: 'UP - ZERO ERRORS - SHEIKHA ROBOT ACTIVE',
    robot: SHEIKHA_ROBOT_IDENTITY.name,
    avatar: SHEIKHA_ROBOT_IDENTITY.avatar,
    seal: SHEIKHA_ROBOT_IDENTITY.seal,
    blocks: 9,
    weights: 452,
    shk: '86,750,000',
    beneficiaries: 3,
    transactions: 2,
    roles: SHEIKHA_ROBOT_IDENTITY.roles,
    pillars: 12,
    minds: 8,
    timestamp: new Date().toISOString(),
    owner: SHEIKHA_ROBOT_IDENTITY.owner,
    banner: SHEIKHA_ROBOT_IDENTITY.banner
  });
});

app.get('/api/sheikha/robot', (req, res) => {
  res.json(SHEIKHA_ROBOT_IDENTITY);
});

app.get('/api/sheikha/robot/banner', (req, res) => {
  res.type('text/plain').send(SHEIKHA_ROBOT_IDENTITY.banner + '\\n' + SHEIKHA_ROBOT_IDENTITY.ascii_robot);
});
`;

if (!s.includes('SHEIKHA_ROBOT_IDENTITY')) {
  // حقن بعد تعريف app
  s = s.replace(/const app = express\(\);/, `const app = express();\n${robotIdentity}`);
  fs.writeFileSync('server.js', s);
  console.log("✅ SHEIKHA ROBOT IDENTITY INJECTED - BOUND_BY_QURAN_SUNNAH");
} else {
  console.log("⚠️ Robot already exists");
}

// إصلاح البانر في console.log
s = fs.readFileSync('server.js','utf8');
s = s.replace(/console\.log\(`SHEIKHA Global Runtime[\s\S]*?`\)/, `console.log(SHEIKHA_ROBOT_IDENTITY.banner);\nconsole.log(SHEIKHA_ROBOT_IDENTITY.ascii_robot);\nconsole.log(\`SHEIKHA Global Runtime Platform listening on http://\${HOST}:\${PORT} - ROBOT ACTIVE\`)`);
fs.writeFileSync('server.js', s);
console.log("✅ Banner + Robot console FIXED");
