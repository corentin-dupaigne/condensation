<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\View\View;

/**
 * @group Authentication
 */
class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     *
     * @group Authentication
     * @subgroup Registration
     */
    public function create(): View
    {
        return view('auth.register');
    }

    /**
     * Register a new user.
     *
     * @group Authentication
     * @subgroup Registration
     * 
     * @bodyParam name string required The user's name. Example: John Doe
     * @bodyParam email string required The user's email address. Example: john@example.com
     * @bodyParam password string required The user's password. Must be confirmed. Example: password123
     * @bodyParam password_confirmation string required Password confirmation. Must match password. Example: password123
     * 
     * @response 302
     * 
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user));

        Auth::login($user);

        return redirect()->intended(config('app.frontend_url'));
    }
}
