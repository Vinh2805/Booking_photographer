<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Tạo tài khoản trong bảng tai_khoan
        $existingUser = DB::table('tai_khoan')->where('Ma_TK', 'TKADM')->first();
        
        if (!$existingUser) {
            DB::table('tai_khoan')->insert([
                'Ma_TK' => 'TKADM',
                'Ho_Ten' => 'Admin User',
                'So_ĐT' => '0900000000',
                'Email_TK' => 'admin@gmail.com',
                'Mat_Khau' => Hash::make('12345678'),
                'Loai_TK' => 'Admin',
                'Hinh_Thuc_Dang_Nhap' => 'User-registered',
                'Gioi_Thieu' => 'Quản trị viên hệ thống',
                'created_at' => now(),
            ]);
        }

        // 2. Tạo thông tin trong bảng admins
        $existingAdmin = DB::table('admins')->where('Ma_Admin', 'ADM001')->first();

        if (!$existingAdmin) {
            DB::table('admins')->insert([
                'Ma_Admin' => 'ADM001',
                'Ma_TK' => 'TKADM',
                'So_Du' => 0,
            ]);
        }
    }
}
