<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes; // Impor ini

class Exam extends Model
{
    use SoftDeletes; // Aktifkan trait

    protected $dates = ['deleted_at'];
    // Mengizinkan semua kolom di tabel exams untuk diisi
    protected $guarded = [];

    public function results()
    {
        return $this->hasMany(ExamResult::class, 'exam_id');
    }
}
