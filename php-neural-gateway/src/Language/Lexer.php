<?php

declare(strict_types=1);

namespace Sheikha\NeuralGateway\Language;

/**
 * المحلل المعجمي للغة شيخة — SHL Lexer
 *
 * يحوّل شفرة المصدر إلى تسلسل من الرموز المعجمية.
 * يدعم: العربية + الإنجليزية + الأرقام العربية + التعليقات + الفراغات الدلالية.
 *
 * "أَلَمْ نَجْعَل لَّهُ عَيْنَيْنِ" — البلد:8
 */
class Lexer
{
    private string $source;
    private int    $pos    = 0;
    private int    $line   = 1;
    private int    $col    = 1;
    private int    $length = 0;

    /** @var Token[] */
    private array  $tokens = [];

    /** مكدس مستويات التمريز — indentation stack */
    private array  $indentStack = [0];

    /** خريطة الأرقام العربية → أرقام ASCII */
    private const ARABIC_DIGITS = [
        '٠' => '0', '١' => '1', '٢' => '2', '٣' => '3', '٤' => '4',
        '٥' => '5', '٦' => '6', '٧' => '7', '٨' => '8', '٩' => '9',
    ];

    public function __construct(string $source)
    {
        // تطبيع نهايات الأسطر
        $this->source = str_replace(["\r\n", "\r"], "\n", $source);
        $this->length = mb_strlen($this->source);
    }

    /**
     * تحليل الشفرة المصدرية كاملاً — Tokenize full source
     *
     * @return Token[]
     */
    public function tokenize(): array
    {
        $this->tokens = [];
        $this->pos    = 0;
        $this->line   = 1;
        $this->col    = 1;

        while ($this->pos < $this->length) {
            $this->scanToken();
        }

        // إغلاق أي تمريزات مفتوحة
        while (count($this->indentStack) > 1) {
            array_pop($this->indentStack);
            $this->addToken(Token::T_DEDENT, null);
        }

        $this->addToken(Token::T_EOF, null);
        return $this->tokens;
    }

    // ── المحرك الداخلي ────────────────────────────────────────────────────────

    private function scanToken(): void
    {
        $ch = $this->current();

        // نهاية السطر — Newline
        if ($ch === "\n") {
            $this->addToken(Token::T_NEWLINE, "\n");
            $this->advance();
            $this->line++;
            $this->col = 1;
            $this->handleIndent();
            return;
        }

        // مسافات أفقية (تُتجاهل خارج بداية السطر)
        if ($ch === ' ' || $ch === "\t") {
            $this->advance();
            return;
        }

        // تعليق — Comment (# أو //)
        if ($ch === '#' || ($ch === '/' && $this->peek() === '/')) {
            $this->scanComment();
            return;
        }

        // تعليق متعدد الأسطر /* */
        if ($ch === '/' && $this->peek() === '*') {
            $this->scanBlockComment();
            return;
        }

        // نص — String
        if ($ch === '"' || $ch === "'") {
            $this->scanString($ch);
            return;
        }

        // رقم — Number (ASCII أو عربي)
        if ($this->isDigit($ch)) {
            $this->scanNumber();
            return;
        }

        // معرّف أو كلمة مفتاحية — Identifier/Keyword
        if ($this->isIdentStart($ch)) {
            $this->scanIdentifier();
            return;
        }

        // رموز — Symbols
        $this->scanSymbol();
    }

    private function handleIndent(): void
    {
        $indent = 0;
        while ($this->pos < $this->length) {
            $ch = $this->current();
            if ($ch === ' ') {
                $indent++;
                $this->pos++;
                $this->col++;
            } elseif ($ch === "\t") {
                $indent += 4;
                $this->pos++;
                $this->col++;
            } else {
                break;
            }
        }

        // تجاهل الأسطر الفارغة والتعليقات
        $cur = $this->current();
        if ($cur === "\n" || $cur === '#' || ($cur === '/' && $this->peek() === '/')) {
            return;
        }

        $currentIndent = end($this->indentStack);

        if ($indent > $currentIndent) {
            $this->indentStack[] = $indent;
            $this->addToken(Token::T_INDENT, $indent);
        } elseif ($indent < $currentIndent) {
            while (count($this->indentStack) > 1 && end($this->indentStack) > $indent) {
                array_pop($this->indentStack);
                $this->addToken(Token::T_DEDENT, $indent);
            }
        }
    }

    private function scanComment(): void
    {
        $start = $this->pos;
        while ($this->pos < $this->length && $this->current() !== "\n") {
            $this->advance();
        }
        // التعليقات تُتجاهل ولا تُضاف للرموز
    }

    private function scanBlockComment(): void
    {
        $this->advance(); // /
        $this->advance(); // *
        while ($this->pos < $this->length) {
            if ($this->current() === '*' && $this->peek() === '/') {
                $this->advance();
                $this->advance();
                return;
            }
            if ($this->current() === "\n") {
                $this->line++;
                $this->col = 1;
            }
            $this->advance();
        }
    }

    private function scanString(string $quote): void
    {
        $line = $this->line;
        $col  = $this->col;
        $this->advance(); // فتح التنصيص
        $value = '';
        while ($this->pos < $this->length) {
            $ch = $this->current();
            if ($ch === $quote) {
                $this->advance(); // إغلاق التنصيص
                $this->tokens[] = new Token(Token::T_STRING, $value, $line, $col);
                return;
            }
            if ($ch === '\\') {
                $this->advance();
                $esc = $this->current();
                $value .= match($esc) {
                    'n'     => "\n",
                    't'     => "\t",
                    'r'     => "\r",
                    '\\'    => '\\',
                    '"'     => '"',
                    "'"     => "'",
                    default => '\\' . $esc,
                };
                $this->advance();
                continue;
            }
            if ($ch === "\n") {
                $this->line++;
                $this->col = 1;
            }
            $value .= $ch;
            $this->advance();
        }
        throw new SHLError("نص غير مغلق — Unterminated string at line $line");
    }

    private function scanNumber(): void
    {
        $line  = $this->line;
        $col   = $this->col;
        $raw   = '';
        $isFloat = false;

        while ($this->pos < $this->length && $this->isDigit($this->current())) {
            $raw .= $this->normalizeDigit($this->current());
            $this->advance();
        }

        // كسر عشري
        if ($this->pos < $this->length && $this->current() === '.'
            && $this->isDigit($this->peek())
        ) {
            $isFloat = true;
            $raw .= '.';
            $this->advance();
            while ($this->pos < $this->length && $this->isDigit($this->current())) {
                $raw .= $this->normalizeDigit($this->current());
                $this->advance();
            }
        }

        $value = $isFloat ? (float)$raw : (int)$raw;
        $this->tokens[] = new Token(Token::T_NUMBER, $value, $line, $col);
    }

    private function scanIdentifier(): void
    {
        $line  = $this->line;
        $col   = $this->col;
        $ident = '';

        while ($this->pos < $this->length && $this->isIdentChar($this->current())) {
            $ident .= $this->current();
            $this->advance();
        }

        // فحص الكلمات المفتاحية
        $keywords = Token::keywords();
        $type     = $keywords[$ident] ?? Token::T_IDENTIFIER;
        $value    = ($type === Token::T_IDENTIFIER) ? $ident : $ident;

        // قيم بوليانية وnull
        $val = match($type) {
            Token::T_BOOL_TRUE  => true,
            Token::T_BOOL_FALSE => false,
            Token::T_NULL       => null,
            default             => $ident,
        };

        $this->tokens[] = new Token($type, $val, $line, $col);
    }

    private function scanSymbol(): void
    {
        $line = $this->line;
        $col  = $this->col;
        $ch   = $this->current();

        $double = $ch . $this->peek();
        $triple = $double . $this->peekAt(2);

        // ثلاثي — Triple char
        if ($triple === '...') {
            $this->addTokenAt(Token::T_ELLIPSIS, $triple, $line, $col);
            $this->advance(); $this->advance(); $this->advance();
            return;
        }

        // مزدوج — Double char
        switch ($double) {
            case '**': $this->addTokenAt(Token::T_POWER,     '**', $line, $col); $this->advance(); $this->advance(); return;
            case '//': break; // تعليق — handled above
            case '==': $this->addTokenAt(Token::T_EQ,        '==', $line, $col); $this->advance(); $this->advance(); return;
            case '!=': $this->addTokenAt(Token::T_NEQ,       '!=', $line, $col); $this->advance(); $this->advance(); return;
            case '<=': $this->addTokenAt(Token::T_LTE,       '<=', $line, $col); $this->advance(); $this->advance(); return;
            case '>=': $this->addTokenAt(Token::T_GTE,       '>=', $line, $col); $this->advance(); $this->advance(); return;
            case '+=': $this->addTokenAt(Token::T_PLUS_EQ,   '+=', $line, $col); $this->advance(); $this->advance(); return;
            case '-=': $this->addTokenAt(Token::T_MINUS_EQ,  '-=', $line, $col); $this->advance(); $this->advance(); return;
            case '*=': $this->addTokenAt(Token::T_MUL_EQ,    '*=', $line, $col); $this->advance(); $this->advance(); return;
            case '/=': $this->addTokenAt(Token::T_DIV_EQ,    '/=', $line, $col); $this->advance(); $this->advance(); return;
            case '->': $this->addTokenAt(Token::T_ARROW,     '->', $line, $col); $this->advance(); $this->advance(); return;
        }

        // أحادي — Single char
        $map = [
            '+' => Token::T_PLUS,     '-' => Token::T_MINUS,
            '*' => Token::T_MULTIPLY, '/' => Token::T_DIVIDE,
            '%' => Token::T_MODULO,   '<' => Token::T_LT,
            '>' => Token::T_GT,       '=' => Token::T_ASSIGN,
            '(' => Token::T_LPAREN,   ')' => Token::T_RPAREN,
            '[' => Token::T_LBRACKET, ']' => Token::T_RBRACKET,
            '{' => Token::T_LBRACE,   '}' => Token::T_RBRACE,
            ',' => Token::T_COMMA,    ':' => Token::T_COLON,
            '.' => Token::T_DOT,      '|' => Token::T_PIPE,
            ';' => Token::T_SEMICOLON,
            '،' => Token::T_COMMA,    // فاصلة عربية
        ];

        if (isset($map[$ch])) {
            $this->addTokenAt($map[$ch], $ch, $line, $col);
            $this->advance();
            return;
        }

        // تجاهل الأحرف غير المعروفة
        $this->advance();
    }

    // ── أدوات مساعدة ─────────────────────────────────────────────────────────

    private function current(): string
    {
        return $this->pos < $this->length ? mb_substr($this->source, $this->pos, 1) : '';
    }

    private function peek(): string
    {
        return ($this->pos + 1) < $this->length ? mb_substr($this->source, $this->pos + 1, 1) : '';
    }

    private function peekAt(int $offset): string
    {
        return ($this->pos + $offset) < $this->length
            ? mb_substr($this->source, $this->pos + $offset, 1)
            : '';
    }

    private function advance(): void
    {
        $this->pos++;
        $this->col++;
    }

    private function isDigit(string $ch): bool
    {
        return ctype_digit($ch) || isset(self::ARABIC_DIGITS[$ch]);
    }

    private function normalizeDigit(string $ch): string
    {
        return self::ARABIC_DIGITS[$ch] ?? $ch;
    }

    private function isIdentStart(string $ch): bool
    {
        if ($ch === '') return false;
        if (preg_match('/[a-zA-Z_]/', $ch)) return true;
        $cp = mb_ord($ch, 'UTF-8');
        // Arabic letters only (not punctuation like ، U+060C or ؛ U+061B)
        return ($cp >= 0x0621 && $cp <= 0x064A)   // Arabic letters ء..ي
            || ($cp >= 0x066E && $cp <= 0x066F)   // Dotless letters
            || ($cp >= 0x0671 && $cp <= 0x06D3)   // Extended Arabic
            || ($cp === 0x06D5)                    // Arabic Letter Ae
            || ($cp >= 0x06FA && $cp <= 0x06FF)   // Arabic Letters (misc)
            || ($cp >= 0x0750 && $cp <= 0x077F)   // Arabic Supplement
            || ($cp >= 0xFB50 && $cp <= 0xFDCF)   // Presentation Forms-A (letters)
            || ($cp >= 0xFDF0 && $cp <= 0xFDFF)   // Presentation Forms-A (words)
            || ($cp >= 0xFE70 && $cp <= 0xFEFC);  // Presentation Forms-B (letters)
    }

    private function isIdentChar(string $ch): bool
    {
        if ($ch === '') return false;
        return $this->isIdentStart($ch) || ctype_digit($ch) || $ch === '_';
    }

    private function addToken(string $type, mixed $value): void
    {
        $this->tokens[] = new Token($type, $value, $this->line, $this->col);
    }

    private function addTokenAt(string $type, mixed $value, int $line, int $col): void
    {
        $this->tokens[] = new Token($type, $value, $line, $col);
    }
}
