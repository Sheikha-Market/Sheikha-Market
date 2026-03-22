#!/usr/bin/env node
'use strict';

/**
 * الإطار الفقهي الإسلامي الشامل للمعاملات
 * رقمنة أحكام التعامل مع كل فئة بالكتاب والسنة
 *
 * "الدين عند الله الإسلام" (آل عمران:19)
 * الإسلام دين كامل يُنظّم علاقة الإنسان بربه وبغيره
 */

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const REPORTS_DIR = path.join(ROOT_DIR, 'reports', 'operations');

function ensureDir(d) {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

function sha256File(p) {
    return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
}

/**
 * الأساس الكلي: الإسلام هو الدين الحق الكامل
 */
function buildFoundation() {
    return {
        id: 'FOUND-ISLAM-001',
        title: 'الأصل الكلي — الإسلام هو الدين الحق',
        primaryDeclaration: 'الدين عند الله الإسلام (آل عمران:19)',
        completeness: 'اليوم أكملت لكم دينكم وأتممت عليكم نعمتي ورضيت لكم الإسلام ديناً (المائدة:3)',
        universality: 'وما أرسلناك إلا رحمة للعالمين (الأنبياء:107)',
        justice: 'إن الله يأمر بالعدل والإحسان وإيتاء ذي القربى وينهى عن الفحشاء والمنكر والبغي (النحل:90)',
        equality: 'يا أيها الناس إنا خلقناكم من ذكر وأنثى وجعلناكم شعوباً وقبائل لتعارفوا إن أكرمكم عند الله أتقاكم (الحجرات:13)',
        principle: 'الأصل في المعاملات الحِل، والأصل في الإنسان الكرامة، والأصل في التعامل العدل والإحسان',
        maqasidAlShareah: [
            { id: 'M1', name: 'حفظ الدين', daleel: 'لا إكراه في الدين (البقرة:256)' },
            { id: 'M2', name: 'حفظ النفس', daleel: 'ولا تقتلوا النفس التي حرم الله إلا بالحق (الأنعام:151)' },
            { id: 'M3', name: 'حفظ العقل', daleel: 'لموضع سوط أحدهم في الجنة خير من الدنيا وما فيها' },
            { id: 'M4', name: 'حفظ النسل', daleel: 'سورة النور وسورة النساء' },
            { id: 'M5', name: 'حفظ المال', daleel: 'لا يحل مال امرئ مسلم إلا بطيب نفسه (أحمد)' },
        ],
    };
}

/**
 * الفئة الأولى: المسلم
 */
function buildMuslimCategory() {
    return {
        id: 'CAT-MUSLIM-001',
        arabicName: 'المسلم',
        definition: 'من شهد أن لا إله إلا الله وأن محمداً رسول الله وأقام الصلاة وآتى الزكاة',
        hadithDef: 'المسلم من سلم المسلمون من لسانه ويده (البخاري)',

        inIslamicState: {
            status: 'مواطن كامل الحقوق — له ما للمسلمين وعليه ما عليهم',
            rights: [
                'الحق في الحماية والأمن — النفس والمال والعرض',
                'الحق في العدالة والقضاء',
                'الحق في العمل والتكسب الحلال',
                'الحق في الزواج والأسرة',
                'الزكاة والكفالة الاجتماعية الإسلامية',
            ],
            duties: [
                'إقامة الصلاة وأداء الزكاة',
                'الجهاد بالنفس والمال عند الاستطاعة والضرورة',
                'طاعة ولي الأمر في المعروف',
                'الأمر بالمعروف والنهي عن المنكر',
            ],
            transactions: {
                permitted: ['البيع والشراء', 'الإجارة', 'الشركة', 'المضاربة (المشروعة)', 'الهبة والصدقة', 'النكاح والمهر'],
                prohibited: ['الربا بجميع صوره', 'الغرر والجهالة الفاحشة', 'الغش والتدليس', 'الاحتكار والنجش'],
                references: ['لا ضرر ولا ضرار', 'البيعان بالخيار ما لم يتفرقا (البخاري)', 'من غشنا فليس منا (مسلم)'],
            },
        },

        inNonIslamicState: {
            status: 'مسلم محافظ على دينه — مقيّد بعهود الإقامة القانونية',
            obligations: [
                'الوفاء بعهود الإقامة والتأشيرة (أوفوا بالعقود — المائدة:1)',
                'عدم الخيانة لمن أمّنه وأعطاه إقامة',
                'الحفاظ على صورة الإسلام بحسن الخُلُق والتعامل',
                'إظهار الشعائر بالقدر المتاح قانونياً',
            ],
            transactions: {
                note: 'يُطبّق أحكام الإسلام في معاملاته ما استطاع، ويتجنب الحرام',
                permittedWithNonMuslim: ['البيع والشراء الحلال', 'الإجارة والعمل', 'التعامل التجاري العادل'],
                prohibited: ['الربا حتى مع غير المسلم في الأصح', 'أكل أموالهم بالباطل'],
            },
            references: [
                'يا أيها الذين آمنوا أوفوا بالعقود (المائدة:1)',
                'وإن استنصروكم في الدين فعليكم النصر إلا على قوم بينكم وبينهم ميثاق (الأنفال:72)',
            ],
        },
    };
}

/**
 * الفئة الثانية: أهل الكتاب (اليهود والنصارى)
 */
function buildAhlAlKitabCategory() {
    return {
        id: 'CAT-AHL-KITAB-001',
        arabicName: 'أهل الكتاب',
        definition: 'اليهود والنصارى ومن في حكمهم — لهم كتاب منزّل وإن نسخه الإسلام',
        quranicRef: 'ولتجدن أقربهم مودة للذين آمنوا الذين قالوا إنا نصارى (المائدة:82)',

        inIslamicState: {
            status: 'أهل ذمة — عهد الحماية الإسلامية مقابل الجزية وعدم الاعتداء',
            dhimmaDefinition: 'عهد مؤبد بين الدولة الإسلامية وغير المسلمين المقيمين — حفظ النفس والمال والدين',
            rights: [
                'حماية النفس والمال والعرض',
                'حرية ممارسة شعائرهم في أماكنهم',
                'الاحتكام لقضائهم الداخلي في أحوالهم الشخصية',
                'المساواة في العدل المدني',
                'الرعاية الاجتماعية والطبية من بيت المال',
            ],
            duties: ['الجزية أو ما يعادلها', 'عدم إظهار المنكر علناً', 'عدم مس أمن الدولة الإسلامية'],
            hadithRef: 'من آذى ذمياً فأنا خصمه (أبو داود — حسنه الألباني)',
            transactions: {
                foodAllowed: 'ذبائح أهل الكتاب حلال للمسلمين — وطعامكم حل لهم (المائدة:5)',
                marriageNote: 'يجوز للمسلم الزواج من الكتابية المحصنة (المائدة:5) — لا عكسه',
                commercialDealing: 'الجواز التام في البيع والشراء والإجارة والشركة إذا خلت من الحرام',
                prohibited: ['إقراضهم بالربا', 'الغش والظلم', 'مناقضة الذمة والأمان'],
            },
        },

        inNonIslamicState: {
            status: 'مواطنون في دولتهم — علاقة المسلم معهم مبنية على البر والقسط',
            quranicRef: 'لا ينهاكم الله عن الذين لم يقاتلوكم في الدين ولم يخرجوكم من دياركم أن تبروهم وتقسطوا إليهم إن الله يحب المقسطين (الممتحنة:8)',
            dealings: [
                'التعامل التجاري الحلال جائز',
                'الصداقة الإنسانية المحدودة جائزة',
                'الدعوة إلى الإسلام بالحكمة والموعظة الحسنة واجبة',
                'عدم الموالاة السياسية ضد المسلمين',
            ],
        },
    };
}

/**
 * الفئة الثالثة: المشركون (غير الكتابيين)
 */
function buildMushrikCategory() {
    return {
        id: 'CAT-MUSHRIK-001',
        arabicName: 'المشركون',
        definition: 'من يُشرك بالله — لا يؤمن بكتاب منزّل — كمشركي العرب تاريخياً والوثنيين',
        principle: 'الأصل الدفاع لا الهجوم — الجهاد لرفع الظلم لا لإكراه أحد على الإيمان',

        quranicPrinciples: [
            'لا إكراه في الدين قد تبين الرشد من الغي (البقرة:256)',
            'فمن شاء فليؤمن ومن شاء فليكفر (الكهف:29)',
            'وإن أحد من المشركين استجارك فأجره حتى يسمع كلام الله ثم أبلغه مأمنه (التوبة:6)',
            'ادع إلى سبيل ربك بالحكمة والموعظة الحسنة (النحل:125)',
        ],

        inIslamicState: {
            defaultRule: 'تُعرض عليهم الإسلام أو الجزية في غير جزيرة العرب وفق الفقه الكلاسيكي',
            contemporaryApplication: 'في السياق الحديث: حق الإقامة والسياحة والتعامل التجاري بموجب التأشيرة والقوانين السارية',
            transactions: {
                note: 'لا مانع من التعامل التجاري الحلال — البيع والشراء والإجارة جائزة',
                prohibited: ['مساعدتهم على أذى المسلمين', 'بيع أسلحة لحرب متوقعة ضد المسلمين'],
            },
        },

        inNonIslamicState: {
            dealings: 'التعامل الإنساني والتجاري الحلال جائز بحسب البر والقسط',
            dawaObligation: 'الدعوة بالحكمة واجب كفائي',
            justiceRule: 'لا إكراه ولا تضييق — العدل مع الجميع',
        },
    };
}

/**
 * الفئة الرابعة: المعاهَد
 */
function buildMuahadCategory() {
    return {
        id: 'CAT-MUAHAD-001',
        arabicName: 'المعاهَد',
        definition: 'من بينه وبين المسلمين عهد — سواء أكان كتابياً أم غير كتابي',
        hadithRef: 'من قتل معاهداً لم يرح رائحة الجنة وإن ريحها ليوجد من مسيرة أربعين عاماً (البخاري)',

        rights: [
            'حفظ النفس والمال والعرض طوال مدة العهد',
            'حق المرور والتجارة',
            'الحماية من أي اعتداء مسلم عليه — الحديث صريح',
            'الوفاء الكامل بالعهد',
        ],

        obligations: [
            'الالتزام ببنود المعاهدة',
            'عدم الإضرار بالمسلمين',
            'عدم مساعدة الأعداء',
        ],

        transactions: {
            commercial: 'التعامل التجاري الحلال جائز ومستحب لتعزيز العهد',
            political: 'السلم التام وإبعاد الفتنة',
        },

        modernEquivalent: 'المعاهدات الدولية — مواطنو الدول التي لها معاهدات مع الدول الإسلامية',

        references: [
            'وإن جنحوا للسلم فاجنح لها وتوكل على الله (الأنفال:61)',
            'أوفوا بالعقود (المائدة:1)',
        ],
    };
}

/**
 * الفئة الخامسة: الحربي
 */
function buildHarbiCategory() {
    return {
        id: 'CAT-HARBI-001',
        arabicName: 'الحربي',
        definition: 'من لا عهد بينه وبين المسلمين وهو في حال حرب أو عداء فعلي — ليس مجرد اختلاف الدين',

        importantClarification: 'الحربي ليس كل كافر — بل من يُعادي المسلمين فعلاً أو يشنّ عليهم حرباً — الأصل السلم ليس الحرب',

        quranicBasis: [
            'وقاتلوا في سبيل الله الذين يقاتلونكم ولا تعتدوا إن الله لا يحب المعتدين (البقرة:190)',
            'وإن جنحوا للسلم فاجنح لها (الأنفال:61)',
            'فإذا انسلخ الأشهر الحرم فاقتلوا المشركين — في سياق ناقضي العهد (التوبة:5)',
        ],

        jihad: {
            type: 'دفاعي أولاً — رفع الظلم وحماية المسلمين والمستضعفين',
            conditions: ['وجود الظلم الفعلي أو قطع طريق الدعوة', 'إذن ولي الأمر الشرعي', 'استنفاد الوسائل السلمية'],
            prohibited: ['الغدر', 'قتل المدنيين والأطفال والنساء والشيوخ', 'تخريب الأرض وقطع الأشجار', 'التمثيل بالقتلى'],
            hadithRules: [
                'لا تقتلوا شيخاً فانياً ولا طفلاً صغيراً ولا امرأة (أبو داود)',
                'لا تغلوا ولا تغدروا ولا تمثلوا ولا تقتلوا وليداً (مسلم)',
            ],
        },

        transactions: {
            note: 'في حال الحرب الفعلية تتوقف المعاملات التجارية المعتادة',
            permittedInHudna: 'في الهدنة والسلم المؤقت — التعامل التجاري جائز',
        },

        peacePreference: 'السلم أفضل دوماً — والحرب استثناء مؤقت لرفع الظلم',
    };
}

/**
 * الفئة السادسة: المستأمَن (حامل الأمان أو الفيزا)
 */
function buildMustaamanCategory() {
    return {
        id: 'CAT-MUSTAAMAN-001',
        arabicName: 'المستأمَن',
        definition: 'من دخل دار الإسلام بأمان — الزائر والسائح وحامل التأشيرة',

        quranicBasis: 'وإن أحد من المشركين استجارك فأجره حتى يسمع كلام الله ثم أبلغه مأمنه ذلك بأنهم قوم لا يعلمون (التوبة:6)',

        rights: [
            'حفظ النفس والمال والعرض طوال مدة الأمان',
            'حرية ممارسة شعائره في نطاق الخصوصية',
            'حق التقاضي أمام القضاء الإسلامي إن ظُلم',
            'حق العودة إلى وطنه بسلام',
        ],

        obligations: [
            'الالتزام بشروط الأمان (مدة الإقامة والغرض)',
            'عدم التجسس أو الإضرار بالمسلمين',
            'احترام القوانين العامة للدولة',
        ],

        transactions: {
            commercial: 'التعامل التجاري الحلال جائز ومحفوظ بالعهد',
            contractEnforcement: 'العقود المبرمة معه ملزمة شرعاً بموجب الأمان',
        },

        modernEquivalent: 'السياح والزوار وحاملو التأشيرات في أي دولة — المبدأ واحد والأمان مصون',
        scholarNote: 'الأمان يسري حتى على من أعطي بالإشارة أو الوسيلة الضمنية — المسلمون تتكافأ دماؤهم ويسعى بذمتهم أدناهم',
    };
}

/**
 * الفئة السابعة: في الرقاب (المعاصرة — مكافحة الاتجار بالبشر)
 */
function buildFiAlRiqabCategory() {
    return {
        id: 'CAT-FI-RIQAB-001',
        arabicName: 'في الرقاب (المعاصرة)',
        classicalDefinition: 'رقاب: الرقيق والأسرى — أحد مصارف الزكاة (التوبة:60)',
        modernApplication: 'مكافحة الاتجار بالبشر والرق المعاصر وتحرير المستعبَدين وضحايا الاستغلال',

        quranicBasis: [
            'إنما الصدقات للفقراء والمساكين والعاملين عليها والمؤلفة قلوبهم وفي الرقاب والغارمين وفي سبيل الله وابن السبيل (التوبة:60)',
            'فك رقبة (البلد:13)',
        ],

        islamicPriority: 'تحرير الرقاب كان أحد أعلى الأعمال فضلاً في الإسلام — الإسلام سعى لإلغاء الرق تدريجياً بآليات شرعية',

        modernShariaApplication: [
            'صرف الزكاة في دعم ضحايا الاتجار بالبشر وفك أسرهم',
            'تجريم الاتجار بالبشر جريمة كبرى — كبيرة من الكبائر',
            'واجب الدولة الإسلامية: إنقاذ المستعبَدين وتعويضهم وإعادة تأهيلهم',
            'دور منظمات المجتمع المدني الإسلامي في الإنقاذ والمناصرة',
        ],

        forbiddenUseCases: [
            'استخدام أي مبرر ديني لتسويغ الاتجار بالبشر — محرم قطعاً',
            'استعباد الناس العصري بأي صورة',
        ],

        noHarm: {
            principle: 'لا ضرر ولا ضرار',
            antiTrafficking: true,
        },
    };
}

/**
 * الفئة الثامنة: مؤلفة القلوب
 */
function buildMuallafaQulubuhumCategory() {
    return {
        id: 'CAT-MUALLAFA-001',
        arabicName: 'مؤلفة القلوب',
        definition: 'من يُعطَون من الزكاة تأليفاً لقلوبهم وتثبيتاً على الإسلام أو كفّاً لشرهم أو رجاء نفعهم',
        quranicRef: 'والمؤلفة قلوبهم (التوبة:60)',

        categories: [
            { type: 'حديث العهد بالإسلام', purpose: 'تثبيت قلبه وتعميق إيمانه' },
            { type: 'ذو شرف في قومه يُرجى بإسلامه إسلام غيره', purpose: 'توسيع دائرة الإسلام' },
            { type: 'الكافر المكفوف شره عن المسلمين', purpose: 'درء الفتنة والأذى' },
        ],

        transactions: {
            note: 'التعامل معهم بالإحسان والسخاء والبر — شأن الدعوة بالحكمة',
        },

        dawaGuidance: 'الدعوة إلى الله بالحكمة والموعظة الحسنة وادع إلى ربك إنك لعلى هدى مستقيم',
    };
}

/**
 * التعامل بين الدول
 */
function buildInterStateDealing() {
    return {
        id: 'INTERSTATE-FRAMEWORK-001',
        title: 'إطار العلاقات بين الدول — الإسلامية وغير الإسلامية',

        islamicStateToIslamicState: {
            title: 'الدولة الإسلامية مع الدولة الإسلامية',
            principles: [
                'الأخوة الإسلامية — إنما المؤمنون إخوة (الحجرات:10)',
                'التعاون على البر والتقوى (المائدة:2)',
                'الشورى والتناصح',
                'وحدة الأمة مع التعدد السياسي المشروع',
            ],
            transactions: [
                { area: 'التجارة', rule: 'حرية التبادل التجاري الإسلامي مع منع الربا والغرر والاحتكار' },
                { area: 'الأمن', rule: 'التعاون الأمني ضد الأعداء المشتركين' },
                { area: 'الزكاة والإنفاق', rule: 'دعم الدول الإسلامية الأفقر من خلال التكافل' },
                { area: 'التحالفات', rule: 'جائزة عند الضرورة مع الدائمة لمصلحة الأمة' },
                { area: 'الخلافات', rule: 'التحكيم القضائي الإسلامي أو مجلس الشورى — لا الاستعانة بالأعداء' },
            ],
            hadithRef: 'المسلم أخو المسلم لا يظلمه ولا يخذله ولا يحقره (مسلم)',
        },

        islamicStateToNonIslamicState: {
            title: 'الدولة الإسلامية مع الدولة غير الإسلامية',
            defaultPrinciple: 'السلم الأصل — الحرب استثناء مشروط بالضرورة',
            types: [
                {
                    type: 'دولة معاهِدة (سلام سارٍ)',
                    rule: 'الوفاء الكامل بالمعاهدة — أوفوا بالعقود',
                    transactions: 'التعاون الدبلوماسي والتجاري الحلال كامل',
                },
                {
                    type: 'دولة محايدة (لا حرب ولا معاهدة رسمية)',
                    rule: 'التعامل بالبر والقسط — لا ينهاكم الله عن الذين لم يقاتلوكم (الممتحنة:8)',
                    transactions: 'التجارة جائزة، الدعوة بالحكمة واجبة، التحالف السياسي مشروط',
                },
                {
                    type: 'دولة معادية (حرب فعلية)',
                    rule: 'الدفاع المشروع — وقاتلوا في سبيل الله الذين يقاتلونكم (البقرة:190)',
                    transactions: 'توقف التعامل الكامل في حال الحرب الفعلية',
                    note: 'السعي للسلم دائماً — وإن جنحوا للسلم فاجنح لها (الأنفال:61)',
                },
            ],

            diplomaticPrinciples: [
                'احترام سيادة الدول وعدم التدخل بالشؤون الداخلية بدون سبب',
                'المعاملة بالمثل في المعاملات الدبلوماسية',
                'حماية الأقليات المسلمة في الدول غير الإسلامية بالطرق الدبلوماسية',
                'الدعوة إلى الإسلام عبر القنوات المتاحة — حكمة وموعظة حسنة',
            ],

            referencesCore: [
                'لا ينهاكم الله عن الذين لم يقاتلوكم في الدين ولم يخرجوكم من دياركم أن تبروهم وتقسطوا إليهم (الممتحنة:8)',
                'وإن جنحوا للسلم فاجنح لها وتوكل على الله (الأنفال:61)',
                'يا أيها الذين آمنوا أوفوا بالعقود (المائدة:1)',
            ],
        },
    };
}

/**
 * إطار المعاملات التجارية الإسلامي الشامل
 * يُطبَّق مع جميع الفئات حسب الحكم الخاص بكل فئة
 */
function buildIslamicCommercialFramework() {
    return {
        id: 'COMMERCIAL-ISLAMIC-001',
        title: 'الإطار التجاري الإسلامي الشامل',
        basis: 'وأحل الله البيع وحرم الربا (البقرة:275)',

        permittedContracts: [
            { type: 'البيع الصريح', description: 'تبادل المال بالمال أو البضاعة بالثمن' },
            { type: 'الإجارة', description: 'تأجير المنافع والخدمات' },
            { type: 'المضاربة', description: 'شركة رأس المال مع العمل — تقاسم الأرباح والخسائر' },
            { type: 'المشاركة', description: 'شركة بين طرفين أو أكثر بمال وعمل' },
            { type: 'المرابحة للآمر بالشراء', description: 'بيع بالتكلفة مع هامش معلوم — بديل إسلامي للقرض الربوي' },
            { type: 'الاستصناع', description: 'عقد تصنيع لسلعة بمواصفات محددة' },
            { type: 'السلم', description: 'دفع الثمن مقدماً لسلعة تُسلَّم لاحقاً' },
            { type: 'الهبة والصدقة', description: 'التبرع بلا مقابل لوجه الله' },
        ],

        prohibitions: [
            { type: 'الربا', daleel: 'حرم الله الربا (البقرة:275)', scope: 'مع الجميع بلا استثناء' },
            { type: 'البيع على بيع المسلم', daleel: 'لا يبع أحدكم على بيع أخيه (البخاري)', scope: 'تمنع الإضرار بالسوق' },
            { type: 'النجش', daleel: 'نهى النبي ﷺ عن النجش (البخاري)', scope: 'رفع السعر للإضرار بالمشتري' },
            { type: 'الغش', daleel: 'من غشنا فليس منا (مسلم)', scope: 'مطلق مع الجميع' },
            { type: 'الاحتكار', daleel: 'من احتكر فهو خاطئ (مسلم)', scope: 'مطلق مع الجميع' },
            { type: 'الغرر الفاحش', daleel: 'نهى النبي ﷺ عن بيع الغرر (مسلم)', scope: 'مطلق' },
            { type: 'بيع الخمر والخنزير', daleel: 'إن الله حرم بيع الخمر والميتة والخنزير والأصنام (البخاري)', scope: 'مطلق' },
        ],

        marketPrinciples: [
            'العدل في الكيل والميزان — وأقيموا الوزن بالقسط (الرحمن:9)',
            'الشفافية والصدق — البيعان بالخيار ما لم يتفرقا (البخاري)',
            'قيمة العمل ومكافأة المنتج — من أكل طعاماً من عمل يده',
            'مؤشر شيخة: توجيهي لا إلزامي — لخدمة المعرفة السوقية',
        ],
    };
}

function main() {
    ensureDir(DATA_DIR);
    ensureDir(REPORTS_DIR);

    const foundation = buildFoundation();
    const muslimCat = buildMuslimCategory();
    const ahlKitab = buildAhlAlKitabCategory();
    const mushrik = buildMushrikCategory();
    const muahad = buildMuahadCategory();
    const harbi = buildHarbiCategory();
    const mustaaman = buildMustaamanCategory();
    const fiRiqab = buildFiAlRiqabCategory();
    const muallafa = buildMuallafaQulubuhumCategory();
    const interstate = buildInterStateDealing();
    const commercial = buildIslamicCommercialFramework();

    const fullData = {
        generatedAt: new Date().toISOString(),
        title: 'الإطار الفقهي الإسلامي الشامل للمعاملات — رقمنة بالكتاب والسنة',
        unifiedForAllah: true,
        basis: 'الكتاب والسنة',
        globalDeclaration: 'الدين عند الله الإسلام — دين كامل يُنظِّم كل المعاملات بعدل وإحسان',
        foundation,
        personCategories: {
            muslim: muslimCat,
            ahlAlKitab: ahlKitab,
            mushrik,
            muahad,
            harbi,
            mustaaman,
            fiAlRiqab: fiRiqab,
            muallafaQulubuhum: muallafa,
        },
        interstateFramework: interstate,
        islamicCommercialFramework: commercial,
        noHarm: {
            principle: 'لا ضرر ولا ضرار',
            ruleOfJustice: 'إن الله يأمر بالعدل والإحسان (النحل:90)',
            forbiddenUseCases: [
                'استخدام هذا الإطار لتبرير أي ظلم أو تمييز محرم',
                'توظيفه في الاضطهاد الديني أو تضييق الحريات المشروعة',
                'استخدامه لتكريس الرق أو الاتجار بالبشر',
                'تطبيقه بما يخالف مقاصد الشريعة الخمسة الكبرى',
            ],
            allowedPurposes: [
                'التعريف بالمنهج الإسلامي الحضاري في التعامل',
                'خدمة التعاملات التجارية الحلال',
                'بناء الجسور بين الأمم على أساس العدل',
                'الدعوة إلى الإسلام بالحكمة والموعظة الحسنة',
            ],
        },
    };

    const outputPath = path.join(DATA_DIR, 'sheikha-islamic-dealings-jurisprudence.json');

    if (fs.existsSync(outputPath)) {
        const stamp = new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-');
        fs.copyFileSync(outputPath, `${outputPath}.bak-${stamp}`);
    }

    fs.writeFileSync(outputPath, JSON.stringify(fullData, null, 2), 'utf8');
    const hash = sha256File(outputPath);

    // تقرير HTML
    const categories = fullData.personCategories;
    const catList = Object.values(categories);

    const htmlReport = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>الإطار الفقهي الإسلامي للمعاملات — شيخة</title>
<style>
  body { font-family:'Tajawal',Arial,sans-serif; background:#0a0a0a; color:#e0e0e0; direction:rtl; padding:20px; }
  h1{color:#D4AF37;} h2{color:#B87333;} h3{color:#d4d4d4;}
  .card{background:#1a1a1a;border:1px solid #3a3a3a;border-radius:8px;padding:16px;margin:12px 0;}
  .gold{color:#D4AF37;} .copper{color:#B87333;}
  .quran{border-right:3px solid #D4AF37;padding-right:12px;font-style:italic;margin:6px 0;}
  .hadith{border-right:3px solid #B87333;padding-right:12px;font-style:italic;margin:6px 0;}
  .no-harm{background:#1a2a1a;border:1px solid #2d5a2d;border-radius:6px;padding:12px;}
  .cat-header{background:#2a2a2a;padding:8px 12px;border-radius:4px;margin-bottom:8px;}
  .badge{background:#2a2a2a;border-radius:4px;padding:2px 8px;font-size:0.82em;margin:2px;display:inline-block;}
  table{width:100%;border-collapse:collapse;margin:8px 0;}
  th{background:#2a2a2a;color:#D4AF37;padding:8px;} td{padding:8px;border-bottom:1px solid #2a2a2a;}
  ul{padding-right:20px;}
</style>
</head>
<body>
<h1>⚖️ الإطار الفقهي الإسلامي الشامل للمعاملات</h1>
<p class="gold">رقمنة بالكتاب والسنة — وحدها لله</p>
<div class="quran">${fullData.foundation.primaryDeclaration}</div>
<div class="quran">${fullData.foundation.completeness}</div>
<div class="quran">${fullData.foundation.universality}</div>
<p>SHA256: <code style="font-size:0.7em">${hash.slice(0,32)}...</code></p>

<h2>الأساس الكلي — مقاصد الشريعة</h2>
<div class="card">
  ${foundation.maqasidAlShareah.map(m => `<span class="badge copper">${m.name}</span>`).join(' ')}
  <p style="margin-top:8px"><em>${foundation.principle}</em></p>
</div>

<h2>فئات الأشخاص وأحكام التعامل</h2>

${catList.map(cat => `
<div class="card">
  <div class="cat-header"><strong class="gold">${cat.arabicName}</strong> — <small>${cat.definition || cat.classicalDefinition || ''}</small></div>
  ${cat.hadithRef ? `<div class="hadith">${cat.hadithRef}</div>` : ''}
  ${cat.quranicBasis ? (Array.isArray(cat.quranicBasis) ? cat.quranicBasis.map(q => `<div class="quran">${q}</div>`).join('') : `<div class="quran">${cat.quranicBasis}</div>`) : ''}
  ${cat.importantClarification ? `<p class="copper"><strong>تنبيه:</strong> ${cat.importantClarification}</p>` : ''}
  ${cat.modernApplication ? `<p><strong>التطبيق المعاصر:</strong> ${cat.modernApplication}</p>` : ''}
  ${cat.modernEquivalent ? `<p class="copper"><small>${cat.modernEquivalent}</small></p>` : ''}
</div>`).join('')}

<h2>العلاقات بين الدول</h2>
<div class="card">
  <h3 class="gold">الدولة الإسلامية مع الدولة الإسلامية</h3>
  <ul>${interstate.islamicStateToIslamicState.principles.map(p => `<li>${p}</li>`).join('')}</ul>
  <table>
    <tr><th>المجال</th><th>الحكم</th></tr>
    ${interstate.islamicStateToIslamicState.transactions.map(t => `<tr><td class="gold">${t.area}</td><td>${t.rule}</td></tr>`).join('')}
  </table>
</div>

<div class="card">
  <h3 class="gold">الدولة الإسلامية مع الدولة غير الإسلامية</h3>
  <div class="quran">${interstate.islamicStateToNonIslamicState.defaultPrinciple}</div>
  <table>
    <tr><th>النوع</th><th>الحكم</th></tr>
    ${interstate.islamicStateToNonIslamicState.types.map(t => `<tr><td class="copper">${t.type}</td><td>${t.rule}</td></tr>`).join('')}
  </table>
</div>

<h2>الإطار التجاري الإسلامي</h2>
<div class="card">
  <h3 class="gold">العقود المشروعة</h3>
  <table>
    <tr><th>العقد</th><th>الوصف</th></tr>
    ${commercial.permittedContracts.map(c => `<tr><td class="gold">${c.type}</td><td>${c.description}</td></tr>`).join('')}
  </table>
  <h3 class="copper">المحرمات التجارية</h3>
  <table>
    <tr><th>المحرم</th><th>الدليل</th><th>النطاق</th></tr>
    ${commercial.prohibitions.map(p => `<tr><td class="copper">${p.type}</td><td><em>${p.daleel}</em></td><td>${p.scope}</td></tr>`).join('')}
  </table>
</div>

<div class="no-harm">
  <h3 class="gold">ضوابط لا ضرر ولا ضرار</h3>
  <p><strong>المقاصد المشروعة:</strong></p>
  <ul>${fullData.noHarm.allowedPurposes.map(p => `<li>${p}</li>`).join('')}</ul>
  <p><strong>محظور استخدام هذا الإطار في:</strong></p>
  <ul>${fullData.noHarm.forbiddenUseCases.map(u => `<li>${u}</li>`).join('')}</ul>
</div>

<p style="text-align:center;color:#555;margin-top:30px">منظومة شيخة — وحدها لله — ${new Date().getFullYear()}</p>
</body></html>`;

    const reportPath = path.join(REPORTS_DIR, 'sheikha-islamic-dealings-jurisprudence-report.html');
    fs.writeFileSync(reportPath, htmlReport, 'utf8');

    console.log('✅ الإطار الفقهي الإسلامي الشامل للمعاملات رُقِّم بالكتاب والسنة');
    console.log(`   📄 البيانات: ${path.relative(ROOT_DIR, outputPath)}`);
    console.log(`   📊 التقرير: ${path.relative(ROOT_DIR, reportPath)}`);
    console.log(`   🔒 SHA256: ${hash.slice(0, 16)}...`);
    console.log(`   📋 الفئات: ${catList.length} فئة`);
}

main();
