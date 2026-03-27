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
    $interval = Passport::tokensExpireIn();
    $totalSeconds = (new DateTime('@0'))->add($interval)->getTimestamp();
    $totalDays = $totalSeconds / 86400;

    expect($totalDays)->toBeGreaterThanOrEqual(14.9)->toBeLessThanOrEqual(15.1);
});

test('refresh tokens expire in 30 days', function () {
    $interval = Passport::refreshTokensExpireIn();
    $totalSeconds = (new DateTime('@0'))->add($interval)->getTimestamp();
    $totalDays = $totalSeconds / 86400;

    expect($totalDays)->toBeGreaterThanOrEqual(29.9)->toBeLessThanOrEqual(30.1);
});

test('personal access tokens expire in 6 months', function () {
    $interval = Passport::personalAccessTokensExpireIn();
    $totalSeconds = (new DateTime('@0'))->add($interval)->getTimestamp();
    $totalDays = $totalSeconds / 86400;

    // 6 months ≈ 180-184 days
    expect($totalDays)->toBeGreaterThanOrEqual(178)->toBeLessThanOrEqual(185);
});

test('exactly two oauth scopes are defined', function () {
    $scopes = Passport::scopes();

    expect($scopes)->toHaveCount(2);
});

test('authorization view response is bound to custom view', function () {
    $response = app(\Laravel\Passport\Contracts\AuthorizationViewResponse::class);

    expect($response)->toBeInstanceOf(\Laravel\Passport\Http\Responses\SimpleViewResponse::class);
});
