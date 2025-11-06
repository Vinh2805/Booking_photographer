<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Anh extends Model
{
    protected $table = 'anh';
    protected $primaryKey = 'Ma_Anh';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = true;

    protected $fillable = [
        'Ma_BC', 'Duong_Dan', 'Ten_Anh', 'Mo_Ta'
    ];

    public function buoiChup()
    {
        return $this->belongsTo(\App\Models\BuoiChup::class, 'Ma_BC', 'Ma_BC');
    }
}
