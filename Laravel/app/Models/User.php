<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, HasApiTokens;

    protected $table = 'tai_khoan';
    protected $primaryKey = 'Ma_TK';
    public $incrementing = false;
    protected $keyType = 'string';

    public $timestamps = false;

    // ⚙️ Cho phép mass assignment toàn bộ trường (tránh bị chặn khi create)
    protected $guarded = [];

    protected $fillable = [
        'Ma_TK',
        'Ho_Ten',
        'Email_TK',
        'Mat_Khau',
        'Loai_TK',
        'Hinh_Thuc_Dang_Nhap',
    ];

    protected $hidden = [
        'Mat_Khau',
        'remember_token',
    ];

    public function getAuthPassword()
    {
        return $this->Mat_Khau;
    }
}
