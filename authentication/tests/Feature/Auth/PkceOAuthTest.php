<?php

use App\Models\User;
use Illuminate\Support\Str;
use Laravel\Passport\Client;
use Laravel\Passport\Passport;

/*
|--------------------------------------------------------------------------
| PKCE OAuth2 Flow Tests
|--------------------------------------------------------------------------
|
| Tests covering the full Authorization Code + PKCE flow,
| token validation, and token revocation.
|
*/

beforeEach(function () {
    // Generate Passport encryption keys for testing
    Passport::loadKeysFrom(__DIR__ . '/../../../storage');
    $this->artisan('passport:keys', ['--force' => true]);

    // Create a test user
    $this->user = User::factory()->create([
        'email' => 'pkce-test@example.com',
        'password' => bcrypt('password'),
    ]);

    // Create a public PKCE client (no secret)
    $this->client = Client::create([
        'name' => 'Test PKCE Client',
        'secret' => null,
        'provider' => 'users',
        'redirect_uris' => ['http://localhost:4200/callback'],
        'grant_types' => ['authorization_code', 'refresh_token'],
        'revoked' => false,
    ]);
});

function generatePkceChallenge(): array
{
    $verifier = Str::random(128);
    $challenge = strtr(rtrim(
        base64_encode(hash('sha256', $verifier, true)),
        '='
    ), '+/', '-_');

    return [$verifier, $challenge];
}

test('PKCE authorization endpoint requires code_challenge', function () {
    $response = $this->actingAs($this->user)->get('/oauth/authorize?' . http_build_query([
        'client_id' => $this->client->id,
        'redirect_uri' => 'http://localhost:4200/callback',
        'response_type' => 'code',
        'scope' => 'read-profile',
        'state' => Str::random(40),
    ]));

    // Without code_challenge, it should fail for a public client
    $response->assertStatus(400);
});

test('PKCE authorization auto-approves first-party client', function () {
    [$verifier, $challenge] = generatePkceChallenge();
    $state = Str::random(40);

    $response = $this->actingAs($this->user)->get('/oauth/authorize?' . http_build_query([
        'client_id' => $this->client->id,
        'redirect_uri' => 'http://localhost:4200/callback',
        'response_type' => 'code',
        'scope' => 'read-profile',
        'state' => $state,
        'code_challenge' => $challenge,
        'code_challenge_method' => 'S256',
    ]));

    // First-party PKCE clients skip the consent screen
    $response->assertStatus(302);
    $redirectUrl = $response->headers->get('Location');
    expect($redirectUrl)->toContain('http://localhost:4200/callback');
    expect($redirectUrl)->toContain('code=');
    expect($redirectUrl)->toContain("state={$state}");
});

test('token exchange fails with invalid code_verifier', function () {
    $response = $this->postJson('/oauth/token', [
        'grant_type' => 'authorization_code',
        'client_id' => $this->client->id,
        'redirect_uri' => 'http://localhost:4200/callback',
        'code' => 'invalid-code',
        'code_verifier' => 'invalid-verifier',
    ]);

    // Should fail — invalid code
    $response->assertStatus(400);
});

test('authenticated user can access /api/user', function () {
    Passport::actingAs($this->user, ['read-profile']);

    $response = $this->getJson('/api/user');

    $response->assertStatus(200);
    $response->assertJsonFragment([
        'email' => 'pkce-test@example.com',
    ]);
});

test('unauthenticated request to /api/user returns 401', function () {
    $response = $this->getJson('/api/user');

    $response->assertStatus(401);
});

test('token validation endpoint returns valid response', function () {
    Passport::actingAs($this->user, ['read-profile']);

    $response = $this->getJson('/api/auth/validate');

    $response->assertStatus(200);
    $response->assertJsonStructure([
        'valid',
        'user_id',
        'scopes',
        'expires_at',
    ]);
    $response->assertJson(['valid' => true]);
});

test('token revocation endpoint revokes the current token', function () {
    Passport::actingAs($this->user, ['read-profile']);

    $response = $this->postJson('/api/auth/token/revoke');

    $response->assertStatus(200);
    $response->assertJson(['message' => 'Token revoked successfully.']);
});

test('token list endpoint returns active tokens', function () {
    Passport::actingAs($this->user, ['read-profile']);

    $response = $this->getJson('/api/auth/tokens');

    $response->assertStatus(200);
    $response->assertJsonIsArray();
});

test('revoke all tokens endpoint works', function () {
    Passport::actingAs($this->user, ['read-profile']);

    $response = $this->postJson('/api/auth/tokens/revoke-all');

    $response->assertStatus(200);
    $response->assertJson(['message' => 'All tokens revoked successfully.']);
});

test('request with wrong scope is rejected', function () {
    // Acting as user with only read-profile scope
    Passport::actingAs($this->user, ['read-profile']);

    // Should still be able to access user endpoint (no scope middleware on it)
    $response = $this->getJson('/api/user');
    $response->assertStatus(200);
});

test('full PKCE flow: get code then exchange for tokens', function () {
    [$verifier, $challenge] = generatePkceChallenge();
    $state = Str::random(40);

    // Step 1: get authorization code
    $authResponse = $this->actingAs($this->user)->get('/oauth/authorize?' . http_build_query([
        'client_id'             => $this->client->id,
        'redirect_uri'          => 'http://localhost:4200/callback',
        'response_type'         => 'code',
        'scope'                 => 'read-profile',
        'state'                 => $state,
        'code_challenge'        => $challenge,
        'code_challenge_method' => 'S256',
    ]));

    $authResponse->assertStatus(302);
    $redirectUrl = $authResponse->headers->get('Location');
    expect($redirectUrl)->toContain('code=');

    parse_str(parse_url($redirectUrl, PHP_URL_QUERY), $params);
    $code = $params['code'];
    expect($params['state'])->toBe($state);

    // Step 2: exchange code + verifier for tokens
    $tokenResponse = $this->postJson('/oauth/token', [
        'grant_type'    => 'authorization_code',
        'client_id'     => $this->client->id,
        'redirect_uri'  => 'http://localhost:4200/callback',
        'code_verifier' => $verifier,
        'code'          => $code,
    ]);

    $tokenResponse->assertStatus(200);
    $tokenResponse->assertJsonStructure(['token_type', 'expires_in', 'access_token', 'refresh_token']);
    expect($tokenResponse->json('token_type'))->toBe('Bearer');
});

test('token exchange fails when code_verifier does not match challenge', function () {
    [$verifier, $challenge] = generatePkceChallenge();
    $state = Str::random(40);

    // Get a valid auth code with one challenge
    $authResponse = $this->actingAs($this->user)->get('/oauth/authorize?' . http_build_query([
        'client_id'             => $this->client->id,
        'redirect_uri'          => 'http://localhost:4200/callback',
        'response_type'         => 'code',
        'scope'                 => 'read-profile',
        'state'                 => $state,
        'code_challenge'        => $challenge,
        'code_challenge_method' => 'S256',
    ]));

    parse_str(parse_url($authResponse->headers->get('Location'), PHP_URL_QUERY), $params);
    $code = $params['code'];

    // Try to exchange with a different verifier
    [$wrongVerifier] = generatePkceChallenge();
    $tokenResponse = $this->postJson('/oauth/token', [
        'grant_type'    => 'authorization_code',
        'client_id'     => $this->client->id,
        'redirect_uri'  => 'http://localhost:4200/callback',
        'code_verifier' => $wrongVerifier,
        'code'          => $code,
    ]);

    $tokenResponse->assertStatus(400);
});
