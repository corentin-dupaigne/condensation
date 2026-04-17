<?php

use App\Http\Controllers\Auth\RegisteredUserController;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('registration view returns view with auth.register name', function () {
    $controller = new RegisteredUserController();

    $view = $controller->create();

    expect($view->name())->toBe('auth.register');
});

test('registration rejects missing name', function () {
    $response = $this->post('/register', [
        'email' => 'test@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertSessionHasErrors(['name']);
});

test('registration rejects missing email', function () {
    $response = $this->post('/register', [
        'name' => 'Test User',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertSessionHasErrors(['email']);
});

test('registration rejects invalid email format', function () {
    $response = $this->post('/register', [
        'name' => 'Test User',
        'email' => 'not-an-email',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertSessionHasErrors(['email']);
});

test('registration rejects uppercase email', function () {
    $response = $this->post('/register', [
        'name' => 'Test User',
        'email' => 'USER@EXAMPLE.COM',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertSessionHasErrors(['email']);
});

test('registration rejects password mismatch', function () {
    $response = $this->post('/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password123',
        'password_confirmation' => 'different',
    ]);

    $response->assertSessionHasErrors(['password']);
});

test('registration rejects email longer than 255 characters', function () {
    $longEmail = str_repeat('a', 250) . '@x.com';

    $response = $this->post('/register', [
        'name' => 'Test User',
        'email' => $longEmail,
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertSessionHasErrors(['email']);
});

test('registration rejects name longer than 255 characters', function () {
    $response = $this->post('/register', [
        'name' => str_repeat('a', 256),
        'email' => 'test@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertSessionHasErrors(['name']);
});
