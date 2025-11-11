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
        Schema::create('dich_vu', function (Blueprint $table) {
            $table->string('Ma_DV', 20)->primary();
            $table->string('Ten_DV', 255);
            $table->text('Mo_Ta')->nullable();
            $table->decimal('Gia', 12, 2);
            $table->boolean('Hoat_Dong')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dich_vu');
    }
};
