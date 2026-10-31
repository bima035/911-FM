'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface Schedule {
    id: number;
    hari: string;
    jam_mulai: string;
    jam_selesai: string;
    judul: string;
    dj: string;
    deskripsi: string;
    thumbnail: string;
    is_dynamic: boolean;
}

interface AdSlot {
    id: number;
    order_id: string;
    tanggal: string;
    jam_user: string;
    jam_pasti: string;
    catatan_admin?: string;
    status: 'pending' | 'confirmed';
    perusahaan: string;
    nama: string;
    paket: string;
}

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const DAYS_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

function formatDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export default function TimelinePage() {
    const { user, token } = useAuth();
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [adSlots, setAdSlots] = useState<AdSlot[]>([]);
    const [loading, setLoading] = useState(true);
    const [adLoading, setAdLoading] = useState(false);
    const [activeDay, setActiveDay] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [activeTab, setActiveTab] = useState<'program' | 'iklan'>('program');

    useEffect(() => {
        const today = DAYS_ID[new Date().getDay()];
        setActiveDay(today);
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        fetchSchedules();
    }, []);

    useEffect(() => {
        if (user && token) {
            fetchMyAdSlots();

            // Realtime polling setiap 10 detik agar terasa "Live"
            const interval = setInterval(() => {
                fetchMyAdSlots();
            }, 10000);

            return () => clearInterval(interval);
        }
    }, [user, token]);

    const fetchSchedules = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/schedules`);
            const result = await response.json();
            if (result.success) setSchedules(result.data);
        } catch (error) {
            console.error('Failed to fetch schedules:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyAdSlots = async () => {
        setAdLoading(true);
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/ad-slots/my`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            const result = await response.json();
            if (result.success) setAdSlots(result.data);
        } catch (error) {
            console.error('Failed to fetch ad slots:', error);
        } finally {
            setAdLoading(false);
        }
    };

    const isLive = (start: string, end: string, day: string) => {
        const today = DAYS_ID[currentTime.getDay()];
        if (today !== day) return false;
        const [startH, startM] = start.split(':').map(Number);
        const [endH, endM] = end.split(':').map(Number);
        const nowH = currentTime.getHours(), nowM = currentTime.getMinutes();
        return (nowH * 60 + nowM) >= (startH * 60 + startM) && (nowH * 60 + nowM) < (endH * 60 + endM);
    };

    const getProgress = (start: string, end: string) => {
        const [startH, startM] = start.split(':').map(Number);
        const [endH, endM] = end.split(':').map(Number);
        const nowH = currentTime.getHours(), nowM = currentTime.getMinutes();
        const total = (endH * 60 + endM) - (startH * 60 + startM);
        const elapsed = (nowH * 60 + nowM) - (startH * 60 + startM);
        return total <= 0 ? 0 : Math.min(Math.max((elapsed / total) * 100, 0), 100);
    };

    const isSlotLive = (slot: AdSlot) => {
        const today = new Date().toISOString().split('T')[0];
        if (slot.tanggal !== today || !slot.jam_pasti) return false;
        const [h, m] = slot.jam_pasti.split(':').map(Number);
        const nowH = currentTime.getHours(), nowM = currentTime.getMinutes();
        const slotMin = h * 60 + m;
        const nowMin = nowH * 60 + nowM;
        // Assume ad lasts 5 mins for live indicator
        return nowMin >= slotMin && nowMin < slotMin + 5;
    };

    const filteredSchedules = schedules.filter(s => s.hari === activeDay);

    const todayStr = new Date().toISOString().split('T')[0];
    const nowTimeStr = currentTime.getHours().toString().padStart(2, '0') + ':' + currentTime.getMinutes().toString().padStart(2, '0');

    const upcomingSlots = adSlots.filter(s => {
        if (s.tanggal > todayStr) return true;
        if (s.tanggal === todayStr) {
            const timeToCompare = s.jam_pasti || s.jam_user.replace('.', ':');
            return timeToCompare >= nowTimeStr;
        }
        return false;
    });
    const pastSlots = adSlots.filter(s => !upcomingSlots.includes(s));

    return (
        <main className="min-h-screen pt-32 pb-20 bg-gray-50 text-gray-900">
            <div className="container max-w-5xl">
                {/* Header */}
                <div className="text-center mb-12 relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[var(--color-primary)]/10 blur-[100px] -z-10 rounded-full"></div>
                    <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-4 border border-primary/20">
                        Live Broadcast Schedule
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black mb-6 font-outfit tracking-tight">
                        Timeline <span className="text-primary">Siar</span>
                    </h1>
                    <div className="flex items-center justify-center gap-2 text-gray-500 font-medium italic text-sm">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                        Realtime synchronization active
                    </div>
                </div>

                {/* Tabs — Glassmorphism style */}
                {user && user.role === 'user' && (
                    <div className="flex justify-center mb-12">
                        <div className="bg-white shadow-md p-1.5 rounded-2xl border border-gray-100 flex gap-1">
                            <button
                                onClick={() => setActiveTab('program')}
                                className={`flex items-center gap-3 px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'program' ? 'bg-primary text-white shadow-xl shadow-primary/30' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                Jadwal Program
                            </button>
                            <button
                                onClick={() => setActiveTab('iklan')}
                                className={`flex items-center gap-3 px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'iklan' ? 'bg-primary text-white shadow-xl shadow-primary/30' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                                Jadwal Iklan Saya
                                {upcomingSlots.length > 0 && (
                                    <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black ${activeTab === 'iklan' ? 'bg-white text-primary' : 'bg-primary text-white'}`}>{upcomingSlots.length}</span>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* === TAB: Program Jadwal === */}
                {activeTab === 'program' && (
                    <>
                        <div className="flex flex-wrap justify-center gap-3 mb-12">
                            {DAYS.map((day) => (
                                <button
                                    key={day}
                                    onClick={() => setActiveDay(day)}
                                    className={`px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                                        activeDay === day
                                            ? 'bg-primary text-white scale-105 shadow-md shadow-primary/20'
                                            : 'bg-white border border-gray-200 text-gray-500 hover:text-gray-955 hover:bg-gray-50 hover:border-gray-300'
                                    }`}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>

                        <div className="relative border-l-2 border-gray-200 ml-6 md:ml-12 pl-10 md:pl-16 space-y-12">
                            {loading ? (
                                <div className="py-20 text-center">
                                    <div className="inline-block w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                </div>
                            ) : filteredSchedules.length > 0 ? (
                                filteredSchedules.map((item) => {
                                    const live = isLive(item.jam_mulai, item.jam_selesai, item.hari);
                                    const progress = getProgress(item.jam_mulai, item.jam_selesai);

                                    return (
                                        <div key={item.id} className={`relative group ${live ? 'scale-[1.02]' : ''} transition-all duration-500`}>
                                            <div className={`absolute -left-[54px] md:-left-[72px] top-0 w-11 h-11 rounded-full flex items-center justify-center border-4 border-gray-50 z-10 ${
                                                live ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-gray-200 text-gray-400'
                                            }`}>
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                            </div>

                                            <div className={`bg-white rounded-3xl border border-gray-100 shadow-md overflow-hidden transition-all duration-500 ${
                                                live ? 'ring-2 ring-primary shadow-xl shadow-primary/5' : 'hover:shadow-lg'
                                            }`}>
                                                <div className="flex flex-col md:flex-row">
                                                    <div className="md:w-64 h-56 md:h-auto relative overflow-hidden shrink-0">
                                                        {item.thumbnail ? (
                                                            <img
                                                                src={item.thumbnail.startsWith('http') ? item.thumbnail : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/uploads/schedules/${item.thumbnail}`}
                                                                alt={item.judul}
                                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-blue-900/10 flex items-center justify-center">
                                                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary/30"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12s4.48 10 10 10c2.25 0 4.33-.74 6-2l4 4"/><path d="M12 18V6"/><path d="M8 10v4"/><path d="M16 10v4"/></svg>
                                                            </div>
                                                        )}
                                                        {live && (
                                                            <div className="absolute top-5 left-5 px-3 py-1 bg-red-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest animate-pulse flex items-center gap-2">
                                                                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                                                On Air Now
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="p-8 flex-1 flex flex-col justify-between">
                                                        <div>
                                                            <div className="flex flex-wrap justify-between items-start mb-4 gap-4">
                                                                <div>
                                                                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">{item.jam_mulai} — {item.jam_selesai}</span>
                                                                    <h3 className="text-2xl md:text-3xl font-black mt-2 font-outfit text-gray-900 tracking-tight">{item.judul}</h3>
                                                                </div>
                                                                <div className="bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Host / DJ</p>
                                                                    <p className="font-bold text-gray-800 text-sm">{item.dj}</p>
                                                                </div>
                                                            </div>
                                                            <p className="text-gray-600 text-sm leading-relaxed mb-8 font-medium">
                                                                {item.deskripsi || 'Program siaran unggulan City Guide 911 FM yang menemani aktivitas harian Anda.'}
                                                            </p>
                                                        </div>

                                                        {live && (
                                                            <div className="space-y-3 mb-8">
                                                                <div className="flex justify-between items-center text-[10px] font-black text-primary uppercase tracking-widest">
                                                                    <span>Progress Siaran</span>
                                                                    <span>{Math.round(progress)}%</span>
                                                                </div>
                                                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                                    <div className="h-full bg-primary rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(0,168,232,0.3)]" style={{ width: `${progress}%` }}></div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="flex gap-4">
                                                            <button className="flex-1 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.03] transition-all flex items-center justify-center gap-2">
                                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z"/></svg>
                                                                Dengarkan Live
                                                            </button>
                                                            <button className="px-6 py-3.5 rounded-2xl bg-white border border-gray-200 text-gray-500 font-black text-[10px] uppercase tracking-widest hover:text-gray-900 hover:bg-gray-50 transition-all">
                                                                Detail Program
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="py-32 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
                                    <h3 className="text-xl font-bold text-gray-400">Jadwal belum tersedia</h3>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* === TAB: Jadwal Iklan Saya === */}
                {activeTab === 'iklan' && (
                    <div className="mt-8">
                        {adLoading && adSlots.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="inline-block w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                            </div>
                        ) : adSlots.length === 0 ? (
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-24 text-center">
                                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-400">
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                                </div>
                                <h3 className="text-2xl font-black text-gray-800 mb-2 tracking-tight">Belum Ada Jadwal Tayang</h3>
                                <p className="text-gray-500 text-sm max-w-md mx-auto leading-relaxed">Iklan Anda akan muncul di sini setelah Admin memproses dan memberikan jam tayang detail secara realtime.</p>
                            </div>
                        ) : (
                            <div className="space-y-12">
                                {upcomingSlots.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-4 mb-8">
                                            <h2 className="text-xl font-black uppercase tracking-[0.2em] text-gray-800 font-outfit">Jadwal Mendatang</h2>
                                            <div className="flex-1 h-px bg-gray-200"></div>
                                        </div>
                                        <div className="space-y-8">
                                            {Object.entries(
                                                upcomingSlots.reduce((acc, s) => {
                                                    (acc[s.tanggal] = acc[s.tanggal] || []).push(s);
                                                    return acc;
                                                }, {} as Record<string, AdSlot[]>)
                                            ).sort(([a], [b]) => a.localeCompare(b)).map(([tanggal, daySlots]) => (
                                                <div key={tanggal}>
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <div className="px-4 py-2 bg-primary rounded-xl text-[10px] font-black text-white uppercase tracking-widest shadow-lg shadow-primary/20">
                                                            {new Date(tanggal + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                                                        </div>
                                                        <div className="flex-1 h-px bg-gray-200"></div>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                                        {daySlots.sort((a, b) => (a.jam_pasti || '').localeCompare(b.jam_pasti || '')).map(slot => {
                                                            const live = isSlotLive(slot);
                                                            return (
                                                                <div key={slot.id} className={`group bg-white rounded-3xl p-6 border transition-all duration-300 hover:scale-[1.03] shadow-md ${live ? 'border-red-500 bg-red-50/50 shadow-[0_0_30px_rgba(239,68,68,0.1)]' : 'border-gray-100 hover:border-primary/50 hover:shadow-lg'}`}>
                                                                    <div className="flex justify-between items-start mb-6">
                                                                        <div className="bg-gray-50 border border-gray-100 px-3 py-1 rounded-lg text-[9px] font-black text-gray-500 uppercase tracking-widest">{slot.paket}</div>
                                                                        {live && (
                                                                            <div className="flex items-center gap-2">
                                                                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                                                                <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">On Air</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-end gap-3 mb-6">
                                                                        <span className="text-4xl font-black text-gray-800 leading-none tracking-tighter">{slot.jam_pasti}</span>
                                                                        <span className="text-xs text-gray-400 font-semibold mb-1 line-through">{slot.jam_user}</span>
                                                                    </div>
                                                                    
                                                                    <div className="space-y-4">
                                                                        <div>
                                                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Brand / Perusahaan</p>
                                                                            <p className="font-black text-gray-800 text-base truncate tracking-tight">{slot.perusahaan || slot.nama}</p>
                                                                        </div>
                                                                        
                                                                        {slot.catatan_admin && (
                                                                            <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-100">
                                                                                <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-1">Catatan Admin:</p>
                                                                                <p className="text-xs text-emerald-800 italic leading-relaxed font-medium">"{slot.catatan_admin}"</p>
                                                                            </div>
                                                                        )}
                                                                        
                                                                        <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                                                            <span className="text-[10px] font-mono text-gray-400">ORD-{slot.order_id.slice(-6)}</span>
                                                                            <button className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline">Download Invoice</button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style jsx global>{`
                .live-glow {
                    box-shadow: 0 0 40px rgba(0, 168, 232, 0.2);
                    animation: pulse-glow 2s infinite ease-in-out;
                }
                @keyframes pulse-glow {
                    0% { box-shadow: 0 0 20px rgba(0, 168, 232, 0.1); }
                    50% { box-shadow: 0 0 50px rgba(0, 168, 232, 0.3); }
                    100% { box-shadow: 0 0 20px rgba(0, 168, 232, 0.1); }
                }
                .font-outfit {
                    font-family: 'Outfit', sans-serif;
                }
                .text-primary { color: var(--color-primary); }
                .bg-primary { background-color: var(--color-primary); }
                .border-primary { border-color: var(--color-primary); }
            `}</style>
        </main>
    );
}
