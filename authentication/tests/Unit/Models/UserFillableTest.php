<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('mass assigning protected attributes is ignored', function () {
    $user = new User();
    $user->fill([
        'name' => 'John',
        'email' => 'john@example.com',
        'password' => 'secret',
        'email_verified_at' => '2026-01-01 00:00:00',
    ]);

    expect($user->name)->toBe('John');
    expect($user->email)->toBe('john@example.com');
    expect($user->email_verified_at)->toBeNull();
});

test('password is automatically hashed via cast', function () {
    $user = new User();
    $user->password = 'plain-password';

    expect($user->password)->not->toBe('plain-password');
    expect(Hash::check('plain-password', $user->password))->toBeTrue();
});

test('password is not rehashed when already hashed', function () {
    $hashed = Hash::make('plain-password');
    $user = new User();
    $user->password = $hashed;

    expect($user->password)->toBe($hashed);
});

test('email_verified_at is cast to Carbon datetime', function () {
    $user = new User();
    $user->email_verified_at = '2026-01-15 12:00:00';

    expect($user->email_verified_at)->toBeInstanceOf(Illuminate\Support\Carbon::class);
});

test('hidden attributes are excluded from json', function () {
    $user = new User();
    $user->password = 'secret';
    $user->remember_token = 'remember-xyz';
    $user->name = 'Visible Name';

    $array = $user->toArray();

    expect($array)->not->toHaveKey('password');
    expect($array)->not->toHaveKey('remember_token');
    expect($array)->toHaveKey('name');
});

test('user guarded is empty (defaults to fillable)', function () {
    $user = new User();

    expect($user->getGuarded())->toBe(['*']);
});
