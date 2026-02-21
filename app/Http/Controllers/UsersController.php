<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UsersController extends Controller
{
    public function index(){
        return inertia('Admin/Users/Index', [
        'nav' => [
            'section' => 'admin',
            'page' => 'users',
            ],
            'header' => [
                'title' => 'Users',
                'subtitle' => 'Manage system users and roles',
            ],
            'authUserId' => auth()->id(), // ✅ needed on frontend
        ]);
    }

    public function allUsers(Request $request)
    {
        $q = trim((string) $request->query('q', ''));

        // Accept per_page but keep it within a safe range
        $perPage = (int) $request->query('per_page', 10);
        $perPage = max(1, min($perPage, 50)); // allow 1 for testing; change to 5 later if you want

        $users = User::query()
            ->select([
                'id',
                'name',
                'email',
                'role',
                'is_active',
                'last_login_at',
                'created_at',
            ])
            ->when($q !== '', function ($query) use ($q) {
                $query->where(function ($sub) use ($q) {
                    $sub->where('name', 'like', "%{$q}%")
                        ->orWhere('email', 'like', "%{$q}%")
                        ->orWhere('role', 'like', "%{$q}%");
                });
            })
            ->orderBy('name')
            ->paginate($perPage);

        return response()->json($users);
    }

    public function storeUser(Request $request){
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190', Rule::unique('users', 'email')],
            'role' => ['required', 'string'],
            'is_active' => ['required', 'boolean'],
            'password' => ['required', 'string', 'min:8', 'confirmed'], // needs password_confirmation
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'is_active' => $validated['is_active'],
            'password' => $validated['password'], // your model casts password => 'hashed'
        ]);

        return response()->json([
            'ok' => true,
            'message' => 'User created successfully.',
            'user_id' => $user->id,
        ]);
    }

    public function toggleActive(User $user)
    {
        // ✅ prevent deactivating your own account
        if ((int) $user->id === (int) auth()->id()) {
            return response()->json([
                'ok' => false,
                'message' => 'You cannot deactivate your own account.',
            ], 422);
        }

        $user->update([
            'is_active' => !$user->is_active,
        ]);

        return response()->json([
            'ok' => true,
            'is_active' => (bool) $user->is_active,
        ]);
    }

    public function updateUser(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => [
                'required',
                'email',
                'max:190',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'role' => ['required', 'string'],
            'is_active' => ['required', 'boolean'],
        ]);

        // 🔒 Prevent self-deactivation
        if ((int) $user->id === (int) auth()->id() && $validated['is_active'] === false) {
            return response()->json([
                'message' => 'You cannot deactivate your own account.',
                'errors' => [
                    'is_active' => ['You cannot deactivate your own account.'],
                ],
            ], 422);
        }

        $user->update($validated);
        
        return response()->json([
            'ok' => true,
            'message' => 'User updated successfully.',
        ]);
    }

}
