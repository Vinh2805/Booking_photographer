<?php

use App\Http\Controllers\BuoiChupController;
use Illuminate\Support\Facades\Route;

Route::get('/buoi-chup', [BuoiChupController::class, 'index']); // Lọc và sắp xếp
Route::get('/buoi-chup/{id}', [BuoiChupController::class, 'show']); // Chi tiết buổi chụp