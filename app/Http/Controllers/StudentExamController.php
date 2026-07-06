<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\Question;
use App\Models\Answer;
use App\Models\ExamResult; // Pastikan ini ditambahkan di atas
use Illuminate\Http\Request;
use Inertia\Inertia;

class StudentExamController extends Controller
{
    // Menampilkan daftar ujian yang aktif di Dashboard Siswa
    public function index()
    {
        // Hanya ambil ujian dengan status 'active'
        // $activeExams = Exam::where('status', 'active')->get();
        $userId = auth()->id();
        
        // Ambil ujian aktif dan hitung berapa kali siswa sudah mengerjakannya
        $activeExams = Exam::where('status', 'active')->get()->map(function($exam) use ($userId) {
            $attempts = ExamResult::where('user_id', $userId)->where('exam_id', $exam->id)->count();
            $exam->attempts = $attempts;
            $exam->is_locked = $attempts >= $exam->max_attempts; // Kunci jika batas tercapai
            return $exam;
        });
        return Inertia::render('Students/Dashboard', [
            'exams' => $activeExams
        ]);
    }

    // Menampilkan halaman pengerjaan soal
    public function take($id)
    {
        $exam = Exam::findOrFail($id);
        
        // Ambil soal terkait ujian ini, acak urutannya
        $questions = Question::where('exam_id', $id)->inRandomOrder()->get();

        return Inertia::render('Students/TakeExam', [
            'exam' => $exam,
            'questions' => $questions
        ]);
    }

    // Menyimpan jawaban (Kerangka awal)
    // public function submit(Request $request, $id)
    // {
    //     // Logika untuk menyimpan array jawaban ke tabel answers akan ditempatkan di sini
    //     // ...
        
    //     return redirect()->route('student.dashboard')->with('success', 'Ujian berhasil diselesaikan. Terima kasih!');
    // }

    public function submit(Request $request, $id)
    {
        $exam = Exam::findOrFail($id);
        $student_id = auth()->id();
        $submittedAnswers = $request->input('answers', []); // Data dari state React

        // Ambil semua soal untuk ujian ini sebagai referensi kunci jawaban
        $questions = Question::where('exam_id', $id)->get()->keyBy('id');

        foreach ($submittedAnswers as $question_id => $studentAnswer) {
            $question = $questions->get($question_id);
            $isCorrect = false;

            if ($question) {
                // Pengecekan otomatis (khusus pilihan ganda dan isian singkat)
                if (in_array($question->type, ['pilihan_ganda', 'isian_singkat'])) {
                    // Cek jika jawaban sama persis dengan kunci (case-insensitive)
                    if (strtolower(trim($studentAnswer)) === strtolower(trim($question->correct_answer))) {
                        $isCorrect = true;
                    }
                }
                
                // Simpan setiap jawaban ke tabel answers
                Answer::updateOrCreate(
                    [
                        'user_id' => $student_id,
                        'exam_id' => $id,
                        'question_id' => $question_id,
                    ],
                    [
                        'answer_text' => $studentAnswer,
                        'is_correct' => $isCorrect,
                    ]
                );
            }
        }

        // HITUNG NILAI AKHIR (Persentase)
        $totalQuestions = $questions->count();
        // Hitung berapa jawaban yang is_correct = true untuk siswa ini di ujian ini
        $correctCount = Answer::where('user_id', $student_id)
                              ->where('exam_id', $id)
                              ->where('is_correct', true)
                              ->count();

        $score = $totalQuestions > 0 ? ($correctCount / $totalQuestions) * 100 : 0;

        // SIMPAN REKAM JEJAK SELESAI
        ExamResult::create([
            'user_id' => $student_id,
            'exam_id' => $id,
            'score' => $score
        ]);

        return redirect()->route('student.dashboard')->with('success', 'Ujian berhasil diselesaikan. Terima kasih!');
    }
}
