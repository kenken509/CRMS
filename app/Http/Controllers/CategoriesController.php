<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Support\Audit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class CategoriesController extends Controller
{
    public function index()
    {
        return inertia('Admin/Categories/Index', [
            'nav' => [
                'section' => 'admin',
                'page' => 'categories',
            ],
            'header' => [
                'title' => 'Categories',
                'subtitle' => 'Manage capstones categories',
            ],
        ]);
    }

    public function allCategories(Request $request)
    {
        $q = trim((string) $request->query('q', ''));

        $perPage = (int) $request->query('per_page', 10);
        $perPage = max(1, min($perPage, 50));

        $categories = Category::query()
            ->select([
                'id',
                'name',
                'is_active',
                'created_by',
                'created_at',
            ])
            ->with(['creator:id,name'])
            ->when($q !== '', function ($query) use ($q) {
                $query->where('name', 'like', "%{$q}%");
            })
            ->orderBy('name')
            ->paginate($perPage);

        return response()->json($categories);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('categories', 'name'),
            ],
        ]);

        $category = DB::transaction(function () use ($request, $data) {
            $category = Category::create([
                'name' => trim($data['name']),
                'is_active' => true,
                'created_by' => $request->user()->id,
            ]);

            Audit::log(
                action: 'categories.created',
                entity: $category,
                old: null,
                new: [
                    'name' => $category->name,
                    'is_active' => (bool) $category->is_active,
                ],
                description: 'Created category: ' . $category->name,
                userId: $request->user()->id,
                request: $request
            );

            return $category;
        });

        $category->load('creator:id,name');

        return response()->json([
            'message' => 'Category created.',
            'data' => $category,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $data = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('categories', 'name')->ignore($category->id),
            ],
        ]);

        $newName = trim($data['name']);
        $oldName = $category->name;

        if ($oldName !== $newName) {
            DB::transaction(function () use ($request, $category, $oldName, $newName) {
                $category->update([
                    'name' => $newName,
                ]);

                Audit::log(
                    action: 'categories.updated',
                    entity: $category,
                    old: ['name' => $oldName],
                    new: ['name' => $newName],
                    description: 'Updated category: ' . $oldName . ' to ' . $newName,
                    userId: $request->user()->id,
                    request: $request
                );
            });
        }

        $category->load('creator:id,name');

        return response()->json([
            'message' => 'Category updated.',
            'data' => $category->fresh()->load('creator:id,name'),
        ]);
    }

    public function toggleActive(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $oldStatus = (bool) $category->is_active;
        $newStatus = !$oldStatus;

        DB::transaction(function () use ($request, $category, $oldStatus, $newStatus) {
            $category->update([
                'is_active' => $newStatus,
            ]);

            Audit::log(
                action: $newStatus ? 'categories.activated' : 'categories.deactivated',
                entity: $category,
                old: ['is_active' => $oldStatus],
                new: ['is_active' => $newStatus],
                description: ($newStatus ? 'Activated' : 'Deactivated') . ' category: ' . $category->name,
                userId: $request->user()->id,
                request: $request
            );
        });

        return response()->json([
            'message' => $newStatus ? 'Category activated.' : 'Category deactivated.',
            'data' => [
                'id' => $category->id,
                'is_active' => $newStatus,
            ],
        ]);
    }
}
