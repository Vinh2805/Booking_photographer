<?php

use Illuminate\Support\Facades\Route;

// Route::get('/', function () {
//     return view('welcome');
// });

// Route::get('/', function () {
//     return view('main');
// });
Route::get('/check-db', function () {
    try {
        DB::connection()->getPdo();
        return "✅ Kết nối database thành công!";
    } catch (\Exception $e) {
        return "❌ Kết nối thất bại: " . $e->getMessage();
    }
});

// Route API React
Route::get('/{any}', function () {
    return view('main');
})->where('any', '^(?!api).*$');
Route::get('/photographer', function () {
    return view('photographer');
});
Route::get('/photographer/detail/{id}', function ($id) {
    return view('photographer_detail', ['id' => $id]);
});
Route::get('/test-db', function () {
    // Test database connection và data
    try {
        $bookings = DB::table('buoi_chup')
            ->where('Ma_NAG', 'NAG001')
            ->get();
            
        $customers = DB::table('khach_hang')->get();
        $photographers = DB::table('nhiep_anh_gia')->get();
        
        return response()->json([
            'database_connection' => 'success',
            'buoi_chup_count' => $bookings->count(),
            'khach_hang_count' => $customers->count(),
            'nhiep_anh_gia_count' => $photographers->count(),
            'sample_buoi_chup' => $bookings->first(),
            'all_buoi_chup' => $bookings
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'database_connection' => 'failed',
            'error' => $e->getMessage()
        ], 500);
    }
});
