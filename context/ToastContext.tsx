'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'success') => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto remove after 3 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    const removeToast = (id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-slide-in shadow-black/10 border backdrop-blur-md transition-all ${toast.type === 'success' ? 'bg-green-500/90 border-green-400 text-white' :
                                toast.type === 'error' ? 'bg-red-500/90 border-red-400 text-white' :
                                    toast.type === 'warning' ? 'bg-amber-500/90 border-amber-400 text-white' :
                                        'bg-blue-500/90 border-blue-400 text-white'
                            }`}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-white/20`}>
                            {toast.type === 'success' && '✓'}
                            {toast.type === 'error' && '✕'}
                            {toast.type === 'warning' && '⚠'}
                            {toast.type === 'info' && 'ℹ'}
                        </div>
                        <p className="font-bold text-sm tracking-wide">{toast.message}</p>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="ml-4 hover:scale-110 transition-transform opacity-50 hover:opacity-100"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>

            <style jsx global>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in {
          animation: slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
