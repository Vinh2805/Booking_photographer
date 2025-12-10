<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('nhiep_anh_gia_dich_vu', function (Blueprint $table) {
            $table->id();
            $table->string('Ma_NAG');
            $table->string('Ma_DV');
            $table->decimal('Gia', 12, 2)->default(0);
            $table->timestamps();

            $table->foreign('Ma_NAG')->references('Ma_NAG')->on('nhiep_anh_gia')->onDelete('cascade');
            $table->foreign('Ma_DV')->references('Ma_DV')->on('dich_vu')->onDelete('cascade');
            
            $table->unique(['Ma_NAG', 'Ma_DV']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nhiep_anh_gia_dich_vu');
    }
};
