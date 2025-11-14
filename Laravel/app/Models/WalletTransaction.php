<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WalletTransaction extends Model
{
    use HasFactory;

    protected $table = 'wallet_transactions';
    public $timestamps = false;

    protected $fillable = [
        'Loai_Nguoi_Dung',
        'Ma_Nguoi_Dung',
        'Loai_Giao_Dich',
        'So_Tien',
        'So_Du_Truoc',
        'So_Du_Sau',
        'Ma_BC',
        'Ma_TT',
        'Ghi_Chu',
        'So_Tai_Khoan',
        'Ten_Ngan_Hang',
        'Ten_Chu_Tai_Khoan',
        'Transaction_ID',
        'Thoi_Gian',
    ];

    protected $casts = [
        'So_Tien' => 'decimal:2',
        'So_Du_Truoc' => 'decimal:2',
        'So_Du_Sau' => 'decimal:2',
        'Thoi_Gian' => 'datetime',
    ];

    /**
     * Tạo bản ghi giao dịch ví
     */
    public static function createTransaction(
        string $loaiNguoiDung,
        string $maNguoiDung,
        string $loaiGiaoDich,
        float $soTien,
        float $soDuTruoc,
        float $soDuSau,
        ?string $maBc = null,
        ?string $maTt = null,
        ?string $ghiChu = null,
        ?string $soTaiKhoan = null,
        ?string $tenNganHang = null,
        ?string $tenChuTaiKhoan = null,
        ?string $transactionId = null
    ): self {
        return self::create([
            'Loai_Nguoi_Dung' => $loaiNguoiDung,
            'Ma_Nguoi_Dung' => $maNguoiDung,
            'Loai_Giao_Dich' => $loaiGiaoDich,
            'So_Tien' => $soTien,
            'So_Du_Truoc' => $soDuTruoc,
            'So_Du_Sau' => $soDuSau,
            'Ma_BC' => $maBc,
            'Ma_TT' => $maTt,
            'Ghi_Chu' => $ghiChu,
            'So_Tai_Khoan' => $soTaiKhoan,
            'Ten_Ngan_Hang' => $tenNganHang,
            'Ten_Chu_Tai_Khoan' => $tenChuTaiKhoan,
            'Transaction_ID' => $transactionId,
            'Thoi_Gian' => now(),
        ]);
    }
}
