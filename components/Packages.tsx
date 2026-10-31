'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface Package {
    id: string;
    name: string;
    price: number;
    icon: string;
    features: { label: string; freq: string }[];
    popular?: boolean;
}

const packages: Package[] = [
    {
        id: 'kickstart',
        name: 'Paket Kickstart',
        price: 500000,
        icon: '🚀',
        features: [
            { label: 'Adlibs Reguler', freq: '7x tayang' },
            { label: 'Bonus Story Instagram', freq: '1x tayang' },
        ],
    },
    {
        id: 'brand_boost',
        name: 'Paket Brand Boost',
        price: 1000000,
        icon: '📈',
        features: [
            { label: 'Adlibs Primetime', freq: '5x tayang' },
            { label: 'Adlibs Reguler', freq: '5x tayang' },
            { label: 'Upload Flayer Feed Instagram/Tiktok', freq: '1x tayang' },
            { label: 'Bonus Story Instagram', freq: '1x tayang' },
        ],
    },
    {
        id: 'digital_blast',
        name: 'Paket Digital Blast',
        price: 2500000,
        icon: '💥',
        features: [
            { label: 'Adlibs Primetime', freq: '15x tayang' },
            { label: 'Adlibs Reguler', freq: '5x tayang' },
            { label: 'Upload Reels/Feed Instagram/Tiktok', freq: '1x tayang' },
            { label: 'Upload Artikel Website', freq: '1x tayang' },
            { label: 'Bonus Story Instagram', freq: '2x tayang' },
        ],
        popular: true,
    },
    {
        id: 'mega_exposure',
        name: 'Paket Mega Exposure',
        price: 5000000,
        icon: '📡',
        features: [
            { label: 'Spot Primetime', freq: '30x tayang' },
            { label: 'Spot Reguler', freq: '7x tayang' },
            { label: 'Upload Reels/Feed Instagram/Tiktok', freq: '1x tayang' },
            { label: 'Upload Artikel Website', freq: '1x tayang' },
            { label: 'Bonus Tagline', freq: '5x tayang' },
            { label: 'Bonus Story Instagram', freq: '2x tayang' },
            { label: 'Bonus Produksi Spot', freq: '1x produksi' },
        ],
    },
    {
        id: 'domination',
        name: 'Paket Domination',
        price: 10000000,
        icon: '👑',
        features: [
            { label: 'Spot Primetime', freq: '45x tayang' },
            { label: 'Spot Reguler', freq: '12x tayang' },
            { label: 'Talkshow', freq: '1x tayang' },
            { label: 'Upload Reels/Feed Instagram/Tiktok', freq: '1x tayang' },
            { label: 'Upload Artikel Website', freq: '1x tayang' },
            { label: 'Bonus Tagline', freq: '5x tayang' },
            { label: 'Bonus Story Instagram', freq: '2x tayang' },
            { label: 'Bonus Produksi Spot', freq: '1x produksi' },
        ],
    },
    {
        id: 'customize',
        name: 'Paket Customize',
        price: 0,
        icon: '⚙️',
        features: [
            { label: 'Kebutuhan Khusus', freq: 'Sesuai Request' },
            { label: 'Konsultasi Gratis', freq: 'Tersedia' },
            { label: 'Custom Durasi', freq: 'Fleksibel' },
            { label: 'Multi Platform', freq: 'Sesuai Request' },
        ],
    },
];

export default function Packages() {
    const { user } = useAuth();
    const router = useRouter();

    const handleSelectPackage = (packageId: string) => {
        if (packageId === 'customize') {
            const phoneNumber = '6281234567890'; // Placeholder WhatsApp number
            const message = encodeURIComponent('Halo City Guide 911 FM, saya ingin bertanya tentang paket iklan customize.');
            window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
            return;
        }

        if (!user) {
            router.push('/login');
        } else {
            router.push(`/order?package=${packageId}`);
        }
    };

    return (
        <section id="paket" className="py-20 bg-gradient-to-b from-[var(--color-light)]/30 to-white">
            <div className="container">
                <div className="text-center mb-12">
                    <h2 className="section-title">Paket Penawaran Iklan</h2>
                    <p className="section-subtitle">Pilih paket yang sesuai dengan kebutuhan promosi Anda di City Guide 911 FM</p>
                </div>

                <div className="flex flex-wrap justify-center gap-8 max-w-7xl mx-auto">
                    {packages.map((pkg) => (
                        <div
                            key={pkg.id}
                            className={`relative card hover:scale-105 transition-all duration-300 w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)] flex flex-col ${
                                pkg.popular ? 'ring-4 ring-[var(--color-primary)] shadow-2xl' : ''
                            }`}
                        >
                            {pkg.popular && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white px-4 py-1 rounded-full text-sm font-bold whitespace-nowrap z-10">
                                    Paling Populer
                                </div>
                            )}

                            <div className="text-center mb-6">
                                <div className="text-5xl mb-4">{pkg.icon}</div>
                                <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
                                <div className="flex items-baseline justify-center gap-2">
                                    <span className="text-3xl font-bold gradient-text">
                                        {pkg.price > 0 ? `Rp ${pkg.price.toLocaleString('id-ID')},-` : 'Hubungi Kami'}
                                    </span>
                                </div>
                            </div>

                            <ul className="space-y-3 mb-8 flex-1">
                                {pkg.features.map((feature, index) => (
                                    <li key={index} className="flex items-start justify-between gap-2 text-sm border-b border-gray-100 pb-2">
                                        <div className="flex items-start gap-2">
                                            <svg
                                                className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                            <span className="text-gray-700 leading-tight">{feature.label}</span>
                                        </div>
                                        <span className="text-xs font-bold text-[var(--color-primary)] whitespace-nowrap ml-2">{feature.freq}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handleSelectPackage(pkg.id)}
                                className={`w-full ${pkg.popular ? 'btn btn-primary' : (pkg.id === 'customize' ? 'btn bg-green-500 hover:bg-green-600 text-white' : 'btn btn-outline')}`}
                            >
                                {pkg.id === 'customize' ? 'Chat WhatsApp' : 'Pilih Paket'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
