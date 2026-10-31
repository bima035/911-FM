'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import Modal from '@/components/UI/Modal';

interface Order {
    order_id: string;
    paket: string;
    total_harga: number;
    status: string;
    created_at: string;
    payment_method?: string;
    paid_at?: string;
    jenis_materi: 'file' | 'text';
    file_audio_name?: string;
    script_text?: string;
    voice_preference?: string;
    music_preference?: string;
    catatan?: string;
    midtrans_transaction_id?: string;
    invoice_path?: string;
}

export default function DashboardPage() {
    const { user, token, isLoading: authLoading } = useAuth();
    const { showToast } = useToast();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        if (user && token) {
            fetchOrders();
        }
    }, [user, token, authLoading]);

    const fetchOrders = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/orders/my`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (data.success) {
                setOrders(data.orders);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleContinuePayment = async (orderId: string) => {
        setIsProcessing(orderId);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            showToast('Menyiapkan pembayaran...', 'info');

            const res = await fetch(`${apiUrl}/api/payment/create-transaction`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ order_id: orderId }),
            });

            const result = await res.json();

            if (!result.success) {
                showToast('Gagal memproses pembayaran: ' + result.message, 'error');
                return;
            }

            if (window.snap) {
                window.snap.pay(result.token, {
                    onSuccess: () => {
                        showToast('Pembayaran berhasil!', 'success');
                        fetchOrders();
                    },
                    onPending: () => {
                        showToast('Pembayaran tertunda.', 'warning');
                        fetchOrders();
                    },
                    onError: () => {
                        showToast('Pembayaran gagal.', 'error');
                    },
                    onClose: () => {
                        showToast('Jendela pembayaran ditutup.', 'info');
                    }
                });
            } else if (result.redirect_url) {
                window.location.href = result.redirect_url;
            } else {
                showToast('Sistem pembayaran tidak tersedia. Silakan refresh halaman.', 'error');
            }
        } catch (error) {
            console.error('Payment error:', error);
            showToast('Terjadi kesalahan koneksi.', 'error');
        } finally {
            setIsProcessing(null);
        }
    };

    const getStatusBadge = (status: string) => {
        const badges: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            paid: 'bg-green-100 text-green-800 border-green-200',
            processing: 'bg-blue-100 text-blue-800 border-blue-200',
            on_air: 'bg-purple-100 text-purple-800 border-purple-200',
            completed: 'bg-gray-100 text-gray-800 border-gray-200',
            cancelled: 'bg-red-100 text-red-800 border-red-200',
        };
        return badges[status] || 'bg-gray-100 text-gray-800';
    };

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-20 bg-gray-50">
            <div className="container">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 font-outfit">Riwayat Iklan Saya</h1>
                        <p className="text-gray-600">Selamat datang kembali, {user?.nama}</p>
                    </div>
                    <Link href="/order" className="btn btn-primary text-center inline-flex items-center justify-center">Pasang Iklan Baru</Link>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="font-bold text-lg text-gray-800">Riwayat Iklan</h2>
                        </div>

                        {orders.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="text-5xl mb-4">📻</div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Belum ada iklan</h3>
                                <p className="text-gray-500 mb-6">Anda belum pernah memesan iklan di City Guide 911 FM.</p>
                                <Link href="/order" className="btn btn-primary text-center inline-flex items-center justify-center">Mulai Pasang Iklan</Link>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50 text-gray-500 text-sm uppercase">
                                            <th className="px-6 py-4 font-semibold">Order ID</th>
                                            <th className="px-6 py-4 font-semibold">Paket</th>
                                            <th className="px-6 py-4 font-semibold">Total Harga</th>
                                            <th className="px-6 py-4 font-semibold">Status</th>
                                            <th className="px-6 py-4 font-semibold">Tanggal</th>
                                            <th className="px-6 py-4 font-semibold text-center">Detail Payment</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {orders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((order) => (
                                            <tr key={order.order_id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4 font-mono text-sm font-medium text-[var(--color-primary)]">
                                                    {order.order_id}
                                                </td>
                                                <td className="px-6 py-4 capitalize font-medium">{order.paket}</td>
                                                <td className="px-6 py-4 font-bold">
                                                    Rp {order.total_harga.toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(order.status)}`}>
                                                        {order.status.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {new Date(order.created_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </td>
                                                <td className="px-6 py-4 flex flex-col items-center justify-center gap-2">
                                                    <div className="flex gap-2 justify-center">
                                                        {order.status === 'pending' ? (
                                                            <button
                                                                onClick={() => handleContinuePayment(order.order_id)}
                                                                disabled={!!isProcessing}
                                                                className="text-[10px] font-bold bg-[var(--color-primary)] text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
                                                            >
                                                                {isProcessing === order.order_id ? 'Wait...' : 'BAYAR'}
                                                            </button>
                                                        ) : null}
                                                        <button
                                                            onClick={() => {
                                                                setSelectedOrder(order);
                                                                setShowDetailModal(true);
                                                            }}
                                                            className="text-[10px] font-bold bg-gray-100 text-gray-600 px-4 py-1.5 rounded-lg hover:bg-gray-200 transition-all outline-none"
                                                        >
                                                            DETAIL
                                                        </button>
                                                    </div>
                                                    {order.invoice_path && (
                                                        <a 
                                                            href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/uploads/invoices/${order.invoice_path}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-all border border-blue-100 block text-center w-full max-w-[120px]"
                                                        >
                                                            Lihat Invoice
                                                        </a>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination */}
                        {orders.length > itemsPerPage && (
                            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
                                <p className="text-xs text-gray-500 font-medium">
                                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, orders.length)} of {orders.length} orders
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 border rounded-lg bg-white disabled:opacity-50 hover:bg-gray-50 transition-colors"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                                    </button>

                                    {Array.from({ length: Math.ceil(orders.length / itemsPerPage) }, (_, i) => (
                                        <button
                                            key={i + 1}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === i + 1 ? 'bg-[var(--color-primary)] text-white shadow-lg' : 'bg-white border text-gray-600 hover:border-[var(--color-primary)]'}`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(orders.length / itemsPerPage)))}
                                        disabled={currentPage === Math.ceil(orders.length / itemsPerPage)}
                                        className="p-2 border rounded-lg bg-white disabled:opacity-50 hover:bg-gray-50 transition-colors"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Detail Order */}
            <Modal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                title="Detail Pesanan Iklan"
                size="lg"
                footer={
                    <button
                        onClick={() => setShowDetailModal(false)}
                        className="px-6 py-2 rounded-xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
                    >
                        Tutup
                    </button>
                }
            >
                {selectedOrder && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Order Info */}
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order ID</p>
                                    <p className="font-mono text-sm font-bold text-[var(--color-primary)]">{selectedOrder.order_id}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Paket</p>
                                    <p className="font-bold capitalize">{selectedOrder.paket}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Bayar</p>
                                    <p className="font-extrabold text-gray-900">Rp {selectedOrder.total_harga.toLocaleString('id-ID')}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</p>
                                    <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase border ${getStatusBadge(selectedOrder.status)}`}>
                                        {selectedOrder.status}
                                    </span>
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="space-y-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <h4 className="text-xs font-bold text-gray-900 uppercase">Informasi Pembayaran</h4>
                                {selectedOrder.status !== 'pending' && selectedOrder.paid_at ? (
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">Metode</p>
                                            <p className="text-sm font-bold capitalize">{selectedOrder.payment_method?.replace(/_/g, ' ') || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">Waktu Bayar</p>
                                            <p className="text-sm font-medium">
                                                {new Date(selectedOrder.paid_at).toLocaleString('id-ID', {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short'
                                                })}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">Transaction ID</p>
                                            <p className="text-[10px] font-mono text-gray-500 truncate">{selectedOrder.midtrans_transaction_id || '-'}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-500 italic">Belum ada data pembayaran</p>
                                )}
                            </div>
                        </div>

                        {/* Materi Content */}
                        <div className="pt-6 border-t border-gray-100">
                            <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="p-1.5 bg-[var(--color-primary)] text-white rounded-lg">🎞️</span>
                                Materi Iklan ({selectedOrder.jenis_materi === 'file' ? 'Upload File' : 'Teks Naskah'})
                            </h4>

                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                {selectedOrder.jenis_materi === 'file' ? (
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-blue-50 text-blue-500 rounded-xl font-bold text-xl">📄</div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{selectedOrder.file_audio_name}</p>
                                            <p className="text-xs text-gray-500">Materi Audio Berhasil Terupload</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 italic text-sm text-gray-700 leading-relaxed">
                                            "{selectedOrder.script_text}"
                                        </div>
                                        <div className="flex gap-4">
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Vokal</p>
                                                <p className="text-xs font-bold capitalize">{selectedOrder.voice_preference || 'Sesuai Tim'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">Musik</p>
                                                <p className="text-xs font-bold capitalize">{selectedOrder.music_preference || 'Sesuai Tim'}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedOrder.catatan && (
                                    <div className="mt-4 pt-4 border-t border-gray-50">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Catatan Tambahan</p>
                                        <p className="text-xs text-gray-600">{selectedOrder.catatan}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
