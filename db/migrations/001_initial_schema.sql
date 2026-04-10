-- 001_initial_schema.sql
-- Core tables: users, scenarios, scenario_completions

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Migration tracking ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS schema_migrations (
  id          SERIAL PRIMARY KEY,
  filename    TEXT UNIQUE NOT NULL,
  applied_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── updated_at helper ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ── Users ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id    TEXT UNIQUE NOT NULL,
  username    TEXT,
  email       TEXT,
  avatar_url  TEXT,
  role        TEXT NOT NULL DEFAULT 'agent' CHECK (role IN ('agent', 'admin')),
  total_xp    INT NOT NULL DEFAULT 0,
  streak_days INT NOT NULL DEFAULT 0,
  last_active TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS users_clerk_id_idx ON users (clerk_id);

DROP TRIGGER IF EXISTS users_updated_at ON users;
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Scenarios ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scenarios (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  title       TEXT NOT NULL,
  description TEXT,
  difficulty  TEXT NOT NULL CHECK (difficulty IN ('Beginner','Intermediate','Advanced','Expert')),
  category    TEXT NOT NULL,
  duration    TEXT,
  xp_reward   INT NOT NULL DEFAULT 100,
  is_locked   BOOLEAN NOT NULL DEFAULT false,
  tags        TEXT[] NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Scenario Completions ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scenario_completions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  scenario_id   UUID NOT NULL REFERENCES scenarios (id) ON DELETE CASCADE,
  score         INT NOT NULL DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
  time_taken_s  INT,
  completed_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, scenario_id)
);

CREATE INDEX IF NOT EXISTS completions_user_idx     ON scenario_completions (user_id);
CREATE INDEX IF NOT EXISTS completions_scenario_idx ON scenario_completions (scenario_id);
