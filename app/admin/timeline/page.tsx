'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';

interface Schedule {
    id?: number;
    hari: string;
    jam_mulai: string;
    jam_selesai: string;
    judul: string;
    dj: string;
    deskripsi: string;
    thumbnail: string;
    is_dynamic: boolean;
}

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

export default function AdminTimelinePage() {
    const { user, token, isLoading: authLoading } = useAuth();
    const { showToast } = useToast();
    const router = useRouter();

    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<Schedule>({
        hari: 'Senin',
        jam_mulai: '08:00',
        jam_selesai: '10:00',
        judul: '',
        dj: '',
        deskripsi: '',
        thumbnail: '',
        is_dynamic: false
    });

    useEffect(() => {
        if (!authLoading) {
            if (!user || user.role !== 'admin') {
                router.push('/login');
                return;
            }
            fetchSchedules();
        }
    }, [user, authLoading]);

    const fetchSchedules = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/schedules`);
            const data = await res.json();
            if (data.success) {
                setSchedules(data.data);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            showToast('Gagal memuat jadwal', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = editingId ? 'PATCH' : 'POST';
            const url = editingId 
                ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/schedules/${editingId}`
                : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/schedules`;

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (data.success) {
                showToast(editingId ? 'Jadwal diupdate' : 'Jadwal ditambahkan', 'success');
                setIsModalOpen(false);
                setEditingId(null);
                setFormData({
                    hari: 'Senin',
                    jam_mulai: '08:00',
                    jam_selesai: '10:00',
                    judul: '',
                    dj: '',
                    deskripsi: '',
                    thumbnail: '',
                    is_dynamic: false
                });
                fetchSchedules();
            } else {
                showToast(data.message, 'error');
            }
        } catch (error) {
            showToast('Terjadi kesalahan', 'error');
        }
    };

    const handleEdit = (schedule: Schedule) => {
        setEditingId(schedule.id!);
        setFormData({ ...schedule });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Yakin ingin menghapus jadwal ini?')) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/schedules/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                showToast('Jadwal dihapus', 'success');
                fetchSchedules();
            }
        } catch (error) {
            showToast('Gagal menghapus', 'error');
        }
    };

    if (authLoading || isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen pt-32 pb-20 bg-gray-50">
            <div className="container">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 font-outfit">Manajemen Timeline Siar</h1>
                        <p className="text-gray-600">Atur jadwal siaran radio City Guide 911 FM</p>
                    </div>
                    <button 
                        onClick={() => {
                            setEditingId(null);
                            setFormData({
                                hari: 'Senin',
                                jam_mulai: '08:00',
                                jam_selesai: '10:00',
                                judul: '',
                                dj: '',
                                deskripsi: '',
                                thumbnail: '',
                                is_dynamic: false
                            });
                            setIsModalOpen(true);
                        }}
                        className="btn btn-primary px-6 flex items-center gap-2"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Tambah Jadwal
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-bold">
                                    <th className="px-6 py-4">Hari / Waktu</th>
                                    <th className="px-6 py-4">Program</th>
                                    <th className="px-6 py-4">Penyiar (DJ)</th>
                                    <th className="px-6 py-4">Dynamic</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {schedules.length > 0 ? schedules.map((s) => (
                                    <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">{s.hari}</div>
                                            <div className="text-xs text-[var(--color-primary)] font-bold">{s.jam_mulai} - {s.jam_selesai}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">{s.judul}</div>
                                            <div className="text-xs text-gray-400 truncate max-w-xs">{s.deskripsi}</div>
                                        </td>
                                        <td className="px-6 py-4 font-medium">{s.dj}</td>
                                        <td className="px-6 py-4">
                                            {s.is_dynamic ? (
                                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold uppercase">Dynamic</span>
                                            ) : (
                                                <span className="text-gray-300">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-3">
                                            <button onClick={() => handleEdit(s)} className="text-blue-500 hover:underline font-bold text-sm">Edit</button>
                                            <button onClick={() => handleDelete(s.id!)} className="text-red-500 hover:underline font-bold text-sm">Hapus</button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400">Belum ada data jadwal siaran.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-in">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold font-outfit">{editingId ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Hari</label>
                                    <select 
                                        value={formData.hari}
                                        onChange={e => setFormData({...formData, hari: e.target.value})}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                                    >
                                        {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Mulai</label>
                                        <input 
                                            type="time" 
                                            value={formData.jam_mulai}
                                            onChange={e => setFormData({...formData, jam_mulai: e.target.value})}
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Selesai</label>
                                        <input 
                                            type="time" 
                                            value={formData.jam_selesai}
                                            onChange={e => setFormData({...formData, jam_selesai: e.target.value})}
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Judul Program</label>
                                <input 
                                    type="text" 
                                    value={formData.judul}
                                    onChange={e => setFormData({...formData, judul: e.target.value})}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none"
                                    placeholder="Contoh: Morning Spirit"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Penyiar (DJ)</label>
                                <input 
                                    type="text" 
                                    value={formData.dj}
                                    onChange={e => setFormData({...formData, dj: e.target.value})}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none"
                                    placeholder="Nama Penyiar"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">URL Thumbnail (Opsional)</label>
                                <input 
                                    type="text" 
                                    value={formData.thumbnail}
                                    onChange={e => setFormData({...formData, thumbnail: e.target.value})}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none"
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Deskripsi</label>
                                <textarea 
                                    value={formData.deskripsi}
                                    onChange={e => setFormData({...formData, deskripsi: e.target.value})}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none h-20 resize-none"
                                    placeholder="Ringkasan isi siaran..."
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    id="is_dynamic"
                                    checked={formData.is_dynamic}
                                    onChange={e => setFormData({...formData, is_dynamic: e.target.checked})}
                                    className="w-4 h-4 text-[var(--color-primary)] rounded focus:ring-[var(--color-primary)]"
                                />
                                <label htmlFor="is_dynamic" className="text-sm font-bold text-gray-600 cursor-pointer">Dynamic Slot (Program Pendek)</label>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 px-4 rounded-xl border border-gray-200 font-bold text-gray-500 hover:bg-gray-50 transition-colors">Batal</button>
                                <button type="submit" className="flex-1 py-3 px-4 rounded-xl bg-[var(--color-primary)] text-white font-bold shadow-lg shadow-[var(--color-primary)]/20 hover:scale-105 active:scale-95 transition-all">
                                    {editingId ? 'Update Jadwal' : 'Simpan Jadwal'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
