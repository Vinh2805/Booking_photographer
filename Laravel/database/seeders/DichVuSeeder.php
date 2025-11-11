<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DichVuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $services = [
            [
                'Ma_DV' => 'DV001',
                'Ten_DV' => 'Chỉnh sửa ảnh cơ bản',
                'Mo_Ta' => 'Chỉnh sửa màu sắc, độ sáng, độ tương phản cơ bản cho ảnh',
                'Gia' => 50000,
                'Hoat_Dong' => true,
            ],
            [
                'Ma_DV' => 'DV002',
                'Ten_DV' => 'Chỉnh sửa ảnh nâng cao',
                'Mo_Ta' => 'Chỉnh sửa chuyên sâu, retouch, xóa phông, chỉnh màu nâng cao',
                'Gia' => 150000,
                'Hoat_Dong' => true,
            ],
            [
                'Ma_DV' => 'DV003',
                'Ten_DV' => 'Album ảnh kỹ thuật số',
                'Mo_Ta' => 'Tạo album ảnh kỹ thuật số với thiết kế chuyên nghiệp',
                'Gia' => 200000,
                'Hoat_Dong' => true,
            ],
            [
                'Ma_DV' => 'DV004',
                'Ten_DV' => 'In ảnh chất lượng cao',
                'Mo_Ta' => 'In ảnh trên giấy ảnh chất lượng cao, kích thước tùy chọn',
                'Gia' => 30000,
                'Hoat_Dong' => true,
            ],
            [
                'Ma_DV' => 'DV005',
                'Ten_DV' => 'Video highlight',
                'Mo_Ta' => 'Tạo video highlight ngắn từ các khoảnh khắc đẹp nhất của buổi chụp',
                'Gia' => 500000,
                'Hoat_Dong' => true,
            ],
            [
                'Ma_DV' => 'DV006',
                'Ten_DV' => 'Trang điểm chuyên nghiệp',
                'Mo_Ta' => 'Dịch vụ trang điểm chuyên nghiệp cho buổi chụp',
                'Gia' => 800000,
                'Hoat_Dong' => true,
            ],
            [
                'Ma_DV' => 'DV007',
                'Ten_DV' => 'Cho thuê trang phục',
                'Mo_Ta' => 'Cho thuê trang phục chụp ảnh (áo dài, vest, váy cưới...)',
                'Gia' => 300000,
                'Hoat_Dong' => true,
            ],
            [
                'Ma_DV' => 'DV008',
                'Ten_DV' => 'Phụ kiện chụp ảnh',
                'Mo_Ta' => 'Cung cấp phụ kiện chụp ảnh (hoa, đạo cụ, backdrop...)',
                'Gia' => 200000,
                'Hoat_Dong' => true,
            ],
            [
                'Ma_DV' => 'DV009',
                'Ten_DV' => 'Chụp thêm giờ',
                'Mo_Ta' => 'Chụp thêm giờ ngoài thời gian đã đặt (mỗi giờ)',
                'Gia' => 500000,
                'Hoat_Dong' => true,
            ],
            [
                'Ma_DV' => 'DV010',
                'Ten_DV' => 'Giao ảnh gấp (24h)',
                'Mo_Ta' => 'Giao ảnh trong vòng 24 giờ sau buổi chụp',
                'Gia' => 300000,
                'Hoat_Dong' => true,
            ],
        ];

        foreach ($services as $service) {
            DB::table('dich_vu')->updateOrInsert(
                ['Ma_DV' => $service['Ma_DV']],
                $service
            );
        }
    }
}
