<?php

declare(strict_types=1);

namespace Sheikha\NeuralGateway\Language;

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  SHL — لغة شيخة البرمجية / Sheikha Language Token Types                    ║
 * ║  أنواع الرموز المعجمية للغة شيخة                                            ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * SHL (Sheikha Language) — لغة برمجية سيادية إسلامية:
 *   - عربية أولاً (Arabic-first keywords)
 *   - ثنائية اللغة (English aliases work too)
 *   - شرعية الجوهر (Sharia compliance built-in)
 *   - عصبية الأساس (Neural operations as first-class citizens)
 *   - حضارية البنية (Civilizational architecture)
 *
 * "إِنَّا أَنزَلْنَاهُ قُرْآنًا عَرَبِيًّا لَّعَلَّكُمْ تَعْقِلُونَ" — يوسف:2
 */
class Token
{
    // ── الأنواع المعجمية الأساسية ─────────────────────────────────────────────

    // القيم / Literals
    public const T_NUMBER     = 'NUMBER';      // 42, 3.14, ٤٢
    public const T_STRING     = 'STRING';      // "نص"، 'text'
    public const T_BOOL_TRUE  = 'BOOL_TRUE';   // حلال، صح، true، نعم
    public const T_BOOL_FALSE = 'BOOL_FALSE';  // حرام، خطأ، false، لا
    public const T_NULL       = 'NULL';        // فراغ، null، عدم

    // المعرّفات / Identifiers
    public const T_IDENTIFIER = 'IDENTIFIER';  // اسم_متغير، varName

    // الكلمات المفتاحية / Keywords
    public const T_LET        = 'LET';         // ليكن، let
    public const T_FN         = 'FN';          // دالة، fn، function
    public const T_RETURN     = 'RETURN';      // أرجع، return
    public const T_IF         = 'IF';          // إذا، if
    public const T_ELIF       = 'ELIF';        // وإذا، elif
    public const T_ELSE       = 'ELSE';        // وإلا، else
    public const T_FOR        = 'FOR';         // لكل، for
    public const T_IN         = 'IN';          // في، in
    public const T_WHILE      = 'WHILE';       // بينما، while
    public const T_BREAK      = 'BREAK';       // اخرج، break
    public const T_CONTINUE   = 'CONTINUE';    // تابع، continue
    public const T_PRINT      = 'PRINT';       // اطبع، print
    public const T_END        = 'END';         // نهاية، end
    public const T_MODULE     = 'MODULE';      // حزمة، module
    public const T_IMPORT     = 'IMPORT';      // استورد، import
    public const T_FROM       = 'FROM';        // من، from
    public const T_CLASS      = 'CLASS';       // صنف، class
    public const T_NEW        = 'NEW';         // جديد، new
    public const T_THIS       = 'THIS';        // هذا، this
    public const T_TRY        = 'TRY';         // حاول، try
    public const T_CATCH      = 'CATCH';       // التقط، catch
    public const T_THROW      = 'THROW';       // أطلق، throw
    public const T_AND        = 'AND';         // و، and
    public const T_OR         = 'OR';          // أو، or
    public const T_NOT        = 'NOT';         // ليس، not

    // كلمات شرعية / Sharia keywords
    public const T_SHARIA     = 'SHARIA';      // شريعة، sharia
    public const T_HALAL      = 'HALAL';       // حلال_نوع
    public const T_HARAM      = 'HARAM';       // حرام_نوع
    public const T_ZAKAT      = 'ZAKAT';       // زكاة
    public const T_WAQF       = 'WAQF';        // وقف
    public const T_NO_RIBA    = 'NO_RIBA';     // لا_ربا
    public const T_NO_GHARAR  = 'NO_GHARAR';   // لا_غرر
    public const T_VERIFY     = 'VERIFY';      // تحقق

    // كلمات عصبية / Neural keywords
    public const T_NEURAL     = 'NEURAL';      // عصبي
    public const T_CELL       = 'CELL';        // خلية
    public const T_INFER      = 'INFER';       // استدل
    public const T_ACTIVATE   = 'ACTIVATE';    // فعّل

    // العمليات الحسابية / Arithmetic operators
    public const T_PLUS       = 'PLUS';        // +
    public const T_MINUS      = 'MINUS';       // -
    public const T_MULTIPLY   = 'MULTIPLY';    // *
    public const T_DIVIDE     = 'DIVIDE';      // /
    public const T_MODULO     = 'MODULO';      // %
    public const T_POWER      = 'POWER';       // **
    public const T_FLOOR_DIV  = 'FLOOR_DIV';   // //

    // عمليات المقارنة / Comparison operators
    public const T_EQ         = 'EQ';          // ==
    public const T_NEQ        = 'NEQ';         // !=
    public const T_LT         = 'LT';          // <
    public const T_LTE        = 'LTE';         // <=
    public const T_GT         = 'GT';          // >
    public const T_GTE        = 'GTE';         // >=

    // عمليات الإسناد / Assignment operators
    public const T_ASSIGN     = 'ASSIGN';      // =
    public const T_PLUS_EQ    = 'PLUS_EQ';     // +=
    public const T_MINUS_EQ   = 'MINUS_EQ';    // -=
    public const T_MUL_EQ     = 'MUL_EQ';      // *=
    public const T_DIV_EQ     = 'DIV_EQ';      // /=

    // الرموز / Symbols
    public const T_LPAREN     = 'LPAREN';      // (
    public const T_RPAREN     = 'RPAREN';      // )
    public const T_LBRACKET   = 'LBRACKET';    // [
    public const T_RBRACKET   = 'RBRACKET';    // ]
    public const T_LBRACE     = 'LBRACE';      // {
    public const T_RBRACE     = 'RBRACE';      // }
    public const T_COMMA      = 'COMMA';       // ،, ,
    public const T_COLON      = 'COLON';       // :
    public const T_DOT        = 'DOT';         // .
    public const T_ARROW      = 'ARROW';       // ->
    public const T_PIPE       = 'PIPE';        // |
    public const T_ELLIPSIS   = 'ELLIPSIS';    // ...

    // التحكم في التدفق / Flow control
    public const T_NEWLINE    = 'NEWLINE';
    public const T_INDENT     = 'INDENT';
    public const T_DEDENT     = 'DEDENT';
    public const T_SEMICOLON  = 'SEMICOLON';   // ; (اختياري)

    // نهاية / End
    public const T_EOF        = 'EOF';
    public const T_COMMENT    = 'COMMENT';     // # تعليق

    // ── الكلمات المفتاحية العربية + الإنجليزية ────────────────────────────────

    /**
     * خريطة الكلمات المفتاحية → النوع
     * تدعم العربية والإنجليزية معاً
     *
     * @return array<string, string>
     */
    public static function keywords(): array
    {
        return [
            // إسناد / Assignment
            'ليكن'      => self::T_LET,
            'let'        => self::T_LET,
            'var'        => self::T_LET,
            'const'      => self::T_LET,

            // دوال / Functions
            'دالة'       => self::T_FN,
            'fn'         => self::T_FN,
            'function'   => self::T_FN,
            'def'        => self::T_FN,
            'أرجع'       => self::T_RETURN,
            'ارجع'       => self::T_RETURN,
            'return'     => self::T_RETURN,

            // شرطية / Conditionals
            'إذا'        => self::T_IF,
            'اذا'        => self::T_IF,
            'if'         => self::T_IF,
            'وإذا'       => self::T_ELIF,
            'واذا'       => self::T_ELIF,
            'elif'       => self::T_ELIF,
            'وإلا'       => self::T_ELSE,
            'والا'       => self::T_ELSE,
            'else'       => self::T_ELSE,

            // حلقات / Loops
            'لكل'        => self::T_FOR,
            'for'        => self::T_FOR,
            'في'         => self::T_IN,
            'in'         => self::T_IN,
            'بينما'      => self::T_WHILE,
            'while'      => self::T_WHILE,
            'اخرج'       => self::T_BREAK,
            'break'      => self::T_BREAK,
            'تابع'       => self::T_CONTINUE,
            'continue'   => self::T_CONTINUE,

            // طباعة / Print
            'اطبع'       => self::T_PRINT,
            'print'      => self::T_PRINT,
            'echo'       => self::T_PRINT,
            'أظهر'       => self::T_PRINT,

            // نهايات / Endings
            'نهاية'      => self::T_END,
            'end'        => self::T_END,
            'نهاية_دالة' => self::T_END,
            'نهاية_إذا'  => self::T_END,
            'نهاية_لكل'  => self::T_END,
            'نهاية_بينما'=> self::T_END,

            // حزم / Modules
            'حزمة'       => self::T_MODULE,
            'module'     => self::T_MODULE,
            'استورد'     => self::T_IMPORT,
            'import'     => self::T_IMPORT,
            'من'         => self::T_FROM,
            'from'       => self::T_FROM,

            // صنف / Class
            'صنف'        => self::T_CLASS,
            'class'      => self::T_CLASS,
            'جديد'       => self::T_NEW,
            'new'        => self::T_NEW,
            'هذا'        => self::T_THIS,
            'this'       => self::T_THIS,
            'self'       => self::T_THIS,

            // معالجة الأخطاء / Error handling
            'حاول'       => self::T_TRY,
            'try'        => self::T_TRY,
            'التقط'      => self::T_CATCH,
            'catch'      => self::T_CATCH,
            'أطلق'       => self::T_THROW,
            'throw'      => self::T_THROW,
            'raise'      => self::T_THROW,

            // منطق / Logic
            'و'          => self::T_AND,
            'and'        => self::T_AND,
            'أو'         => self::T_OR,
            'او'         => self::T_OR,
            'or'         => self::T_OR,
            'ليس'        => self::T_NOT,
            'not'        => self::T_NOT,

            // قيم / Values
            'حلال'       => self::T_BOOL_TRUE,
            'صح'         => self::T_BOOL_TRUE,
            'صحيح'       => self::T_BOOL_TRUE,
            'نعم'        => self::T_BOOL_TRUE,
            'true'       => self::T_BOOL_TRUE,
            'yes'        => self::T_BOOL_TRUE,
            'حرام'       => self::T_BOOL_FALSE,
            'خطأ'        => self::T_BOOL_FALSE,
            'خطا'        => self::T_BOOL_FALSE,
            'لا'         => self::T_BOOL_FALSE,
            'false'      => self::T_BOOL_FALSE,
            'no'         => self::T_BOOL_FALSE,
            'فراغ'       => self::T_NULL,
            'null'       => self::T_NULL,
            'none'       => self::T_NULL,
            'عدم'        => self::T_NULL,

            // شريعة / Sharia
            'شريعة'      => self::T_SHARIA,
            'sharia'     => self::T_SHARIA,
            'زكاة'       => self::T_ZAKAT,
            'zakat'      => self::T_ZAKAT,
            'وقف'        => self::T_WAQF,
            'waqf'       => self::T_WAQF,
            'لا_ربا'     => self::T_NO_RIBA,
            'no_riba'    => self::T_NO_RIBA,
            'لا_غرر'     => self::T_NO_GHARAR,
            'no_gharar'  => self::T_NO_GHARAR,
            'تحقق'       => self::T_VERIFY,
            'verify'     => self::T_VERIFY,

            // عصبي / Neural
            'عصبي'       => self::T_NEURAL,
            'neural'     => self::T_NEURAL,
            'خلية'       => self::T_CELL,
            'cell'       => self::T_CELL,
            'استدل'      => self::T_INFER,
            'infer'      => self::T_INFER,
            'فعّل'       => self::T_ACTIVATE,
            'فعل'        => self::T_ACTIVATE,
            'activate'   => self::T_ACTIVATE,
        ];
    }

    // ── بيانات الرمز ─────────────────────────────────────────────────────────

    private string $type;
    private mixed  $value;
    private int    $line;
    private int    $col;

    public function __construct(string $type, mixed $value, int $line = 0, int $col = 0)
    {
        $this->type  = $type;
        $this->value = $value;
        $this->line  = $line;
        $this->col   = $col;
    }

    public function getType(): string  { return $this->type; }
    public function getValue(): mixed  { return $this->value; }
    public function getLine(): int     { return $this->line; }
    public function getCol(): int      { return $this->col; }

    public function is(string $type): bool { return $this->type === $type; }

    public function __toString(): string
    {
        return sprintf('Token(%s, %s, line:%d)', $this->type, json_encode($this->value), $this->line);
    }
}
