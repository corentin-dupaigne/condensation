<?php

use App\Models\Client;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Laravel\Passport\Passport;

test('passport uses custom client model', function () {
    expect(Passport::clientModel())->toBe(Client::class);
});

test('oauth rate limiter is defined', function () {
    $limiter = RateLimiter::limiter('oauth');

    expect($limiter)->not->toBeNull();
});

test('oauth rate limiter allows 20 requests per minute', function () {
    $limiter = RateLimiter::limiter('oauth');
    $request = Request::create('/oauth/token', 'POST');
    $request->server->set('REMOTE_ADDR', '127.0.0.1');

    $limit = $limiter($request);

    expect($limit->maxAttempts)->toBe(20);
});

test('oauth rate limiter is keyed by ip', function () {
    $limiter = RateLimiter::limiter('oauth');

    $request1 = Request::create('/oauth/token', 'POST');
    $request1->server->set('REMOTE_ADDR', '192.168.1.1');

    $request2 = Request::create('/oauth/token', 'POST');
    $request2->server->set('REMOTE_ADDR', '192.168.1.2');

    $limit1 = $limiter($request1);
    $limit2 = $limiter($request2);

    expect($limit1->key)->not->toBe($limit2->key);
});

test('api rate limiter is defined', function () {
    $limiter = RateLimiter::limiter('api');

    expect($limiter)->not->toBeNull();
});

test('api rate limiter allows 60 requests per minute', function () {
    $limiter = RateLimiter::limiter('api');
    $request = Request::create('/api/test', 'GET');
    $request->server->set('REMOTE_ADDR', '127.0.0.1');

    $limit = $limiter($request);

    expect($limit->maxAttempts)->toBe(60);
});

test('api rate limiter uses user id when authenticated', function () {
    $limiter = RateLimiter::limiter('api');

    $user = new App\Models\User();
    $user->id = 42;

    $request = Request::create('/api/test', 'GET');
    $request->setUserResolver(fn () => $user);

    $limit = $limiter($request);

    expect($limit->key)->toBe(42);
});

test('api rate limiter uses ip when unauthenticated', function () {
    $limiter = RateLimiter::limiter('api');

    $request = Request::create('/api/test', 'GET');
    $request->server->set('REMOTE_ADDR', '10.0.0.1');
    $request->setUserResolver(fn () => null);

    $limit = $limiter($request);

    expect($limit->key)->toContain('10.0.0.1');
});
