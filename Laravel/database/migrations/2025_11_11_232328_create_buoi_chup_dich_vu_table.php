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
        Schema::create('buoi_chup_dich_vu', function (Blueprint $table) {
            $table->id();
            $table->string('Ma_BC', 20);
            $table->string('Ma_DV', 20);
            $table->timestamps();

            $table->foreign('Ma_BC')->references('Ma_BC')->on('buoi_chup')->onDelete('cascade')->onUpdate('cascade');
            $table->foreign('Ma_DV')->references('Ma_DV')->on('dich_vu')->onDelete('cascade')->onUpdate('cascade');
            
            $table->unique(['Ma_BC', 'Ma_DV']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('buoi_chup_dich_vu');
    }
};
