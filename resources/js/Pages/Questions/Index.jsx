import React, { useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'; // Impor layout
import { Head, Link, router } from '@inertiajs/react';
import $ from 'jquery';
import 'datatables.net-bs5';
import Swal from 'sweetalert2';

export default function Index() {
    const tableRef = useRef(null);

    useEffect(() => {
        // Inisialisasi Yajra DataTables
        const table = $(tableRef.current).DataTable({
            processing: true,
            serverSide: true,
            ajax: '/questions/data',
            columns: [
                { data: 'id', name: 'id', width: '5%' },
                { data: 'question_text', name: 'question_text' },
                { data: 'type', name: 'type', width: '15%' },
                { data: 'action', name: 'action', orderable: false, searchable: false, width: '15%' }
            ],
            language: {
                processing: "Sedang memproses...",
                lengthMenu: "Tampilkan _MENU_ data",
                zeroRecords: "Tidak ditemukan data yang sesuai",
                info: "Menampilkan _START_ sampai _END_ dari _TOTAL_ data",
                infoEmpty: "Menampilkan 0 sampai 0 dari 0 data",
                infoFiltered: "(disaring dari _MAX_ total data)",
                search: "Cari soal:",
                paginate: {
                    first: "Pertama",
                    previous: "Sebelumnya",
                    next: "Selanjutnya",
                    last: "Terakhir"
                }
            }

            
        });

        // Menangani aksi klik tombol edit & hapus di dalam Datatables
        $(tableRef.current).on('click', '.edit-btn', function() {
            const id = $(this).data('id');
            // Arahkan ke halaman edit: window.location.href = `/questions/${id}/edit`;
            console.log('Edit ID:', id);
        });

        $(tableRef.current).on('click', '.delete-btn', function() {
            const id = $(this).data('id');
            // Panggil SweetAlert di sini untuk konfirmasi hapus
            // console.log('Hapus ID:', id);

            Swal.fire({
        title: 'Apakah Anda yakin?',
        text: "Data soal yang dihapus tidak dapat dikembalikan!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal'
    }).then((result) => {
        if (result.isConfirmed) {
            // Melakukan request DELETE ke Laravel
            router.delete(route('questions.destroy', id), {
                preserveState: false, // Memaksa komponen untuk re-render dari awal
                preserveScroll: true,
                onSuccess: () => {
                    Swal.fire('Terhapus!', 'Data soal telah dihapus.', 'success');
                },
                onError: () => {
                    Swal.fire('Gagal!', 'Terjadi kesalahan saat menghapus data.', 'error');
                }
            });
        }
    });
        });

        return () => {
            table.destroy(); // Bersihkan memori saat berpindah halaman
        };
    }, []);

    return (
        <AuthenticatedLayout>
            <div className="container mt-5">
                <Head title="Bank Soal" />
                
                <div className="card shadow-sm">
                    <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Manajemen Bank Soal</h5>
                        <Link href="/questions/create" className="btn btn-light btn-sm">
                            + Tambah Soal
                        </Link>
                    </div>
                    <div className="card-body">
                        <div className="table-responsive">
                            <table ref={tableRef} className="table table-bordered table-hover w-100">
                                <thead className="table-light">
                                    <tr>
                                        <th>ID</th>
                                        <th>Pertanyaan</th>
                                        <th>Tipe Soal</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}