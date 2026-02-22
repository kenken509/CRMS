<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ProposalCheckerController extends Controller
{
    public function index()
    {
        return inertia('Admin/ProposalChecker/Index', [
            'nav' => ['section' => 'admin', 'page' => 'checker'],
            'header' => [
                'title' => 'AI-Assisted Proposal Checker',
                'subtitle' => 'Screen proposed capstone topics for conceptual similarity against existing records.',
            ],
            'categories' => Category::query()
                ->select('id', 'name')
                ->where('is_active', true)
                ->orderBy('name')
                ->get(),
        ]);
    }



    public function check(Request $request)
    {
        $data = $request->validate([
            'title'       => ['required', 'string', 'max:255'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'abstract'    => ['required', 'string'],
            'limit'       => ['nullable', 'integer', 'min:1', 'max:20'],
            'threshold'   => ['nullable', 'numeric', 'min:0', 'max:1'],
        ]);

        set_time_limit(120);
        ini_set('max_execution_time', '120');

        $limit = (int)($data['limit'] ?? 5);
        $threshold = (float)($data['threshold'] ?? 0.80);

        $ollamaBase = rtrim((string) config('services.ollama.base_url'), '/');
        $embedModel = (string) config('services.ollama.embed_model');

        $qUrl       = rtrim((string) config('services.qdrant.url'), '/');
        $qApiKey    = (string) config('services.qdrant.api_key');
        $collection = (string) config('services.qdrant.collection');

        $qHeaders = [];
        if (!empty($qApiKey)) $qHeaders['api-key'] = $qApiKey;

        $categoryName = Category::query()->whereKey($data['category_id'])->value('name') ?? 'Uncategorized';

        $embedText = trim(implode("\n", [
            "Title: " . trim($data['title']),
            "Category: " . trim($categoryName),
            "Abstract: " . trim($data['abstract']),
        ]));

        try {
            // 1) Embed proposal
            $embRes = Http::connectTimeout(5)
                ->timeout(60)
                ->post("{$ollamaBase}/api/embeddings", [
                    'model'  => $embedModel,
                    'prompt' => $embedText,
                ]);

            if (!$embRes->successful()) {
                return response()->json([
                    'message' => 'Embedding service is unavailable.',
                    'detail'  => $embRes->body(),
                ], 503);
            }

            $vector = $embRes->json('embedding');
            if (!is_array($vector) || empty($vector)) {
                return response()->json(['message' => 'Invalid embedding returned.'], 503);
            }

            $vector = array_map('floatval', $vector);

            // 2) Search (with 1 retry after creating payload index if needed)
            $payloadFilter = [
                'must' => [[
                    'key' => 'category_id',
                    'match' => ['value' => (int) $data['category_id']],
                ]],
            ];

            $results = $this->qdrantSearchWithAutoIndex(
                qUrl: $qUrl,
                collection: $collection,
                headers: $qHeaders,
                vector: $vector,
                limit: $limit,
                filter: $payloadFilter,
            );

            // 3) Apply threshold
            $matches = array_values(array_filter($results, function ($r) use ($threshold) {
                return (float)($r['score'] ?? 0) >= $threshold;
            }));

            return response()->json([
                'message' => 'Similarity check completed.',
                'query' => [
                    'title' => $data['title'],
                    'category_id' => (int) $data['category_id'],
                    'category' => $categoryName,
                    'abstract' => $data['abstract'],
                    'threshold' => $threshold,
                    'limit' => $limit,
                ],
                'matches' => $matches,
                'raw' => $results,
            ]);
        } catch (\Throwable $e) {
            Log::error('Proposal checker failed.', [
                'error' => $e->getMessage(),
                'user_id' => optional($request->user())->id,
            ]);

            return response()->json([
                'message' => 'Unable to check similarity right now. Please try again.',
            ], 503);
        }
    }

/**
 * Runs Qdrant search. If Qdrant complains about missing payload index for category_id,
 * it creates the index and retries once.
 */
    private function qdrantSearchWithAutoIndex(
        string $qUrl,
        string $collection,
        array $headers,
        array $vector,
        int $limit,
        array $filter
    ): array {
        $endpoint = "{$qUrl}/collections/{$collection}/points/search";

        $doSearch = function () use ($endpoint, $headers, $vector, $limit, $filter) {
            return Http::withHeaders($headers)
                ->timeout(20)
                ->post($endpoint, [
                    'vector' => $vector,
                    'limit' => $limit,
                    'with_payload' => true,
                    'filter' => $filter,
                ]);
        };

        $searchRes = $doSearch();

        if ($searchRes->successful()) {
            return $searchRes->json('result') ?? [];
        }

        $status = $searchRes->status();
        $body = $searchRes->body();

        Log::error('Qdrant search failed', [
            'status' => $status,
            'body'   => $body,
            'url'    => $endpoint,
        ]);

        // Detect the specific missing-index error
        $looksLikeMissingIndex =
            $status === 400 &&
            str_contains($body, 'Index required but not found') &&
            str_contains($body, '"category_id"');

        if (!$looksLikeMissingIndex) {
            throw new \RuntimeException("Qdrant search failed: {$status} {$body}");
        }

        // Create payload index for category_id (integer)
        $idxRes = Http::withHeaders($headers)
            ->timeout(20)
            ->put("{$qUrl}/collections/{$collection}/index", [
                'field_name' => 'category_id',
                'field_schema' => 'integer',
            ]);

        if (!$idxRes->successful()) {
            Log::error('Qdrant create index failed', [
                'status' => $idxRes->status(),
                'body'   => $idxRes->body(),
            ]);
            throw new \RuntimeException("Qdrant index creation failed: {$idxRes->status()} {$idxRes->body()}");
        }

        // Retry once
        $retryRes = $doSearch();

        if (!$retryRes->successful()) {
            throw new \RuntimeException("Qdrant search retry failed: {$retryRes->status()} {$retryRes->body()}");
        }

        return $retryRes->json('result') ?? [];
    }
}
