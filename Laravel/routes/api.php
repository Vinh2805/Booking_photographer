<?php

use App\Http\Controllers\BuoiChupController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CustomerBookingController;


Route::get('/buoi-chup', [BuoiChupController::class, 'index']);
Route::get('/buoi-chup/{id}', [BuoiChupController::class, 'show']);
Route::post('/buoi-chup/{id}/confirm', [BuoiChupController::class, 'confirm']);
Route::post('/buoi-chup/{id}/reject', [BuoiChupController::class, 'reject']);
Route::post('/buoi-chup/{id}/start', [BuoiChupController::class, 'startShooting']);
Route::post('/buoi-chup/{id}/end', [BuoiChupController::class, 'endShooting']);
Route::post('/buoi-chup/{id}/upload', [BuoiChupController::class, 'uploadPhotos']);
Route::post('/buoi-chup/{id}/change-request', [BuoiChupController::class, 'requestChange']);
Route::post('/buoi-chup/{id}/cancel-request', [BuoiChupController::class, 'requestCancel']);
Route::post('/buoi-chup/{id}/start', [BuoiChupController::class, 'start']);
Route::post('/buoi-chup/{id}/end', [BuoiChupController::class, 'end']);
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/customer/bookings', [CustomerBookingController::class, 'index']);
    Route::get('/customer/bookings/{id}', [CustomerBookingController::class, 'show']);
});