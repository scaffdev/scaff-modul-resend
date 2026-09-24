/**
 * Client Resend (email transaksional) — disuntik Scaffdev Builder ke template Next.js.
 *
 * NOTED:
 * - File ini 100% milik modul "resend". Jangan import dari kode inti template.
 * - API Key HANYA di server. Sengaja pakai REST langsung (tanpa SDK) agar
 *   modul tanpa dependency tambahan — kontrak request-nya 1:1 dengan docs.
 * - Cocok untuk: struk order, reset password, notifikasi admin.
 *
 * Referensi resmi:
 * - Kirim email : https://resend.com/docs/api-reference/emails/send-email
 * - Idempotency : https://resend.com/docs/dashboard/emails/idempotency-keys
 */

function apiKey(): string {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("MISSING_ENV: isi RESEND_API_KEY di .env.local");
  return key;
}

export interface EmailParams {
  /** Penerima. NOTED: array max 50 alamat (batas resmi). */
  to: string | string[];
  subject: string;
  /** Salah satu wajib diisi. `text` dibuat otomatis dari `html` bila kosong. */
  html?: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string | string[];
  /**
   * Kunci idempotency, mis. `order-lunas/ORDER-1`.
   * NOTED (best practice untuk email order): request yang sama persis tidak
   * dikirim 2x walau di-retry (mis. webhook payment retry) — Resend
   * mengembalikan hasil kiriman pertama. WAJIB unik per email logis.
   */
  idempotencyKey?: string;
}

export interface EmailResult {
  id: string;
}

/** Kirim 1 email. Return id email (untuk pelacakan di dashboard Resend). */
export async function sendEmail(params: EmailParams): Promise<EmailResult> {
  const to = Array.isArray(params.to) ? params.to : [params.to];
  if (to.length === 0 || to.length > 50) throw new Error("to wajib 1–50 alamat");
  if (!params.subject?.trim()) throw new Error("subject wajib diisi");
  if (!params.html?.trim() && !params.text?.trim()) {
    throw new Error("html atau text wajib diisi salah satu");
  }

  // NOTED: pengirim default dari env agar ganti domain cukup ubah 1 tempat.
  // Format resmi mendukung nama ramah: "Toko Saya <order@tokosaya.id>".
  const from = process.env.RESEND_FROM_EMAIL;
  if (!from) throw new Error("MISSING_ENV: isi RESEND_FROM_EMAIL (mis. onboarding@resend.dev untuk tes)");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      // NOTED: format resmi = "Bearer re_xxx" (beda dengan fonnte/xendit!).
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
      ...(params.idempotencyKey ? { "Idempotency-Key": params.idempotencyKey } : {}),
    },
    body: JSON.stringify({
      from,
      to,
      subject: params.subject,
      ...(params.html ? { html: params.html } : {}),
      ...(params.text ? { text: params.text } : {}),
      ...(params.cc ? { cc: params.cc } : {}),
      ...(params.bcc ? { bcc: params.bcc } : {}),
      ...(params.replyTo ? { reply_to: params.replyTo } : {}),
    }),
  });

  if (!res.ok) throw new Error(`Resend error ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { id: string };
  return { id: data.id };
}
