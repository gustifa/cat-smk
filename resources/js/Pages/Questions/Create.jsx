import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'; // Impor layout
import { Head, useForm, Link } from '@inertiajs/react';
import Swal from 'sweetalert2';

export default function Create({ exams }) {
    // Menggunakan helper form bawaan Inertia untuk handle state dan submit
    const { data, setData, post, processing, errors } = useForm({
        exam_id: '',
        question_text: '',
        type: 'pilihan_ganda',
        options: { a: '', b: '', c: '', d: '', e: '' }, // Default untuk pilihan ganda
        correct_answer: ''
    });

    // Handle perubahan khusus untuk opsi Pilihan Ganda
    const handleOptionChange = (key, value) => {
        setData('options', {
            ...data.options,
            [key]: value
        });
    };

    // Handle khusus tipe soal Menjodohkan (Dynamic Pairs)
    const [pairs, setPairs] = useState([{ id: 1, left: '', right: '' }]);
    
    const addPair = () => {
        setPairs([...pairs, { id: pairs.length + 1, left: '', right: '' }]);
    };

    const handlePairChange = (index, field, value) => {
        const newPairs = [...pairs];
        newPairs[index][field] = value;
        setPairs(newPairs);
        
        // Simpan struktur pasangan ke dalam opsi dan jawaban
        setData(prevData => ({
            ...prevData,
            options: newPairs,
            correct_answer: JSON.stringify(newPairs) // Kunci jawaban berupa pasangan lengkap
        }));
    };

    // Fungsi saat Form di-Submit
    const handleSubmit = (e) => {
        e.preventDefault();
        post('/questions', {
            onSuccess: () => {
                // Tampilkan Notifikasi SweetAlert2 saat sukses
                Swal.fire({
                    title: 'Berhasil!',
                    text: 'Soal baru berhasil disimpan ke Bank Soal.',
                    icon: 'success',
                    confirmButtonColor: '#0d6efd'
                });
            }
        });
    };

    const generateWithAI = async () => {
    const { value: topic } = await Swal.fire({
        title: 'Generate Soal AI',
        input: 'text',
        inputLabel: 'Masukkan topik soal (misal: Rangkaian Listrik)',
        inputPlaceholder: 'Tuliskan topik di sini...',
        showCancelButton: true,
        confirmButtonText: 'Generate',
        showLoaderOnConfirm: true,
        preConfirm: async (topic) => {
            try {
                // Pastikan endpoint ini sesuai dengan route Laravel Bapak
                const response = await axios.post('/questions/generate', { topic });
                return response.data;
            } catch (error) {
                Swal.showValidationMessage(`Gagal: ${error.message}`);
            }
        },
    });

    if (topic && topic.length > 0) {
        const soal = topic[0]; 
        
        // Mengisi state form dan otomatis memilih kunci jawaban
        setData(prev => ({
            ...prev,
            question_text: soal.question,
            options: { 
                a: soal.options[0], 
                b: soal.options[1], 
                c: soal.options[2], 
                d: soal.options[3], 
                e: soal.options[4] 
            },
            // Langsung menetapkan kunci jawaban berdasarkan data dari AI
            // Kita pastikan formatnya huruf kecil agar cocok dengan pilihan select Bapak
            correct_answer: soal.correct_answer.toLowerCase().trim() 
        }));

        Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: 'Soal dan kunci jawaban telah diisi otomatis.',
            timer: 1500
        });
    }
};

    

    return (
        <AuthenticatedLayout>
            <div className="container mt-5 mb-5">
                <Head title="Tambah Soal Baru" />
                <div className="row justify-content-center">
                    <div className="col-md-12">
                        <div className="card shadow-sm">
                            <div className="card-header bg-primary text-white">
                                <h5 className="mb-0">Form Tambah Soal Baru</h5>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleSubmit}>
                                    
                                    {/* Pilih Ujian */}
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Pilih Mata Ujian</label>
                                        <select className={`form-select ${errors.exam_id ? 'is-invalid' : ''}`} value={data.exam_id} onChange={e => setData('exam_id', e.target.value)}>
                                            <option value="">-- Pilih Ujian --</option>
                                            {exams.map(exam => (
                                                <option key={exam.id} value={exam.id}>{exam.title}</option>
                                            ))}
                                        </select>
                                        {errors.exam_id && <div className="invalid-feedback">{errors.exam_id}</div>}
                                    </div>

                                    {/* Tipe Soal */}
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Tipe Soal</label>
                                        <select className="form-select" value={data.type} onChange={e => {
                                            setData(prev => ({
                                                ...prev,
                                                type: e.target.value,
                                                correct_answer: '',
                                                options: e.target.value === 'pilihan_ganda' ? { a: '', b: '', c: '', d: '', e: '' } : null
                                            }));
                                        }}>
                                            <option value="pilihan_ganda">Pilihan Ganda</option>
                                            <option value="isian_singkat">Isian Singkat</option>
                                            <option value="uraian">Uraian / Esai</option>
                                            <option value="menjodohkan">Menjodohkan</option>
                                        </select>
                                    </div>

                                    {/* Teks Pertanyaan */}
                                    <div className="mb-4">
                                        <label className="form-label fw-bold">Pertanyaan / Soal</label>
                                        <textarea className={`form-control ${errors.question_text ? 'is-invalid' : ''}`} rows="4" placeholder="Tuliskan butir soal di sini..." value={data.question_text} onChange={e => setData('question_text', e.target.value)}></textarea>
                                        {errors.question_text && <div className="invalid-feedback">{errors.question_text}</div>}
                                    </div>
                                    <div className="mb-3">
                                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={generateWithAI}>
                                            <i className="bi bi-robot me-1"></i> Generate Soal dengan AI
                                        </button>
                                    </div>

                                    <hr />

                                    {/* 1. KONDISI FORM: PILIHAN GANDA */}
                                    {data.type === 'pilihan_ganda' && (
                                        <div className="bg-light p-3 rounded mb-4">
                                            <h6 className="fw-bold text-secondary mb-3">Pilihan Jawaban (Opsi)</h6>
                                            {['a', 'b', 'c', 'd', 'e'].map((letter) => (
                                                <div className="input-group mb-2" key={letter}>
                                                    <span className="input-group-text uppercase fw-bold">{letter.toUpperCase()}</span>
                                                    <input type="text" className="form-control" placeholder={`Isi pilihan ${letter.toUpperCase()}`} value={data.options?.[letter] || ''} onChange={e => handleOptionChange(letter, e.target.value)} required />
                                                </div>
                                            ))}
                                            
                                            <div className="mt-3">
                                                <label className="form-label fw-bold text-success">Kunci Jawaban Benar</label>
                                                <select className="form-select border-success" value={data.correct_answer} onChange={e => setData('correct_answer', e.target.value)} required>
                                                    <option value="">-- Pilih Kunci Jawaban --</option>
                                                    <option value="a">A</option>
                                                    <option value="b">B</option>
                                                    <option value="c">C</option>
                                                    <option value="d">D</option>
                                                    <option value="e">E</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    {/* 2. KONDISI FORM: ISIAN SINGKAT */}
                                    {data.type === 'isian_singkat' && (
                                        <div className="bg-light p-3 rounded mb-4">
                                            <label className="form-label fw-bold text-success">Kunci Jawaban Singkat</label>
                                            <input type="text" className="form-control border-success" placeholder="Contoh: Ampere / Rangkaian Seri / 220" value={data.correct_answer} onChange={e => setData('correct_answer', e.target.value)} required />
                                            <small className="text-muted">Jawaban harus diisi kata kunci pasti yang sensitif terhadap koreksi otomatis komputer.</small>
                                        </div>
                                    )}

                                    {/* 3. KONDISI FORM: URAIAN */}
                                    {data.type === 'uraian' && (
                                        <div className="bg-light p-3 rounded mb-4">
                                            <label className="form-label fw-bold text-success">Pedoman / Rubrik Penilaian (Kunci Jawaban)</label>
                                            <textarea className="form-control border-success" rows="4" placeholder="Tuliskan poin penting atau contoh jawaban ideal untuk acuan koreksi guru..." value={data.correct_answer} onChange={e => setData('correct_answer', e.target.value)} required></textarea>
                                        </div>
                                    )}

                                    {/* 4. KONDISI FORM: MENJODOHKAN */}
                                    {data.type === 'menjodohkan' && (
                                        <div className="bg-light p-3 rounded mb-4">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <h6 className="fw-bold text-secondary mb-0">Pasangkan Pernyataan (Kiri) & Jawaban (Kanan)</h6>
                                                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={addPair}>+ Tambah Baris</button>
                                            </div>
                                            
                                            {pairs.map((pair, index) => (
                                                <div className="row g-2 mb-2" key={pair.id}>
                                                    <div className="col-5">
                                                        <input type="text" className="form-control" placeholder={`Pernyataan ${index + 1}`} value={pair.left} onChange={e => handlePairChange(index, 'left', e.target.value)} required />
                                                    </div>
                                                    <div className="col-2 text-center align-self-center">
                                                        <span className="badge bg-secondary">{"=> cocok dengan =>"}</span>
                                                    </div>
                                                    <div className="col-5">
                                                        <input type="text" className="form-control" placeholder={`Pasangan ${index + 1}`} value={pair.right} onChange={e => handlePairChange(index, 'right', e.target.value)} required />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Tombol Aksi */}
                                    <div className="d-flex justify-content-end gap-2">
                                        <Link href="/questions" className="btn btn-secondary">Batal</Link>
                                        <button type="submit" className="btn btn-primary" disabled={processing}>
                                            {processing ? 'Menyimpan...' : 'Simpan Soal'}
                                        </button>
                                    </div>

                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}