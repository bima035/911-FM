'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';

export default function RegisterPage() {
    const [nama, setNama] = useState('');
    const [email, setEmail] = useState('');
    const [telepon, setTelepon] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { showToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nama, email, password, telepon }),
            });

            const result = await res.json();

            if (result.success) {
                // Redirect ke login setelah berhasil daftar
                showToast('Akun berhasil dibuat! Silakan login.', 'success');
                router.push('/login?registered=true');
            } else {
                setError(result.message || 'Registrasi gagal');
                showToast(result.message || 'Registrasi gagal. Cek kembali data Anda.', 'error');
            }
        } catch (err) {
            setError('Terjadi kesalahan koneksi ke server');
            showToast('Gagal terhubung ke server. Coba lagi nanti.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-20 bg-gray-50 flex flex-col justify-center px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 font-outfit">
                    Daftar Akun Baru
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Sudah punya akun?{' '}
                    <Link href="/login" className="font-medium text-[var(--color-primary)] hover:underline">
                        Login di sini
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="nama" className="block text-sm font-medium text-gray-700">
                                Nama Lengkap
                            </label>
                            <div className="mt-1">
                                <input
                                    id="nama"
                                    name="nama"
                                    type="text"
                                    required
                                    value={nama}
                                    onChange={(e) => setNama(e.target.value)}
                                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="telepon" className="block text-sm font-medium text-gray-700">
                                Nomor Telepon / WhatsApp
                            </label>
                            <div className="mt-1">
                                <input
                                    id="telepon"
                                    name="telepon"
                                    type="tel"
                                    required
                                    placeholder="Contoh: 08123456789"
                                    value={telepon}
                                    onChange={(e) => setTelepon(e.target.value)}
                                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                                />
                            </div>
                        </div>


                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 flex justify-center items-center px-4 border border-transparent rounded-xl shadow-sm text-base font-bold text-white bg-[var(--color-primary)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] transition-all disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    'Daftar Akun'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
