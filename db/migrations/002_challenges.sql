-- 002_challenges.sql
-- Challenges within scenarios + per-user progress tracking

-- ── Challenges ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS challenges (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id   UUID NOT NULL REFERENCES scenarios (id) ON DELETE CASCADE,
  slug          TEXT UNIQUE NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT,
  type          TEXT NOT NULL CHECK (type IN ('exploit','defend','investigate','configure','capture_flag')),
  difficulty    TEXT NOT NULL CHECK (difficulty IN ('Easy','Medium','Hard','Insane')),
  points        INT NOT NULL DEFAULT 100,
  flag_hash     TEXT,            -- SHA-256 hex of the CTF flag, NULL for non-CTF challenges
  hints         TEXT[] NOT NULL DEFAULT '{}',
  hint_cost     INT NOT NULL DEFAULT 10,  -- points deducted per hint used
  max_attempts  INT,                      -- NULL = unlimited
  time_limit_s  INT,                      -- NULL = no limit
  order_index   INT NOT NULL DEFAULT 0,
  is_required   BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS challenges_scenario_idx ON challenges (scenario_id);

-- ── User Challenge Progress ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_challenge_progress (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  challenge_id    UUID NOT NULL REFERENCES challenges (id) ON DELETE CASCADE,
  status          TEXT NOT NULL DEFAULT 'not_started'
                    CHECK (status IN ('not_started','in_progress','completed','failed')),
  attempts        INT NOT NULL DEFAULT 0,
  hints_used      INT NOT NULL DEFAULT 0,
  score           INT NOT NULL DEFAULT 0,
  flag_submitted  TEXT,        -- last submitted flag attempt (plain text, for audit)
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, challenge_id)
);

CREATE INDEX IF NOT EXISTS progress_user_idx      ON user_challenge_progress (user_id);
CREATE INDEX IF NOT EXISTS progress_challenge_idx ON user_challenge_progress (challenge_id);

DROP TRIGGER IF EXISTS progress_updated_at ON user_challenge_progress;
CREATE TRIGGER progress_updated_at
  BEFORE UPDATE ON user_challenge_progress
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
