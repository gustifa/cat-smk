<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Exam;
use Inertia\Inertia;
use App\Models\ExamResult;
use App\Models\Answer;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

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

    public function show($id)
    {
        $exam = Exam::findOrFail($id);
        // Kirim waktu berakhir dalam format timestamp agar konsisten
        return inertia('TakeExam', [
            'exam' => $exam,
            'questions' => $exam->questions,
            'endTime' => $exam->end_time, // Misalnya: '2026-07-06 23:30:00'
        ]);
    }

    public function submit(Request $request, $examId)
    {
        // 1. Ambil data ujian dan verifikasi
        $exam = Exam::findOrFail($examId);
        $user = auth()->user();

        // 2. Verifikasi waktu di server (PENTING!)
        // Memberikan toleransi 1-2 menit untuk latensi jaringan
        $serverTime = Carbon::now();
        $endTime = Carbon::parse($exam->end_time);
        
        // Jika waktu server sudah lewat dari waktu berakhir + toleransi, 
        // kita tetap proses agar siswa tidak kehilangan jawaban (auto-submit)
        // namun bisa ditandai sebagai 'late' jika perlu.
        
        // 3. Gunakan Database Transaction agar data tidak corrupt
        DB::beginTransaction();

        try {
            // Simpan hasil ujian
            $result = ExamResult::updateOrCreate(
                ['exam_id' => $exam->id, 'user_id' => $user->id],
                [
                    'submitted_at' => now(),
                    'status' => 'completed'
                ]
            );

            // Simpan detail jawaban
            foreach ($request->answers as $questionId => $answerValue) {
                Answer::updateOrCreate(
                    [
                        'exam_result_id' => $result->id,
                        'question_id' => $questionId
                    ],
                    ['answer' => $answerValue]
                );
            }

            DB::commit();

            return response()->json([
                'message' => 'Jawaban berhasil disimpan.',
                'redirect' => route('student.exam.finish')
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal menyimpan jawaban.'], 500);
        }
    }
}
