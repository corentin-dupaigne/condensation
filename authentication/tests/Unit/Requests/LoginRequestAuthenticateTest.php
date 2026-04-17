<?php

use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

test('ensureIsNotRateLimited dispatches Lockout event when throttled', function () {
    Event::fake();

    $request = LoginRequest::create('/login', 'POST', [
        'email' => 'user@example.com',
    ]);
    $request->server->set('REMOTE_ADDR', '127.0.0.1');
    $request->setContainer(app());

    RateLimiter::shouldReceive('tooManyAttempts')->once()->andReturn(true);
    RateLimiter::shouldReceive('availableIn')->once()->andReturn(60);

    try {
        $request->ensureIsNotRateLimited();
    } catch (ValidationException $e) {
        // expected
    }

    Event::assertDispatched(Lockout::class);
});

test('throttleKey is stable across requests with same email and ip', function () {
    $request1 = LoginRequest::create('/login', 'POST', ['email' => 'same@example.com']);
    $request1->server->set('REMOTE_ADDR', '10.0.0.1');

    $request2 = LoginRequest::create('/login', 'POST', ['email' => 'same@example.com']);
    $request2->server->set('REMOTE_ADDR', '10.0.0.1');

    expect($request1->throttleKey())->toBe($request2->throttleKey());
});

test('throttleKey differs when email differs', function () {
    $request1 = LoginRequest::create('/login', 'POST', ['email' => 'alice@example.com']);
    $request1->server->set('REMOTE_ADDR', '10.0.0.1');

    $request2 = LoginRequest::create('/login', 'POST', ['email' => 'bob@example.com']);
    $request2->server->set('REMOTE_ADDR', '10.0.0.1');

    expect($request1->throttleKey())->not->toBe($request2->throttleKey());
});

test('throttleKey differs when ip differs', function () {
    $request1 = LoginRequest::create('/login', 'POST', ['email' => 'x@example.com']);
    $request1->server->set('REMOTE_ADDR', '10.0.0.1');

    $request2 = LoginRequest::create('/login', 'POST', ['email' => 'x@example.com']);
    $request2->server->set('REMOTE_ADDR', '10.0.0.2');

    expect($request1->throttleKey())->not->toBe($request2->throttleKey());
});
