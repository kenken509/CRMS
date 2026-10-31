<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use App\Support\Audit;
use Illuminate\Support\Facades\DB;


class UsersController extends Controller
{
    public function index(Request $request)
    {
        return inertia('Admin/Users/Index', [
            'nav' => [
                'section' => 'admin',
                'page' => 'users',
            ],
            'header' => [
                'title' => 'Users',
                'subtitle' => 'Manage system users and roles',
            ],
            'authUserId' => $request->user()->id, // ✅ needed on frontend
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

    public function storeUser(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190', Rule::unique('users', 'email')],
            'role' => ['required', 'string'],
            'is_active' => ['required', 'boolean'],
        ]);

        $user = DB::transaction(function () use ($validated, $request) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'role' => $validated['role'],
                'is_active' => $validated['is_active'],
                'password' => 'password',
                'must_change_password' => true,
            ]);

            // Never include the password or password confirmation in audit values.
            Audit::log(
                action: 'users.created',
                entity: $user,
                old: null,
                new: [
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'is_active' => $user->is_active,
                ],
                description: 'Created user: ' . $user->name,
                userId: $request->user()->id,
                request: $request
            );

            return $user;
        });

        return response()->json([
            'ok' => true,
            'message' => 'User created successfully. Default password: password.',
            'user_id' => $user->id,
        ]);
    }

    public function toggleActive(Request $request, User $user)
    {
        // Prevent deactivating your own account
        if ((int) $user->id === (int) $request->user()->id) {
            return response()->json([
                'ok' => false,
                'message' => 'You cannot deactivate your own account.',
            ], 422);
        }

        $oldStatus = (bool) $user->is_active;
        $newStatus = !$oldStatus;

        DB::transaction(function () use ($request, $user, $oldStatus, $newStatus) {

            $user->update([
                'is_active' => $newStatus,
            ]);

            Audit::log(
                action: $newStatus ? 'users.activated' : 'users.deactivated',
                entity: $user,
                old: ['is_active' => $oldStatus],
                new: ['is_active' => $newStatus],
                description: ($newStatus ? 'Activated' : 'Deactivated') . ' user: ' . $user->name,
                userId: $request->user()->id,
                request: $request
            );
        });

        return response()->json([
            'ok' => true,
            'is_active' => (bool) $user->fresh()->is_active,
        ]);
    }

    public function resetPassword(Request $request, User $user)
    {
        // Prevent an administrator from resetting their own account.
        if ((int) $user->id === (int) $request->user()->id) {
            return response()->json([
                'ok' => false,
                'message' => 'You cannot reset your own password.',
            ], 422);
        }

        DB::transaction(function () use ($request, $user) {
            $oldValues = [
                'must_change_password' => (bool) $user->must_change_password,
            ];

            $user->update([
                'password' => 'password',
                'must_change_password' => true,
            ]);

            Audit::log(
                action: 'users.password_reset',
                entity: $user,
                old: $oldValues,
                new: [
                    'must_change_password' => true,
                ],
                description: 'Reset password for user: ' . $user->name,
                userId: $request->user()->id,
                request: $request
            );
        });

        return response()->json([
            'ok' => true,
            'message' => 'Password reset successfully. Temporary password: password.',
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
        if ((int) $user->id === (int) $request->user()->id && !(bool) $validated['is_active']) {
            return response()->json([
                'message' => 'You cannot deactivate your own account.',
                'errors' => [
                    'is_active' => ['You cannot deactivate your own account.'],
                ],
            ], 422);
        }

        // Capture only fields that are actually changing. Do not include passwords.
        $user->fill($validated);
        $changedFields = array_keys($user->getDirty());

        if (empty($changedFields)) {
            return response()->json([
                'ok' => true,
                'message' => 'No changes detected.',
            ]);
        }

        $oldValues = [];
        $newValues = [];

        foreach ($changedFields as $field) {
            $oldValues[$field] = $user->getOriginal($field);
            $newValues[$field] = $user->getAttribute($field);
        }

        DB::transaction(function () use ($user, $oldValues, $newValues, $request) {
            $user->save();

            Audit::log(
                action: 'users.updated',
                entity: $user,
                old: $oldValues,
                new: $newValues,
                description: 'Updated user: ' . $user->name,
                userId: $request->user()->id,
                request: $request
            );
        });

        return response()->json([
            'ok' => true,
            'message' => 'User updated successfully.',
        ]);
    }
}
