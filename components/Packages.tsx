'use client';

import { useRouter } from 'next/navigation';

interface Package {
    id: string;
    name: string;
    price: number;
    duration: string;
    icon: string;
    features: string[];
    popular?: boolean;
}

const packages: Package[] = [
    {
        id: 'basic',
        name: 'Paket Basic',
        price: 150000,
        duration: '7 hari',
        icon: '🎵',
        features: [
            '3x tayang per hari',
            'Durasi 30 detik',
            'Prime time slot',
            'Free script writing',
        ],
    },
    {
        id: 'premium',
        name: 'Paket Premium',
        price: 350000,
        duration: '14 hari',
        icon: '🎙️',
        features: [
            '5x tayang per hari',
            'Durasi 60 detik',
            'All time slots',
            'Free script & voice over',
            'Background music',
        ],
        popular: true,
    },
    {
        id: 'enterprise',
        name: 'Paket Enterprise',
        price: 650000,
        duration: '30 hari',
        icon: '📻',
        features: [
            '8x tayang per hari',
            'Durasi 90 detik',
            'Premium time slots',
            'Professional production',
            'Dedicated account manager',
        ],
    },
];

export default function Packages() {
    const router = useRouter();

    const handleSelectPackage = (packageId: string) => {
        router.push(`/order?package=${packageId}`);
    };

    return (
        <section id="paket" className="py-20 bg-gradient-to-b from-white to-[var(--color-light)]/30">
            <div className="container">
                <h2 className="section-title">Paket Iklan Radio</h2>
                <p className="section-subtitle">Pilih paket yang sesuai dengan kebutuhan promosi Anda</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {packages.map((pkg) => (
                        <div
                            key={pkg.id}
                            className={`relative card hover:scale-105 transition-transform ${pkg.popular ? 'ring-4 ring-[var(--color-primary)] shadow-2xl' : ''
                                }`}
                        >
                            {pkg.popular && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white px-4 py-1 rounded-full text-sm font-bold">
                                    Paling Populer
                                </div>
                            )}

                            <div className="text-center mb-6">
                                <div className="text-5xl mb-4">{pkg.icon}</div>
                                <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                                <div className="flex items-baseline justify-center gap-2">
                                    <span className="text-4xl font-bold gradient-text">
                                        Rp {pkg.price.toLocaleString('id-ID')}
                                    </span>
                                    <span className="text-gray-500">/ {pkg.duration}</span>
                                </div>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {pkg.features.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <svg
                                            className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
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
                                        <span className="text-gray-700">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handleSelectPackage(pkg.id)}
                                className={`w-full ${pkg.popular ? 'btn btn-primary' : 'btn btn-outline'}`}
                            >
                                Pilih Paket
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
