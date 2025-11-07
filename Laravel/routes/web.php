<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

// Route::get('/', function () {
//     return view('welcome');
// });

// Route::get('/', function () {
//     return view('main');
// });

// Route API React
Route::get('/{any}', function () {
    return view('main');
})->where('any', '.*');
Route::prefix('api')->middleware('api')->group(function () {
    //Đặt cọc
    Route::post('buoi-chup/{ma_bc}/dat-coc', [BookingDepositController::class, 'store']);
    // Auth
Route::post('dang-ky', [AuthController::class, 'register']);
Route::post('dang-nhap', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->post('dang-xuat', [AuthController::class, 'logout']);
});
