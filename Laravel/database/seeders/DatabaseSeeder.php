<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->seedUsers();
        $this->seedCustomers();
        $this->seedPhotographers();
        $this->seedBookings();
        $this->seedPayments();
        $this->seedMessages();
        $this->seedReviews();
        
        // 💼 Bảng dịch vụ
        $this->call(DichVuSeeder::class);
    }

    /**
     * Seed tài khoản
     */
    private function seedUsers(): void
    {
        if (DB::table('tai_khoan')->count() > 0) {
            return;
        }

        $users = [
            // Khách hàng
            [
                'Ma_TK' => 'TK001',
                'Ho_Ten' => 'Nguyễn Văn An',
                'So_ĐT' => '0901111111',
                'Email_TK' => 'customer1@test.com',
                'Mat_Khau' => Hash::make('12345678'),
                'Loai_TK' => 'Khách hàng',
                'Hinh_Thuc_Dang_Nhap' => 'User-registered',
                'Gioi_Thieu' => 'Tôi yêu thích chụp ảnh kỷ niệm và du lịch',
                'created_at' => now()->subMonths(6),
            ],
                [
                    'Ma_TK' => 'TK002',
                'Ho_Ten' => 'Trần Thị Bình',
                'So_ĐT' => '0902222222',
                'Email_TK' => 'customer2@test.com',
                    'Mat_Khau' => Hash::make('12345678'),
                    'Loai_TK' => 'Khách hàng',
                    'Hinh_Thuc_Dang_Nhap' => 'User-registered',
                'Gioi_Thieu' => 'Đam mê chụp ảnh cưới và sự kiện',
                'created_at' => now()->subMonths(4),
                ],
                [
                    'Ma_TK' => 'TK003',
                'Ho_Ten' => 'Lê Minh Cường',
                'So_ĐT' => '0903333333',
                'Email_TK' => 'customer3@test.com',
                    'Mat_Khau' => Hash::make('12345678'),
                    'Loai_TK' => 'Khách hàng',
                    'Hinh_Thuc_Dang_Nhap' => 'User-registered',
                'Gioi_Thieu' => 'Thích chụp ảnh chân dung và fashion',
                'created_at' => now()->subMonths(2),
                ],
                [
                    'Ma_TK' => 'TK004',
                'Ho_Ten' => 'Phạm Thị Dung',
                'So_ĐT' => '0904444444',
                'Email_TK' => 'customer4@test.com',
                'Mat_Khau' => Hash::make('12345678'),
                'Loai_TK' => 'Khách hàng',
                'Hinh_Thuc_Dang_Nhap' => 'User-registered',
                'Gioi_Thieu' => 'Yêu thích chụp ảnh gia đình và trẻ em',
                'created_at' => now()->subMonths(1),
            ],
            [
                'Ma_TK' => 'TK005',
                'Ho_Ten' => 'Hoàng Văn Em',
                'So_ĐT' => '0905555555',
                'Email_TK' => 'customer5@test.com',
                'Mat_Khau' => Hash::make('12345678'),
                'Loai_TK' => 'Khách hàng',
                'Hinh_Thuc_Dang_Nhap' => 'User-registered',
                'Gioi_Thieu' => 'Đam mê chụp ảnh phong cảnh và thiên nhiên',
                'created_at' => now()->subWeeks(2),
            ],
            
            // Nhiếp ảnh gia
            [
                'Ma_TK' => 'TK006',
                'Ho_Ten' => 'Nguyễn Minh Phương',
                'So_ĐT' => '0906666666',
                'Email_TK' => 'photographer1@test.com',
                'Mat_Khau' => Hash::make('12345678'),
                'Loai_TK' => 'Nhiếp ảnh gia',
                'Hinh_Thuc_Dang_Nhap' => 'User-registered',
                'Gioi_Thieu' => 'Nhiếp ảnh gia chuyên nghiệp với 8 năm kinh nghiệm. Chuyên về chụp ảnh cưới, sự kiện và chân dung.',
                'created_at' => now()->subYears(2),
            ],
            [
                'Ma_TK' => 'TK007',
                'Ho_Ten' => 'Trần Đức Hùng',
                'So_ĐT' => '0907777777',
                'Email_TK' => 'photographer2@test.com',
                'Mat_Khau' => Hash::make('12345678'),
                'Loai_TK' => 'Nhiếp ảnh gia',
                'Hinh_Thuc_Dang_Nhap' => 'User-registered',
                'Gioi_Thieu' => 'Chuyên chụp ảnh fashion, street style và commercial. Đã từng làm việc với nhiều thương hiệu lớn.',
                'created_at' => now()->subYears(1),
            ],
            [
                'Ma_TK' => 'TK008',
                'Ho_Ten' => 'Lê Thị Hoa',
                'So_ĐT' => '0908888888',
                'Email_TK' => 'photographer3@test.com',
                'Mat_Khau' => Hash::make('12345678'),
                'Loai_TK' => 'Nhiếp ảnh gia',
                'Hinh_Thuc_Dang_Nhap' => 'User-registered',
                'Gioi_Thieu' => 'Nhiếp ảnh gia chuyên về chụp ảnh trẻ em, gia đình và lifestyle. Phong cách tự nhiên, ấm áp.',
                'created_at' => now()->subMonths(10),
            ],
            [
                'Ma_TK' => 'TK009',
                'Ho_Ten' => 'Phạm Văn Khoa',
                'So_ĐT' => '0909999999',
                'Email_TK' => 'photographer4@test.com',
                    'Mat_Khau' => Hash::make('12345678'),
                    'Loai_TK' => 'Nhiếp ảnh gia',
                    'Hinh_Thuc_Dang_Nhap' => 'User-registered',
                'Gioi_Thieu' => 'Chuyên chụp ảnh phong cảnh, du lịch và thiên nhiên. Đã đi qua nhiều quốc gia để chụp ảnh.',
                'created_at' => now()->subMonths(8),
            ],
            [
                'Ma_TK' => 'TK010',
                'Ho_Ten' => 'Võ Thị Lan',
                'So_ĐT' => '0901010101',
                'Email_TK' => 'photographer5@test.com',
                    'Mat_Khau' => Hash::make('12345678'),
                    'Loai_TK' => 'Nhiếp ảnh gia',
                    'Hinh_Thuc_Dang_Nhap' => 'User-registered',
                'Gioi_Thieu' => 'Nhiếp ảnh gia trẻ với phong cách hiện đại, chuyên về chụp ảnh kỷ yếu, couple và pre-wedding.',
                'created_at' => now()->subMonths(6),
            ],
        ];

        DB::table('tai_khoan')->insert($users);
    }

    /**
     * Seed khách hàng
     */
    private function seedCustomers(): void
    {
        if (DB::table('khach_hang')->count() > 0) {
            return;
        }

        $customers = [
            [
                'Ma_KH' => 'KH001',
                'Ma_TK' => 'TK001',
                'Dia_Chi' => '123 Nguyễn Huệ, Quận 1, TP.HCM',
                'Ngay_Sinh' => '1995-03-15',
                'Gioi_Tinh' => 'Nam',
                'So_Thich_The_Loai' => json_encode(['Kỷ yếu', 'Du lịch', 'Chân dung']),
                'So_Thich_Dia_Diem' => json_encode(['TP.HCM', 'Đà Lạt', 'Nha Trang']),
            ],
            [
                'Ma_KH' => 'KH002',
                'Ma_TK' => 'TK002',
                'Dia_Chi' => '456 Lê Lợi, Quận Hoàn Kiếm, Hà Nội',
                'Ngay_Sinh' => '1998-07-22',
                'Gioi_Tinh' => 'Nữ',
                'So_Thich_The_Loai' => json_encode(['Cưới', 'Sự kiện', 'Fashion']),
                'So_Thich_Dia_Diem' => json_encode(['Hà Nội', 'Sapa', 'Hạ Long']),
            ],
            [
                'Ma_KH' => 'KH003',
                'Ma_TK' => 'TK003',
                'Dia_Chi' => '789 Trần Hưng Đạo, Quận 5, TP.HCM',
                'Ngay_Sinh' => '1992-11-08',
                'Gioi_Tinh' => 'Nam',
                'So_Thich_The_Loai' => json_encode(['Fashion', 'Street Style', 'Commercial']),
                'So_Thich_Dia_Diem' => json_encode(['TP.HCM', 'Hà Nội']),
            ],
            [
                'Ma_KH' => 'KH004',
                'Ma_TK' => 'TK004',
                'Dia_Chi' => '321 Nguyễn Trãi, Quận Thanh Xuân, Hà Nội',
                'Ngay_Sinh' => '1996-05-30',
                'Gioi_Tinh' => 'Nữ',
                'So_Thich_The_Loai' => json_encode(['Gia đình', 'Trẻ em', 'Lifestyle']),
                'So_Thich_Dia_Diem' => json_encode(['Hà Nội', 'Vũng Tàu']),
            ],
            [
                'Ma_KH' => 'KH005',
                'Ma_TK' => 'TK005',
                'Dia_Chi' => '654 Võ Văn Tần, Quận 3, TP.HCM',
                'Ngay_Sinh' => '1994-09-18',
                'Gioi_Tinh' => 'Nam',
                'So_Thich_The_Loai' => json_encode(['Phong cảnh', 'Du lịch', 'Thiên nhiên']),
                'So_Thich_Dia_Diem' => json_encode(['Đà Lạt', 'Mũi Né', 'Phú Quốc']),
            ],
        ];

        DB::table('khach_hang')->insert($customers);
    }

    /**
     * Seed nhiếp ảnh gia
     */
    private function seedPhotographers(): void
    {
        if (DB::table('nhiep_anh_gia')->count() > 0) {
            return;
        }

        $photographers = [
            [
                'Ma_NAG' => 'NAG001',
                'Ma_TK' => 'TK006',
                'Dia_Diem_Hoat_Dong' => 'TP.HCM, Hà Nội',
                'Kinh_Nghiem' => 8,
                'Gia_Trung_Binh' => 2500000,
                'Gia_Toi_Thieu' => 1500000,
                'Gia_Toi_Da' => 5000000,
                'Boi_Canh_Chup' => json_encode(['Ngoài trời', 'Trong nhà', 'Kết hợp']),
                'Thiet_Bi' => json_encode(['Canon 5D Mark IV', 'Sony A7R III', 'DJI Mavic Pro']),
                'Portfolio' => json_encode([
                    'https://example.com/portfolio1.jpg',
                    'https://example.com/portfolio2.jpg',
                    'https://example.com/portfolio3.jpg',
                ]),
            ],
            [
                'Ma_NAG' => 'NAG002',
                'Ma_TK' => 'TK007',
                'Dia_Diem_Hoat_Dong' => 'TP.HCM',
                'Kinh_Nghiem' => 6,
                'Gia_Trung_Binh' => 2000000,
                'Gia_Toi_Thieu' => 1200000,
                'Gia_Toi_Da' => 4000000,
                'Boi_Canh_Chup' => json_encode(['Ngoài trời', 'Kết hợp']),
                'Thiet_Bi' => json_encode(['Nikon D850', 'Fujifilm X-T4']),
                'Portfolio' => json_encode([
                    'https://example.com/portfolio4.jpg',
                    'https://example.com/portfolio5.jpg',
                ]),
            ],
            [
                'Ma_NAG' => 'NAG003',
                'Ma_TK' => 'TK008',
                'Dia_Diem_Hoat_Dong' => 'Hà Nội',
                'Kinh_Nghiem' => 5,
                'Gia_Trung_Binh' => 1800000,
                'Gia_Toi_Thieu' => 1000000,
                'Gia_Toi_Da' => 3500000,
                'Boi_Canh_Chup' => json_encode(['Trong nhà', 'Kết hợp']),
                'Thiet_Bi' => json_encode(['Canon 6D Mark II', 'Sony A6400']),
                'Portfolio' => json_encode([
                    'https://example.com/portfolio6.jpg',
                    'https://example.com/portfolio7.jpg',
                    'https://example.com/portfolio8.jpg',
                ]),
            ],
            [
                'Ma_NAG' => 'NAG004',
                'Ma_TK' => 'TK009',
                'Dia_Diem_Hoat_Dong' => 'Đà Lạt, Nha Trang, Phú Quốc',
                'Kinh_Nghiem' => 7,
                'Gia_Trung_Binh' => 2200000,
                'Gia_Toi_Thieu' => 1300000,
                'Gia_Toi_Da' => 4500000,
                'Boi_Canh_Chup' => json_encode(['Ngoài trời']),
                'Thiet_Bi' => json_encode(['Canon R5', 'DJI Mini 3 Pro']),
                'Portfolio' => json_encode([
                    'https://example.com/portfolio9.jpg',
                    'https://example.com/portfolio10.jpg',
                ]),
            ],
            [
                'Ma_NAG' => 'NAG005',
                'Ma_TK' => 'TK010',
                'Dia_Diem_Hoat_Dong' => 'TP.HCM, Hà Nội',
                'Kinh_Nghiem' => 3,
                'Gia_Trung_Binh' => 1500000,
                'Gia_Toi_Thieu' => 800000,
                'Gia_Toi_Da' => 3000000,
                'Boi_Canh_Chup' => json_encode(['Ngoài trời', 'Trong nhà', 'Kết hợp']),
                'Thiet_Bi' => json_encode(['Sony A7 III', 'Canon 24-70mm']),
                'Portfolio' => json_encode([
                    'https://example.com/portfolio11.jpg',
                    'https://example.com/portfolio12.jpg',
                    'https://example.com/portfolio13.jpg',
                ]),
            ],
        ];

        DB::table('nhiep_anh_gia')->insert($photographers);
    }

    /**
     * Seed buổi chụp với đầy đủ các trạng thái để test
     */
    private function seedBookings(): void
    {
        if (DB::table('buoi_chup')->count() > 0) {
            return;
        }

        $now = now();
        
        $bookings = [
            // Chờ xác nhận
                [
                    'Ma_BC' => 'BC001',
                    'Ma_KH' => 'KH001',
                    'Ma_NAG' => 'NAG001',
                'Tong_Tien' => 2500000,
                'Bat_Dau_Chup' => $now->copy()->addDays(7)->setTime(9, 0),
                'Ket_Thuc_Chup' => $now->copy()->addDays(7)->setTime(12, 0),
                'Dia_Diem' => 'Công viên Lê Văn Tám, TP.HCM',
                'Loai_Chup' => 'Kỷ yếu',
                'Tieu_De' => 'Chụp ảnh kỷ yếu tốt nghiệp',
                'The_Loai_Chup' => json_encode(['Kỷ yếu', 'Chân dung']),
                'Boi_Canh_Chup' => 'Ngoài trời',
                'Ghi_Chu' => 'Cần chụp tại công viên vào buổi sáng',
                    'Trang_Thai' => 'Chờ xác nhận',
                    'Ti_Le_Coc' => 30.00,
                'Ly_Do_Huy' => null,
                'Ngay_Tao' => $now->copy()->subDays(2),
                ],
                [
                    'Ma_BC' => 'BC002',
                'Ma_KH' => 'KH002',
                    'Ma_NAG' => 'NAG002',
                'Tong_Tien' => 3000000,
                'Bat_Dau_Chup' => $now->copy()->addDays(10)->setTime(14, 0),
                'Ket_Thuc_Chup' => $now->copy()->addDays(10)->setTime(18, 0),
                'Dia_Diem' => 'Studio tại Quận 1, TP.HCM',
                'Loai_Chup' => 'Fashion',
                'Tieu_De' => 'Chụp ảnh fashion lookbook',
                'The_Loai_Chup' => json_encode(['Fashion', 'Commercial']),
                'Boi_Canh_Chup' => 'Trong nhà',
                'Ghi_Chu' => 'Cần studio có backdrop trắng',
                'Trang_Thai' => 'Chờ xác nhận',
                    'Ti_Le_Coc' => 40.00,
                'Ly_Do_Huy' => null,
                'Ngay_Tao' => $now->copy()->subDays(1),
                ],
            
            // Chờ đặt cọc
                [
                    'Ma_BC' => 'BC003',
                'Ma_KH' => 'KH003',
                'Ma_NAG' => 'NAG003',
                'Tong_Tien' => 1800000,
                'Bat_Dau_Chup' => $now->copy()->addDays(5)->setTime(8, 0),
                'Ket_Thuc_Chup' => $now->copy()->addDays(5)->setTime(11, 0),
                'Dia_Diem' => 'Hồ Gươm, Hà Nội',
                'Loai_Chup' => 'Chân dung',
                'Tieu_De' => 'Chụp ảnh chân dung cá nhân',
                'The_Loai_Chup' => json_encode(['Chân dung']),
                'Boi_Canh_Chup' => 'Ngoài trời',
                'Ghi_Chu' => 'Chụp vào buổi sáng sớm',
                'Trang_Thai' => 'Chờ đặt cọc',
                'Ti_Le_Coc' => 35.00,
                'Ly_Do_Huy' => null,
                'Ngay_Tao' => $now->copy()->subDays(3),
            ],
            
            // Chờ thanh toán (đã đặt cọc)
                [
                    'Ma_BC' => 'BC004',
                'Ma_KH' => 'KH001',
                'Ma_NAG' => 'NAG004',
                'Tong_Tien' => 3500000,
                'Bat_Dau_Chup' => $now->copy()->addDays(3)->setTime(6, 0),
                'Ket_Thuc_Chup' => $now->copy()->addDays(3)->setTime(10, 0),
                'Dia_Diem' => 'Đà Lạt - Thác Datanla',
                'Loai_Chup' => 'Du lịch',
                'Tieu_De' => 'Chụp ảnh du lịch Đà Lạt',
                'The_Loai_Chup' => json_encode(['Du lịch', 'Phong cảnh']),
                'Boi_Canh_Chup' => 'Ngoài trời',
                'Ghi_Chu' => 'Chụp tại thác nước vào buổi sáng',
                'Trang_Thai' => 'Chờ thanh toán',
                'Ti_Le_Coc' => 30.00,
                'Ly_Do_Huy' => null,
                'Ngay_Tao' => $now->copy()->subDays(5),
            ],
            
            // Đang diễn ra (có thể bắt đầu ngay)
                [
                    'Ma_BC' => 'BC005',
                    'Ma_KH' => 'KH002',
                'Ma_NAG' => 'NAG005',
                'Tong_Tien' => 2000000,
                'Bat_Dau_Chup' => $now->copy()->setTime(9, 0),
                'Ket_Thuc_Chup' => $now->copy()->setTime(12, 0),
                'Dia_Diem' => 'Công viên Tao Đàn, TP.HCM',
                'Loai_Chup' => 'Couple',
                'Tieu_De' => 'Chụp ảnh couple',
                'The_Loai_Chup' => json_encode(['Couple', 'Lifestyle']),
                'Boi_Canh_Chup' => 'Ngoài trời',
                'Ghi_Chu' => 'Chụp ảnh tình yêu',
                'Trang_Thai' => 'Chờ thanh toán',
                'Ti_Le_Coc' => 30.00,
                'Ly_Do_Huy' => null,
                'Ngay_Tao' => $now->copy()->subDays(7),
            ],
            
            // Chờ xử lý ảnh
            [
                'Ma_BC' => 'BC006',
                'Ma_KH' => 'KH003',
                    'Ma_NAG' => 'NAG001',
                'Tong_Tien' => 2800000,
                'Bat_Dau_Chup' => $now->copy()->subDays(2)->setTime(14, 0),
                'Ket_Thuc_Chup' => $now->copy()->subDays(2)->setTime(17, 0),
                'Dia_Diem' => 'Studio tại Quận 3, TP.HCM',
                'Loai_Chup' => 'Sự kiện',
                'Tieu_De' => 'Chụp ảnh sự kiện công ty',
                'The_Loai_Chup' => json_encode(['Sự kiện', 'Commercial']),
                'Boi_Canh_Chup' => 'Trong nhà',
                'Ghi_Chu' => 'Đã hoàn thành buổi chụp, đang xử lý ảnh',
                'Trang_Thai' => 'Chờ xử lý ảnh',
                'Ti_Le_Coc' => 40.00,
                'Ly_Do_Huy' => null,
                'Ngay_Tao' => $now->copy()->subDays(10),
            ],
            
            // Đã xử lý ảnh
            [
                'Ma_BC' => 'BC007',
                'Ma_KH' => 'KH004',
                'Ma_NAG' => 'NAG002',
                    'Tong_Tien' => 2200000,
                'Bat_Dau_Chup' => $now->copy()->subDays(5)->setTime(8, 0),
                'Ket_Thuc_Chup' => $now->copy()->subDays(5)->setTime(11, 0),
                'Dia_Diem' => 'Công viên Thống Nhất, Hà Nội',
                'Loai_Chup' => 'Gia đình',
                'Tieu_De' => 'Chụp ảnh gia đình',
                'The_Loai_Chup' => json_encode(['Gia đình', 'Lifestyle']),
                'Boi_Canh_Chup' => 'Ngoài trời',
                'Ghi_Chu' => 'Đã upload ảnh hậu kỳ',
                'Trang_Thai' => 'Đã xử lý ảnh',
                'Ti_Le_Coc' => 30.00,
                'Ly_Do_Huy' => null,
                'Ngay_Tao' => $now->copy()->subDays(12),
            ],
            
            // Đã hoàn thành (có thể đánh giá)
            [
                'Ma_BC' => 'BC008',
                'Ma_KH' => 'KH001',
                'Ma_NAG' => 'NAG003',
                'Tong_Tien' => 2400000,
                'Bat_Dau_Chup' => $now->copy()->subDays(15)->setTime(10, 0),
                'Ket_Thuc_Chup' => $now->copy()->subDays(15)->setTime(13, 0),
                'Dia_Diem' => 'Phố cổ Hà Nội',
                'Loai_Chup' => 'Street Style',
                'Tieu_De' => 'Chụp ảnh street style',
                'The_Loai_Chup' => json_encode(['Street Style', 'Fashion']),
                'Boi_Canh_Chup' => 'Ngoài trời',
                'Ghi_Chu' => 'Đã thanh toán đầy đủ',
                'Trang_Thai' => 'Đã hoàn thành',
                    'Ti_Le_Coc' => 35.00,
                'Ly_Do_Huy' => null,
                'Ngay_Tao' => $now->copy()->subDays(20),
                ],
                [
                'Ma_BC' => 'BC009',
                    'Ma_KH' => 'KH002',
                'Ma_NAG' => 'NAG004',
                'Tong_Tien' => 3200000,
                'Bat_Dau_Chup' => $now->copy()->subDays(20)->setTime(6, 0),
                'Ket_Thuc_Chup' => $now->copy()->subDays(20)->setTime(10, 0),
                'Dia_Diem' => 'Nha Trang - Bãi biển',
                'Loai_Chup' => 'Du lịch',
                'Tieu_De' => 'Chụp ảnh du lịch Nha Trang',
                'The_Loai_Chup' => json_encode(['Du lịch', 'Phong cảnh']),
                'Boi_Canh_Chup' => 'Ngoài trời',
                'Ghi_Chu' => 'Chụp tại bãi biển vào buổi sáng',
                    'Trang_Thai' => 'Đã hoàn thành',
                'Ti_Le_Coc' => 30.00,
                'Ly_Do_Huy' => null,
                'Ngay_Tao' => $now->copy()->subDays(25),
            ],
            
            // Đã hủy
            [
                'Ma_BC' => 'BC010',
                'Ma_KH' => 'KH005',
                'Ma_NAG' => 'NAG005',
                'Tong_Tien' => 1900000,
                'Bat_Dau_Chup' => $now->copy()->addDays(15)->setTime(14, 0),
                'Ket_Thuc_Chup' => $now->copy()->addDays(15)->setTime(17, 0),
                'Dia_Diem' => 'Công viên Văn Thánh, TP.HCM',
                'Loai_Chup' => 'Chân dung',
                'Tieu_De' => 'Chụp ảnh chân dung',
                'The_Loai_Chup' => json_encode(['Chân dung']),
                'Boi_Canh_Chup' => 'Ngoài trời',
                'Ghi_Chu' => 'Đã hủy do lý do cá nhân',
                'Trang_Thai' => 'Đã hủy',
                'Ti_Le_Coc' => 30.00,
                'Ly_Do_Huy' => 'Khách hàng không thể tham gia',
                'Ngay_Tao' => $now->copy()->subDays(4),
            ],
        ];

        DB::table('buoi_chup')->insert($bookings);
    }

    /**
     * Seed thanh toán
     */
    private function seedPayments(): void
    {
        if (DB::table('thanh_toan')->count() > 0) {
            return;
        }

        $payments = [
            // Đặt cọc thành công cho BC004
            [
                'Ma_TT' => 'TT001',
                'Ma_BC' => 'BC004',
                'So_Tien' => 1050000, // 30% của 3,500,000
                'Hinh_Thuc' => 'Chuyển khoản',
                'Trang_Thai' => 'Thành công',
                'Ngay_TT' => now()->subDays(5),
                'Ghi_Chu' => json_encode([
                    'type' => 'deposit',
                    'deposit_amount' => 1050000,
                    'service_fee' => 0,
                    'method_raw' => 'vnpay',
                ]),
            ],
            
            // Đặt cọc thành công cho BC005
            [
                'Ma_TT' => 'TT002',
                'Ma_BC' => 'BC005',
                'So_Tien' => 600000, // 30% của 2,000,000
                'Hinh_Thuc' => 'Tiền mặt',
                'Trang_Thai' => 'Thành công',
                'Ngay_TT' => now()->subDays(7),
                'Ghi_Chu' => json_encode([
                    'type' => 'deposit',
                    'deposit_amount' => 600000,
                    'service_fee' => 0,
                    'method_raw' => 'vi_ca_nhan',
                ]),
            ],
            
            // Thanh toán cuối cho BC008
            [
                'Ma_TT' => 'TT003',
                'Ma_BC' => 'BC008',
                'So_Tien' => 2400000,
                'Hinh_Thuc' => 'Chuyển khoản',
                'Trang_Thai' => 'Thành công',
                'Ngay_TT' => now()->subDays(16),
                'Ghi_Chu' => json_encode([
                    'type' => 'final_payment',
                    'total_amount' => 2400000,
                    'method_raw' => 'vnpay',
                ]),
            ],
            
            // Thanh toán cuối cho BC009
            [
                'Ma_TT' => 'TT004',
                'Ma_BC' => 'BC009',
                'So_Tien' => 3200000,
                'Hinh_Thuc' => 'Chuyển khoản',
                'Trang_Thai' => 'Thành công',
                'Ngay_TT' => now()->subDays(21),
                'Ghi_Chu' => json_encode([
                    'type' => 'final_payment',
                    'total_amount' => 3200000,
                    'method_raw' => 'vnpay',
                ]),
            ],
        ];

        DB::table('thanh_toan')->insert($payments);
    }

    /**
     * Seed tin nhắn
     */
    private function seedMessages(): void
    {
        if (DB::table('tin_nhan')->count() > 0) {
            return;
        }

        $messages = [
            // Tin nhắn cho BC001 (Chờ xác nhận)
            [
                'Ma_TN' => 'TN001',
                'Ma_BC' => 'BC001',
                'Ma_KH' => 'KH001',
                'Ma_NAG' => null,
                'Noi_Dung' => 'Xin chào, tôi muốn đặt lịch chụp ảnh kỷ yếu vào tuần sau. Mong được xác nhận sớm.',
                'Gui_Luc' => now()->subDays(2)->setTime(10, 30),
                'Trang_Thai' => 'Đã đọc',
                'Loai_Tin' => 'KH-NAG',
            ],
            [
                'Ma_TN' => 'TN002',
                'Ma_BC' => 'BC001',
                'Ma_KH' => null,
                'Ma_NAG' => 'NAG001',
                'Noi_Dung' => 'Cảm ơn bạn đã đặt lịch. Tôi sẽ xác nhận trong ngày hôm nay.',
                'Gui_Luc' => now()->subDays(2)->setTime(11, 0),
                'Trang_Thai' => 'Đã đọc',
                'Loai_Tin' => 'KH-NAG',
            ],
            
            // Tin nhắn cho BC003 (Chờ đặt cọc)
            [
                'Ma_TN' => 'TN003',
                'Ma_BC' => 'BC003',
                'Ma_KH' => null,
                'Ma_NAG' => 'NAG003',
                'Noi_Dung' => 'Buổi chụp đã được xác nhận. Vui lòng đặt cọc trong vòng 3 ngày.',
                'Gui_Luc' => now()->subDays(3)->setTime(9, 0),
                'Trang_Thai' => 'Đã đọc',
                'Loai_Tin' => 'KH-NAG',
            ],
            [
                'Ma_TN' => 'TN004',
                'Ma_BC' => 'BC003',
                'Ma_KH' => 'KH003',
                'Ma_NAG' => null,
                'Noi_Dung' => 'Cảm ơn bạn. Tôi sẽ đặt cọc ngay.',
                'Gui_Luc' => now()->subDays(3)->setTime(9, 15),
                'Trang_Thai' => 'Đã đọc',
                'Loai_Tin' => 'KH-NAG',
            ],
            
            // Tin nhắn cho BC004 (Chờ thanh toán) - có tin nhắn chưa đọc
            [
                'Ma_TN' => 'TN005',
                'Ma_BC' => 'BC004',
                'Ma_KH' => null,
                'Ma_NAG' => 'NAG004',
                'Noi_Dung' => 'Đã nhận được đặt cọc. Buổi chụp sẽ diễn ra vào ngày mai. Vui lòng chuẩn bị sẵn sàng.',
                'Gui_Luc' => now()->subDays(4)->setTime(14, 0),
                'Trang_Thai' => 'Đã đọc',
                'Loai_Tin' => 'KH-NAG',
            ],
            [
                'Ma_TN' => 'TN006',
                'Ma_BC' => 'BC004',
                'Ma_KH' => null,
                'Ma_NAG' => 'NAG004',
                'Noi_Dung' => 'Nhớ mang theo quần áo phù hợp với thời tiết Đà Lạt nhé.',
                'Gui_Luc' => now()->subDays(3)->setTime(20, 0),
                'Trang_Thai' => 'Đã gửi', // Chưa đọc
                'Loai_Tin' => 'KH-NAG',
            ],
            
            // Tin nhắn cho BC006 (Chờ xử lý ảnh)
            [
                'Ma_TN' => 'TN007',
                'Ma_BC' => 'BC006',
                'Ma_KH' => 'KH003',
                'Ma_NAG' => null,
                'Noi_Dung' => 'Buổi chụp hôm nay rất tuyệt vời. Khi nào có ảnh vậy bạn?',
                'Gui_Luc' => now()->subDays(2)->setTime(18, 0),
                'Trang_Thai' => 'Đã đọc',
                'Loai_Tin' => 'KH-NAG',
            ],
            [
                'Ma_TN' => 'TN008',
                'Ma_BC' => 'BC006',
                'Ma_KH' => null,
                'Ma_NAG' => 'NAG001',
                'Noi_Dung' => 'Cảm ơn bạn. Tôi đang xử lý ảnh, sẽ gửi trong 3-5 ngày.',
                'Gui_Luc' => now()->subDays(2)->setTime(18, 30),
                'Trang_Thai' => 'Đã đọc',
                'Loai_Tin' => 'KH-NAG',
            ],
        ];

        DB::table('tin_nhan')->insert($messages);
    }

    /**
     * Seed đánh giá
     */
    private function seedReviews(): void
    {
        if (DB::table('danh_gia')->count() > 0) {
            return;
        }

        $reviews = [
            [
                'Ma_ĐG' => 'DG001',
                'Ma_BC' => 'BC008',
                'Ma_KH' => 'KH001',
                'Ma_NAG' => 'NAG003',
                'So_Sao' => 5,
                'Noi_Dung' => 'Nhiếp ảnh gia rất chuyên nghiệp, ảnh đẹp và giao hàng đúng hạn. Rất hài lòng!',
                'Ngay_ĐG' => now()->subDays(14),
            ],
            [
                'Ma_ĐG' => 'DG002',
                'Ma_BC' => 'BC009',
                'Ma_KH' => 'KH002',
                'Ma_NAG' => 'NAG004',
                'So_Sao' => 4,
                'Noi_Dung' => 'Ảnh rất đẹp, phong cảnh được chụp rất ấn tượng. Chỉ hơi chậm một chút trong việc giao ảnh.',
                'Ngay_ĐG' => now()->subDays(19),
            ],
        ];

        DB::table('danh_gia')->insert($reviews);
    }
}
