#!/usr/bin/env bash
set -euo pipefail

if ! docker exec condensation-postgres-1 psql -U postgres -d auth_db -tAc \
    "SELECT 1 FROM users WHERE email='test@example.com'" | grep -q 1; then
    docker exec condensation-auth-1 php artisan db:seed --force
fi

docker compose up --build --abort-on-container-exit
