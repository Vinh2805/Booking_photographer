<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
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
