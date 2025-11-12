<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BuoiChupController;
use App\Http\Controllers\PhotographerController;

// ==================== PUBLIC ROUTES (KHÔNG CẦN TOKEN) ====================

// Auth cho khách hàng
Route::post('/khach-hang/dang-ky', [AuthController::class, 'registerCustomer']);
Route::post('/khach-hang/dang-nhap', [AuthController::class, 'loginCustomer']);

// Auth cho nhiếp ảnh gia
Route::post('/nhiep-anh-gia/dang-ky', [AuthController::class, 'registerPhotographer']);
Route::post('/nhiep-anh-gia/dang-nhap', [AuthController::class, 'loginPhotographer']);

// Danh sách nhiếp ảnh gia nổi bật
Route::get('/nhiep-anh-gia/noi-bat', [PhotographerController::class, 'featured']);

// ==================== PROTECTED ROUTES (CẦN TOKEN) ====================

Route::middleware('auth:sanctum')->group(function () {

    // ĐĂNG XUẤT
    Route::post('/dang-xuat', [AuthController::class, 'logout']);

    
});

Route::prefix('photographer')->middleware(['auth:sanctum'])->group(function () {
    Route::get('dashboard/{Ma_TK}', [PhotographerController::class, 'dashboard']);
    Route::get('{Ma_TK}/bookings', [PhotographerController::class, 'bookings']); // SỬA DÒNG NÀY
});