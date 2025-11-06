<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TinNhan extends Model
{
    use HasFactory;

    protected $table = 'tin_nhan';

    protected $fillable = [
        'Ma_TN',
        'Ma_BC',
        'Ma_KH',
        'Ma_NAG',
        'Noi_Dung',
        'Trang_Thai',
        'Loai_Tin',
    ];

    public $timestamps = false;

    public function khachHang() {
        return $this->belongsTo(KhachHang::class, 'Ma_KH', 'Ma_KH');
    }

    public function nhiepAnhGia() {
        return $this->belongsTo(NhiepAnhGia::class, 'Ma_NAG', 'Ma_NAG');
    }
}
