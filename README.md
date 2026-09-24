# scaff-modul-resend

Modul email transaksional **Resend** (struk order, reset password) untuk
[Scaffdev](https://scaffdev.vercel.app) Builder.
Disuntik via `scaff ... --with=resend` (CLI 0.2.0+).

| Framework | Status | Isi |
|---|---|---|
| Next.js | ✅ v1.0.0 | Client kirim email + route (idempotency-aware) |
| Laravel | 🟡 STAGED (v1.1.0) | Service + Controller sudah ditulis, belum disuntik CLI |

## Struktur

```
scaff-modul-resend/
├── scaff.integration.json   ← manifest (satu-satunya yang dibaca CLI)
├── SETUP-FRAGMENT.md        ← digabung ke SETUP.md hasil racikan
├── REMOVE.md                ← panduan copot
├── nextjs/
│   ├── lib/email/resend.ts
│   └── app/api/email/send/route.ts
└── laravel/                 ← STAGED untuk v1.1.0
    ├── app/Services/ResendService.php
    └── app/Http/Controllers/ResendController.php
```

## Env (WAJIB didaftarkan dulu di admin Scaffdev → tabel `integrasi`)

> Tambahkan via admin: kode `resend`, kategori `other`, env di bawah ini.

| Key | Keterangan |
|---|---|
| `RESEND_API_KEY` | API Key (rahasia, server saja) |
| `RESEND_FROM_EMAIL` | Pengirim default (mis. `onboarding@resend.dev` untuk tes) |

## Validasi lokal (sebelum push)

```bash
scaffdev validate-module .
```

## Docs resmi yang dirujuk kode

- Kirim email: https://resend.com/docs/api-reference/emails/send-email
- Idempotency: https://resend.com/docs/dashboard/emails/idempotency-keys
