<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NhiepAnhGia extends Model
{
    use HasFactory;

    protected $table = 'nhiep_anh_gia';
    protected $primaryKey = 'Ma_NAG';
    public $incrementing = false;
    protected $keyType = 'string';

    public $timestamps = false;

    protected $fillable = [
        'Ma_NAG', 'Ma_TK', 'Dia_Diem_Hoat_Dong', 'Kinh_Nghiem', 'Gia_Trung_Binh',
        'Anh_Bia', 'Boi_Canh_Chup', 'Thiet_Bi', 'Portfolio', 'Gia_Toi_Thieu', 'Gia_Toi_Da'
    ];

    // Relationships
    public function taiKhoan()
    {
        return $this->belongsTo(User::class, 'Ma_TK', 'Ma_TK');
    }
}