'use client';

import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function ProfilePage() {
    const { user, login, token, logout, isLoading: authLoading } = useAuth();
    const { showToast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const isIncomplete = searchParams.get('incomplete') === 'true';

    const [isEditing, setIsEditing] = useState(false);
    const [nama, setNama] = useState('');
    const [username, setUsername] = useState('');
    const [telepon, setTelepon] = useState('');
    const [namaPerusahaan, setNamaPerusahaan] = useState('');
    const [jenisUsaha, setJenisUsaha] = useState('');
    const [alamatPerusahaan, setAlamatPerusahaan] = useState('');
    const [mediaSosial, setMediaSosial] = useState('');
    const [customJenisUsaha, setCustomJenisUsaha] = useState('');
    const [isOtherSelected, setIsOtherSelected] = useState(false);
    const [password, setPassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (user) {
            setNama(user.nama || '');
            setUsername(user.username || '');
            setTelepon(user.telepon || '');
            setNamaPerusahaan(user.nama_perusahaan || '');
            setAlamatPerusahaan(user.alamat_perusahaan || '');
            setMediaSosial(user.media_sosial || '');

            const presetKategori = ['Kuliner', 'Jasa', 'Event', 'Otomotif', 'Retail', 'Kesehatan'];
            if (user.jenis_usaha && !presetKategori.includes(user.jenis_usaha)) {
                setJenisUsaha('Lainnya');
                setCustomJenisUsaha(user.jenis_usaha);
                setIsOtherSelected(true);
            } else {
                setJenisUsaha(user.jenis_usaha || '');
                setCustomJenisUsaha('');
                setIsOtherSelected(false);
            }
        }
    }, [user, authLoading, router]);

    const handleLogout = () => {
        logout();
        showToast('Anda telah berhasil keluar.', 'info');
        router.push('/');
    };

    const [fotoProfilFile, setFotoProfilFile] = useState<File | null>(null);
    const [fotoPreview, setFotoPreview] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFotoProfilFile(file);
            setFotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        if (!nama) {
            showToast('Nama tidak boleh kosong', 'error');
            return;
        }

        setIsSaving(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

            const formData = new FormData();
            formData.append('nama', nama);
            formData.append('username', username);
            formData.append('telepon', telepon);
            formData.append('nama_perusahaan', namaPerusahaan);
            formData.append('jenis_usaha', jenisUsaha === 'Lainnya' ? customJenisUsaha : jenisUsaha);
            formData.append('alamat_perusahaan', alamatPerusahaan);
            formData.append('media_sosial', mediaSosial);
            if (password) formData.append('password', password);
            if (fotoProfilFile) formData.append('foto_profil', fotoProfilFile);

            const res = await fetch(`${apiUrl}/api/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            const result = await res.json();
            if (result.success) {
                showToast('Profil berhasil diperbarui!', 'success');
                setIsEditing(false);
                setPassword('');
                setFotoProfilFile(null);
                if (token) {
                    login(token, result.user);
                }
            } else {
                showToast(result.message || 'Gagal menyimpan profil', 'error');
            }
        } catch (error) {
            showToast('Terjadi kesalahan koneksi', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    if (authLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-20 bg-gray-50 flex flex-col items-center">
            <div className="w-full max-w-3xl px-4 sm:px-6 lg:px-8">
                <div className="mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 font-outfit">Profil Saya</h1>
                        <p className="mt-2 text-gray-600">Informasi data diri Anda yang disimpan dalam sistem kami</p>
                    </div>
                    <div>
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                Edit Profil
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setNama(user.nama);
                                        setUsername(user.username || '');
                                        setTelepon(user.telepon || '');
                                        setNamaPerusahaan(user.nama_perusahaan || '');
                                        setAlamatPerusahaan(user.alamat_perusahaan || '');
                                        setMediaSosial(user.media_sosial || '');

                                        const presetKategori = ['Kuliner', 'Jasa', 'Event', 'Otomotif', 'Retail', 'Kesehatan'];
                                        if (user.jenis_usaha && !presetKategori.includes(user.jenis_usaha)) {
                                            setJenisUsaha('Lainnya');
                                            setCustomJenisUsaha(user.jenis_usaha);
                                            setIsOtherSelected(true);
                                        } else {
                                            setJenisUsaha(user.jenis_usaha || '');
                                            setCustomJenisUsaha('');
                                            setIsOtherSelected(false);
                                        }
                                    }}
                                    className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-bold text-gray-700 hover:bg-gray-50"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-xl text-sm font-bold hover:opacity-90 flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    {isIncomplete && (
                        <div className="bg-amber-50 border-b border-amber-100 p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-amber-900">Profil Perlu Dilengkapi</p>
                                    <p className="text-xs text-amber-700">Harap lengkapi semua bidang bertanda asterisk (*) di bawah ini agar Anda dapat memasang iklan.</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="p-8">
                        <div className="flex flex-col items-center justify-center mb-8">
                            <div className="relative group">
                                <div className="h-28 w-28 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center border-4 border-white shadow-xl overflow-hidden">
                                    {fotoPreview || user.foto_profil ? (
                                        <img
                                            src={fotoPreview || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/uploads/profiles/${user.foto_profil}`}
                                            alt={user.nama}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="12" cy="7" r="4"></circle>
                                        </svg>
                                    )}
                                </div>
                                {isEditing && (
                                    <label className="absolute bottom-0 right-0 p-2 bg-[var(--color-primary)] text-white rounded-full shadow-lg cursor-pointer hover:bg-blue-600 transition-colors">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                    </label>
                                )}
                            </div>
                            {isEditing && <p className="text-xs text-gray-400 mt-3 font-semibold">Klik ikon upload untuk mengganti foto</p>}
                        </div>

                        <div className="space-y-8">
                            {/* SECTION 1: IDENTITAS PRIBADI */}
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 border-b pb-3 flex items-center gap-2">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                    1. Identitas Pribadi (PIC/Admin)
                                </h3>
                                <p className="text-xs text-gray-500 mt-2 mb-4 italic">* Informasi teknis untuk komunikasi antara Radio & Pemasang Iklan</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 p-6 rounded-xl border border-gray-100">
                                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Nama Lengkap *</p>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={nama}
                                                onChange={(e) => setNama(e.target.value)}
                                                placeholder="Nama penanggung jawab akun"
                                                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all font-bold"
                                            />
                                        ) : (
                                            <p className="text-base font-bold text-gray-900 mt-1">{user.nama}</p>
                                        )}
                                    </div>

                                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Username</p>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                placeholder="Untuk akses login ke dashboard"
                                                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all font-bold"
                                            />
                                        ) : (
                                            <p className="text-base font-bold text-gray-900 mt-1">{user.username || '-'}</p>
                                        )}
                                    </div>

                                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Nomor WhatsApp Aktif *</p>
                                        {isEditing ? (
                                            <input
                                                type="tel"
                                                value={telepon}
                                                onChange={(e) => setTelepon(e.target.value)}
                                                placeholder="Untuk notifikasi otomatis tayang iklan"
                                                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all font-bold"
                                            />
                                        ) : (
                                            <p className="text-base font-bold text-gray-900 mt-1 text-green-600 flex items-center gap-1">
                                                {user.telepon ? (
                                                    <>
                                                        <svg width="14" height="14" fill="currentColor" viewBox="0 0 448 512"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.7 17.8 69.4 27.2 106.2 27.2 122.4 0 222-99.6 222-222 0-59.3-23.1-115.1-65-157.1zM223.9 445.5c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3 18.7-68.1-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.5-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.4-16.3-14.6-27.4-32.7-30.5-38.2-3.2-5.5-.3-8.5 2.5-11.2 2.5-2.6 5.5-6.5 8.3-9.8 2.8-3.3 3.7-5.6 5.5-9.3s.9-6.9-.5-9.8c-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2s-9.7 1.4-14.8 6.9c-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.8 23.5 9.2 31.6 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.5 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>
                                                        {user.telepon}
                                                    </>
                                                ) : '-'}
                                            </p>
                                        )}
                                    </div>

                                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 opacity-80">
                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Email Utama <span className="lowercase text-[9px] font-normal">(Laporan & Invoice)</span></p>
                                        <p className="mt-1 text-base font-bold text-gray-900">{user.email}</p>
                                    </div>

                                    {isEditing && (
                                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 md:col-span-2">
                                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Update Password</p>
                                            <input
                                                type="password"
                                                placeholder="Kosongkan jika tidak ingin mengubah password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* SECTION 2: IDENTITAS BISNIS */}
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 border-b pb-3 flex items-center gap-2">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2"></path><rect x="3" y="10" width="18" height="10" rx="2"></rect><line x1="12" y1="10" x2="12" y2="20"></line></svg>
                                    2. Identitas Bisnis/Instansi (Untuk Publik/Timeline)
                                </h3>
                                <p className="text-xs text-gray-500 mt-2 mb-4 italic">* Informasi ini akan tampil sebagai identitas iklan Anda di sistem</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 p-6 rounded-xl border border-gray-100">
                                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Nama Brand / Perusahaan *</p>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={namaPerusahaan}
                                                onChange={(e) => setNamaPerusahaan(e.target.value)}
                                                placeholder="Contoh: Iklan Shopee"
                                                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all font-bold"
                                            />
                                        ) : (
                                            <p className="text-base font-bold text-gray-900 mt-1">{user.nama_perusahaan || '-'}</p>
                                        )}
                                    </div>

                                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Kategori Bisnis *</p>
                                        {isEditing ? (
                                            <div className="space-y-2">
                                                <select
                                                    value={jenisUsaha}
                                                    onChange={(e) => {
                                                        setJenisUsaha(e.target.value);
                                                        if (e.target.value === 'Lainnya') {
                                                            setIsOtherSelected(true);
                                                        } else {
                                                            setIsOtherSelected(false);
                                                        }
                                                    }}
                                                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all font-bold"
                                                >
                                                    <option value="">Pilih Kategori</option>
                                                    <option value="Kuliner">Kuliner</option>
                                                    <option value="Jasa">Jasa</option>
                                                    <option value="Event">Event</option>
                                                    <option value="Otomotif">Otomotif</option>
                                                    <option value="Retail">Retail</option>
                                                    <option value="Kesehatan">Kesehatan</option>
                                                    <option value="Lainnya">Lainnya...</option>
                                                </select>
                                                {(jenisUsaha === 'Lainnya' || isOtherSelected) && (
                                                    <input
                                                        type="text"
                                                        value={customJenisUsaha}
                                                        onChange={(e) => setCustomJenisUsaha(e.target.value)}
                                                        placeholder="Sebutkan kategori lainnya"
                                                        className="w-full bg-white border border-[var(--color-primary)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all font-bold animate-in fade-in slide-in-from-top-1"
                                                    />
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-base font-bold text-gray-900 mt-1">{user.jenis_usaha || '-'}</p>
                                        )}
                                    </div>

                                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 md:col-span-2">
                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Alamat Kantor / Toko *</p>
                                        {isEditing ? (
                                            <textarea
                                                rows={2}
                                                value={alamatPerusahaan}
                                                onChange={(e) => setAlamatPerusahaan(e.target.value)}
                                                placeholder="Berikan alamat lengkap untuk validasi"
                                                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all font-bold resize-none"
                                            />
                                        ) : (
                                            <p className="text-base font-bold text-gray-900 mt-1">{user.alamat_perusahaan || '-'}</p>
                                        )}
                                    </div>

                                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 md:col-span-2">
                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Website atau Media Sosial</p>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={mediaSosial}
                                                onChange={(e) => setMediaSosial(e.target.value)}
                                                placeholder="Link Instagram / Facebook / Website"
                                                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all font-bold"
                                            />
                                        ) : (
                                            <p className="text-base font-bold text-gray-900 mt-1 text-blue-600 underline">
                                                {user.media_sosial ? <a href={user.media_sosial.startsWith('http') ? user.media_sosial : `https://${user.media_sosial}`} target="_blank" rel="noopener noreferrer">{user.media_sosial}</a> : '-'}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 pt-6 border-t border-gray-100 flex justify-center">
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-8 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all duration-300 border border-red-100 shadow-sm"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                    <polyline points="16 17 21 12 16 7"></polyline>
                                    <line x1="21" y1="12" x2="9" y2="12"></line>
                                </svg>
                                Keluar Akun (Logout)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
