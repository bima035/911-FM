export default function Contact() {
    const contacts = [
        {
            icon: '📞',
            title: 'Telepon',
            value: '(0341) 123-4567',
        },
        {
            icon: '📧',
            title: 'Email',
            value: 'iklan@cityguide911fm.com',
        },
        {
            icon: '📍',
            title: 'Alamat',
            value: 'Jl. Radio No. 911, Malang',
        },
        {
            icon: '⏰',
            title: 'Jam Operasional',
            value: 'Senin - Jumat: 08:00 - 17:00',
        },
    ];

    return (
        <section id="kontak" className="py-20 bg-white">
            <div className="container">
                <h2 className="section-title">Hubungi Kami</h2>
                <p className="section-subtitle">Ada pertanyaan? Tim kami siap membantu Anda</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                    {contacts.map((contact, index) => (
                        <div
                            key={index}
                            className="card text-center hover:scale-105 transition-transform"
                        >
                            <div className="text-5xl mb-4">{contact.icon}</div>
                            <h3 className="text-lg font-bold mb-2 text-gray-700">{contact.title}</h3>
                            <p className="text-[var(--color-primary)] font-semibold">{contact.value}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
