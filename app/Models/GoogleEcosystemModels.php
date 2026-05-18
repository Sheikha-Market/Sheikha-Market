<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * نموذج المعاملات المالية
 */
class Transaction extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'amount',
        'currency',
        'payment_method',
        'status',
        'token',
        'metadata',
        'reference_id',
        'completed_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'metadata' => 'array',
        'completed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * معاملات ناجحة فقط
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * معاملات في آخر 30 يوم
     */
    public function scopeRecentMonth($query)
    {
        return $query->where('completed_at', '>=', now()->subMonth());
    }
}

/**
 * نموذج أحداث التحليلات
 */
class AnalyticsEvent extends Model
{
    protected $fillable = [
        'user_id',
        'event_name',
        'parameters',
        'ip_address',
        'user_agent',
        'page_path',
        'referrer',
    ];

    protected $casts = [
        'parameters' => 'array',
        'created_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class)->nullable();
    }

    /**
     * أحداث اليوم
     */
    public function scopeToday($query)
    {
        return $query->whereDate('created_at', today());
    }

    /**
     * إحصائيات الأحداث
     */
    public function scopeStats($query)
    {
        return $query->selectRaw('event_name, COUNT(*) as count')
            ->groupBy('event_name')
            ->orderByRaw('count DESC');
    }
}

/**
 * نموذج النسخ الاحتياطية
 */
class Backup extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'filename',
        'path',
        'size',
        'type',
        'status',
        'notes',
        'completed_at',
    ];

    protected $casts = [
        'size' => 'integer',
        'completed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * النسخ الاحتياطية الناجحة
     */
    public function scopeSuccessful($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * آخر نسخة احتياطية
     */
    public function scopeLatest($query)
    {
        return $query->orderBy('created_at', 'desc')->first();
    }

    /**
     * حساب إجمالي حجم النسخ الاحتياطية
     */
    public static function getTotalSize()
    {
        return self::successful()->sum('size');
    }
}
