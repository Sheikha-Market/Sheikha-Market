<?php

declare(strict_types=1);

namespace Sheikha\NeuralGateway\Language;

use Sheikha\NeuralGateway\Network\SNRNEngine;

/**
 * المكتبة القياسية للغة شيخة — SHL Standard Library
 *
 * تُوفِّر الدوال المدمجة لكل برنامج SHL:
 *
 * 📐 رياضيات   — أساسيات + إسلامية (زكاة، جذر، قوة)
 * 📝 نصوص      — معالجة عربية + إنجليزية
 * 📅 تاريخ     — ميلادي + هجري
 * ⚖️ شريعة     — زكاة، ربا، غرر، مقاصد، حلال/حرام
 * 🧠 عصبي      — استدلال، تفعيل، حالة الشبكة
 * 📦 قوائم     — map، filter، reduce، sort
 * 🖨️ إخراج     — اطبع، حوّل
 * 🔐 تشفير     — تجزئة آمنة
 *
 * "إِنَّا أَنزَلْنَاهُ قُرْآنًا عَرَبِيًّا لَّعَلَّكُمْ تَعْقِلُونَ" — يوسف:2
 */
class StandardLibrary
{
    /**
     * بناء البيئة العامة الكاملة — Build the full global environment
     *
     * @return array<string, mixed>
     */
    public static function build(): array
    {
        return array_merge(
            self::mathFunctions(),
            self::stringFunctions(),
            self::listFunctions(),
            self::ioFunctions(),
            self::shariaFunctions(),
            self::neuralFunctions(),
            self::dateFunctions(),
            self::typeFunctions(),
            self::systemFunctions(),
            [
                // ثوابت
                'π'         => M_PI,
                'pi'        => M_PI,
                'ذهب'       => 1.618033988749895,  // النسبة الذهبية
                'phi'       => 1.618033988749895,
                'لا_نهاية' => INF,
                'infinity'  => INF,

                // إشارة للمخرجات
                '__sharia_violations__' => [],
            ]
        );
    }

    /**
     * @return array<string, callable>
     */
    private static function mathFunctions(): array
    {
        $fn = function(callable $f): callable {
            return fn(array $args, array &$env) => $f(...$args);
        };

        return [
            // حساب أساسي
            'جمع'        => $fn(fn(...$a) => array_sum($a)),
            'sum'        => $fn(fn(...$a) => array_sum($a)),
            'ضرب'        => $fn(fn($a, $b) => $a * $b),
            'قسمة'       => $fn(fn($a, $b) => $b != 0 ? $a / $b : null),
            'بقية'       => $fn(fn($a, $b) => $a % $b),
            'جذر'        => $fn(fn($x) => sqrt(max(0, $x))),
            'sqrt'       => $fn(fn($x) => sqrt(max(0, $x))),
            'قوة'        => $fn(fn($base, $exp) => $base ** $exp),
            'pow'        => $fn(fn($base, $exp) => $base ** $exp),
            'مطلق'       => $fn(fn($x) => abs($x)),
            'abs'        => $fn(fn($x) => abs($x)),
            'تقريب'      => $fn(fn($x, $d = 2) => round($x, (int)$d)),
            'round'      => $fn(fn($x, $d = 2) => round($x, (int)$d)),
            'أقصى'       => $fn(fn(...$a) => max(...(is_array($a[0]) ? $a[0] : $a))),
            'max'        => $fn(fn(...$a) => max(...(is_array($a[0]) ? $a[0] : $a))),
            'أدنى'       => $fn(fn(...$a) => min(...(is_array($a[0]) ? $a[0] : $a))),
            'min'        => $fn(fn(...$a) => min(...(is_array($a[0]) ? $a[0] : $a))),
            'سقف'        => $fn(fn($x) => ceil($x)),
            'ceil'       => $fn(fn($x) => ceil($x)),
            'أرضية'      => $fn(fn($x) => floor($x)),
            'floor'      => $fn(fn($x) => floor($x)),
            'لوغاريتم'   => $fn(fn($x, $b = M_E) => $b == M_E ? log($x) : log($x, $b)),
            'log'        => $fn(fn($x, $b = M_E) => $b == M_E ? log($x) : log($x, $b)),
            'جيب'        => $fn(fn($x) => sin($x)),
            'sin'        => $fn(fn($x) => sin($x)),
            'جيب_تمام'   => $fn(fn($x) => cos($x)),
            'cos'        => $fn(fn($x) => cos($x)),
            'ظل'         => $fn(fn($x) => tan($x)),
            'tan'        => $fn(fn($x) => tan($x)),
            'عشوائي'     => fn(array $args, array &$env) => (float)rand() / PHP_INT_MAX,
            'random'     => fn(array $args, array &$env) => (float)rand() / PHP_INT_MAX,
            'عشوائي_نطاق'=> fn(array $args, array &$env) => rand((int)($args[0] ?? 0), (int)($args[1] ?? 100)),

            // ── الرياضيات الإسلامية ──────────────────────────────────────────
            /**
             * احسب_زكاة(مال, نصاب = 85_gram_gold)
             * الزكاة = 2.5% من المال إذا بلغ النصاب
             */
            'احسب_زكاة'  => function(array $args, array &$env): array {
                $maal   = (float)($args[0] ?? 0);
                $nisab  = (float)($args[1] ?? 5950.0); // تقريباً بالريال السعودي 2026
                $due    = $maal >= $nisab ? round($maal * 0.025, 2) : 0.0;
                return [
                    'مال'    => $maal,
                    'نصاب'   => $nisab,
                    'وجبت'   => $maal >= $nisab,
                    'مقدار'  => $due,
                    'نسبة'   => '2.5%',
                    'مرجع'   => 'ربع العشر — سنة النبي ﷺ',
                ];
            },
            'calculate_zakat' => function(array $args, array &$env): array {
                return StandardLibrary::build()['احسب_زكاة']($args, $env);
            },

            /**
             * حلال_ربح(رأس_مال, ربح_متوقع)
             * يتحقق أن نسبة الربح معقولة ولا ربا
             */
            'حلال_ربح'   => function(array $args, array &$env): array {
                $capital = (float)($args[0] ?? 0);
                $profit  = (float)($args[1] ?? 0);
                $rate    = $capital > 0 ? ($profit / $capital) * 100 : 0;
                return [
                    'رأس_المال' => $capital,
                    'الربح'    => $profit,
                    'النسبة'   => round($rate, 2),
                    'حلال'     => true,   // الربح الحلال لا حد له
                    'ملاحظة'   => 'الربح الحلال جائز، المحرم هو الفائدة الربوية',
                ];
            },
        ];
    }

    /**
     * @return array<string, callable>
     */
    private static function stringFunctions(): array
    {
        $fn = fn(callable $f): callable => fn(array $args, array &$env) => $f(...$args);

        return [
            'طول'           => $fn(fn($s) => mb_strlen((string)$s)),
            'len'           => $fn(fn($s) => mb_strlen((string)$s)),
            'كبير'          => $fn(fn($s) => mb_strtoupper((string)$s)),
            'upper'         => $fn(fn($s) => mb_strtoupper((string)$s)),
            'صغير'          => $fn(fn($s) => mb_strtolower((string)$s)),
            'lower'         => $fn(fn($s) => mb_strtolower((string)$s)),
            'قطّع'          => $fn(fn($s, $sep = ' ') => explode($sep, (string)$s)),
            'split'         => $fn(fn($s, $sep = ' ') => explode($sep, (string)$s)),
            'ادمج'          => $fn(fn($arr, $sep = '') => implode($sep, is_array($arr) ? $arr : [(string)$arr])),
            'join'          => $fn(fn($arr, $sep = '') => implode($sep, is_array($arr) ? $arr : [(string)$arr])),
            'احذف_فراغات'   => $fn(fn($s) => trim((string)$s)),
            'trim'          => $fn(fn($s) => trim((string)$s)),
            'يحتوي'         => $fn(fn($s, $q) => str_contains((string)$s, (string)$q)),
            'contains'      => $fn(fn($s, $q) => str_contains((string)$s, (string)$q)),
            'يبدأ_بـ'       => $fn(fn($s, $q) => str_starts_with((string)$s, (string)$q)),
            'starts_with'   => $fn(fn($s, $q) => str_starts_with((string)$s, (string)$q)),
            'ينتهي_بـ'      => $fn(fn($s, $q) => str_ends_with((string)$s, (string)$q)),
            'ends_with'     => $fn(fn($s, $q) => str_ends_with((string)$s, (string)$q)),
            'استبدل'        => $fn(fn($s, $f, $t) => str_replace((string)$f, (string)$t, (string)$s)),
            'replace'       => $fn(fn($s, $f, $t) => str_replace((string)$f, (string)$t, (string)$s)),
            'قص'            => $fn(fn($s, $start, $len = null) => mb_substr((string)$s, (int)$start, $len)),
            'substr'        => $fn(fn($s, $start, $len = null) => mb_substr((string)$s, (int)$start, $len)),
            'حوّل_رقم'      => $fn(fn($s) => is_numeric($s) ? (strpos((string)$s, '.') !== false ? (float)$s : (int)$s) : null),
            'to_number'     => $fn(fn($s) => is_numeric($s) ? (strpos((string)$s, '.') !== false ? (float)$s : (int)$s) : null),
            'حوّل_نص'       => $fn(fn($v) => (string)$v),
            'to_string'     => $fn(fn($v) => (string)$v),
            'حروف'          => $fn(fn($s) => mb_str_split((string)$s)),
            'chars'         => $fn(fn($s) => mb_str_split((string)$s)),

            // تطبيع عربي
            'طبّع_عربي'     => $fn(fn($s) => preg_replace(['/[أإآ]/u', '/ى/u', '/ة/u', '/[ًٌٍَُِّْـ]/u'],
                                                        ['ا', 'ي', 'ه', ''], (string)$s)),
        ];
    }

    /**
     * @return array<string, callable>
     */
    private static function listFunctions(): array
    {
        return [
            'قائمة'   => fn(array $args, array &$env) => $args,
            'list'    => fn(array $args, array &$env) => $args,
            'أضف'     => function(array $args, array &$env): array {
                $list  = is_array($args[0] ?? null) ? $args[0] : [];
                $list[] = $args[1] ?? null;
                return $list;
            },
            'append'  => function(array $args, array &$env): array {
                $list  = is_array($args[0] ?? null) ? $args[0] : [];
                $list[] = $args[1] ?? null;
                return $list;
            },
            'احذف'    => function(array $args, array &$env): array {
                $list = is_array($args[0] ?? null) ? $args[0] : [];
                $idx  = (int)($args[1] ?? 0);
                array_splice($list, $idx, 1);
                return $list;
            },
            'رتّب'    => function(array $args, array &$env): array {
                $list = is_array($args[0] ?? null) ? $args[0] : [];
                sort($list);
                return $list;
            },
            'sort'    => function(array $args, array &$env): array {
                $list = is_array($args[0] ?? null) ? $args[0] : [];
                sort($list);
                return $list;
            },
            'اعكس'    => function(array $args, array &$env): array {
                return array_reverse(is_array($args[0] ?? null) ? $args[0] : []);
            },
            'reverse' => function(array $args, array &$env): array {
                return array_reverse(is_array($args[0] ?? null) ? $args[0] : []);
            },
            'خرط'     => function(array $args, array &$env): array {
                $list = is_array($args[0] ?? null) ? $args[0] : [];
                $fn   = $args[1] ?? null;
                if (!is_callable($fn)) return $list;
                return array_map(fn($x) => $fn([$x], $env), $list);
            },
            'map'     => function(array $args, array &$env): array {
                $list = is_array($args[0] ?? null) ? $args[0] : [];
                $fn   = $args[1] ?? null;
                if (!is_callable($fn)) return $list;
                return array_map(fn($x) => $fn([$x], $env), $list);
            },
            'صفّ'     => function(array $args, array &$env): array {
                $list = is_array($args[0] ?? null) ? $args[0] : [];
                $fn   = $args[1] ?? null;
                if (!is_callable($fn)) return $list;
                return array_values(array_filter($list, fn($x) => (bool)$fn([$x], $env)));
            },
            'filter'  => function(array $args, array &$env): array {
                $list = is_array($args[0] ?? null) ? $args[0] : [];
                $fn   = $args[1] ?? null;
                if (!is_callable($fn)) return $list;
                return array_values(array_filter($list, fn($x) => (bool)$fn([$x], $env)));
            },
            'اجمع'    => function(array $args, array &$env): mixed {
                $list = is_array($args[0] ?? null) ? $args[0] : [];
                $fn   = $args[1] ?? null;
                $init = $args[2] ?? 0;
                if (!is_callable($fn)) return array_sum($list);
                return array_reduce($list, fn($acc, $x) => $fn([$acc, $x], $env), $init);
            },
            'reduce'  => function(array $args, array &$env): mixed {
                return StandardLibrary::build()['اجمع']($args, $env);
            },
            'يحتوي_على' => fn(array $args, array &$env) => in_array($args[1] ?? null, is_array($args[0] ?? null) ? $args[0] : []),
            'in_list'   => fn(array $args, array &$env) => in_array($args[1] ?? null, is_array($args[0] ?? null) ? $args[0] : []),
            'طول_قائمة' => fn(array $args, array &$env) => count(is_array($args[0] ?? null) ? $args[0] : []),
            'فريد'      => fn(array $args, array &$env) => array_values(array_unique(is_array($args[0] ?? null) ? $args[0] : [])),
            'unique'    => fn(array $args, array &$env) => array_values(array_unique(is_array($args[0] ?? null) ? $args[0] : [])),
            'مجموع'     => fn(array $args, array &$env) => array_sum(is_array($args[0] ?? null) ? $args[0] : []),
            'total'     => fn(array $args, array &$env) => array_sum(is_array($args[0] ?? null) ? $args[0] : []),
        ];
    }

    /**
     * @return array<string, callable>
     */
    private static function ioFunctions(): array
    {
        return [
            'اطبع'   => fn(array $args, array &$env) => implode(' ', array_map(fn($a) => self::shlToString($a), $args)),
            'print'  => fn(array $args, array &$env) => implode(' ', array_map(fn($a) => self::shlToString($a), $args)),
            'طباعة' => fn(array $args, array &$env) => implode(' ', array_map(fn($a) => self::shlToString($a), $args)),

            'json'   => fn(array $args, array &$env) => json_encode($args[0] ?? null, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT),
            'من_json'=> fn(array $args, array &$env) => json_decode((string)($args[0] ?? '{}'), true),
        ];
    }

    /**
     * @return array<string, callable>
     */
    private static function shariaFunctions(): array
    {
        return [
            /**
             * ربا(سعر_الفائدة) → حلال/حرام
             */
            'ربا'       => fn(array $args, array &$env) => (float)($args[0] ?? 0) > 0,
            'has_riba'  => fn(array $args, array &$env) => (float)($args[0] ?? 0) > 0,

            /**
             * تحقق_حلال(معاملة) → نتيجة شريعة
             */
            'تحقق_حلال' => function(array $args, array &$env): array {
                $engine = SNRNEngine::getInstance();
                $engine->init();
                $ctx = is_array($args[0] ?? null) ? $args[0] : ['text' => (string)($args[0] ?? '')];
                return $engine->quickHalalCheck($ctx);
            },
            'halal_check' => function(array $args, array &$env): array {
                return StandardLibrary::build()['تحقق_حلال']($args, $env);
            },

            /**
             * استدل_شرعي(سياق) → حكم شرعي
             */
            'استدل_شرعي'  => function(array $args, array &$env): array {
                $engine = SNRNEngine::getInstance();
                $engine->init();
                $ctx = is_array($args[0] ?? null) ? $args[0] : ['text' => (string)($args[0] ?? '')];
                return $engine->infer($ctx);
            },
            'sharia_infer' => function(array $args, array &$env): array {
                return StandardLibrary::build()['استدل_شرعي']($args, $env);
            },

            /**
             * مقاصد(سياق) → تقييم المقاصد الخمس
             */
            'مقاصد'        => function(array $args, array &$env): array {
                $engine = SNRNEngine::getInstance();
                $engine->init();
                $ctx = is_array($args[0] ?? null) ? $args[0] : [];
                return $engine->assessMaqasid($ctx);
            },
            'maqasid'      => function(array $args, array &$env): array {
                return StandardLibrary::build()['مقاصد']($args, $env);
            },

            /**
             * غرر(قيمة) → هل يوجد غرر؟
             */
            'غرر'        => fn(array $args, array &$env) => (bool)($args[0] ?? false),
            'has_gharar' => fn(array $args, array &$env) => (bool)($args[0] ?? false),
        ];
    }

    /**
     * @return array<string, callable>
     */
    private static function neuralFunctions(): array
    {
        return [
            /**
             * حالة_الشبكة() → حالة SNRN
             */
            'حالة_الشبكة'  => function(array $args, array &$env): array {
                $engine = SNRNEngine::getInstance();
                return $engine->status();
            },
            'network_status' => function(array $args, array &$env): array {
                return StandardLibrary::build()['حالة_الشبكة']($args, $env);
            },

            /**
             * فعّل_الشبكة() → تفعيل وإرجاع الحالة
             */
            'فعّل_الشبكة'  => function(array $args, array &$env): array {
                $engine = SNRNEngine::getInstance();
                return $engine->init();
            },
            'activate_network' => function(array $args, array &$env): array {
                return StandardLibrary::build()['فعّل_الشبكة']($args, $env);
            },

            /**
             * خلايا() → قائمة الخلايا الـ 19
             */
            'خلايا'   => function(array $args, array &$env): array {
                $engine = SNRNEngine::getInstance();
                $engine->init();
                return $engine->listCells();
            },
            'cells'   => function(array $args, array &$env): array {
                return StandardLibrary::build()['خلايا']($args, $env);
            },
        ];
    }

    /**
     * @return array<string, callable>
     */
    private static function dateFunctions(): array
    {
        return [
            'الآن'       => fn(array $args, array &$env) => date('Y-m-d H:i:s'),
            'now'        => fn(array $args, array &$env) => date('Y-m-d H:i:s'),
            'تاريخ'      => fn(array $args, array &$env) => date('Y-m-d'),
            'date'       => fn(array $args, array &$env) => date('Y-m-d'),
            'وقت'        => fn(array $args, array &$env) => date('H:i:s'),
            'time'       => fn(array $args, array &$env) => date('H:i:s'),
            'طابع_زمني' => fn(array $args, array &$env) => time(),
            'timestamp'  => fn(array $args, array &$env) => time(),

            /**
             * هجري(تاريخ_ميلادي) → التاريخ الهجري التقريبي
             * التحويل التقريبي: HY ≈ (Y - 622) * (33/32)
             */
            'هجري'  => function(array $args, array &$env): array {
                $ts      = isset($args[0]) ? strtotime((string)$args[0]) : time();
                $y       = (int)date('Y', $ts);
                $m       = (int)date('m', $ts);
                $d       = (int)date('d', $ts);
                $hy      = (int)(($y - 622) * (33.0 / 32.0));
                $hm_approx = (int)(($m + $hy * 12) % 12) + 1;
                return [
                    'ميلادي' => "$y-$m-$d",
                    'هجري_تقريبي' => "$hy-$hm_approx-$d",
                    'السنة_الهجرية' => $hy,
                    'ملاحظة' => 'تحويل تقريبي — للدقة استخدم مكتبة هجرية متخصصة',
                ];
            },
            'hijri' => function(array $args, array &$env): array {
                return StandardLibrary::build()['هجري']($args, $env);
            },
        ];
    }

    /**
     * @return array<string, callable>
     */
    private static function typeFunctions(): array
    {
        $fn = fn(callable $f): callable => fn(array $args, array &$env) => $f($args[0] ?? null);
        return [
            'نوع'        => $fn(fn($v) => self::shlType($v)),
            'type'       => $fn(fn($v) => self::shlType($v)),
            'رقم؟'       => $fn(fn($v) => is_numeric($v)),
            'is_number'  => $fn(fn($v) => is_numeric($v)),
            'نص؟'        => $fn(fn($v) => is_string($v)),
            'is_string'  => $fn(fn($v) => is_string($v)),
            'قائمة؟'     => $fn(fn($v) => is_array($v)),
            'is_list'    => $fn(fn($v) => is_array($v)),
            'فراغ؟'      => $fn(fn($v) => $v === null),
            'is_null'    => $fn(fn($v) => $v === null),
            'حلال؟'      => $fn(fn($v) => (bool)$v),
            'is_truthy'  => $fn(fn($v) => (bool)$v),
        ];
    }

    /**
     * @return array<string, callable>
     */
    private static function systemFunctions(): array
    {
        return [
            'توقف'   => function(array $args, array &$env): never {
                $msg = (string)($args[0] ?? 'توقف البرنامج');
                throw new SHLError("توقف: $msg");
            },
            'exit'   => function(array $args, array &$env): never {
                $msg = (string)($args[0] ?? 'exit');
                throw new SHLError("exit: $msg");
            },
            'تأكيد'  => function(array $args, array &$env): bool {
                $condition = (bool)($args[0] ?? false);
                $msg       = (string)($args[1] ?? 'فشل التأكيد');
                if (!$condition) {
                    throw new SHLError("تأكيد فاشل: $msg");
                }
                return true;
            },
            'assert' => function(array $args, array &$env): bool {
                return StandardLibrary::build()['تأكيد']($args, $env);
            },
            'بسملة'  => fn(array $args, array &$env) => 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
            'حوقلة'  => fn(array $args, array &$env) => 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
        ];
    }

    // ── الوحدات القابلة للاستيراد ─────────────────────────────────────────────

    /**
     * @return array<string, mixed>|null
     */
    public static function getModule(string $name): ?array
    {
        return match ($name) {
            'رياضيات', 'math'    => self::mathFunctions(),
            'نصوص', 'strings'    => self::stringFunctions(),
            'قوائم', 'lists'     => self::listFunctions(),
            'شريعة', 'sharia'    => self::shariaFunctions(),
            'عصبي', 'neural'     => self::neuralFunctions(),
            'تاريخ', 'datetime'  => self::dateFunctions(),
            default              => null,
        };
    }

    // ── أدوات ────────────────────────────────────────────────────────────────

    public static function shlToString(mixed $v): string
    {
        if ($v === null)  return 'فراغ';
        if ($v === true)  return 'حلال';
        if ($v === false) return 'خطأ';
        if (is_array($v)) return '[' . implode('، ', array_map([self::class, 'shlToString'], $v)) . ']';
        return (string)$v;
    }

    public static function shlType(mixed $v): string
    {
        if ($v === null)  return 'فراغ';
        if (is_bool($v))  return 'بوليان';
        if (is_int($v))   return 'صحيح';
        if (is_float($v)) return 'عشري';
        if (is_string($v))return 'نص';
        if (is_array($v)) return 'قائمة';
        if (is_callable($v)) return 'دالة';
        return 'غير_معروف';
    }
}
