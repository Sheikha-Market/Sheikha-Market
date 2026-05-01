/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * منظومة شيخة — الرسومات الاحترافية
 * Sheikha System — Professional Visuals Library
 * ═══════════════════════════════════════════════════════════════════════════════
 * رسومات SVG عالية الجودة للمعادن والشاحنات والمعدات
 */

const SheikhaVisuals = {
    // ═══════════════════════════════════════════════════════════════════════════
    // 🚛 الشاحنات والمركبات — Trucks & Vehicles
    // ═══════════════════════════════════════════════════════════════════════════
    
    trucks: {
        // شاحنة مسطحة للمعادن
        flatbed: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="truckBody" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#4a5568"/>
                    <stop offset="100%" style="stop-color:#2d3748"/>
                </linearGradient>
                <linearGradient id="metalShine" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#e2e8f0"/>
                    <stop offset="50%" style="stop-color:#a0aec0"/>
                    <stop offset="100%" style="stop-color:#718096"/>
                </linearGradient>
                <filter id="shadow">
                    <feDropShadow dx="0" dy="4" stdDeviation="4" flood-opacity="0.3"/>
                </filter>
            </defs>
            <!-- الظل -->
            <ellipse cx="200" cy="185" rx="150" ry="12" fill="rgba(0,0,0,0.2)"/>
            <!-- جسم الشاحنة -->
            <rect x="40" y="100" width="320" height="60" rx="4" fill="url(#truckBody)" filter="url(#shadow)"/>
            <!-- الكابينة -->
            <path d="M40 100 L40 70 Q40 50 60 50 L100 50 Q115 50 120 65 L130 100 Z" fill="#1a365d"/>
            <rect x="50" y="55" width="50" height="35" rx="3" fill="#63b3ed" opacity="0.8"/>
            <!-- السطح المسطح -->
            <rect x="130" y="95" width="230" height="8" rx="2" fill="url(#metalShine)"/>
            <!-- الحمولة (معادن) -->
            <rect x="145" y="55" width="80" height="40" rx="2" fill="#d4af37"/>
            <rect x="235" y="45" width="60" height="50" rx="2" fill="#b87333"/>
            <rect x="305" y="60" width="45" height="35" rx="2" fill="#718096"/>
            <!-- العجلات -->
            <circle cx="80" cy="165" r="22" fill="#1a202c"/>
            <circle cx="80" cy="165" r="14" fill="#4a5568"/>
            <circle cx="80" cy="165" r="6" fill="#2d3748"/>
            <circle cx="180" cy="165" r="22" fill="#1a202c"/>
            <circle cx="180" cy="165" r="14" fill="#4a5568"/>
            <circle cx="220" cy="165" r="22" fill="#1a202c"/>
            <circle cx="220" cy="165" r="14" fill="#4a5568"/>
            <circle cx="320" cy="165" r="22" fill="#1a202c"/>
            <circle cx="320" cy="165" r="14" fill="#4a5568"/>
            <!-- الأضواء -->
            <circle cx="45" cy="90" r="4" fill="#f6e05e"/>
            <circle cx="45" cy="80" r="4" fill="#fc8181"/>
        </svg>`,

        // شاحنة قلاب
        tipper: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="tipperBox" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#f6ad55"/>
                    <stop offset="100%" style="stop-color:#dd6b20"/>
                </linearGradient>
            </defs>
            <ellipse cx="200" cy="185" rx="150" ry="12" fill="rgba(0,0,0,0.2)"/>
            <!-- الهيكل -->
            <rect x="40" y="110" width="140" height="50" rx="4" fill="#2d3748"/>
            <!-- الكابينة -->
            <path d="M40 110 L40 70 Q40 50 60 50 L100 50 Q115 50 120 65 L130 110 Z" fill="#1a365d"/>
            <rect x="50" y="55" width="50" height="35" rx="3" fill="#63b3ed" opacity="0.8"/>
            <!-- صندوق القلاب مرفوع -->
            <polygon points="180,30 370,30 380,110 170,110" fill="url(#tipperBox)" transform="rotate(-15 275 70)"/>
            <!-- السكراب في الصندوق -->
            <ellipse cx="270" cy="45" rx="60" ry="15" fill="#718096" transform="rotate(-15 270 45)"/>
            <circle cx="250" cy="40" r="8" fill="#a0aec0" transform="rotate(-15 250 40)"/>
            <circle cx="290" cy="35" r="6" fill="#cbd5e0" transform="rotate(-15 290 35)"/>
            <!-- العجلات -->
            <circle cx="80" cy="165" r="22" fill="#1a202c"/>
            <circle cx="80" cy="165" r="14" fill="#4a5568"/>
            <circle cx="280" cy="165" r="22" fill="#1a202c"/>
            <circle cx="280" cy="165" r="14" fill="#4a5568"/>
            <circle cx="330" cy="165" r="22" fill="#1a202c"/>
            <circle cx="330" cy="165" r="14" fill="#4a5568"/>
        </svg>`,

        // شاحنة حاويات
        container: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="containerBody" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#2563eb"/>
                    <stop offset="100%" style="stop-color:#1d4ed8"/>
                </linearGradient>
            </defs>
            <ellipse cx="200" cy="185" rx="150" ry="12" fill="rgba(0,0,0,0.2)"/>
            <!-- الهيكل -->
            <rect x="40" y="110" width="100" height="50" rx="4" fill="#2d3748"/>
            <!-- الكابينة -->
            <path d="M40 110 L40 70 Q40 50 60 50 L100 50 Q115 50 120 65 L130 110 Z" fill="#1a365d"/>
            <rect x="50" y="55" width="50" height="35" rx="3" fill="#63b3ed" opacity="0.8"/>
            <!-- الحاوية -->
            <rect x="140" y="40" width="230" height="120" rx="4" fill="url(#containerBody)"/>
            <!-- خطوط الحاوية -->
            <line x1="160" y1="40" x2="160" y2="160" stroke="#1e40af" stroke-width="3"/>
            <line x1="200" y1="40" x2="200" y2="160" stroke="#1e40af" stroke-width="3"/>
            <line x1="240" y1="40" x2="240" y2="160" stroke="#1e40af" stroke-width="3"/>
            <line x1="280" y1="40" x2="280" y2="160" stroke="#1e40af" stroke-width="3"/>
            <line x1="320" y1="40" x2="320" y2="160" stroke="#1e40af" stroke-width="3"/>
            <!-- الباب -->
            <rect x="340" y="50" width="25" height="100" fill="#1e3a8a"/>
            <!-- شعار الحاوية -->
            <text x="250" y="105" text-anchor="middle" font-size="20" font-weight="bold" fill="#fff">SHEIKHA</text>
            <!-- العجلات -->
            <circle cx="80" cy="165" r="22" fill="#1a202c"/>
            <circle cx="80" cy="165" r="14" fill="#4a5568"/>
            <circle cx="250" cy="165" r="22" fill="#1a202c"/>
            <circle cx="250" cy="165" r="14" fill="#4a5568"/>
            <circle cx="320" cy="165" r="22" fill="#1a202c"/>
            <circle cx="320" cy="165" r="14" fill="#4a5568"/>
        </svg>`,

        // سيارة مصفحة للذهب
        armored: `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="armoredBody" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#1a202c"/>
                    <stop offset="100%" style="stop-color:#0d1117"/>
                </linearGradient>
                <linearGradient id="goldShine" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#fbd38d"/>
                    <stop offset="50%" style="stop-color:#d4af37"/>
                    <stop offset="100%" style="stop-color:#b7791f"/>
                </linearGradient>
            </defs>
            <ellipse cx="200" cy="175" rx="130" ry="10" fill="rgba(0,0,0,0.2)"/>
            <!-- جسم السيارة المصفحة -->
            <rect x="60" y="70" width="280" height="90" rx="8" fill="url(#armoredBody)"/>
            <!-- خطوط التقوية -->
            <line x1="60" y1="95" x2="340" y2="95" stroke="#2d3748" stroke-width="4"/>
            <line x1="60" y1="135" x2="340" y2="135" stroke="#2d3748" stroke-width="4"/>
            <!-- النوافذ المصفحة -->
            <rect x="80" y="80" width="60" height="35" rx="3" fill="#1a365d"/>
            <rect x="160" y="80" width="80" height="35" rx="3" fill="#1a365d"/>
            <rect x="260" y="80" width="60" height="35" rx="3" fill="#1a365d"/>
            <!-- شعار الأمان -->
            <circle cx="200" cy="130" r="15" fill="url(#goldShine)"/>
            <text x="200" y="135" text-anchor="middle" font-size="14" font-weight="bold" fill="#1a202c">🔒</text>
            <!-- العجلات المعززة -->
            <circle cx="110" cy="165" r="24" fill="#1a202c"/>
            <circle cx="110" cy="165" r="16" fill="#2d3748"/>
            <circle cx="110" cy="165" r="8" fill="#1a202c"/>
            <circle cx="290" cy="165" r="24" fill="#1a202c"/>
            <circle cx="290" cy="165" r="16" fill="#2d3748"/>
            <circle cx="290" cy="165" r="8" fill="#1a202c"/>
            <!-- GOLD -->
            <text x="200" y="180" text-anchor="middle" font-size="10" fill="#d4af37" font-weight="bold">GOLD TRANSPORT</text>
        </svg>`
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // ⚙️ المعدات — Equipment
    // ═══════════════════════════════════════════════════════════════════════════
    
    equipment: {
        // رافعة شوكية
        forklift: `<svg viewBox="0 0 300 250" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="forkBody" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#f6ad55"/>
                    <stop offset="100%" style="stop-color:#dd6b20"/>
                </linearGradient>
            </defs>
            <ellipse cx="150" cy="235" rx="100" ry="10" fill="rgba(0,0,0,0.2)"/>
            <!-- جسم الرافعة -->
            <rect x="80" y="120" width="140" height="100" rx="8" fill="url(#forkBody)"/>
            <!-- الكابينة -->
            <rect x="130" y="80" width="80" height="50" rx="4" fill="#2d3748"/>
            <rect x="140" y="85" width="60" height="35" rx="2" fill="#63b3ed" opacity="0.7"/>
            <!-- الإطار العمودي -->
            <rect x="50" y="30" width="20" height="190" rx="2" fill="#4a5568"/>
            <rect x="75" y="30" width="10" height="190" rx="1" fill="#2d3748"/>
            <!-- الشوكات -->
            <rect x="30" y="200" width="80" height="8" rx="2" fill="#718096"/>
            <rect x="30" y="185" width="80" height="8" rx="2" fill="#718096"/>
            <!-- الحمولة -->
            <rect x="35" y="120" width="70" height="60" rx="2" fill="#d4af37"/>
            <text x="70" y="155" text-anchor="middle" font-size="12" fill="#1a202c" font-weight="bold">Cu</text>
            <!-- العجلات -->
            <circle cx="120" cy="225" r="18" fill="#1a202c"/>
            <circle cx="120" cy="225" r="10" fill="#4a5568"/>
            <circle cx="200" cy="225" r="18" fill="#1a202c"/>
            <circle cx="200" cy="225" r="10" fill="#4a5568"/>
        </svg>`,

        // مكبس هيدروليكي
        hydraulicPress: `<svg viewBox="0 0 300 250" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="pressBody" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#3182ce"/>
                    <stop offset="100%" style="stop-color:#2c5282"/>
                </linearGradient>
            </defs>
            <ellipse cx="150" cy="240" rx="80" ry="8" fill="rgba(0,0,0,0.2)"/>
            <!-- القاعدة -->
            <rect x="60" y="200" width="180" height="35" rx="4" fill="#2d3748"/>
            <!-- الإطار -->
            <rect x="70" y="30" width="25" height="175" rx="2" fill="url(#pressBody)"/>
            <rect x="205" y="30" width="25" height="175" rx="2" fill="url(#pressBody)"/>
            <rect x="70" y="25" width="160" height="20" rx="3" fill="#1a365d"/>
            <!-- المكبس -->
            <rect x="95" y="50" width="110" height="30" rx="4" fill="#c53030"/>
            <rect x="140" y="75" width="20" height="60" rx="2" fill="#718096"/>
            <!-- الطاولة -->
            <rect x="90" y="160" width="120" height="15" rx="2" fill="#4a5568"/>
            <!-- السكراب المضغوط -->
            <rect x="110" y="140" width="80" height="20" rx="1" fill="#a0aec0"/>
            <!-- لوحة التحكم -->
            <rect x="240" y="80" width="40" height="80" rx="4" fill="#2d3748"/>
            <circle cx="260" cy="100" r="8" fill="#48bb78"/>
            <circle cx="260" cy="125" r="8" fill="#f6e05e"/>
            <circle cx="260" cy="150" r="8" fill="#fc8181"/>
        </svg>`,

        // فرن صهر
        smelter: `<svg viewBox="0 0 300 250" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="furnaceBody" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#c53030"/>
                    <stop offset="50%" style="stop-color:#9b2c2c"/>
                    <stop offset="100%" style="stop-color:#742a2a"/>
                </linearGradient>
                <linearGradient id="moltenMetal" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#fbd38d"/>
                    <stop offset="50%" style="stop-color:#f6ad55"/>
                    <stop offset="100%" style="stop-color:#ed8936"/>
                </linearGradient>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="blur"/>
                    <feMerge>
                        <feMergeNode in="blur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            <ellipse cx="150" cy="240" rx="90" ry="8" fill="rgba(0,0,0,0.2)"/>
            <!-- جسم الفرن -->
            <path d="M70 230 L70 80 Q70 50 100 40 L200 40 Q230 50 230 80 L230 230 Z" fill="url(#furnaceBody)"/>
            <!-- فتحة الفرن -->
            <ellipse cx="150" cy="60" rx="50" ry="15" fill="#1a202c"/>
            <!-- اللهب -->
            <ellipse cx="150" cy="60" rx="35" ry="10" fill="url(#moltenMetal)" filter="url(#glow)"/>
            <!-- نافذة المراقبة -->
            <rect x="125" y="100" width="50" height="40" rx="4" fill="#1a202c"/>
            <rect x="130" y="105" width="40" height="30" rx="2" fill="#f6ad55" filter="url(#glow)"/>
            <!-- مؤشرات الحرارة -->
            <rect x="240" y="80" width="30" height="100" rx="4" fill="#2d3748"/>
            <text x="255" y="110" text-anchor="middle" font-size="10" fill="#fc8181" font-weight="bold">1450°</text>
            <rect x="248" y="120" width="14" height="50" rx="2" fill="#1a202c"/>
            <rect x="250" y="130" width="10" height="38" rx="1" fill="url(#moltenMetal)"/>
            <!-- مخرج المعدن المصهور -->
            <path d="M180 210 Q200 220 220 230" stroke="url(#moltenMetal)" stroke-width="8" fill="none"/>
            <ellipse cx="230" cy="235" rx="15" ry="8" fill="url(#moltenMetal)" filter="url(#glow)"/>
        </svg>`
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // 🔩 المعادن — Metals
    // ═══════════════════════════════════════════════════════════════════════════
    
    metals: {
        // كومة سكراب حديد
        ironScrap: `<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="ironGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#718096"/>
                    <stop offset="50%" style="stop-color:#4a5568"/>
                    <stop offset="100%" style="stop-color:#2d3748"/>
                </linearGradient>
            </defs>
            <ellipse cx="150" cy="185" rx="120" ry="15" fill="rgba(0,0,0,0.2)"/>
            <!-- قطع السكراب -->
            <rect x="60" y="140" width="50" height="20" rx="2" fill="url(#ironGrad)" transform="rotate(-10 85 150)"/>
            <rect x="100" y="120" width="60" height="25" rx="2" fill="url(#ironGrad)" transform="rotate(5 130 132)"/>
            <rect x="150" y="135" width="45" height="18" rx="2" fill="url(#ironGrad)" transform="rotate(-8 172 144)"/>
            <rect x="180" y="145" width="55" height="22" rx="2" fill="url(#ironGrad)" transform="rotate(12 207 156)"/>
            <!-- الطبقة الثانية -->
            <rect x="80" y="100" width="40" height="30" rx="2" fill="#4a5568" transform="rotate(-5 100 115)"/>
            <rect x="130" y="95" width="50" height="28" rx="2" fill="#718096" transform="rotate(8 155 109)"/>
            <rect x="170" y="105" width="35" height="25" rx="2" fill="#4a5568" transform="rotate(-3 187 117)"/>
            <!-- الطبقة العليا -->
            <rect x="100" y="70" width="35" height="25" rx="2" fill="#a0aec0" transform="rotate(15 117 82)"/>
            <rect x="145" y="65" width="40" height="30" rx="2" fill="#718096" transform="rotate(-10 165 80)"/>
            <!-- أنابيب -->
            <ellipse cx="90" cy="160" rx="15" ry="8" fill="#4a5568"/>
            <ellipse cx="90" cy="160" rx="10" ry="5" fill="#2d3748"/>
            <ellipse cx="200" cy="130" rx="12" ry="6" fill="#4a5568"/>
        </svg>`,

        // سبائك نحاس
        copperBars: `<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="copperGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#ed8936"/>
                    <stop offset="50%" style="stop-color:#b87333"/>
                    <stop offset="100%" style="stop-color:#9c4221"/>
                </linearGradient>
            </defs>
            <ellipse cx="150" cy="185" rx="100" ry="12" fill="rgba(0,0,0,0.2)"/>
            <!-- الصف السفلي -->
            <rect x="60" y="150" width="180" height="25" rx="3" fill="url(#copperGrad)"/>
            <line x1="100" y1="150" x2="100" y2="175" stroke="#9c4221" stroke-width="2"/>
            <line x1="150" y1="150" x2="150" y2="175" stroke="#9c4221" stroke-width="2"/>
            <line x1="200" y1="150" x2="200" y2="175" stroke="#9c4221" stroke-width="2"/>
            <!-- الصف الأوسط -->
            <rect x="70" y="120" width="160" height="25" rx="3" fill="url(#copperGrad)"/>
            <line x1="110" y1="120" x2="110" y2="145" stroke="#9c4221" stroke-width="2"/>
            <line x1="150" y1="120" x2="150" y2="145" stroke="#9c4221" stroke-width="2"/>
            <line x1="190" y1="120" x2="190" y2="145" stroke="#9c4221" stroke-width="2"/>
            <!-- الصف العلوي -->
            <rect x="80" y="90" width="140" height="25" rx="3" fill="url(#copperGrad)"/>
            <line x1="120" y1="90" x2="120" y2="115" stroke="#9c4221" stroke-width="2"/>
            <line x1="150" y1="90" x2="150" y2="115" stroke="#9c4221" stroke-width="2"/>
            <line x1="180" y1="90" x2="180" y2="115" stroke="#9c4221" stroke-width="2"/>
            <!-- لمعان -->
            <rect x="85" y="95" width="30" height="3" rx="1" fill="#fbd38d" opacity="0.6"/>
            <rect x="130" y="125" width="25" height="3" rx="1" fill="#fbd38d" opacity="0.6"/>
        </svg>`,

        // سبائك ذهب
        goldBars: `<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#fbd38d"/>
                    <stop offset="30%" style="stop-color:#d4af37"/>
                    <stop offset="70%" style="stop-color:#b7791f"/>
                    <stop offset="100%" style="stop-color:#975a16"/>
                </linearGradient>
                <filter id="goldGlow">
                    <feGaussianBlur stdDeviation="2" result="blur"/>
                    <feMerge>
                        <feMergeNode in="blur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            <ellipse cx="150" cy="180" rx="90" ry="10" fill="rgba(212,175,55,0.3)"/>
            <!-- سبيكة 1 -->
            <polygon points="60,170 90,170 100,140 50,140" fill="url(#goldGrad)" filter="url(#goldGlow)"/>
            <polygon points="50,140 100,140 90,130 60,130" fill="#fbd38d"/>
            <text x="75" y="158" text-anchor="middle" font-size="8" fill="#975a16" font-weight="bold">999.9</text>
            <!-- سبيكة 2 -->
            <polygon points="110,170 140,170 150,140 100,140" fill="url(#goldGrad)" filter="url(#goldGlow)"/>
            <polygon points="100,140 150,140 140,130 110,130" fill="#fbd38d"/>
            <text x="125" y="158" text-anchor="middle" font-size="8" fill="#975a16" font-weight="bold">999.9</text>
            <!-- سبيكة 3 -->
            <polygon points="160,170 190,170 200,140 150,140" fill="url(#goldGrad)" filter="url(#goldGlow)"/>
            <polygon points="150,140 200,140 190,130 160,130" fill="#fbd38d"/>
            <text x="175" y="158" text-anchor="middle" font-size="8" fill="#975a16" font-weight="bold">999.9</text>
            <!-- سبيكة 4 -->
            <polygon points="210,170 240,170 250,140 200,140" fill="url(#goldGrad)" filter="url(#goldGlow)"/>
            <polygon points="200,140 250,140 240,130 210,130" fill="#fbd38d"/>
            <text x="225" y="158" text-anchor="middle" font-size="8" fill="#975a16" font-weight="bold">999.9</text>
            <!-- الصف العلوي -->
            <polygon points="85,125 115,125 125,95 75,95" fill="url(#goldGrad)" filter="url(#goldGlow)"/>
            <polygon points="75,95 125,95 115,85 85,85" fill="#fbd38d"/>
            <polygon points="135,125 165,125 175,95 125,95" fill="url(#goldGrad)" filter="url(#goldGlow)"/>
            <polygon points="125,95 175,95 165,85 135,85" fill="#fbd38d"/>
            <polygon points="185,125 215,125 225,95 175,95" fill="url(#goldGrad)" filter="url(#goldGlow)"/>
            <polygon points="175,95 225,95 215,85 185,85" fill="#fbd38d"/>
        </svg>`,

        // ألمنيوم
        aluminum: `<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="aluGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#e2e8f0"/>
                    <stop offset="50%" style="stop-color:#a0aec0"/>
                    <stop offset="100%" style="stop-color:#718096"/>
                </linearGradient>
            </defs>
            <ellipse cx="150" cy="185" rx="100" ry="12" fill="rgba(0,0,0,0.15)"/>
            <!-- لفات ألمنيوم -->
            <ellipse cx="100" cy="140" rx="35" ry="40" fill="url(#aluGrad)"/>
            <ellipse cx="100" cy="140" rx="15" ry="20" fill="#4a5568"/>
            <ellipse cx="100" cy="140" rx="8" ry="10" fill="#2d3748"/>
            <!-- لفة 2 -->
            <ellipse cx="180" cy="130" rx="40" ry="45" fill="url(#aluGrad)"/>
            <ellipse cx="180" cy="130" rx="18" ry="22" fill="#4a5568"/>
            <ellipse cx="180" cy="130" rx="10" ry="12" fill="#2d3748"/>
            <!-- صفائح -->
            <rect x="220" y="150" width="60" height="4" rx="1" fill="#cbd5e0"/>
            <rect x="218" y="158" width="60" height="4" rx="1" fill="#a0aec0"/>
            <rect x="216" y="166" width="60" height="4" rx="1" fill="#718096"/>
            <!-- خطوط اللمعان -->
            <path d="M75 100 Q100 90 125 100" stroke="#fff" stroke-width="2" fill="none" opacity="0.5"/>
            <path d="M145 85 Q180 75 215 85" stroke="#fff" stroke-width="2" fill="none" opacity="0.5"/>
        </svg>`
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // 📦 الحاويات — Containers
    // ═══════════════════════════════════════════════════════════════════════════
    
    containers: {
        shipping20ft: `<svg viewBox="0 0 300 180" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="cont20" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#2563eb"/>
                    <stop offset="100%" style="stop-color:#1d4ed8"/>
                </linearGradient>
            </defs>
            <rect x="20" y="30" width="260" height="130" rx="4" fill="url(#cont20)"/>
            <!-- خطوط عمودية -->
            <line x1="50" y1="30" x2="50" y2="160" stroke="#1e40af" stroke-width="3"/>
            <line x1="100" y1="30" x2="100" y2="160" stroke="#1e40af" stroke-width="3"/>
            <line x1="150" y1="30" x2="150" y2="160" stroke="#1e40af" stroke-width="3"/>
            <line x1="200" y1="30" x2="200" y2="160" stroke="#1e40af" stroke-width="3"/>
            <line x1="250" y1="30" x2="250" y2="160" stroke="#1e40af" stroke-width="3"/>
            <!-- الباب -->
            <rect x="255" y="40" width="20" height="110" fill="#1e3a8a"/>
            <!-- شعار -->
            <text x="140" y="100" text-anchor="middle" font-size="18" font-weight="bold" fill="#fff">SHEIKHA</text>
            <text x="140" y="120" text-anchor="middle" font-size="12" fill="#93c5fd">20' STANDARD</text>
        </svg>`,

        shipping40ft: `<svg viewBox="0 0 400 180" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="cont40" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#059669"/>
                    <stop offset="100%" style="stop-color:#047857"/>
                </linearGradient>
            </defs>
            <rect x="20" y="30" width="360" height="130" rx="4" fill="url(#cont40)"/>
            <!-- خطوط -->
            <line x1="60" y1="30" x2="60" y2="160" stroke="#065f46" stroke-width="3"/>
            <line x1="120" y1="30" x2="120" y2="160" stroke="#065f46" stroke-width="3"/>
            <line x1="180" y1="30" x2="180" y2="160" stroke="#065f46" stroke-width="3"/>
            <line x1="240" y1="30" x2="240" y2="160" stroke="#065f46" stroke-width="3"/>
            <line x1="300" y1="30" x2="300" y2="160" stroke="#065f46" stroke-width="3"/>
            <line x1="350" y1="30" x2="350" y2="160" stroke="#065f46" stroke-width="3"/>
            <!-- الباب -->
            <rect x="355" y="40" width="20" height="110" fill="#064e3b"/>
            <!-- شعار -->
            <text x="190" y="100" text-anchor="middle" font-size="20" font-weight="bold" fill="#fff">SHEIKHA</text>
            <text x="190" y="120" text-anchor="middle" font-size="14" fill="#a7f3d0">40' HIGH CUBE</text>
        </svg>`
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // Helper Functions
    // ═══════════════════════════════════════════════════════════════════════════
    
    /**
     * إدراج رسم SVG في عنصر HTML
     * @param {string} category - الفئة (trucks, equipment, metals, containers)
     * @param {string} type - النوع
     * @param {string} targetId - معرف العنصر الهدف
     */
    render(category, type, targetId) {
        const target = document.getElementById(targetId);
        if (!target) return;
        
        const svg = this[category]?.[type];
        if (svg) {
            target.innerHTML = svg;
        }
    },

    /**
     * الحصول على SVG كنص
     */
    getSVG(category, type) {
        return this[category]?.[type] || null;
    },

    /**
     * عرض جميع الرسومات في فئة معينة
     */
    renderCategory(category, containerId) {
        const container = document.getElementById(containerId);
        if (!container || !this[category]) return;

        let html = '';
        for (const [type, svg] of Object.entries(this[category])) {
            html += `<div class="visual-item" data-type="${type}">
                <div class="visual-svg">${svg}</div>
                <span class="visual-label">${type}</span>
            </div>`;
        }
        container.innerHTML = html;
    }
};

// تصدير للاستخدام
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SheikhaVisuals;
}
