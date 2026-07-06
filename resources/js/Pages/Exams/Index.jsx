import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'; // Impor layout
import { Head, Link, useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';

export default function Index({ exams }) {
    const { delete: destroy } = useForm();

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Hapus Mata Ujian?',
            text: "Semua soal yang terkait dengan ujian ini juga akan terhapus!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(`/exams/${id}`, {
                    onSuccess: () => {
                        Swal.fire('Terhapus!', 'Mata ujian berhasil dihapus.', 'success');
                    }
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
                        <Link href="/exams/create" className="btn btn-light btn-sm fw-bold">
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
                                        <th>Status</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {exams?.length > 0 ? (
                                        exams.map((exam, index) => (
                                            <tr key={exam.id}>
                                                <td className="ps-3">{index + 1}</td>
                                                <td className="fw-semibold">{exam.title}</td>
                                                <td>{exam.duration} Menit</td>
                                                <td>
                                                    <span className={`badge ${exam.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                                                        {exam.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button onClick={() => handleDelete(exam.id)} className="btn btn-sm btn-danger">
                                                        Hapus
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="text-center py-4 text-muted">
                                                Belum ada mata ujian yang ditambahkan.
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