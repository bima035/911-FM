'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function SuccessPage() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('order_id');

    return (
        <main className="min-h-screen pt-24 pb-12 bg-gradient-to-b from-white to-[var(--color-light)]/30">
            <div className="container">
                <div className="max-w-2xl mx-auto text-center">
                    <div className="card">
                        {/* Success Icon */}
                        <div className="w-24 h-24 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>

                        <h1 className="text-3xl font-bold mb-4 text-green-600">Pembayaran Berhasil!</h1>
                        <p className="text-gray-600 mb-6">
                            Terima kasih telah memesan iklan di City Guide 911 FM. Pembayaran Anda telah berhasil diproses.
                        </p>

                        {orderId && (
                            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                <p className="text-sm text-gray-600">Order ID:</p>
                                <p className="font-mono font-bold text-lg">{orderId}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <p className="text-gray-700">
                                Tim kami akan segera memproses pesanan Anda. Anda akan menerima konfirmasi melalui email dalam waktu 1x24 jam.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                                <Link href="/">
                                    <button className="btn btn-primary">
                                        Kembali ke Beranda
                                    </button>
                                </Link>
                                <Link href="/order">
                                    <button className="btn btn-outline">
                                        Pesan Lagi
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
