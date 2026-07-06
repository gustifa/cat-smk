<?php

namespace App\Http\Controllers;

use App\Models\Question;
use Illuminate\Http\Request;
use Yajra\DataTables\Facades\DataTables;
use Inertia\Inertia;
use App\Models\Exam;

class QuestionController extends Controller
{
    // Menampilkan halaman React
    public function index()
    {
        return Inertia::render('Questions/Index');
    }

    // Mengirim data format JSON untuk Yajra DataTables
    public function data()
    {
        $query = Question::query();

        return DataTables::of($query)
            ->addColumn('action', function ($row) {
                return '
                    <button class="btn btn-sm btn-primary edit-btn" data-id="'.$row->id.'">Edit</button>
                    <button class="btn btn-sm btn-danger delete-btn" data-id="'.$row->id.'">Hapus</button>
                ';
            })
            ->editColumn('question_text', function ($row) {
                // Memotong teks jika terlalu panjang
                return \Str::limit(strip_tags($row->question_text), 50);
            })
            ->rawColumns(['action'])
            ->make(true);
    }

    // Menampilkan halaman form tambah soal
    public function create()
    {
        $exams = Exam::all(); // Mengambil semua data ujian untuk pilihan dropdown
        return Inertia::render('Questions/Create', [
            'exams' => $exams
        ]);
    }

    // Menyimpan data soal baru ke database
    public function store(Request $request)
    {
        $request->validate([
            'exam_id' => 'required|exists:exams,id',
            'question_text' => 'required',
            'type' => 'required|in:pilihan_ganda,isian_singkat,uraian,menjodohkan',
            'correct_answer' => 'required',
        ]);

        // Simpan ke database
        Question::create([
            'exam_id' => $request->exam_id,
            'question_text' => $request->question_text,
            'type' => $request->type,
            'options' => $request->options, // Otomatis tersimpan sebagai JSON berkat casting model
            'correct_answer' => $request->correct_answer,
        ]);

        // Redirect kembali ke halaman index dengan membawa pesan sukses
        return redirect()->route('questions.index')->with('success', 'Soal berhasil ditambahkan!');
    }
}
