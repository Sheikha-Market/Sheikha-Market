<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * نموذج الملفات
 * 
 * يحتفظ بسجل جميع الملفات المرفوعة إلى Google Cloud Storage
 */
class File extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'filename',
        'path',
        'url',
        'category',
        'description',
        'size',
        'mime_type',
    ];

    protected $casts = [
        'size' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * علاقة: الملف ينتمي إلى مستخدم
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * حساب حجم الملف بصيغة بشرية
     */
    public function getHumanFileSize()
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $size = $this->size;
        
        for ($i = 0; $i < count($units) && $size >= 1024; $i++) {
            $size /= 1024;
        }
        
        return round($size, 2) . ' ' . $units[$i];
    }

    /**
     * معرّف الملف الفريد
     */
    public function getUniqueId()
    {
        return md5($this->id . $this->path);
    }
}
