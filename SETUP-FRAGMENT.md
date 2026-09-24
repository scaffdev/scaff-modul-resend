## Setup Resend (digabung otomatis ke SETUP.md)

> 3 langkah, ±5 menit. Gratis 100 email/hari + 3.000/bulan.
> Docs resmi: https://resend.com/docs/send-with-nodejs

### 1. Ambil API Key

1. Daftar/login di https://resend.com → **API Keys** → **Create API Key**.
2. Untuk testing, pengirim boleh `onboarding@resend.dev` (tanpa verifikasi domain).
3. Untuk produksi, verifikasi domainmu di **Domains** lalu pakai
   `Toko Saya <order@tokosaya.id>` sebagai pengirim.

### 2. Isi env

```bash
RESEND_API_KEY=re_xxxx          # rahasia! server saja, tanpa NEXT_PUBLIC_
RESEND_FROM_EMAIL=onboarding@resend.dev   # ganti domain sendiri saat produksi
```

### 3. Coba kirim

`POST /api/email/send` dengan body:

```json
{
  "to": "customer@example.com",
  "subject": "Pesanan ORDER-1 lunas!",
  "html": "<p>Terima kasih sudah belanja.</p>",
  "idempotencyKey": "order-lunas/ORDER-1"
}
```

NOTED: `idempotencyKey` WAJIB unik per email logis (contoh di atas per order).
Tanpa ini, retry webhook payment bisa mengirim struk dobel ke customer.
