import { useForm } from '@inertiajs/react';

export default function EnterToken({ exam }) {
    const { data, setData, post } = useForm({ token: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('student.exam.verify', exam.id));
    };

    return (
        <div className="container mt-5">
            <form onSubmit={submit} className="card p-4">
                <h4>Masukkan Token Ujian: {exam.title}</h4>
                <input 
                    className="form-control" 
                    value={data.token} 
                    onChange={e => setData('token', e.target.value)} 
                    placeholder="Masukkan token dari guru"
                />
                <button className="btn btn-primary mt-3">Mulai Ujian</button>
            </form>
        </div>
    );
}