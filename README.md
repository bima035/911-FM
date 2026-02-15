# 🎙️ City Guide 911 FM - Platform Iklan Radio (Frontend)

Website modern untuk pelanggan yang ingin menayangkan iklan di radio **City Guide 911 FM - Arema Media Group**.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)

## ✨ Fitur Utama

### 1. **Multi-Step Form Pemesanan**
Form pemesanan dengan 4 langkah yang intuitif:
- **Step 1**: Input data pelanggan (nama, email, telepon, perusahaan)
- **Step 2**: Upload materi iklan (file audio atau script text)
- **Step 3**: Review dan konfirmasi pesanan
- **Step 4**: Pembayaran (Demo Mode)

### 2. **Flexible Content Upload**
Pelanggan dapat memilih:
- **Upload File Audio**: Upload file MP3/WAV yang sudah jadi
- **Kirim Script Text**: Tulis script untuk diproduksi oleh tim radio
  - Pilihan preferensi suara (pria/wanita/kombinasi)
  - Pilihan background music

### 3. **Paket Iklan Fleksibel**
Tiga pilihan paket:
- **Basic** (Rp 150.000 / 7 hari): 3x tayang, 30 detik
- **Premium** (Rp 350.000 / 14 hari): 5x tayang, 60 detik ⭐ Paling Populer
- **Enterprise** (Rp 650.000 / 30 hari): 8x tayang, 90 detik

### 4. **Modern UI/UX**
- Desain modern dengan gradient dan animasi
- Responsive untuk semua device (mobile, tablet, desktop)
- Smooth transitions dan hover effects
- Custom scrollbar dan loading states

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm atau yarn

### Installation

1. **Navigate ke project:**
```bash
cd C:\Project Magang\radio-ads-nextjs
```

2. **Install dependencies:**
```bash
npm install
```

3. **Run development server:**
```bash
npm run dev
```

4. **Open browser:**
```
http://localhost:3000
```

## 📁 Struktur Project

```
radio-ads-nextjs/
├── app/
│   ├── order/
│   │   ├── success/page.tsx      # Halaman sukses
│   │   ├── pending/page.tsx      # Halaman pending
│   │   ├── error/page.tsx        # Halaman error
│   │   └── page.tsx              # Halaman form order
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
├── components/
│   ├── Header.tsx                # Navigation header
│   ├── Footer.tsx                # Footer dengan links
│   ├── Hero.tsx                  # Hero section
│   ├── Packages.tsx              # Paket iklan
│   ├── AdForm.tsx                # Multi-step form ⭐
│   ├── HowTo.tsx                 # Cara memesan
│   └── Contact.tsx               # Informasi kontak
├── public/
│   └── logo.svg                  # Logo City Guide 911 FM
└── README.md                     # Dokumentasi ini
```

## 🎨 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Fonts**: Inter & Outfit (Google Fonts)

## 🔧 Konfigurasi

### Tailwind CSS
Custom configuration di `app/globals.css`:
- Custom color variables (primary, secondary, accent)
- Reusable component classes (btn, card, input-field)
- Custom animations (float, glow)
- Responsive utilities

## 📝 Cara Menggunakan

### Untuk Pelanggan:

1. **Pilih Paket**
   - Lihat paket iklan yang tersedia
   - Klik "Pilih Paket" pada paket yang diinginkan
   - Otomatis diarahkan ke halaman `/order` dengan paket terpilih

2. **Isi Data Diri**
   - Nama lengkap
   - Email
   - Nomor telepon
   - Nama perusahaan (opsional)

3. **Upload Materi**
   - Pilih upload file audio ATAU tulis script
   - Tambahkan catatan khusus jika diperlukan

4. **Review Pesanan**
   - Periksa kembali semua data
   - Pastikan informasi sudah benar
   - Setujui syarat dan ketentuan

5. **Pembayaran (Demo Mode)**
   - Klik "Lihat Ringkasan Pesanan"
   - Sistem akan menampilkan ringkasan lengkap
   - Redirect ke halaman sukses

## 🎯 Mode Demo

Saat ini aplikasi berjalan dalam **Demo Mode** untuk frontend-only. Fitur:
- ✅ Form lengkap dengan validasi
- ✅ Upload file simulation
- ✅ Review pesanan
- ✅ Halaman success/pending/error
- ⚠️ Pembayaran hanya simulasi (tidak ada transaksi real)

### Untuk Integrasi Midtrans Sebenarnya:

Jika ingin mengintegrasikan payment gateway Midtrans:

1. Buat backend API di `app/api/payment/route.ts`
2. Install: `npm install midtrans-client`
3. Setup environment variables di `.env.local`
4. Uncomment kode Midtrans di `components/AdForm.tsx`
5. Lihat `MIDTRANS_SETUP.md` untuk panduan lengkap

## 📱 Responsive Design

Website sudah fully responsive:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🎨 Customization

### Mengubah Warna:
Edit `app/globals.css`:
```css
:root {
  --color-primary: #00a8e8;      /* Biru utama */
  --color-secondary: #48cae4;    /* Biru sekunder */
  --color-accent: #90e0ef;       /* Aksen */
}
```

### Mengubah Paket Harga:
Edit `components/AdForm.tsx` dan `components/Packages.tsx`:
```typescript
const packagePrices = {
    basic: 150000,
    premium: 350000,
    enterprise: 650000,
};
```

## 📄 License

© 2026 City Guide 911 FM - Arema Media Group. All rights reserved.

## 👨‍💻 Developer

Developed with ❤️ for City Guide 911 FM

## 📞 Support

Untuk pertanyaan atau bantuan:
- Email: iklan@cityguide911fm.com
- Telepon: (0341) 123-4567
- Website: City Guide 911 FM

---

**Status**: ✅ Frontend Ready (Demo Mode)
**Last Updated**: February 12, 2026
