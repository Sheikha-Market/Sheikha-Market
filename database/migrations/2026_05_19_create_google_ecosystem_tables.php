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
        // جدول الملفات
        Schema::create('files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('filename');
            $table->string('path');
            $table->string('url');
            $table->enum('category', ['products', 'documents', 'backups', 'analytics', 'images']);
            $table->text('description')->nullable();
            $table->bigInteger('size');
            $table->string('mime_type');
            $table->timestamps();
            $table->softDeletes();

            $table->index('user_id');
            $table->index('category');
            $table->index('created_at');
        });

        // جدول المعاملات
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('SAR');
            $table->enum('payment_method', ['google_pay', 'stripe', 'apple_pay', 'bank_transfer']);
            $table->enum('status', ['pending', 'completed', 'failed', 'refunded']);
            $table->string('token')->nullable();
            $table->json('metadata')->nullable();
            $table->string('reference_id')->nullable()->unique();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('user_id');
            $table->index('status');
            $table->index('created_at');
            $table->index('reference_id');
        });

        // جدول الأحداث التحليلية
        Schema::create('analytics_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('event_name');
            $table->json('parameters')->nullable();
            $table->string('ip_address');
            $table->text('user_agent');
            $table->string('page_path')->nullable();
            $table->string('referrer')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('event_name');
            $table->index('created_at');
        });

        // جدول النسخ الاحتياطية
        Schema::create('backups', function (Blueprint $table) {
            $table->id();
            $table->string('filename');
            $table->string('path');
            $table->bigInteger('size');
            $table->enum('type', ['manual', 'automatic', 'scheduled']);
            $table->enum('status', ['pending', 'completed', 'failed']);
            $table->text('notes')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('type');
            $table->index('status');
            $table->index('created_at');
        });
    }

    /**
     * إرجاع الهجرة
     */
    public function down(): void
    {
        Schema::dropIfExists('files');
        Schema::dropIfExists('transactions');
        Schema::dropIfExists('analytics_events');
        Schema::dropIfExists('backups');
    }
};
