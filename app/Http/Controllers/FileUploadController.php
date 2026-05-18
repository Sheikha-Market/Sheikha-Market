<?php

namespace App\Http\Controllers;

use App\Services\GoogleCloudStorageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Exception;

/**
 * تحكم رفع الملفات إلى Google Cloud Storage
 * 
 * يوفر إمكانية رفع ملفات المنتجات والصور والمستندات بأمان عالي
 */
class FileUploadController extends Controller
{
    protected $gcsService;

    public function __construct(GoogleCloudStorageService $gcsService)
    {
        $this->gcsService = $gcsService;
    }

    /**
     * عرض نموذج رفع الملفات
     */
    public function showUploadForm()
    {
        return view('files.upload');
    }

    /**
     * معالجة رفع الملفات
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'file' => 'required|file|max:52428800', // 50MB max
                'category' => 'required|in:products,documents,backups,analytics,images',
                'description' => 'nullable|string|max:500',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors(),
                ], 422);
            }

            $file = $request->file('file');
            $category = $request->input('category');
            $description = $request->input('description');

            // إنشاء مسار فريد على السحابة
            $remotePath = sprintf(
                '%s/%s/%s_%s',
                $category,
                now()->format('Y/m/d'),
                uniqid(),
                $file->getClientOriginalName()
            );

            // رفع الملف
            $uploadResult = $this->gcsService->upload(
                $file->getPathname(),
                $remotePath,
                [
                    'category' => $category,
                    'description' => $description,
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType(),
                    'user_id' => auth()->id(),
                ]
            );

            // حفظ معلومات الملف في قاعدة البيانات
            \App\Models\File::create([
                'user_id' => auth()->id(),
                'filename' => $file->getClientOriginalName(),
                'path' => $remotePath,
                'url' => $uploadResult['url'],
                'category' => $category,
                'description' => $description,
                'size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
            ]);

            Log::channel('files')->info("تم رفع ملف بنجاح: {$file->getClientOriginalName()}");

            return response()->json([
                'success' => true,
                'message' => 'تم رفع الملف بنجاح',
                'file' => $uploadResult,
            ]);

        } catch (Exception $e) {
            Log::channel('files')->error("خطأ في رفع الملف: {$e->getMessage()}");
            
            return response()->json([
                'success' => false,
                'error' => 'فشل رفع الملف: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * تحميل ملف من السحابة
     */
    public function download($id)
    {
        try {
            $file = \App\Models\File::findOrFail($id);

            // التحقق من الصلاحيات
            if ($file->user_id !== auth()->id() && !auth()->user()->isAdmin()) {
                return response()->json(['error' => 'غير مصرح'], 403);
            }

            return response()->json([
                'success' => true,
                'download_url' => $this->gcsService->getSignedUrl($file->path, 120),
                'filename' => $file->filename,
            ]);

        } catch (Exception $e) {
            Log::channel('files')->error("خطأ في تحميل الملف: {$e->getMessage()}");
            
            return response()->json([
                'success' => false,
                'error' => 'فشل تحميل الملف',
            ], 500);
        }
    }

    /**
     * حذف ملف من السحابة
     */
    public function delete($id)
    {
        try {
            $file = \App\Models\File::findOrFail($id);

            // التحقق من الصلاحيات
            if ($file->user_id !== auth()->id() && !auth()->user()->isAdmin()) {
                return response()->json(['error' => 'غير مصرح'], 403);
            }

            $this->gcsService->delete($file->path);
            $file->delete();

            Log::channel('files')->info("تم حذف ملف: {$file->filename}");

            return response()->json([
                'success' => true,
                'message' => 'تم حذف الملف بنجاح',
            ]);

        } catch (Exception $e) {
            Log::channel('files')->error("خطأ في حذف الملف: {$e->getMessage()}");
            
            return response()->json([
                'success' => false,
                'error' => 'فشل حذف الملف',
            ], 500);
        }
    }

    /**
     * قائمة ملفاتي
     */
    public function myFiles()
    {
        try {
            $files = \App\Models\File::where('user_id', auth()->id())
                ->orderBy('created_at', 'desc')
                ->paginate(20);

            return response()->json([
                'success' => true,
                'files' => $files,
            ]);

        } catch (Exception $e) {
            Log::channel('files')->error("خطأ في استرجاع الملفات: {$e->getMessage()}");
            
            return response()->json([
                'success' => false,
                'error' => 'فشل استرجاع الملفات',
            ], 500);
        }
    }

    /**
     * نسخ احتياطي تلقائي للملفات الهامة
     */
    public function backup()
    {
        try {
            if (!auth()->user()->isAdmin()) {
                return response()->json(['error' => 'غير مصرح'], 403);
            }

            $result = $this->gcsService->backupDirectory(
                storage_path('app/important'),
                'backups/' . now()->format('Y-m-d-His') . '/'
            );

            Log::channel('files')->info("تم النسخ الاحتياطي بنجاح: {$result['backed_up_count']} ملف");

            return response()->json([
                'success' => true,
                'backup' => $result,
            ]);

        } catch (Exception $e) {
            Log::channel('files')->error("خطأ في النسخ الاحتياطي: {$e->getMessage()}");
            
            return response()->json([
                'success' => false,
                'error' => 'فشل النسخ الاحتياطي',
            ], 500);
        }
    }
}
