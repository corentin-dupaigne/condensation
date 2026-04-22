<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Idempotent seeder — safe to run on every container startup.
 * Creates (or updates) the admin account using env vars:
 *   ADMIN_EMAIL    (default: admin@admin.com)
 *   ADMIN_PASSWORD (default: admin)
 *   ADMIN_NAME     (default: Admin)
 */
class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $email    = env('ADMIN_EMAIL', 'admin@admin.com');
        $password = env('ADMIN_PASSWORD', 'admin');
        $name     = env('ADMIN_NAME', 'Admin');

        User::updateOrCreate(
            ['email' => $email],
            [
                'name'     => $name,
                'password' => Hash::make($password),
                'role'     => 'admin',
            ]
        );

        $this->command->info("Admin account ready: {$email}");
    }
}
