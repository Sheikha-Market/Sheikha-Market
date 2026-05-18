<?php

declare(strict_types=1);

namespace Sheikha\NeuralGateway\Language\AST;

/**
 * عقدة شجرة الصياغة المجردة الأساسية — Base AST Node
 */
abstract class Node
{
    public int    $line = 0;
    public string $file = '<shl>';
}

/** برنامج كامل */
class ProgramNode extends Node
{
    /** @var Node[] */
    public array $statements;
    public function __construct(array $statements) { $this->statements = $statements; }
}

/** كتلة من الجمل */
class BlockNode extends Node
{
    /** @var Node[] */
    public array $statements;
    public function __construct(array $statements) { $this->statements = $statements; }
}

/** تعريف متغير: ليكن اسم = قيمة */
class LetNode extends Node
{
    public string $name;
    public ?Node  $value;
    public function __construct(string $name, ?Node $value) {
        $this->name  = $name;
        $this->value = $value;
    }
}

/** إسناد: اسم = قيمة */
class AssignNode extends Node
{
    public Node   $target;  // IdentifierNode | IndexNode | MemberNode
    public Node   $value;
    public string $op;      // = += -= *= /=
    public function __construct(Node $target, Node $value, string $op = '=') {
        $this->target = $target;
        $this->value  = $value;
        $this->op     = $op;
    }
}

/** تعريف دالة: دالة اسم(معاملات): ... نهاية */
class FunctionNode extends Node
{
    public string  $name;
    /** @var string[] */
    public array   $params;
    public ?string $defaultReturn;
    public BlockNode $body;
    public function __construct(string $name, array $params, BlockNode $body) {
        $this->name   = $name;
        $this->params = $params;
        $this->body   = $body;
    }
}

/** استدعاء دالة: اسم(مدخلات...) */
class CallNode extends Node
{
    public Node  $callee; // IdentifierNode | MemberNode
    /** @var Node[] */
    public array $args;
    public function __construct(Node $callee, array $args) {
        $this->callee = $callee;
        $this->args   = $args;
    }
}

/** إرجاع: أرجع قيمة */
class ReturnNode extends Node
{
    public ?Node $value;
    public function __construct(?Node $value) { $this->value = $value; }
}

/** طباعة: اطبع(قيمة) */
class PrintNode extends Node
{
    /** @var Node[] */
    public array $args;
    public function __construct(array $args) { $this->args = $args; }
}

/** شرط: إذا ... وإلا ... نهاية */
class IfNode extends Node
{
    public Node      $condition;
    public BlockNode $thenBlock;
    /** @var array<array{condition: Node, block: BlockNode}> */
    public array     $elifClauses;
    public ?BlockNode $elseBlock;
    public function __construct(Node $condition, BlockNode $thenBlock, array $elifClauses = [], ?BlockNode $elseBlock = null) {
        $this->condition   = $condition;
        $this->thenBlock   = $thenBlock;
        $this->elifClauses = $elifClauses;
        $this->elseBlock   = $elseBlock;
    }
}

/** حلقة for: لكل عنصر في قائمة: ... نهاية */
class ForEachNode extends Node
{
    public string    $var;
    public Node      $iterable;
    public BlockNode $body;
    public function __construct(string $var, Node $iterable, BlockNode $body) {
        $this->var      = $var;
        $this->iterable = $iterable;
        $this->body     = $body;
    }
}

/** حلقة while: بينما شرط: ... نهاية */
class WhileNode extends Node
{
    public Node      $condition;
    public BlockNode $body;
    public function __construct(Node $condition, BlockNode $body) {
        $this->condition = $condition;
        $this->body      = $body;
    }
}

/** خروج من الحلقة: اخرج */
class BreakNode extends Node {}

/** تابع الحلقة: تابع */
class ContinueNode extends Node {}

/** عملية ثنائية: أ + ب */
class BinaryOpNode extends Node
{
    public string $op;
    public Node   $left;
    public Node   $right;
    public function __construct(string $op, Node $left, Node $right) {
        $this->op    = $op;
        $this->left  = $left;
        $this->right = $right;
    }
}

/** عملية أحادية: -أ، ليس أ */
class UnaryOpNode extends Node
{
    public string $op;
    public Node   $operand;
    public function __construct(string $op, Node $operand) {
        $this->op      = $op;
        $this->operand = $operand;
    }
}

/** قيمة حرفية: رقم، نص، بوليان، null */
class LiteralNode extends Node
{
    public mixed $value;
    public function __construct(mixed $value) { $this->value = $value; }
}

/** معرّف: اسم متغير أو دالة */
class IdentifierNode extends Node
{
    public string $name;
    public function __construct(string $name) { $this->name = $name; }
}

/** الوصول لعضو: كائن.خاصية */
class MemberNode extends Node
{
    public Node   $object;
    public string $property;
    public function __construct(Node $object, string $property) {
        $this->object   = $object;
        $this->property = $property;
    }
}

/** الوصول بمؤشر: قائمة[فهرس] */
class IndexNode extends Node
{
    public Node $object;
    public Node $index;
    public function __construct(Node $object, Node $index) {
        $this->object = $object;
        $this->index  = $index;
    }
}

/** قائمة حرفية: [أ، ب، ج] */
class ListNode extends Node
{
    /** @var Node[] */
    public array $elements;
    public function __construct(array $elements) { $this->elements = $elements; }
}

/** كائن حرفي: {مفتاح: قيمة} */
class ObjectNode extends Node
{
    /** @var array<string, Node> */
    public array $pairs;
    public function __construct(array $pairs) { $this->pairs = $pairs; }
}

/** كتلة شريعة: تحقق ... نهاية */
class ShariaBlockNode extends Node
{
    /** @var Node[] */
    public array $rules;
    public function __construct(array $rules) { $this->rules = $rules; }
}

/** تحقق شرعي: لا_ربا / لا_غرر / عدل */
class ShariaRuleNode extends Node
{
    public string $rule;  // NO_RIBA | NO_GHARAR | JUSTICE | ZAKAT | WAQF
    public function __construct(string $rule) { $this->rule = $rule; }
}

/** تعليمة استدلال عصبي: استدل(سياق) */
class NeuralInferNode extends Node
{
    public Node $context;
    public function __construct(Node $context) { $this->context = $context; }
}

/** تعليمة تفعيل عصبي: فعّل(خلية) */
class NeuralActivateNode extends Node
{
    public Node $cell;
    public function __construct(Node $cell) { $this->cell = $cell; }
}

/** معالجة الأخطاء: حاول ... التقط خطأ: ... نهاية */
class TryCatchNode extends Node
{
    public BlockNode  $tryBlock;
    public ?string    $errorVar;
    public ?BlockNode $catchBlock;
    public function __construct(BlockNode $tryBlock, ?string $errorVar, ?BlockNode $catchBlock) {
        $this->tryBlock   = $tryBlock;
        $this->errorVar   = $errorVar;
        $this->catchBlock = $catchBlock;
    }
}

/** إطلاق خطأ: أطلق رسالة */
class ThrowNode extends Node
{
    public Node $value;
    public function __construct(Node $value) { $this->value = $value; }
}

/** استيراد: استورد وحدة من حزمة */
class ImportNode extends Node
{
    public string  $module;
    public ?string $from;
    public ?string $alias;
    public function __construct(string $module, ?string $from = null, ?string $alias = null) {
        $this->module = $module;
        $this->from   = $from;
        $this->alias  = $alias;
    }
}
