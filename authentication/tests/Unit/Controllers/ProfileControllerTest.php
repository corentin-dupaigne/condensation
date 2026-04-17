<?php

use App\Http\Controllers\ProfileController;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;

uses(RefreshDatabase::class);

test('profile edit returns view with user', function () {
    $user = User::factory()->create();
    $request = Request::create('/profile', 'GET');
    $request->setUserResolver(fn () => $user);

    $controller = new ProfileController();
    $view = $controller->edit($request);

    expect($view->name())->toBe('profile.edit');
    expect($view->getData())->toHaveKey('user');
    expect($view->getData()['user']->id)->toBe($user->id);
});

test('profile update saves new name', function () {
    $user = User::factory()->create(['name' => 'Old Name', 'email' => 'old@example.com']);

    $response = $this->actingAs($user)->patch('/profile', [
        'name' => 'New Name',
        'email' => 'old@example.com',
    ]);

    $response->assertSessionHasNoErrors();
    expect($user->fresh()->name)->toBe('New Name');
});

test('profile update resets email_verified_at when email changes', function () {
    $user = User::factory()->create([
        'email' => 'old@example.com',
        'email_verified_at' => now(),
    ]);

    $this->actingAs($user)->patch('/profile', [
        'name' => $user->name,
        'email' => 'new@example.com',
    ]);

    expect($user->fresh()->email_verified_at)->toBeNull();
});

test('profile update keeps email_verified_at when email unchanged', function () {
    $verified = now();
    $user = User::factory()->create([
        'email' => 'stable@example.com',
        'email_verified_at' => $verified,
    ]);

    $this->actingAs($user)->patch('/profile', [
        'name' => 'Renamed',
        'email' => 'stable@example.com',
    ]);

    expect($user->fresh()->email_verified_at)->not->toBeNull();
});

test('profile destroy requires correct password', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->delete('/profile', [
        'password' => 'wrong-password',
    ]);

    $response->assertSessionHasErrors(['password'], null, 'userDeletion');
    expect(User::find($user->id))->not->toBeNull();
});

test('profile destroy deletes the user with correct password', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->delete('/profile', [
        'password' => 'password',
    ]);

    $response->assertRedirect('/');
    expect(User::find($user->id))->toBeNull();
});

test('profile destroy logs out the user', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->delete('/profile', [
        'password' => 'password',
    ]);

    $this->assertGuest();
});
