import React, { useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'; // Impor layout
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
        <AuthenticatedLayout>
            <div className="container mt-5 mb-5">
                <Head title="Dashboard Guru - Laporan Ujian" />
                
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h4 className="fw-bold mb-1">Pusat Laporan & Rekapitulasi Nilai</h4>
                        <p className="text-muted mb-0">SMK Negeri 1 Bukittinggi</p>
                    </div>
                </div>

                <div className="card shadow-sm border-0">
                    <div className="card-header bg-dark text-white">
                        <h6 className="mb-0">Daftar Arsip Ujian</h6>
                    </div>
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="ps-4">No</th>
                                        <th>Nama Ujian</th>
                                        <th>Status</th>
                                        <th className="text-center">Unduh Rekap Nilai</th>
                                        <th className="text-center">Analisis Soal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {exams?.length > 0 ? (
                                        exams.map((exam, index) => (
                                            <tr key={exam.id}>
                                                <td className="ps-4">{index + 1}</td>
                                                <td className="fw-semibold">{exam.title}</td>
                                                <td>
                                                    <span className={`badge ${exam.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                                                        {exam.status === 'active' ? 'Sedang Berjalan' : 'Selesai / Ditutup'}
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    <div className="btn-group" role="group">
                                                        {/* Tombol Cetak PDF */}
                                                        <a href={`/reports/exam/${exam.id}/pdf`} className="btn btn-sm btn-outline-danger" target="_blank" rel="noreferrer">
                                                            PDF
                                                        </a>
                                                        {/* Tombol Cetak Excel */}
                                                        <a href={`/reports/exam/${exam.id}/excel`} className="btn btn-sm btn-outline-success" target="_blank" rel="noreferrer">
                                                            Excel
                                                        </a>
                                                    </div>
                                                </td>
                                                <td className="text-center d-flex gap-2 justify-content-center">
                                                    <a href={`/reports/exam/${exam.id}/answers/excel`} className="btn btn-sm btn-info text-white" target="_blank" rel="noreferrer">
                                                        Detail Jawaban
                                                    </a>
                                                    <Link href={`/teacher/exam/${exam.id}/results`} className="btn btn-sm btn-warning fw-bold">
                                                        Kelola Remedial
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="text-center py-4 text-muted">
                                                Belum ada data ujian yang tersedia.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}