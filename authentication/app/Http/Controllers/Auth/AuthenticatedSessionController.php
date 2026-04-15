<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

/**
 * @group Authentication
 */
class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     *
     * @group Authentication
     * @subgroup Login
     */
    public function create(): View
    {
        return view('auth.login');
    }

    /**
     * Authenticate a user and create a session.
     *
     * @group Authentication
     * @subgroup Login
     * 
     * @bodyParam email string required The user's email address. Example: john@example.com
     * @bodyParam password string required The user's password. Example: password123
     * @bodyParam remember boolean Whether to remember the user. Example: false
     * 
     * @response 302
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        return redirect()->intended(config('app.frontend_url'));
    }

    /**
     * Logout the authenticated user.
     *
     * @group Authentication
     * @subgroup Login
     * @authenticated
     * 
     * @response 302
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
