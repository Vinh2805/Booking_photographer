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

    protected $fillable = [
        'Ma_BC','Ma_NAG','Ma_KH','Ngay_Tao','Tong_Tien','Bat_Dau_Chup',
        'Ket_Thuc_Chup','Dia_Diem','Loai_Chup','Ghi_Chu','Trang_Thai',
        'Ti_Le_Coc','Ly_Do_Huy','Ly_Do_Thay_Doi'
    ];
}
