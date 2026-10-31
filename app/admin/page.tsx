'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Order {
    order_id: string;
    nama: string;
    email: string;
    paket: string;
    total_harga: number;
    status: string;
    created_at: string;
    jenis_materi: string;
    invoice_path?: string;
}

interface SlotSummary {
    total: number;
    pending: number;
}

export default function AdminDashboardPage() {
    const { user, token, isLoading: authLoading } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [slotSummary, setSlotSummary] = useState<Record<string, SlotSummary>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const router = useRouter();

    useEffect(() => {
        if (!authLoading) {
            if (!user || user.role !== 'admin') {
                router.push('/login');
                return;
            }
            fetchData();
        }
    }, [user, token, authLoading]);

    const fetchData = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

            const [statsRes, ordersRes] = await Promise.all([
                fetch(`${apiUrl}/api/orders/stats`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${apiUrl}/api/orders`, { headers: { 'Authorization': `Bearer ${token}` } }),
            ]);

            const statsData = await statsRes.json();
            if (statsData.success) setStats(statsData.data);

            const ordersData = await ordersRes.json();
            if (ordersData.success) {
                const fetchedOrders: Order[] = ordersData.orders;
                setOrders(fetchedOrders);

                // Fetch slot summary untuk semua order yang relevan (status paid/processing/on_air)
                const relevantIds = fetchedOrders
                    .filter(o => ['paid', 'processing', 'on_air'].includes(o.status))
                    .map(o => o.order_id);
                if (relevantIds.length > 0) {
                    const summaryRes = await fetch(
                        `${apiUrl}/api/ad-slots/summary?order_ids=${relevantIds.join(',')}`,
                        { headers: { 'Authorization': `Bearer ${token}` } }
                    );
                    const summaryData = await summaryRes.json();
                    if (summaryData.success) setSlotSummary(summaryData.data);
                }
            }
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUploadInvoice = async (orderId: string, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            alert('Hanya file PDF yang diizinkan untuk invoice');
            return;
        }

        const formData = new FormData();
        formData.append('invoice', file);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/orders/${orderId}/invoice`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                alert('Invoice berhasil diupload');
                fetchData();
            } else {
                alert('Gagal upload invoice: ' + data.message);
            }
        } catch (error) {
            console.error('Upload invoice error:', error);
            alert('Terjadi kesalahan koneksi saat upload invoice');
        }
    };

    const handleDeleteAllHistory = async () => {
        const confirmDelete = window.confirm("Apakah Anda yakin ingin menghapus semua riwayat pemesanan? Tindakan ini tidak dapat dibatalkan.");
        if (!confirmDelete) return;

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/orders`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                alert('Semua riwayat pemesanan berhasil dihapus');
                fetchData();
            } else {
                alert('Gagal menghapus riwayat: ' + data.message);
            }
        } catch (error) {
            console.error('Delete all history error:', error);
            alert('Terjadi kesalahan koneksi saat menghapus history');
        }
    };

    const getStatusBadge = (status: string) => {
        const badges: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800',
            paid: 'bg-green-100 text-green-800',
            processing: 'bg-blue-100 text-blue-800',
            on_air: 'bg-purple-100 text-purple-800 border-purple-200',
            completed: 'bg-gray-100 text-gray-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return badges[status] || 'bg-gray-100 text-gray-800';
    };

    // Hitung total slot yang belum dikonfirmasi
    const totalPendingSlots = Object.values(slotSummary).reduce((sum, s) => sum + s.pending, 0);

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
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 font-outfit text-gradient">Admin Panel 911 FM</h1>
                        <p className="text-gray-600">Manajemen semua pesanan iklan radio</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link
                            href="/admin/timeline"
                            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-md"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            Timeline Program
                        </Link>
                    </div>
                </div>

                {/* Alert slot pending */}
                {totalPendingSlots > 0 && (
                    <div className="mb-6 flex items-center gap-3 px-5 py-4 bg-amber-50 border border-amber-200 rounded-2xl">
                        <span className="text-amber-500">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        </span>
                        <p className="text-sm font-bold text-amber-800">
                            Ada <span className="text-amber-600 font-black">{totalPendingSlots} slot jadwal iklan</span> yang belum mendapat jam pasti dari admin. Klik <strong>Detail</strong> pada pesanan untuk mengkonfirmasi.
                        </p>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Total Pesanan</p>
                        <h3 className="text-3xl font-bold mt-1">{stats?.total_orders || 0}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-blue-500 text-sm font-semibold uppercase tracking-wider">Menunggu Bayar</p>
                        <h3 className="text-3xl font-bold mt-1">{stats?.pending_orders || 0}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-green-500 text-sm font-semibold uppercase tracking-wider">Sudah Bayar</p>
                        <h3 className="text-3xl font-bold mt-1">{stats?.paid_orders || 0}</h3>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-[var(--color-primary)] text-sm font-semibold uppercase tracking-wider">Total Pendapatan</p>
                        <h3 className="text-2xl font-bold mt-1 text-gradient">Rp {(stats?.total_revenue || 0).toLocaleString('id-ID')}</h3>
                    </div>
                </div>

                {/* Orders Table */}
                <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                        <h2 className="font-bold text-lg text-gray-800">Semua Pesanan</h2>
                        <div className="flex items-center gap-4">
                            <button onClick={fetchData} className="text-sm text-[var(--color-primary)] font-semibold hover:underline">Refresh</button>
                            {orders.length > 0 && (
                                <button
                                    onClick={handleDeleteAllHistory}
                                    className="text-xs bg-red-50 text-red-600 hover:bg-red-100 font-bold px-3 py-1.5 rounded-lg border border-red-200 transition-all hover:scale-105 active:scale-95 duration-200"
                                >
                                    Hapus Semua History
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                    <th className="px-6 py-4 font-bold">Order ID</th>
                                    <th className="px-6 py-4 font-bold">Pelanggan</th>
                                    <th className="px-6 py-4 font-bold">Paket</th>
                                    <th className="px-6 py-4 font-bold">Total</th>
                                    <th className="px-6 py-4 font-bold">Status</th>
                                    <th className="px-6 py-4 font-bold">Jadwal Siar</th>
                                    <th className="px-6 py-4 font-bold text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {orders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((order) => {
                                    const slotInfo = slotSummary[order.order_id];
                                    return (
                                        <tr key={order.order_id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-xs font-medium text-gray-400">
                                                {order.order_id}
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-gray-900">{order.nama}</p>
                                                <p className="text-xs text-gray-500">{order.email}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium capitalize">{order.paket}</span>
                                                <p className="text-[10px] text-gray-400 uppercase">{order.jenis_materi}</p>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-sm">
                                                Rp {order.total_harga.toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${getStatusBadge(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {slotInfo ? (
                                                    <div className="flex items-center gap-1.5">
                                                        {slotInfo.pending > 0 ? (
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-[10px] font-bold">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse inline-block"></span>
                                                                {slotInfo.pending} belum dikonfirmasi
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 border border-green-200 rounded-lg text-[10px] font-bold">
                                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                                                                {slotInfo.total} terkonfirmasi
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] text-gray-400 italic">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 flex flex-col items-center justify-center gap-2">
                                                <Link href={`/admin/order/${order.order_id}`} className="text-[var(--color-primary)] hover:underline text-xs font-bold block">
                                                    Detail
                                                </Link>
                                                <div className="relative group">
                                                    <input
                                                        type="file"
                                                        id={`invoice-${order.order_id}`}
                                                        accept="application/pdf"
                                                        onChange={(e) => handleUploadInvoice(order.order_id, e)}
                                                        className="hidden"
                                                    />
                                                    <label
                                                        htmlFor={`invoice-${order.order_id}`}
                                                        className="cursor-pointer text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all block text-center max-w-[120px] mx-auto border border-blue-200"
                                                        title={order.invoice_path ? "Upload Ulang Invoice" : "Upload Invoice"}
                                                    >
                                                        {order.invoice_path ? 'Re-Upload Invoice' : 'Upload Invoice'}
                                                    </label>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {orders.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-16 text-center text-gray-400 text-sm">
                                            Belum ada pesanan masuk
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

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
                                    className="p-1 border rounded bg-white disabled:opacity-50 hover:bg-gray-50 transition-colors"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                                </button>

                                {Array.from({ length: Math.ceil(orders.length / itemsPerPage) }, (_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-7 h-7 rounded text-xs font-bold transition-all ${currentPage === i + 1 ? 'bg-[var(--color-primary)] text-white' : 'bg-white border text-gray-600 hover:border-[var(--color-primary)]'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(orders.length / itemsPerPage)))}
                                    disabled={currentPage === Math.ceil(orders.length / itemsPerPage)}
                                    className="p-1 border rounded bg-white disabled:opacity-50 hover:bg-gray-50 transition-colors"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
