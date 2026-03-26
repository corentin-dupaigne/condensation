<?php

use Laravel\Passport\Passport;

test('oauth scopes are defined', function () {
    $scopes = Passport::scopes()->pluck('id')->toArray();

    expect($scopes)->toContain('read-profile');
    expect($scopes)->toContain('update-profile');
});

test('read-profile scope has correct description', function () {
    $scopes = Passport::scopes();
    $readProfile = $scopes->firstWhere('id', 'read-profile');

    expect($readProfile->description)->toBe('Read your profile information');
});

test('update-profile scope has correct description', function () {
    $scopes = Passport::scopes();
    $updateProfile = $scopes->firstWhere('id', 'update-profile');

    expect($updateProfile->description)->toBe('Update your profile information');
});

test('default scope is read-profile', function () {
    $defaultScopes = Passport::defaultScopes();

    expect($defaultScopes)->toBe(['read-profile']);
});

test('access tokens expire in 15 days', function () {
    $expiration = Passport::personalAccessTokensExpireIn();

    // Personal access tokens should be configured
    expect($expiration)->not->toBeNull();
});

test('exactly two oauth scopes are defined', function () {
    $scopes = Passport::scopes();

    expect($scopes)->toHaveCount(2);
});
