# Cara mencopot Resend

> Dibutuhkan bila kamu ganti layanan email lain (mis. via Scaffdev Builder).
> Estimasi: ±5 menit. Ikuti berurutan — jangan loncat.

## 0. Aturan emas (baca dulu!)

- Hapus **HANYA** file di bagian 1. File lain **JANGAN PERNAH** dihapus.
- Kalau ragu satu file, BERHENTI dan tanya pembuat template.

---

## A. Template Next.js

### A.1. Hapus file (aman — tidak dipakai kode lain)

- `lib/email/resend.ts` — client kirim email.
- `app/api/email/send/route.ts` — route kirim email.

```bash
rm lib/email/resend.ts "app/api/email/send/route.ts"
```

### A.2. Hapus env (dari `.env.local`)

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

Hapus barisnya, jangan dikosongkan saja.

### A.3. Bersihkan dependency

Tidak ada dependency tambahan (modul ini memakai `fetch` bawaan Node).

### A.4. Verifikasi (wajib lolos semua)

```bash
npm run build
```

```bash
grep -ri "resend" app lib components
```

- Build harus sukses.
- Grep harus menghasilkan **0 baris**. Bila masih ada sisa (mis. pemanggilan
  email setelah checkout), hapus pemakaiannya, lalu build ulang.

### A.5. Yang JANGAN dihapus

- Template HTML email umum (bila ada — itu milik template, bukan modul).
- `package.json`, `.env.local` (cukup hapus baris env-nya), layout, config.

---

## B. Template Laravel

Modul ini v1.0.0 mendukung Next.js saja. File `laravel/` berstatus STAGED
(belum disuntik CLI) sehingga tidak ada yang perlu dicopot.
Berlaku mulai v1.1.0 — panduan section B akan ditambahkan saat itu.
