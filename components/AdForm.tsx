'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface FormData {
    // Step 1
    nama: string;
    email: string;
    telepon: string;
    perusahaan: string;
    paket: string;

    // Step 2
    jenisMateri: 'file' | 'text';
    fileUpload: File | null;
    scriptText: string;
    voicePreference: string;
    musicPreference: string;
    catatan: string;
}

const packagePrices: Record<string, number> = {
    basic: 150000,
    premium: 350000,
    enterprise: 650000,
};

const packageNames: Record<string, string> = {
    basic: 'Basic - Rp 150.000 (7 hari)',
    premium: 'Premium - Rp 350.000 (14 hari)',
    enterprise: 'Enterprise - Rp 650.000 (30 hari)',
};

export default function AdForm() {
    const searchParams = useSearchParams();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<FormData>({
        nama: '',
        email: '',
        telepon: '',
        perusahaan: '',
        paket: '',
        jenisMateri: 'file',
        fileUpload: null,
        scriptText: '',
        voicePreference: '',
        musicPreference: '',
        catatan: '',
    });
    const [agreeTnc, setAgreeTnc] = useState(false);

    // Set package from URL parameter
    useEffect(() => {
        const packageParam = searchParams.get('package');
        if (packageParam && packagePrices[packageParam]) {
            setFormData(prev => ({ ...prev, paket: packageParam }));
        }
    }, [searchParams]);

    const updateFormData = (field: keyof FormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const nextStep = (step: number) => {
        // Validation logic here
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
            updateFormData('fileUpload', file);
        }
    };

    const removeFile = () => {
        updateFormData('fileUpload', null);
    };

    const proceedToPayment = () => {
        if (!agreeTnc) {
            alert('Harap setujui syarat dan ketentuan terlebih dahulu');
            return;
        }
        nextStep(4);
    };

    const processPayment = () => {
        // Demo mode - show alert with order summary
        const orderSummary = `
=== RINGKASAN PESANAN ===

Nama: ${formData.nama}
Email: ${formData.email}
Telepon: ${formData.telepon}
Perusahaan: ${formData.perusahaan || '-'}

Paket: ${packageNames[formData.paket]}
Total: Rp ${totalPrice.toLocaleString('id-ID')}

Materi Iklan: ${formData.jenisMateri === 'file' ? 'File Audio' : 'Script Text'}
${formData.jenisMateri === 'file' ? `File: ${formData.fileUpload?.name || '-'}` : `Script: ${formData.scriptText.substring(0, 50)}...`}

=== DEMO MODE ===
Ini adalah mode demo. Untuk integrasi Midtrans yang sebenarnya:

1. Daftar di https://midtrans.com
2. Dapatkan Client Key & Server Key
3. Isi di file .env.local
4. Buat backend API di /api/payment
5. Uncomment kode Midtrans di AdForm.tsx

Untuk saat ini, data pesanan Anda sudah dicatat.
        `;

        alert(orderSummary);

        // Simulate success
        setTimeout(() => {
            window.location.href = '/order/success?order_id=DEMO-' + Date.now();
        }, 1000);

        /* 
        // UNCOMMENT KODE DI BAWAH UNTUK INTEGRASI MIDTRANS SEBENARNYA
        // Pastikan sudah setup backend API dan environment variables
        
        try {
            // Call your backend API to create transaction
            const response = await fetch('/api/payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nama: formData.nama,
                    email: formData.email,
                    telepon: formData.telepon,
                    paket: formData.paket,
                    totalPrice: totalPrice,
                }),
            });

            const data = await response.json();

            if (data.success && data.token) {
                // Open Midtrans Snap popup
                (window as any).snap.pay(data.token, {
                    onSuccess: function(result: any) {
                        window.location.href = '/order/success?order_id=' + data.order_id;
                    },
                    onPending: function(result: any) {
                        window.location.href = '/order/pending?order_id=' + data.order_id;
                    },
                    onError: function(result: any) {
                        alert('Pembayaran gagal. Silakan coba lagi.');
                    },
                });
            }
        } catch (error) {
            alert('Terjadi kesalahan. Silakan coba lagi.');
        }
        */
    };

    const totalPrice = formData.paket ? packagePrices[formData.paket] : 0;

    return (
        <section id="form" className="py-20 bg-white">
            <div className="container">
                <h2 className="section-title">Form Pemesanan Iklan</h2>
                <p className="section-subtitle">Lengkapi data dan upload materi iklan Anda</p>

                <div className="max-w-4xl mx-auto">
                    {/* Step Indicator */}
                    <div className="flex items-center justify-between mb-12">
                        {[1, 2, 3, 4].map((step) => (
                            <div key={step} className="flex items-center flex-1">
                                <div className="flex flex-col items-center flex-1">
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${currentStep >= step
                                            ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white'
                                            : 'bg-gray-200 text-gray-500'
                                            }`}
                                    >
                                        {step}
                                    </div>
                                    <div className={`mt-2 text-sm font-semibold ${currentStep >= step ? 'text-[var(--color-primary)]' : 'text-gray-500'}`}>
                                        {step === 1 && 'Data Diri'}
                                        {step === 2 && 'Materi Iklan'}
                                        {step === 3 && 'Review'}
                                        {step === 4 && 'Pembayaran'}
                                    </div>
                                </div>
                                {step < 4 && (
                                    <div className={`h-1 flex-1 mx-2 ${currentStep > step ? 'bg-[var(--color-primary)]' : 'bg-gray-200'}`} />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Form Steps */}
                    <div className="card">
                        {/* Step 1: Data Diri */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold mb-6">Informasi Pelanggan</h3>

                                <div>
                                    <label htmlFor="nama" className="label">Nama Lengkap *</label>
                                    <input
                                        type="text"
                                        id="nama"
                                        value={formData.nama}
                                        onChange={(e) => updateFormData('nama', e.target.value)}
                                        className="input-field"
                                        placeholder="Masukkan nama lengkap Anda"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="email" className="label">Email *</label>
                                        <input
                                            type="email"
                                            id="email"
                                            value={formData.email}
                                            onChange={(e) => updateFormData('email', e.target.value)}
                                            className="input-field"
                                            placeholder="contoh@email.com"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="telepon" className="label">Nomor Telepon *</label>
                                        <input
                                            type="tel"
                                            id="telepon"
                                            value={formData.telepon}
                                            onChange={(e) => updateFormData('telepon', e.target.value)}
                                            className="input-field"
                                            placeholder="08xxxxxxxxxx"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="perusahaan" className="label">Nama Perusahaan/Usaha</label>
                                    <input
                                        type="text"
                                        id="perusahaan"
                                        value={formData.perusahaan}
                                        onChange={(e) => updateFormData('perusahaan', e.target.value)}
                                        className="input-field"
                                        placeholder="Opsional"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="paket" className="label">Paket Iklan *</label>
                                    <select
                                        id="paket"
                                        value={formData.paket}
                                        onChange={(e) => updateFormData('paket', e.target.value)}
                                        className="input-field"
                                        required
                                    >
                                        <option value="">Pilih Paket</option>
                                        <option value="basic">Basic - Rp 150.000 (7 hari)</option>
                                        <option value="premium">Premium - Rp 350.000 (14 hari)</option>
                                        <option value="enterprise">Enterprise - Rp 650.000 (30 hari)</option>
                                    </select>
                                </div>

                                <div className="flex justify-end">
                                    <button onClick={() => nextStep(2)} className="btn btn-primary">
                                        Lanjut ke Materi Iklan
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Materi Iklan */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold mb-6">Upload Materi Iklan</h3>

                                <div>
                                    <label className="label">Jenis Materi Iklan *</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <label className={`card cursor-pointer ${formData.jenisMateri === 'file' ? 'ring-2 ring-[var(--color-primary)]' : ''}`}>
                                            <input
                                                type="radio"
                                                name="jenisMateri"
                                                value="file"
                                                checked={formData.jenisMateri === 'file'}
                                                onChange={(e) => updateFormData('jenisMateri', 'file')}
                                                className="sr-only"
                                            />
                                            <div className="text-center">
                                                <div className="text-4xl mb-2">📁</div>
                                                <div className="font-bold mb-1">Upload File Audio</div>
                                                <div className="text-sm text-gray-600">Upload file audio yang sudah jadi (MP3, WAV)</div>
                                            </div>
                                        </label>
                                        <label className={`card cursor-pointer ${formData.jenisMateri === 'text' ? 'ring-2 ring-[var(--color-primary)]' : ''}`}>
                                            <input
                                                type="radio"
                                                name="jenisMateri"
                                                value="text"
                                                checked={formData.jenisMateri === 'text'}
                                                onChange={(e) => updateFormData('jenisMateri', 'text')}
                                                className="sr-only"
                                            />
                                            <div className="text-center">
                                                <div className="text-4xl mb-2">📝</div>
                                                <div className="font-bold mb-1">Teks Script</div>
                                                <div className="text-sm text-gray-600">Kirim script iklan untuk kami produksi</div>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {formData.jenisMateri === 'file' && (
                                    <div>
                                        <label htmlFor="fileUpload" className="label">Upload File Audio *</label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[var(--color-primary)] transition-colors">
                                            <input
                                                type="file"
                                                id="fileUpload"
                                                accept="audio/*"
                                                onChange={handleFileUpload}
                                                className="hidden"
                                            />
                                            {!formData.fileUpload ? (
                                                <label htmlFor="fileUpload" className="cursor-pointer">
                                                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                    </svg>
                                                    <p className="text-lg font-semibold mb-2">Klik atau drag & drop file audio di sini</p>
                                                    <p className="text-sm text-gray-500">Format: MP3, WAV (Max. 10MB)</p>
                                                </label>
                                            ) : (
                                                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <svg className="w-8 h-8 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-2v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-2" />
                                                        </svg>
                                                        <div className="text-left">
                                                            <p className="font-semibold">{formData.fileUpload.name}</p>
                                                            <p className="text-sm text-gray-500">{(formData.fileUpload.size / 1024 / 1024).toFixed(2)} MB</p>
                                                        </div>
                                                    </div>
                                                    <button type="button" onClick={removeFile} className="text-red-500 hover:text-red-700">
                                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {formData.jenisMateri === 'text' && (
                                    <>
                                        <div>
                                            <label htmlFor="scriptText" className="label">Script Iklan *</label>
                                            <textarea
                                                id="scriptText"
                                                value={formData.scriptText}
                                                onChange={(e) => updateFormData('scriptText', e.target.value)}
                                                className="input-field"
                                                rows={8}
                                                placeholder="Tulis script iklan Anda di sini...&#10;&#10;Contoh:&#10;Selamat datang di Toko Elektronik Jaya! Dapatkan diskon hingga 50% untuk semua produk elektronik."
                                            />
                                            <div className="text-sm text-gray-500 mt-1">
                                                {formData.scriptText.length} / 500 karakter
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label htmlFor="voicePreference" className="label">Preferensi Suara</label>
                                                <select
                                                    id="voicePreference"
                                                    value={formData.voicePreference}
                                                    onChange={(e) => updateFormData('voicePreference', e.target.value)}
                                                    className="input-field"
                                                >
                                                    <option value="">Pilih preferensi (opsional)</option>
                                                    <option value="male">Suara Pria</option>
                                                    <option value="female">Suara Wanita</option>
                                                    <option value="both">Kombinasi</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label htmlFor="musicPreference" className="label">Background Music</label>
                                                <select
                                                    id="musicPreference"
                                                    value={formData.musicPreference}
                                                    onChange={(e) => updateFormData('musicPreference', e.target.value)}
                                                    className="input-field"
                                                >
                                                    <option value="">Pilih musik (opsional)</option>
                                                    <option value="upbeat">Upbeat/Energik</option>
                                                    <option value="calm">Tenang/Santai</option>
                                                    <option value="corporate">Corporate/Professional</option>
                                                    <option value="none">Tanpa Musik</option>
                                                </select>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div>
                                    <label htmlFor="catatan" className="label">Catatan Tambahan</label>
                                    <textarea
                                        id="catatan"
                                        value={formData.catatan}
                                        onChange={(e) => updateFormData('catatan', e.target.value)}
                                        className="input-field"
                                        rows={4}
                                        placeholder="Tambahkan catatan atau instruksi khusus (opsional)"
                                    />
                                </div>

                                <div className="flex justify-between">
                                    <button onClick={() => prevStep(1)} className="btn btn-outline">
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        Kembali
                                    </button>
                                    <button onClick={() => nextStep(3)} className="btn btn-primary">
                                        Lanjut ke Review
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Review */}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <h3 className="text-2xl font-bold mb-6">Review Pesanan Anda</h3>

                                <div className="space-y-6">
                                    <div className="bg-gray-50 p-6 rounded-lg">
                                        <h4 className="font-bold text-lg mb-4">Data Pelanggan</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <span className="text-gray-600">Nama:</span>
                                                <p className="font-semibold">{formData.nama || '-'}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Email:</span>
                                                <p className="font-semibold">{formData.email || '-'}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Telepon:</span>
                                                <p className="font-semibold">{formData.telepon || '-'}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Perusahaan:</span>
                                                <p className="font-semibold">{formData.perusahaan || '-'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-6 rounded-lg">
                                        <h4 className="font-bold text-lg mb-4">Paket Iklan</h4>
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg">{formData.paket ? packageNames[formData.paket] : '-'}</span>
                                            <span className="text-2xl font-bold gradient-text">
                                                Rp {totalPrice.toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-6 rounded-lg">
                                        <h4 className="font-bold text-lg mb-4">Materi Iklan</h4>
                                        {formData.jenisMateri === 'file' ? (
                                            <div>
                                                <p className="text-gray-600 mb-2">File Audio:</p>
                                                <p className="font-semibold">{formData.fileUpload?.name || 'Belum ada file'}</p>
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="text-gray-600 mb-2">Script Iklan:</p>
                                                <p className="font-semibold whitespace-pre-wrap">{formData.scriptText || 'Belum ada script'}</p>
                                                {formData.voicePreference && (
                                                    <p className="mt-2"><span className="text-gray-600">Preferensi Suara:</span> {formData.voicePreference}</p>
                                                )}
                                                {formData.musicPreference && (
                                                    <p><span className="text-gray-600">Background Music:</span> {formData.musicPreference}</p>
                                                )}
                                            </div>
                                        )}
                                        {formData.catatan && (
                                            <div className="mt-4">
                                                <p className="text-gray-600 mb-2">Catatan:</p>
                                                <p className="font-semibold">{formData.catatan}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] p-6 rounded-lg text-white">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xl font-bold">Total Pembayaran:</span>
                                            <span className="text-3xl font-bold">Rp {totalPrice.toLocaleString('id-ID')}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            id="agreeTnc"
                                            checked={agreeTnc}
                                            onChange={(e) => setAgreeTnc(e.target.checked)}
                                            className="mt-1 w-5 h-5 text-[var(--color-primary)] rounded focus:ring-[var(--color-primary)]"
                                        />
                                        <label htmlFor="agreeTnc" className="text-sm">
                                            Saya setuju dengan <a href="#" className="text-[var(--color-primary)] underline">syarat dan ketentuan</a> yang berlaku
                                        </label>
                                    </div>
                                </div>

                                <div className="flex justify-between">
                                    <button onClick={() => prevStep(2)} className="btn btn-outline">
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        Kembali
                                    </button>
                                    <button onClick={proceedToPayment} className="btn btn-primary">
                                        Lanjut ke Pembayaran
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Payment */}
                        {currentStep === 4 && (
                            <div className="space-y-6 text-center">
                                <div className="text-6xl mb-4">💳</div>
                                <h3 className="text-2xl font-bold mb-4">Pembayaran (Demo Mode)</h3>
                                <p className="text-gray-600 mb-8">
                                    Ini adalah mode demo. Klik tombol di bawah untuk melihat ringkasan pesanan.
                                </p>

                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                                    <p className="text-sm text-yellow-800">
                                        <strong>Mode Demo:</strong> Untuk integrasi Midtrans sebenarnya, Anda perlu setup backend API dan environment variables. Lihat file MIDTRANS_SETUP.md untuk panduan lengkap.
                                    </p>
                                </div>

                                <div className="flex flex-wrap justify-center gap-4 mb-8">
                                    <div className="w-16 h-10 bg-gray-100 rounded flex items-center justify-center text-xs font-bold">BCA</div>
                                    <div className="w-16 h-10 bg-gray-100 rounded flex items-center justify-center text-xs font-bold">BNI</div>
                                    <div className="w-16 h-10 bg-gray-100 rounded flex items-center justify-center text-xs font-bold">BRI</div>
                                    <div className="w-16 h-10 bg-gray-100 rounded flex items-center justify-center text-xs font-bold">GoPay</div>
                                    <div className="w-16 h-10 bg-gray-100 rounded flex items-center justify-center text-xs font-bold">OVO</div>
                                </div>

                                <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] p-6 rounded-lg text-white mb-8">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xl font-bold">Total Pembayaran:</span>
                                        <span className="text-3xl font-bold">Rp {totalPrice.toLocaleString('id-ID')}</span>
                                    </div>
                                </div>

                                <button onClick={processPayment} className="btn btn-primary btn-large">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                                        <line x1="1" y1="10" x2="23" y2="10"></line>
                                    </svg>
                                    Lihat Ringkasan Pesanan (Demo)
                                </button>

                                <div className="mt-8">
                                    <button onClick={() => prevStep(3)} className="btn btn-outline">
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        Kembali
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
