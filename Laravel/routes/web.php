<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BookingDepositController;
use App\Http\Controllers\BookingFinalPaymentController;
use App\Http\Controllers\PhotoDownloadController;
use App\Http\Controllers\PhotoUploadController;

Route::get('/', function () {
    return view('main');
});

Route::get('/momentia', function () {
    return view('main');
});
Route::prefix('api')->middleware('api')->group(function () {
    Route::post('buoi-chup/{ma_bc}/dat-coc', [BookingDepositController::class, 'store']);
    // Xem báo giá phần còn lại trước khi thanh toán
    Route::get('buoi-chup/{ma_bc}/thanh-toan/quote', [BookingFinalPaymentController::class, 'quote']);

    // Xác nhận thanh toán phần còn lại
    Route::post('buoi-chup/{ma_bc}/thanh-toan', [BookingFinalPaymentController::class, 'store']);

    //tải ảnh gốc/hậu kì
    Route::get('original/{ma_bc}', [PhotoDownloadController::class, 'downloadOriginal']);
    Route::get('edited/{ma_bc}', [PhotoDownloadController::class, 'downloadEdited']);
    //upload ảnh gốc/hậu kì
    Route::post('photos/{type}/{ma_bc}/upload', [PhotoUploadController::class, 'upload']);
});

Route::get('/test', function() {
    return response()->json(['ok' => true]);
});
