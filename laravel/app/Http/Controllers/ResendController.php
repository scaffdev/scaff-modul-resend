<?php

namespace App\Http\Controllers;

use App\Services\ResendService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controller Resend — STAGED untuk dukungan Laravel (aktif di v1.1.0).
 *
 * NOTED — daftarkan route manual saat v1.1.0 rilis:
 *   Route::post('/api/email/send', [ResendController::class, 'send']);
 * TODO pemilik project: auth + rate-limit agar tidak dipakai spam.
 */
class ResendController extends Controller
{
    public function __construct(protected ResendService $resend) {}

    /** POST /api/email/send */
    public function send(Request $request): JsonResponse
    {
        $data = $request->validate([
            'to' => 'required',
            'to.*' => 'email|max:255',
            'subject' => 'required|string|max:255',
            'html' => 'nullable|string',
            'text' => 'nullable|string',
            'cc' => 'nullable',
            'bcc' => 'nullable',
            'replyTo' => 'nullable|string|max:255',
            'idempotencyKey' => 'nullable|string|max:255',
        ]);
        abort_if(empty($data['html']) && empty($data['text']), 422, 'html atau text wajib diisi salah satu');

        $result = $this->resend->send($data);

        return response()->json(['ok' => true, 'id' => $result['id']]);
    }
}
