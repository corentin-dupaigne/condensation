<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;

test('login view returns view with auth.login name', function () {
    $controller = new AuthenticatedSessionController();

    $view = $controller->create();

    expect($view->name())->toBe('auth.login');
});

test('login view contains no bound variables', function () {
    $controller = new AuthenticatedSessionController();

    $view = $controller->create();

    expect($view->getData())->not->toHaveKey('user');
});
