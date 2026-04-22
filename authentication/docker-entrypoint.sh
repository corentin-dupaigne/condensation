#!/bin/bash
set -e

echo "Waiting for database connection..."
# Wait for Database to be ready (max 60 seconds)
MAX_RETRIES=60
COUNT=0
if [ "$DB_CONNECTION" = "pgsql" ]; then
    until pg_isready -h "$DB_HOST" -p "${DB_PORT:-5432}" -U "$DB_USERNAME" > /dev/null 2>&1; do
        COUNT=$((COUNT + 1))
        if [ $COUNT -ge $MAX_RETRIES ]; then
            echo "ERROR: Could not connect to postgres after ${MAX_RETRIES}s. Is the postgres container on the same docker network?"
            exit 1
        fi
        echo "Postgres is unavailable - sleeping ($COUNT/${MAX_RETRIES})"
        sleep 1
    done
else
    until mysqladmin ping -h "$DB_HOST" -u "$DB_USERNAME" -p"$DB_PASSWORD" --skip-ssl --silent; do
        COUNT=$((COUNT + 1))
        if [ $COUNT -ge $MAX_RETRIES ]; then
            echo "ERROR: Could not connect to MySQL after ${MAX_RETRIES}s."
            exit 1
        fi
        echo "MySQL is unavailable - sleeping ($COUNT/${MAX_RETRIES})"
        sleep 1
    done
fi

echo "Database is up - running migrations"
php artisan migrate --force

# Generate Passport encryption keys if they don't exist
if [ ! -f storage/oauth-private.key ]; then
    echo "Generating Passport keys..."
    php artisan passport:keys
    chown www-data:www-data storage/oauth-*.key
fi

# Seed the PKCE client if the database was just initialized
php artisan db:seed --class=Database\\Seeders\\OAuthClientSeeder --force

# Ensure the admin account exists (idempotent — safe on every restart)
php artisan db:seed --class=Database\\Seeders\\AdminUserSeeder --force

echo "Clearing and caching config..."
php artisan config:cache
php artisan route:cache

echo "Starting server"
exec "$@"
