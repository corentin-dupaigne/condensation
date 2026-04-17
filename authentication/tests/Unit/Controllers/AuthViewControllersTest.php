<?php

use App\Http\Controllers\Auth\ConfirmablePasswordController;
use App\Http\Controllers\Auth\EmailVerificationPromptController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Models\User;
use Illuminate\Http\Request;

test('confirmable password view is auth.confirm-password', function () {
    $controller = new ConfirmablePasswordController();

    $view = $controller->show();

    expect($view->name())->toBe('auth.confirm-password');
});

test('forgot password view is auth.forgot-password', function () {
    $controller = new PasswordResetLinkController();

    $view = $controller->create();

    expect($view->name())->toBe('auth.forgot-password');
});

test('new password view is auth.reset-password and receives request', function () {
    $controller = new NewPasswordController();
    $request = Request::create('/reset-password/some-token', 'GET');

    $view = $controller->create($request);

    expect($view->name())->toBe('auth.reset-password');
    expect($view->getData())->toHaveKey('request');
    expect($view->getData()['request'])->toBe($request);
});

test('email verification prompt redirects verified users', function () {
    $user = new User();
    $user->id = 1;
    $user->email_verified_at = now();

    $request = Request::create('/email/verify', 'GET');
    $request->setUserResolver(fn () => $user);

    $controller = new EmailVerificationPromptController();

    $response = $controller($request);

    expect($response)->toBeInstanceOf(Illuminate\Http\RedirectResponse::class);
});

test('email verification prompt shows view for unverified user', function () {
    $user = new User();
    $user->id = 1;
    $user->email_verified_at = null;

    $request = Request::create('/email/verify', 'GET');
    $request->setUserResolver(fn () => $user);

    $controller = new EmailVerificationPromptController();

    $response = $controller($request);

    expect($response)->toBeInstanceOf(Illuminate\View\View::class);
    expect($response->name())->toBe('auth.verify-email');
});
