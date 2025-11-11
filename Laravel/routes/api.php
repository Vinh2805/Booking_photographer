<?php

use Illuminate\Http\Request;
use App\Http\Controllers\BuoiChupController;
use App\Http\Controllers\CustomerBookingController;
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
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReviewController;


    
    //route callback vnpay
    Route::get('/payment/vnpay/return', [VNPayCallbackController::class, 'handle']);

    // === Routes thanh toán - cần authentication ===
    Route::middleware('auth:sanctum')->group(function () {
        //Đặt cọc
        Route::post('/buoi-chup/{ma_bc}/dat-coc', [BookingDepositController::class, 'store']);
        // Xem báo giá phần còn lại trước khi thanh toán
        Route::get('/buoi-chup/{ma_bc}/thanh-toan/quote', [BookingFinalPaymentController::class, 'quote']);
        // Xác nhận thanh toán phần còn lại
        Route::post('/buoi-chup/{ma_bc}/thanh-toan', [BookingFinalPaymentController::class, 'store']);
    });

    //tải ảnh gốc/hậu kì
    Route::get('/photos/{type}/{ma_bc}/download', [PhotoDownloadController::class, 'download']);
    
    // === Routes cần authentication ===
    Route::middleware('auth:sanctum')->group(function () {
        //upload ảnh gốc/hậu kì (chỉ nhiếp ảnh gia)
        Route::post('/photos/{type}/{ma_bc}/upload', [PhotoUploadController::class, 'upload']);
        //cus gửi yêu cầu (chỉ khách hàng)
        Route::post('/booking/create', [BookingController::class, 'createRequest']);
        //nag confirm/reject buoi chup (chỉ nhiếp ảnh gia)
        Route::post('/booking/{ma_bc}/confirm', [BookingConfirmationController::class, 'confirm']);
        Route::post('/booking/{ma_bc}/reject', [BookingConfirmationController::class, 'reject']);
        //Hủy buổi chụp (cả khách hàng và nhiếp ảnh gia, tùy trạng thái)
        Route::post('/booking/{ma_bc}/cancel', [BookingCancelController::class, 'cancel']);
        //Yêu cầu thay đổi (cả khách hàng và nhiếp ảnh gia)
        Route::post('/booking/{ma_bc}/change', [BookingChangeController::class, 'requestChange']);
        //Lấy danh sách yêu cầu thay đổi chờ duyệt (cả khách hàng và nhiếp ảnh gia)
        Route::get('/booking/change-requests/pending', [BookingChangeController::class, 'getPendingRequests']);
        //Duyệt/từ chối yêu cầu thay đổi (cả khách hàng và nhiếp ảnh gia, tùy người gửi)
        Route::put('/booking/change/{id}/approve', [BookingChangeApprovalController::class, 'approve']);
        Route::put('/booking/change/{id}/reject', [BookingChangeApprovalController::class, 'reject']);
        // Đánh giá nhiếp ảnh gia (chỉ khách hàng)
        Route::post('/booking/{ma_bc}/review', [ReviewController::class, 'create']);
        Route::get('/booking/{ma_bc}/review', [ReviewController::class, 'getReview']);
    });
    
    // Chat routes - cần authentication
    Route::middleware('auth:sanctum')->group(function () {
        //Get unread - phải đặt trước /chat/{Ma_BC} để tránh conflict
        Route::get('/chat/unread', [ChatController::class, 'unread']); 
        //post mark read
        Route::post('/chat/mark-read', [ChatController::class, 'markAsRead']);
        //Get cac doan chat
        Route::get('/chat/{Ma_BC}', [ChatController::class, 'index']);
        //Post chat
        Route::post('/chat', [ChatController::class, 'store']);
    }); 


    //Auth
    // Dashboard routes cần authentication
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/customer/dashboard/{Ma_TK}', [CustomerController::class, 'dashboard']);
        Route::get('/photographer/dashboard/{Ma_TK}', [PhotographerController::class, 'dashboard']);
        Route::get('/photographer/{Ma_TK}/bookings', [PhotographerController::class, 'bookings']);
    });

// 🔹 Auth cho khách hàng
Route::post('/khach-hang/dang-ky', [AuthController::class, 'registerCustomer']);
Route::post('/khach-hang/dang-nhap', [AuthController::class, 'loginCustomer']);

// 🔹 Auth cho nhiếp ảnh gia
Route::post('/nhiep-anh-gia/dang-ky', [AuthController::class, 'registerPhotographer']);
Route::post('/nhiep-anh-gia/dang-nhap', [AuthController::class, 'loginPhotographer']);

// Route::get('/customer/dashboard/{id}', [DashboardController::class, 'customer']);
Route::get('/nhiep-anh-gia/noi-bat', [PhotographerController::class, 'featured']);
Route::get('/nhiep-anh-gia/{id}', [PhotographerController::class, 'show']); // Public endpoint để xem thông tin photographer
Route::get('/dich-vu', [BookingController::class, 'getServices']); // Public endpoint để lấy danh sách dịch vụ


// 🔹 Đăng xuất (cần token)
Route::middleware('auth:sanctum')->post('/dang-xuat', [AuthController::class, 'logout']);

// === Nhiếp ảnh gia ===
// Route GET /buoi-chup có thể public nếu only_mine=false
// Nhưng nếu only_mine=true thì cần auth (được xử lý trong controller)

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/buoi-chup', [BuoiChupController::class, 'index']);
    Route::get('/buoi-chup/{id}', [BuoiChupController::class, 'show']);
    // Route::post('/buoi-chup/{id}/confirm', [BuoiChupController::class, 'confirm']);
    // Route::post('/buoi-chup/{id}/reject', [BuoiChupController::class, 'reject']);
    // Route::post('/buoi-chup/{id}/change-request', [BuoiChupController::class, 'changeRequest']);
    // Route::post('/buoi-chup/{id}/cancel', [BuoiChupController::class, 'cancelRequest']);
    // Route::post('/buoi-chup/{id}/upload', [BuoiChupController::class, 'upload']);
    Route::post('/buoi-chup/{id}/start', [BuoiChupController::class, 'start']);
    Route::post('/buoi-chup/{id}/end', [BuoiChupController::class, 'end']);
    Route::post('/buoi-chup/{id}/complete-processing', [BuoiChupController::class, 'completeProcessing']);
});

    // === Khách hàng ===
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/customer/bookings', [CustomerBookingController::class, 'index']);
        Route::get('/customer/bookings/{id}', [CustomerBookingController::class, 'show']);
    });

    // === Profile Management ===
    Route::middleware('auth:sanctum')->group(function () {
        // Customer profile
        Route::get('/profile/customer', [ProfileController::class, 'getCustomerProfile']);
        Route::put('/profile/customer', [ProfileController::class, 'updateCustomerProfile']);
        Route::post('/profile/customer/avatar', [ProfileController::class, 'uploadCustomerAvatar']);
        
        // Photographer profile
        Route::get('/profile/photographer', [ProfileController::class, 'getPhotographerProfile']);
        Route::put('/profile/photographer', [ProfileController::class, 'updatePhotographerProfile']);
        Route::post('/profile/photographer/avatar', [ProfileController::class, 'uploadPhotographerAvatar']);
        Route::post('/profile/photographer/cover', [ProfileController::class, 'uploadPhotographerCover']);
        Route::post('/profile/photographer/portfolio', [ProfileController::class, 'uploadPhotographerPortfolio']);
    });

    // Serve files from private storage - PUBLIC ACCESS (không cần auth để xem ảnh của người khác)
    Route::get('/storage/avatars/{filename}', [ProfileController::class, 'serveAvatar']);
    Route::get('/storage/covers/{filename}', [ProfileController::class, 'serveCover']);
    Route::get('/storage/portfolio/{filename}', [ProfileController::class, 'servePortfolio']);
