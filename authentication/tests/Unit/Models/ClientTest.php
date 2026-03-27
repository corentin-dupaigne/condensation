<?php

use App\Models\Client;
use Laravel\Passport\Client as BaseClient;

test('client extends passport client', function () {
    $client = new Client();

    expect($client)->toBeInstanceOf(BaseClient::class);
});

test('first party client skips authorization', function () {
    $client = Mockery::mock(Client::class)->makePartial();
    $client->shouldReceive('firstParty')->andReturn(true);

    $user = Mockery::mock(\App\Models\User::class);

    expect($client->skipsAuthorization($user, []))->toBeTrue();
});

test('third party client does not skip authorization', function () {
    $client = Mockery::mock(Client::class)->makePartial();
    $client->shouldReceive('firstParty')->andReturn(false);

    $user = Mockery::mock(\App\Models\User::class);

    expect($client->skipsAuthorization($user, []))->toBeFalse();
});

test('skips authorization ignores scopes parameter', function () {
    $client = Mockery::mock(Client::class)->makePartial();
    $client->shouldReceive('firstParty')->andReturn(true);

    $user = Mockery::mock(\App\Models\User::class);

    expect($client->skipsAuthorization($user, ['read-profile', 'update-profile']))->toBeTrue();
});
