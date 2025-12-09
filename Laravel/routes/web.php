<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

// -----------------------------
// 🌐 VIEW CHÍNH CHẠY REACT SPA
// -----------------------------
Route::get('/', fn() => view('main'));
Route::get('/momentia', fn() => view('main'));

// -----------------------------
// 🧩 VIEW PHỤ (NẾU DÙNG BLADE)
// -----------------------------
Route::get('/photographer', fn() => view('photographer'));
Route::get('/photographer/detail/{id}', fn($id) => view('photographer_detail', ['id' => $id]));

// -----------------------------
// 🔑 ROUTE LOGIN (Fallback cho Auth Middleware)
// -----------------------------
Route::get('/login', function () {
    return response()->json(['message' => 'Unauthenticated'], 401);
})->name('login');

// -----------------------------
// 🧠 KIỂM TRA KẾT NỐI DATABASE
// -----------------------------
Route::get('/check-db', function () {
    try {
        DB::connection()->getPdo();
        return "✅ Kết nối database thành công!";
    } catch (\Exception $e) {
        return "❌ Kết nối thất bại: " . $e->getMessage();
    }
});

// -----------------------------
// 📊 TEST DỮ LIỆU TRONG DATABASE
// -----------------------------
Route::get('/test-db', function () {
    try {
        $bookings = DB::table('buoi_chup')->where('Ma_NAG', 'NAG001')->get();
        $customers = DB::table('khach_hang')->get();
        $photographers = DB::table('nhiep_anh_gia')->get();

        return response()->json([
            'database_connection' => 'success',
            'buoi_chup_count' => $bookings->count(),
            'khach_hang_count' => $customers->count(),
            'nhiep_anh_gia_count' => $photographers->count(),
            'sample_buoi_chup' => $bookings->first(),
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'database_connection' => 'failed',
            'error' => $e->getMessage(),
        ], 500);
    }
});

// -----------------------------
// ⚛️ ROUTE SPA CHO REACT FRONTEND
// -----------------------------
// Tất cả route không bắt đầu bằng /api sẽ trả về view 'main'
Route::get('/{any}', fn() => view('main'))->where('any', '^(?!api).*$');
