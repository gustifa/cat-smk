import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';

export default function Index({ students }) {
    const { data, setData, post, processing, errors } = useForm({
        file_excel: null,
    });

    // Menangani aksi upload file Excel
    const handleImport = (e) => {
        e.preventDefault();
        post('/students/import', {
            onSuccess: () => {
                Swal.fire({
                    title: 'Berhasil!',
                    text: 'Data siswa selesai diimpor dari Excel.',
                    icon: 'success',
                    confirmButtonColor: '#0d6efd'
                });
            },
            onError: () => {
                Swal.fire({
                    title: 'Gagal!',
                    text: 'Pastikan format file adalah .xlsx dan kolom sesuai.',
                    icon: 'error',
                });
            }
        });
    };

    return (
        <div className="container mt-5 mb-5">
            <Head title="Manajemen Data Siswa" />
            
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold">Data Peserta Didik</h4>
                {/* Tombol Export Excel */}
                <a href="/students/export" className="btn btn-success">
                    Unduh Excel
                </a>
            </div>

            <div className="row">
                {/* Panel Import */}
                <div className="col-md-4 mb-4">
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-dark text-white">
                            <h6 className="mb-0">Upload Data Excel</h6>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleImport}>
                                <div className="mb-3">
                                    <label className="form-label text-muted small">Pilih File (.xlsx / .csv)</label>
                                    <input 
                                        type="file" 
                                        className={`form-control ${errors.file_excel ? 'is-invalid' : ''}`} 
                                        accept=".xlsx, .csv"
                                        onChange={e => setData('file_excel', e.target.files[0])} 
                                        required 
                                    />
                                    {errors.file_excel && <div className="invalid-feedback">{errors.file_excel}</div>}
                                </div>
                                <button type="submit" className="btn btn-primary w-100" disabled={processing}>
                                    {processing ? 'Memproses...' : 'Mulai Impor'}
                                </button>
                            </form>
                            <div className="mt-3 small text-muted">
                                <strong>Format Kolom Excel Wajib:</strong>
                                <ul>
                                    <li>Nama Lengkap</li>
                                    <li>Email</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabel Menampilkan Data Siswa */}
                <div className="col-md-8">
                    <div className="card shadow-sm border-0">
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-striped table-hover mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th className="ps-3">ID</th>
                                            <th>Nama Lengkap</th>
                                            <th>Email</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.length > 0 ? (
                                            students.map((student, index) => (
                                                <tr key={student.id}>
                                                    <td className="ps-3">{index + 1}</td>
                                                    <td className="fw-semibold">{student.name}</td>
                                                    <td>{student.email}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="3" className="text-center py-4 text-muted">
                                                    Belum ada data siswa. Silakan impor melalui Excel.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}