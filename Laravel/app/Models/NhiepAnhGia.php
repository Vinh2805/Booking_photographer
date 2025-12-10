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
        'Ma_NAG', 'Ma_TK', 'Loai_TK', 'So_Du', 'Trang_Thai', 'Dia_Diem_Hoat_Dong', 'Kinh_Nghiem', 'Gia_Trung_Binh',
        'Anh_Bia', 'Boi_Canh_Chup', 'Thiet_Bi', 'Portfolio', 'Gia_Toi_Thieu', 'Gia_Toi_Da'
    ];

    protected $casts = [
        'So_Du' => 'decimal:2',
    ];

    // Relationships
    public function taiKhoan()
    {
        return $this->belongsTo(User::class, 'Ma_TK', 'Ma_TK');
    }

    public function buoiChups()
    {
        return $this->hasMany(BuoiChup::class, 'Ma_NAG', 'Ma_NAG');
    }

    public function danhGias()
    {
        return $this->hasMany(DanhGia::class, 'Ma_NAG', 'Ma_NAG');
    }

    public function walletTransactions()
    {
        return $this->hasMany(WalletTransaction::class, 'Ma_Nguoi_Dung', 'Ma_NAG')
                    ->where('Loai_Nguoi_Dung', 'nhiep_anh_gia');
    }

    public function dichVu()
    {
        return $this->belongsToMany(DichVu::class, 'nhiep_anh_gia_dich_vu', 'Ma_NAG', 'Ma_DV')
                    ->withPivot('Gia')
                    ->withTimestamps();
    }
}