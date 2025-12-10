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
    
    protected $fillable = [
        'Ma_BC','Ma_NAG','Ma_KH','Ngay_Tao','Tong_Tien','Bat_Dau_Chup',
        'Ket_Thuc_Chup','Dia_Diem','Loai_Chup','Ghi_Chu','Trang_Thai',
        'Ti_Le_Coc','Ly_Do_Huy','Ly_Do_Thay_Doi','Tieu_De','The_Loai_Chup',
        'Boi_Canh_Chup','Anh_Minh_Hoa'
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

    // Relationships
    public function khachHang()
    {
        return $this->belongsTo(KhachHang::class, 'Ma_KH', 'Ma_KH');
    }

    public function nhaNhiepAnh()
    {
        return $this->belongsTo(NhiepAnhGia::class, 'Ma_NAG', 'Ma_NAG');
    }



    public function dichVu()
    {
        // Nếu có bảng pivot buoi_chup_dich_vu
        return $this->belongsToMany(DichVu::class, 'buoi_chup_dich_vu', 'Ma_BC', 'Ma_DV');
    }

    public function danhGia()
    {
        return $this->hasOne(DanhGia::class, 'Ma_BC', 'Ma_BC');
    }
}
