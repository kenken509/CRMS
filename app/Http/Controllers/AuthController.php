<?php

namespace App\Http\Controllers;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class AuthController extends Controller
{
     public function showLogin(){
        return inertia('Auth/Login');
    }

    public function store(Request $request)
    {
        
        // 1️⃣ Validate input
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        // 2️⃣ Attempt login
        if (! Auth::attempt($credentials, $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'email' => 'Invalid credentials.',
            ]);
        }

        // 3️⃣ Regenerate session (security)
        $request->session()->regenerate();

        // 4️⃣ Check if account is active
        if (! auth()->user()->is_active) {
            Auth::logout();
            throw ValidationException::withMessages([
                'general' => 'Your account is inactive. Please contact administrator.',
            ]);
        }

        // 5️⃣ Optional: Save last login
        auth()->user()->update([
            'last_login_at' => now(),
        ]);

        // 6️⃣ Redirect based on role
        return match (auth()->user()->role) {
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
