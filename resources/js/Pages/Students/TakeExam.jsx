import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';

export default function TakeExam({ exam, questions }) {
    const { data, setData, post, processing } = useForm({
        answers: {}
    });

    const storageKey = `exam_endtime_${exam.id}`;

    // 1. Inisialisasi waktu dari localStorage agar tidak reset saat reload
    const [timeLeft, setTimeLeft] = useState(() => {
        const savedEndTime = localStorage.getItem(storageKey);
        if (savedEndTime) {
            const remaining = Math.floor((parseInt(savedEndTime) - new Date().getTime()) / 1000);
            return remaining > 0 ? remaining : 0;
        } else {
            const endTime = new Date().getTime() + (exam.duration * 60 * 1000);
            localStorage.setItem(storageKey, endTime.toString());
            return exam.duration * 60;
        }
    });

    const [activeIndex, setActiveIndex] = useState(0);
    const totalSoal = questions.length;

    // 2. Timer Logic
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

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleAnswerChange = (questionId, value) => {
        setData('answers', { ...data.answers, [questionId]: value });
    };

    const clearStorageAndSubmit = () => {
        localStorage.removeItem(storageKey);
        post(`/student/exam/${exam.id}/submit`);
    };

    const handleAutoSubmit = () => {
        Swal.fire({
            title: 'Waktu Habis!',
            text: 'Jawaban Anda akan dikirim secara otomatis.',
            icon: 'warning',
            showConfirmButton: false,
            timer: 2000
        }).then(() => clearStorageAndSubmit());
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        Swal.fire({
            title: 'Akhiri Ujian?',
            text: "Pastikan semua soal telah dijawab. Anda tidak bisa mengulangi ujian ini.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya, Akhiri & Simpan',
        }).then((result) => {
            if (result.isConfirmed) clearStorageAndSubmit();
        });
    };

    return (
        <div className="container mt-4 mb-5">
            <Head title={`Ujian: ${exam.title}`} />
            
            {/* Header Sticky */}
            <div className="sticky-top bg-white py-3 shadow-sm mb-4 px-4 rounded border-bottom d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">{exam.title}</h5>
                <div className={`fs-4 fw-bold ${timeLeft < 300 ? 'text-danger' : 'text-success'}`}>
                    Sisa Waktu: {formatTime(timeLeft)}
                </div>
            </div>

            {/* Navigasi Nomor */}
            <div className="flex flex-wrap gap-2 mb-4">
                {questions.map((_, index) => (
                    <button
                        key={index} type="button"
                        onClick={() => setActiveIndex(index)}
                        className={`w-10 h-10 rounded-full font-bold transition-all ${
                            activeIndex === index ? 'bg-blue-600 text-white' : 
                            data.answers[questions[index].id] ? 'bg-green-500 text-white' : 'bg-gray-200'
                        }`}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>

            <form onSubmit={handleManualSubmit}>
                {questions[activeIndex] && (
                    <div className="card shadow-sm mb-4 border-0">
                        <div className="card-header bg-light d-flex justify-content-between">
                            <strong>Soal No. {activeIndex + 1}</strong>
                            <span>{activeIndex + 1} dari {totalSoal}</span>
                        </div>
                        <div className="card-body">
                            <p className="fs-5">{questions[activeIndex].question_text}</p>
                            
                            {/* Opsi Jawaban */}
                            {questions[activeIndex].type === 'pilihan_ganda' && (
                                <div>
                                    {['a', 'b', 'c', 'd', 'e'].map(opt => (
                                        questions[activeIndex].options?.[opt] && (
                                            <div className="form-check mb-2" key={opt}>
                                                <input 
                                                    className="form-check-input" type="radio" 
                                                    checked={data.answers[questions[activeIndex].id] === opt}
                                                    onChange={() => handleAnswerChange(questions[activeIndex].id, opt)}
                                                />
                                                <label className="form-check-label ms-2">{opt.toUpperCase()}. {questions[activeIndex].options[opt]}</label>
                                            </div>
                                        )
                                    ))}
                                </div>
                            )}
                            {questions[activeIndex].type === 'isian_singkat' && (
                                <input type="text" className="form-control" placeholder="Ketik jawaban..." 
                                    value={data.answers[questions[activeIndex].id] || ''}
                                    onChange={(e) => handleAnswerChange(questions[activeIndex].id, e.target.value)} />
                            )}
                        </div>
                    </div>
                )}

                {/* Tombol Navigasi */}
                <div className="d-flex justify-content-between mt-4">
                    <button type="button" className="btn btn-outline-secondary" disabled={activeIndex === 0} onClick={() => setActiveIndex(activeIndex - 1)}>Sebelumnya</button>
                    {activeIndex < totalSoal - 1 ? (
                        <button type="button" className="btn btn-primary" onClick={() => setActiveIndex(activeIndex + 1)}>Selanjutnya</button>
                    ) : (
                        <button type="submit" className="btn btn-success fw-bold" disabled={processing}>Selesai & Kumpulkan</button>
                    )}
                </div>
            </form>
        </div>
    );
}