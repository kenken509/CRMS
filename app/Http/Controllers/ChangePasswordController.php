<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class ChangePasswordController extends Controller
{
    public function show(Request $request)
    {
        if (!$request->user()->must_change_password) {
            return $this->redirectToDashboard($request);
        }

        return inertia('Auth/ChangePassword');
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => [
                'required',
                'confirmed',
                'different:current_password',
                'password' => [
                    'required',
                    'confirmed',
                    'different:current_password',
                    Password::min(8)
                        ->mixedCase()
                        ->numbers()
                        ->symbols(),
                ],
            ],
        ]);

        $request->user()->update([
            'password' => $validated['password'],
            'must_change_password' => false,
        ]);

        return $this->redirectToDashboard($request)
            ->with('success', 'Your password has been changed successfully.');
    }

    private function redirectToDashboard(Request $request)
    {
        return match ($request->user()->role) {
            'admin' => redirect('/admin/dashboard'),
            'faculty' => redirect()->route('faculty.dashboard'),
            default => redirect('/'),
        };
    }
}
