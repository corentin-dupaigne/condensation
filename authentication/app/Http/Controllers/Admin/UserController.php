<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index()
    {
        return User::all()->map(fn($u) => $this->format($u));
    }

    public function show($id)
    {
        $user = User::findOrFail($id);
        return $this->format($user);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role'     => 'sometimes|string|in:user,admin',
        ]);

        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password']),
            'role'     => $data['role'] ?? 'user',
        ]);

        return response()->json($this->format($user), 201);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $data = $request->validate([
            'name'  => 'sometimes|string|max:255',
            'email' => ['sometimes', 'email', Rule::unique('users', 'email')->ignore($id)],
            'role'  => 'sometimes|string|in:user,admin',
        ]);

        $user->update($data);

        return response()->json($this->format($user));
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->tokens()->delete();
        $user->delete();

        return response()->noContent();
    }

    private function format(User $user): array
    {
        return [
            'id'        => $user->id,
            'name'      => $user->name,
            'email'     => $user->email,
            'role'      => $user->role,
            'createdAt' => $user->created_at?->toIso8601String(),
        ];
    }
}
