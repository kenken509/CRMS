<?php

namespace App\Support;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class Audit
{
    public static function log(
        string $action,
        ?Model $entity = null,
        ?array $old = null,
        ?array $new = null,
        ?string $description = null,
        ?int $userId = null,
        ?Request $request = null
    ): AuditLog {
        $request ??= request();

        return AuditLog::create([
            'user_id'     => $userId ?? auth()->id(),
            'action'      => $action,
            'entity_type' => $entity ? get_class($entity) : null,
            'entity_id'   => $entity?->getKey(),
            'description' => $description,
            'old_values'  => $old,
            'new_values'  => $new,
            'ip'          => $request?->ip(),
            'user_agent'  => substr((string) $request?->userAgent(), 0, 2000),
            'url'         => $request?->fullUrl(),
            'method'      => $request?->method(),
        ]);
    }
}