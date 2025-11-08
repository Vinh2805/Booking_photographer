<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KhachHang extends Model
{
    use HasFactory;

    protected $table = 'khach_hang';
    protected $primaryKey = 'Ma_KH';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'Ma_KH', 'Ma_TK', 'Dia_Chi', 'Ngay_Sinh', 'Gioi_Tinh'
    ];
}