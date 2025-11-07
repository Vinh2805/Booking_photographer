<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BuoiChup extends Model
{
    protected $table = 'buoi_chup';
    protected $primaryKey = 'Ma_BC';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;


    protected $casts = [
        'Ngay_Tao' => 'datetime',
        'Bat_Dau_Chup' => 'datetime',
        'Ket_Thuc_Chup' => 'datetime',
        'Tong_Tien' => 'decimal:2',
        'Ti_Le_Coc' => 'decimal:2',
    ];
    protected $attributes = [
    'So_Nguoi' => 0,
];
    protected $fillable = [
        'Ma_BC','Ma_NAG','Ma_KH','Ngay_Tao','Tong_Tien','Bat_Dau_Chup',
        'Ket_Thuc_Chup','Dia_Diem','Loai_Chup','Ghi_Chu','Trang_Thai',
        'Ti_Le_Coc','Ly_Do_Huy','Ly_Do_Thay_Doi'
    ];
    public static function generateMaBC(): string
    {
        $latest = self::orderBy('Ma_BC', 'desc')->first();

        if (!$latest) {
            return 'BC001'; 
        }

        $number = (int) substr($latest->Ma_BC, 2); // lấy phần số
        $next = $number + 1;
        return 'BC' . str_pad($next, 3, '0', STR_PAD_LEFT);
    }
}
