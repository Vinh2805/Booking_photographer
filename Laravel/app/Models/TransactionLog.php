<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransactionLog extends Model
{
    protected $table = 'lich_su_giao_dich';
    public $timestamps = false;

    protected $fillable = [
        'Ma_BC', 'Loai_Giao_Dich', 'Mo_Ta', 'Ip_Address', 'User_Agent', 'Thoi_Gian'
    ];

    // Helper tiện dụng
    public static function record(string $ma_bc, string $type, string $desc = null): void
    {
        self::create([
            'Ma_BC' => $ma_bc,
            'Loai_Giao_Dich' => $type,
            'Mo_Ta' => $desc,
            'Ip_Address' => request()->ip(),
            'User_Agent' => request()->header('User-Agent')
        ]);
    }
}
