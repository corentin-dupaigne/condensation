<?php

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Validation\Rules\Unique;

test('profile update request has correct validation rules for name', function () {
    $request = new ProfileUpdateRequest();
    $rules = $request->rules();

    expect($rules)->toHaveKey('name');
    expect($rules['name'])->toBe(['required', 'string', 'max:255']);
});

test('profile update request has correct validation rules for email', function () {
    $request = new ProfileUpdateRequest();
    $rules = $request->rules();

    expect($rules)->toHaveKey('email');
    expect($rules['email'][0])->toBe('required');
    expect($rules['email'][1])->toBe('string');
    expect($rules['email'][2])->toBe('lowercase');
    expect($rules['email'][3])->toBe('email');
    expect($rules['email'][4])->toBe('max:255');
});

test('profile update request email has unique rule', function () {
    $request = new ProfileUpdateRequest();
    $rules = $request->rules();

    $uniqueRule = $rules['email'][5];

    expect($uniqueRule)->toBeInstanceOf(Unique::class);
});

test('profile update request has exactly two fields', function () {
    $request = new ProfileUpdateRequest();
    $rules = $request->rules();

    expect($rules)->toHaveCount(2);
});

test('profile update request email unique rule ignores current user', function () {
    $user = \App\Models\User::factory()->make();
    $user->id = 42;

    $request = ProfileUpdateRequest::create('/profile', 'PUT');
    $request->setUserResolver(fn () => $user);

    $rules = $request->rules();
    $uniqueRule = $rules['email'][5];

    // Cast to string to inspect the compiled rule
    $ruleString = (string) $uniqueRule;

    expect($ruleString)->toContain('"42"');
});
