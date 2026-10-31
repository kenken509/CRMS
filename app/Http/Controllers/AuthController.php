<?php

namespace App\Http\Controllers;

use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function showLogin()
    {
        // If already authenticated, do not show login again.
        if (Auth::check()) {
            return redirect('/admin/dashboard');
        }

        return inertia('Auth/Login');
    }

    public function store(Request $request)
    {
        // 1. Validate credentials
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        // 2. Clear any previous authenticated session
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // 3. Attempt login using the submitted credentials
        if (!Auth::attempt($credentials, $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'email' => 'Invalid credentials.',
            ]);
        }

        // 4. Regenerate session after successful authentication
        $request->session()->regenerate();

        // 5. Get the newly authenticated user
        $user = $request->user();

        // 6. Check account status
        if (!$user->is_active) {
            Auth::logout();

            $request->session()->invalidate();
            $request->session()->regenerateToken();

            throw ValidationException::withMessages([
                'general' => 'Your account is inactive. Please contact administrator.',
            ]);
        }

        // 7. Update last login
        $user->update([
            'last_login_at' => now(),
        ]);

        // 8. Force password change if required
        if ($user->must_change_password) {
            return redirect()->route('password.change');
        }

        // 9. Redirect based on the authenticated user's role
        return match ($user->role) {
            'admin' => redirect('/admin/dashboard'),
            'faculty' => redirect()->route('faculty.dashboard'),
            default => redirect('/'),
        };
    }

    public function destroy(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/login');
    }
}
