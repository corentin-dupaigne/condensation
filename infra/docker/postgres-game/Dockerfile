FROM postgres:15-alpine
COPY scripts/V1__create_game_catalog_schema.sql /docker-entrypoint-initdb.d/01_schema.sql
COPY scripts/seed_games.sql                     /docker-entrypoint-initdb.d/02_seed.sql
