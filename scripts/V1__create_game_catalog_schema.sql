-- ============================================================
-- V1: Game Catalog Schema
-- Stores game data crawled from the Steam Store API
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- Core game table
-- ──────────────────────────────────────────────────────────────
CREATE TABLE games (
    id                    BIGSERIAL    PRIMARY KEY,
    steam_app_id          INTEGER      UNIQUE NOT NULL,
    name                  VARCHAR(500) NOT NULL,
    slug                  VARCHAR(500) UNIQUE NOT NULL,
    detailed_description  TEXT,
    about_the_game        TEXT,
    supported_languages   TEXT,
    header_image          TEXT,
    required_age          SMALLINT     DEFAULT 0,
    release_date          DATE,
    release_date_raw      VARCHAR(100),
    metacritic_score      SMALLINT,
    recommendations_total INTEGER      DEFAULT 0,

    -- Platforms (denormalized for fast filtering)
    platform_windows      BOOLEAN      DEFAULT FALSE,
    platform_mac          BOOLEAN      DEFAULT FALSE,
    platform_linux        BOOLEAN      DEFAULT FALSE,

    -- Price (stored in cents to avoid floating-point issues)
    currency              VARCHAR(10),
    price_initial         INTEGER,

    -- System requirements (HTML content from Steam, rarely filtered)
    pc_requirements       JSONB,
    mac_requirements      JSONB,
    linux_requirements    JSONB,

    -- Crawl metadata
    updated_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    reduction_percentage  INTEGER
);

-- ──────────────────────────────────────────────────────────────
-- Companies (developers & publishers)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE companies (
    id   SERIAL       PRIMARY KEY,
    name VARCHAR(300) UNIQUE NOT NULL
);

CREATE TABLE game_companies (
    game_id    BIGINT      REFERENCES games(id)     ON DELETE CASCADE,
    company_id INTEGER     REFERENCES companies(id)  ON DELETE CASCADE,
    role       VARCHAR(20) NOT NULL CHECK (role IN ('developer', 'publisher')),
    PRIMARY KEY (game_id, company_id, role)
);

-- ──────────────────────────────────────────────────────────────
-- Genres
-- ──────────────────────────────────────────────────────────────
CREATE TABLE genres (
    id          INTEGER      PRIMARY KEY,
    description VARCHAR(200) NOT NULL
);

CREATE TABLE game_genres (
    game_id  BIGINT  REFERENCES games(id)  ON DELETE CASCADE,
    genre_id INTEGER REFERENCES genres(id)  ON DELETE CASCADE,
    PRIMARY KEY (game_id, genre_id)
);

-- ──────────────────────────────────────────────────────────────
-- Categories (Single-player, Co-op, Steam Achievements, etc.)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE categories (
    id          INTEGER      PRIMARY KEY,
    description VARCHAR(200) NOT NULL
);

CREATE TABLE game_categories (
    game_id     BIGINT  REFERENCES games(id)      ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id)  ON DELETE CASCADE,
    PRIMARY KEY (game_id, category_id)
);

-- ──────────────────────────────────────────────────────────────
-- Screenshots
-- ──────────────────────────────────────────────────────────────
CREATE TABLE screenshots (
    id             BIGSERIAL PRIMARY KEY,
    game_id        BIGINT    REFERENCES games(id) ON DELETE CASCADE,
    steam_id       INTEGER,
    path_thumbnail TEXT      NOT NULL,
    path_full      TEXT      NOT NULL,
    position       SMALLINT  DEFAULT 0
);

-- ──────────────────────────────────────────────────────────────
-- Movies / Trailers
-- ──────────────────────────────────────────────────────────────
CREATE TABLE movies (
    id        BIGSERIAL    PRIMARY KEY,
    game_id   BIGINT       REFERENCES games(id) ON DELETE CASCADE,
    steam_id  INTEGER,
    name      VARCHAR(500),
    thumbnail TEXT,
    dash_av1  TEXT,
    dash_h264 TEXT,
    hls_h264  TEXT,
    highlight BOOLEAN      DEFAULT FALSE,
    position  SMALLINT     DEFAULT 0
);

-- ══════════════════════════════════════════════════════════════
-- Indexes for frontend query patterns
-- ══════════════════════════════════════════════════════════════

-- Catalog sorting
CREATE INDEX idx_games_release_date    ON games (release_date DESC NULLS LAST);
CREATE INDEX idx_games_metacritic      ON games (metacritic_score DESC NULLS LAST);
CREATE INDEX idx_games_recommendations ON games (recommendations_total DESC);

-- Platform filtering
CREATE INDEX idx_games_platforms ON games (platform_windows, platform_mac, platform_linux);

-- Genre filtering (most common catalog filter)
CREATE INDEX idx_game_genres_genre ON game_genres (genre_id);

-- Screenshot / movie ordering
CREATE INDEX idx_screenshots_game ON screenshots (game_id, position);
CREATE INDEX idx_movies_game      ON movies (game_id, position);

-- ══════════════════════════════════════════════════════════════
-- Auto-update updated_at on row change
-- ══════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_games_updated_at
    BEFORE UPDATE ON games
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ──────────────────────────────────────────────────────────────
-- Steam Keys
-- ──────────────────────────────────────────────────────────────
CREATE TABLE steamkeys (
    id       SERIAL       PRIMARY KEY,
    key      VARCHAR(17)  NOT NULL,
    games_id BIGINT       REFERENCES games(id) ON DELETE CASCADE
);

-- ──────────────────────────────────────────────────────────────
-- Orders
-- ──────────────────────────────────────────────────────────────
CREATE TABLE orders (
    id       SERIAL       PRIMARY KEY,
    user_id  INTEGER      NOT NULL,
    games_id BIGINT       REFERENCES games(id) ON DELETE CASCADE,
    key      VARCHAR(17)  NOT NULL
);

-- ──────────────────────────────────────────────────────────────
-- Balance
-- ──────────────────────────────────────────────────────────────
CREATE TABLE balance (
    id       SERIAL       PRIMARY KEY,
    user_id  INTEGER      UNIQUE NOT NULL,
    balance  INTEGER      NOT NULL DEFAULT 0
);
