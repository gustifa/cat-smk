<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Buat Roles
        $admin = Role::create(['name' => 'admin']);
        $guru = Role::create(['name' => 'guru']);
        $siswa = Role::create(['name' => 'siswa']);
        $pengawas = Role::create(['name' => 'pengawas']);

        // 2. Buat User Admin Default
        $userAdmin = User::create([
            'name' => 'Admin CAT',
            'email' => 'admin@smk.com',
            'password' => Hash::make('password123'),
        ]);
        $userAdmin->assignRole('admin');
        
        // 3. Buat User Siswa Default
        $userSiswa = User::create([
            'name' => 'Siswa Contoh',
            'email' => 'siswa@smk.com',
            'password' => Hash::make('password123'),
        ]);
        $userSiswa->assignRole('siswa');
    }
}
