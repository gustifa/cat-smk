<?php

namespace App\Http\Controllers;

use App\Models\Question;
use Illuminate\Http\Request;
use Yajra\DataTables\Facades\DataTables;
use Inertia\Inertia;
use App\Models\Exam;
use Illuminate\Support\Facades\Http;

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

    public function generateWithAI(Request $request)
    // {
    //     $request->validate(['topic' => 'required|string']);
        
    //     $apiKey = env('GEMINI_API_KEY');
    //     $prompt = "Buatkan 5 soal pilihan ganda tentang topik: {$request->topic}. 
    //             Format jawaban harus JSON: [{question: '', options: ['', '', '', '', ''], correct_answer: ''}]. 
    //             Berikan jawaban dalam bahasa Indonesia.";

                

    //     $response = Http::withHeaders(['Content-Type' => 'application/json'])
    //         ->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}", [
    //             'contents' => [['parts' => [['text' => $prompt]]]]
    //         ]);

    //     $data = $response->json();
    //     // Bersihkan teks respons (biasanya AI menyertakan ```json ... ```)
    //     $text = $data['candidates'][0]['content']['parts'][0]['text'];
    //     $jsonText = str_replace(['```json', '```'], '', $text);
        
    //     return response()->json(json_decode($jsonText, true));
    // }

    {
        $request->validate(['topic' => 'required|string']);
        
        $apiKey = env('GEMINI_API_KEY');
        
        // Prompt diperjelas agar correct_answer selalu berupa 'a', 'b', 'c', 'd', atau 'e'
        $prompt = "Buatkan 5 soal pilihan ganda tentang topik: {$request->topic}. 
                Format jawaban HARUS JSON murni seperti ini: 
                [{'question': '...', 'options': ['', '', '', '', ''], 'correct_answer': ''}]. 
                PENTING: 'correct_answer' HANYA BOLEH berisi salah satu dari huruf: 'a', 'b', 'c', 'd', 'e'.
                Jangan sertakan teks penjelasan apapun selain JSON.";

        $response = Http::withHeaders(['Content-Type' => 'application/json'])
            ->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}", [
                'contents' => [['parts' => [['text' => $prompt]]]]
            ]);

        $data = $response->json();
        $text = $data['candidates'][0]['content']['parts'][0]['text'] ?? '';
        
        // Membersihkan teks dari karakter markdown
        $jsonText = trim(str_replace(['```json', '```'], '', $text));
        
        return response()->json(json_decode($jsonText, true));
    }

    public function destroy($id)
{
    Question::findOrFail($id)->delete();
    return redirect()->back()->with('success', 'Soal berhasil dihapus.');
}
}
