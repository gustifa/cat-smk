<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Exam;
use Inertia\Inertia;
use App\Models\User;
// Asumsi Anda memiliki tabel jawaban/nilai (misal: ExamResult)
// use App\Models\ExamResult; 
use Barryvdh\DomPDF\Facade\Pdf;
use Spatie\SimpleExcel\SimpleExcelWriter;
use App\Models\ExamResult;
use App\Models\Answer;

class ReportController extends Controller
{
    // Menampilkan halaman Dashboard Laporan untuk Guru
    public function index()
    {
        // Mengambil semua ujian, diurutkan dari yang terbaru
        $exams = Exam::orderBy('created_at', 'desc')->get();
        
        return Inertia::render('Teacher/Dashboard', [
            'exams' => $exams
        ]);
    }

    // Export nilai ke PDF
    public function exportPdf($exam_id)
    {
        $exam = Exam::findOrFail($exam_id);
        
        // Contoh query mengambil data nilai siswa (sesuaikan dengan nama model/tabel Anda)
        // $results = ExamResult::with('student')->where('exam_id', $exam_id)->get();
        
        // Data sementara untuk uji coba tampilan
        $results = [
            (object)['student_name' => 'Siswa Contoh A', 'score' => 85, 'status' => 'Lulus'],
            (object)['student_name' => 'Siswa Contoh B', 'score' => 90, 'status' => 'Lulus'],
        ];

        $pdf = Pdf::loadView('reports.exam_result', [
            'exam' => $exam,
            'results' => $results
        ]);

        return $pdf->download('Laporan_Nilai_' . $exam->title . '.pdf');
    }

    // Export nilai ke Excel
    public function exportExcel($exam_id)
    {
        $exam = Exam::findOrFail($exam_id);
        // Sama seperti di atas, ambil data nilai dari database
        $results = [
            (object)['student_name' => 'Siswa Contoh A', 'score' => 85, 'status' => 'Lulus'],
            (object)['student_name' => 'Siswa Contoh B', 'score' => 90, 'status' => 'Lulus'],
        ];

        $writer = SimpleExcelWriter::streamDownload('Rekap_Nilai_' . $exam->title . '.xlsx');
        
        foreach($results as $result) {
            $writer->addRow([
                'Nama Siswa' => $result->student_name,
                'Nilai Akhir' => $result->score,
                'Keterangan' => $result->status,
            ]);
        }
        
        return $writer->toBrowser();
    }

    // 1. Menampilkan Halaman Detail Nilai & Remedial
    public function showResults($id)
    {
        $exam = Exam::findOrFail($id);
        
        // Ambil data nilai siswa yang sudah mengerjakan ujian ini
        $results = ExamResult::with('user')->where('exam_id', $id)->get();

        return Inertia::render('Teacher/ExamResults', [
            'exam' => $exam,
            'results' => $results
        ]);
    }

    // 2. Fungsi Eksekusi Izin Remedial (Reset Data Siswa)
    public function resetStudent($exam_id, $user_id)
    {
        // Hapus nilai akhir siswa
        ExamResult::where('exam_id', $exam_id)->where('user_id', $user_id)->delete();
        
        // Hapus histori jawaban siswa agar bersih
        Answer::where('exam_id', $exam_id)->where('user_id', $user_id)->delete();

        return redirect()->back()->with('success', 'Akses remedial berhasil dibuka. Ujian di-reset untuk siswa tersebut.');
    }

    // PASTIKAN METHOD INI ADA DI DALAM CLASS INI
    public function exportAnswers($exam_id)
    {
        $exam = Exam::findOrFail($exam_id);
        
        $answers = Answer::with(['user', 'question'])
            ->where('exam_id', $exam_id)
            ->get();

        $writer = SimpleExcelWriter::streamDownload('Detail_Jawaban_' . $exam->title . '.xlsx');
        
        foreach($answers as $answer) {
            $writer->addRow([
                'Waktu Submit' => $answer->updated_at->format('Y-m-d H:i:s'),
                'Nama Siswa' => $answer->user->name ?? 'Tidak diketahui',
                'ID Soal' => $answer->question_id,
                'Tipe Soal' => $answer->question->type ?? '-',
                'Pertanyaan' => strip_tags($answer->question->question_text ?? ''),
                'Kunci Jawaban' => $answer->question->correct_answer ?? '',
                'Jawaban Siswa' => $answer->answer_text,
                'Status' => $answer->is_correct ? 'Benar' : 'Salah',
            ]);
        }
        
        return $writer->toBrowser();
    }
}
