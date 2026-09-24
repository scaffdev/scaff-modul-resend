import { NextResponse } from "next/server";
import { sendEmail } from "../../../../../lib/email/resend";

/**
 * POST /api/email/send — kirim email transaksional via Resend.
 *
 * NOTED:
 * - Key tetap di server — browser hanya memanggil route ini.
 * - TODO pemilik project: tambahkan auth (hanya server/flow resmi boleh
 *   memicu email) + rate-limit agar tidak dipakai spam.
 * - Untuk email order: SELALU kirim `idempotencyKey` unik per order
 *   (mis. `order-lunas/ORDER-1`) agar retry tidak mengirim dobel.
 *
 * Body: { to, subject, html?, text?, cc?, bcc?, replyTo?, idempotencyKey? }
 * Balikan: { ok: true, id }
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body harus JSON valid" }, { status: 400 });
  }

  const b = (body ?? {}) as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" ? v : undefined);
  const strArr = (v: unknown) =>
    typeof v === "string" ? v : Array.isArray(v) && v.every((x) => typeof x === "string") ? v : undefined;

  if (!strArr(b.to)) {
    return NextResponse.json({ error: "to wajib string/array string (max 50)" }, { status: 400 });
  }
  if (!str(b.subject)?.trim()) {
    return NextResponse.json({ error: "subject wajib diisi" }, { status: 400 });
  }
  if (!str(b.html)?.trim() && !str(b.text)?.trim()) {
    return NextResponse.json({ error: "html atau text wajib diisi salah satu" }, { status: 400 });
  }

  try {
    const result = await sendEmail({
      to: strArr(b.to)!,
      subject: str(b.subject)!.trim(),
      html: str(b.html),
      text: str(b.text),
      cc: strArr(b.cc),
      bcc: strArr(b.bcc),
      replyTo: strArr(b.replyTo),
      idempotencyKey: str(b.idempotencyKey),
    });
    return NextResponse.json({ ok: true, id: result.id });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal mengirim email" },
      { status: 502 }
    );
  }
}
