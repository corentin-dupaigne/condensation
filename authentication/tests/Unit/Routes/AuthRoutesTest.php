<?php

use Illuminate\Support\Facades\Route;

test('register named route exists and is GET', function () {
    $route = Route::getRoutes()->getByName('register');

    expect($route)->not->toBeNull();
    expect($route->methods())->toContain('GET');
});

test('login named route exists', function () {
    $route = Route::getRoutes()->getByName('login');

    expect($route)->not->toBeNull();
});

test('logout named route is POST', function () {
    $route = Route::getRoutes()->getByName('logout');

    expect($route)->not->toBeNull();
    expect($route->methods())->toContain('POST');
});

test('password.request route exists', function () {
    $route = Route::getRoutes()->getByName('password.request');

    expect($route)->not->toBeNull();
});

test('password.email route is POST', function () {
    $route = Route::getRoutes()->getByName('password.email');

    expect($route)->not->toBeNull();
    expect($route->methods())->toContain('POST');
});

test('password.reset has token parameter', function () {
    $route = Route::getRoutes()->getByName('password.reset');

    expect($route)->not->toBeNull();
    expect($route->uri())->toContain('{token}');
});

test('verification.notice route exists', function () {
    $route = Route::getRoutes()->getByName('verification.notice');

    expect($route)->not->toBeNull();
});

test('verification.verify uses signed middleware', function () {
    $route = Route::getRoutes()->getByName('verification.verify');

    expect($route)->not->toBeNull();
    expect($route->middleware())->toContain('signed');
});

test('password.update route is PUT', function () {
    $route = Route::getRoutes()->getByName('password.update');

    expect($route)->not->toBeNull();
    expect($route->methods())->toContain('PUT');
});

test('profile.edit route is protected by auth middleware', function () {
    $route = Route::getRoutes()->getByName('profile.edit');

    expect($route)->not->toBeNull();
    expect($route->middleware())->toContain('auth');
});

test('profile.update route is PATCH', function () {
    $route = Route::getRoutes()->getByName('profile.update');

    expect($route)->not->toBeNull();
    expect($route->methods())->toContain('PATCH');
});

test('profile.destroy route is DELETE', function () {
    $route = Route::getRoutes()->getByName('profile.destroy');

    expect($route)->not->toBeNull();
    expect($route->methods())->toContain('DELETE');
});

test('dashboard route requires auth', function () {
    $route = Route::getRoutes()->getByName('dashboard');

    expect($route)->not->toBeNull();
    expect($route->middleware())->toContain('auth');
});
