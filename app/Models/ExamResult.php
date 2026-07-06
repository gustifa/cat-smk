<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExamResult extends Model
{
    // Mengizinkan semua kolom di tabel exams untuk diisi
    protected $guarded = [];

    // Menyambungkan data nilai ini dengan data akun Siswa
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
