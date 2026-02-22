<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class AiStatusController extends Controller
{
    public function status()
    {
        $baseUrl = rtrim(config('services.ollama.base_url'), '/');
        $model   = config('services.ollama.embed_model');

        $warmedUntil = Cache::get('ollama_warmed_until');

        try {
            $res = Http::timeout(2)->get("{$baseUrl}/api/tags");

            if (!$res->successful()) {
                return response()->json([
                    'ollama_reachable' => false,
                    'model_available' => false,
                    'model' => $model,
                    'warmed' => false,
                ], 200);
            }

            $models = collect($res->json('models') ?? [])->pluck('name')->all();
            $modelAvailable = collect($models)->contains(fn ($m) => str_contains($m, $model));

            return response()->json([
                'ollama_reachable' => true,
                'model_available' => $modelAvailable,
                'model' => $model,
                'warmed' => $warmedUntil ? now()->lt($warmedUntil) : false,
                'warmed_until' => $warmedUntil,
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'ollama_reachable' => false,
                'model_available' => false,
                'model' => $model,
                'warmed' => false,
            ], 200);
        }
    }

    public function warmup()
    {
        $baseUrl = rtrim(config('services.ollama.base_url'), '/');
        $model   = config('services.ollama.embed_model');

        $warmedUntil = Cache::get('ollama_warmed_until');
        if ($warmedUntil && now()->lt($warmedUntil)) {
            return response()->json(['warmed' => true, 'reason' => 'already_warmed'], 200);
        }

        $lock = Cache::lock('ollama_warmup_lock', 30);
        if (!$lock->get()) {
            return response()->json(['warmed' => false, 'reason' => 'already_warming'], 200);
        }

        try {
            set_time_limit(120);

            $res = Http::timeout(25)->post("{$baseUrl}/api/embeddings", [
                'model' => $model,
                'prompt' => 'warmup',
            ]);

            if (!$res->successful()) {
                return response()->json(['warmed' => false, 'reason' => 'embed_failed'], 200);
            }

            $until = now()->addMinutes(10);
            Cache::put('ollama_warmed_until', $until, $until);

            return response()->json(['warmed' => true, 'warmed_until' => $until], 200);
        } catch (\Throwable $e) {
            return response()->json(['warmed' => false, 'reason' => 'timeout_or_unreachable'], 200);
        } finally {
            optional($lock)->release();
        }
    }
}