import { router } from '@inertiajs/react';

export default function ExamList({ exams }) {
    const toggleExam = (exam) => {
        const routeName = exam.is_active ? 'teacher.exams.deactivate' : 'teacher.exams.activate';
        router.post(route(routeName, exam.id));
    };

    return (
        <div className="table-responsive">
            <table className="table">
                <thead>
                    <tr><th>Ujian</th><th>Status</th><th>Token</th><th>Aksi</th></tr>
                </thead>
                <tbody>
                    {exams.map((exam, index) => (
                        <tr key={exam.id}>
                            <td>{index + 1}</td>
                            <td>{exam.title}</td>
                            <td>{exam.duration} Menit</td>
                            <td>
                                {/* Menampilkan status dan token jika aktif */}
                                <div className="d-flex flex-column gap-1">
                                    <span className={`badge ${exam.is_active ? 'bg-success' : 'bg-secondary'}`}>
                                        {exam.is_active ? 'Aktif' : 'Non-Aktif'}
                                    </span>
                                    {exam.is_active && (
                                        <small className="fw-bold text-primary">Token: {exam.token}</small>
                                    )}
                                </div>
                            </td>
                            <td className="d-flex gap-2">
                                {/* Tombol Aktif/Tutup */}
                                <button 
                                    onClick={() => router.post(route(exam.is_active ? 'teacher.exams.deactivate' : 'teacher.exams.activate', exam.id))}
                                    className={`btn btn-sm ${exam.is_active ? 'btn-warning' : 'btn-primary'}`}
                                >
                                    {exam.is_active ? 'Tutup Ujian' : 'Aktifkan & Generate'}
                                </button>

                                {/* Tombol Hapus */}
                                <button 
                                    onClick={() => { if(confirm('Hapus ujian?')) router.delete(route('teacher.exams.destroy', exam.id)) }}
                                    className="btn btn-sm btn-danger"
                                >
                                    Hapus
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}