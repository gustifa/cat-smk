import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import Swal from 'sweetalert2';

export default function Index({ exams }) {
    const { delete: destroy } = useForm();

    const handleDelete = (id, hasAttempts) => {
        // 1. Cek jika attempts ada di state (Frontend check)
        if (hasAttempts) {
            Swal.fire({ icon: 'error', title: 'Akses Ditolak', text: 'Ujian ini sudah digunakan!' });
            return;
        }

        Swal.fire({
            title: 'Hapus Mata Ujian?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, Hapus'
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(route('teacher.exams.destroy', id), {
                    // 2. Hanya tampilkan sukses jika benar-benar berhasil
                    onSuccess: () => Swal.fire('Terhapus!', 'Mata ujian berhasil dihapus.', 'success'),
                    // 3. Tangkap error jika backend menolak (misal: hasAttempts lolos dari UI)
                    onError: (errors) => Swal.fire('Gagal!', errors.error || 'Terjadi kesalahan.', 'error')
                });
            }
        });
    };

    const handleToggleStatus = (exam) => {
    const isActivating = exam.status !== 'active';
    const routeName = isActivating ? 'teacher.exams.activate' : 'teacher.exams.deactivate';
    
        router.post(route(routeName, exam.id), {}, {
            preserveScroll: true,
            onSuccess: (page) => {
                // Cari data ujian yang baru saja diupdate dari props terbaru (page.props)
                const updatedExam = page.props.exams.find(e => e.id === exam.id);
                
                Swal.fire({
                    icon: 'success',
                    title: isActivating ? 'Ujian Diaktifkan!' : 'Ujian Ditutup',
                    text: isActivating ? `Token: ${updatedExam?.token || 'Gagal generate'}` : 'Token telah dinonaktifkan.',
                    timer: 3000
                });
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <div className="container mt-5 mb-5">
                <Head title="Manajemen Mata Ujian" />
                
                <div className="card shadow-sm border-0">
                    <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Daftar Mata Ujian</h5>
                        <Link href="/teacher/exams/create" className="btn btn-light btn-sm fw-bold">
                            + Tambah Ujian Baru
                        </Link>
                    </div>
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="ps-3">No</th>
                                        <th>Nama Ujian</th>
                                        <th>Durasi</th>
                                        <th>Status & Token</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {exams?.length > 0 ? (
                                        exams.map((exam, index) => (
                                            <tr key={exam.id} className="align-middle">
                                                <td className="ps-3">{index + 1}</td>
                                                <td className="fw-semibold">{exam.title}</td>
                                                <td>{exam.duration} Menit</td>
                                                <td>
                                                    <div className="d-flex flex-column align-items-start">
                                                        <button 
                                                            onClick={() => handleToggleStatus(exam)}
                                                            className={`badge border-0 ${exam.status === 'active' ? 'bg-success' : 'bg-secondary'}`}
                                                        >
                                                            {exam.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                                                        </button>
                                                        {exam.status === 'active' && (
                                                            <span className="badge bg-light text-primary border mt-1 font-monospace">
                                                                Token: {exam.token}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <button 
                                                        onClick={() => handleDelete(exam.id, exam.has_attempts)} 
                                                        className={`btn btn-sm ${exam.has_attempts ? 'btn-outline-secondary' : 'btn-danger'}`}
                                                        disabled={exam.has_attempts}
                                                    >
                                                        {exam.has_attempts ? 'Terkunci' : 'Hapus'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="text-center py-4 text-muted">Belum ada ujian.</td>
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