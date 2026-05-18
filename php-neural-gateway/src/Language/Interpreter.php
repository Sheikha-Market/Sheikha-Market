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
use Sheikha\NeuralGateway\Network\SNRNEngine;

/**
 * مُفسِّر لغة شيخة — SHL Tree-walk Interpreter
 *
 * ينفّذ شجرة الصياغة المجردة (AST) مباشرةً.
 * يدير البيئات (نطاق المتغيرات) ويستدعي المكتبة القياسية.
 *
 * "صُنْعَ اللَّهِ الَّذِي أَتْقَنَ كُلَّ شَيْءٍ" — النمل:88
 */
class Interpreter
{
    /** @var array<string, mixed> البيئة العامة */
    private array $globalEnv;

    /** @var string[] مخرجات الطباعة */
    private array $output = [];

    /** @var array<array<string, mixed>> مكدس الإطارات */
    private array $callStack = [];

    private int $maxCallDepth = 200;

    public function __construct()
    {
        $this->globalEnv = StandardLibrary::build();
    }

    /**
     * تنفيذ برنامج كامل — Execute a full program
     *
     * @return array{output: string[], result: mixed, shariaViolations: string[]}
     */
    public function execute(ProgramNode $program): array
    {
        $this->output = [];
        $env          = $this->globalEnv;

        try {
            $result = $this->execBlock($program->statements, $env);
        } catch (ReturnSignal $sig) {
            $result = $sig->value;
        } catch (SHLError $e) {
            throw $e;
        }

        return [
            'output'           => $this->output,
            'result'           => $result,
            'shariaViolations' => $this->getShariaViolations($env),
        ];
    }

    // ── تنفيذ الجمل ──────────────────────────────────────────────────────────

    /**
     * @param Node[]               $statements
     * @param array<string, mixed> $env
     */
    private function execBlock(array $statements, array &$env): mixed
    {
        $last = null;
        foreach ($statements as $stmt) {
            $last = $this->execNode($stmt, $env);
        }
        return $last;
    }

    /**
     * @param array<string, mixed> $env
     */
    private function execNode(Node $node, array &$env): mixed
    {
        return match (true) {
            $node instanceof LiteralNode        => $node->value,
            $node instanceof IdentifierNode     => $this->resolveIdentifier($node, $env),
            $node instanceof LetNode            => $this->execLet($node, $env),
            $node instanceof AssignNode         => $this->execAssign($node, $env),
            $node instanceof FunctionNode       => $this->execFunctionDef($node, $env),
            $node instanceof CallNode           => $this->execCall($node, $env),
            $node instanceof ReturnNode         => $this->execReturn($node, $env),
            $node instanceof PrintNode          => $this->execPrint($node, $env),
            $node instanceof IfNode             => $this->execIf($node, $env),
            $node instanceof ForEachNode        => $this->execForEach($node, $env),
            $node instanceof WhileNode          => $this->execWhile($node, $env),
            $node instanceof BreakNode          => throw new BreakSignal(),
            $node instanceof ContinueNode       => throw new ContinueSignal(),
            $node instanceof BinaryOpNode       => $this->execBinaryOp($node, $env),
            $node instanceof UnaryOpNode        => $this->execUnaryOp($node, $env),
            $node instanceof MemberNode         => $this->execMember($node, $env),
            $node instanceof IndexNode          => $this->execIndex($node, $env),
            $node instanceof ListNode           => $this->execList($node, $env),
            $node instanceof ObjectNode         => $this->execObject($node, $env),
            $node instanceof ShariaBlockNode    => $this->execShariaBlock($node, $env),
            $node instanceof ShariaRuleNode     => $this->execShariaRule($node, $env),
            $node instanceof NeuralInferNode    => $this->execNeuralInfer($node, $env),
            $node instanceof NeuralActivateNode => $this->execNeuralActivate($node, $env),
            $node instanceof TryCatchNode       => $this->execTryCatch($node, $env),
            $node instanceof ThrowNode          => $this->execThrow($node, $env),
            $node instanceof ImportNode         => $this->execImport($node, $env),
            default                             => null,
        };
    }

    private function resolveIdentifier(IdentifierNode $node, array &$env): mixed
    {
        $name = $node->name;
        if (array_key_exists($name, $env))       return $env[$name];
        if (array_key_exists($name, $this->globalEnv)) return $this->globalEnv[$name];
        throw new SHLError("المتغيّر غير معرَّف: $name", $node->line);
    }

    private function execLet(LetNode $node, array &$env): mixed
    {
        $value       = $node->value ? $this->execNode($node->value, $env) : null;
        $env[$node->name] = $value;
        return $value;
    }

    private function execAssign(AssignNode $node, array &$env): mixed
    {
        $value = $this->execNode($node->value, $env);

        if ($node->target instanceof IdentifierNode) {
            $name  = $node->target->name;
            $current = $env[$name] ?? $this->globalEnv[$name] ?? null;
            $env[$name] = $this->applyCompoundOp($node->op, $current, $value);
            return $env[$name];
        }

        if ($node->target instanceof MemberNode) {
            $obj  = $this->execNode($node->target->object, $env);
            $prop = $node->target->property;
            if (is_array($obj)) {
                $obj[$prop] = $value;
                // نُحدِّث الأصل
                $this->updateTarget($node->target->object, $obj, $env);
            }
            return $value;
        }

        if ($node->target instanceof IndexNode) {
            $obj   = $this->execNode($node->target->object, $env);
            $index = $this->execNode($node->target->index, $env);
            if (is_array($obj)) {
                $obj[$index] = $value;
                $this->updateTarget($node->target->object, $obj, $env);
            }
            return $value;
        }

        return $value;
    }

    private function applyCompoundOp(string $op, mixed $current, mixed $value): mixed
    {
        return match($op) {
            '+=' => $current + $value,
            '-=' => $current - $value,
            '*=' => $current * $value,
            '/=' => $current / $value,
            default => $value,
        };
    }

    private function updateTarget(Node $target, mixed $newVal, array &$env): void
    {
        if ($target instanceof IdentifierNode) {
            $env[$target->name] = $newVal;
        }
    }

    private function execFunctionDef(FunctionNode $node, array &$env): mixed
    {
        $closure = function(array $args, array $outerEnv) use ($node) {
            if (count($this->callStack) >= $this->maxCallDepth) {
                throw new SHLError("تجاوز عمق الاستدعاء — Stack overflow", $node->line);
            }

            $localEnv = $outerEnv;
            foreach ($node->params as $i => $param) {
                $localEnv[$param] = $args[$i] ?? null;
            }

            $this->callStack[] = ['fn' => $node->name, 'line' => $node->line];

            try {
                $this->execBlock($node->body->statements, $localEnv);
                return null;
            } catch (ReturnSignal $sig) {
                return $sig->value;
            } finally {
                array_pop($this->callStack);
            }
        };

        $env[$node->name] = $closure;
        $this->globalEnv[$node->name] = $closure;
        return null;
    }

    private function execCall(CallNode $node, array &$env): mixed
    {
        $callee = $this->execNode($node->callee, $env);
        $args   = array_map(fn($a) => $this->execNode($a, $env), $node->args);

        if (is_callable($callee)) {
            return $callee($args, $env);
        }

        if (is_array($callee) && isset($callee['__shl_fn__'])) {
            return ($callee['__shl_fn__'])($args, $env);
        }

        $name = ($node->callee instanceof IdentifierNode) ? $node->callee->name : '?';
        throw new SHLError("'$name' ليست دالة قابلة للاستدعاء", $node->line);
    }

    private function execReturn(ReturnNode $node, array &$env): never
    {
        $value = $node->value ? $this->execNode($node->value, $env) : null;
        throw new ReturnSignal($value);
    }

    private function execPrint(PrintNode $node, array &$env): mixed
    {
        $parts = array_map(fn($a) => $this->toString($this->execNode($a, $env)), $node->args);
        $line  = implode(' ', $parts);
        $this->output[] = $line;
        return $line;
    }

    private function execIf(IfNode $node, array &$env): mixed
    {
        if ($this->isTruthy($this->execNode($node->condition, $env))) {
            return $this->execBlock($node->thenBlock->statements, $env);
        }

        foreach ($node->elifClauses as $clause) {
            if ($this->isTruthy($this->execNode($clause['condition'], $env))) {
                return $this->execBlock($clause['block']->statements, $env);
            }
        }

        if ($node->elseBlock !== null) {
            return $this->execBlock($node->elseBlock->statements, $env);
        }

        return null;
    }

    private function execForEach(ForEachNode $node, array &$env): mixed
    {
        $iterable = $this->execNode($node->iterable, $env);
        $last     = null;

        if (!is_array($iterable) && !is_string($iterable)) {
            throw new SHLError("لا يمكن التكرار على قيمة غير قائمة", $node->line);
        }

        $items = is_string($iterable) ? mb_str_split($iterable) : $iterable;

        foreach ($items as $item) {
            $env[$node->var] = $item;
            try {
                $last = $this->execBlock($node->body->statements, $env);
            } catch (BreakSignal) {
                break;
            } catch (ContinueSignal) {
                continue;
            }
        }

        return $last;
    }

    private function execWhile(WhileNode $node, array &$env): mixed
    {
        $last = null;
        while ($this->isTruthy($this->execNode($node->condition, $env))) {
            try {
                $last = $this->execBlock($node->body->statements, $env);
            } catch (BreakSignal) {
                break;
            } catch (ContinueSignal) {
                continue;
            }
        }
        return $last;
    }

    private function execBinaryOp(BinaryOpNode $node, array &$env): mixed
    {
        $left  = $this->execNode($node->left, $env);
        $right = $this->execNode($node->right, $env);

        return match ($node->op) {
            '+'  => is_string($left) || is_string($right)
                    ? $this->toString($left) . $this->toString($right)
                    : $left + $right,
            '-'  => $left - $right,
            '*'  => $left * $right,
            '/'  => $right == 0 ? throw new SHLError("قسمة على صفر", $node->line) : $left / $right,
            '%'  => $left % $right,
            '**' => $left ** $right,
            '//' => intdiv((int)$left, (int)$right),
            '==' => $left == $right,
            '!=' => $left != $right,
            '<'  => $left < $right,
            '<=' => $left <= $right,
            '>'  => $left > $right,
            '>=' => $left >= $right,
            'and'=> $this->isTruthy($left) && $this->isTruthy($right),
            'or' => $this->isTruthy($left) || $this->isTruthy($right),
            default => null,
        };
    }

    private function execUnaryOp(UnaryOpNode $node, array &$env): mixed
    {
        $val = $this->execNode($node->operand, $env);
        return match ($node->op) {
            '-'   => -$val,
            'not' => !$this->isTruthy($val),
            default => $val,
        };
    }

    private function execMember(MemberNode $node, array &$env): mixed
    {
        $obj  = $this->execNode($node->object, $env);
        $prop = $node->property;

        if (is_array($obj)) {
            return $obj[$prop] ?? null;
        }
        if (is_string($obj)) {
            return match ($prop) {
                'طول', 'length', 'len' => mb_strlen($obj),
                'كبير', 'upper'        => mb_strtoupper($obj),
                'صغير', 'lower'        => mb_strtolower($obj),
                'قسّم', 'split'        => mb_str_split($obj),
                default                => null,
            };
        }
        return null;
    }

    private function execIndex(IndexNode $node, array &$env): mixed
    {
        $obj   = $this->execNode($node->object, $env);
        $index = $this->execNode($node->index, $env);
        if (is_array($obj)) return $obj[$index] ?? null;
        if (is_string($obj)) {
            $chars = mb_str_split($obj);
            return $chars[(int)$index] ?? null;
        }
        return null;
    }

    private function execList(ListNode $node, array &$env): array
    {
        return array_map(fn($el) => $this->execNode($el, $env), $node->elements);
    }

    private function execObject(ObjectNode $node, array &$env): array
    {
        $result = [];
        foreach ($node->pairs as $key => $valNode) {
            $result[$key] = $this->execNode($valNode, $env);
        }
        return $result;
    }

    private function execShariaBlock(ShariaBlockNode $node, array &$env): array
    {
        $results = [];
        foreach ($node->rules as $rule) {
            $results[] = $this->execNode($rule, $env);
        }
        return ['shariaCheck' => true, 'rules' => $results, 'allPassed' => !in_array(false, $results, true)];
    }

    private function execShariaRule(ShariaRuleNode $node, array &$env): array
    {
        $engine = SNRNEngine::getInstance();
        $engine->init();

        $ctx = match ($node->rule) {
            'NO_RIBA'   => ['riba' => false],
            'NO_GHARAR' => ['gharar' => false],
            'JUSTICE'   => ['type' => 'JUSTICE'],
            'ZAKAT'     => ['type' => 'ZAKAT'],
            'WAQF'      => ['type' => 'WAQF'],
            default     => ['type' => $node->rule],
        };

        $verdict = $engine->infer($ctx);
        $passed  = in_array($verdict['verdict'], ['HALAL', 'MAKRUH'], true);

        return [
            'rule'    => $node->rule,
            'passed'  => $passed,
            'verdict' => $verdict['verdict'],
        ];
    }

    private function execNeuralInfer(NeuralInferNode $node, array &$env): array
    {
        $engine  = SNRNEngine::getInstance();
        $engine->init();
        $context = $this->execNode($node->context, $env);
        if (!is_array($context)) {
            $context = ['text' => $this->toString($context)];
        }
        return $engine->infer($context);
    }

    private function execNeuralActivate(NeuralActivateNode $node, array &$env): array
    {
        $engine = SNRNEngine::getInstance();
        return $engine->init();
    }

    private function execTryCatch(TryCatchNode $node, array &$env): mixed
    {
        try {
            return $this->execBlock($node->tryBlock->statements, $env);
        } catch (SHLError | \Throwable $e) {
            if ($node->catchBlock !== null) {
                if ($node->errorVar) {
                    $env[$node->errorVar] = $e->getMessage();
                }
                return $this->execBlock($node->catchBlock->statements, $env);
            }
        }
        return null;
    }

    private function execThrow(ThrowNode $node, array &$env): never
    {
        $value   = $this->execNode($node->value, $env);
        $message = $this->toString($value);
        throw new SHLError($message, $node->line);
    }

    private function execImport(ImportNode $node, array &$env): mixed
    {
        // وحدات مدمجة — built-in modules
        $builtins = StandardLibrary::getModule($node->module);
        if ($builtins !== null) {
            $alias = $node->alias ?? $node->module;
            $env[$alias]             = $builtins;
            $this->globalEnv[$alias] = $builtins;
        }
        return null;
    }

    // ── أدوات مساعدة ─────────────────────────────────────────────────────────

    private function isTruthy(mixed $value): bool
    {
        if ($value === null || $value === false || $value === 0 || $value === '' || $value === []) {
            return false;
        }
        return true;
    }

    private function toString(mixed $value): string
    {
        if ($value === null)  return 'فراغ';
        if ($value === true)  return 'حلال';
        if ($value === false) return 'خطأ';
        if (is_array($value)) return '[' . implode('، ', array_map([$this, 'toString'], $value)) . ']';
        return (string)$value;
    }

    /**
     * @param array<string, mixed> $env
     * @return string[]
     */
    private function getShariaViolations(array $env): array
    {
        return $env['__sharia_violations__'] ?? [];
    }

    /**
     * @return string[]
     */
    public function getOutput(): array
    {
        return $this->output;
    }
}
