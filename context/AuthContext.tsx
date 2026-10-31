'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

interface User {
    id: number;
    nama: string;
    username?: string;
    email: string;
    telepon?: string;
    foto_profil?: string;
    role: 'user' | 'admin';
    nama_perusahaan?: string;
    jenis_usaha?: string;
    alamat_perusahaan?: string;
    media_sosial?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, userData: User) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Muat data dari cookies saat inisialisasi
        const savedToken = Cookies.get('token');
        const savedUser = Cookies.get('user');

        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }
        setIsLoading(false);
    }, []);

    const login = (newToken: string, userData: User) => {
        setToken(newToken);
        setUser(userData);

        // Simpan ke cookies (7 hari)
        Cookies.set('token', newToken, { expires: 7 });
        Cookies.set('user', JSON.stringify(userData), { expires: 7 });
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        Cookies.remove('token');
        Cookies.remove('user');
        router.push('/');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
