import React from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function AuthenticatedLayout({ children }) {
    const { auth } = usePage().props;

    return (
        <div className="wrapper d-flex">
            {/* Sidebar */}
            <nav id="sidebar" className="bg-dark text-white p-3" style={{ minWidth: '250px', minHeight: '100vh' }}>
                <h4 className="text-center my-3">GA_TECH</h4>
                <hr />
                <ul className="nav flex-column">
                    <li className="nav-item"><Link href="/dashboard" className="nav-link text-white">Dashboard</Link></li>
                    {auth.user.role === 'teacher' && (
                        <>
                            <li className="nav-item"><Link href="/teacher/dashboard" className="nav-link text-white">Kelola Ujian</Link></li>
                            <li className="nav-item"><Link href="/exams" className="nav-link text-white">Bank Soal</Link></li>
                        </>
                    )}
                    <li className="nav-item"><Link href="/profile" className="nav-link text-white">Profile</Link></li>
                </ul>
            </nav>

            {/* Konten Utama */}
            <div className="main-content flex-grow-1">
                {/* Header */}
                <header className="navbar navbar-light bg-light shadow-sm px-4">
                    <span className="navbar-brand mb-0 h1">SMK Negeri 1 Bukittinggi</span>
                    <div className="dropdown">
                        <button className="btn btn-secondary dropdown-toggle" data-bs-toggle="dropdown">
                            {auth.user.name}
                        </button>
                        <ul className="dropdown-menu">
                            <li><Link className="dropdown-item" href="/profile">Profile</Link></li>
                            <li><Link className="dropdown-item" href="/logout" method="post" as="button">Logout</Link></li>
                        </ul>
                    </div>
                </header>

                {/* Body Konten */}
                <main className="p-4">{children}</main>

                {/* Footer */}
                <footer className="footer mt-auto p-3 text-center text-muted border-top">
                    <small>&copy; 2026 GA_TECH Teknologi Informasi dan Pembelajaran - SMK N 1 Bukittinggi</small>
                </footer>
            </div>
        </div>
    );
}