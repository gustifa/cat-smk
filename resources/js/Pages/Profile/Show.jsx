import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { usePage } from '@inertiajs/react';

export default function Show() {
    const { auth } = usePage().props;
    return (
        <AuthenticatedLayout>
            <div className="card">
                <div className="card-body">
                    <h3>Profile Pengguna</h3>
                    <p><strong>Nama:</strong> {auth.user.name}</p>
                    <p><strong>Email:</strong> {auth.user.email}</p>
                    <p><strong>Role:</strong> {auth.user.role}</p>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}