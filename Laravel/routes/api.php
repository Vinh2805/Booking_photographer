<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BuoiChupController;
use App\Http\Controllers\CustomerBookingController;
use App\Http\Controllers\PhotographerController; 

Route::get('/customer/dashboard/{Ma_TK}', [CustomerController::class, 'dashboard']);


Route::get('/photographer/dashboard/{Ma_TK}', [PhotographerController::class, 'dashboard']);
Route::get('/photographer/{Ma_TK}/bookings', [PhotographerController::class, 'bookings']);

// 🔹 Auth cho khách hàng
Route::post('/khach-hang/dang-ky', [AuthController::class, 'registerCustomer']);
Route::post('/khach-hang/dang-nhap', [AuthController::class, 'loginCustomer']);

// 🔹 Auth cho nhiếp ảnh gia
Route::post('/nhiep-anh-gia/dang-ky', [AuthController::class, 'registerPhotographer']);
Route::post('/nhiep-anh-gia/dang-nhap', [AuthController::class, 'loginPhotographer']);

Route::get('/customer/dashboard/{id}', [DashboardController::class, 'customer']);
Route::get('/nhiep-anh-gia/noi-bat', [PhotographerController::class, 'featured']);


// 🔹 Đăng xuất (cần token)
Route::middleware('auth:sanctum')->post('/dang-xuat', [AuthController::class, 'logout']);

// TẤT CẢ ROUTE ĐỀU TRONG 1 GROUP DUY NHẤT
// Route::middleware('auth:sanctum')->group(function () { // chưa fix được lỗi bỏ cái này 

    // === Nhiếp ảnh gia ===
    Route::get('/buoi-chup', [BuoiChupController::class, 'index']);
    Route::get('/buoi-chup/{id}', [BuoiChupController::class, 'show']);
    Route::post('/buoi-chup/{id}/confirm', [BuoiChupController::class, 'confirm']);
    Route::post('/buoi-chup/{id}/reject', [BuoiChupController::class, 'reject']);
    Route::post('/buoi-chup/{id}/change-request', [BuoiChupController::class, 'changeRequest']);
    Route::post('/buoi-chup/{id}/cancel', [BuoiChupController::class, 'cancelRequest']);
    Route::post('/buoi-chup/{id}/upload', [BuoiChupController::class, 'upload']);
    Route::post('/buoi-chup/{id}/start', [BuoiChupController::class, 'start']);
    Route::post('/buoi-chup/{id}/end', [BuoiChupController::class, 'end']);

    // === Khách hàng ===
    Route::get('/customer/bookings', [CustomerBookingController::class, 'index']);
    Route::get('/customer/bookings/{id}', [CustomerBookingController::class, 'show']);
