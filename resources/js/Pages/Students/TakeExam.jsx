import React, { useState, useEffect, useRef } from 'react';
import { Head, useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';
import axios from 'axios';

export default function TakeExam({ exam, questions, savedAnswers, endTime, isTokenValid }) {
    const [token, setToken] = useState('');
    const [authenticated, setAuthenticated] = useState(isTokenValid);
    
    // useRef digunakan sebagai flag agar auto-submit tidak looping
    const isSubmittingRef = useRef(false);

    const { data, setData, post, processing } = useForm({
        answers: savedAnswers || {} 
    });

    const [activeIndex, setActiveIndex] = useState(0);
    const totalSoal = questions.length;

    // FUNGSI PENGAMAN: Menghitung sisa waktu
    const calculateTimeLeft = () => {
        if (!endTime) return 0;
        const end = new Date(endTime).getTime();
        const now = new Date().getTime();
        
        if (isNaN(end)) return 0; 
        
        const diff = Math.floor((end - now) / 1000);
        return diff > 0 ? diff : 0;
    };

    // const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    // Timer Logic yang sinkron
    const [timeLeft, setTimeLeft] = useState("Loading...");

    useEffect(() => {
        // console.log("End Time dari Laravel:", endTime); // CEK INI DI BROWSER CONSOLE
        const updateTimer = () => {
            const now = new Date().getTime();
            const end = new Date(endTime).getTime();
            // console.log("Now:", now, "End:", end); // CEK APAKAH END LEBIH KECIL DARI NOW
            const distance = end - now;

            if (distance <= 0) {
                setTimeLeft("00:00");
                // Panggil fungsi submit otomatis di sini
                // submitExam(); 
            } else {
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
            }
        };

        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [endTime]);

    const formatTime = (seconds) => {
        const safeSeconds = (isNaN(seconds) || seconds < 0) ? 0 : seconds;
        const m = Math.floor(safeSeconds / 60);
        const s = safeSeconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        try {
            await axios.post(route('student.exam.verify', exam.id), { token });
            setAuthenticated(true);
        } catch (error) {
            Swal.fire('Error', 'Token tidak valid!', 'error');
        }
    };

    const handleAnswerChange = async (questionId, value) => {
        setData('answers', { ...data.answers, [questionId]: value });
        try {
            await axios.post(route('student.exam.autosave', exam.id), {
                question_id: questionId,
                answer: value
            });
        } catch (error) {
            console.error("Autosave gagal:", error);
        }
    };

    const handleAutoSubmit = () => {
        // Mencegah eksekusi ganda dengan useRef
        if (isSubmittingRef.current) return;
        isSubmittingRef.current = true;

        Swal.fire({
            title: 'Waktu Habis!',
            text: 'Jawaban Anda sedang dikirim...',
            icon: 'warning',
            allowOutsideClick: false,
            showConfirmButton: false
        });

        post(route('student.exam.submit', exam.id));
    };

    const handleManualSubmit = (e) => {
        e.preventDefault();
        Swal.fire({
            title: 'Akhiri Ujian?',
            text: "Pastikan semua soal telah dijawab.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya, Akhiri & Simpan',
        }).then((result) => {
            if (result.isConfirmed) {
                post(route('student.exam.submit', exam.id));
            }
        });
    };

    if (!authenticated) {
        return (
            <div className="container mt-5 d-flex justify-content-center">
                <form onSubmit={handleVerify} className="card p-4 shadow-sm" style={{width: '400px'}}>
                    <h4 className="mb-3">Akses Ujian: {exam.title}</h4>
                    <input 
                        className="form-control mb-3" value={token} 
                        onChange={(e) => setToken(e.target.value)} 
                        placeholder="Masukkan token..." required
                    />
                    <button type="submit" className="btn btn-primary w-100">Mulai Ujian</button>
                </form>
            </div>
        );
    }

    return (
        <div className="container mt-4 mb-5">
            <Head title={`Ujian: ${exam.title}`} />
            
            <div className="sticky-top bg-white py-3 shadow-sm mb-4 px-4 rounded border-bottom d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">{exam.title}</h5>
                <h5 className="text-danger">Sisa Waktu: {timeLeft}</h5>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
                {questions.map((q, index) => (
                    <button key={q.id} type="button" onClick={() => setActiveIndex(index)}
                        className={`w-10 h-10 rounded-full font-bold transition-all ${
                            activeIndex === index ? 'bg-blue-600 text-white' : 
                            data.answers[q.id] ? 'bg-green-500 text-white' : 'bg-gray-200'
                        }`}>
                        {index + 1}
                    </button>
                ))}
            </div>

            <form onSubmit={handleManualSubmit}>
                {questions[activeIndex] && (
                    <div className="card shadow-sm mb-4 border-0">
                        <div className="card-header bg-light"><strong>Soal No. {activeIndex + 1}</strong></div>
                        <div className="card-body">
                            <p className="fs-5">{questions[activeIndex].question_text}</p>
                            {questions[activeIndex].type === 'pilihan_ganda' && (
                                <div>
                                    {['a', 'b', 'c', 'd', 'e'].map(opt => (
                                        questions[activeIndex].options?.[opt] && (
                                            <div className="form-check mb-2" key={opt}>
                                                <input className="form-check-input" type="radio" 
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
                                <input type="text" className="form-control" value={data.answers[questions[activeIndex].id] || ''}
                                    onChange={(e) => handleAnswerChange(questions[activeIndex].id, e.target.value)} />
                            )}
                        </div>
                    </div>
                )}
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