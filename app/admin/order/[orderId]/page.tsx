'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';
import Modal from '@/components/UI/Modal';

interface Order {
    order_id: string;
    nama: string;
    email: string;
    telepon: string;
    perusahaan?: string;
    paket: string;
    total_harga: number;
    status: string;
    jenis_materi: string;
    script_text?: string;
    file_audio_name?: string;
    file_audio_path?: string;
    voice_preference?: string;
    music_preference?: string;
    catatan?: string;
    created_at: string;
    paid_at?: string;
    payment_method?: string;
}

interface AdSlot {
    id: number;
    order_id: string;
    tanggal: string;
    jam_user: string;
    jam_pasti: string | null;
    status: 'pending' | 'confirmed';
}

export default function AdminOrderDetailPage() {
    const { user, token, isLoading: authLoading } = useAuth();
    const { orderId } = useParams();
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [nextStatus, setNextStatus] = useState('');
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [adSlots, setAdSlots] = useState<AdSlot[]>([]);
    const [editingSlotId, setEditingSlotId] = useState<number | null>(null);
    const [editJamPasti, setEditJamPasti] = useState('');
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [bulkOffsetMenit, setBulkOffsetMenit] = useState(5);
    const [bulkCatatan, setBulkCatatan] = useState('');
    const [isBulkConfirming, setIsBulkConfirming] = useState(false);
    const [newProgram, setNewProgram] = useState({
        order_id: '',
        hari: 'Senin',
        jam_mulai: '08:00',
        jam_selesai: '10:00',
        judul: '',
        dj: '',
        thumbnail: '',
        deskripsi: '',
        is_dynamic: 0
    });
    const { showToast } = useToast();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading) {
            if (!user || user.role !== 'admin') {
                router.push('/login');
                return;
            }
            fetchOrder();
            fetchAdSlots();
        }
    }, [user, token, authLoading, orderId]);

    const fetchOrder = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/orders/${orderId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setOrder(data.data);
                // Pre-fill schedule form
                setNewProgram(prev => ({
                    ...prev,
                    order_id: orderId as string,
                    judul: data.data.perusahaan || data.data.nama,
                    deskripsi: `Iklan untuk ${data.data.perusahaan || data.data.nama} (${data.data.paket.toUpperCase()})`
                }));
            } else {
                showToast('Gagal memuat detail pesanan', 'error');
                router.push('/admin');
            }
        } catch (error) {
            console.error('Error fetching order detail:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAdSlots = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/ad-slots/order/${orderId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setAdSlots(data.data);
        } catch (error) {
            console.error('Error fetching ad slots:', error);
        }
    };

    const handleConfirmSlot = async (slotId: number, jamPasti: string) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/ad-slots/${slotId}/confirm`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ jam_pasti: jamPasti }),
            });
            const data = await res.json();
            if (data.success) {
                showToast(`Jam pasti ${jamPasti} berhasil disimpan!`, 'success');
                setEditingSlotId(null);
                fetchAdSlots();
            } else {
                showToast(data.message || 'Gagal', 'error');
            }
        } catch {
            showToast('Terjadi kesalahan', 'error');
        }
    };

    const handleBulkConfirm = async () => {
        setIsBulkConfirming(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/ad-slots/order/${orderId}/confirm-all`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ offset_menit: bulkOffsetMenit, catatan_admin: bulkCatatan }),
            });
            const data = await res.json();
            if (data.success) {
                showToast(`${data.data.count} slot berhasil dikonfirmasi!`, 'success');
                setShowBulkModal(false);
                fetchAdSlots();
            } else {
                showToast(data.message || 'Gagal', 'error');
            }
        } catch {
            showToast('Terjadi kesalahan koneksi', 'error');
        } finally {
            setIsBulkConfirming(false);
        }
    };

    const initiateStatusChange = (status: string) => {
        setNextStatus(status);
        setShowConfirmModal(true);
    };

    const handleAddProgram = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/schedules`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newProgram)
            });
            const data = await res.json();
            
            if (data.success) {
                // Update status to on_air
                await fetch(`${apiUrl}/api/orders/${orderId}/status`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ status: 'on_air' })
                });

                showToast('Jadwal iklan berhasil ditetapkan!', 'success');
                setShowScheduleModal(false);
                fetchOrder(); // Refresh data
            } else {
                showToast(data.message, 'error');
            }
        } catch (error) {
            showToast('Gagal menambahkan jadwal', 'error');
        }
    };

    const handleStatusChange = async () => {
        setShowConfirmModal(false);
        setIsUpdating(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: nextStatus })
            });
            const data = await res.json();
            if (data.success) {
                setOrder(prev => prev ? { ...prev, status: nextStatus } : null);
                showToast(`Status berhasil diupdate ke ${nextStatus.toUpperCase()}`, 'success');
            } else {
                showToast('Gagal update status: ' + data.message, 'error');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            showToast('Terjadi kesalahan koneksi', 'error');
        } finally {
            setIsUpdating(false);
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

    if (!order) return null;

    return (
        <div className="min-h-screen pt-32 pb-20 bg-gray-50">
            <div className="container max-w-5xl">
                <div className="mb-8 flex items-center gap-4">
                    <Link href="/admin" className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-all text-gray-600">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 font-outfit uppercase">Detail Pesanan {order.order_id}</h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="card shadow-xl border-0 overflow-hidden">
                            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 font-bold text-gray-800">Materi Iklan</div>
                            <div className="p-6">
                                {order.jenis_materi === 'file' ? (
                                    <div className="space-y-4">
                                        <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">File Audio</p>
                                        <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                            <div className="text-3xl text-blue-500">🎵</div>
                                            <div className="flex-1">
                                                <p className="font-bold text-blue-900">{order.file_audio_name}</p>
                                                <a
                                                    href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/uploads/audio/${order.file_audio_path?.split('\\').pop()}`}
                                                    target="_blank"
                                                    className="text-xs text-blue-600 font-bold hover:underline"
                                                >Download File</a>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Script Iklan</p>
                                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 whitespace-pre-wrap italic text-gray-700">
                                            "{order.script_text}"
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mt-4">
                                            <div className="p-3 bg-white rounded-lg border border-gray-100">
                                                <p className="text-[10px] text-gray-400 uppercase font-bold">Suara</p>
                                                <p className="font-bold capitalize">{order.voice_preference || 'Default'}</p>
                                            </div>
                                            <div className="p-3 bg-white rounded-lg border border-gray-100">
                                                <p className="text-[10px] text-gray-400 uppercase font-bold">Musik</p>
                                                <p className="font-bold capitalize">{order.music_preference || 'Default'}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {order.catatan && (
                                    <div className="mt-8 pt-6 border-t border-gray-100">
                                        <p className="text-sm text-gray-500 uppercase font-bold tracking-wider mb-2">Catatan Admin/Instruksi</p>
                                        <p className="text-gray-700">{order.catatan}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="card shadow-xl border-0 overflow-hidden">
                            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 font-bold text-gray-800">Detail Pelanggan</div>
                            <div className="p-6 grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold">Nama</p>
                                    <p className="font-bold">{order.nama}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold">Email</p>
                                    <p className="font-bold">{order.email}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold">Telepon</p>
                                    <p className="font-bold">{order.telepon}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold">Perusahaan</p>
                                    <p className="font-bold">{order.perusahaan || '-'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Jadwal Iklan User */}
                        {adSlots.length > 0 && (() => {
                            const pendingSlots = adSlots.filter(s => s.status === 'pending');
                            const confirmedSlots = adSlots.filter(s => s.status === 'confirmed');
                            return (
                                <div className="card shadow-xl border-0 overflow-hidden">
                                    {/* Card Header */}
                                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                                        <div>
                                            <h3 className="font-bold text-gray-800">Jadwal Pilihan User</h3>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                <span className="text-green-600 font-bold">{confirmedSlots.length}</span> dikonfirmasi · <span className={`font-bold ${pendingSlots.length > 0 ? 'text-amber-600' : 'text-gray-400'}`}>{pendingSlots.length}</span> menunggu
                                            </p>
                                        </div>
                                        {pendingSlots.length > 0 && (
                                            <button
                                                onClick={() => setShowBulkModal(true)}
                                                className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all shadow-md"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                                                Konfirmasi Massal ({pendingSlots.length})
                                            </button>
                                        )}
                                    </div>

                                    {/* Legend */}
                                    <div className="px-6 pt-4 pb-2 flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>Jam User</span>
                                        <span>→</span>
                                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>Jam Pasti (Admin)</span>
                                    </div>

                                    {/* Slot list */}
                                    <div className="p-4 space-y-2 max-h-[480px] overflow-y-auto">
                                        {adSlots.map(slot => (
                                            <div key={slot.id} className={`rounded-xl border-2 transition-all ${slot.status === 'confirmed' ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                                                <div className="flex items-center gap-3 p-3">
                                                    {/* Tanggal */}
                                                    <div className="flex-shrink-0 w-16 text-center bg-white rounded-lg p-2 shadow-sm border border-gray-100">
                                                        <p className="text-[9px] font-bold text-gray-400 uppercase">{new Date(slot.tanggal + 'T00:00:00').toLocaleDateString('id-ID', { month: 'short' })}</p>
                                                        <p className="text-xl font-black text-gray-800 leading-tight">{new Date(slot.tanggal + 'T00:00:00').getDate()}</p>
                                                        <p className="text-[9px] font-bold text-gray-400">{new Date(slot.tanggal + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'short' })}</p>
                                                    </div>

                                                    {/* Jam user */}
                                                    <div className="flex-shrink-0 text-center">
                                                        <p className="text-[10px] font-bold text-amber-600 uppercase mb-0.5">Pilihan User</p>
                                                        <p className="text-lg font-black text-gray-700">{slot.jam_user}</p>
                                                    </div>

                                                    {/* Arrow */}
                                                    <div className="text-gray-300">
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                                                    </div>

                                                    {/* Jam pasti / Edit */}
                                                    <div className="flex-1">
                                                        {editingSlotId === slot.id ? (
                                                            <div className="flex items-center gap-2">
                                                                <div>
                                                                    <p className="text-[10px] font-bold text-[var(--color-primary)] uppercase mb-1">Jam Pasti</p>
                                                                    <input
                                                                        type="time"
                                                                        value={editJamPasti}
                                                                        onChange={e => setEditJamPasti(e.target.value)}
                                                                        className="px-3 py-1.5 border-2 border-[var(--color-primary)] rounded-lg text-sm font-bold outline-none bg-white"
                                                                    />
                                                                </div>
                                                                <button onClick={() => handleConfirmSlot(slot.id, editJamPasti)} className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600 mt-5">
                                                                    ✓ Simpan
                                                                </button>
                                                                <button onClick={() => setEditingSlotId(null)} className="px-2 py-1.5 text-gray-400 text-xs font-bold hover:text-gray-600 mt-5">
                                                                    ✕
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div>
                                                                <p className="text-[10px] font-bold text-green-600 uppercase mb-0.5">Jam Pasti Admin</p>
                                                                {slot.jam_pasti ? (
                                                                    <p className="text-lg font-black text-green-700">{slot.jam_pasti}</p>
                                                                ) : (
                                                                    <p className="text-sm text-amber-500 italic font-medium">Belum dikonfirmasi</p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Status badge + action */}
                                                    <div className="flex flex-col items-end gap-2">
                                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${slot.status === 'confirmed' ? 'bg-green-200 text-green-800' : 'bg-amber-200 text-amber-800'}`}>
                                                            {slot.status === 'confirmed' ? '✓ Confirmed' : 'Pending'}
                                                        </span>
                                                        <button
                                                            onClick={() => { setEditingSlotId(slot.id); setEditJamPasti(slot.jam_pasti || slot.jam_user.replace('.', ':')); }}
                                                            className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${slot.status === 'confirmed' ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200' : 'bg-[var(--color-primary)] text-white hover:opacity-90 shadow-sm'}`}
                                                        >
                                                            {slot.status === 'confirmed' ? 'Edit' : 'Atur Jam'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}

                    </div>

                    {/* Sidebar Actions */}
                    <div className="space-y-6">
                        <div className="card shadow-xl border-0 overflow-hidden">
                            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 font-bold text-gray-800">Status & Pembayaran</div>
                            <div className="p-6 space-y-4">
                                <div className="text-center pb-4 border-b border-gray-100">
                                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-2">Status Saat Ini</p>
                                    <span className={`px-4 py-2 rounded-full text-sm font-bold border ${getStatusBadge(order.status)}`}>
                                        {order.status.toUpperCase()}
                                    </span>
                                </div>

                                <div className="py-4 space-y-4">
                                    <p className="text-[10px] text-gray-400 uppercase font-bold">Ubah Status</p>
                                    <div className="grid grid-cols-1 gap-2">
                                        {['paid', 'processing', 'on_air', 'completed', 'cancelled', 'expired'].map((statusOption) => (
                                            <button
                                                key={statusOption}
                                                disabled={isUpdating || order.status === statusOption}
                                                onClick={() => initiateStatusChange(statusOption)}
                                                className={`text-left px-4 py-3 rounded-xl border text-sm font-bold transition-all ${order.status === statusOption
                                                    ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-default'
                                                    : 'bg-white border-gray-200 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] text-gray-700'
                                                    }`}
                                            >
                                                {statusOption.replace('_', ' ').toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
                                    <div className="text-center">
                                        <p className="text-xl font-bold text-gradient">Rp {order.total_harga.toLocaleString('id-ID')}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Paket: {order.paket}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <p className="text-[10px] text-gray-400 uppercase font-bold mb-4">Informasi Transaksi</p>
                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Metode</span>
                                    <span className="font-bold capitalize">{order.payment_method || 'Menunggu'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Waktu Bayar</span>
                                    <span className="font-bold text-right">{order.paid_at ? new Date(order.paid_at).toLocaleString('id-ID') : '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Dipesan</span>
                                    <span className="font-bold text-right">{new Date(order.created_at).toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                title="Konfirmasi Update Status"
                footer={
                    <>
                        <button
                            onClick={() => setShowConfirmModal(false)}
                            className="px-6 py-2 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleStatusChange}
                            className="px-6 py-2 rounded-xl font-bold bg-[var(--color-primary)] text-white hover:scale-105 transition-all shadow-lg shadow-red-500/20"
                        >
                            Ya, Update Status
                        </button>
                    </>
                }
            >
                <div className="text-center">
                    <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-100">
                        <span className="text-4xl">⚠️</span>
                    </div>
                    <p className="text-gray-600 leading-relaxed text-lg">
                        Apakah Anda yakin ingin mengubah status pesanan iklan ini menjadi <strong className="text-gray-900 uppercase font-black">{nextStatus.replace('_', ' ')}</strong>?
                    </p>
                    <p className="text-sm text-gray-400 mt-4 italic">
                        Perubahan status akan langsung terlihat oleh pelanggan di dashboard mereka.
                    </p>
                </div>
            </Modal>
            <Modal
                isOpen={showScheduleModal}
                onClose={() => setShowScheduleModal(false)}
                maxSize="max-w-xl"
            >
                <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-black text-gray-900 font-outfit uppercase">Tambah Jadwal Baru</h2>
                        <button onClick={() => setShowScheduleModal(false)} className="text-gray-400 hover:text-gray-600 transition-all">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="p-4 bg-yellow-50 border border-yellow-100 rounded-2xl">
                            <label className="text-[10px] font-black text-yellow-600 uppercase tracking-widest mb-1 block">Finalisasi Pesanan Iklan</label>
                            <p className="text-sm font-black text-yellow-900 leading-none">{order.order_id}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Hari</label>
                                <select 
                                    value={newProgram.hari}
                                    onChange={(e) => setNewProgram({...newProgram, hari: e.target.value})}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-[#00AEEF] transition-all outline-none appearance-none"
                                >
                                    {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Mulai</label>
                                <input 
                                    type="time" 
                                    value={newProgram.jam_mulai}
                                    onChange={(e) => setNewProgram({...newProgram, jam_mulai: e.target.value})}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-[#00AEEF] outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Selesai</label>
                                <input 
                                    type="time" 
                                    value={newProgram.jam_selesai}
                                    onChange={(e) => setNewProgram({...newProgram, jam_selesai: e.target.value})}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-[#00AEEF] outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Judul Program / Brand</label>
                            <input 
                                type="text" 
                                placeholder="Contoh: Morning Spirit"
                                value={newProgram.judul}
                                onChange={(e) => setNewProgram({...newProgram, judul: e.target.value})}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-[#00AEEF] outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Penyiar (DJ)</label>
                            <input 
                                type="text" 
                                placeholder="Nama Penyiar"
                                value={newProgram.dj}
                                onChange={(e) => setNewProgram({...newProgram, dj: e.target.value})}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-[#00AEEF] outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">URL Thumbnail (Opsional)</label>
                            <input 
                                type="text" 
                                placeholder="https://example.com/image.jpg"
                                value={newProgram.thumbnail}
                                onChange={(e) => setNewProgram({...newProgram, thumbnail: e.target.value})}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-[#00AEEF] outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Deskripsi</label>
                            <textarea 
                                placeholder="Ringkasan isi siaran..."
                                rows={3}
                                value={newProgram.deskripsi}
                                onChange={(e) => setNewProgram({...newProgram, deskripsi: e.target.value})}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-[#00AEEF] outline-none resize-none"
                            />
                        </div>

                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input 
                                type="checkbox" 
                                checked={newProgram.is_dynamic === 1}
                                onChange={(e) => setNewProgram({...newProgram, is_dynamic: e.target.checked ? 1 : 0})}
                                className="hidden"
                            />
                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${newProgram.is_dynamic === 1 ? 'bg-[#00AEEF] border-[#00AEEF]' : 'border-gray-200 group-hover:border-[#00AEEF]'}`}>
                                {newProgram.is_dynamic === 1 && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                            </div>
                            <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900 transition-colors">Dynamic Slot (Program Pendek)</span>
                        </label>

                        <div className="flex gap-4 pt-4">
                            <button 
                                onClick={() => setShowScheduleModal(false)}
                                className="flex-1 py-4 px-6 rounded-2xl border-2 border-gray-100 text-gray-500 font-black text-sm uppercase tracking-widest hover:bg-gray-50 transition-all"
                            >
                                Batal
                            </button>
                            <button 
                                onClick={handleAddProgram}
                                className="flex-1 py-4 px-6 rounded-2xl bg-[#00AEEF] text-white font-black text-sm uppercase tracking-widest hover:bg-blue-500 shadow-lg shadow-blue-200 transition-all"
                            >
                                Simpan Jadwal
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Modal Konfirmasi Massal Jam Pasti */}
            <Modal
                isOpen={showBulkModal}
                onClose={() => setShowBulkModal(false)}
                title="Konfirmasi Massal Jam Pasti"
                footer={
                    <>
                        <button
                            onClick={() => setShowBulkModal(false)}
                            className="px-6 py-2 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleBulkConfirm}
                            disabled={isBulkConfirming}
                            className="px-6 py-2 rounded-xl font-bold bg-[var(--color-primary)] text-white hover:opacity-90 transition-all shadow-lg disabled:opacity-60"
                        >
                            {isBulkConfirming ? 'Menyimpan...' : `Konfirmasi ${adSlots.filter(s => s.status === 'pending').length} Slot`}
                        </button>
                    </>
                }
            >
                <div className="space-y-6 py-2">
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                        <p className="text-sm text-blue-800 font-medium leading-relaxed">
                            Fitur ini akan mengkonfirmasi <strong>semua slot yang belum dikonfirmasi</strong> sekaligus dengan menambahkan offset menit ke jam yang dipilih user.
                        </p>
                        <p className="text-xs text-blue-600 mt-2 font-medium">
                            Contoh: User pilih <strong>09:00</strong>, offset <strong>+5 menit</strong> → jam pasti = <strong>09:05</strong>
                        </p>
                    </div>

                    <div>
                        <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-2">
                            Offset Waktu (menit)
                        </label>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setBulkOffsetMenit(v => Math.max(0, v - 1))}
                                className="w-9 h-9 rounded-xl border-2 border-gray-200 flex items-center justify-center font-black text-gray-600 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all"
                            >−</button>
                            <input
                                type="number"
                                value={bulkOffsetMenit}
                                onChange={e => setBulkOffsetMenit(parseInt(e.target.value) || 0)}
                                min={0}
                                max={59}
                                className="w-20 text-center px-3 py-2 border-2 border-gray-200 rounded-xl text-lg font-black outline-none focus:border-[var(--color-primary)]"
                            />
                            <button
                                onClick={() => setBulkOffsetMenit(v => Math.min(59, v + 1))}
                                className="w-9 h-9 rounded-xl border-2 border-gray-200 flex items-center justify-center font-black text-gray-600 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all"
                            >+</button>
                            <span className="text-sm text-gray-500 font-medium">menit setelah jam pilihan user</span>
                        </div>
                        <div className="mt-3 flex gap-2">
                            {[0, 5, 10, 15, 30].map(v => (
                                <button
                                    key={v}
                                    onClick={() => setBulkOffsetMenit(v)}
                                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${bulkOffsetMenit === v ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-[var(--color-primary)]'}`}
                                >
                                    +{v} mnt
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-2">
                            Catatan untuk User (Opsional)
                        </label>
                        <textarea
                            value={bulkCatatan}
                            onChange={e => setBulkCatatan(e.target.value)}
                            placeholder="Contoh: Iklan akan ditayangkan setelah opening program selesai."
                            rows={3}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-[var(--color-primary)] resize-none"
                        />
                    </div>

                    {/* Preview */}
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                        <p className="text-xs font-black text-gray-400 uppercase mb-2">Preview Hasil</p>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                            {adSlots.filter(s => s.status === 'pending').slice(0, 5).map(slot => {
                                const [h, m] = slot.jam_user.replace('.', ':').split(':').map(Number);
                                const totalM = h * 60 + (m || 0) + bulkOffsetMenit;
                                const jamFinal = `${String(Math.floor(totalM / 60) % 24).padStart(2, '0')}:${String(totalM % 60).padStart(2, '0')}`;
                                return (
                                    <div key={slot.id} className="flex items-center gap-2 text-sm">
                                        <span className="text-gray-500">{slot.tanggal}</span>
                                        <span className="text-amber-600 font-bold">{slot.jam_user}</span>
                                        <span className="text-gray-400">→</span>
                                        <span className="text-green-600 font-black">{jamFinal}</span>
                                    </div>
                                );
                            })}
                            {adSlots.filter(s => s.status === 'pending').length > 5 && (
                                <p className="text-xs text-gray-400 italic">...dan {adSlots.filter(s => s.status === 'pending').length - 5} slot lainnya</p>
                            )}
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
