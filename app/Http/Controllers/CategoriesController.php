<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
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
            ->with(['creator:id,name']) // ✅ only fetch what you need
            ->when($q !== '', function ($query) use ($q) {
                $query->where(function ($sub) use ($q) {
                    $sub->where('name', 'like', "%{$q}%");
                });
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

        $category = Category::create([
            'name' => trim($data['name']),
            'is_active' => true,
            'created_by' => auth()->id(), // ✅ add this
        ]);

        // optional: include creator so frontend instantly has it
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

        $category->name = trim($data['name']);
        $category->save();

        $category->load('creator:id,name');

        return response()->json([
            'message' => 'Category updated.',
            'data' => $category,
        ]);
    }

    public function toggleActive($id)
    {
        $category = Category::findOrFail($id);

        $category->is_active = ! (bool) $category->is_active;
        $category->save();

        return response()->json([
            'message' => $category->is_active ? 'Category activated.' : 'Category deactivated.',
            'data' => [
                'id' => $category->id,
                'is_active' => $category->is_active,
            ],
        ]);
    }
}
