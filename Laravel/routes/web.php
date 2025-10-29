<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BookingDepositController;
use App\Http\Controllers\BookingFinalPaymentController;
use App\Http\Controllers\PhotoDownloadController;
use App\Http\Controllers\PhotoUploadController;
use App\Http\Controllers\BookingConfirmationController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\BookingCancelController;
use App\Http\Controllers\BookingChangeController;
use App\Http\Controllers\BookingChangeApprovalController;
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
    Route::get('photos/{type}/{ma_bc}/download', [PhotoDownloadController::class, 'download']);
    //upload ảnh gốc/hậu kì
    Route::post('photos/{type}/{ma_bc}/upload', [PhotoUploadController::class, 'upload']);
    //cus gửi yêu cầu
    Route::post('booking/create', [BookingController::class, 'createRequest']);
        //nag confirm/reject buoi chup
    Route::post('booking/{ma_bc}/confirm', [BookingConfirmationController::class, 'confirm']);
    Route::post('booking/{ma_bc}/reject', [BookingConfirmationController::class, 'reject']);
    //KH huỷ
    Route::post('booking/{ma_bc}/cancel', [BookingCancelController::class, 'cancel']);
    //thay đoi yêu cầu
    Route::post('booking/{ma_bc}/change', [BookingChangeController::class, 'requestChange']);
    //chấp nhận, từ chối yêu cầu
    Route::put('booking/change/{id}/approve', [BookingChangeApprovalController::class, 'approve']);
    Route::put('booking/change/{id}/reject', [BookingChangeApprovalController::class, 'reject']);
});

Route::get('/test', function() {
    return response()->json(['ok' => true]);
});
