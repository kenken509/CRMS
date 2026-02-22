<?php

namespace App\Http\Controllers;

use App\Models\Capstone;
use App\Models\Category;
use Illuminate\Database\QueryException;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class CapstoneController extends Controller
{
    public function index(){
        return inertia('Admin/Capstones/Index', [
            'nav' => [
                'section' => 'admin',
                'page' => 'capstones',
            ],
            'header' => [
                'title' => 'Capstones',
                'subtitle' => 'Manage submitted capstone records',
            ],
        ]);
    }

    public function all(Request $request)
    {
        $q = trim((string) $request->get('q', ''));
        $perPage = max(1, min((int) $request->get('per_page', 10), 50));

        $categoryId = $request->integer('category_id'); // null if not provided
        $academicYear = trim((string) $request->get('academic_year', ''));

        $capstones = Capstone::query()
            ->with(['category:id,name', 'creator:id,name'])

            // filters
            ->when($categoryId, fn ($query) => $query->where('category_id', $categoryId))
            ->when($academicYear !== '', fn ($query) => $query->where('academic_year', $academicYear))

            // search
            ->when($q !== '', function ($query) use ($q) {
                $query->where(function ($qq) use ($q) {
                    $qq->where('title', 'like', "%{$q}%")
                        ->orWhere('abstract', 'like', "%{$q}%")
                        ->orWhere('authors', 'like', "%{$q}%")
                        ->orWhere('adviser', 'like', "%{$q}%")
                        ->orWhere('academic_year', 'like', "%{$q}%");
                });
            })

            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();

        return response()->json($capstones);
    }

     public function create()
    {
        $categories = Category::query()
            ->select('id', 'name')
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return inertia('Admin/Capstones/Create', [
            'nav' => ['section' => 'admin', 'page' => 'capstones'],
            'header' => [
                'title' => 'Add Capstone',
                'subtitle' => 'Encode a new capstone record',
            ],
            'categories' => $categories,
        ]);
    }    

    public function archived(Request $request)
    {
        $q = trim((string) $request->get('q', ''));
        $perPage = max(1, min((int) $request->get('per_page', 10), 50));

        $categoryId = $request->integer('category_id');
        $academicYear = trim((string) $request->get('academic_year', ''));

        $capstones = Capstone::onlyTrashed()
            ->with(['category:id,name', 'creator:id,name'])

            // filters
            ->when($categoryId, fn ($query) => $query->where('category_id', $categoryId))
            ->when($academicYear !== '', fn ($query) => $query->where('academic_year', $academicYear))

            // search
            ->when($q !== '', function ($query) use ($q) {
                $query->where(function ($qq) use ($q) {
                    $qq->where('title', 'like', "%{$q}%")
                        ->orWhere('abstract', 'like', "%{$q}%")
                        ->orWhere('authors', 'like', "%{$q}%")
                        ->orWhere('adviser', 'like', "%{$q}%")
                        ->orWhere('academic_year', 'like', "%{$q}%");
                });
            })

            ->orderByDesc('deleted_at')
            ->paginate($perPage)
            ->withQueryString();

        return response()->json($capstones);
    }

    public function toggle(Capstone $capstone)
    {
        $capstone->is_active = !$capstone->is_active;
        $capstone->save();

        return response()->json([
            'message' => $capstone->is_active
                ? 'Capstone activated.'
                : 'Capstone deactivated.',
        ]);
    }

    public function show($id)
    {
        $capstone = \App\Models\Capstone::withTrashed()
            ->with([
                'category:id,name',
                'creator:id,name',
            ])
            ->findOrFail($id);

        return inertia('Admin/Capstones/Show', [
            'nav' => ['section' => 'admin', 'page' => 'capstones'],
            'header' => [
                'title' => 'Capstone Preview',
                'subtitle' => 'View complete information for this capstone project.',
            ],
            'capstone' => $capstone,
        ]);
    }

    public function archive(Capstone $capstone)
    {
        $capstone->delete();

        return response()->json([
            'message' => 'Capstone archived.',
        ]);
    }

    public function restore($id)
    {
        $capstone = Capstone::onlyTrashed()->findOrFail($id);
        $capstone->restore();

        return response()->json([
            'message' => 'Capstone restored.',
        ]);
    }


    public function edit($id)
    {
        $capstone = Capstone::query()->findOrFail($id);

        $categories = Category::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return inertia('Admin/Capstones/Edit', [
            'nav' => ['section' => 'admin', 'page' => 'capstones'],
            'header' => [
                'title' => 'Edit Capstone Record',
                'subtitle' => 'Modify the details of the selected capstone project.',
            ],
            'capstone' => $capstone,
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, $id)
    {
        $capstone = Capstone::query()->findOrFail($id);

        $data = $request->validate([
            'title' => [
                'required',
                'string',
                'max:255',
                Rule::unique('capstones', 'title')->ignore($capstone->id),
            ],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'abstract' => ['required', 'string'],

            'academic_year' => ['nullable', 'string', 'max:50'],
            'authors' => ['nullable', 'string', 'max:255'],
            'adviser' => ['nullable', 'string', 'max:255'],
            'statement_of_the_problem' => ['nullable', 'string'],
            'objectives' => ['nullable', 'string'],
        ]);

        $capstone->update([
            'title' => trim($data['title']),
            'category_id' => $data['category_id'],
            'academic_year' => isset($data['academic_year']) ? trim($data['academic_year']) : null,
            'authors' => isset($data['authors']) ? trim($data['authors']) : null,
            'adviser' => isset($data['adviser']) ? trim($data['adviser']) : null,
            'abstract' => isset($data['abstract']) ? trim($data['abstract']) : null,
            'statement_of_the_problem' => $data['statement_of_the_problem'] ?? null,
            'objectives' => $data['objectives'] ?? null,
        ]);

        return response()->json([
            'message' => 'Capstone updated.',
            'data' => $capstone->fresh(),
        ]);
    }

    // store and embed capstones
  


    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => [
                'required',
                'string',
                'max:255',
                Rule::unique('capstones', 'title'),
            ],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'abstract'    => ['required', 'string'],

            // optional fields
            'academic_year'            => ['nullable', 'string', 'max:9'],
            'authors'                  => ['nullable', 'string'],
            'adviser'                  => ['nullable', 'string', 'max:255'],
            'statement_of_the_problem' => ['nullable', 'string'],
            'objectives'               => ['nullable', 'string'],
        ]);

        // external config
        $ollamaBase   = rtrim((string) config('services.ollama.base_url'), '/');
        $embedModel   = (string) config('services.ollama.embed_model');

        $qUrl         = rtrim((string) config('services.qdrant.url'), '/');
        $collection   = (string) config('services.qdrant.collection');
        $expectedDims = (int) config('services.qdrant.vector_size', 768);

        $qApiKey      = (string) config('services.qdrant.api_key');
        $qHeaders     = [];
        if (!empty($qApiKey)) {
            $qHeaders['api-key'] = $qApiKey; // Qdrant Cloud
        }

        // allow cold starts / latency
        set_time_limit(120);

        $capstoneId = null;
        $qdrantUpserted = false;

        try {
            $capstone = DB::transaction(function () use ($request, $data, &$capstoneId) {
                $capstone = Capstone::create([
                    'title'       => trim($data['title']),
                    'category_id' => (int) $data['category_id'],
                    'abstract'    => trim($data['abstract']),

                    'academic_year'            => isset($data['academic_year']) && $data['academic_year'] !== null ? trim($data['academic_year']) : null,
                    'authors'                  => isset($data['authors']) && $data['authors'] !== null ? trim($data['authors']) : null,
                    'adviser'                  => isset($data['adviser']) && $data['adviser'] !== null ? trim($data['adviser']) : null,
                    'statement_of_the_problem' => $data['statement_of_the_problem'] ?? null,
                    'objectives'               => $data['objectives'] ?? null,

                    'created_by' => $request->user()->id,

                    // embed tracking
                    'embedding_status' => 'pending',
                    'embedding_error'  => null,
                    'embedded_at'      => null,
                ]);

                $capstoneId = (int) $capstone->id;

                return $capstone;
            });

            // Load category AFTER DB commit so we can build embed text safely
            $capstone->load('category');

            $categoryName = $capstone->category?->name ?? 'Uncategorized';

            // 1) Build embedding text (Title + Category + Abstract)
            $embedText = trim(implode("\n", [
                "Title: {$capstone->title}",
                "Category: {$categoryName}",
                "Abstract: {$capstone->abstract}",
            ]));

            // 2) Ollama embedding
            $embRes = Http::connectTimeout(5)
                ->timeout(90)
                ->post("{$ollamaBase}/api/embeddings", [
                    'model'  => $embedModel,
                    'prompt' => $embedText,
                ]);

            if (!$embRes->successful()) {
                throw new \RuntimeException("Ollama embed failed: {$embRes->status()} {$embRes->body()}");
            }

            $vector = $embRes->json('embedding');

            if (!is_array($vector)) {
                throw new \RuntimeException("Ollama returned invalid embedding payload.");
            }

            if (count($vector) !== $expectedDims) {
                $got = count($vector);
                throw new \RuntimeException("Embedding dimension mismatch. Expected {$expectedDims}, got {$got}");
            }

            $vector = array_map('floatval', $vector);

            // 3) Qdrant upsert (id = capstone id)
            $payload = [
                'capstone_id'  => $capstone->id,
                'title'        => $capstone->title,
                'category_id'  => $capstone->category_id,
                'category'     => $categoryName,      // helpful for UI filters
                'abstract'     => $capstone->abstract, // preview/snippet
                'updated_at'   => optional($capstone->updated_at)->toIso8601String(),
            ];

            $upsertRes = Http::withHeaders($qHeaders)
                ->timeout(20)
                ->put("{$qUrl}/collections/{$collection}/points?wait=true", [
                    'points' => [[
                        'id'      => (int) $capstone->id,
                        'vector'  => $vector,
                        'payload' => $payload,
                    ]],
                ]);

            if (!$upsertRes->successful()) {
                throw new \RuntimeException("Qdrant upsert failed: {$upsertRes->status()} {$upsertRes->body()}");
            }

            $qdrantUpserted = true;

            // 4) mark synced
            $capstone->forceFill([
                'embedding_status' => 'synced',
                'embedded_at'      => now(),
                'embedding_error'  => null,
            ])->save();

            Log::info('Capstone created & indexed successfully.', [
                'capstone_id' => $capstone->id,
                'user_id'     => $request->user()->id,
            ]);

            return response()->json([
                'message' => 'Capstone created.',
                'data'    => $capstone->fresh(['category:id,name', 'creator:id,name']),
            ], 201);

        } catch (QueryException $e) {
            // MySQL duplicate key (title unique)
            $mysqlCode = $e->errorInfo[1] ?? null;
            if ($mysqlCode === 1062) {
                return response()->json([
                    'message' => 'Title already exists.',
                    'errors'  => ['title' => ['This title is already registered.']],
                ], 422);
            }

            Log::error('Capstone store QueryException.', [
                'capstone_id' => $capstoneId,
                'user_id'     => optional($request->user())->id,
                'error'       => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Server error while saving capstone.',
            ], 500);

        } catch (\Throwable $e) {
            // compensate if Qdrant already has point but something else failed afterwards
            if ($qdrantUpserted && $capstoneId) {
                try {
                    Http::withHeaders($qHeaders)
                        ->timeout(15)
                        ->post("{$qUrl}/collections/{$collection}/points/delete?wait=true", [
                            'points' => [(int) $capstoneId],
                        ]);
                } catch (\Throwable $deleteError) {
                    Log::warning('Failed to compensate Qdrant delete.', [
                        'capstone_id'   => $capstoneId,
                        'delete_error'  => $deleteError->getMessage(),
                    ]);
                }
            }

            Log::error('Capstone store failed.', [
                'capstone_id' => $capstoneId,
                'user_id'     => optional($request->user())->id,
                'error'       => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Unable to create capstone right now. Please try again.',
            ], 503);
        }
    }  

}
