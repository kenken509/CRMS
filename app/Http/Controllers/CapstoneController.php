<?php

namespace App\Http\Controllers;

use App\Models\Capstone;
use App\Models\Category;
use Illuminate\Http\Request;
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

    public function store(Request $request)
    {
        // ✅ Always validate unique BEFORE insert (better UX)
        $data = $request->validate([
            'title' => [
                'required',
                'string',
                'max:255',
                Rule::unique('capstones', 'title'), // your DB has unique anyway
            ],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'abstract' => ['required', 'string'],

            'academic_year' => ['nullable', 'string', 'max:9'],
            'authors' => ['nullable', 'string'],
            'adviser' => ['nullable', 'string', 'max:255'],
            'statement_of_the_problem' => ['nullable', 'string'],
            'objectives' => ['nullable', 'string'],
        ]);

        try {
            $capstone = Capstone::create([
                'title' => trim($data['title']),
                'category_id' => $data['category_id'],
                'abstract' => trim($data['abstract']),
                'academic_year' => $data['academic_year'] ? trim($data['academic_year']) : null,
                'authors' => $data['authors'] ? trim($data['authors']) : null,
                'adviser' => $data['adviser'] ? trim($data['adviser']) : null,
                'statement_of_the_problem' => $data['statement_of_the_problem'] ?? null,
                'objectives' => $data['objectives'] ?? null,
                'created_by' => $request->user()->id,
            ]);
        } catch (UniqueConstraintViolationException $e) {
            // ✅ Laravel may throw this directly for duplicate unique keys
            return response()->json([
                'message' => 'Title already exists.',
                'errors' => ['title' => ['This title is already registered.']],
            ], 422);
        } catch (QueryException $e) {
            // ✅ Backup for MySQL duplicate entry
            $mysqlCode = $e->errorInfo[1] ?? null;
            if ($mysqlCode === 1062) {
                return response()->json([
                    'message' => 'Title already exists.',
                    'errors' => ['title' => ['This title is already registered.']],
                ], 422);
            }
            throw $e;
        }

        return response()->json([
            'message' => 'Capstone created.',
            'data' => $capstone,
        ], 201);
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
                'subtitle' => 'View capstone details',
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

}
