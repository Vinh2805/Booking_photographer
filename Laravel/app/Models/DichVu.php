<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DichVu extends Model
{
    use HasFactory;

    protected $table = 'dich_vu';
    protected $primaryKey = 'Ma_DV';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'Ma_DV', 'Ten_DV', 'Mo_Ta', 'Hoat_Dong', 'Loai_DV'
    ];

    protected $casts = [
        'Hoat_Dong' => 'boolean',
        'Loai_DV' => 'integer',
    ];
    public function nhiepAnhGia()
    {
        return $this->belongsToMany(NhiepAnhGia::class, 'nhiep_anh_gia_dich_vu', 'Ma_DV', 'Ma_NAG')
                    ->withPivot('Gia')
                    ->withTimestamps();
    }
}