<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Exam;
use Inertia\Inertia;

class TeacherExamController extends Controller
{
    public function index()
    {
        $exams = Exam::latest()->get();
        return Inertia::render('Exams/Index', [
            'exams' => $exams
        ]);
    }

    // 2. Menampilkan Form Tambah Ujian
    public function create()
    {
        return Inertia::render('Exams/Create');
    }

    // 3. Menyimpan data Ujian ke Database
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'duration' => 'required|integer|min:1',
            'status' => 'required|in:active,inactive',
        ]);

        Exam::create([
            'title' => $request->title,
            'duration' => $request->duration,
            'status' => $request->status,
        ]);

        return redirect()->route('teacher.exams.index')->with('success', 'Mata Ujian baru berhasil ditambahkan!');
    }

    // 4. Menghapus Mata Ujian (Opsional untuk pelengkap)
    
    public function destroy($id)
{
    $exam = Exam::findOrFail($id);
    
    // Validasi pengerjaan siswa
    if ($exam->results()->exists()) {
        return back()->with('error', 'Ujian ini sudah digunakan dan tidak bisa dihapus.');
    }

    $exam->delete(); // Data tidak akan hilang, hanya ditandai "deleted"

    return redirect()->route('teacher.exams.index')->with('success', 'Ujian berhasil diarsipkan.');
}

    public function activate(Request $request, $id)
    {
        $exam = Exam::findOrFail($id);
    // Pastikan token digenerate dan disimpan
    $token = strtoupper(substr(md5(rand()), 0, 6));
    
    $exam->update([
        'status' => 'active',
        'token' => $token // Token wajib disimpan di sini
    ]);

    // Mengirimkan data ujian terbaru agar frontend menerima token yang benar
    return back()->with('success', 'Ujian berhasil diaktifkan!');
    }

    public function deactivate($id)
    {
        $exam = Exam::findOrFail($id);
        $exam->update(['status' => 'inactive', 'token' => null]);

        return back()->with('success', 'Ujian telah ditutup.');
    }
}
