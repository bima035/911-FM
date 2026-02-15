# Panduan Integrasi Midtrans

## Langkah 1: Daftar Akun Midtrans

1. Kunjungi [https://midtrans.com/](https://midtrans.com/)
2. Daftar akun baru atau login
3. Verifikasi email Anda
4. Lengkapi data perusahaan

## Langkah 2: Dapatkan API Keys

1. Login ke [Dashboard Midtrans](https://dashboard.midtrans.com/)
2. Pilih environment **Sandbox** untuk testing
3. Buka menu **Settings** > **Access Keys**
4. Salin **Client Key** dan **Server Key**

## Langkah 3: Konfigurasi Environment Variables

1. Copy file `.env.example` menjadi `.env.local`:
```bash
copy .env.example .env.local
```

2. Isi dengan API keys Anda:
```env
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxxxxx
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxxxxxxxxx
MIDTRANS_ENVIRONMENT=sandbox
```

## Langkah 4: Install Midtrans Client

```bash
npm install midtrans-client
```

## Langkah 5: Update API Route

Edit file `app/api/payment/route.ts` dan uncomment kode Midtrans:

```typescript
import midtransClient from 'midtrans-client';

const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_ENVIRONMENT === 'production',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
});
```

## Langkah 6: Update Frontend

Edit file `components/AdForm.tsx` pada fungsi `processPayment()`:

```typescript
const processPayment = async () => {
  try {
    const response = await fetch('/api/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nama: formData.nama,
        email: formData.email,
        telepon: formData.telepon,
        paket: formData.paket,
        totalPrice: totalPrice,
      }),
    });

    const data = await response.json();

    if (data.success && data.token) {
      // Redirect to Midtrans payment page
      window.snap.pay(data.token, {
        onSuccess: function(result) {
          alert('Pembayaran berhasil!');
          console.log(result);
        },
        onPending: function(result) {
          alert('Menunggu pembayaran...');
          console.log(result);
        },
        onError: function(result) {
          alert('Pembayaran gagal!');
          console.log(result);
        },
        onClose: function() {
          alert('Anda menutup popup pembayaran');
        }
      });
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Terjadi kesalahan saat memproses pembayaran');
  }
};
```

## Langkah 7: Tambahkan Snap Script

File `app/layout.tsx` sudah include script Midtrans. Pastikan Client Key sudah benar:

```html
<script 
  src="https://app.sandbox.midtrans.com/snap/snap.js" 
  data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
></script>
```

Untuk production, ganti URL menjadi:
```html
<script 
  src="https://app.midtrans.com/snap/snap.js" 
  data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
></script>
```

## Testing

### Sandbox Test Cards

Gunakan kartu test berikut untuk testing di Sandbox:

**Kartu Kredit - Sukses:**
- Card Number: `4811 1111 1111 1114`
- CVV: `123`
- Exp Date: `01/25`
- OTP/3DS: `112233`

**Kartu Kredit - Gagal:**
- Card Number: `4911 1111 1111 1113`
- CVV: `123`
- Exp Date: `01/25`

**GoPay:**
- Nomor HP: `081234567890`
- PIN: `123456`

**BCA Virtual Account:**
- Otomatis generate VA number
- Bayar melalui simulator

### Testing Flow

1. Isi form pemesanan
2. Pilih paket iklan
3. Review data
4. Klik "Bayar Sekarang"
5. Popup Midtrans akan muncul
6. Pilih metode pembayaran
7. Gunakan test credentials di atas
8. Selesaikan pembayaran

## Production Deployment

Sebelum deploy ke production:

1. Ganti environment ke production:
```env
MIDTRANS_ENVIRONMENT=production
```

2. Ganti API keys dengan production keys

3. Update Snap script URL ke production

4. Test thoroughly di sandbox terlebih dahulu

5. Aktifkan production mode di Midtrans Dashboard

## Webhook (Optional)

Untuk menerima notifikasi pembayaran otomatis, setup webhook:

1. Buat endpoint `/api/webhook/midtrans`
2. Set URL di Midtrans Dashboard > Settings > Configuration
3. Verifikasi signature untuk keamanan

## Troubleshooting

**Error: "Merchant not found"**
- Pastikan Server Key benar
- Pastikan environment (sandbox/production) sesuai

**Popup tidak muncul**
- Pastikan Client Key sudah diset
- Cek console browser untuk error
- Pastikan snap.js sudah loaded

**Payment gagal**
- Cek log di Midtrans Dashboard
- Verifikasi data transaction_details
- Pastikan gross_amount dalam format integer

## Support

- [Midtrans Documentation](https://docs.midtrans.com/)
- [Midtrans API Reference](https://api-docs.midtrans.com/)
- [Midtrans Support](https://midtrans.com/contact-us)
