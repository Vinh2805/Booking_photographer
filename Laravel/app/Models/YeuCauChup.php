<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class YeuCauChup extends Model
{
    protected $table = 'yeu_cau_chup';
    protected $primaryKey = 'Ma_YC';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'Ma_YC',
        'Ma_KH',
        'Ma_NAG',
        'Loai_Chup',
        'Dia_Diem',
        'Thoi_Gian',
        'Ghi_Chu',
        'Trang_Thai',
        'Ngay_Tao',
    ];
}
