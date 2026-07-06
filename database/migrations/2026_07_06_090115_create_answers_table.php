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
        Schema::create('answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // ID Siswa
            $table->foreignId('exam_id')->constrained()->cascadeOnDelete(); // ID Ujian
            $table->foreignId('question_id')->constrained()->cascadeOnDelete(); // ID Soal
            $table->text('answer_text')->nullable(); // Jawaban yang dipilih/diketik siswa
            $table->boolean('is_correct')->default(false); // Benar atau Salah
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('answers');
    }
};
