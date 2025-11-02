<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BuoiChupController;
use App\Http\Controllers\AuthController;

// Buổi chụp
Route::get('/buoi-chup', [BuoiChupController::class, 'index']);
Route::get('/buoi-chup/{id}', [BuoiChupController::class, 'show']);

// Auth
Route::post('/dang-ky', [AuthController::class, 'register']);
Route::post('/dang-nhap', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->post('/dang-xuat', [AuthController::class, 'logout']);
