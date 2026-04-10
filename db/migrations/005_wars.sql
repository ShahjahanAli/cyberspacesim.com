-- 005_wars.sql
-- Wars between teams or individual users

-- ── Wars ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wars (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT UNIQUE NOT NULL,
  title        TEXT NOT NULL,
  description  TEXT,
  -- type: determines participant composition
  type         TEXT NOT NULL CHECK (type IN ('team_vs_team','individual_vs_individual','team_vs_individual')),
  -- mode: game mode rules
  mode         TEXT NOT NULL DEFAULT 'ctf'
                 CHECK (mode IN ('ctf','attack_defense','king_of_the_hill')),
  status       TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','active','completed','cancelled')),
  scenario_id  UUID REFERENCES scenarios (id) ON DELETE SET NULL,
  max_rounds   INT NOT NULL DEFAULT 5,
  time_limit_s INT,          -- total war time limit in seconds, NULL = unlimited
  starts_at    TIMESTAMPTZ,
  ends_at      TIMESTAMPTZ,
  created_by   UUID NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS wars_updated_at ON wars;
CREATE TRIGGER wars_updated_at
  BEFORE UPDATE ON wars
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── War Participants ──────────────────────────────────────────────────────────
-- Each row represents one "side" in a war (a team or individual user)
CREATE TABLE IF NOT EXISTS war_participants (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  war_id         UUID NOT NULL REFERENCES wars (id) ON DELETE CASCADE,
  team_id        UUID REFERENCES teams (id) ON DELETE CASCADE,
  user_id        UUID REFERENCES users (id) ON DELETE CASCADE,
  -- side identifies which team/player in the war
  side           TEXT NOT NULL CHECK (side IN ('red','blue','challenger','defender')),
  status         TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','accepted','declined')),
  score          INT NOT NULL DEFAULT 0,
  joined_at      TIMESTAMPTZ,
  -- Exactly one of team_id or user_id must be set
  CONSTRAINT has_participant CHECK (team_id IS NOT NULL OR user_id IS NOT NULL),
  UNIQUE (war_id, team_id),
  UNIQUE (war_id, user_id)
);

CREATE INDEX IF NOT EXISTS war_participants_war_idx ON war_participants (war_id);

-- ── War Rounds ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS war_rounds (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  war_id                UUID NOT NULL REFERENCES wars (id) ON DELETE CASCADE,
  round_number          INT NOT NULL,
  status                TEXT NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending','active','completed')),
  winner_participant_id UUID REFERENCES war_participants (id) ON DELETE SET NULL,
  objective             TEXT,       -- what must be achieved in this round
  started_at            TIMESTAMPTZ,
  ended_at              TIMESTAMPTZ,
  UNIQUE (war_id, round_number)
);

-- ── War Events ────────────────────────────────────────────────────────────────
-- Actions taken during a war (flag captures, exploits, defenses)
CREATE TABLE IF NOT EXISTS war_events (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  war_id           UUID NOT NULL REFERENCES wars (id) ON DELETE CASCADE,
  round_id         UUID REFERENCES war_rounds (id) ON DELETE SET NULL,
  participant_id   UUID NOT NULL REFERENCES war_participants (id) ON DELETE CASCADE,
  -- event_type: flag_captured | exploit_success | defense_held | system_patched | penalty
  event_type       TEXT NOT NULL,
  points_awarded   INT NOT NULL DEFAULT 0,
  payload          JSONB NOT NULL DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS war_events_war_idx   ON war_events (war_id);
CREATE INDEX IF NOT EXISTS war_events_round_idx ON war_events (round_id);
CREATE INDEX IF NOT EXISTS war_events_time_idx  ON war_events (created_at DESC);
