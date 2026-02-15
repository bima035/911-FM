export default function HowTo() {
    const steps = [
        {
            number: '01',
            icon: '📝',
            title: 'Isi Data Diri',
            description: 'Lengkapi informasi kontak dan pilih paket iklan yang sesuai',
        },
        {
            number: '02',
            icon: '📤',
            title: 'Upload Materi',
            description: 'Upload file audio atau kirim script untuk kami produksi',
        },
        {
            number: '03',
            icon: '✅',
            title: 'Review Pesanan',
            description: 'Periksa kembali data dan materi iklan sebelum pembayaran',
        },
        {
            number: '04',
            icon: '💳',
            title: 'Bayar & Selesai',
            description: 'Lakukan pembayaran melalui Midtrans dan iklan siap tayang',
        },
    ];

    return (
        <section id="cara" className="py-20 bg-gradient-to-b from-[var(--color-light)]/30 to-white">
            <div className="container">
                <h2 className="section-title">Cara Memesan Iklan</h2>
                <p className="section-subtitle">Proses mudah dalam 4 langkah sederhana</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className="card text-center hover:scale-105 transition-transform relative"
                        >
                            <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                {step.number}
                            </div>
                            <div className="text-5xl mb-4">{step.icon}</div>
                            <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                            <p className="text-gray-600">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
