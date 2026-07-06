<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * تشغيل الهجرة
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Google OAuth
            $table->string('google_id')->nullable()->unique()->after('id');
            $table->string('avatar_url')->nullable()->after('email');

            // Firebase
            $table->string('firebase_uid')->nullable()->unique()->after('google_id');

            // مفاتيح الأجهزة
            $table->text('device_tokens')->nullable()->after('firebase_uid');

            // آخر تسجيل دخول
            $table->timestamp('last_login_at')->nullable()->after('email_verified_at');

            // مفتاح API الشخصي
            $table->string('api_token')->nullable()->unique()->after('last_login_at');
        });
    }

    /**
     * إرجاع الهجرة
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'google_id',
                'avatar_url',
                'firebase_uid',
                'device_tokens',
                'last_login_at',
                'api_token',
            ]);
        });
    }
};
