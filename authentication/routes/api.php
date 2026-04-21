<?php

use App\Http\Controllers\Admin\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Laravel\Passport\RefreshToken;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Protected API routes for the auth microservice.
| Passport's OAuth routes (/oauth/authorize, /oauth/token, etc.)
| are registered automatically by the PassportServiceProvider.
|
*/

Route::middleware('auth:api')->group(function () {
    // Get the authenticated user's profile
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Token validation endpoint for other microservices
    Route::get('/auth/validate', function (Request $request) {
        $token = $request->user()->token();

        return response()->json([
            'valid' => true,
            'user_id' => $request->user()->id,
            'scopes' => $token->scopes,
            'expires_at' => $token->expires_at,
        ]);
    });

    // Revoke the current access token
    Route::post('/auth/token/revoke', function (Request $request) {
        $token = $request->user()->token();
        $token->revoke();

        // Also revoke the associated refresh token(s)
        RefreshToken::where('access_token_id', $token->id)->update(['revoked' => true]);

        return response()->json(['message' => 'Token revoked successfully.']);
    });

    // List active tokens for the authenticated user
    Route::get('/auth/tokens', function (Request $request) {
        return $request->user()
            ->tokens()
            ->where('revoked', false)
            ->where('expires_at', '>', now())
            ->get()
            ->map(function ($token) {
                return [
                    'id' => $token->id,
                    'name' => $token->name,
                    'scopes' => $token->scopes,
                    'created_at' => $token->created_at,
                    'expires_at' => $token->expires_at,
                ];
            });
    });

    // Revoke all tokens for the authenticated user
    Route::post('/auth/tokens/revoke-all', function (Request $request) {
        $request->user()->tokens()->update(['revoked' => true]);

        return response()->json(['message' => 'All tokens revoked successfully.']);
    });

    // Admin-only user management (role checked by the caller)
    Route::prefix('admin')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::get('/users/{id}', [UserController::class, 'show']);
        Route::put('/users/{id}', [UserController::class, 'update']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);
    });
});
