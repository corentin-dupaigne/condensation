<?php

use App\Models\User;

test('user has correct fillable attributes', function () {
    $user = new User();

    expect($user->getFillable())->toBe([
        'name',
        'email',
        'password',
    ]);
});

test('user has correct hidden attributes', function () {
    $user = new User();

    expect($user->getHidden())->toBe([
        'password',
        'remember_token',
    ]);
});

test('user has correct casts', function () {
    $user = new User();
    $casts = $user->getCasts();

    expect($casts)->toHaveKey('email_verified_at', 'datetime');
    expect($casts)->toHaveKey('password', 'hashed');
});

test('user factory creates valid user', function () {
    $user = User::factory()->make();

    expect($user->name)->toBeString()->not->toBeEmpty();
    expect($user->email)->toBeString()->toContain('@');
    expect($user->password)->toBeString()->not->toBeEmpty();
    expect($user->email_verified_at)->not->toBeNull();
});

test('user factory unverified state sets email_verified_at to null', function () {
    $user = User::factory()->unverified()->make();

    expect($user->email_verified_at)->toBeNull();
});

test('user uses HasApiTokens trait', function () {
    $user = new User();

    expect(method_exists($user, 'tokens'))->toBeTrue();
    expect(method_exists($user, 'createToken'))->toBeTrue();
});

test('user uses HasFactory trait', function () {
    expect(method_exists(User::class, 'factory'))->toBeTrue();
});

test('user uses Notifiable trait', function () {
    $user = new User();

    expect(method_exists($user, 'notify'))->toBeTrue();
    expect(method_exists($user, 'notifications'))->toBeTrue();
});
