<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DanhGia extends Model
{
    use HasFactory;

    protected $table = 'danh_gia';
    protected $primaryKey = 'Ma_ĐG';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false; // Bảng này dùng Ngay_ĐG timestamp default, không dùng created_at/updated_at chuẩn

    protected $fillable = [
        'Ma_ĐG',
        'Ma_BC',
        'Ma_KH',
        'Ma_NAG',
        'So_Sao',
        'Noi_Dung',
        'Ngay_ĐG'
    ];

    public function buoiChup()
    {
        return $this->belongsTo(BuoiChup::class, 'Ma_BC', 'Ma_BC');
    }

    public function khachHang()
    {
        return $this->belongsTo(KhachHang::class, 'Ma_KH', 'Ma_KH');
    }

    public function nhiepAnhGia()
    {
        return $this->belongsTo(NhiepAnhGia::class, 'Ma_NAG', 'Ma_NAG');
    }
}
