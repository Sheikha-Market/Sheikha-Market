<?php

namespace App\Services;

use Google\Cloud\Storage\StorageClient;
use Illuminate\Support\Facades\Log;
use Exception;

/**
 * خدمة Google Cloud Storage
 * 
 * توفر هذه الخدمة واجهة سهلة للتعامل مع Google Cloud Storage
 * لرفع وتحميل والحذف من الملفات السحابية بأمان عالي
 */
class GoogleCloudStorageService
{
    protected $storageClient;
    protected $bucket;

    /**
     * تهيئة خدمة Google Cloud Storage
     */
    public function __construct()
    {
        try {
            $this->storageClient = new StorageClient([
                'projectId' => config('services.google.cloud_project'),
                'keyFilePath' => storage_path(config('services.google.cloud_key_file')),
            ]);

            $this->bucket = $this->storageClient->bucket(
                config('services.google.cloud_storage_bucket')
            );

            Log::channel('gcs')->info('Google Cloud Storage متصل بنجاح');
        } catch (Exception $e) {
            Log::channel('gcs')->error('خطأ في الاتصال بـ GCS: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * رفع ملف إلى Google Cloud Storage
     * 
     * @param string $filePath      مسار الملف المحلي
     * @param string $remotePath    المسار على السحابة
     * @param array $metadata       بيانات إضافية
     * @return array               معلومات الملف المرفوع
     */
    public function upload(string $filePath, string $remotePath, array $metadata = [])
    {
        try {
            if (!file_exists($filePath)) {
                throw new Exception("الملف غير موجود: {$filePath}");
            }

            $fileContent = file_get_contents($filePath);
            
            $defaultMetadata = [
                'uploaded_at' => now()->toIso8601String(),
                'uploaded_by' => auth()?->user()?->id ?? 'anonymous',
                'original_filename' => basename($filePath),
            ];

            $allMetadata = array_merge($defaultMetadata, $metadata);

            $this->bucket->upload($fileContent, [
                'name' => $remotePath,
                'metadata' => $allMetadata,
            ]);

            Log::channel('gcs')->info("تم رفع الملف بنجاح: {$remotePath}");

            return [
                'success' => true,
                'path' => $remotePath,
                'url' => $this->getPublicUrl($remotePath),
                'size' => filesize($filePath),
                'uploaded_at' => now(),
            ];

        } catch (Exception $e) {
            Log::channel('gcs')->error("خطأ في رفع الملف: {$e->getMessage()}");
            throw $e;
        }
    }

    /**
     * تحميل ملف من Google Cloud Storage
     * 
     * @param string $remotePath    المسار على السحابة
     * @param string $localPath     المسار المحلي للحفظ
     * @return bool                 نجاح العملية
     */
    public function download(string $remotePath, string $localPath)
    {
        try {
            $object = $this->bucket->object($remotePath);
            
            if (!$object->exists()) {
                throw new Exception("الملف غير موجود على السحابة: {$remotePath}");
            }

            $fileContent = $object->downloadAsString();
            file_put_contents($localPath, $fileContent);

            Log::channel('gcs')->info("تم تحميل الملف بنجاح: {$remotePath}");

            return true;

        } catch (Exception $e) {
            Log::channel('gcs')->error("خطأ في تحميل الملف: {$e->getMessage()}");
            throw $e;
        }
    }

    /**
     * حذف ملف من Google Cloud Storage
     * 
     * @param string $remotePath    المسار على السحابة
     * @return bool                 نجاح العملية
     */
    public function delete(string $remotePath)
    {
        try {
            $this->bucket->object($remotePath)->delete();

            Log::channel('gcs')->info("تم حذف الملف بنجاح: {$remotePath}");

            return true;

        } catch (Exception $e) {
            Log::channel('gcs')->error("خطأ في حذف الملف: {$e->getMessage()}");
            throw $e;
        }
    }

    /**
     * الحصول على رابط عام للملف
     * 
     * @param string $remotePath    المسار على السحابة
     * @return string               رابط الملف العام
     */
    public function getPublicUrl(string $remotePath)
    {
        return sprintf(
            'https://storage.googleapis.com/%s/%s',
            config('services.google.cloud_storage_bucket'),
            $remotePath
        );
    }

    /**
     * الحصول على رابط موقّت للملف
     * 
     * @param string $remotePath    المسار على السحابة
     * @param int $expirationTime   مدة انتهاء الصلاحية بالدقائق
     * @return string               رابط موقّت
     */
    public function getSignedUrl(string $remotePath, int $expirationTime = 60)
    {
        try {
            $object = $this->bucket->object($remotePath);

            $signedUrl = $object->signedUrl(
                new \DateTime("+{$expirationTime} minutes")
            );

            Log::channel('gcs')->info("تم إنشاء رابط موقّت: {$remotePath}");

            return $signedUrl;

        } catch (Exception $e) {
            Log::channel('gcs')->error("خطأ في إنشاء الرابط الموقّت: {$e->getMessage()}");
            throw $e;
        }
    }

    /**
     * قائمة بجميع الملفات في مجلد معين
     * 
     * @param string $prefix        بادئة المسار
     * @return array               قائمة الملفات
     */
    public function listFiles(string $prefix = '')
    {
        try {
            $objects = $this->bucket->objects(['prefix' => $prefix]);

            $files = [];
            foreach ($objects as $object) {
                $files[] = [
                    'name' => $object->name(),
                    'size' => $object->info()['size'],
                    'updated' => $object->info()['updated'],
                    'url' => $this->getPublicUrl($object->name()),
                ];
            }

            Log::channel('gcs')->info("تم استرجاع قائمة الملفات بنجاح");

            return $files;

        } catch (Exception $e) {
            Log::channel('gcs')->error("خطأ في استرجاع قائمة الملفات: {$e->getMessage()}");
            throw $e;
        }
    }

    /**
     * نسخ احتياطي تلقائي للملفات الهامة
     * 
     * @param string $sourceDir     المجلد المراد نسخه
     * @param string $destPrefix    بادئة المجلد الهدف
     * @return array               إحصائيات النسخ الاحتياطي
     */
    public function backupDirectory(string $sourceDir, string $destPrefix)
    {
        try {
            $files = new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($sourceDir),
                \RecursiveIteratorIterator::LEAVES_ONLY
            );

            $backedUpCount = 0;
            $totalSize = 0;

            foreach ($files as $file) {
                if ($file->isDir()) continue;

                $relativePath = substr($file->getPathname(), strlen($sourceDir));
                $remotePath = $destPrefix . $relativePath;

                $this->upload($file->getPathname(), $remotePath, [
                    'backup_date' => now()->toDateString(),
                ]);

                $backedUpCount++;
                $totalSize += $file->getSize();
            }

            Log::channel('gcs')->info(
                "تم النسخ الاحتياطي بنجاح: {$backedUpCount} ملف، {$totalSize} بايت"
            );

            return [
                'success' => true,
                'backed_up_count' => $backedUpCount,
                'total_size' => $totalSize,
                'backed_up_at' => now(),
            ];

        } catch (Exception $e) {
            Log::channel('gcs')->error("خطأ في النسخ الاحتياطي: {$e->getMessage()}");
            throw $e;
        }
    }
}
