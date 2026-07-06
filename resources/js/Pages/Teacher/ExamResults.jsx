import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';

export default function ExamResults({ exam, results }) {
    const { delete: destroy } = useForm();

    const handleRemedial = (userId, userName) => {
        Swal.fire({
            title: 'Izinkan Remedial?',
            text: `Anda akan me-reset nilai dan jawaban atas nama ${userName}. Siswa ini akan dapat mengerjakan ujian dari awal.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ffc107',
            confirmButtonText: 'Ya, Berikan Akses',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(`/teacher/exam/${exam.id}/student/${userId}/reset`, {
                    onSuccess: () => {
                        Swal.fire('Berhasil!', 'Akses ujian telah dibuka kembali untuk siswa tersebut.', 'success');
                    }
                });
            }
        });
    };

    return (
        <div className="container mt-5 mb-5">
            <Head title={`Kelola Nilai - ${exam.title}`} />
            
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold mb-1">Manajemen Nilai & Remedial</h4>
                    <p className="text-muted mb-0">Ujian: {exam.title}</p>
                </div>
                <Link href="/teacher/dashboard" className="btn btn-outline-secondary">
                    Kembali ke Dashboard
                </Link>
            </div>

            <div className="card shadow-sm border-0">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th className="ps-4">No</th>
                                    <th>Nama Siswa</th>
                                    <th>Waktu Selesai</th>
                                    <th>Nilai Akhir</th>
                                    <th className="text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results?.length > 0 ? (
                                    results.map((result, index) => (
                                        <tr key={result.id}>
                                            <td className="ps-4">{index + 1}</td>
                                            <td className="fw-semibold">{result.user?.name}</td>
                                            <td>{new Date(result.created_at).toLocaleString('id-ID')}</td>
                                            <td>
                                                <span className={`badge ${result.score >= 75 ? 'bg-success' : 'bg-danger'} fs-6`}>
                                                    {result.score}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <button 
                                                    onClick={() => handleRemedial(result.user_id, result.user?.name)} 
                                                    className="btn btn-sm btn-warning fw-bold"
                                                >
                                                    <i className="bi bi-arrow-counterclockwise"></i> Reset / Remedial
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-4 text-muted">
                                            Belum ada siswa yang menyelesaikan ujian ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div className="mt-3 text-muted small">
                * Catatan: Standar KKM default warna merah/hijau diasumsikan 75. 
            </div>
        </div>
    );
}