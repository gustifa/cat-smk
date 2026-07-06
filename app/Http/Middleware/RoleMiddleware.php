<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        // Jika user belum login, lempar ke halaman login
        if (!auth()->check()) {
            return redirect('login');
        }

        $user = auth()->user();

        // Cek apakah role user ada di dalam daftar role yang diizinkan
        if (in_array(auth()->user()->role, $roles)) {
            return $next($request);
        }

        // 3. LOGIKA REDIRECT CERDAS (Jika akses ditolak, arahkan ke dashboard yang sesuai)
        if ($user->role === 'teacher') {
            return redirect()->route('teacher.dashboard')->with('error', 'Anda tidak memiliki akses ke halaman siswa.');
        } 
        
        if ($user->role === 'student') {
            return redirect()->route('student.dashboard')->with('error', 'Anda tidak memiliki akses ke halaman guru/admin.');
        }

        // Default jika role tidak dikenali
        return redirect('/login');
    }
}
