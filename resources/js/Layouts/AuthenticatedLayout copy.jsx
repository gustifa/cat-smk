import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <aside 
                className={`${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 bg-slate-900 text-white flex flex-col`}
            >
                <div className="p-4 flex items-center justify-between">
                    <span className={`font-bold text-xl ${!isSidebarOpen && 'hidden'}`}>GA_TECH</span>
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-white hover:text-gray-300">
                        ☰
                    </button>
                </div>
                
                <nav className="flex-1 mt-4 space-y-2 px-2">
                    <Link href={route('dashboard')} className="flex items-center p-3 hover:bg-slate-800 rounded-lg">
                        <span className="text-xl">🏠</span>
                        {isSidebarOpen && <span className="ml-3">Dashboard</span>}
                    </Link>
                    {/* Tambahkan NavLink lainnya di sini */}
                </nav>
            </aside>

            {/* Konten Utama */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">
                    <div>{header}</div>
                    <div className="font-semibold text-gray-700">{user.name}</div>
                </header>

                <main className="flex-1 p-6 overflow-y-auto">
                    {children}
                </main>

                {/* Footer yang selalu di bawah */}
                <footer className="bg-white border-t p-4 text-center text-sm text-gray-500">
                    &copy; 2026 GA_TEH - SMK Negeri 1 Bukittinggi
                </footer>
            </div>
        </div>
    );
}