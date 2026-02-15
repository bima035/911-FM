'use client';

import Link from 'next/link';
import { useMemo } from 'react';

export default function Hero() {
    // Generate random values once to avoid hydration mismatch
    const bubbles = useMemo(() =>
        Array.from({ length: 20 }, (_, i) => ({
            id: i,
            width: Math.random() * 100 + 50,
            height: Math.random() * 100 + 50,
            left: Math.random() * 100,
            top: Math.random() * 100,
            opacity: Math.random() * 0.3,
            duration: Math.random() * 10 + 5,
            delay: Math.random() * 5,
        }))
        , []);

    return (
        <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-light)] via-white to-[var(--color-accent)]/30">
                <div className="absolute inset-0 opacity-30">
                    {bubbles.map((bubble) => (
                        <div
                            key={bubble.id}
                            className="absolute rounded-full bg-[var(--color-primary)]"
                            style={{
                                width: `${bubble.width}px`,
                                height: `${bubble.height}px`,
                                left: `${bubble.left}%`,
                                top: `${bubble.top}%`,
                                opacity: bubble.opacity,
                                animation: `float ${bubble.duration}s ease-in-out infinite`,
                                animationDelay: `${bubble.delay}s`,
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="container relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
                        Pasang Iklan di{' '}
                        <span className="gradient-text">City Guide 911 FM</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-2xl mx-auto">
                        Jangkau ribuan pendengar setia City Guide 911 FM. Proses mudah, cepat, dan terpercaya.
                    </p>
                    <Link href="/order">
                        <button className="btn btn-primary btn-large animate-glow">
                            <span>Pasang Iklan Sekarang</span>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </Link>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto">
                        <div className="text-center">
                            <div className="text-4xl font-bold gradient-text mb-2">10K+</div>
                            <div className="text-gray-600">Pendengar Aktif</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold gradient-text mb-2">500+</div>
                            <div className="text-gray-600">Iklan Tayang</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold gradient-text mb-2">98%</div>
                            <div className="text-gray-600">Kepuasan Klien</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M19 12l-7 7-7-7" />
                </svg>
            </div>
        </section>
    );
}
