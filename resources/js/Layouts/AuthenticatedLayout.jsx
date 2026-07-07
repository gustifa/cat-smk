import { useState, useEffect } from 'react'; // Tambahkan useEffect
import { Link, usePage, router } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';
// Import Ikon Lucide
import { 
    LayoutDashboard, 
    BookOpenText, 
    Menu, 
    X, 
    User, 
    LogOut, 
    ChevronDown, 
    School, 
    GraduationCap 
} from 'lucide-react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const [loading, setLoading] = useState(false); // Tambahkan state loading

    // Logika untuk mendeteksi loading
    useEffect(() => {
        const start = router.on('start', () => setLoading(true));
        const finish = router.on('finish', () => setLoading(false));

        return () => {
            start();
            finish();
        };
    }, []);

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* FITUR LOADING OVERLAY */}
            {loading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
                    <div className="flex flex-col items-center">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="mt-2 font-semibold text-blue-600">Loading...</span>
                    </div>
                </div>
            )}
            {/* Sidebar */}
            <aside className={`fixed md:static inset-y-0 left-0 z-30 ${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 bg-slate-900 text-white flex flex-col shadow-2xl`}>
                <div className="p-5 flex items-center justify-between border-b border-slate-800">
                    <div className={`flex items-center gap-2 ${!isSidebarOpen && 'hidden'}`}>
                        <GraduationCap className="text-blue-400 w-8 h-8" />
                        <span className="font-bold text-xl tracking-tight">GA_TEH</span>
                    </div>
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-400 hover:text-white">
                        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
                
                <nav className="flex-1 mt-6 px-3 space-y-2">
                    <Link href={route('dashboard')} className="flex items-center p-3 hover:bg-blue-600 rounded-xl transition-all duration-200">
                        <LayoutDashboard size={22} />
                        {isSidebarOpen && <span className="ml-4 font-medium">Dashboard</span>}
                    </Link>
                    {/* Menu yang HANYA tampil untuk role 'teacher' */}
                    {(user.role === 'admin' || user.role === 'teacher') &&  (
                        <Link href={route('questions.index')} className="flex items-center p-3 hover:bg-blue-600 rounded-xl transition-all duration-200">
                            <BookOpenText size={22} />
                            {isSidebarOpen && <span className="ml-4 font-medium">Bank Soal</span>}
                        </Link>
                    )}
                    {(user.role === 'admin' || user.role === 'teacher') &&  (
                        <Link href={route('teacher.dashboard')} className="flex items-center p-3 hover:bg-blue-600 rounded-xl transition-all duration-200">
                            <BookOpenText size={22} />
                            {isSidebarOpen && <span className="ml-4 font-medium">Laporan</span>}
                        </Link>
                    )}
                    
                    {(user.role === 'admin' || user.role === 'teacher') &&  (
                        <Link href={route('teacher.exams.index')} className="flex items-center p-3 hover:bg-blue-600 rounded-xl transition-all duration-200">
                            <BookOpenText size={22} />
                            {isSidebarOpen && <span className="ml-4 font-medium">Mapel</span>}
                        </Link>
                    )}
                    {/* Contoh: Menu khusus siswa */}
                    {user.role === 'student' && (
                        <Link href={route('student.dashboard')} className="flex items-center p-3 hover:bg-blue-600 rounded-xl transition-all duration-200">
                            <GraduationCap size={22} />
                            {isSidebarOpen && <span className="ml-4 font-medium">Ujian Saya</span>}
                        </Link>
                    )}
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-3">
                        <School className="text-blue-600 md:hidden" size={24} />
                        <div className="flex flex-col">
                            <h1 className="text-xs md:text-sm font-bold text-gray-800 uppercase tracking-widest">SMK N 1 Bukittinggi</h1>
                            <span className="text-[10px] md:text-xs text-blue-600 font-semibold uppercase">Sistem Bank Soal GA_TEH</span>
                        </div>
                    </div>
                    
                    <Dropdown>
                        <Dropdown.Trigger>
                            <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full transition">
                                <User size={16} />
                                <span className="text-sm font-medium">{user.name.split(' ')[0]}</span>
                                <ChevronDown size={14} />
                            </button>
                        </Dropdown.Trigger>
                        <Dropdown.Content>
                            <Dropdown.Link href={route('profile.edit')} className="flex items-center gap-2">
                                <User size={14} /> Profile
                            </Dropdown.Link>
                            <Dropdown.Link href={route('logout')} method="post" as="button" className="flex items-center gap-2">
                                <LogOut size={14} /> Log Out
                            </Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>
                </header>

                <main className="flex-1 p-8 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}