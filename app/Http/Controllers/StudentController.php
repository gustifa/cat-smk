<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Spatie\SimpleExcel\SimpleExcelWriter;
use Spatie\SimpleExcel\SimpleExcelReader;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;

class StudentController extends Controller
{
    // Menampilkan halaman manajemen siswa
    public function index()
    {
        $students = User::role('siswa')->get();
        return Inertia::render('Students/Index', ['students' => $students]);
    }

    // Ekspor Data ke Excel
    public function export()
    {
        $students = User::role('siswa')->get();
        
        // Membuat file Excel yang langsung terunduh di browser
        $writer = SimpleExcelWriter::streamDownload('data_siswa_smkn1.xlsx');
        
        foreach($students as $student) {
            $writer->addRow([
                'ID Siswa' => $student->id,
                'Nama Lengkap' => $student->name,
                'Email' => $student->email,
                'Terdaftar Pada' => $student->created_at->format('Y-m-d'),
            ]);
        }
        
        return $writer->toBrowser();
    }

    // Impor Data dari Excel
    public function import(Request $request)
    {
        $request->validate([
            'file_excel' => 'required|mimes:xlsx,csv|max:2048',
        ]);

        $file = $request->file('file_excel');
        
        // Membaca baris dari file Excel
        $rows = SimpleExcelReader::create($file->path(), $file->getClientOriginalExtension())->getRows();
        
        $rows->each(function(array $row) {
            // Cek apakah email sudah ada, jika belum buat user baru
            $user = User::firstOrCreate(
                ['email' => $row['Email']], 
                [
                    'name' => $row['Nama Lengkap'],
                    'password' => Hash::make('password123') // Password default
                ]
            );
            
            // Assign role siswa via Spatie
            $user->assignRole('siswa');
        });

        return redirect()->back()->with('success', 'Data siswa berhasil diimpor!');
    }
}
