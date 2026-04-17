<?php

use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

test('login request is always authorized', function () {
    $request = new LoginRequest();

    expect($request->authorize())->toBeTrue();
});

test('login request has correct validation rules', function () {
    $request = new LoginRequest();
    $rules = $request->rules();

    expect($rules)->toHaveKey('email');
    expect($rules['email'])->toBe(['required', 'string', 'email']);

    expect($rules)->toHaveKey('password');
    expect($rules['password'])->toBe(['required', 'string']);
});

test('login request has exactly two validation rules', function () {
    $request = new LoginRequest();
    $rules = $request->rules();

    expect($rules)->toHaveCount(2);
});

test('throttle key is based on email and ip', function () {
    $request = LoginRequest::create('/login', 'POST', [
        'email' => 'Test@Example.COM',
    ]);
    $request->server->set('REMOTE_ADDR', '192.168.1.1');

    $throttleKey = $request->throttleKey();

    expect($throttleKey)->toContain('test@example.com');
    expect($throttleKey)->toContain('192.168.1.1');
    expect($throttleKey)->toContain('|');
});

test('throttle key normalizes email to lowercase', function () {
    $request = LoginRequest::create('/login', 'POST', [
        'email' => 'USER@DOMAIN.COM',
    ]);
    $request->server->set('REMOTE_ADDR', '127.0.0.1');

    $throttleKey = $request->throttleKey();

    expect($throttleKey)->toBe('user@domain.com|127.0.0.1');
});

test('authenticate throws validation exception on failed attempt', function () {
    $request = LoginRequest::create('/login', 'POST', [
        'email' => 'user@example.com',
        'password' => 'wrong-password',
    ]);
    $request->server->set('REMOTE_ADDR', '127.0.0.1');
    $request->setContainer(app());

    Auth::shouldReceive('attempt')->once()->andReturn(false);
    RateLimiter::shouldReceive('tooManyAttempts')->once()->andReturn(false);
    RateLimiter::shouldReceive('hit')->once();

    $request->authenticate();
})->throws(ValidationException::class);

test('authenticate clears rate limiter on success', function () {
    $request = LoginRequest::create('/login', 'POST', [
        'email' => 'user@example.com',
        'password' => 'correct-password',
    ]);
    $request->server->set('REMOTE_ADDR', '127.0.0.1');
    $request->setContainer(app());

    Auth::shouldReceive('attempt')->once()->andReturn(true);
    RateLimiter::shouldReceive('tooManyAttempts')->once()->andReturn(false);
    RateLimiter::shouldReceive('clear')->once();

    $request->authenticate();

    expect(true)->toBeTrue();
});

test('ensureIsNotRateLimited throws when too many attempts', function () {
    $request = LoginRequest::create('/login', 'POST', [
        'email' => 'user@example.com',
    ]);
    $request->server->set('REMOTE_ADDR', '127.0.0.1');
    $request->setContainer(app());

    RateLimiter::shouldReceive('tooManyAttempts')->once()->andReturn(true);
    RateLimiter::shouldReceive('availableIn')->once()->andReturn(60);

    $request->ensureIsNotRateLimited();
})->throws(ValidationException::class);

test('ensureIsNotRateLimited passes when under limit', function () {
    $request = LoginRequest::create('/login', 'POST', [
        'email' => 'user@example.com',
    ]);
    $request->server->set('REMOTE_ADDR', '127.0.0.1');
    $request->setContainer(app());

    RateLimiter::shouldReceive('tooManyAttempts')->once()->andReturn(false);

    $request->ensureIsNotRateLimited();

    expect(true)->toBeTrue();
});
