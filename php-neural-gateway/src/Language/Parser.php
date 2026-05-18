<?php

declare(strict_types=1);

namespace Sheikha\NeuralGateway\Language;

use Sheikha\NeuralGateway\Language\AST\Node;
use Sheikha\NeuralGateway\Language\AST\ProgramNode;
use Sheikha\NeuralGateway\Language\AST\BlockNode;
use Sheikha\NeuralGateway\Language\AST\LetNode;
use Sheikha\NeuralGateway\Language\AST\AssignNode;
use Sheikha\NeuralGateway\Language\AST\FunctionNode;
use Sheikha\NeuralGateway\Language\AST\CallNode;
use Sheikha\NeuralGateway\Language\AST\ReturnNode;
use Sheikha\NeuralGateway\Language\AST\PrintNode;
use Sheikha\NeuralGateway\Language\AST\IfNode;
use Sheikha\NeuralGateway\Language\AST\ForEachNode;
use Sheikha\NeuralGateway\Language\AST\WhileNode;
use Sheikha\NeuralGateway\Language\AST\BreakNode;
use Sheikha\NeuralGateway\Language\AST\ContinueNode;
use Sheikha\NeuralGateway\Language\AST\BinaryOpNode;
use Sheikha\NeuralGateway\Language\AST\UnaryOpNode;
use Sheikha\NeuralGateway\Language\AST\LiteralNode;
use Sheikha\NeuralGateway\Language\AST\IdentifierNode;
use Sheikha\NeuralGateway\Language\AST\MemberNode;
use Sheikha\NeuralGateway\Language\AST\IndexNode;
use Sheikha\NeuralGateway\Language\AST\ListNode;
use Sheikha\NeuralGateway\Language\AST\ObjectNode;
use Sheikha\NeuralGateway\Language\AST\ShariaBlockNode;
use Sheikha\NeuralGateway\Language\AST\ShariaRuleNode;
use Sheikha\NeuralGateway\Language\AST\NeuralInferNode;
use Sheikha\NeuralGateway\Language\AST\NeuralActivateNode;
use Sheikha\NeuralGateway\Language\AST\TryCatchNode;
use Sheikha\NeuralGateway\Language\AST\ThrowNode;
use Sheikha\NeuralGateway\Language\AST\ImportNode;

/**
 * المحلل النحوي للغة شيخة — SHL Parser
 *
 * يحوّل تسلسل الرموز إلى شجرة الصياغة المجردة (AST).
 * نحو تنازلي تكراري (Recursive Descent Parser).
 *
 * "وَالنَّجْمُ وَالشَّجَرُ يَسْجُدَانِ" — الرحمن:6
 */
class Parser
{
    /** @var Token[] */
    private array $tokens;
    private int   $pos = 0;
    private int   $count;

    /**
     * @param Token[] $tokens
     */
    public function __construct(array $tokens)
    {
        // تصفية NEWLINE/INDENT/DEDENT/COMMENT
        $this->tokens = array_values(array_filter(
            $tokens,
            fn($t) => !$t->is(Token::T_COMMENT) && !$t->is(Token::T_SEMICOLON)
        ));
        $this->count = count($this->tokens);
    }

    public function parse(): ProgramNode
    {
        $statements = [];
        while (!$this->isEOF()) {
            $this->skipNewlines();
            if ($this->isEOF()) break;
            $statements[] = $this->parseStatement();
        }
        return new ProgramNode($statements);
    }

    // ── الجمل ─────────────────────────────────────────────────────────────────

    private function parseStatement(): Node
    {
        $tok = $this->current();

        return match ($tok->getType()) {
            Token::T_LET       => $this->parseLet(),
            Token::T_FN        => $this->parseFn(),
            Token::T_IF        => $this->parseIf(),
            Token::T_FOR       => $this->parseFor(),
            Token::T_WHILE     => $this->parseWhile(),
            Token::T_RETURN    => $this->parseReturn(),
            Token::T_PRINT     => $this->parsePrint(),
            Token::T_BREAK     => $this->parseBreak(),
            Token::T_CONTINUE  => $this->parseContinue(),
            Token::T_SHARIA,
            Token::T_VERIFY    => $this->parseShariaBlock(),
            Token::T_NEURAL    => $this->parseNeuralStatement(),
            Token::T_INFER     => $this->parseNeuralInfer(),
            Token::T_ACTIVATE  => $this->parseNeuralActivate(),
            Token::T_TRY       => $this->parseTryCatch(),
            Token::T_THROW     => $this->parseThrow(),
            Token::T_IMPORT    => $this->parseImport(),
            Token::T_NO_RIBA   => $this->parseShariaRule(Token::T_NO_RIBA),
            Token::T_NO_GHARAR => $this->parseShariaRule(Token::T_NO_GHARAR),
            Token::T_NEWLINE,
            Token::T_INDENT,
            Token::T_DEDENT    => $this->parseSkip(),
            default            => $this->parseExpressionStatement(),
        };
    }

    private function parseLet(): LetNode
    {
        $line = $this->current()->getLine();
        $this->consume(Token::T_LET);
        $name = $this->expectIdentifier();
        $value = null;
        if ($this->match(Token::T_ASSIGN)) {
            $value = $this->parseExpression();
        }
        $this->skipNewlines();
        $node = new LetNode($name, $value);
        $node->line = $line;
        return $node;
    }

    private function parseFn(): FunctionNode
    {
        $line = $this->current()->getLine();
        $this->consume(Token::T_FN);
        $name   = $this->expectIdentifier();
        $params = [];

        if ($this->match(Token::T_LPAREN)) {
            while (!$this->check(Token::T_RPAREN) && !$this->isEOF()) {
                $params[] = $this->expectIdentifier();
                if (!$this->match(Token::T_COMMA)) break;
            }
            $this->consume(Token::T_RPAREN);
        }

        $this->consume(Token::T_COLON);
        $body = $this->parseBlock([Token::T_END]);
        $this->matchAny(Token::T_END);

        $node = new FunctionNode($name, $params, $body);
        $node->line = $line;
        return $node;
    }

    private function parseIf(): IfNode
    {
        $line = $this->current()->getLine();
        $this->consume(Token::T_IF);
        $condition = $this->parseExpression();
        $this->consume(Token::T_COLON);
        $thenBlock   = $this->parseBlock([Token::T_ELIF, Token::T_ELSE, Token::T_END]);
        $elifClauses = [];
        $elseBlock   = null;

        while ($this->check(Token::T_ELIF)) {
            $this->consume(Token::T_ELIF);
            $elifCond = $this->parseExpression();
            $this->consume(Token::T_COLON);
            $elifBlock     = $this->parseBlock([Token::T_ELIF, Token::T_ELSE, Token::T_END]);
            $elifClauses[] = ['condition' => $elifCond, 'block' => $elifBlock];
        }

        if ($this->match(Token::T_ELSE)) {
            $this->match(Token::T_COLON);
            $elseBlock = $this->parseBlock([Token::T_END]);
        }

        $this->matchAny(Token::T_END);
        $node = new IfNode($condition, $thenBlock, $elifClauses, $elseBlock);
        $node->line = $line;
        return $node;
    }

    private function parseFor(): ForEachNode
    {
        $line = $this->current()->getLine();
        $this->consume(Token::T_FOR);
        $var = $this->expectIdentifier();
        $this->consume(Token::T_IN);
        $iterable = $this->parseExpression();
        $this->consume(Token::T_COLON);
        $body = $this->parseBlock([Token::T_END]);
        $this->matchAny(Token::T_END);
        $node = new ForEachNode($var, $iterable, $body);
        $node->line = $line;
        return $node;
    }

    private function parseWhile(): WhileNode
    {
        $line = $this->current()->getLine();
        $this->consume(Token::T_WHILE);
        $condition = $this->parseExpression();
        $this->consume(Token::T_COLON);
        $body = $this->parseBlock([Token::T_END]);
        $this->matchAny(Token::T_END);
        $node = new WhileNode($condition, $body);
        $node->line = $line;
        return $node;
    }

    private function parseReturn(): ReturnNode
    {
        $line = $this->current()->getLine();
        $this->consume(Token::T_RETURN);
        $value = null;
        if (!$this->check(Token::T_NEWLINE) && !$this->check(Token::T_EOF) && !$this->isEOF()) {
            $value = $this->parseExpression();
        }
        $this->skipNewlines();
        $node = new ReturnNode($value);
        $node->line = $line;
        return $node;
    }

    private function parsePrint(): PrintNode
    {
        $line = $this->current()->getLine();
        $this->consume(Token::T_PRINT);
        $args = [];
        if ($this->match(Token::T_LPAREN)) {
            while (!$this->check(Token::T_RPAREN) && !$this->isEOF()) {
                $args[] = $this->parseExpression();
                if (!$this->match(Token::T_COMMA)) break;
            }
            $this->consume(Token::T_RPAREN);
        } else {
            $args[] = $this->parseExpression();
        }
        $this->skipNewlines();
        $node = new PrintNode($args);
        $node->line = $line;
        return $node;
    }

    private function parseBreak(): BreakNode
    {
        $this->consume(Token::T_BREAK);
        $this->skipNewlines();
        return new BreakNode();
    }

    private function parseContinue(): ContinueNode
    {
        $this->consume(Token::T_CONTINUE);
        $this->skipNewlines();
        return new ContinueNode();
    }

    private function parseShariaBlock(): ShariaBlockNode
    {
        $line = $this->current()->getLine();
        $this->matchAny(Token::T_SHARIA, Token::T_VERIFY);
        $this->match(Token::T_COLON);
        $rules = [];
        while (!$this->check(Token::T_END) && !$this->isEOF()) {
            $this->skipNewlines();
            if ($this->check(Token::T_END)) break;
            if ($this->check(Token::T_NO_RIBA)) {
                $rules[] = $this->parseShariaRule(Token::T_NO_RIBA);
            } elseif ($this->check(Token::T_NO_GHARAR)) {
                $rules[] = $this->parseShariaRule(Token::T_NO_GHARAR);
            } elseif ($this->checkIdentifier()) {
                $name  = $this->expectIdentifier();
                $rules[] = (function() use ($name) {
                    $r = new ShariaRuleNode(strtoupper($name));
                    return $r;
                })();
            } else {
                break;
            }
        }
        $this->matchAny(Token::T_END);
        $node = new ShariaBlockNode($rules);
        $node->line = $line;
        return $node;
    }

    private function parseShariaRule(string $type): ShariaRuleNode
    {
        $tok = $this->current();
        $this->advance();
        $this->skipNewlines();
        $rule = match($type) {
            Token::T_NO_RIBA   => 'NO_RIBA',
            Token::T_NO_GHARAR => 'NO_GHARAR',
            default            => strtoupper($tok->getValue()),
        };
        return new ShariaRuleNode($rule);
    }

    private function parseNeuralStatement(): Node
    {
        $this->consume(Token::T_NEURAL);
        if ($this->check(Token::T_INFER)) return $this->parseNeuralInfer();
        if ($this->check(Token::T_ACTIVATE)) return $this->parseNeuralActivate();
        // معرّف بعد neural
        $ident = new IdentifierNode('عصبي');
        $ident->line = $this->current()->getLine();
        return $this->finishExpressionStatement($ident);
    }

    private function parseNeuralInfer(): NeuralInferNode
    {
        $line = $this->current()->getLine();
        $this->matchAny(Token::T_INFER);
        $context = $this->parseExpression();
        $this->skipNewlines();
        $node = new NeuralInferNode($context);
        $node->line = $line;
        return $node;
    }

    private function parseNeuralActivate(): NeuralActivateNode
    {
        $line = $this->current()->getLine();
        $this->matchAny(Token::T_ACTIVATE);
        $cell = $this->parseExpression();
        $this->skipNewlines();
        $node = new NeuralActivateNode($cell);
        $node->line = $line;
        return $node;
    }

    private function parseTryCatch(): TryCatchNode
    {
        $line = $this->current()->getLine();
        $this->consume(Token::T_TRY);
        $this->match(Token::T_COLON);
        $tryBlock  = $this->parseBlock([Token::T_CATCH, Token::T_END]);
        $errorVar  = null;
        $catchBlock = null;

        if ($this->match(Token::T_CATCH)) {
            if ($this->checkIdentifier()) {
                $errorVar = $this->expectIdentifier();
            }
            $this->match(Token::T_COLON);
            $catchBlock = $this->parseBlock([Token::T_END]);
        }

        $this->matchAny(Token::T_END);
        $node = new TryCatchNode($tryBlock, $errorVar, $catchBlock);
        $node->line = $line;
        return $node;
    }

    private function parseThrow(): ThrowNode
    {
        $line = $this->current()->getLine();
        $this->consume(Token::T_THROW);
        $value = $this->parseExpression();
        $this->skipNewlines();
        $node = new ThrowNode($value);
        $node->line = $line;
        return $node;
    }

    private function parseImport(): ImportNode
    {
        $line = $this->current()->getLine();
        $this->consume(Token::T_IMPORT);
        $module = $this->expectIdentifier();
        $from   = null;
        if ($this->match(Token::T_FROM)) {
            $from = $this->expectIdentifier();
        }
        $this->skipNewlines();
        $node = new ImportNode($module, $from);
        $node->line = $line;
        return $node;
    }

    private function parseExpressionStatement(): Node
    {
        $expr = $this->parseExpression();

        // إسناد مركّب: x += 1، x = y
        $tok = $this->current();
        if (in_array($tok->getType(), [Token::T_ASSIGN, Token::T_PLUS_EQ, Token::T_MINUS_EQ, Token::T_MUL_EQ, Token::T_DIV_EQ], true)) {
            $op = $tok->getValue();
            $this->advance();
            $value = $this->parseExpression();
            $this->skipNewlines();
            $node = new AssignNode($expr, $value, (string)$op);
            $node->line = $expr->line;
            return $node;
        }

        return $this->finishExpressionStatement($expr);
    }

    private function finishExpressionStatement(Node $expr): Node
    {
        $this->skipNewlines();
        return $expr;
    }

    private function parseSkip(): Node
    {
        $this->advance();
        return new LiteralNode(null);
    }

    // ── التعبيرات ─────────────────────────────────────────────────────────────

    private function parseExpression(): Node
    {
        return $this->parseOr();
    }

    private function parseOr(): Node
    {
        $left = $this->parseAnd();
        while ($this->check(Token::T_OR)) {
            $op = $this->current()->getValue();
            $this->advance();
            $right = $this->parseAnd();
            $node  = new BinaryOpNode('or', $left, $right);
            $node->line = $left->line;
            $left  = $node;
        }
        return $left;
    }

    private function parseAnd(): Node
    {
        $left = $this->parseNot();
        while ($this->check(Token::T_AND)) {
            $this->advance();
            $right = $this->parseNot();
            $node  = new BinaryOpNode('and', $left, $right);
            $node->line = $left->line;
            $left  = $node;
        }
        return $left;
    }

    private function parseNot(): Node
    {
        if ($this->check(Token::T_NOT)) {
            $line = $this->current()->getLine();
            $this->advance();
            $operand = $this->parseNot();
            $node    = new UnaryOpNode('not', $operand);
            $node->line = $line;
            return $node;
        }
        return $this->parseComparison();
    }

    private function parseComparison(): Node
    {
        $left = $this->parseAddSub();
        while ($this->checkAny(Token::T_EQ, Token::T_NEQ, Token::T_LT, Token::T_LTE, Token::T_GT, Token::T_GTE)) {
            $op = $this->current()->getValue();
            $this->advance();
            $right = $this->parseAddSub();
            $node  = new BinaryOpNode((string)$op, $left, $right);
            $node->line = $left->line;
            $left  = $node;
        }
        return $left;
    }

    private function parseAddSub(): Node
    {
        $left = $this->parseMulDiv();
        while ($this->checkAny(Token::T_PLUS, Token::T_MINUS)) {
            $op = $this->current()->getValue();
            $this->advance();
            $right = $this->parseMulDiv();
            $node  = new BinaryOpNode((string)$op, $left, $right);
            $node->line = $left->line;
            $left  = $node;
        }
        return $left;
    }

    private function parseMulDiv(): Node
    {
        $left = $this->parseUnary();
        while ($this->checkAny(Token::T_MULTIPLY, Token::T_DIVIDE, Token::T_MODULO, Token::T_POWER, Token::T_FLOOR_DIV)) {
            $op = $this->current()->getValue();
            $this->advance();
            $right = $this->parseUnary();
            $node  = new BinaryOpNode((string)$op, $left, $right);
            $node->line = $left->line;
            $left  = $node;
        }
        return $left;
    }

    private function parseUnary(): Node
    {
        if ($this->check(Token::T_MINUS)) {
            $line = $this->current()->getLine();
            $this->advance();
            $operand = $this->parseUnary();
            $node    = new UnaryOpNode('-', $operand);
            $node->line = $line;
            return $node;
        }
        return $this->parsePostfix();
    }

    private function parsePostfix(): Node
    {
        $expr = $this->parsePrimary();

        while (true) {
            if ($this->match(Token::T_DOT)) {
                $prop = $this->expectIdentifier();
                $node = new MemberNode($expr, $prop);
                $node->line = $expr->line;
                $expr = $node;
            } elseif ($this->check(Token::T_LBRACKET)) {
                $this->advance();
                $index = $this->parseExpression();
                $this->consume(Token::T_RBRACKET);
                $node  = new IndexNode($expr, $index);
                $node->line = $expr->line;
                $expr  = $node;
            } elseif ($this->check(Token::T_LPAREN)) {
                $this->advance();
                $args = [];
                while (!$this->check(Token::T_RPAREN) && !$this->isEOF()) {
                    $args[] = $this->parseExpression();
                    if (!$this->match(Token::T_COMMA)) break;
                }
                $this->consume(Token::T_RPAREN);
                $node = new CallNode($expr, $args);
                $node->line = $expr->line;
                $expr = $node;
            } else {
                break;
            }
        }

        return $expr;
    }

    private function parsePrimary(): Node
    {
        $tok  = $this->current();
        $line = $tok->getLine();

        // قيم حرفية
        if ($tok->is(Token::T_NUMBER) || $tok->is(Token::T_STRING)
            || $tok->is(Token::T_BOOL_TRUE) || $tok->is(Token::T_BOOL_FALSE)
            || $tok->is(Token::T_NULL)
        ) {
            $this->advance();
            $node = new LiteralNode($tok->getValue());
            $node->line = $line;
            return $node;
        }

        // قائمة: [أ، ب]
        if ($tok->is(Token::T_LBRACKET)) {
            return $this->parseListLiteral();
        }

        // كائن: {مفتاح: قيمة}
        if ($tok->is(Token::T_LBRACE)) {
            return $this->parseObjectLiteral();
        }

        // أقواس: (تعبير)
        if ($tok->is(Token::T_LPAREN)) {
            $this->advance();
            $expr = $this->parseExpression();
            $this->consume(Token::T_RPAREN);
            return $expr;
        }

        // معرّف
        if ($tok->is(Token::T_IDENTIFIER)) {
            $this->advance();
            $node = new IdentifierNode((string)$tok->getValue());
            $node->line = $line;
            return $node;
        }

        // استدلال عصبي مضمَّن
        if ($tok->is(Token::T_INFER)) {
            $this->advance();
            $ctx  = $this->parsePrimary();
            $node = new NeuralInferNode($ctx);
            $node->line = $line;
            return $node;
        }

        // قيمة booleanية من كلمة مفتاحية
        if ($tok->is(Token::T_HALAL)) {
            $this->advance();
            $node = new LiteralNode(true);
            $node->line = $line;
            return $node;
        }
        if ($tok->is(Token::T_HARAM)) {
            $this->advance();
            $node = new LiteralNode(false);
            $node->line = $line;
            return $node;
        }

        // تجاهل NEWLINE/INDENT/DEDENT وإعادة المحاولة
        if ($tok->is(Token::T_NEWLINE) || $tok->is(Token::T_INDENT) || $tok->is(Token::T_DEDENT)) {
            $this->advance();
            return $this->parsePrimary();
        }

        // fallback: null
        $this->advance();
        $node = new LiteralNode(null);
        $node->line = $line;
        return $node;
    }

    private function parseListLiteral(): ListNode
    {
        $line = $this->current()->getLine();
        $this->consume(Token::T_LBRACKET);
        $elements = [];
        while (!$this->check(Token::T_RBRACKET) && !$this->isEOF()) {
            $this->skipNewlines();
            if ($this->check(Token::T_RBRACKET)) break;
            $elements[] = $this->parseExpression();
            $this->match(Token::T_COMMA);
        }
        $this->consume(Token::T_RBRACKET);
        $node = new ListNode($elements);
        $node->line = $line;
        return $node;
    }

    private function parseObjectLiteral(): ObjectNode
    {
        $line = $this->current()->getLine();
        $this->consume(Token::T_LBRACE);
        $pairs = [];
        while (!$this->check(Token::T_RBRACE) && !$this->isEOF()) {
            $this->skipNewlines();
            if ($this->check(Token::T_RBRACE)) break;
            // المفتاح يمكن أن يكون معرّف أو نص
            $key = $this->check(Token::T_STRING)
                ? (string)$this->advance()->getValue()
                : $this->expectIdentifier();
            $this->consume(Token::T_COLON);
            $pairs[$key] = $this->parseExpression();
            $this->match(Token::T_COMMA);
        }
        $this->consume(Token::T_RBRACE);
        $node = new ObjectNode($pairs);
        $node->line = $line;
        return $node;
    }

    // ── الكتل ────────────────────────────────────────────────────────────────

    /**
     * @param string[] $stopTokens
     */
    private function parseBlock(array $stopTokens): BlockNode
    {
        $statements = [];
        $this->skipNewlines();

        while (!$this->isEOF()) {
            $this->skipNewlines();
            if ($this->isEOF()) break;
            if ($this->checkAny(...$stopTokens)) break;
            $statements[] = $this->parseStatement();
        }

        return new BlockNode($statements);
    }

    // ── أدوات مساعدة ─────────────────────────────────────────────────────────

    private function current(): Token
    {
        return $this->pos < $this->count
            ? $this->tokens[$this->pos]
            : new Token(Token::T_EOF, null);
    }

    private function advance(): Token
    {
        $tok = $this->current();
        if ($this->pos < $this->count) $this->pos++;
        return $tok;
    }

    private function isEOF(): bool
    {
        return $this->pos >= $this->count || $this->current()->is(Token::T_EOF);
    }

    private function check(string $type): bool
    {
        return $this->current()->is($type);
    }

    private function checkAny(string ...$types): bool
    {
        foreach ($types as $type) {
            if ($this->current()->is($type)) return true;
        }
        return false;
    }

    private function checkIdentifier(): bool
    {
        return $this->current()->is(Token::T_IDENTIFIER);
    }

    private function match(string $type): bool
    {
        if ($this->check($type)) {
            $this->advance();
            return true;
        }
        return false;
    }

    private function matchAny(string ...$types): bool
    {
        foreach ($types as $type) {
            if ($this->match($type)) return true;
        }
        return false;
    }

    private function consume(string $type): Token
    {
        if (!$this->check($type)) {
            $tok = $this->current();
            throw new SHLError(
                "توقعت '$type' لكن وجدت '{$tok->getType()}' (القيمة: {$tok->getValue()})",
                $tok->getLine()
            );
        }
        return $this->advance();
    }

    private function expectIdentifier(): string
    {
        if ($this->check(Token::T_IDENTIFIER)) {
            return (string)$this->advance()->getValue();
        }
        // بعض الكلمات المفتاحية يمكن أن تكون أسماء (context-dependent)
        $tok = $this->current();
        if (!$tok->is(Token::T_EOF) && !$tok->is(Token::T_NEWLINE)) {
            $this->advance();
            return (string)$tok->getValue();
        }
        throw new SHLError("توقعت معرّفاً — Expected identifier", $tok->getLine());
    }

    private function skipNewlines(): void
    {
        while ($this->checkAny(Token::T_NEWLINE, Token::T_INDENT, Token::T_DEDENT)) {
            $this->advance();
        }
    }
}
