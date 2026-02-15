'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function ErrorPage() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('order_id');

    return (
        <main className="min-h-screen pt-24 pb-12 bg-gradient-to-b from-white to-[var(--color-light)]/30">
            <div className="container">
                <div className="max-w-2xl mx-auto text-center">
                    <div className="card">
                        {/* Error Icon */}
                        <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                            <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>

                        <h1 className="text-3xl font-bold mb-4 text-red-600">Pembayaran Gagal</h1>
                        <p className="text-gray-600 mb-6">
                            Maaf, terjadi kesalahan saat memproses pembayaran Anda. Silakan coba lagi.
                        </p>

                        {orderId && (
                            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                <p className="text-sm text-gray-600">Order ID:</p>
                                <p className="font-mono font-bold text-lg">{orderId}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-sm text-red-800">
                                    <strong>Kemungkinan penyebab:</strong>
                                </p>
                                <ul className="text-sm text-red-700 mt-2 space-y-1 text-left list-disc list-inside">
                                    <li>Saldo tidak mencukupi</li>
                                    <li>Koneksi internet terputus</li>
                                    <li>Pembayaran dibatalkan</li>
                                    <li>Informasi pembayaran tidak valid</li>
                                </ul>
                            </div>

                            <p className="text-gray-700">
                                Jika masalah berlanjut, silakan hubungi customer service kami di (0341) 123-4567 atau email ke iklan@cityguide911fm.com
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                                <Link href="/order">
                                    <button className="btn btn-primary">
                                        Coba Lagi
                                    </button>
                                </Link>
                                <Link href="/">
                                    <button className="btn btn-outline">
                                        Kembali ke Beranda
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
