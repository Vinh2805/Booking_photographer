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
        'So_ĐT',
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

    /**
     * Get the fully qualified User Avatar URL
     */
    public function getAvatarUrlAttribute()
    {
        if (empty($this->Avatar)) {
            return null;
        }

        // If it's already a full URL (e.g. from Google login)
        if (str_starts_with($this->Avatar, 'http')) {
            return $this->Avatar;
        }

        // If it's a storage path
        if (str_starts_with($this->Avatar, '/storage/avatars/')) {
            $fileName = basename($this->Avatar);
            return url('/api/storage/avatars/' . $fileName);
        }

        // Fallback or other path
        return $this->Avatar;
    }

    // Append this attribute to JSON arrays
    protected $appends = ['avatar_url'];
}
