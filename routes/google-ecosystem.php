<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\FileUploadController;

/*
|--------------------------------------------------------------------------
| Google Ecosystem Routes
|--------------------------------------------------------------------------
|
| جميع المسارات المتعلقة بخدمات Google
|
*/

Route::prefix('auth/google')->name('auth.google.')->group(function () {
    // Google OAuth Redirect
    Route::get('redirect', [GoogleAuthController::class, 'redirectToGoogle'])
        ->name('redirect')
        ->withoutMiddleware(['auth']);

    // Google OAuth Callback
    Route::get('callback', [GoogleAuthController::class, 'handleGoogleCallback'])
        ->name('callback')
        ->withoutMiddleware(['auth']);

    // Get Current User Profile
    Route::get('profile', [GoogleAuthController::class, 'profile'])
        ->name('profile')
        ->middleware('auth');

    // Logout
    Route::post('logout', [GoogleAuthController::class, 'logout'])
        ->name('logout')
        ->middleware('auth');
});

Route::prefix('files')->name('files.')->middleware('auth')->group(function () {
    // Show Upload Form
    Route::get('upload', [FileUploadController::class, 'showUploadForm'])
        ->name('upload_form');

    // Upload File
    Route::post('store', [FileUploadController::class, 'store'])
        ->name('store');

    // Download File
    Route::get('download/{file}', [FileUploadController::class, 'download'])
        ->name('download');

    // Delete File
    Route::delete('delete/{file}', [FileUploadController::class, 'delete'])
        ->name('delete');

    // My Files
    Route::get('my-files', [FileUploadController::class, 'myFiles'])
        ->name('my_files');

    // Backup (Admin Only)
    Route::post('backup', [FileUploadController::class, 'backup'])
        ->middleware('admin')
        ->name('backup');
});
