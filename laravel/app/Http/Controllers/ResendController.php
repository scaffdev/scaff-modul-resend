<?php

namespace App\Http\Controllers;

use App\Services\ResendService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controller Resend — disuntik Scaffdev Builder ke template Laravel.
 *
 * NOTED — daftarkan route manual (mis. di routes/api.php):
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
            'replyTo' => 'nullable',
            'idempotencyKey' => 'nullable|string|max:255',
        ]);
        // NOTED: 'to' boleh string ATAU array (kontrak resmi reply_to/to: string|string[]).
        $toList = is_array($data['to']) ? $data['to'] : [$data['to']];
        foreach ($toList as $addr) {
            abort_if(!is_string($addr) || !filter_var($addr, FILTER_VALIDATE_EMAIL), 422, 'to wajib email valid (string/array email)');
        }
        if (isset($data['replyTo'])) {
            $rtList = is_array($data['replyTo']) ? $data['replyTo'] : [$data['replyTo']];
            foreach ($rtList as $addr) {
                abort_if(!is_string($addr) || !filter_var($addr, FILTER_VALIDATE_EMAIL), 422, 'replyTo wajib email valid (string/array email)');
            }
        }
        abort_if(empty($data['html']) && empty($data['text']), 422, 'html atau text wajib diisi salah satu');

        $result = $this->resend->send($data);

        return response()->json(['ok' => true, 'id' => $result['id']]);
    }
}
