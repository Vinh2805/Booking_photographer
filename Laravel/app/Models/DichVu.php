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
        'Ma_DV', 'Ten_DV', 'Gia'
    ];
}