<?php

use Illuminate\Http\Request;
use App\Http\Controllers\BuoiChupController;
use App\Http\Controllers\CustomerBookingController;
use Illuminate\Support\Facades\Route;

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
// });