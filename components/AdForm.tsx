'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Modal from './UI/Modal';

interface FormData {
    // Step 2: Timeline
    selectedDate: string;
    schedule: Record<string, string[]>; // { "2024-04-12": ["07:00", "08:00"] }

    // Step 3
    jenisMateri: 'file' | 'text';
    fileUpload: File | null;
    scriptText: string;
    voicePreference: string;
    musicPreference: string;
    catatan: string;
    unggulanProduct: string;
}

const packagePrices: Record<string, number> = {
    kickstart: 500000,
    brand_boost: 1000000,
    digital_blast: 2500000,
    mega_exposure: 5000000,
    domination: 10000000,
    customize: 0,
};

const packageDurations: Record<string, number> = {
    kickstart: 30,
    brand_boost: 30,
    digital_blast: 30,
    mega_exposure: 30,
    domination: 30,
    customize: 30,
};

// Batas tayangan per hari per paket
const packageDailyLimit: Record<string, number> = {
    kickstart: 7,
    brand_boost: 10,
    digital_blast: 20,
    mega_exposure: 37,
    domination: 57,
    customize: 100,
};

export default function AdForm() {
    const { user, token, isLoading: authLoading } = useAuth();
    const { showToast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [agreeTnc, setAgreeTnc] = useState(false);

    const [formData, setFormData] = useState<FormData>({
        nama: '',
        email: '',
        telepon: '',
        perusahaan: '',
        paket: '',
        selectedDate: new Date().toISOString().split('T')[0],
        schedule: {},
        jenisMateri: 'text',
        fileUpload: null,
        scriptText: '',
        voicePreference: '',
        musicPreference: '',
        catatan: '',
        unggulanProduct: '',
    });

    const [isProfileComplete, setIsProfileComplete] = useState(true);

    useEffect(() => {
        const packageParam = searchParams.get('package');
        if (packageParam && packagePrices[packageParam]) {
            setFormData(prev => ({ ...prev, paket: packageParam }));
        }

        if (user) {
            setFormData(prev => ({
                ...prev,
                nama: prev.nama || user.nama,
                email: prev.email || user.email,
                telepon: prev.telepon || user.telepon || '',
                perusahaan: prev.perusahaan || user.nama_perusahaan || ''
            }));

            // Cek kelengkapan profil sesuai permintaan
            const isComplete = !!(
                user.telepon &&
                user.nama_perusahaan &&
                user.jenis_usaha &&
                user.alamat_perusahaan
            );
            setIsProfileComplete(isComplete);
        }
    }, [searchParams, user]);

    const updateFormData = (field: keyof FormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const nextStep = (step: number) => {
        if (currentStep === 1) {
            if (!isProfileComplete) {
                showToast('Profil Anda belum lengkap. Harap lengkapi Identitas Pribadi & Bisnis di halaman Profil sebelum melanjutkan.', 'error');
                router.push('/profile?incomplete=true');
                return;
            }
            if (!formData.nama || !formData.email || !formData.paket) {
                showToast('Harap isi Nama, Email, dan pilih Paket', 'warning');
                return;
            }
        }
        if (currentStep === 2) {
            const hasSelection = Object.values(formData.schedule).some(hours => hours.length > 0);
            if (!hasSelection) {
                showToast('Silakan pilih minimal satu jadwal penayangan', 'warning');
                return;
            }
        }
        setCurrentStep(step);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const prevStep = (step: number) => {
        setCurrentStep(step);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                showToast('Ukuran file terlalu besar. Maksimal 10MB.', 'error');
                return;
            }
            updateFormData('fileUpload', file);
            showToast(`File terpilih: ${file.name}`, 'info');
        }
    };

    const removeFile = () => {
        updateFormData('fileUpload', null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            showToast('Silakan login terlebih dahulu', 'warning');
            router.push('/login');
            return;
        }

        if (!agreeTnc) {
            showToast('Harap setujui syarat dan ketentuan', 'warning');
            return;
        }

        setShowConfirmModal(true);
    };

    const processPayment = async () => {
        setShowConfirmModal(false);
        setIsSubmitting(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

            let response;
            // Jika ada file, gunakan multipart/form-data. Jika hanya link, gunakan JSON.
            if (formData.fileUpload) {
                const data = new FormData();
                data.append('nama', formData.nama);
                data.append('email', formData.email);
                data.append('telepon', formData.telepon);
                data.append('perusahaan', formData.perusahaan);
                data.append('paket', formData.paket);
                data.append('jenis_materi', 'file');
                data.append('file_audio', formData.fileUpload);
                data.append('script_text', formData.scriptText); // Drive link tetap dikirim jika ada
                data.append('catatan', formData.catatan);
                data.append('schedule', JSON.stringify(formData.schedule));

                response = await fetch(`${apiUrl}/api/orders`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: data,
                });
            } else {
                response = await fetch(`${apiUrl}/api/orders`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        nama: formData.nama,
                        email: formData.email,
                        telepon: formData.telepon,
                        perusahaan: formData.perusahaan,
                        paket: formData.paket,
                        schedule: formData.schedule,
                        jenis_materi: 'text',
                        script_text: formData.scriptText,
                        voice_preference: formData.voicePreference,
                        music_preference: formData.musicPreference,
                        catatan: formData.catatan,
                        unggulan_product: formData.unggulanProduct,
                    }),
                });
            }

            const result = await response.json();

            if (!result.success) {
                console.error('Order creation error:', result);
                showToast('Gagal membuat pesanan: ' + result.message, 'error');
                setIsSubmitting(false);
                return;
            }

            const orderId = result.data.order_id;
            showToast('Pesanan berhasil dibuat. Menyiapkan invoice...', 'info');

            const paymentResponse = await fetch(`${apiUrl}/api/payment/create-transaction`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ order_id: orderId }),
            });

            const paymentResult = await paymentResponse.json();

            if (!paymentResult.success) {
                console.error('Payment token error:', paymentResult);
                showToast('Gagal mendapatkan token pembayaran: ' + (paymentResult.message || 'Unknown error'), 'error');
                setIsSubmitting(false);
                return;
            }

            showToast('Membuka gerbang pembayaran...', 'success');

            // Cek ketersediaan Snap
            if (window.snap) {
                try {
                    window.snap.pay(paymentResult.token, {
                        onSuccess: () => {
                            showToast('Pembayaran berhasil!', 'success');
                            window.location.href = `/order/success?order_id=${orderId}&status=success`;
                        },
                        onPending: () => {
                            showToast('Pembayaran tertunda.', 'warning');
                            window.location.href = `/order/pending?order_id=${orderId}&status=pending`;
                        },
                        onError: (result: any) => {
                            console.error('Snap error:', result);
                            showToast('Pembayaran gagal. Silakan coba lagi.', 'error');
                        },
                        onClose: () => {
                            showToast('Jendela pembayaran ditutup. Anda bisa membayar nanti dari Dashboard.', 'info');
                        }
                    });
                } catch (err) {
                    console.error('Snap pay call error:', err);
                    // Fallback ke redirect jika snap.pay error
                    if (paymentResult.redirect_url) {
                        window.location.href = paymentResult.redirect_url;
                    } else {
                        showToast('Gagal membuka popup pembayaran.', 'error');
                    }
                }
            } else {
                console.warn('Snap JS not loaded, falling back to redirect');
                // Fallback ke redirect url jika Snap JS tidak terload
                if (paymentResult.redirect_url) {
                    window.location.href = paymentResult.redirect_url;
                } else {
                    showToast('Sistem pembayaran (Snap) tidak tersedia. Silakan refresh halaman.', 'error');
                }
            }
        } catch (error: any) {
            console.error('Transaction process error:', error);
            showToast(`Kesalahan: ${error?.message || 'Gagal menghubungi server'}`, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authLoading) return <div className="text-center p-20">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            {!isProfileComplete && user && (
                <div className="mb-6 bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-xl shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 text-amber-400">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-amber-800">Profil Belum Lengkap!</p>
                            <p className="text-xs text-amber-700">Identitas Pribadi & Bisnis wajib diisi sebelum Anda dapat mengajukan sewa iklan.</p>
                            <button
                                onClick={() => router.push('/profile')}
                                className="mt-2 text-xs font-bold text-amber-900 underline hover:text-amber-600"
                            >
                                Lengkapi Profil Sekarang →
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-10">
                {/* Simple Step indicator */}
                <div className="flex items-center justify-center gap-4 mb-8">
                    {[1, 2, 3, 4].map(s => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${currentStep >= s ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-200 text-gray-400'}`}>
                                {s}
                            </div>
                            {s < 4 && <div className={`w-10 h-1 ${currentStep > s ? 'bg-[var(--color-primary)]' : 'bg-gray-200'}`}></div>}
                        </div>
                    ))}
                </div>

                {currentStep === 1 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-gray-800">1. Data Diri & Paket</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-600">Nama Lengkap *</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[var(--color-primary)]"
                                    value={formData.nama}
                                    onChange={(e) => updateFormData('nama', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-600">Email *</label>
                                <input
                                    type="email"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[var(--color-primary)]"
                                    value={formData.email}
                                    onChange={(e) => updateFormData('email', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-600">Telepon/WA</label>
                                <input
                                    type="tel"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[var(--color-primary)]"
                                    value={formData.telepon}
                                    onChange={(e) => updateFormData('telepon', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-600">Perusahaan</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[var(--color-primary)]"
                                    value={formData.perusahaan}
                                    onChange={(e) => updateFormData('perusahaan', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-600">Pilih Paket Penyiaran *</label>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:border-[var(--color-primary)]"
                                value={formData.paket}
                                onChange={(e) => updateFormData('paket', e.target.value)}
                            >
                                <option value="">-- Pilih Paket --</option>
                                <option value="kickstart">Kickstart - Rp 500.000</option>
                                <option value="brand_boost">Brand Boost - Rp 1.000.000</option>
                                <option value="digital_blast">Digital Blast - Rp 2.500.000</option>
                                <option value="mega_exposure">Mega Exposure - Rp 5.000.000</option>
                                <option value="domination">Domination - Rp 10.000.000</option>
                                <option value="customize">Customize - Hubungi Kami</option>
                            </select>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                onClick={() => nextStep(2)}
                                className="bg-[var(--color-primary)] text-white px-8 py-2 rounded-lg font-bold hover:bg-[var(--color-primary-dark)] transition-colors"
                            >
                                Pilih Jadwal
                            </button>
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">2. Pilih Jadwal Tayang</h2>
                            <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold">
                                Paket {formData.paket.replace('_', ' ').toUpperCase()}
                            </div>
                        </div>

                        {/* Timeline Horizontal - Hari */}
                        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
                            {[...Array(packageDurations[formData.paket] || 7)].map((_, i) => {
                                const d = new Date();
                                d.setDate(d.getDate() + i);
                                const dateStr = d.toISOString().split('T')[0];
                                const isSelected = formData.selectedDate === dateStr;
                                const hasHours = (formData.schedule[dateStr]?.length || 0) > 0;

                                return (
                                    <button
                                        key={dateStr}
                                        onClick={() => updateFormData('selectedDate', dateStr)}
                                        className={`flex-shrink-0 min-w-[100px] p-3 rounded-xl border-2 transition-all ${isSelected ? 'bg-yellow-400 border-yellow-500 shadow-md transform scale-105' : 'bg-white border-gray-100 hover:border-yellow-200'}`}
                                    >
                                        <p className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-yellow-900' : 'text-gray-400'}`}>
                                            {d.toLocaleDateString('id-ID', { weekday: 'short' })}
                                        </p>
                                        <p className={`text-lg font-black ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                                            {d.getDate()} {d.toLocaleDateString('id-ID', { month: 'short' })}
                                        </p>
                                        {hasHours && (
                                            <div className="mt-1 flex justify-center gap-0.5">
                                                {formData.schedule[dateStr].map((_, idx) => (
                                                    <div key={idx} className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                                ))}
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Grid Jam - Hitam */}
                        <div className="bg-gray-900 rounded-3xl p-6 shadow-2xl border border-gray-800">
                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                                {[...Array(24)].map((_, i) => {
                                    // Saring jam: 00-05 dan 23 dihapus
                                    if (i <= 5 || i === 23) return null;

                                    const hour = `${i.toString().padStart(2, '0')}.00`;
                                    const isSelected = formData.schedule[formData.selectedDate]?.includes(hour);

                                    return (
                                        <button
                                            key={hour}
                                            onClick={() => {
                                                const currentDayHours = formData.schedule[formData.selectedDate] || [];
                                                let newHours;
                                                if (isSelected) {
                                                    newHours = currentDayHours.filter(h => h !== hour);
                                                } else {
                                                    // Limit check
                                                    const limit = packageDailyLimit[formData.paket] ?? 7;
                                                    if (currentDayHours.length >= limit) {
                                                        showToast(`Batas penayangan harian untuk ${formData.paket} adalah ${limit}x`, 'warning');
                                                        return;
                                                    }
                                                    newHours = [...currentDayHours, hour].sort();
                                                }
                                                updateFormData('schedule', { ...formData.schedule, [formData.selectedDate]: newHours });
                                            }}
                                            className={`group relative py-3 rounded-2xl border transition-all ${isSelected ? 'bg-yellow-400 border-yellow-300 text-gray-900 font-bold scale-95' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'}`}
                                        >
                                            <p className="text-sm font-bold">{hour}</p>
                                            <p className={`text-[8px] mt-0.5 opacity-60 ${isSelected ? 'text-gray-800' : 'text-gray-500'}`}>12 Slot</p>
                                            {isSelected && (
                                                <div className="absolute -top-1 -right-1 bg-blue-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px] animate-bounce">
                                                    ✓
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex justify-between pt-4">
                            <button onClick={() => prevStep(1)} className="text-gray-500 font-bold">Kembali</button>
                            <button onClick={() => nextStep(3)} className="bg-[var(--color-primary)] text-white px-8 py-2 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all">Lanjut ke Materi</button>
                        </div>
                    </div>
                )}

                {currentStep === 3 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-gray-800">3. Materi Iklan</h2>

                        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-6">
                            {/* Unified Interface: File OR Link */}
                            <div className="space-y-4">
                                <label className="text-sm font-black text-gray-700 uppercase tracking-wider block">Opsi A: Upload File Langsung</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center bg-white hover:border-[var(--color-primary)] transition-all">
                                    <input type="file" id="audio-input" className="hidden" onChange={handleFileUpload} accept="audio/*,.txt,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" />
                                    {formData.fileUpload ? (
                                        <div className="flex items-center justify-between bg-green-50 p-3 rounded-xl border border-green-100">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl">✅</span>
                                                <span className="text-sm font-bold text-green-800 truncate max-w-[150px]">{formData.fileUpload.name}</span>
                                            </div>
                                            <button onClick={removeFile} className="text-red-500 font-bold text-xs uppercase underline">Hapus</button>
                                        </div>
                                    ) : (
                                        <label htmlFor="audio-input" className="cursor-pointer block py-2">
                                            <p className="text-2xl mb-1">📁</p>
                                            <p className="text-sm font-bold text-gray-600">Klik untuk upload file audio/naskah</p>
                                        </label>
                                    )}
                                </div>
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-gray-50 px-4 text-xs font-black text-gray-400 uppercase tracking-widest">ATAU</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-sm font-black text-gray-700 uppercase tracking-wider block">Opsi B: Link Cloud Storage</label>
                                <div className="space-y-2">
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔗</span>
                                        <input
                                            type="url"
                                            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl outline-none focus:border-[var(--color-primary)] font-bold text-blue-600 shadow-sm"
                                            placeholder="Link Google Drive / OneDrive..."
                                            value={formData.scriptText}
                                            onChange={(e) => {
                                                updateFormData('scriptText', e.target.value);
                                                if (e.target.value) {
                                                    updateFormData('jenisMateri', 'text');
                                                }
                                            }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-400 italic px-2">Gunakan opsi ini jika file berukuran besar atau berada di cloud.</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Pilihan Suara</label>
                                <select
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none font-bold bg-gray-50 focus:bg-white transition-colors"
                                    value={formData.voicePreference}
                                    onChange={(e) => updateFormData('voicePreference', e.target.value)}
                                >
                                    <option value="">-- Bebas --</option>
                                    <option value="pria">Pria</option>
                                    <option value="wanita">Wanita</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Nuansa Musik</label>
                                <select
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none font-bold bg-gray-50 focus:bg-white transition-colors"
                                    value={formData.musicPreference}
                                    onChange={(e) => updateFormData('musicPreference', e.target.value)}
                                >
                                    <option value="">-- Bebas --</option>
                                    <option value="pop">Pop</option>
                                    <option value="slow">Slow</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-black text-gray-700 uppercase tracking-wider block">Keunggulan Produk / Promo Utama</label>
                            <textarea
                                className="w-full px-4 py-3 border border-gray-200 rounded-2xl h-24 outline-none focus:border-[var(--color-primary)] font-medium bg-gray-50 focus:bg-white transition-all"
                                placeholder="Sebutkan apa yang istimewa dari produk Anda atau promo yang sedang berjalan..."
                                value={formData.unggulanProduct}
                                onChange={(e) => updateFormData('unggulanProduct', e.target.value)}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-600">Catatan Lain</label>
                            <textarea
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg h-20 outline-none"
                                placeholder="Contoh: Fokus pada promo diskon..."
                                value={formData.catatan}
                                onChange={(e) => updateFormData('catatan', e.target.value)}
                            />
                        </div>

                        <div className="flex justify-between pt-4">
                            <button onClick={() => prevStep(2)} className="text-gray-500 font-bold">Kembali</button>
                            <button onClick={() => nextStep(4)} className="bg-[var(--color-primary)] text-white px-8 py-2 rounded-lg font-bold">Lanjut ke Konfirmasi</button>
                        </div>
                    </div>
                )}

                {currentStep === 4 && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-gray-800">4. Konfirmasi Pesanan</h2>

                        <div className="bg-gray-50 p-5 rounded-3xl border border-gray-200 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Nama Pemesan</span>
                                    <p className="font-bold text-gray-800">{formData.nama}</p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Paket</span>
                                    <p className="font-bold text-[var(--color-primary)] uppercase">{formData.paket}</p>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-3">
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Jadwal Penayangan</span>
                                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto pr-2">
                                    {Object.entries(formData.schedule).map(([date, hours]) => (
                                        hours.length > 0 && (
                                            <div key={date} className="flex justify-between items-center bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                                                <span className="text-xs font-bold text-gray-700">{new Date(date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}</span>
                                                <div className="flex gap-1">
                                                    {hours.map(h => (
                                                        <span key={h} className="text-[10px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-lg font-bold">{h}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-between border-t border-gray-200 pt-3 text-lg items-end">
                                <span className="font-bold text-gray-500 text-sm">Total Investasi:</span>
                                <span className="font-black text-3xl text-[var(--color-primary)] tracking-tight">Rp {packagePrices[formData.paket]?.toLocaleString('id-ID')}</span>
                            </div>
                        </div>

                        <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                            <input
                                type="checkbox"
                                id="tnc"
                                checked={agreeTnc}
                                onChange={(e) => setAgreeTnc(e.target.checked)}
                                className="mt-1"
                            />
                            <label htmlFor="tnc" className="text-xs text-gray-600">Saya menyetujui semua syarat & ketentuan penyiaran iklan di City Guide 911 FM.</label>
                        </div>

                        <div className="flex justify-between pt-4">
                            <button onClick={() => prevStep(3)} className="text-gray-500 font-bold">Edit Materi</button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className={`bg-[var(--color-primary)] text-white px-10 py-3 rounded-2xl font-black shadow-lg hover:shadow-xl transition-all ${isSubmitting ? 'opacity-50' : 'hover:scale-105 active:scale-95'}`}
                            >
                                {isSubmitting ? 'Memproses...' : 'Proses ke Pembayaran'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <Modal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                title="Konfirmasi Pesanan"
                footer={
                    <>
                        <button
                            onClick={() => setShowConfirmModal(false)}
                            className="px-6 py-2 rounded-xl font-bold text-gray-400 hover:text-gray-900 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            disabled={isSubmitting}
                            onClick={processPayment}
                            className="px-6 py-2 rounded-xl font-bold bg-[var(--color-primary)] text-white hover:scale-105 transition-all shadow-lg flex items-center gap-2"
                        >
                            {isSubmitting ? 'Memproses...' : 'Ya, Bayar Sekarang'}
                        </button>
                    </>
                }
            >
                <div className="space-y-4">
                    <p className="text-gray-600 italic">Harap periksa kembali detail pesanan Anda:</p>
                    <div className="bg-gray-50 rounded-2xl p-5 space-y-3 border border-gray-100">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 uppercase font-bold text-[10px]">Paket Iklan</span>
                            <span className="font-bold text-[var(--color-primary)] capitalize">{formData.paket}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500 uppercase font-bold text-[10px]">Materi</span>
                            <span className="font-bold capitalize">{formData.fileUpload ? `File: ${formData.fileUpload.name}` : formData.scriptText ? 'Link Drive' : 'Belum Ada'}</span>
                        </div>
                        <div className="border-t pt-3 flex justify-between">
                            <span className="font-bold text-gray-900">Total</span>
                            <span className="text-lg font-bold text-[var(--color-primary)]">Rp {packagePrices[formData.paket]?.toLocaleString('id-ID')}</span>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
