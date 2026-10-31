<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Builder;

class AuditLogsController extends Controller
{
    /**
     * Display the Audit Logs page.
     */
    public function index()
    {
        return inertia('Admin/AuditLogs/Index', [
            'nav' => [
                'section' => 'admin',
                'page' => 'logs',
            ],
            'header' => [
                'title' => 'Audit Logs',
                'subtitle' => 'Track user actions and system changes',
            ],
        ]);
    }

    /**
     * Return searchable and paginated audit logs.
     */
    public function all(Request $request)
    {
        $validated = $request->validate([
            'q' => ['nullable', 'string', 'max:255'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $search = trim($validated['q'] ?? '');
        $perPage = (int) ($validated['per_page'] ?? 10);

        $logs = AuditLog::query()
            ->with([
                'user:id,name,email',
            ])
            ->when($search !== '', function (Builder $query) use ($search) {
                $query->where(function (Builder $searchQuery) use ($search) {
                    $searchQuery
                        ->where('action', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhere('entity_type', 'like', "%{$search}%")
                        ->orWhere('entity_id', 'like', "%{$search}%")
                        ->orWhere('ip', 'like', "%{$search}%")
                        ->orWhere('url', 'like', "%{$search}%")
                        ->orWhere('method', 'like', "%{$search}%")
                        ->orWhereHas('user', function (Builder $userQuery) use ($search) {
                            $userQuery
                                ->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                        });
                });
            })
            ->latest('created_at')
            ->latest('id')
            ->paginate($perPage)
            ->withQueryString();

        return response()->json($logs);
    }
}
