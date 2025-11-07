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
use App\Http\Controllers\VNPayCallbackController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\PhotographerController;
use App\Http\Controllers\CustomerController;


    //Đặt cọc
    Route::post('/buoi-chup/{ma_bc}/dat-coc', [BookingDepositController::class, 'store']);
    // Xem báo giá phần còn lại trước khi thanh toán
    Route::get('/buoi-chup/{ma_bc}/thanh-toan/quote', [BookingFinalPaymentController::class, 'quote']);
    //route callback vnpay
    Route::get('/payment/vnpay/return', [VNPayCallbackController::class, 'handle']);

    // Xác nhận thanh toán phần còn lại
    Route::post('/buoi-chup/{ma_bc}/thanh-toan', [BookingFinalPaymentController::class, 'store']);

    //tải ảnh gốc/hậu kì
    Route::get('/photos/{type}/{ma_bc}/download', [PhotoDownloadController::class, 'download']);
    //upload ảnh gốc/hậu kì
    Route::post('/photos/{type}/{ma_bc}/upload', [PhotoUploadController::class, 'upload']);
    //cus gửi yêu cầu
    Route::post('/booking/create', [BookingController::class, 'createRequest']);
        //nag confirm/reject buoi chup
    Route::post('/booking/{ma_bc}/confirm', [BookingConfirmationController::class, 'confirm']);
    Route::post('/booking/{ma_bc}/reject', [BookingConfirmationController::class, 'reject']);
    //KH huỷ
    Route::post('/booking/{ma_bc}/cancel', [BookingCancelController::class, 'cancel']);
    //thay đoi yêu cầu
    Route::post('/booking/{ma_bc}/change', [BookingChangeController::class, 'requestChange']);
    //chấp nhận, từ chối yêu cầu
    Route::put('/booking/change/{id}/approve', [BookingChangeApprovalController::class, 'approve']);
    Route::put('/booking/change/{id}/reject', [BookingChangeApprovalController::class, 'reject']);
    
    //Get cac doan chat
    Route::get('/chat/{Ma_BC}', [ChatController::class, 'index']);
    //Post chat
    Route::post('/chat', [ChatController::class, 'store']);
    //Get unread
    Route::get('/chat/unread', [ChatController::class, 'unread']); 
    //post mark read
    Route::post('/chat/mark-read', [ChatController::class, 'markAsRead']); 


    //Auth
    Route::get('/customer/dashboard/{Ma_TK}', [CustomerController::class, 'dashboard']);


Route::get('/photographer/dashboard/{Ma_TK}', [PhotographerController::class, 'dashboard']);
Route::get('/photographer/{Ma_TK}/bookings', [PhotographerController::class, 'bookings']);

// 🔹 Auth cho khách hàng
Route::post('/khach-hang/dang-ky', [AuthController::class, 'registerCustomer']);
Route::post('/khach-hang/dang-nhap', [AuthController::class, 'loginCustomer']);

// 🔹 Auth cho nhiếp ảnh gia
Route::post('/nhiep-anh-gia/dang-ky', [AuthController::class, 'registerPhotographer']);
Route::post('/nhiep-anh-gia/dang-nhap', [AuthController::class, 'loginPhotographer']);

// Route::get('/customer/dashboard/{id}', [DashboardController::class, 'customer']);
Route::get('/nhiep-anh-gia/noi-bat', [PhotographerController::class, 'featured']);


// 🔹 Đăng xuất (cần token)
Route::middleware('auth:sanctum')->post('/dang-xuat', [AuthController::class, 'logout']);
