<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('password can be updated with valid data', function () {
    $user = User::factory()->create([
        'password' => Hash::make('old-password'),
    ]);

    $response = $this->actingAs($user)->put('/password', [
        'current_password' => 'old-password',
        'password' => 'new-secure-password',
        'password_confirmation' => 'new-secure-password',
    ]);

    $response->assertSessionHasNoErrors();

    expect(Hash::check('new-secure-password', $user->fresh()->password))->toBeTrue();
});

test('password update requires current password', function () {
    $user = User::factory()->create([
        'password' => Hash::make('old-password'),
    ]);

    $response = $this->actingAs($user)->put('/password', [
        'password' => 'new-secure-password',
        'password_confirmation' => 'new-secure-password',
    ]);

    $response->assertSessionHasErrors(['current_password'], null, 'updatePassword');
});

test('password update fails with wrong current password', function () {
    $user = User::factory()->create([
        'password' => Hash::make('old-password'),
    ]);

    $response = $this->actingAs($user)->put('/password', [
        'current_password' => 'wrong-password',
        'password' => 'new-secure-password',
        'password_confirmation' => 'new-secure-password',
    ]);

    $response->assertSessionHasErrors(['current_password'], null, 'updatePassword');
});

test('password update fails without confirmation', function () {
    $user = User::factory()->create([
        'password' => Hash::make('old-password'),
    ]);

    $response = $this->actingAs($user)->put('/password', [
        'current_password' => 'old-password',
        'password' => 'new-secure-password',
    ]);

    $response->assertSessionHasErrors(['password'], null, 'updatePassword');
});

test('password update fails when confirmation does not match', function () {
    $user = User::factory()->create([
        'password' => Hash::make('old-password'),
    ]);

    $response = $this->actingAs($user)->put('/password', [
        'current_password' => 'old-password',
        'password' => 'new-secure-password',
        'password_confirmation' => 'different-password',
    ]);

    $response->assertSessionHasErrors(['password'], null, 'updatePassword');
});

test('password is not changed when validation fails', function () {
    $user = User::factory()->create([
        'password' => Hash::make('old-password'),
    ]);

    $this->actingAs($user)->put('/password', [
        'current_password' => 'wrong-password',
        'password' => 'new-secure-password',
        'password_confirmation' => 'new-secure-password',
    ]);

    expect(Hash::check('old-password', $user->fresh()->password))->toBeTrue();
});

test('password update requires authentication', function () {
    $response = $this->put('/password', [
        'current_password' => 'old-password',
        'password' => 'new-secure-password',
        'password_confirmation' => 'new-secure-password',
    ]);

    $response->assertRedirect('/login');
});

test('password update redirects back with status', function () {
    $user = User::factory()->create([
        'password' => Hash::make('old-password'),
    ]);

    $response = $this->actingAs($user)
        ->from('/profile')
        ->put('/password', [
            'current_password' => 'old-password',
            'password' => 'new-secure-password',
            'password_confirmation' => 'new-secure-password',
        ]);

    $response->assertRedirect('/profile');
    $response->assertSessionHas('status', 'password-updated');
});
