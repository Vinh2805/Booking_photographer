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
        Schema::table('yeu_cau_thay_doi', function (Blueprint $table) {
            $table->enum('Nguoi_Gui', ['customer', 'photographer'])->default('customer')->after('Ma_BC');
            $table->string('Ma_Nguoi_Gui', 20)->nullable()->after('Nguoi_Gui'); // Ma_KH hoặc Ma_NAG
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('yeu_cau_thay_doi', function (Blueprint $table) {
            $table->dropColumn(['Nguoi_Gui', 'Ma_Nguoi_Gui']);
        });
    }
};
