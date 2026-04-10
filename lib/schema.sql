-- Run this once against your PostgreSQL database to initialise the schema.
-- psql $DATABASE_URL -f lib/schema.sql

-- ── Extensions ────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Users ─────────────────────────────────────────────────────────────────────
-- Mirrors the Clerk user. clerk_id is the source of truth for identity.
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id    TEXT UNIQUE NOT NULL,
  username    TEXT,
  email       TEXT,
  avatar_url  TEXT,
  role        TEXT NOT NULL DEFAULT 'agent',   -- 'agent' | 'admin'
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS users_clerk_id_idx ON users (clerk_id);

-- ── Scenarios ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scenarios (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  title       TEXT NOT NULL,
  difficulty  TEXT NOT NULL,      -- 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
  category    TEXT NOT NULL,
  xp_reward   INT NOT NULL DEFAULT 100,
  is_locked   BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Scenario Completions ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scenario_completions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  scenario_id   UUID NOT NULL REFERENCES scenarios (id) ON DELETE CASCADE,
  score         INT NOT NULL DEFAULT 0,        -- 0–100
  time_taken_s  INT,                           -- seconds to complete
  completed_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, scenario_id)                -- one row per user per scenario (upserted)
);

CREATE INDEX IF NOT EXISTS completions_user_idx     ON scenario_completions (user_id);
CREATE INDEX IF NOT EXISTS completions_scenario_idx ON scenario_completions (scenario_id);

-- ── Leaderboard View ─────────────────────────────────────────────────────────
-- Aggregates total XP and completion stats per user.
CREATE OR REPLACE VIEW leaderboard AS
SELECT
  u.id,
  u.clerk_id,
  COALESCE(u.username, split_part(u.email, '@', 1), 'Agent') AS display_name,
  u.avatar_url,
  COUNT(sc.id)::INT                                            AS scenarios_completed,
  COALESCE(SUM(sc.score), 0)::INT                             AS total_score,
  COALESCE(
    ROUND(AVG(sc.score))::INT,
    0
  )                                                           AS avg_score,
  COALESCE(SUM(
    CASE WHEN s.xp_reward IS NOT NULL THEN s.xp_reward ELSE 100 END
  ), 0)::INT                                                  AS total_xp,
  MAX(sc.completed_at)                                        AS last_active
FROM users u
LEFT JOIN scenario_completions sc ON sc.user_id = u.id
LEFT JOIN scenarios s             ON s.id = sc.scenario_id
GROUP BY u.id, u.clerk_id, u.username, u.email, u.avatar_url
ORDER BY total_xp DESC, avg_score DESC;

-- ── updated_at trigger ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS users_updated_at ON users;
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
