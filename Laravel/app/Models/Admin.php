<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Admin extends Model
{
    use HasFactory;

    protected $table = 'admins';
    protected $primaryKey = 'Ma_Admin';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'Ma_Admin',
        'Ma_TK',
        'So_Du',
    ];

    public function taiKhoan()
    {
        return $this->belongsTo(User::class, 'Ma_TK', 'Ma_TK');
    }
}
