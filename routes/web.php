<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\StudentExamController;

use App\Http\Controllers\ExamController;
use App\Http\Controllers\ReportController;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'role:admin,teacher'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Route untuk mengambil data JSON Datatables
    Route::get('/questions/data', [QuestionController::class, 'data'])->name('questions.data');
    Route::post('/questions/generate', [QuestionController::class, 'generateWithAI']);
    
    // Route untuk halaman CRUD
    Route::resource('questions', QuestionController::class);

    Route::get('/students', [StudentController::class, 'index'])->name('students.index');
    Route::get('/students/export', [StudentController::class, 'export'])->name('students.export');
    Route::post('/students/import', [StudentController::class, 'import'])->name('students.import');

    // Route untuk Manajemen Mata Ujian (Admin/Guru)
    Route::resource('exams', ExamController::class)->except(['show', 'edit', 'update']);
    // Export Detail Jawaban (Guru/Pengawas)
    Route::get('/reports/exam/{id}/answers/excel', [ReportController::class, 'exportAnswers'])->name('reports.answers.excel');
    // Export Laporan (Guru/Pengawas)
    Route::get('/reports/exam/{id}/pdf', [ReportController::class, 'exportPdf'])->name('reports.pdf');
    Route::get('/reports/exam/{id}/excel', [ReportController::class, 'exportExcel'])->name('reports.excel');
    // Dashboard Guru (Pusat Unduh Laporan)
    Route::get('/teacher/report', [ReportController::class, 'index'])->name('teacher.dashboard');

    // Kelola Nilai & Remedial (Guru)
    Route::get('/teacher/exam/{id}/results', [ReportController::class, 'showResults'])->name('teacher.exam.results');
    Route::delete('/teacher/exam/{exam_id}/student/{user_id}/reset', [ReportController::class, 'resetStudent'])->name('teacher.exam.reset');
});

Route::middleware(['auth', 'role:student'])->group(function () {
    // Khusus Siswa
    Route::get('/student/dashboard', [StudentExamController::class, 'index'])->name('student.dashboard');
    Route::get('/student/exam/{id}', [StudentExamController::class, 'take'])->name('student.exam.take');
    Route::post('/student/exam/{id}/submit', [StudentExamController::class, 'submit'])->name('student.exam.submit');

    
});


require __DIR__.'/auth.php';
