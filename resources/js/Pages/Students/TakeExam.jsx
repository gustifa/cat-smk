import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';

export default function TakeExam({ exam, questions }) {
    const { data, setData, post, processing } = useForm({
        answers: {} // Menyimpan jawaban dengan key ID soal
    });

    // Konversi durasi menit ke detik
    // Membuat kunci penyimpanan unik berdasarkan ID Ujian
    const storageKey = `exam_endtime_${exam.id}`;

    // Logika cerdas untuk membaca sisa waktu dari browser
    const [timeLeft, setTimeLeft] = useState(() => {
        const savedEndTime = localStorage.getItem(storageKey);
        
        if (savedEndTime) {
            // Jika siswa sudah pernah memulai, hitung sisa waktunya
            const currentTime = new Date().getTime();
            const remaining = Math.floor((parseInt(savedEndTime) - currentTime) / 1000);
            return remaining > 0 ? remaining : 0;
        } else {
            // Jika ini pertama kali ujian dibuka, catat waktu berakhirnya
            const endTime = new Date().getTime() + (exam.duration * 60 * 1000);
            localStorage.setItem(storageKey, endTime.toString());
            return exam.duration * 60;
        }
    });

    // Efek Hitungan Mundur (Timer)
    useEffect(() => {
        if (timeLeft <= 0) {
            handleAutoSubmit();
            return;
        }

        const timerId = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timerId);
    }, [timeLeft]);

    // Format waktu menjadi MM:SS
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Menyimpan jawaban per nomor ke state
    const handleAnswerChange = (questionId, value) => {
        setData('answers', {
            ...data.answers,
            [questionId]: value
        });
    };

    // Fungsi submit paksa jika waktu habis
    const handleAutoSubmit = () => {
        Swal.fire({
            title: 'Waktu Habis!',
            text: 'Jawaban Anda akan dikirim secara otomatis.',
            icon: 'warning',
            showConfirmButton: false,
            timer: 2000
        }).then(() => {
            post(`/student/exam/${exam.id}/submit`);
        });
    };

    // Fungsi submit manual oleh siswa
    const handleManualSubmit = (e) => {
        e.preventDefault();
        Swal.fire({
            title: 'Akhiri Ujian?',
            text: "Pastikan semua soal telah dijawab. Anda tidak bisa mengulangi ujian ini.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya, Akhiri & Simpan',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                post(`/student/exam/${exam.id}/submit`);
            }
        });
    };

    return (
        <div className="container mt-4 mb-5">
            <Head title={`Ujian: ${exam.title}`} />
            
            {/* Header lengket (Sticky) untuk Timer */}
            <div className="sticky-top bg-white py-3 shadow-sm mb-4 px-4 rounded border-bottom d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">{exam.title}</h5>
                <div className={`fs-4 fw-bold ${timeLeft < 300 ? 'text-danger' : 'text-success'}`}>
                    Sisa Waktu: {formatTime(timeLeft)}
                </div>
            </div>

            <form onSubmit={handleManualSubmit}>
                {questions.map((q, index) => (
                    <div className="card shadow-sm mb-4 border-0" key={q.id}>
                        <div className="card-header bg-light">
                            <strong>Soal No. {index + 1}</strong>
                        </div>
                        <div className="card-body">
                            <p className="fs-5">{q.question_text}</p>
                            
                            {/* Render Input berdasarkan Tipe Soal */}
                            {q.type === 'pilihan_ganda' && q.options && (
                                <div>
                                    {['a', 'b', 'c', 'd', 'e'].map(opt => (
                                        q.options[opt] && (
                                            <div className="form-check mb-2" key={opt}>
                                                <input 
                                                    className="form-check-input" 
                                                    type="radio" 
                                                    name={`question_${q.id}`} 
                                                    id={`q_${q.id}_${opt}`} 
                                                    value={opt}
                                                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                                />
                                                <label className="form-check-label ms-2" htmlFor={`q_${q.id}_${opt}`}>
                                                    <span className="text-uppercase fw-bold me-2">{opt}.</span> 
                                                    {q.options[opt]}
                                                </label>
                                            </div>
                                        )
                                    ))}
                                </div>
                            )}

                            {q.type === 'isian_singkat' && (
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    placeholder="Ketik jawaban singkat Anda di sini..." 
                                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                />
                            )}
                            
                            {/* Logika untuk uraian dan menjodohkan bisa ditambahkan di sini */}
                        </div>
                    </div>
                ))}

                <div className="d-grid mt-4">
                    <button type="submit" className="btn btn-primary btn-lg fw-bold" disabled={processing}>
                        {processing ? 'Menyimpan...' : 'Selesai & Kumpulkan Jawaban'}
                    </button>
                </div>
            </form>
        </div>
    );
}