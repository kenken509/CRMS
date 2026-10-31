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
            'nav' => [
                'section' => 'admin',
                'page' => 'checker',
            ],
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
        // 1. Validate request
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],

            'category_id' => [
                'required',
                function ($attribute, $value, $fail) {
                    if ($value === 'all') {
                        return;
                    }

                    if (
                        !is_numeric($value) ||
                        !Category::whereKey((int) $value)->exists()
                    ) {
                        $fail('The selected category is invalid.');
                    }
                },
            ],

            'abstract' => ['required', 'string'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:20'],
            'threshold' => ['nullable', 'numeric', 'min:0', 'max:1'],
        ]);

        set_time_limit(120);
        ini_set('max_execution_time', '120');

        $limit = (int) ($data['limit'] ?? 5);
        $threshold = (float) ($data['threshold'] ?? 0.80);

        $isAllCategories = $data['category_id'] === 'all';

        // 2. Load service configurations
        $ollamaBase = rtrim(
            (string) config('services.ollama.base_url'),
            '/'
        );

        $embedModel = (string) config('services.ollama.embed_model');

        $qUrl = rtrim(
            (string) config('services.qdrant.url'),
            '/'
        );

        $qApiKey = (string) config('services.qdrant.api_key');

        $collection = (string) config('services.qdrant.collection');

        $qHeaders = [];

        if (!empty($qApiKey)) {
            $qHeaders['api-key'] = $qApiKey;
        }

        // 3. Determine selected category
        $categoryName = $isAllCategories
            ? 'All Categories'
            : (
                Category::whereKey($data['category_id'])->value('name')
                ?? 'Uncategorized'
            );

        // 4. Prepare embedding text
        $embedParts = [
            'Title: ' . trim($data['title']),
        ];

        // Include category context only for specific category searches
        if (!$isAllCategories) {
            $embedParts[] = 'Category: ' . $categoryName;
        }

        $embedParts[] = 'Abstract: ' . trim($data['abstract']);

        $embedText = trim(implode("\n", $embedParts));

        try {

            // 5. Generate embedding using Ollama
            $embRes = Http::connectTimeout(5)
                ->timeout(60)
                ->post("{$ollamaBase}/api/embeddings", [
                    'model' => $embedModel,
                    'prompt' => $embedText,
                ]);

            if (!$embRes->successful()) {
                Log::error('Ollama embedding request failed.', [
                    'status' => $embRes->status(),
                    'body' => $embRes->body(),
                    'model' => $embedModel,
                ]);

                return response()->json([
                    'message' => 'Embedding service is unavailable.',
                ], 503);
            }

            $vector = $embRes->json('embedding');

            if (!is_array($vector) || empty($vector)) {
                Log::error('Invalid embedding returned by Ollama.', [
                    'model' => $embedModel,
                    'response' => $embRes->body(),
                ]);

                return response()->json([
                    'message' => 'Invalid embedding returned.',
                ], 503);
            }

            $vector = array_map('floatval', $vector);

            // 6. Build Qdrant payload filter
            // All Categories = no filter
            // Specific Category = filter by category_id
            $payloadFilter = null;

            if (!$isAllCategories) {
                $payloadFilter = [
                    'must' => [[
                        'key' => 'category_id',
                        'match' => [
                            'value' => (int) $data['category_id'],
                        ],
                    ]],
                ];
            }

            // 7. Search Qdrant
            $results = $this->qdrantSearchWithAutoIndex(
                qUrl: $qUrl,
                collection: $collection,
                headers: $qHeaders,
                vector: $vector,
                limit: $limit,
                filter: $payloadFilter,
            );

            // 8. Apply similarity threshold
            $matches = array_values(array_filter(
                $results,
                function ($result) use ($threshold) {
                    return (float) ($result['score'] ?? 0) >= $threshold;
                }
            ));

            // 9. Return results
            return response()->json([
                'message' => 'Similarity check completed.',

                'query' => [
                    'title' => $data['title'],

                    'category_id' => $isAllCategories
                        ? 'all'
                        : (int) $data['category_id'],

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
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Unable to check similarity right now. Please try again.',
            ], 503);
        }
    }

    /**
     * Search Qdrant.
     *
     * If a category filter is used and Qdrant reports
     * a missing category_id payload index, create it
     * automatically and retry the search once.
     *
     * A null filter means search across all categories.
     */
    private function qdrantSearchWithAutoIndex(
        string $qUrl,
        string $collection,
        array $headers,
        array $vector,
        int $limit,
        ?array $filter
    ): array {

        $endpoint = "{$qUrl}/collections/{$collection}/points/search";

        // Build search request
        $doSearch = function () use (
            $endpoint,
            $headers,
            $vector,
            $limit,
            $filter
        ) {

            $payload = [
                'vector' => $vector,
                'limit' => $limit,
                'with_payload' => true,
            ];

            // Apply filter only when a specific category is selected
            if ($filter !== null) {
                $payload['filter'] = $filter;
            }

            return Http::withHeaders($headers)
                ->timeout(20)
                ->post($endpoint, $payload);
        };

        // First search attempt
        $searchRes = $doSearch();

        if ($searchRes->successful()) {
            return $searchRes->json('result') ?? [];
        }

        $status = $searchRes->status();
        $body = $searchRes->body();

        Log::error('Qdrant search failed.', [
            'status' => $status,
            'body' => $body,
            'url' => $endpoint,
        ]);

        // No need to create an index for an unfiltered search
        if ($filter === null) {
            throw new \RuntimeException(
                "Qdrant search failed: {$status} {$body}"
            );
        }

        // Decode the actual Qdrant error message
        $errorMessage = $searchRes->json('status.error') ?? $body;

        // Detect missing category_id index
        $looksLikeMissingIndex =
            $status === 400 &&
            str_contains($errorMessage, 'Index required but not found') &&
            str_contains($errorMessage, 'category_id');

        if (!$looksLikeMissingIndex) {
            throw new \RuntimeException(
                "Qdrant search failed: {$status} {$body}"
            );
        }

        Log::info('Creating missing Qdrant category_id payload index.', [
            'collection' => $collection,
        ]);

        // Create integer payload index
        $idxRes = Http::withHeaders($headers)
            ->timeout(20)
            ->put(
                "{$qUrl}/collections/{$collection}/index",
                [
                    'field_name' => 'category_id',
                    'field_schema' => 'integer',
                ]
            );

        if (!$idxRes->successful()) {

            Log::error('Qdrant create index failed.', [
                'status' => $idxRes->status(),
                'body' => $idxRes->body(),
            ]);

            throw new \RuntimeException(
                "Qdrant index creation failed: {$idxRes->status()} {$idxRes->body()}"
            );
        }

        Log::info('Qdrant category_id payload index created.', [
            'collection' => $collection,
        ]);

        // Retry search once after index creation
        $retryRes = $doSearch();

        if (!$retryRes->successful()) {

            Log::error('Qdrant search retry failed.', [
                'status' => $retryRes->status(),
                'body' => $retryRes->body(),
            ]);

            throw new \RuntimeException(
                "Qdrant search retry failed: {$retryRes->status()} {$retryRes->body()}"
            );
        }

        return $retryRes->json('result') ?? [];
    }
}
