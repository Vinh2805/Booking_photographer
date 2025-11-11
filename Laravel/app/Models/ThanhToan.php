<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ThanhToan extends Model
{
    protected $table = 'thanh_toan';
    protected $primaryKey = 'Ma_TT';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'Ma_TT','Ma_BC','So_Tien','Hinh_Thuc','Trang_Thai','Ngay_TT','Ghi_Chu'
    ];

    // Relationships
    public function buoiChup()
    {
        return $this->belongsTo(BuoiChup::class, 'Ma_BC', 'Ma_BC');
    }
}
