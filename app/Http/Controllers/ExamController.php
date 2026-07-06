<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Exam;
use Inertia\Inertia;

class ExamController extends Controller
{
    // 1. Menampilkan daftar Mata Ujian
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

        return redirect()->route('exams.index')->with('success', 'Mata Ujian baru berhasil ditambahkan!');
    }

    // 4. Menghapus Mata Ujian (Opsional untuk pelengkap)
    public function destroy($id)
    {
        $exam = Exam::findOrFail($id);
        $exam->delete();

        return redirect()->route('exams.index')->with('success', 'Mata Ujian berhasil dihapus.');
    }
}
