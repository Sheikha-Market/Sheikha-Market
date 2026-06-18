<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Exception;

/**
 * تحكم تسجيل الدخول عبر Google OAuth 2.0
 *
 * يوفر هذا التحكم إمكانية تسجيل الدخول والتسجيل بسهولة عبر حساب Google
 * مع دعم كامل لـ OAuth 2.0 والأمان العالي
 */
class GoogleAuthController extends Controller
{
    /**
     * توجيه المستخدم إلى صفحة تسجيل الدخول الخاصة بجوجل
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function redirectToGoogle()
    {
        try {
            Log::channel('google-auth')->info('تحويل المستخدم إلى Google OAuth');
            return Socialite::driver('google')->redirect();
        } catch (Exception $e) {
            Log::channel('google-auth')->error('خطأ في التحويل إلى Google: ' . $e->getMessage());
            return redirect()->route('login')->with('error', 'فشل الاتصال بجوجل. حاول لاحقاً.');
        }
    }

    /**
     * استقبال بيانات المستخدم من جوجل بعد التحقق الناجح
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();

            Log::channel('google-auth')->info(
                'استقبال بيانات من Google',
                ['email' => $googleUser->getEmail(), 'name' => $googleUser->getName()]
            );

            // البحث عن المستخدم أو إنشاؤه إذا كان يسجل لأول مرة
            $user = User::where('email', $googleUser->getEmail())->first();

            if (!$user) {
                // إنشاء مستخدم جديد
                $user = User::create([
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'avatar_url' => $googleUser->getAvatar(),
                    'email_verified_at' => now(),
                    'password' => bcrypt(str()->random(32)),
                ]);

                Log::channel('google-auth')->info('تم إنشاء مستخدم جديد: ' . $user->email);
            } else {
                // تحديث بيانات المستخدم الموجود إذا لم يكن له google_id
                if (!$user->google_id) {
                    $user->update([
                        'google_id' => $googleUser->getId(),
                        'avatar_url' => $googleUser->getAvatar(),
                    ]);

                    Log::channel('google-auth')->info('تحديث بيانات Google للمستخدم: ' . $user->email);
                }
            }

            // تسجيل دخول المستخدم
            Auth::login($user, true);

            Log::channel('google-auth')->info('تسجيل دخول ناجح: ' . $user->email);

            return redirect()
                ->route('dashboard')
                ->with('success', 'تم تسجيل الدخول بنجاح عبر Google 🎉');

        } catch (Exception $e) {
            Log::channel('google-auth')->error('خطأ في معالجة callback: ' . $e->getMessage());

            return redirect()
                ->route('login')
                ->with('error', 'فشل تسجيل الدخول عبر جوجل. ' . $e->getMessage());
        }
    }

    /**
     * تسجيل الخروج من النظام
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function logout()
    {
        Auth::logout();
        Log::channel('google-auth')->info('تسجيل خروج المستخدم: ' . Auth::user()?->email);

        return redirect()->route('login')
            ->with('success', 'تم تسجيل الخروج بنجاح');
    }

    /**
     * الحصول على معلومات المستخدم الحالي
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function profile()
    {
        if (!Auth::check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $user = Auth::user();

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar_url' => $user->avatar_url,
                'google_id' => $user->google_id,
                'created_at' => $user->created_at,
            ],
        ]);
    }
}
