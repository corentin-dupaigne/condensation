<?php

test('default auth guard is web', function () {
    expect(config('auth.defaults.guard'))->toBe('web');
});

test('web guard uses session driver', function () {
    expect(config('auth.guards.web.driver'))->toBe('session');
});

test('web guard uses users provider', function () {
    expect(config('auth.guards.web.provider'))->toBe('users');
});

test('users provider uses eloquent and User model', function () {
    expect(config('auth.providers.users.driver'))->toBe('eloquent');
    expect(config('auth.providers.users.model'))->toBe(App\Models\User::class);
});

test('password reset link lifetime is 60 minutes', function () {
    expect(config('auth.passwords.users.expire'))->toBe(60);
});

test('password reset throttle is 60 seconds', function () {
    expect(config('auth.passwords.users.throttle'))->toBe(60);
});

test('api testing database connection is sqlite', function () {
    expect(config('database.default'))->toBe('sqlite');
});

test('bcrypt rounds configured for fast tests', function () {
    expect((int) env('BCRYPT_ROUNDS'))->toBe(4);
});
