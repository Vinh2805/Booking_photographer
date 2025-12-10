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
        'Ma_KH', 'Ma_TK', 'Loai_TK', 'So_Du', 'Dia_Chi', 'Ngay_Sinh', 'Gioi_Tinh', 'So_Thich_The_Loai', 'So_Thich_Dia_Diem'
    ];

    public $timestamps = false;

    protected $casts = [
        'Ngay_Sinh' => 'date',
        'So_Du' => 'decimal:2',
    ];

    public function taiKhoan()
    {
        return $this->belongsTo(User::class, 'Ma_TK', 'Ma_TK');
    }

    public function buoiChups()
    {
        return $this->hasMany(BuoiChup::class, 'Ma_KH', 'Ma_KH');
    }
}