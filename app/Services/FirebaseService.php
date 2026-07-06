<?php

namespace App\Services;

use Kreait\Firebase\Factory;
use Kreait\Firebase\ServiceAccount;
use Illuminate\Support\Facades\Log;
use Exception;

/**
 * خدمة Firebase المتكاملة
 *
 * توفر جميع خدمات Firebase من Authentication حتى Real-time Database و Cloud Messaging
 */
class FirebaseService
{
    protected $firebase;
    protected $auth;
    protected $database;
    protected $messaging;

    public function __construct()
    {
        try {
            $serviceAccountPath = storage_path(
                'app/firebase/' . config('services.firebase.service_account_file')
            );

            $this->firebase = (new Factory)
                ->withServiceAccount($serviceAccountPath)
                ->withDatabaseUri(config('services.firebase.database_uri'))
                ->create();

            $this->auth = $this->firebase->getAuth();
            $this->database = $this->firebase->getDatabase();
            $this->messaging = $this->firebase->getMessaging();

            Log::channel('firebase')->info('Firebase متصل بنجاح');
        } catch (Exception $e) {
            Log::channel('firebase')->error('خطأ في الاتصال بـ Firebase: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * إنشاء مستخدم Firebase جديد
     */
    public function createUser(string $email, string $password, array $claims = [])
    {
        try {
            $user = $this->auth->createUser([
                'email' => $email,
                'password' => $password,
                'displayName' => $claims['name'] ?? '',
                'phoneNumber' => $claims['phone'] ?? '',
            ]);

            if (!empty($claims)) {
                $this->auth->setCustomUserClaims($user->uid, $claims);
            }

            Log::channel('firebase')->info("تم إنشاء مستخدم Firebase: {$email}");

            return [
                'success' => true,
                'uid' => $user->uid,
                'email' => $user->email,
            ];

        } catch (Exception $e) {
            Log::channel('firebase')->error("خطأ في إنشاء مستخدم: {$e->getMessage()}");
            throw $e;
        }
    }

    /**
     * كتابة بيانات إلى Realtime Database
     */
    public function writeData(string $path, array $data)
    {
        try {
            $this->database->getReference($path)->set($data);

            Log::channel('firebase')->info("تم كتابة البيانات إلى: {$path}");

            return ['success' => true];

        } catch (Exception $e) {
            Log::channel('firebase')->error("خطأ في كتابة البيانات: {$e->getMessage()}");
            throw $e;
        }
    }

    /**
     * قراءة بيانات من Realtime Database
     */
    public function readData(string $path)
    {
        try {
            $snapshot = $this->database->getReference($path)->getSnapshot();

            $data = $snapshot->exists() ? $snapshot->getValue() : null;

            Log::channel('firebase')->info("تم قراءة البيانات من: {$path}");

            return [
                'success' => true,
                'data' => $data,
            ];

        } catch (Exception $e) {
            Log::channel('firebase')->error("خطأ في قراءة البيانات: {$e->getMessage()}");
            throw $e;
        }
    }

    /**
     * إرسال إشعار Push عبر Firebase Cloud Messaging
     */
    public function sendPushNotification(string $deviceToken, array $notification, array $data = [])
    {
        try {
            $message = $this->messaging->withData($data)
                ->withNotification($notification['title'], $notification['body'])
                ->toToken($deviceToken);

            $result = $this->messaging->send($message);

            Log::channel('firebase')->info("تم إرسال إشعار بنجاح إلى: {$deviceToken}");

            return [
                'success' => true,
                'message_id' => $result,
            ];

        } catch (Exception $e) {
            Log::channel('firebase')->error("خطأ في إرسال الإشعار: {$e->getMessage()}");
            throw $e;
        }
    }

    /**
     * إرسال إشعار إلى مجموعة محددة
     */
    public function sendTopicNotification(string $topic, array $notification, array $data = [])
    {
        try {
            $message = $this->messaging->withData($data)
                ->withNotification($notification['title'], $notification['body'])
                ->toTopic($topic);

            $result = $this->messaging->send($message);

            Log::channel('firebase')->info("تم إرسال إشعار للمجموعة: {$topic}");

            return [
                'success' => true,
                'message_id' => $result,
            ];

        } catch (Exception $e) {
            Log::channel('firebase')->error("خطأ في إرسال الإشعار للمجموعة: {$e->getMessage()}");
            throw $e;
        }
    }

    /**
     * الاشتراك في مجموعة من الإشعارات
     */
    public function subscribeToTopic(string $deviceToken, string $topic)
    {
        try {
            $this->messaging->subscribeToTopic([$deviceToken], $topic);

            Log::channel('firebase')->info("تم الاشتراك في المجموعة: {$topic}");

            return ['success' => true];

        } catch (Exception $e) {
            Log::channel('firebase')->error("خطأ في الاشتراك في المجموعة: {$e->getMessage()}");
            throw $e;
        }
    }

    /**
     * إلغاء الاشتراك من مجموعة
     */
    public function unsubscribeFromTopic(string $deviceToken, string $topic)
    {
        try {
            $this->messaging->unsubscribeFromTopic([$deviceToken], $topic);

            Log::channel('firebase')->info("تم إلغاء الاشتراك من المجموعة: {$topic}");

            return ['success' => true];

        } catch (Exception $e) {
            Log::channel('firebase')->error("خطأ في إلغاء الاشتراك: {$e->getMessage()}");
            throw $e;
        }
    }
}
