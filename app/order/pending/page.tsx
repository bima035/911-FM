'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function PendingPage() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('order_id');

    return (
        <main className="min-h-screen pt-24 pb-12 bg-gradient-to-b from-white to-[var(--color-light)]/30">
            <div className="container">
                <div className="max-w-2xl mx-auto text-center">
                    <div className="card">
                        {/* Pending Icon */}
                        <div className="w-24 h-24 mx-auto mb-6 bg-yellow-100 rounded-full flex items-center justify-center">
                            <svg className="w-12 h-12 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>

                        <h1 className="text-3xl font-bold mb-4 text-yellow-600">Pembayaran Pending</h1>
                        <p className="text-gray-600 mb-6">
                            Pembayaran Anda sedang diproses. Silakan selesaikan pembayaran sesuai instruksi yang diberikan.
                        </p>

                        {orderId && (
                            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                <p className="text-sm text-gray-600">Order ID:</p>
                                <p className="font-mono font-bold text-lg">{orderId}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <p className="text-gray-700">
                                Jika Anda telah menyelesaikan pembayaran, mohon tunggu konfirmasi dari sistem kami.
                                Anda akan menerima email konfirmasi setelah pembayaran berhasil diverifikasi.
                            </p>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                                <p className="text-sm text-blue-800">
                                    <strong>Catatan:</strong> Proses verifikasi pembayaran biasanya memakan waktu beberapa menit hingga 1x24 jam tergantung metode pembayaran yang dipilih.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                                <Link href="/">
                                    <button className="btn btn-primary">
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
