<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

/**
 * Service Resend — disuntik Scaffdev Builder ke template Laravel.
 *
 * NOTED:
 * - File ini 100% milik modul "resend" (lihat scaff.integration.json).
 * - REST langsung 1:1 docs (tanpa SDK): POST https://api.resend.com/emails,
 *   header "Authorization: Bearer re_xxx".
 *   Ref: https://resend.com/docs/api-reference/emails/send-email
 */
class ResendService
{
    /** Kirim 1 email. Return ['id' => ...]. */
    public function send(array $p): array
    {
        $key = config('services.resend.api_key');
        $from = config('services.resend.from_email');
        abort_if(empty($key) || empty($from), 500, 'Isi RESEND_API_KEY & RESEND_FROM_EMAIL');

        $to = is_array($p['to'] ?? null) ? $p['to'] : [$p['to'] ?? null];
        $to = array_values(array_filter($to));
        abort_if(count($to) === 0 || count($to) > 50, 422, 'to wajib 1–50 alamat');
        abort_if(empty($p['subject']) || (empty($p['html']) && empty($p['text'])), 422, 'subject + html/text wajib diisi');

        $payload = array_filter([
            'from' => $from,
            'to' => $to,
            'subject' => $p['subject'],
            'html' => $p['html'] ?? null,
            'text' => $p['text'] ?? null,
            'cc' => $p['cc'] ?? null,
            'bcc' => $p['bcc'] ?? null,
            'reply_to' => $p['replyTo'] ?? null,
        ]);

        $headers = [];
        // NOTED: idempotency mencegah email order terkirim dobel saat retry.
        if (! empty($p['idempotencyKey'])) {
            $headers['Idempotency-Key'] = $p['idempotencyKey'];
        }

        $res = Http::withToken($key)->withHeaders($headers)->post('https://api.resend.com/emails', $payload);

        return ['id' => $res->throw()->json('id')];
    }
}
