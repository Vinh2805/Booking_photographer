<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BuoiChup extends Model
{
    use HasFactory;

    protected $table = 'buoi_chup';
    protected $primaryKey = 'Ma_BC';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $casts = [
        'Ngay_Tao' => 'datetime',
        'Bat_Dau_Chup' => 'datetime',
        'Ket_Thuc_Chup' => 'datetime',
        'Tong_Tien' => 'decimal:2',
        'Ti_Le_Coc' => 'decimal:2',
    ];

    protected $fillable = [
        'Ma_BC', 'Ma_NAG', 'Ma_KH', 'Tong_Tien', 'Bat_Dau_Chup', 
        'Ket_Thuc_Chup', 'Dia_Diem', 'Loai_Chup', 'Ghi_Chu', 
        'Trang_Thai', 'Ti_Le_Coc', 'Ly_Do_Huy', 'Ly_Do_Thay_Doi'
    ];

    /**
     * Relationship với khách hàng
     */
    public function khachHang(): BelongsTo
    {
        return $this->belongsTo(KhachHang::class, 'Ma_KH', 'Ma_KH');
    }

    /**
     * Relationship với nhiếp ảnh gia
     */
    public function nhaNhiepAnh(): BelongsTo
    {
        return $this->belongsTo(NhiepAnhGia::class, 'Ma_NAG', 'Ma_NAG');
    }

    /**
     * Relationship với dịch vụ (qua bảng trung gian)
     */
    public function dichVu()
    {
        return $this->belongsToMany(
            DichVu::class, 
            'buoi_chup_dich_vu', 
            'Ma_BC', 
            'Ma_DV'
        )->withPivot('So_Luong', 'Gia');
    }

    /**
     * Relationship với ảnh
     */
    public function anh(): HasMany
    {
        return $this->hasMany(Anh::class, 'Ma_BC', 'Ma_BC');
    }
}