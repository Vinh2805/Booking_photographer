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

    protected $fillable = [
        'Ma_NAG', 'Ma_TK', 'Dia_Diem_Hoat_Dong', 'Kinh_Nghiem', 'Gia_Trung_Binh'
    ];
}