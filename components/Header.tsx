'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState('home');

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'glass-effect shadow-lg py-3' : 'bg-transparent py-5'
                }`}
        >
            <div className="container">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center">
                        <div className="relative w-48 h-12 md:w-64 md:h-16">
                            <Image
                                src="/logo.svg"
                                alt="City Guide 911 FM - Arema Media Group"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link
                            href="#home"
                            className={`font-semibold transition-colors hover:text-[var(--color-primary)] ${activeSection === 'home' ? 'text-[var(--color-primary)]' : 'text-gray-700'
                                }`}
                        >
                            Beranda
                        </Link>
                        <Link
                            href="#paket"
                            className={`font-semibold transition-colors hover:text-[var(--color-primary)] ${activeSection === 'paket' ? 'text-[var(--color-primary)]' : 'text-gray-700'
                                }`}
                        >
                            Paket Iklan
                        </Link>
                        <Link
                            href="#cara"
                            className={`font-semibold transition-colors hover:text-[var(--color-primary)] ${activeSection === 'cara' ? 'text-[var(--color-primary)]' : 'text-gray-700'
                                }`}
                        >
                            Cara Pesan
                        </Link>
                        <Link
                            href="#kontak"
                            className={`font-semibold transition-colors hover:text-[var(--color-primary)] ${activeSection === 'kontak' ? 'text-[var(--color-primary)]' : 'text-gray-700'
                                }`}
                        >
                            Kontak
                        </Link>
                    </nav>

                    {/* CTA Button */}
                    <Link href="/order" className="hidden lg:block">
                        <button className="btn btn-primary">
                            Pasang Iklan
                        </button>
                    </Link>

                    {/* Mobile Menu Button */}
                    <button className="md:hidden p-2">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    </button>
                </div>
            </div>
        </header>
    );
}
