<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

// Chỉ phục vụ React frontend
Route::get('/check-db', function () {
    try {
        DB::connection()->getPdo();
        return "Kết nối database thành công!";
    } catch (\Exception $e) {
        return "Kết nối thất bại: " . $e->getMessage();
    }
});

// Test DB (tạm giữ lại để debug)
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
        return response()->json(['error' => $e->getMessage()], 500);
    }
});

// Route chính cho React (phải để CUỐI CÙNG!)
Route::get('/{any}', function () {
    return view('main');
})->where('any', '.*'); // Bắt hết, kể cả /photographer, /admin, v.v.