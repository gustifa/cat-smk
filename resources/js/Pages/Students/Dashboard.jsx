import React, { useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import Swal from 'sweetalert2';

export default function Dashboard({ exams }) {

    // Mengambil pesan dari flash data
    const { flash } = usePage().props;

    useEffect(() => {
        // Jika ada pesan error, tampilkan pop-up Swal
        if (flash.error) {
            Swal.fire({
                icon: 'error',
                title: 'Akses Ditolak',
                text: flash.error,
                confirmButtonColor: '#d33'
            });
        }
        
        // Opsional: Jika ada pesan sukses
        if (flash.success) {
            Swal.fire({
                icon: 'success',
                title: 'Berhasil',
                text: flash.success,
                confirmButtonColor: '#28a745'
            });
        }
    }, [flash]);
    return (
        <div className="container mt-5 mb-5">
            <Head title="Dashboard Siswa - SMK N 1 Bukittinggi" />
            
            <h4 className="fw-bold mb-4">Daftar Ujian Aktif</h4>

            <div className="row">
                {exams.length > 0 ? (
                    exams.map((exam) => (
                        <div className="col-md-4 mb-3" key={exam.id}>
                            <div className="card shadow-sm border-0 h-100">
                                <div className="card-body">
                                    <h5 className="card-title fw-bold text-primary">{exam.title}</h5>
                                    <p className="card-text text-muted mb-1">
                                        <i className="bi bi-clock"></i> Waktu: {exam.duration} Menit
                                    </p>
                                    <hr />
                                    {exam.is_locked ? (
                                        <button className="btn btn-secondary w-100" disabled>
                                            <i className="bi bi-lock-fill me-2"></i> Sudah Dikerjakan
                                        </button>
                                    ) : (
                                        <Link href={`/student/exam/${exam.id}`} className="btn btn-success w-100">
                                            Mulai Ujian Sekarang
                                        </Link>
                                    )}
                                    
                                    <div className="text-center mt-2 small text-muted">
                                        Batas Pengerjaan: {exam.attempts} / {exam.max_attempts}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-12">
                        <div className="alert alert-info text-center">
                            Saat ini belum ada jadwal ujian yang diaktifkan oleh Guru/Admin.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}