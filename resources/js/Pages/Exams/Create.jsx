import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        duration: 90, // Default 90 menit
        status: 'inactive'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/exams', {
            onSuccess: () => {
                Swal.fire({
                    title: 'Berhasil!',
                    text: 'Mata ujian baru berhasil disimpan.',
                    icon: 'success',
                    confirmButtonColor: '#0d6efd'
                });
            }
        });
    };

    return (
        <div className="container mt-5 mb-5">
            <Head title="Tambah Ujian Baru" />
            
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card shadow-sm border-0">
                        <div className="card-header bg-dark text-white">
                            <h5 className="mb-0">Form Tambah Mata Ujian</h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Nama Mata Ujian</label>
                                    <input 
                                        type="text" 
                                        className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                                        placeholder="Contoh: Instalasi Tenaga Listrik, PAS Ganjil TITL..."
                                        value={data.title}
                                        onChange={e => setData('title', e.target.value)}
                                    />
                                    {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-bold">Durasi Pengerjaan (Menit)</label>
                                    <input 
                                        type="number" 
                                        className={`form-control ${errors.duration ? 'is-invalid' : ''}`}
                                        value={data.duration}
                                        min="1"
                                        onChange={e => setData('duration', e.target.value)}
                                    />
                                    <small className="text-muted">Lama waktu hitungan mundur ujian.</small>
                                    {errors.duration && <div className="invalid-feedback">{errors.duration}</div>}
                                </div>

                                <div className="mb-4">
                                    <label className="form-label fw-bold">Status Awal</label>
                                    <select 
                                        className="form-select" 
                                        value={data.status}
                                        onChange={e => setData('status', e.target.value)}
                                    >
                                        <option value="inactive">Tidak Aktif (Disembunyikan dari siswa)</option>
                                        <option value="active">Aktif (Bisa langsung dikerjakan siswa)</option>
                                    </select>
                                </div>

                                <div className="d-flex justify-content-end gap-2">
                                    <Link href="/exams" className="btn btn-secondary">Batal</Link>
                                    <button type="submit" className="btn btn-primary" disabled={processing}>
                                        {processing ? 'Menyimpan...' : 'Simpan Mata Ujian'}
                                    </button>
                                </div>

                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}