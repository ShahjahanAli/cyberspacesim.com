-- 003_environments.sql
-- Simulated network environment deployment + event tracking

-- ── Environment Templates ─────────────────────────────────────────────────────
-- Pre-defined network topologies that users deploy into live environments
CREATE TABLE IF NOT EXISTS environment_templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  description TEXT,
  scenario_id UUID REFERENCES scenarios (id) ON DELETE SET NULL,
  -- JSONB topology: { nodes: [...], connections: [...] }
  -- Each node: { key, label, type, ip, os, services, vulnerabilities }
  topology    JSONB NOT NULL DEFAULT '{"nodes":[],"connections":[]}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── User Environments (deployed instances) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_environments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  template_id  UUID REFERENCES environment_templates (id) ON DELETE SET NULL,
  name         TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'deploying'
                 CHECK (status IN ('deploying','running','stopped','error')),
  -- Live state of nodes: same shape as template.topology but mutable
  topology     JSONB NOT NULL DEFAULT '{"nodes":[],"connections":[]}',
  score        INT NOT NULL DEFAULT 0,
  deployed_at  TIMESTAMPTZ,
  stopped_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS env_user_idx ON user_environments (user_id);

DROP TRIGGER IF EXISTS env_updated_at ON user_environments;
CREATE TRIGGER env_updated_at
  BEFORE UPDATE ON user_environments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Environment Events ────────────────────────────────────────────────────────
-- Every action a user performs in their environment is logged here
CREATE TABLE IF NOT EXISTS environment_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  environment_id  UUID NOT NULL REFERENCES user_environments (id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  -- Event types: scan | exploit | patch | defend | alert | flag_captured | node_compromised | node_restored
  event_type      TEXT NOT NULL,
  target_node_key TEXT,             -- which node was targeted
  success         BOOLEAN NOT NULL DEFAULT true,
  points_delta    INT NOT NULL DEFAULT 0,
  payload         JSONB NOT NULL DEFAULT '{}',  -- event-specific detail
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS env_events_env_idx  ON environment_events (environment_id);
CREATE INDEX IF NOT EXISTS env_events_user_idx ON environment_events (user_id);
CREATE INDEX IF NOT EXISTS env_events_time_idx ON environment_events (created_at DESC);
