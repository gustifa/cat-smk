<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\Question;
use App\Models\Answer;
use App\Models\ExamResult;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class StudentExamController extends Controller
{
    public function index()
    {
        $userId = auth()->id();
        $activeExams = Exam::where('status', 'active')->get()->map(function($exam) use ($userId) {
            $attempts = ExamResult::where('user_id', $userId)->where('exam_id', $exam->id)->count();
            $exam->attempts = $attempts;
            $exam->is_locked = $attempts >= ($exam->max_attempts ?? 1); 
            return $exam;
        });

        return Inertia::render('Students/Dashboard', [
            'exams' => $activeExams
        ]);
    }

    // public function show($id, Request $request)
    // {
    //     $exam = Exam::findOrFail($id);

    //     // 1. Cek apakah ujian aktif
    //     if ($exam->status !== 'active') {
    //         return redirect()->route('student.dashboard')->with('error', 'Ujian belum dibuka.');
    //     }

    //     // 2. Cek apakah token di session valid dan cocok dengan database
    //     $sessionToken = $request->session()->get('exam_token_' . $id);

    //     if ($sessionToken !== $exam->token) {
    //         return Inertia::render('Students/EnterToken', ['exam' => $exam]);
    //     }

    //     // 3. Jika token valid, ambil soal
    //     $questions = Question::where('exam_id', $id)->inRandomOrder()->get();

    //     return Inertia::render('Students/TakeExam', [
    //         'exam' => $exam,
    //         'questions' => $questions,
    //         'isTokenValid' => true
    //     ]);
    // }

//     public function show($id, Request $request)
// {
//     $exam = Exam::findOrFail($id);

//     // Cek aktif dan token (seperti kode sebelumnya)
//     if ($exam->status !== 'active') {
//         return redirect()->route('student.dashboard')->with('error', 'Ujian belum dibuka.');
//     }

//     $sessionToken = $request->session()->get('exam_token_' . $id);
//     if ($sessionToken !== $exam->token) {
//         return Inertia::render('Students/EnterToken', ['exam' => $exam]);
//     }

//     // 1. Ambil atau buat hasil ujian agar end_time ada
//     $result = ExamResult::firstOrCreate(
//         ['exam_id' => $id, 'user_id' => auth()->id()],
//         ['end_time' => now()->addMinutes($exam->duration)]
//     );

//     $questions = Question::where('exam_id', $id)->inRandomOrder()->get();

//     // 2. Kirim endTime ke frontend
//     return Inertia::render('Students/TakeExam', [
//         'exam' => $exam,
//         'questions' => $questions,
//         'endTime' => $result->end_time, // PENTING: Kirim data ini
//         'isTokenValid' => true
//     ]);
// }

// public function show($id, Request $request)
// {
//     $exam = Exam::findOrFail($id);

//     // Cek aktif dan token (seperti kode sebelumnya)
//     if ($exam->status !== 'active') {
//         return redirect()->route('student.dashboard')->with('error', 'Ujian belum dibuka.');
//     }

//     $sessionToken = $request->session()->get('exam_token_' . $id);
//     if ($sessionToken !== $exam->token) {
//         return Inertia::render('Students/EnterToken', ['exam' => $exam]);
//     }

//     $studentId = auth()->id();
    
//     // Ambil hasil ujian siswa
//     $result = ExamResult::where('exam_id', $id)->where('user_id', $studentId)->first();

//     // Jika belum ada record ATAU end_time sudah lewat dari sekarang, buat/perbarui waktu
//     if (!$result || now()->greaterThan($result->end_time)) {
//         $result = ExamResult::updateOrCreate(
//             ['exam_id' => $id, 'user_id' => $studentId],
//             ['end_time' => now()->addMinutes($exam->duration)]
//         );
//     }

//     $questions = Question::where('exam_id', $id)->inRandomOrder()->get();

//     return Inertia::render('Students/TakeExam', [
//         'exam' => $exam,
//         'questions' => $questions,
//         'endTime' => $result->end_time,
//         'isTokenValid' => true
//     ]);
// }

public function show($id, Request $request)
{
    $exam = Exam::findOrFail($id);
    $studentId = auth()->id();

    // 1. Cek status ujian
    if ($exam->status !== 'active') {
        return redirect()->route('student.dashboard')->with('error', 'Ujian belum dibuka.');
    }

    // 2. Cek token
    $sessionToken = $request->session()->get('exam_token_' . $id);
    if ($sessionToken !== $exam->token) {
        return Inertia::render('Students/EnterToken', ['exam' => $exam]);
    }

    // 3. CEGAH AKSES jika sudah ada hasil ujian (sudah pernah submit)
    $alreadySubmitted = ExamResult::where('exam_id', $id)
                                  ->where('user_id', $studentId)
                                  ->exists();
    if ($alreadySubmitted) {
        return redirect()->route('student.dashboard')->with('error', 'Anda sudah menyelesaikan ujian ini!');
    }

    $questions = Question::where('exam_id', $id)->inRandomOrder()->get();

    return Inertia::render('Students/TakeExam', [
        'exam' => $exam,
        'questions' => $questions,
        'endTime' => now()->addMinutes($exam->duration), // Kirim durasi waktu saja
        'isTokenValid' => true
    ]);
}

    public function verify(Request $request, $id)
    {
        $exam = Exam::findOrFail($id);
        $request->validate(['token' => 'required']);

        if ($request->token === $exam->token) {
            $request->session()->put('exam_token_' . $id, $request->token);
            return back()->with('success', 'Token valid! Ujian dimulai.');
        }

        return back()->withErrors(['token' => 'Token tidak valid untuk mata ujian ini.']);
    }

    public function checkStatus($id)
    {
        $exam = Exam::findOrFail($id);
        $sessionToken = session('exam_token_' . $id);

        if ($exam->status !== 'active' || $sessionToken !== $exam->token) {
            session()->forget('exam_token_' . $id);
            return response()->json(['status' => 'kicked']);
        }

        return response()->json(['status' => 'active']);
    }

    // Tambahkan method submit dan autosave di bawah ini sesuai kebutuhan...

    public function submit(Request $request, $id)
{
    $student_id = auth()->id();
    $exam = Exam::findOrFail($id);

    // 1. CEGAH DOUBLE SUBMISSION
    $existingResult = ExamResult::where('exam_id', $id)
        ->where('user_id', $student_id)
        ->first();

    if ($existingResult) {
        return redirect()->route('student.dashboard')->with('error', 'Anda sudah menyelesaikan ujian ini!');
    }

    $submittedAnswers = $request->input('answers', []);
    $questions = Question::where('exam_id', $id)->get()->keyBy('id');

    // 2. GUNAKAN TRANSAKSI
    DB::beginTransaction();
    try {
        foreach ($submittedAnswers as $question_id => $studentAnswer) {
            $question = $questions->get($question_id);
            if (!$question) continue;

            $isCorrect = false;
            if (in_array($question->type, ['pilihan_ganda', 'isian_singkat'])) {
                if (strtolower(trim($studentAnswer)) === strtolower(trim($question->correct_answer))) {
                    $isCorrect = true;
                }
            }

            Answer::create([
                'user_id' => $student_id,
                'exam_id' => $id,
                'question_id' => $question_id,
                'answer_text' => $studentAnswer,
                'is_correct' => $isCorrect,
            ]);
        }

        // 3. HITUNG NILAI & SIMPAN HASIL
        $totalQuestions = $questions->count();
        $correctCount = Answer::where('user_id', $student_id)
            ->where('exam_id', $id)
            ->where('is_correct', true)
            ->count();

        $score = $totalQuestions > 0 ? ($correctCount / $totalQuestions) * 100 : 0;

        ExamResult::create([
            'user_id' => $student_id,
            'exam_id' => $id,
            'score' => $score
        ]);

        DB::commit();
        return redirect()->route('student.dashboard')->with('success', 'Ujian berhasil diselesaikan!');

    } catch (\Exception $e) {
        DB::rollBack();
        return back()->with('error', 'Gagal menyimpan jawaban: ' . $e->getMessage());
    }
}
}