<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;// use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 🧑‍💼 Tài khoản admin
        DB::table('tai_khoan')->insert([
            'Ma_TK' => 'TK0001',
            'Ho_Ten' => 'Admin System',
            'So_ĐT' => '0900000001',
            'Email_TK' => 'admin@momentia.com',
            'Mat_Khau' => Hash::make('123456'),
            'Loai_TK' => 'Khách hàng',
            'Hinh_Thuc_Dang_Nhap' => 'User-registered',
        ]);

        // 👩‍💼 2 khách hàng
        $users = [
            [
                'Ma_TK' => 'TK0002',
                'Ho_Ten' => 'Nguyễn Văn A',
                'So_ĐT' => '0901111111',
                'Email_TK' => 'a@gmail.com',
                'Mat_Khau' => Hash::make('123456'),
                'Loai_TK' => 'Khách hàng',
                'Hinh_Thuc_Dang_Nhap' => 'User-registered',
            ],
            [
                'Ma_TK' => 'TK0003',
                'Ho_Ten' => 'Trần Thị B',
                'So_ĐT' => '0902222222',
                'Email_TK' => 'b@gmail.com',
                'Mat_Khau' => Hash::make('123456'),
                'Loai_TK' => 'Khách hàng',
                'Hinh_Thuc_Dang_Nhap' => 'User-registered',
            ],
        ];
        DB::table('tai_khoan')->insert($users);

        // 📷 2 nhiếp ảnh gia
        $photographers = [
            [
                'Ma_TK' => 'TK0004',
                'Ho_Ten' => 'Phạm Minh C',
                'So_ĐT' => '0903333333',
                'Email_TK' => 'c.photographer@gmail.com',
                'Mat_Khau' => Hash::make('123456'),
                'Loai_TK' => 'Nhiếp ảnh gia',
                'Hinh_Thuc_Dang_Nhap' => 'User-registered',
            ],
            [
                'Ma_TK' => 'TK0005',
                'Ho_Ten' => 'Lê Hồng D',
                'So_ĐT' => '0904444444',
                'Email_TK' => 'd.photographer@gmail.com',
                'Mat_Khau' => Hash::make('123456'),
                'Loai_TK' => 'Nhiếp ảnh gia',
                'Hinh_Thuc_Dang_Nhap' => 'User-registered',
            ],
        ];
        DB::table('tai_khoan')->insert($photographers);

        // 🧍‍♂️ Bảng khách hàng (liên kết với TK0002, TK0003)
        DB::table('khach_hang')->insert([
            ['Ma_KH' => 'KH0001', 'Ma_TK' => 'TK0002', 'Dia_Chi' => 'Hà Nội', 'Ngay_Sinh' => '1998-05-10', 'Gioi_Tinh' => 'Nam'],
            ['Ma_KH' => 'KH0002', 'Ma_TK' => 'TK0003', 'Dia_Chi' => 'TP.HCM', 'Ngay_Sinh' => '1999-09-12', 'Gioi_Tinh' => 'Nữ'],
        ]);

        // 📸 Bảng nhiếp ảnh gia (liên kết với TK0004, TK0005)
        DB::table('nhiep_anh_gia')->insert([
            ['Ma_NAG' => 'NAG0001', 'Ma_TK' => 'TK0004', 'Dia_Diem_Hoat_Dong' => 'Hà Nội', 'Kinh_Nghiem' => 5, 'Gia_Trung_Binh' => 1500000],
            ['Ma_NAG' => 'NAG0002', 'Ma_TK' => 'TK0005', 'Dia_Diem_Hoat_Dong' => 'TP.HCM', 'Kinh_Nghiem' => 3, 'Gia_Trung_Binh' => 1200000],
        ]);

        // 🗓️ Buổi chụp — mỗi khách hàng có 3 buổi chụp
        $sessions = [
            // User 1
            [
                'Ma_BC' => 'BC0001',
                'Ma_KH' => 'KH0001',
                'Ma_NAG' => 'NAG0001',
                'Tong_Tien' => 2000000,
                'Bat_Dau_Chup' => now()->addDays(-10),
                'Ket_Thuc_Chup' => now()->addDays(-10)->addHours(3),
                'Dia_Diem' => 'Cầu Nhật Tân',
                'Loai_Chup' => 'Ngoại cảnh',
                'Trang_Thai' => 'Chờ xác nhận',
                'Ti_Le_Coc' => 30.00,
            ],
            [
                'Ma_BC' => 'BC0002',
                'Ma_KH' => 'KH0001',
                'Ma_NAG' => 'NAG0002',
                'Tong_Tien' => 2500000,
                'Bat_Dau_Chup' => now()->addDays(-5),
                'Ket_Thuc_Chup' => now()->addDays(-5)->addHours(4),
                'Dia_Diem' => 'Phố cổ Hà Nội',
                'Loai_Chup' => 'Street Style',
                'Trang_Thai' => 'Đang diễn ra',
                'Ti_Le_Coc' => 40.00,
            ],
            [
                'Ma_BC' => 'BC0003',
                'Ma_KH' => 'KH0001',
                'Ma_NAG' => 'NAG0001',
                'Tong_Tien' => 3000000,
                'Bat_Dau_Chup' => now()->addDays(-1),
                'Ket_Thuc_Chup' => now()->addDays(-1)->addHours(5),
                'Dia_Diem' => 'Hồ Gươm',
                'Loai_Chup' => 'Kỷ yếu',
                'Trang_Thai' => 'Đã hoàn thành',
                'Ti_Le_Coc' => 50.00,
            ],
            // User 2
            [
                'Ma_BC' => 'BC0004',
                'Ma_KH' => 'KH0002',
                'Ma_NAG' => 'NAG0002',
                'Tong_Tien' => 1800000,
                'Bat_Dau_Chup' => now()->addDays(-8),
                'Ket_Thuc_Chup' => now()->addDays(-8)->addHours(2),
                'Dia_Diem' => 'Công viên Gia Định',
                'Loai_Chup' => 'Chân dung',
                'Trang_Thai' => 'Chờ đặt cọc',
                'Ti_Le_Coc' => 25.00,
            ],
            [
                'Ma_BC' => 'BC0005',
                'Ma_KH' => 'KH0002',
                'Ma_NAG' => 'NAG0001',
                'Tong_Tien' => 2200000,
                'Bat_Dau_Chup' => now()->addDays(-3),
                'Ket_Thuc_Chup' => now()->addDays(-3)->addHours(3),
                'Dia_Diem' => 'Bến Bạch Đằng',
                'Loai_Chup' => 'Couple',
                'Trang_Thai' => 'Chờ thanh toán',
                'Ti_Le_Coc' => 35.00,
            ],
            [
                'Ma_BC' => 'BC0006',
                'Ma_KH' => 'KH0002',
                'Ma_NAG' => 'NAG0002',
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
