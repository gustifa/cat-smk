<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Answer extends Model
{
    // Mengizinkan semua kolom di tabel exams untuk diisi
    protected $guarded = [];

    // Relasi ke User (Siswa)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relasi ke Question (Soal)
    public function question()
    {
        return $this->belongsTo(Question::class);
    }
}
