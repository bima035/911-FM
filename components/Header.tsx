'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function Header() {
    const { user, logout } = useAuth();
    const { showToast } = useToast();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
                        {user?.role !== 'admin' && (
                            <>
                                <a href="https://cityguide911fm.com/" target="_blank" rel="noopener noreferrer" className="font-semibold text-gray-700 hover:text-[var(--color-primary)] transition-colors">
                                    Profile
                                </a>
                                <Link href="/#home" className="font-semibold text-gray-700 hover:text-[var(--color-primary)] transition-colors">
                                    Beranda
                                </Link>
                                <Link href="/#paket" className="font-semibold text-gray-700 hover:text-[var(--color-primary)] transition-colors">
                                    Paket Iklan
                                </Link>
                            </>
                        )}
                        {user && (
                            <>
                                <Link href={user.role === 'admin' ? '/admin' : '/dashboard'} className="font-semibold text-gray-700 hover:text-[var(--color-primary)] transition-colors">
                                    {user.role === 'admin' ? 'Dashboard' : 'Riwayat Iklan'}
                                </Link>
                                {user.role !== 'admin' && (
                                    <Link href="/timeline" className="font-semibold text-gray-700 hover:text-[var(--color-primary)] transition-colors">
                                        Timeline Siar
                                    </Link>
                                )}
                            </>
                        )}
                    </nav>

                    {/* CTA/Auth Button */}
                    <div className="hidden md:flex items-center gap-4">
                        {!user ? (
                            <>
                                <Link href="/login" className="font-semibold text-gray-700 hover:text-[var(--color-primary)]">
                                    Login
                                </Link>
                                <Link href="/register" className="btn btn-primary px-6">
                                    Register
                                </Link>
                            </>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link href="/profile" className="flex items-center gap-3 hover:bg-gray-50 px-3 py-1.5 rounded-xl transition-all cursor-pointer border border-transparent hover:border-gray-100 group">
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">{user.nama}</p>
                                        <p className="text-[10px] text-[var(--color-primary)] font-bold capitalize">{user.role}</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                                        {user.foto_profil ? (
                                            <img src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/uploads/profiles/${user.foto_profil}`} alt={user.nama} className="w-full h-full object-cover" />
                                        ) : (
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                                <circle cx="12" cy="7" r="4"></circle>
                                            </svg>
                                        )}
                                    </div>
                                </Link>
                                {user.role === 'user' && (
                                    <Link href="/order" className="btn btn-primary px-6">
                                        Pasang Iklan
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button className="md:hidden p-2 text-gray-700" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            {isMobileMenuOpen ? (
                                <>
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </>
                            ) : (
                                <>
                                    <line x1="3" y1="12" x2="21" y2="12"></line>
                                    <line x1="3" y1="6" x2="21" y2="6"></line>
                                    <line x1="3" y1="18" x2="21" y2="18"></line>
                                </>
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden glass-effect border-t border-gray-100 py-4 absolute top-full left-0 right-0 shadow-lg">
                    <div className="container flex flex-col gap-4">
                        {user?.role !== 'admin' && (
                            <>
                                <a href="https://cityguide911fm.com/" target="_blank" rel="noopener noreferrer" onClick={() => setIsMobileMenuOpen(false)}>Profile</a>
                                <Link href="/#home" onClick={() => setIsMobileMenuOpen(false)}>Beranda</Link>
                                <Link href="/#paket" onClick={() => setIsMobileMenuOpen(false)}>Paket Iklan</Link>
                            </>
                        )}
                        {user ? (
                            <>
                                <Link href={user.role === 'admin' ? '/admin' : '/dashboard'} onClick={() => setIsMobileMenuOpen(false)}>
                                    {user.role === 'admin' ? 'Dashboard' : 'Riwayat Iklan'}
                                </Link>
                                {user.role !== 'admin' && (
                                    <Link href="/timeline" onClick={() => setIsMobileMenuOpen(false)}>
                                        Timeline Siar
                                    </Link>
                                )}
                                <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                                    Profil Saya
                                </Link>
                                <button onClick={() => {
                                    logout();
                                    setIsMobileMenuOpen(false);
                                    showToast('Anda telah keluar.', 'info');
                                }} className="text-left text-red-500 font-bold">Logout</button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>Register</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
