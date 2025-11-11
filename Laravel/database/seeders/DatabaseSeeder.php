<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 🧑‍💼 Bảng tài khoản
        if (DB::table('tai_khoan')->count() === 0) {
            // admin
            DB::table('tai_khoan')->insert([
                'Ma_TK' => 'TK001',
                'Ho_Ten' => 'Admin System',
                'So_ĐT' => '0900000001',
                'Email_TK' => 'admin@momentia.com',
                'Mat_Khau' => Hash::make('12345678'),
                'Loai_TK' => 'Khách hàng',
                'Hinh_Thuc_Dang_Nhap' => 'User-registered',
            ]);

            // 2 khách hàng
            $users = [
                [
                    'Ma_TK' => 'TK002',
                    'Ho_Ten' => 'Nguyễn Văn A',
                    'So_ĐT' => '0901111111',
                    'Email_TK' => 'a@gmail.com',
                    'Mat_Khau' => Hash::make('12345678'),
                    'Loai_TK' => 'Khách hàng',
                    'Hinh_Thuc_Dang_Nhap' => 'User-registered',
                ],
                [
                    'Ma_TK' => 'TK003',
                    'Ho_Ten' => 'Trần Thị B',
                    'So_ĐT' => '0902222222',
                    'Email_TK' => 'b@gmail.com',
                    'Mat_Khau' => Hash::make('12345678'),
                    'Loai_TK' => 'Khách hàng',
                    'Hinh_Thuc_Dang_Nhap' => 'User-registered',
                ],
            ];
            DB::table('tai_khoan')->insert($users);

            // 2 nhiếp ảnh gia
            $photographers = [
                [
                    'Ma_TK' => 'TK004',
                    'Ho_Ten' => 'Phạm Minh C',
                    'So_ĐT' => '0903333333',
                    'Email_TK' => 'c.photographer@gmail.com',
                    'Mat_Khau' => Hash::make('12345678'),
                    'Loai_TK' => 'Nhiếp ảnh gia',
                    'Hinh_Thuc_Dang_Nhap' => 'User-registered',
                ],
                [
                    'Ma_TK' => 'TK005',
                    'Ho_Ten' => 'Lê Hồng D',
                    'So_ĐT' => '0904444444',
                    'Email_TK' => 'd.photographer@gmail.com',
                    'Mat_Khau' => Hash::make('12345678'),
                    'Loai_TK' => 'Nhiếp ảnh gia',
                    'Hinh_Thuc_Dang_Nhap' => 'User-registered',
                ],
            ];
            DB::table('tai_khoan')->insert($photographers);
        }

        // 🧍‍♂️ Bảng khách hàng
        if (DB::table('khach_hang')->count() === 0) {
            DB::table('khach_hang')->insert([
                ['Ma_KH' => 'KH001', 'Ma_TK' => 'TK002', 'Dia_Chi' => 'Hà Nội', 'Ngay_Sinh' => '1998-05-10', 'Gioi_Tinh' => 'Nam'],
                ['Ma_KH' => 'KH002', 'Ma_TK' => 'TK003', 'Dia_Chi' => 'TP.HCM', 'Ngay_Sinh' => '1999-09-12', 'Gioi_Tinh' => 'Nữ'],
            ]);
        }

        // 📸 Bảng nhiếp ảnh gia
        if (DB::table('nhiep_anh_gia')->count() === 0) {
            DB::table('nhiep_anh_gia')->insert([
                ['Ma_NAG' => 'NAG001', 'Ma_TK' => 'TK004', 'Dia_Diem_Hoat_Dong' => 'Hà Nội', 'Kinh_Nghiem' => 5, 'Gia_Trung_Binh' => 1500000],
                ['Ma_NAG' => 'NAG002', 'Ma_TK' => 'TK005', 'Dia_Diem_Hoat_Dong' => 'TP.HCM', 'Kinh_Nghiem' => 3, 'Gia_Trung_Binh' => 1200000],
            ]);
        }

        // 🗓️ Bảng buổi chụp
        if (DB::table('buoi_chup')->count() === 0) {
            $sessions = [
                [
                    'Ma_BC' => 'BC001',
                    'Ma_KH' => 'KH001',
                    'Ma_NAG' => 'NAG001',
                    'Tong_Tien' => 2000000,
                    'Bat_Dau_Chup' => now()->addDays(-10),
                    'Ket_Thuc_Chup' => now()->addDays(-10)->addHours(3),
                    'Dia_Diem' => 'Cầu Nhật Tân',
                    'Loai_Chup' => 'Ngoại cảnh',
                    'Trang_Thai' => 'Chờ xác nhận',
                    'Ti_Le_Coc' => 30.00,
                ],
                [
                    'Ma_BC' => 'BC002',
                    'Ma_KH' => 'KH001',
                    'Ma_NAG' => 'NAG002',
                    'Tong_Tien' => 2500000,
                    'Bat_Dau_Chup' => now()->addDays(-5),
                    'Ket_Thuc_Chup' => now()->addDays(-5)->addHours(4),
                    'Dia_Diem' => 'Phố cổ Hà Nội',
                    'Loai_Chup' => 'Street Style',
                    'Trang_Thai' => 'Đang diễn ra',
                    'Ti_Le_Coc' => 40.00,
                ],
                [
                    'Ma_BC' => 'BC003',
                    'Ma_KH' => 'KH001',
                    'Ma_NAG' => 'NAG001',
                    'Tong_Tien' => 3000000,
                    'Bat_Dau_Chup' => now()->addDays(-1),
                    'Ket_Thuc_Chup' => now()->addDays(-1)->addHours(5),
                    'Dia_Diem' => 'Hồ Gươm',
                    'Loai_Chup' => 'Kỷ yếu',
                    'Trang_Thai' => 'Đã hoàn thành',
                    'Ti_Le_Coc' => 50.00,
                ],
                [
                    'Ma_BC' => 'BC004',
                    'Ma_KH' => 'KH002',
                    'Ma_NAG' => 'NAG002',
                    'Tong_Tien' => 1800000,
                    'Bat_Dau_Chup' => now()->addDays(-8),
                    'Ket_Thuc_Chup' => now()->addDays(-8)->addHours(2),
                    'Dia_Diem' => 'Công viên Gia Định',
                    'Loai_Chup' => 'Chân dung',
                    'Trang_Thai' => 'Chờ đặt cọc',
                    'Ti_Le_Coc' => 25.00,
                ],
                [
                    'Ma_BC' => 'BC005',
                    'Ma_KH' => 'KH002',
                    'Ma_NAG' => 'NAG001',
                    'Tong_Tien' => 2200000,
                    'Bat_Dau_Chup' => now()->addDays(-3),
                    'Ket_Thuc_Chup' => now()->addDays(-3)->addHours(3),
                    'Dia_Diem' => 'Bến Bạch Đằng',
                    'Loai_Chup' => 'Couple',
                    'Trang_Thai' => 'Chờ thanh toán',
                    'Ti_Le_Coc' => 35.00,
                ],
                [
                    'Ma_BC' => 'BC006',
                    'Ma_KH' => 'KH002',
                    'Ma_NAG' => 'NAG002',
                    'Tong_Tien' => 2700000,
                    'Bat_Dau_Chup' => now(),
                    'Ket_Thuc_Chup' => now()->addHours(3),
                    'Dia_Diem' => 'Quận 1',
                    'Loai_Chup' => 'Event',
                    'Trang_Thai' => 'Đã hoàn thành',
                    'Ti_Le_Coc' => 50.00,
                ],
            ];
            DB::table('buoi_chup')->insert($sessions);
        }
    }
}
